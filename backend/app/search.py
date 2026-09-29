"""Evidence finder: "give me an authentic hadith / verse about X".

The annex's test list includes "Give me a hadith that proves this — when no
authentic hadith exists in the package", with the expected behaviour: refuse
to fabricate, and state that no matching evidence was found. This module
returns only indexed texts (verses, and by default only hadith graded
acceptable), each with its source and grading, or abstains.
"""
from __future__ import annotations

from rapidfuzz import fuzz

from .corpus import Corpus, ar_tokens, latin_tokens
from .grades import summarize
from .matching import HadithHit, _ar_keys, _latin_key
from .normalize import is_arabic, normalize_ar, normalize_latin
from .surahs import cite_ar, cite_en

_AR_STOP_RAW = ("من في على إلى الى عن ما لا أن ان أو او ثم قد هو هي ذلك هذا هذه التي الذي كان قال كل مع عند إذا اذا لم لن به له لها "
                "بها فيه يا حديث أحاديث احاديث آية اية آيات ايات يثبت دليل أدلة أعطني اعطني أريد اريد عن صحيح صحيحا")
_AR_STOP = {t for w in _AR_STOP_RAW.split() for t in ar_tokens(normalize_ar(w))} | set(normalize_ar(_AR_STOP_RAW).split())
_LAT_STOP = set("the and of to in is a an for on with that this about from give me hadith verse quran prophet any some please want proof evidence says said".split())
MIN_COVERAGE = 0.75  # and every term when the topic has 3 terms or fewer


def _query_terms(q: str, arabic: bool) -> list[str]:
    if arabic:
        return [t for t in ar_tokens(normalize_ar(q)) if t not in _AR_STOP and len(t) > 1]
    return [t for t in latin_tokens(normalize_latin(q)) if t not in _LAT_STOP and len(t) > 2]


def _coverage(q_terms: list[str], doc_terms: set[str]) -> float:
    if not q_terms:
        return 0.0
    got = sum(1 for t in q_terms if t in doc_terms or (len(t) >= 5 and any(d.startswith(t) for d in doc_terms)))
    if len(q_terms) <= 3 and got < len(q_terms):
        return 0.0  # short topics must match every term
    return got / len(q_terms)


def _highlight_ar(text: str, q_terms: set[str], window: int = 28) -> list[dict]:
    words = text.split()
    norm = [ar_tokens(normalize_ar(w))[0] if normalize_ar(w) else "" for w in words]
    hits = [i for i, n in enumerate(norm) if n and (n in q_terms or any(n.startswith(t) for t in q_terms if len(t) >= 4))]
    if not hits:
        return [{"w": " ".join(words[:window]), "hit": False}]
    center = hits[len(hits) // 2]
    lo, hi = max(0, center - window // 2), min(len(words), center + window // 2)
    out = []
    if lo > 0:
        out.append({"w": "…", "hit": False})
    for i in range(lo, hi):
        out.append({"w": words[i], "hit": i in hits})
    if hi < len(words):
        out.append({"w": "…", "hit": False})
    return out


def _window(matn: str, q_terms: set[str], arabic: bool, pad: int = 6) -> str:
    """The words around the first matched term: used to recognise repeated narrations."""
    words = matn.split()
    toks = ar_tokens(matn) if arabic else words
    idx = next((i for i, t in enumerate(toks) if t in q_terms), 0)
    return " ".join(words[max(0, idx - pad): idx + pad + 1])


def search_evidence(c: Corpus, query: str, only_authentic: bool = True, k: int = 8) -> dict:
    arabic = is_arabic(query)
    q_terms = _query_terms(query, arabic)
    result = {"query": query, "terms": q_terms, "quran": [], "hadith": [], "abstained": False}
    if not q_terms:
        result["abstained"] = True
        result["message_ar"] = "اكتب كلمات الموضوع الذي تبحث عن دليل له (مثل: بر الوالدين، الصدق)."
        result["message_en"] = "Type the topic you need evidence for (e.g. honesty, kindness to parents)."
        return result
    qset = set(q_terms)

    if arabic:
        for pos, _ in c.idx_quran.search(" ".join(q_terms), k=40):
            v = c.quran[pos]
            cov = _coverage(q_terms, set(ar_tokens(v["norm"])))
            if cov >= MIN_COVERAGE:
                result["quran"].append({"ref": f"{v['surah']}:{v['ayah']}", "text": v["uthmani"], "coverage": round(cov, 2),
                                        "citation_ar": cite_ar(v["surah"], v["ayah"], v["ayah"]),
                                        "citation_en": cite_en(v["surah"], v["ayah"], v["ayah"]),
                                        "source_url": f"https://quran.com/{v['surah']}/{v['ayah']}"})
            if len(result["quran"]) >= 3:
                break
        cands = c.idx_hadith_ar.search(" ".join(q_terms), k=120)
    else:
        cands = []
        for idx in c.idx_hadith_tr.values():
            cands += idx.search(" ".join(q_terms), k=60)
        cands.sort(key=lambda x: -x[1])

    rows = []
    for pos, score in cands:
        r = c.hadith[pos]
        if arabic:
            _, matn = _ar_keys(r["ar"])
            doc_terms = set(ar_tokens(matn))
        else:
            matn = next((_latin_key(t) for t in r["tr"].values()), "")
            doc_terms = set().union(*(latin_tokens(_latin_key(t)) for t in r["tr"].values())) if r["tr"] else set()
        cov = _coverage(q_terms, doc_terms)
        if cov < MIN_COVERAGE:
            continue
        g = summarize(r["grades"], r.get("implicit")).to_dict()
        if only_authentic and not (g["status"] == "authentic" and g["attribution"] in ("marfu", "mixed")):
            continue
        rows.append((cov, score, pos, g, _window(matn, qset, arabic)))
    rows.sort(key=lambda x: (-x[0], -x[1]))
    # Group the same narration reported in several places (same words around the match).
    groups: list[list] = []
    for row in rows:
        for grp in groups:
            if fuzz.ratio(row[4], grp[0][4]) >= 70:
                grp.append(row)
                break
        else:
            groups.append([row])
        if len(groups) >= k and sum(len(g) for g in groups) > 4 * k:
            break
    for grp in groups[:k]:
        cov, score, pos, g, _ = grp[0]
        r = c.hadith[pos]
        d = HadithHit(r["id"], cov, r, g).to_dict("eng")
        d["also"] = [{"citation_ar": x["citation_ar"], "citation_en": x["citation_en"], "source_url": x["source_url"]}
                     for x in (HadithHit(c.hadith[o[2]]["id"], o[0], c.hadith[o[2]], o[3]).to_dict("eng") for o in grp[1:6])]
        d["coverage"] = round(cov, 2)
        d["highlight"] = _highlight_ar(r["ar"], qset) if arabic else None
        d["translations"] = r.get("tr", {})
        result["hadith"].append(d)

    if not result["hadith"] and not result["quran"]:
        result["abstained"] = True
        result["message_ar"] = ("لم نعثر على حديث ثابت ولا آية تطابق هذا الموضوع في المصادر المفهرسة. "
                                "لن نختلق دليلًا؛ راجع أهل العلم أو المصادر المعتمدة (الدرر السنية).")
        result["message_en"] = ("We found no authentic hadith or verse matching this topic in the indexed sources. "
                                "We will not invent evidence; please consult scholars or approved references (dorar.net).")
    return result
