"""Optional LLM assist (Claude). Thabat works fully without it.

What the model is allowed to do:
  * find the religious quotes inside a messy forwarded message, and
  * propose an Arabic search query for quotes in languages we cannot search
    directly (e.g. Urdu, Malay, Spanish, German).

What it is NOT allowed to do: judge authenticity, invent references, or
write verdicts. Its output is only ever used as a *search query* against the
verified corpus; results found that way are labelled "via AI translation" and
capped at medium confidence.

Enable by setting ANTHROPIC_API_KEY. Override the model with THABAT_MODEL.
Disable with THABAT_LLM=off.
"""
from __future__ import annotations

import logging
import os
from typing import Literal

from pydantic import BaseModel, Field

log = logging.getLogger("thabat.llm")

MODEL = os.environ.get("THABAT_MODEL", "claude-opus-5")
TIMEOUT_S = float(os.environ.get("THABAT_LLM_TIMEOUT", "25"))

SYSTEM = """You extract religious quotations from forwarded social-media messages so that a separate, \
deterministic system can look them up in verified sources (the Quran and hadith collections).

Rules:
- Return every passage that is presented as a Quran verse, a saying of the Prophet Muhammad (hadith), \
or a saying attributed to him or to Allah. Copy each quote exactly as written in the message (do not fix it).
- Leave out framing ("The Prophet said:"), emojis, calls to forward the message, and commentary.
- kind: "quran" if presented as a verse, "hadith" if attributed to the Prophet, otherwise "other".
- If the quote is not in Arabic, English, French, Indonesian or Turkish, put your best Arabic rendering \
of the classical wording in arabic_search. Otherwise leave arabic_search empty.
- Never state whether a quote is authentic. You are only locating quotes."""


class ExtractedQuote(BaseModel):
    quote: str = Field(description="The quote exactly as it appears in the message")
    kind: Literal["quran", "hadith", "other"]
    language: str = Field(description="ISO 639-1 code of the quote's language")
    arabic_search: str = Field(default="", description="Arabic rendering, only for languages we cannot search")


class Extraction(BaseModel):
    quotes: list[ExtractedQuote]


def available() -> bool:
    if os.environ.get("THABAT_LLM", "on").lower() in ("off", "0", "false"):
        return False
    return bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))


_client = None


def _get_client():
    global _client
    if _client is None:
        import anthropic

        _client = anthropic.Anthropic(timeout=TIMEOUT_S, max_retries=1)
    return _client


def extract_quotes(text: str) -> list[dict] | None:
    """Return extracted quotes, or None on any failure (caller falls back to heuristics)."""
    import anthropic

    try:
        resp = _get_client().messages.parse(
            model=MODEL,
            max_tokens=4000,
            system=SYSTEM,
            messages=[{"role": "user", "content": f"<message>\n{text[:6000]}\n</message>"}],
            output_format=Extraction,
        )
    except anthropic.RateLimitError:
        log.warning("LLM rate limited; using heuristic segmentation")
        return None
    except anthropic.APIStatusError as e:
        log.warning("LLM API error %s; using heuristic segmentation", e.status_code)
        return None
    except anthropic.APIConnectionError:
        log.warning("LLM unreachable; using heuristic segmentation")
        return None
    except Exception:  # parsing/validation problems must never break verification
        log.exception("LLM extraction failed; using heuristic segmentation")
        return None
    # Token usage only (never message content), for cost tracking.
    log.info("llm usage model=%s in=%s out=%s", MODEL, resp.usage.input_tokens, resp.usage.output_tokens)
    if resp.stop_reason == "refusal" or resp.parsed_output is None:
        return None
    return [q.model_dump() for q in resp.parsed_output.quotes if q.kind in ("quran", "hadith")]
