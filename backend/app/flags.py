"""Storage for "report a problem" flags.

Serverless filesystems are ephemeral, so in production flags go to Redis via
the Upstash REST API (Vercel's Upstash/KV integration sets these variables):
  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   (or KV_REST_API_URL + KV_REST_API_TOKEN)
Without them we append to a local JSONL file (data/flags/, or /tmp on Vercel).
Flags contain only the quote, the verdict, the evidence id and an optional
comment — no user identifiers.
"""
from __future__ import annotations

import json
import logging
import os
import threading
from pathlib import Path

import httpx

log = logging.getLogger("thabat.flags")
KEY = "thabat:flags"
MAX_KEEP = 2000
_lock = threading.Lock()


def _redis() -> tuple[str, str] | None:
    url = os.environ.get("UPSTASH_REDIS_REST_URL") or os.environ.get("KV_REST_API_URL")
    tok = os.environ.get("UPSTASH_REDIS_REST_TOKEN") or os.environ.get("KV_REST_API_TOKEN")
    return (url.rstrip("/"), tok) if url and tok else None


def _file() -> Path:
    base = Path("/tmp/thabat") if os.environ.get("VERCEL") else Path(__file__).resolve().parents[2] / "data" / "flags"
    base.mkdir(parents=True, exist_ok=True)
    return base / "flags.jsonl"


def backend_name() -> str:
    return "redis" if _redis() else ("tmp-file" if os.environ.get("VERCEL") else "file")


def add(rec: dict) -> None:
    line = json.dumps(rec, ensure_ascii=False)
    r = _redis()
    if r:
        url, tok = r
        with httpx.Client(timeout=5) as cl:
            resp = cl.post(f"{url}/pipeline", headers={"Authorization": f"Bearer {tok}"},
                           json=[["LPUSH", KEY, line], ["LTRIM", KEY, "0", str(MAX_KEEP - 1)]])
            resp.raise_for_status()
        return
    with _lock, _file().open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def recent(n: int = 200) -> list[dict]:
    r = _redis()
    if r:
        url, tok = r
        with httpx.Client(timeout=5) as cl:
            resp = cl.post(url, headers={"Authorization": f"Bearer {tok}"}, json=["LRANGE", KEY, "0", str(n - 1)])
            resp.raise_for_status()
            return [json.loads(x) for x in resp.json().get("result", [])]
    p = _file()
    if not p.exists():
        return []
    rows = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
    return rows[-n:][::-1]
