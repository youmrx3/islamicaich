"""Map free-text hadith grades from the dataset to a small, explainable taxonomy.

The dataset carries up to four graders per hadith (e.g. Al-Albani, Zubair Ali Zai,
Shuaib Al-Arnaut, Ahmad Shakir) with ~1,700 distinct label spellings. We classify
each label with transparent keyword rules and keep the original label so the user
always sees exactly what each named scholar said.
"""
from __future__ import annotations

from dataclasses import dataclass

AUTHENTIC, WEAK, FABRICATED, UNKNOWN = "authentic", "weak", "fabricated", "unknown"

GRADER_AR = {
    "Al-Albani": "الألباني",
    "Zubair Ali Zai": "زبير علي زئي",
    "Shuaib Al Arnaut": "شعيب الأرناؤوط",
    "Abu Ghuddah": "عبد الفتاح أبو غدة",
    "Muhammad Muhyi Al-Din Abdul Hamid": "محمد محيي الدين عبد الحميد",
    "Muhammad Fouad Abd al-Baqi": "محمد فؤاد عبد الباقي",
    "Ahmad Muhammad Shakir": "أحمد شاكر",
    "Bashar Awad Maarouf": "بشار عواد معروف",
    "Salim al-Hilali": "سليم الهلالي",
}

CATEGORY_AR = {
    AUTHENTIC: "مقبول (صحيح/حسن)",
    WEAK: "ضعيف",
    FABRICATED: "موضوع/باطل",
    UNKNOWN: "غير محدد",
}


@dataclass
class Grade:
    grader: str
    grader_ar: str
    label: str
    category: str
    attribution: str  # marfu (Prophet) | mawquf (Companion) | maqtu (Successor)
    chain_only: bool  # grade speaks about the chain ("Isnaad Sahih") not the text

    def to_dict(self) -> dict:
        return self.__dict__.copy()


def classify_label(label: str) -> tuple[str, str, bool]:
    l = label.lower().replace("'", "").strip()
    attribution = "marfu"
    if "mauquf" in l or "muquf" in l or "mawquf" in l:
        attribution = "mawquf"
    elif "maqtu" in l:
        attribution = "maqtu"
    chain_only = ("isnaad" in l or "isnad" in l or "sanad" in l) and "hadith" not in l
    if "mawdu" in l or "batil" in l or "fabricat" in l or "maudu" in l:
        return FABRICATED, attribution, chain_only
    if "daif" in l or "da'if" in l or "munkar" in l or "shadh" in l or "weak" in l or "mursal" in l:
        return WEAK, attribution, chain_only
    if "sahih" in l or "hasan" in l or "mutawatir" in l or "agreed" in l:
        return AUTHENTIC, attribution, chain_only
    return UNKNOWN, attribution, chain_only


def parse_grades(raw: list[dict]) -> list[Grade]:
    out = []
    for g in raw or []:
        label = (g.get("grade") or "").strip()
        if not label or label == "-":
            continue
        name = g.get("name", "").strip()
        cat, attr, chain_only = classify_label(label)
        out.append(Grade(name, GRADER_AR.get(name, name), label, cat, attr, chain_only))
    return out


@dataclass
class GradeSummary:
    status: str  # authentic | weak | fabricated | disputed | ungraded
    attribution: str  # marfu | mawquf | maqtu | mixed
    basis: str  # sahihayn | graders | none
    grades: list[Grade]
    note_ar: str
    note_en: str

    def to_dict(self) -> dict:
        d = self.__dict__.copy()
        d["grades"] = [g.to_dict() for g in self.grades]
        return d


def summarize(raw_grades: list[dict], implicit: str | None) -> GradeSummary:
    grades = parse_grades(raw_grades)
    known = [g for g in grades if g.category != UNKNOWN]
    attrs = {g.attribution for g in known}
    attribution = attrs.pop() if len(attrs) == 1 else ("mixed" if attrs else "marfu")

    if implicit == "sahihayn" and not known:
        return GradeSummary(
            "authentic", "marfu", "sahihayn", grades,
            "مخرّج في أحد الصحيحين، وقد تلقت الأمة أحاديثهما المسندة بالقبول.",
            "Narrated in one of the two Sahih collections, whose connected reports are accepted by scholarly consensus.",
        )
    if not known:
        return GradeSummary(
            "ungraded", attribution, "none", grades,
            "لا يتوفر حكم على هذه الرواية في البيانات المفهرسة؛ تحتاج إلى مراجعة مختص.",
            "No grading is available for this narration in the indexed data; it needs specialist review.",
        )
    cats = {g.category for g in known}
    names_ar = "، ".join(sorted({g.grader_ar for g in known}))
    if cats == {AUTHENTIC}:
        status = "authentic"
        note_ar = f"حكم عليه بالقبول: {names_ar}."
        note_en = "Graded acceptable (sahih/hasan) by all listed graders."
    elif cats == {WEAK}:
        status = "weak"
        note_ar = f"ضعّفه: {names_ar}."
        note_en = "Graded weak by all listed graders."
    elif cats == {FABRICATED} or (FABRICATED in cats and AUTHENTIC not in cats):
        status = "fabricated"
        note_ar = f"حُكم عليه بالوضع أو البطلان أو الضعف الشديد: {names_ar}."
        note_en = "Graded fabricated/baseless (or severely weak) by the listed graders."
    else:
        status = "disputed"
        note_ar = "اختلف المحققون في الحكم عليه؛ تُعرض الأحكام كما هي، ويُحال إلى مختص للترجيح."
        note_en = "Graders disagree; all verdicts are shown as-is and the case is referred to a specialist."
    if attribution in ("mawquf", "maqtu") and status == "authentic":
        who = "صحابي" if attribution == "mawquf" else "تابعي"
        note_ar += f" تنبيه: هو من كلام {who} وليس من كلام النبي ﷺ."
        note_en += f" Note: these are the words of a {'Companion' if attribution == 'mawquf' else 'Successor'}, not the Prophet ﷺ."
    return GradeSummary(status, attribution, "graders", grades, note_ar, note_en)
