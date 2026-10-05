"""Quote-to-source matching: Quran (with word-level diff) and hadith (with grades)."""
from __future__ import annotations

import difflib
import re
from functools import lru_cache
from dataclasses import dataclass, field

from rapidfuzz import fuzz

from .corpus import Corpus, ar_tokens, latin_tokens
from .grades import summarize
from .normalize import extract_matn, normalize_ar, normalize_latin


@lru_cache(maxsize=20000)
def _ar_keys(text: str) -> tuple[str, str]:
    n = normalize_ar(text)
    return n, extract_matn(n)


@lru_cache(maxsize=20000)
def _latin_key(text: str) -> str:
    return normalize_latin(text)

# Thresholds are calibrated on eval/cases.json (see eval/README.md).
QURAN_EXACT = 0.97
QURAN_VARIANT = 0.80
QURAN_PARTIAL = 0.62  # accepted only with a long exact run (see match_quran)
HADITH_STRONG = 0.86
HADITH_CANDIDATE = 0.70
LATIN_STRONG = 0.80
LATIN_CANDIDATE = 0.62
MIN_QUOTE_WORDS = 3


def _coverage(q_tokens: list[str], d_tokens: set[str]) -> float:
    if not q_tokens:
        return 0.0
    return sum(1 for t in q_tokens if t in d_tokens) / len(q_tokens)


def score_ar(q_norm: str, d_norm: str) -> float:
    """How well an Arabic quote is contained in a document (0..1)."""
    if not q_norm or not d_norm:
        return 0.0
    partial = fuzz.partial_ratio(q_norm, d_norm) / 100
    cov = _coverage(ar_tokens(q_norm), set(ar_tokens(d_norm)))
    # A quote much longer than the document cannot be "contained" in it.
    length_pen = min(1.0, (len(d_norm) + 10) / max(len(q_norm), 1))
    return (0.6 * partial + 0.4 * cov) * min(1.0, 0.5 + 0.5 * length_pen)


def score_latin(q_norm: str, d_norm: str) -> float:
    if not q_norm or not d_norm:
        return 0.0
    partial = fuzz.partial_ratio(q_norm, d_norm) / 100
    tset = fuzz.token_set_ratio(q_norm, d_norm) / 100
    q_toks = [t for t in latin_tokens(q_norm) if len(t) > 3]
    cov = _coverage(q_toks, set(latin_tokens(d_norm))) if q_toks else 0.0
    return 0.35 * partial + 0.25 * tset + 0.4 * cov


# --------------------------------------------------------------------- Quran

