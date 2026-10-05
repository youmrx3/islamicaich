"""Storage for user reports, specialist review decisions and reviewer accounts.

Production uses Supabase (PostgREST). Tables are defined in supabase/schema.sql.
  SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY   server-side key (preferred; never sent to the browser)
  SUPABASE_ANON_KEY           fallback; works with the insert-only RLS policy for reports
Without them, records go to a local JSONL file (data/flags/, or /tmp on Vercel),
so the app keeps working. Records never contain user identifiers.
"""
from __future__ import annotations

import json
import logging
import os
import threading
import time
from pathlib import Path

import httpx

log = logging.getLogger("thabat.store")
_lock = threading.Lock()
_cache: dict[str, tuple[float, object]] = {}
TTL = 60  # seconds, for review decisions shown in results


def _supabase() -> tuple[str, str] | None:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY") \
        or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return (url.rstrip("/"), key) if url and key else None


def _headers(key: str) -> dict:
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}


def _file(name: str) -> Path:
    base = Path("/tmp/thabat") if os.environ.get("VERCEL") else Path(__file__).resolve().parents[2] / "data" / "flags"
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{name}.jsonl"


def backend_name() -> str:
    return "supabase" if _supabase() else ("tmp-file" if os.environ.get("VERCEL") else "file")


def _insert(table: str, rec: dict) -> None:
    sb = _supabase()
    if sb:
        url, key = sb
        r = httpx.post(f"{url}/rest/v1/{table}", headers=_headers(key) | {"Prefer": "return=minimal"},
                       json=rec, timeout=8)
        r.raise_for_status()
        return
    with _lock, _file(table).open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def _select(table: str, n: int = 200) -> list[dict]:
    sb = _supabase()
    if sb:
        url, key = sb
        r = httpx.get(f"{url}/rest/v1/{table}", headers=_headers(key),
                      params={"select": "*", "order": "created_at.desc", "limit": str(n)}, timeout=8)
        r.raise_for_status()
        return r.json()
    p = _file(table)
    if not p.exists():
        return []
    rows = [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]
    return rows[-n:][::-1]


def _rows(table: str) -> list[dict]:
    p = _file(table)
    return [json.loads(l) for l in p.read_text(encoding="utf-8").splitlines() if l.strip()] if p.exists() else []


def _query(table: str, filters: dict[str, str], n: int = 200) -> list[dict]:
    """Rows whose columns equal the given values, newest first."""
    sb = _supabase()
    if sb:
        url, key = sb
        params = {"select": "*", "order": "created_at.desc", "limit": str(n)} | {k: f"eq.{v}" for k, v in filters.items()}
        r = httpx.get(f"{url}/rest/v1/{table}", headers=_headers(key), params=params, timeout=8)
        r.raise_for_status()
        return r.json()
    rows = [r for r in _rows(table) if all(str(r.get(k)) == str(v) for k, v in filters.items())]
    return rows[-n:][::-1]


def _update(table: str, row_id: str, fields: dict) -> None:
    sb = _supabase()
    if sb:
        url, key = sb
        r = httpx.patch(f"{url}/rest/v1/{table}", headers=_headers(key) | {"Prefer": "return=minimal"},
                        params={"id": f"eq.{row_id}"}, json=fields, timeout=8)
        r.raise_for_status()
        return
    with _lock:
        rows = _rows(table)
        for row in rows:
            if row.get("id") == row_id:
                row.update(fields)
        _file(table).write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in rows), encoding="utf-8")


# ---- reports ("report a problem", "request review", "I know the source")
def add(rec: dict) -> None:
    _insert("reports", rec)


def recent(n: int = 200) -> list[dict]:
    return _select("reports", n)


# ---- specialist review decisions on register entries
def add_decision(rec: dict) -> None:
    _insert("review_decisions", rec)
    _cache.pop("decisions", None)


def decisions() -> dict[str, dict]:
    """Latest decision per register entry (cached briefly)."""
    hit = _cache.get("decisions")
    if hit and time.time() - hit[0] < TTL:
        return hit[1]  # type: ignore[return-value]
    latest: dict[str, dict] = {}
    try:
        for row in reversed(_select("review_decisions", 1000)):  # oldest -> newest
            latest[row["entry_id"]] = row
    except Exception:
        log.warning("could not load review decisions; showing registry as-is")
    _cache["decisions"] = (time.time(), latest)
    return latest


# ---- reviewer accounts (apply -> admin approves -> personal access code)
def add_reviewer(rec: dict) -> None:
    _insert("reviewers", rec)


def reviewers(n: int = 500) -> list[dict]:
    return _select("reviewers", n)


def reviewer_by_id(row_id: str) -> dict | None:
    rows = _query("reviewers", {"id": row_id}, 1)
    return rows[0] if rows else None


def reviewer_by_token_hash(token_hash: str) -> dict | None:
    """Only approved accounts can sign in; revoked or rejected ones cannot."""
    rows = _query("reviewers", {"token_hash": token_hash, "status": "approved"}, 1)
    return rows[0] if rows else None


def update_reviewer(row_id: str, fields: dict) -> None:
    _update("reviewers", row_id, fields)
