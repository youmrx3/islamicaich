"""Thabat HTTP API + static frontend.

Privacy: submitted messages are processed in memory and never stored or
logged. The only thing persisted is an explicit "report a problem" flag, which
contains the quote, the verdict and an optional comment — no user identifiers.
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import llm
from .corpus import get_corpus
from .grades import summarize
from .matching import HadithHit
from .replies import LANGS, build_reply
from .verify import LEVELS, STATUS, load_registry, verify_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("thabat")

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"
FLAGS = ROOT / "data" / "flags" / "flags.jsonl"
VERSION = "0.1.0"

app = FastAPI(title="Thabat — verify before you forward", version=VERSION)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])

# ------------------------------------------------------------ rate limiting
_hits: dict[str, deque] = defaultdict(deque)
_lock = threading.Lock()
RATE = 40  # requests per minute per client


def _rate_limit(request: Request) -> None:
    key = request.headers.get("x-forwarded-for", request.client.host if request.client else "?").split(",")[0]
    now = time.time()
    with _lock:
        q = _hits[key]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE:
            raise HTTPException(429, "Too many requests — please wait a minute.")
        q.append(now)


@app.on_event("startup")
def _warm() -> None:
    get_corpus()
    load_registry()


# ------------------------------------------------------------------ models
class VerifyIn(BaseModel):
    text: str = Field(min_length=2, max_length=6000)
    reply_lang: str = "ar"
    use_llm: bool = True


class FlagIn(BaseModel):
    quote: str = Field(max_length=1000)
    status: str = Field(max_length=40)
    evidence_id: str | None = Field(default=None, max_length=60)
    comment: str = Field(default="", max_length=1000)


# -------------------------------------------------------------------- API
@app.get("/api/health")
def health() -> dict:
    c = get_corpus()
    reg = load_registry()
    return {
        "ok": c.ready,
        "version": VERSION,
        "hadith_records": len(c.hadith),
        "quran_verses": len(c.quran),
        "collections": sorted({r["book_en"] for r in c.hadith}),
        "search_languages": ["ara", *sorted(c.idx_hadith_tr)],
        "registry_entries": len(reg["entries"]),
        "registry_version": reg["version"],
        "llm_available": llm.available(),
        "llm_model": llm.MODEL if llm.available() else None,
        "built_at": c.manifest.get("built_at"),
    }


@app.get("/api/meta")
def meta() -> dict:
    return {
        "statuses": {k: {"level": v[0], "label_ar": v[1], "label_en": v[2], "refer": v[3]} for k, v in STATUS.items()},
        "levels": {k: {"ar": v[0], "en": v[1]} for k, v in LEVELS.items()},
        "reply_languages": list(LANGS),
    }


@app.post("/api/verify")
def verify(body: VerifyIn, request: Request) -> dict:
    _rate_limit(request)
    t0 = time.time()
    result = verify_text(body.text, use_llm=body.use_llm)
    result["reply"] = build_reply(result, body.reply_lang)
    result["reply_lang"] = body.reply_lang if body.reply_lang in LANGS else "en"
    result["elapsed_ms"] = int((time.time() - t0) * 1000)
    return result


@app.post("/api/reply")
def reply(body: dict) -> dict:
    """Re-render the reply for an existing result in another language (no re-verification)."""
    lang = body.get("lang", "ar")
    return {"reply": build_reply(body.get("result", {}), lang), "lang": lang}


@app.get("/api/hadith/{hid}")
def hadith(hid: str) -> dict:
    c = get_corpus()
    r = c.by_id.get(hid)
    if not r:
        raise HTTPException(404, "not found")
    return HadithHit(r["id"], 1.0, r, summarize(r["grades"], r.get("implicit")).to_dict()).to_dict() | {
        "translations": r.get("tr", {})
    }


@app.get("/api/registry")
def registry() -> dict:
    reg = load_registry()
    return {
        "version": reg["version"],
        "review_policy": reg["review_policy"],
        "entries": [{k: v for k, v in e.items() if not k.startswith("_")} for e in reg["entries"]],
    }


@app.post("/api/flag")
def flag(body: FlagIn, request: Request) -> dict:
    _rate_limit(request)
    FLAGS.parent.mkdir(parents=True, exist_ok=True)
    rec = body.model_dump() | {"at": dt.datetime.now(dt.timezone.utc).isoformat(), "state": "open"}
    with _lock, FLAGS.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return {"ok": True}


@app.get("/api/flags")
def flags() -> dict:
    if not FLAGS.exists():
        return {"flags": []}
    rows = [json.loads(l) for l in FLAGS.read_text(encoding="utf-8").splitlines() if l.strip()]
    return {"flags": rows[-200:][::-1]}


@app.exception_handler(Exception)
async def _unhandled(request: Request, exc: Exception):
    log.exception("unhandled error on %s", request.url.path)
    return JSONResponse({"detail": "Internal error — the verification could not be completed. Please try again."}, 500)


# --------------------------------------------------------------- frontend
if FRONTEND.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND), name="static")

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(FRONTEND / "index.html")

    @app.get("/review")
    def review_page() -> FileResponse:
        return FileResponse(FRONTEND / "review.html")
