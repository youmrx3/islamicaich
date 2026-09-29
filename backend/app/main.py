"""Thabat HTTP API (+ static site when running locally).

On Vercel the site in public/ is served by the CDN and every other request
reaches this FastAPI app. Locally (uvicorn), the app also serves public/.

Privacy: submitted messages are processed in memory and never stored or
logged. The only thing persisted is an explicit "report a problem" flag.
"""
from __future__ import annotations

import datetime as dt
import hmac
import logging
import os
import threading
import time
from collections import defaultdict, deque
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from . import flags as flag_store
from . import llm
from .corpus import get_corpus
from .grades import summarize
from .matching import HadithHit
from .replies import LANGS, build_reply
from .search import search_evidence
from .verify import LEVELS, STATUS, load_registry, verify_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("thabat")

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
VERSION = "1.0.0"
ON_VERCEL = bool(os.environ.get("VERCEL"))

app = FastAPI(title="Thabat — verify before you forward", version=VERSION,
              docs_url="/api/docs", openapi_url="/api/openapi.json", redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])

# ------------------------------------------------------------ rate limiting
_hits: dict[str, deque] = defaultdict(deque)
_lock = threading.Lock()
RATE = int(os.environ.get("THABAT_RATE_PER_MIN", "40"))


def _client_key(request: Request) -> str:
    return request.headers.get("x-forwarded-for", request.client.host if request.client else "?").split(",")[0].strip()


def _rate_limit(request: Request) -> None:
    key, now = _client_key(request), time.time()
    with _lock:
        q = _hits[key]
        while q and now - q[0] > 60:
            q.popleft()
        if len(q) >= RATE:
            raise HTTPException(429, "Too many requests — please wait a minute.")
        q.append(now)


def _require_reviewer(request: Request) -> None:
    """The review queue can contain what users typed, so it is token-protected in production."""
    expected = os.environ.get("REVIEW_TOKEN")
    if not expected:
        if ON_VERCEL:
            raise HTTPException(403, "Review queue is disabled: set REVIEW_TOKEN to enable it.")
        return  # local development
    got = request.headers.get("x-review-token") or request.query_params.get("token") or ""
    if not hmac.compare_digest(got, expected):
        raise HTTPException(401, "Reviewer token required.")


# ------------------------------------------------------------------ models
class VerifyIn(BaseModel):
    text: str = Field(min_length=2, max_length=6000)
    reply_lang: str = "ar"
    use_llm: bool = True


class ReplyIn(BaseModel):
    lang: str = "ar"
    result: dict


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
        "collections": sorted({rid.split(":")[0] for rid in c.hadith.ids}),
        "search_languages": ["ara", *sorted(c.idx_hadith_tr)],
        "registry_entries": len(reg["entries"]),
        "registry_version": reg["version"],
        "llm_available": llm.available(),
        "llm_model": llm.MODEL if llm.available() else None,
        "flags_backend": flag_store.backend_name(),
        "built_at": c.manifest.get("built_at"),
    }


@app.get("/api/meta")
def meta() -> dict:
    return {
        "statuses": {k: {"severity": v[0], "label_ar": v[1], "label_en": v[2], "refer": v[3], "level": v[4]}
                     for k, v in STATUS.items()},
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
def reply(body: ReplyIn) -> dict:
    """Re-render the reply for an existing result in another language (no re-verification)."""
    return {"reply": build_reply(body.result, body.lang), "lang": body.lang}


@app.get("/api/search")
def search(request: Request, q: str = Query(min_length=2, max_length=300), all_grades: bool = False) -> dict:
    _rate_limit(request)
    t0 = time.time()
    r = search_evidence(get_corpus(), q, only_authentic=not all_grades)
    r["elapsed_ms"] = int((time.time() - t0) * 1000)
    return r


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
    rec = body.model_dump() | {"at": dt.datetime.now(dt.timezone.utc).isoformat(), "state": "open"}
    try:
        flag_store.add(rec)
    except Exception:
        log.exception("could not store flag")
        raise HTTPException(503, "The report could not be saved right now. Please try again later.")
    return {"ok": True}


@app.get("/api/flags")
def flags(request: Request) -> dict:
    _require_reviewer(request)
    return {"flags": flag_store.recent(), "backend": flag_store.backend_name()}


@app.exception_handler(Exception)
async def _unhandled(request: Request, exc: Exception):
    log.exception("unhandled error on %s", request.url.path)
    return JSONResponse({"detail": "Internal error — the check could not be completed. Please try again."}, 500)


# --------------------------------------------------------------- pages
# On Vercel these files are served by the CDN (public/ + cleanUrls); the routes
# below are a fallback and what serves them in local development.
_PAGES = {"/": "index.html", "/app": "app.html", "/review": "review.html", "/privacy": "privacy.html"}


def _page(name: str):
    def handler() -> FileResponse:
        return FileResponse(PUBLIC / name)
    return handler


for _route, _file in _PAGES.items():
    app.add_api_route(_route, _page(_file), methods=["GET"], include_in_schema=False)

if not ON_VERCEL and PUBLIC.exists():
    from fastapi.staticfiles import StaticFiles

    app.mount("/", StaticFiles(directory=PUBLIC, html=True), name="public")
