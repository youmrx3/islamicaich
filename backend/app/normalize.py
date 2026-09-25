"""Text normalization shared by the data build and the runtime.

Matching must be robust to how people actually type Arabic on phones:
no diacritics, mixed alef/hamza forms, ta marbuta written as ha, tatweel,
and honorific ligatures (ﷺ). We never show normalized text to users; it is
only a search key. The original text is always what gets displayed.
"""
from __future__ import annotations

import re
import unicodedata

# Harakat, Quranic annotation marks, superscript alef, small high letters, etc.
_AR_DIACRITICS = re.compile(
    "[ؐ-ًؚ-ٰٟۖ-ۭ࣓-ࣿ]"
)
_TATWEEL = "ـ"
_NON_WORD = re.compile(r"[^\w\s]", re.UNICODE)
_SPACES = re.compile(r"\s+")

_CHAR_MAP = str.maketrans(
    {
        "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا", "ٲ": "ا", "ٳ": "ا",
        "ى": "ي", "ئ": "ي", "ی": "ي", "ې": "ي",
        "ؤ": "و",
        "ة": "ه",
        "ک": "ك", "ڪ": "ك",
        "ۀ": "ه", "ھ": "ه",
        "ء": "",
    }
)

# Honorifics that may or may not be present in a forwarded message.
_HONORIFICS = [
    "صلى الله عليه وسلم", "صلي الله عليه وسلم", "صلى الله عليه واله وسلم",
    "عليه الصلاة والسلام", "عليه السلام", "رضي الله عنه", "رضي الله عنها",
    "رضي الله عنهما", "رضي الله عنهم", "ﷺ", "ﷻ",
]
_HONORIFICS_RE: re.Pattern | None = None


def _honorifics_re() -> re.Pattern:
    global _HONORIFICS_RE
    if _HONORIFICS_RE is None:
        forms = sorted({normalize_ar(h, drop_honorifics=False) for h in _HONORIFICS} - {""}, key=len, reverse=True)
        _HONORIFICS_RE = re.compile(r"(?:^|(?<= ))(?:" + "|".join(map(re.escape, forms)) + r")(?= |$)")
    return _HONORIFICS_RE

ARABIC_RE = re.compile("[؀-ۿ]")


def is_arabic(text: str) -> bool:
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return False
    ar = sum(1 for c in letters if ARABIC_RE.match(c))
    return ar / len(letters) > 0.5


def normalize_ar(text: str, drop_honorifics: bool = True) -> str:
    """Aggressive normalization for Arabic matching keys."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = _AR_DIACRITICS.sub("", text).replace(_TATWEEL, "")
    text = text.translate(_CHAR_MAP)
    text = _NON_WORD.sub(" ", text)
    text = _SPACES.sub(" ", text).strip()
    if drop_honorifics:
        text = _honorifics_re().sub(" ", text)
        text = _SPACES.sub(" ", text).strip()
    return text


def normalize_latin(text: str) -> str:
    """Lowercase, strip accents and punctuation (for en/fr/id/tr/ur romanized)."""
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower().replace("(ﷺ)", " ").replace("ﷺ", " ")
    text = _NON_WORD.sub(" ", text)
    return _SPACES.sub(" ", text).strip()


def normalize_any(text: str) -> str:
    return normalize_ar(text) if is_arabic(text) else normalize_latin(text)


# Phrases that typically end the isnad and begin the prophetic statement.
_MATN_MARKERS = [
    "قال رسول الله", "ان رسول الله", "ان النبي", "عن النبي", "سمعت رسول الله",
    "سمعت النبي", "قال النبي", "يقول رسول الله", "قال قال رسول الله",
]


def extract_matn(text_norm: str) -> str:
    """Heuristically drop the chain of narrators from a normalized hadith.

    Forwarded messages quote the Prophet's words, not the isnad, so matching
    against the matn improves precision. Falls back to the full text.
    """
    best = -1
    for m in _MATN_MARKERS:
        i = text_norm.find(m)
        if i != -1 and (best == -1 or i < best):
            best = i + len(m)
    if best == -1:
        return text_norm
    matn = text_norm[best:].strip()
    for lead in ("قال ", "يقول ", "انه قال "):
        if matn.startswith(lead):
            matn = matn[len(lead):]
    return matn if len(matn) >= 12 else text_norm