@dataclass
class QuranMatch:
    status: str  # quran_exact | quran_variant
    score: float
    ref: str  # "2:255" or "2:255-256"
    surah: int
    ayah_from: int
    ayah_to: int
    text_uthmani: str
    diff: list[dict]
    changed_words: int
    # The same words appear verbatim in other places (repeated verses / repeated phrases).
    occurrences: list[tuple[int, int]] = field(default_factory=list)  # every (surah, ayah), incl. this one
    # Near-identical verses elsewhere (mutashabihat): a few words differ.
    similar: list[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        from .surahs import cite_ar, cite_en
        d = {k: v for k, v in self.__dict__.items() if k not in ("occurrences", "similar")}
        d["citation_ar"] = cite_ar(self.surah, self.ayah_from, self.ayah_to)
        d["citation_en"] = cite_en(self.surah, self.ayah_from, self.ayah_to)
        d["audio"] = [audio_url(self.surah, a) for a in range(self.ayah_from, self.ayah_to + 1)]
        d["occurrences"] = [{"ref": f"{su}:{ay}", "surah": su, "ayah": ay, "citation_ar": cite_ar(su, ay, ay),
                             "citation_en": cite_en(su, ay, ay)} for su, ay in self.occurrences]
        d["occurrence_count"] = len(self.occurrences)
        d["similar"] = [x | {"citation_ar": cite_ar(x["surah"], x["ayah"], x["ayah"]),
                             "citation_en": cite_en(x["surah"], x["ayah"], x["ayah"])} for x in self.similar]
        return d


def audio_url(surah: int, ayah: int) -> str:
    """Recitation (Mishary Alafasy) from everyayah.com, one file per ayah."""
    return f"https://everyayah.com/data/Alafasy_128kbps/{surah:03d}{ayah:03d}.mp3"


def _words_with_norm(text: str, honorifics: bool = False) -> list[tuple[str, str]]:
    out = []
    for w in text.split():
        n = normalize_ar(w, drop_honorifics=honorifics)
        if n:
            out.append((w, n))
    return out


def _strip_conj(n: str) -> str:
    return n[1:] if len(n) > 2 and n[0] in "وف" else n


def word_diff(quote: str, reference: str) -> tuple[list[dict], int]:
    """Word-level diff between what was quoted and the verified text.

    Returns ops for the UI: equal / wrong (quote word replaced) / missing
    (word dropped from the verse) / extra (word added to the verse).
    """
    qw = _words_with_norm(quote)
    rw = _words_with_norm(reference)
    sm = difflib.SequenceMatcher(a=[n for _, n in qw], b=[n for _, n in rw], autojunk=False)
    ops, changed = [], 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            ops.append({"op": "equal", "text": " ".join(w for w, _ in rw[j1:j2])})
        elif tag == "replace" and i2 - i1 == j2 - j1 and all(
            _strip_conj(qw[i1 + k][1]) == _strip_conj(rw[j1 + k][1]) for k in range(i2 - i1)
        ):
            # Only a leading wa/fa differs: harmless when quoting mid-verse.
            ops.append({"op": "minor", "quoted": " ".join(w for w, _ in qw[i1:i2]),
                        "correct": " ".join(w for w, _ in rw[j1:j2])})
        elif tag == "replace":
            ops.append({"op": "wrong", "quoted": " ".join(w for w, _ in qw[i1:i2]),
                        "correct": " ".join(w for w, _ in rw[j1:j2])})
            changed += max(i2 - i1, j2 - j1)
        elif tag == "delete":
            ops.append({"op": "extra", "quoted": " ".join(w for w, _ in qw[i1:i2])})
            changed += i2 - i1
        elif tag == "insert":
            ops.append({"op": "missing", "correct": " ".join(w for w, _ in rw[j1:j2])})
            changed += j2 - j1
    return ops, changed


def _aligned_range(q_norm: str, norms: list[str]) -> tuple[int, int]:
    """Indices [i, j) of the verse words the quote actually covers (quotes are often partial)."""
    al = fuzz.partial_ratio_alignment(q_norm, " ".join(norms))
    if al is None:
        return 0, len(norms)
    idx, pos = [], 0
    for k, n in enumerate(norms):
        w_start, w_end = pos, pos + len(n)
        pos = w_end + 1
        if w_end > al.dest_start and w_start < al.dest_end:
            idx.append(k)
    return (idx[0], idx[-1] + 1) if idx else (0, len(norms))


# ------------------------------------------------- repeated & similar verses
# The Quran repeats some verses verbatim (e.g. 55:13 thirty-one times in Surat al-Rahman)
# and has many near-identical ones (mutashabihat, e.g. 6:32 / 29:64 / 47:36 / 57:20).
# Three rules keep attribution honest:
#   1. exact first: a whole-word scan of all 6,236 verses finds every place the quoted words
#      occur verbatim; all of them are reported, the first one is the primary citation;
#   2. fewest changed words wins: among close fuzzy candidates, the verse whose wording differs
#      least from the quote is chosen, so a correct quote is never judged against its twin;
#   3. near twins are listed as "similar verses", so a user who mixed two of them can see both.
SIMILAR_MAX_CHANGED = 3


def _padded_norms(c: Corpus) -> list[str]:
    pad = getattr(c, "_quran_padded", None)
    if pad is None:
        pad = [f" {v['norm']} " for v in c.quran]
        c._quran_padded = pad  # type: ignore[attr-defined]
    return pad


def find_verbatim(c: Corpus, q_norm: str) -> list[int]:
    """Positions of every verse that contains the quote word-for-word (normalized)."""
    needle = f" {q_norm.strip()} "
    return [i for i, t in enumerate(_padded_norms(c)) if needle in t]


def _similar_verses(c: Corpus, quote: str, q_norm: str, exclude: set[int], limit: int = 4) -> list[dict]:
    """Single verses elsewhere whose wording differs from the quote by only a few words."""
    q_words = len(q_norm.split())
    if q_words < 5:  # very short phrases match too many verses loosely to be useful here
        return []
    out = []
    for pos, _ in c.idx_quran.search(q_norm, k=16):
        if pos in exclude:
            continue
        v = c.quran[pos]
        if score_ar(q_norm, v["norm"]) < QURAN_VARIANT:
            continue
        tagged = _words_with_norm(v.get("simple") or v["uthmani"])
        i, j = _aligned_range(q_norm, [n for _, n in tagged])
        _, changed = word_diff(quote, " ".join(w for w, _ in tagged[i:j]))
        if 0 < changed <= min(SIMILAR_MAX_CHANGED, max(1, q_words // 3)):
            out.append({"ref": f"{v['surah']}:{v['ayah']}", "surah": v["surah"], "ayah": v["ayah"],
                        "text_uthmani": v["uthmani"], "changed_words": changed})
    out.sort(key=lambda x: (x["changed_words"], x["surah"], x["ayah"]))
    return out[:limit]


def _verbatim_match(c: Corpus, quote: str, q_norm: str, hits: list[int]) -> QuranMatch:
    first = c.quran[hits[0]]
    tagged = _words_with_norm(first.get("simple") or first["uthmani"])
    i, j = _aligned_range(q_norm, [n for _, n in tagged])
    diff, changed = word_diff(quote, " ".join(w for w, _ in tagged[i:j]))
    m = QuranMatch("quran_exact" if changed == 0 else "quran_variant", 1.0, f"{first['surah']}:{first['ayah']}",
                   first["surah"], first["ayah"], first["ayah"], first["uthmani"], diff, changed)
    m.occurrences = [(c.quran[p]["surah"], c.quran[p]["ayah"]) for p in hits]
    m.similar = _similar_verses(c, quote, q_norm, set(hits))
    return m


def match_quran(c: Corpus, quote: str) -> QuranMatch | None:
    q_norm = normalize_ar(quote, drop_honorifics=False)
    if len(q_norm.split()) < MIN_QUOTE_WORDS:
        return None
    hits = find_verbatim(c, q_norm)
    if hits:
        return _verbatim_match(c, quote, q_norm, hits)
    cands = c.idx_quran.search(q_norm, k=12)
    best = None
    scored = []
    for pos, _ in cands:
        for lo, hi in ((0, 0), (-1, 0), (0, 1), (-1, 1), (0, 2), (-2, 0), (0, 3), (-1, 2), (-2, 1), (-3, 0)):
            a, b = pos + lo, pos + hi
            if a < 0 or b >= len(c.quran):
                continue
            span = c.quran[a:b + 1]
            if len({v["surah"] for v in span}) > 1:
                continue
            text = " ".join(v["norm"] for v in span)
            s = score_ar(q_norm, text)
            # Prefer the shortest span that explains the quote.
            key = (round(s - 0.02 * (b - a), 3), -(b - a))
            scored.append((key, s, a, b))
            if best is None or key > best[0]:
                best = (key, s, a, b)
    if not best or best[1] < QURAN_PARTIAL:
        return None

    def explain(a: int, b: int):
        span = c.quran[a:b + 1]
        tagged = []  # (display word, norm word, ayah)
        for v in span:
            tagged += [(w, n, v["ayah"]) for w, n in _words_with_norm(v.get("simple") or v["uthmani"])]
        i, j = _aligned_range(q_norm, [n for _, n, _ in tagged])
        covered = tagged[i:j]
        diff, changed = word_diff(quote, " ".join(w for w, _, _ in covered))
        return span, covered, diff, changed

    # Rule 2: among the close candidates, the verse that differs by the fewest words wins
    # (ties keep the higher score), so a quote is never judged against a similar verse.
    close, seen = [], set()
    for key, s_, a_, b_ in sorted(scored, reverse=True):
        if s_ < best[1] - 0.06 or (a_, b_) in seen:
            continue
        seen.add((a_, b_))
        close.append((key, s_, a_, b_))
        if len(close) == 6:
            break
    choice = None
    for key, s_, a_, b_ in close:
        span_, covered_, diff_, changed_ = explain(a_, b_)
        rank = (changed_, -key[0], -key[1])
        if choice is None or rank < choice[0]:
            choice = (rank, s_, a_, b_, span_, covered_, diff_, changed_)
    _, s, a, b, span, covered, diff, changed = choice
    a_from, a_to = covered[0][2], covered[-1][2]
    status = "quran_exact" if changed == 0 and s >= QURAN_EXACT - 0.05 else "quran_variant"
    if status == "quran_variant" and changed > max(3, len(covered) // 2):
        return None  # too different to claim it is this verse
    if s < QURAN_VARIANT:
        # Weak overall match: only claim a (mis)quoted verse if the quote begins with,
        # or contains, a run of >= 4 exact verse words making up half of the quote.
        runs = [len(op["text"].split()) for op in diff if op["op"] == "equal"]
        q_words = len(q_norm.split())
        if not runs or max(runs) < 4 or max(runs) < q_words / 2:
            return None
    surah = span[0]["surah"]
    shown = [v for v in span if a_from <= v["ayah"] <= a_to]
    ref = f"{surah}:{a_from}" + (f"-{a_to}" if a_to != a_from else "")
    m = QuranMatch(status, round(s, 3), ref, surah, a_from, a_to,
                   " ".join(v["uthmani"] for v in shown), diff, changed)
    if a_from == a_to:
        # the verse words the quote corresponds to may themselves occur in several places
        core = " ".join(n for _, n, _ in covered)
        here = [k for k, v in enumerate(c.quran) if v["surah"] == surah and v["ayah"] == a_from]
        same = find_verbatim(c, core) if len(core.split()) >= MIN_QUOTE_WORDS else []
        m.occurrences = [(c.quran[p]["surah"], c.quran[p]["ayah"]) for p in sorted(set(same) | set(here))]
        m.similar = _similar_verses(c, quote, q_norm, set(same) | set(here))
    return m


# -------------------------------------------------------------------- Hadith

@dataclass
class HadithHit:
    id: str
    score: float
    record: dict
    grade: dict

    def to_dict(self, lang: str = "eng") -> dict:
        r = self.record
        return {
            "id": self.id,
            "score": round(self.score, 3),
            "book": r["book"],
            "book_ar": r["book_ar"],
            "book_en": r["book_en"],
            "number": split_cite(r.get("cite", r["number"]))[0],
            "citation_ar": f'{r["book_ar"]} ({split_cite(r.get("cite", r["number"]))[0]})',
            "citation_en": f'{r["book_en"]} {"".join(split_cite(r.get("cite", r["number"])))}',
            "ar": r["ar"],
            "translation": r.get("tr", {}).get(lang) or r.get("tr", {}).get("eng"),
            "grade": self.grade,
            "source_url": sunnah_url(r["book"], r.get("cite", r["number"])),
        }


_SUNNAH_SLUG = {"bukhari": "bukhari", "muslim": "muslim", "abudawud": "abudawud", "tirmidhi": "tirmidhi",
                "nasai": "nasai", "ibnmajah": "ibnmajah", "malik": "malik", "nawawi": "nawawi40", "qudsi": "qudsi40"}


def split_cite(cite) -> tuple[str, str]:
    """'2699.01' -> ('2699', 'a'): Muslim sub-narrations are cited 2699a, 2699b..."""
    n = str(cite)
    if n.endswith(".0"):
        n = n[:-2]
    if "." in n:
        base, sub = n.split(".", 1)
        try:
            return base, "abcdefghijklmnopqrstuvwxyz"[int(sub) - 1]
        except (ValueError, IndexError):
            return base, ""
    return n, ""


def sunnah_url(book: str, cite) -> str:
    base, sub = split_cite(cite)
    return f"https://sunnah.com/{_SUNNAH_SLUG.get(book, book)}:{base}{sub}"


_BOOK_PRIORITY = {"bukhari": 0, "muslim": 0, "abudawud": 1, "tirmidhi": 1, "nasai": 1,
                  "ibnmajah": 1, "malik": 1, "nawawi": 2, "qudsi": 2}


@dataclass
class HadithResult:
    hits: list[HadithHit] = field(default_factory=list)
    lang: str = "ara"

    @property
    def best(self) -> HadithHit | None:
        return self.hits[0] if self.hits else None


_LEAD_IN = re.compile(r"^(قال|يقول|ان|انه|عن)\s+")


def match_hadith(c: Corpus, quote: str, lang: str = "ara", k: int = 5) -> HadithResult:
    res = HadithResult(lang=lang)
    if lang == "ara":
        q = normalize_ar(quote)
        q = _LEAD_IN.sub("", q)
        if len(q.split()) < 2:
            return res
        cands = c.idx_hadith_ar.search(q, k=60)
        scored = []
        for pos, _ in cands:
            full, matn = _ar_keys(c.hadith[pos]["ar"])
            s = max(score_ar(q, matn), score_ar(q, full))
            scored.append((s, pos))
    else:
        q = normalize_latin(quote)
        if len(q.split()) < MIN_QUOTE_WORDS + 1:
            return res
        langs = [lang] if lang in c.idx_hadith_tr else list(c.idx_hadith_tr)
        scored = []
        seen = set()
        for l in langs:
            for pos, _ in c.idx_hadith_tr[l].search(q, k=50):
                if (pos, l) in seen:
                    continue
                seen.add((pos, l))
                scored.append((score_latin(q, _latin_key(c.hadith[pos]["tr"].get(l, ""))), pos))
    # Short quotes (2 words) only count when they appear verbatim.
    if lang == "ara" and len(q.split()) < MIN_QUOTE_WORDS:
        scored = [(s, p) for s, p in scored if fuzz.partial_ratio(q, _ar_keys(c.hadith[p]["ar"])[0]) == 100]
    scored.sort(key=lambda x: (-round(x[0], 2), _BOOK_PRIORITY.get(c.hadith[x[1]]["book"], 3)))
    used = set()
    for s, pos in scored:
        if pos in used:
            continue
        used.add(pos)
        r = c.hadith[pos]
        res.hits.append(HadithHit(r["id"], s, r, summarize(r["grades"], r.get("implicit")).to_dict()))
        if len(res.hits) >= k:
            break
    return res
