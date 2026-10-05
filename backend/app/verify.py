"""The verification pipeline: message -> quotes -> evidence -> verdict.

Design rules (these are what make the output trustworthy):
  1. The corpus decides, never a language model. An LLM may only help find
     quotes or propose an Arabic search query; its output is never evidence.
  2. "Not found" is not "fabricated". When nothing in the indexed sources
     supports or refutes a text, we abstain and refer to a specialist.
  3. Every verdict carries its evidence: collection, number, named graders,
     the grader's exact label, and a link to an independent public copy.
  4. Grades are aggregated with a standard hadith-science rule: if any route
     of the same wording is authentic, the text is established; weaker
     routes are shown but do not override it.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from rapidfuzz import fuzz

from . import llm, scope
from .corpus import Corpus, get_corpus
from .grades import summarize
from .matching import (HADITH_CANDIDATE, HADITH_STRONG, LATIN_CANDIDATE, LATIN_STRONG,
                       _aligned_range, _words_with_norm, match_hadith, match_quran, word_diff)
from .normalize import is_arabic, normalize_ar, normalize_latin

CURATED = Path(__file__).resolve().parents[2] / "data" / "curated"

REGISTRY_AR = 0.88
REGISTRY_LATIN = 0.80
MAX_SEGMENTS = 8

# --------------------------------------------------------------- statuses
# Each status maps to one of the four content levels defined in the challenge's
# scientific annex ("المرجعية والحزمة العلمية والبيانات", p.2):
#   أ  stable original information  -> direct answer, documented with its source
#   ب  explanation / argument        -> answer from approved material, reference shown,
#                                       no certainty where scholars may differ
#   ج  disputed or highly sensitive  -> restricted answer, state the disagreement, or refer
#   د  fatwa or personal case        -> no independent ruling; general info + referral

STATUS = {
    # key: (severity 0-4, label_ar, label_en, refer_to_specialist, annex level)
    "quran_exact": (0, "آية قرآنية مطابقة", "Exact Quran verse", False, "أ"),
    "quran_variant": (3, "آية نُقلت بلفظ مختلف", "Quran verse, misquoted", False, "أ"),
    "authentic": (0, "حديث ثابت", "Authentic hadith", False, "أ"),
    "authentic_by_routes": (1, "ثابت بمجموع طرقه", "Authentic via combined routes", False, "ب"),
    "authentic_mawquf": (2, "ثابت لكنه ليس من كلام النبي ﷺ", "Sound, but not the Prophet's words", False, "ب"),
    "disputed": (3, "مختلف في ثبوته", "Disputed among scholars", True, "ج"),
    "needs_review": (3, "نص مشابه — يحتاج تحقق", "Similar text found — needs checking", True, "ج"),
    "weak": (4, "ضعيف لا يثبت", "Weak — not established", False, "ب"),
    "fabricated": (4, "موضوع / لا يثبت", "Fabricated — not established", False, "ب"),
    "baseless": (4, "لا أصل له بهذا اللفظ", "No basis with this wording", False, "ب"),
    "not_found": (3, "لم نعثر عليه في المصادر المفهرسة", "Not found in indexed sources", True, "ج"),
}

LEVELS = {
    "أ": ("(أ) معلومة أصلية مستقرة — إجابة مباشرة موثقة بالمصدر",
          "(A) Stable original information — direct answer documented with its source"),
    "ب": ("(ب) شرح وتعريف — من مادة معتمدة مع إظهار المرجع وتجنب القطع فيما يحتمل الخلاف",
          "(B) Explanation — from approved material, reference shown, no certainty where scholars may differ"),
    "ج": ("(ج) مسألة خلافية أو غير محسومة — بيان الخلاف أو الامتناع والإحالة إلى مختص",
          "(C) Disputed or unresolved — disagreement stated, or abstain and refer to a specialist"),
    "د": ("(د) فتوى أو حالة شخصية — لا حكم مستقل؛ معلومة عامة وإحالة إلى جهة مؤهلة",
          "(D) Fatwa or personal case — no independent ruling; general information and referral"),
}
LEVEL_LATIN = {"أ": "A", "ب": "B", "ج": "C", "د": "D"}

# --------------------------------------------------------------- registry


@lru_cache(maxsize=1)
def load_registry() -> dict:
    p = CURATED / "registry.json"
    reg = json.loads(p.read_text(encoding="utf-8"))
    for e in reg["entries"]:
        keys_ar, keys_lat = [], []
        for v in [e["text_ar"], *e.get("variants", [])]:
            (keys_ar if is_arabic(v) else keys_lat).append(normalize_ar(v) if is_arabic(v) else normalize_latin(v))
        e["_ar"], e["_lat"] = keys_ar, keys_lat
    return reg


def match_registry(quote: str) -> tuple[dict, float] | None:
    reg = load_registry()
    arabic = is_arabic(quote)
    q = normalize_ar(quote) if arabic else normalize_latin(quote)
    if not q:
        return None
    best = None
    for e in reg["entries"]:
        for key in (e["_ar"] if arabic else e["_lat"]):
            s = (fuzz.ratio(q, key) if arabic else max(fuzz.ratio(q, key), fuzz.token_sort_ratio(q, key))) / 100
            # The known saying may be embedded in a longer quote, if it is most of it.
            share = len(key) / max(len(q), 1)
            if share < 1 and share >= 0.5:
                s = max(s, fuzz.partial_ratio(key, q) / 100 * (0.9 + 0.1 * share))
            if best is None or s > best[1]:
                best = (e, s)
    thr = REGISTRY_AR if arabic else REGISTRY_LATIN
    return best if best and best[1] >= thr else None


# ------------------------------------------------------------ segmentation

_QUOTE_RE = re.compile(r"[«\"“”„]([^«»\"“”„]{6,})[»\"“”„]")
_SPLIT_RE = re.compile(r"[\n\r]+|(?<=[.!؟?])\s+")
_QURAN_HINT = re.compile(r"(قال\s+(الله\s+)?تعالى|قال\s+الله\s+عز\s+وجل|يقول\s+الله|القرآن|سورة|﴿|Allah says|the Quran|Qur'?an|Coran|Allah berfirman|ayat)", re.I)
_HADITH_HINT = re.compile(r"(رسول\s+الله|النبي|ﷺ|صلى\s+الله\s+عليه|الحديث|حديث|Prophet|Messenger|hadith|hadis|Rasulullah|Peygamber|pbuh|saw\b)", re.I)
_HONOR = r"(?:\s*(?:ﷺ|\(ﷺ\)|صلى\s+الله\s+عليه\s+وسلم|صلي\s+الله\s+عليه\s+وسلم|عليه\s+الصلاة\s+والسلام|عز\s+وجل|سبحانه(?:\s+وتعالى)?|تعالى|\((?:pbuh|saw|s\.a\.w\.?|sas|saw\.)\)|pbuh\b|saw\b|s\.a\.w\.?|\(as\)))*"
_LEAD_RE = re.compile(
    r"^(?:[^«\"“\n]{0,60}?(?:قال\s+تعالى|وقال\s+تعالى|قال\s+رسول\s+الله|قال\s+النبي|عن\s+النبي|يقول\s+النبي|سمعت\s+رسول\s+الله|قال\s+الله|يقول\s+الله|"
    r"the\s+Prophet(?:\s+Muhammad)?|the\s+Messenger\s+of\s+Allah|Allah|Rasulullah|Nabi|Peygamber(?:imiz)?|Le\s+Prophète)"
    r"|\s*(?:قال|وقال|يقول)(?=\s*[:«\"“]))"
    + _HONOR +
    r"\s*(?:said|says|stated|bersabda|berfirman|buyurdu|a\s+dit|dit)?" + _HONOR + r"\s*[:«\"“,،-]?\s*", re.I)
_FORWARD_PRESSURE = re.compile(
    r"(انشرها|انشرو?ها|لا\s+تجعلها\s+تقف|أمانة\s+في\s+رقبتك|امانه\s+في\s+رقبتك|إن\s+لم\s+تنشر|ان\s+لم\s+تنشر|"
    r"ارسلها\s+(ل|إلى|الى)\s*\d+|أرسلها\s+(ل|إلى|الى)\s*\d+|share\s+(this\s+)?(with|to)\s+\d+|forward\s+(this\s+)?to|"
    r"don'?t\s+let\s+(it|this)\s+stop|sebarkan|bagikan\s+ke\s+\d+)", re.I)
_NOISE = re.compile(r"[\U0001F300-\U0001FAFF☀-➿️]+")


@dataclass
class Segment:
    text: str
    hint: str  # quran | hadith | none
    via: str = "heuristic"  # heuristic | llm
    search_ar: str | None = None  # LLM back-translation, used only as an extra query
    is_question: bool = False  # dropped later if it matches nothing (it was a question, not a quote)


def _clean(t: str) -> str:
    t = _NOISE.sub(" ", t)
    t = re.sub(r"[﴿﴾()\[\]{}]|\(\d+\)", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip(" .،,:;-–—*_~")


def _hint(t: str) -> str:
    if _QURAN_HINT.search(t):
        return "quran"
    if _HADITH_HINT.search(t):
        return "hadith"
    return "none"


def segment(text: str) -> list[Segment]:
    text = text.replace("‏", " ").replace("‎", " ")
    segs: list[Segment] = []
    seen: set[str] = set()

    def add(t: str, hint: str) -> None:
        for _ in range(3):  # "عن أبي هريرة قال: قال رسول الله ﷺ: ..." has nested lead-ins
            stripped = _LEAD_RE.sub("", t, count=1)
            if stripped == t or len(stripped.split()) < 2:
                break
            t = stripped
        # Drop only the forwarding-pressure clause ("انشرها تؤجر"), keep the claim itself.
        if _FORWARD_PRESSURE.search(t):
            t = "، ".join(c for c in re.split(r"[،,.!؟?]+", t) if c.strip() and not _FORWARD_PRESSURE.search(c))
        t = _clean(t)
        key = normalize_ar(t) if is_arabic(t) else normalize_latin(t)
        if len(key.split()) < 2 or key in seen:
            return
        if any(key in s for s in seen):  # already covered by a longer segment
            return
        seen.add(key)
        segs.append(Segment(t, hint, is_question=scope.is_question_line(t)))

    any_quoted = False
    for line in _SPLIT_RE.split(text):
        if not line.strip():
            continue
        matches = list(_QUOTE_RE.finditer(line))
        if matches:
            any_quoted = True
            prev = 0
            for m in matches:
                # The attribution is whatever introduces this quote, not the whole line:
                # «قال ﷺ: "…" وقال تعالى: "…"» holds a hadith and a verse.
                add(m.group(1), _hint(line[prev:m.start()]))
                prev = m.end()
        else:
            add(line, _hint(line))
    # A short message is often a single quote split by punctuation; also try it whole.
    whole = _clean(text)
    if len(segs) > 1 and not any_quoted and len(whole.split()) <= 40:
        add(whole, _hint(text))
    return segs[:MAX_SEGMENTS]


# ------------------------------------------------------------------ verdict

@dataclass
class Verdict:
    quote: str
    language: str
    kind: str  # quran | hadith | registry | none
    status: str
    confidence: str  # high | medium | low
    explanation_ar: str
    explanation_en: str
    evidence: list[dict] = field(default_factory=list)
    alternatives: list[dict] = field(default_factory=list)
    quran: dict | None = None
    registry: dict | None = None
    notes: list[str] = field(default_factory=list)
    via: str = "heuristic"

    def to_dict(self) -> dict:
        severity, lab_ar, lab_en, refer, level = STATUS[self.status]
        d = self.__dict__.copy()
        d.update({
            "severity": severity, "level": level, "level_latin": LEVEL_LATIN[level],
            "level_ar": LEVELS[level][0], "level_en": LEVELS[level][1],
            "label_ar": lab_ar, "label_en": lab_en,
            "refer_to_specialist": refer or self.confidence == "low",
        })
        return d


_LATIN_STOP = {
    "eng": {"the", "and", "is", "of", "who", "will", "you", "his", "he", "said"},
    "fra": {"le", "la", "les", "est", "et", "des", "qui", "une", "dans", "vous"},
    "ind": {"yang", "dan", "dari", "adalah", "untuk", "dengan", "itu", "ini", "kamu"},
    "tur": {"ve", "bir", "bu", "için", "olan", "ile", "de", "da", "gibi"},
}


def detect_lang(text: str) -> str:
    if is_arabic(text):
        return "ara"
    toks = set(normalize_latin(text).split())
    best = max(_LATIN_STOP, key=lambda l: len(toks & _LATIN_STOP[l]))
    return best if toks & _LATIN_STOP[best] else "eng"


def _snippet(record_ar: str, quote: str, pad: int = 12) -> dict:
    words = _words_with_norm(record_ar, honorifics=True)
    if not words:
        return {"before": "", "match": record_ar[:300], "after": ""}
    q_norm = normalize_ar(quote)
    i, j = _aligned_range(q_norm, [n for _, n in words])
    lo, hi = max(0, i - pad), min(len(words), j + pad)
    return {
        "before": ("… " if lo > 0 else "") + " ".join(w for w, _ in words[lo:i]),
        "match": " ".join(w for w, _ in words[i:j]),
        "after": " ".join(w for w, _ in words[j:hi]) + (" …" if hi < len(words) else ""),
    }


def _hadith_evidence(c: Corpus, hits, quote: str, lang: str) -> list[dict]:
    out = []
    for h in hits:
        d = h.to_dict(lang if lang != "ara" else "eng")
        if lang == "ara":
            d["snippet"] = _snippet(h.record["ar"], quote)
            d["diff"], d["changed_words"] = word_diff(quote, d["snippet"]["match"])
        out.append(d)
    return out


def _alternative(c: Corpus, alt: dict, lang: str) -> dict | None:
    if alt["type"] == "quran":
        s, a = alt["ref"].split(":")
        pos = c.quran_pos.get(f"{s}:{a}")
        if pos is None:
            return None
        v = c.quran[pos]
        from .surahs import cite_ar, cite_en
        return {"type": "quran", "ref": alt["ref"], "text": v["uthmani"],
                "citation_ar": cite_ar(int(s), int(a), int(a)), "citation_en": cite_en(int(s), int(a), int(a)),
                "source_url": f"https://quran.com/{s}/{a}"}
    r = c.by_id.get(alt["id"])
    if not r:
        return None
    from .matching import HadithHit
    hit = HadithHit(r["id"], 1.0, r, summarize(r["grades"], r.get("implicit")).to_dict())
    d = hit.to_dict(lang if lang != "ara" else "eng")
    d["type"] = "hadith"
    if alt.get("quote_ar"):
        d["snippet"] = _snippet(r["ar"], alt["quote_ar"])
        d["quote_ar"], d["quote_en"] = alt["quote_ar"], alt.get("quote_en")
    return d


def _from_registry(c: Corpus, seg: Segment, lang: str, entry: dict, score: float) -> Verdict:
    status = entry["status"]
    v = Verdict(
        quote=seg.text, language=lang, kind="registry", status=status,
        confidence="high" if score >= 0.93 else "medium",
        explanation_ar=entry["verdict_ar"], explanation_en=entry["verdict_en"],
        registry={"id": entry["id"], "text_ar": entry["text_ar"], "sources": entry["sources"],
                  "meaning": entry.get("meaning"), "review": entry.get("review", {}), "score": round(score, 3)},
        via=seg.via,
    )
    v.alternatives = [a for a in (_alternative(c, x, lang) for x in entry.get("alternatives", [])) if a]
    from . import flags as _store
    decision = _store.decisions().get(entry["id"])
    if decision and decision.get("decision") == "approved":
        v.registry["review"] = {"status": "approved", "reviewer": decision["reviewer"], "at": decision.get("created_at")}
        v.notes.append("registry_reviewed")
    else:
        v.notes.append("registry_pending_review")
    return v


def _aggregate(strong: list) -> tuple[str, list[str]]:
    """Combine the grades of all strong matches (different routes of one wording)."""
    notes = []
    graded = [h for h in strong if h.grade["status"] != "ungraded"]
    if not graded:
        return "needs_review", ["only_ungraded_compilations"]
    marfu_ok = [h for h in graded if h.grade["status"] == "authentic" and h.grade["attribution"] in ("marfu", "mixed")]
    if marfu_ok:
        if any(h.grade["status"] in ("weak", "disputed", "fabricated") for h in graded):
            notes.append("other_routes_weaker")
        return "authentic", notes
    if any(h.grade["status"] == "authentic" for h in graded):
        return "authentic_mawquf", notes
    if any(h.grade["status"] == "disputed" for h in graded):
        return "disputed", notes
    if all(h.grade["status"] == "fabricated" for h in graded):
        return "fabricated", notes
    return "weak", notes


_EXPLAIN = {
    "authentic": ("ورد هذا النص في المصادر المفهرسة بإسناد حكم عليه المحققون بالقبول.",
                  "This text appears in the indexed sources with a chain graded acceptable."),
    "authentic_mawquf": ("النص ثابت، لكنه من كلام صحابي أو تابعي، فلا يصح نسبته إلى النبي ﷺ.",
                         "The text is sound, but it is the statement of a Companion or Successor — do not attribute it to the Prophet ﷺ."),
    "weak": ("ورد النص بإسناد ضعّفه المحققون؛ فلا يُنسب إلى النبي ﷺ على وجه الجزم.",
             "The text appears only with chains graded weak; do not attribute it to the Prophet ﷺ with certainty."),
    "fabricated": ("حكم المحققون على هذه الرواية بالوضع أو البطلان.", "Graders judged this narration fabricated or baseless."),
    "disputed": ("اختلف المحققون في الحكم على هذه الرواية؛ تُعرض أحكامهم كما هي، ويُحال الترجيح إلى مختص.",
                 "Graders disagree on this narration; their verdicts are shown as-is and the final judgement is referred to a specialist."),
    "needs_review": ("وجدنا نصًا مشابهًا لكن بلفظ مختلف؛ قد يكون النص المتداول رواية بالمعنى أو مُحرّفًا. لا نصدر حكمًا قبل مراجعة مختص.",
                     "We found a similar text with different wording. The circulating text may be a paraphrase or a distortion. We do not issue a verdict without specialist review."),
    "not_found": ("لم نعثر على هذا النص في المصادر المفهرسة (القرآن الكريم وتسعة كتب حديثية). عدم العثور لا يعني أنه موضوع؛ لكن لا ينبغي نسبته إلى النبي ﷺ حتى يُعرف مصدره.",
                  "We did not find this text in the indexed sources (the Quran and nine hadith collections). Not finding it does not prove it is fabricated — but it should not be attributed to the Prophet ﷺ until its source is known."),
}


def verify_segment(c: Corpus, seg: Segment) -> Verdict:
    lang = detect_lang(seg.text)

    q = match_quran(c, seg.text) if lang == "ara" else None
    hres = match_hadith(c, seg.text, lang)
    reg = match_registry(seg.text)
    # The curated register wins ties (it carries nuance the dataset lacks), but a
    # clearly better match to a real narration must not be overridden by it:
    # "Cleanliness is half of faith" is Muslim 223, not the baseless "…part of faith".
    if reg and not (hres.best and hres.best.score > reg[1] + 0.03):
        return _from_registry(c, seg, lang, *reg)
    via = seg.via
    # LLM back-translation for languages we cannot search directly.
    if (not hres.best or hres.best.score < (LATIN_STRONG if lang != "ara" else HADITH_STRONG)) and seg.search_ar:
        reg2 = match_registry(seg.search_ar)
        if reg2:
            v = _from_registry(c, seg, lang, *reg2)
            v.confidence, v.via = "medium", "llm_translation"
            return v
        alt = match_hadith(c, seg.search_ar, "ara")
        if alt.best and (not hres.best or alt.best.score > hres.best.score):
            hres, via = alt, "llm_translation"
        if q is None:
            q = match_quran(c, seg.search_ar)

    strong_thr, cand_thr = (HADITH_STRONG, HADITH_CANDIDATE) if hres.lang == "ara" else (LATIN_STRONG, LATIN_CANDIDATE)
    best = hres.best

    if q and q.status == "quran_exact":
        use_quran = not best or q.score >= best.score - 0.02 or seg.hint == "quran"
    elif q:  # a misquoted verse must beat the hadith match to be reported as such
        use_quran = not best or q.score >= best.score - 0.03 or (seg.hint == "quran" and best.score < strong_thr)
    else:
        use_quran = False
    if use_quran:
        qd = q.to_dict()
        v = Verdict(seg.text, lang, "quran", q.status, "high" if q.status == "quran_exact" else "medium",
                    "", "", quran=qd, via=via)
        if q.status == "quran_exact":
            v.explanation_ar = f"نص قرآني مطابق: {qd['citation_ar']}."
            v.explanation_en = f"Exact Quran text: {qd['citation_en']}."
        else:
            v.explanation_ar = f"الآية موجودة ({qd['citation_ar']}) لكنها نُقلت بلفظ مختلف في {q.changed_words} كلمة؛ انظر التصحيح."
            v.explanation_en = f"The verse exists ({qd['citation_en']}) but was quoted with {q.changed_words} word(s) different; see the correction."
            if seg.hint == "hadith":
                v.notes.append("quran_attributed_as_hadith")
        # Repeated verses / phrases: say how many places, never pick one silently.
        n = qd.get("occurrence_count", 0)
        if n > 1:
            v.notes.append("quran_repeated")
            first = qd["occurrences"][0]
            places = "موضعين" if n == 2 else f"{n} مواضع" if n <= 10 else f"{n} موضعًا"
            v.explanation_ar += f" وردت هذه الكلمات بلفظها في {places} من القرآن الكريم، أولها {first['citation_ar']}."
            v.explanation_en += f" These exact words occur in {n} places in the Quran, the first being {first['citation_en']}."
        # Near-identical verses (mutashabihat): show them so two similar verses are not confused.
        if qd.get("similar"):
            v.notes.append("quran_similar_verses")
            if q.status == "quran_variant":
                v.explanation_ar += " وفي القرآن آيات متشابهة بلفظ قريب؛ قد يكون النص خلطًا بين آيتين، فانظر الآيات المتشابهة."
                v.explanation_en += " The Quran has similar verses with close wording; the quote may mix two of them — see the similar verses."
            else:
                v.explanation_ar += " وفي القرآن آيات متشابهة بلفظ قريب، فتأكد من الموضع المقصود."
                v.explanation_en += " The Quran also has similar verses with close wording; check which place is meant."
        v.evidence = [{"type": "quran", "ref": q.ref, "text": q.text_uthmani,
                       "citation_ar": qd["citation_ar"], "citation_en": qd["citation_en"],
                       "source_url": f"https://quran.com/{q.surah}/{q.ayah_from}" + (f"-{q.ayah_to}" if q.ayah_to != q.ayah_from else "")}]
        return v

    if best and best.score >= strong_thr:
        strong = [h for h in hres.hits if h.score >= max(strong_thr, best.score - 0.04)]
        status, notes = _aggregate(strong)
        conf = "high" if hres.lang == "ara" and best.score >= 0.95 else "medium"
        if via == "llm_translation":
            conf = "medium"
        v = Verdict(seg.text, lang, "hadith", status, conf, *_EXPLAIN[status], via=via, notes=notes)
        v.evidence = _hadith_evidence(c, strong[:4], seg.search_ar if via == "llm_translation" else seg.text, hres.lang)
        if v.evidence and v.evidence[0].get("changed_words"):
            v.notes.append("wording_differs")
        if seg.hint == "quran":
            v.notes.append("hadith_attributed_as_quran")
        return v

    if best and best.score >= cand_thr:
        v = Verdict(seg.text, lang, "hadith", "needs_review", "low", *_EXPLAIN["needs_review"], via=via)
        v.evidence = _hadith_evidence(c, [h for h in hres.hits if h.score >= cand_thr][:3], seg.text, hres.lang)
        return v

    v = Verdict(seg.text, lang, "none", "not_found", "low", *_EXPLAIN["not_found"], via=via)
    return v


def verify_text(text: str, use_llm: bool = True) -> dict:
    c = get_corpus()
    segs = segment(text)
    llm_used = False
    if use_llm and llm.available():
        extracted = llm.extract_quotes(text)
        if extracted is not None:
            llm_used = True
            segs = merge_llm_segments(segs, extracted)
    verdicts = []
    for s in segs:
        v = verify_segment(c, s)
        # A question that matches nothing is a question, not a missing quote.
        if s.is_question and v.status in ("not_found", "needs_review"):
            continue
        verdicts.append(v)
    verdicts = _drop_redundant(verdicts) if verdicts else []
    flags = []
    if _FORWARD_PRESSURE.search(text):
        flags.append("forward_pressure")
    note = scope.classify(text)
    if note and note["kind"] == "question" and verdicts:
        note = None  # it contained verifiable quotes after all
    return {
        "input_chars": len(text),
        "llm_used": llm_used,
        "flags": flags,
        "scope": note,
        "transparency_ar": "نتيجة آلية من أداة مدعومة بالذكاء الاصطناعي تعتمد على مصادر موثقة، وليست فتوى ولا رأي مختص بشري.",
        "transparency_en": "Automated result from an AI-assisted tool grounded in documented sources; not a fatwa or a human specialist's opinion.",
        "results": [v.to_dict() for v in verdicts],
        "summary": summarize_results(verdicts),
    }


def merge_llm_segments(heur: list[Segment], extracted: list[dict]) -> list[Segment]:
    segs = []
    for e in extracted:
        t = _clean(e.get("quote", ""))
        if len(t.split()) < 2:
            continue
        hint = e.get("kind") if e.get("kind") in ("quran", "hadith") else "none"
        segs.append(Segment(t, hint, "llm", e.get("arabic_search") or None))
    # Keep heuristic segments the model did not cover, so the LLM can only add recall.
    covered = " ".join(normalize_any_key(s.text) for s in segs)
    for s in heur:
        if normalize_any_key(s.text) not in covered:
            segs.append(s)
    return segs[:MAX_SEGMENTS]


def normalize_any_key(t: str) -> str:
    return normalize_ar(t) if is_arabic(t) else normalize_latin(t)


def _key(v: Verdict) -> str | None:
    if v.registry:
        return "reg:" + v.registry["id"]
    if v.quran:
        return "q:" + v.quran["ref"]
    if v.evidence:
        return "h:" + str(v.evidence[0].get("id"))
    return None


def _drop_redundant(vs: list[Verdict]) -> list[Verdict]:
    """Drop not_found sub-parts of a positive segment, and repeats of the same finding."""
    positive = [v for v in vs if v.status != "not_found"]
    out, seen = [], set()
    for v in vs:
        k = _key(v)
        if k and k in seen:
            continue
        if k:
            seen.add(k)
        if v.status == "not_found" and any(normalize_any_key(v.quote) in normalize_any_key(p.quote) or
                                          normalize_any_key(p.quote) in normalize_any_key(v.quote) for p in positive):
            continue
        out.append(v)
    return out or vs


def summarize_results(vs: list[Verdict]) -> dict:
    worst = max((STATUS[v.status][0] for v in vs), default=0)  # severity
    counts: dict[str, int] = {}
    for v in vs:
        counts[v.status] = counts.get(v.status, 0) + 1
    safe = all(v.status in ("quran_exact", "authentic", "authentic_by_routes") for v in vs) and bool(vs)
    return {"count": len(vs), "by_status": counts, "worst_severity": worst, "safe_to_share": safe}
