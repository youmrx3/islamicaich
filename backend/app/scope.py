"""Scope guard: recognise what Thabat must NOT answer, per the scientific annex.

Thabat verifies the attribution of quoted texts. The annex (p.2 and p.5) forbids
independent fatwas and requires referral for personal cases (level د), and
restricted answers or referral for disputed rulings (level ج). Users still
paste such questions, so we detect them and answer with a referral instead of
treating the question as a "quote that was not found".
"""
from __future__ import annotations

import re

_PERSONAL_AR = re.compile(
    r"(\bأنا\b|\bانا\b|\bلي\b|\bعلي\b|عليّ|زوجي|زوجتي|أبي|أمي|ابني|بنتي|أخي|أختي|مالي|راتبي|عملي|بلدي|"
    r"هل\s+يجوز\s+لي|هل\s+أستطيع|هل\s+يلزمني|هل\s+تصح\s+صلاتي|هل\s+يصح\s+صومي|ماذا\s+أفعل|أفتوني|افتوني)")
_RULING_AR = re.compile(r"(هل\s+يجوز|هل\s+تجوز|ما\s+حكم|ما\s+الحكم|حكم\s+\S+\s*(في|؟)|هل\s+يحل|هل\s+يحرم|هل\s+هو\s+حرام|هل\s+هو\s+حلال|"
                        r"حلال\s+أم\s+حرام|حلال\s+ام\s+حرام|هل\s+يصح|هل\s+تصح|هل\s+يلزم|هل\s+يجب)")
_PERSONAL_EN = re.compile(r"\b(i|i'm|im|my|me|mine|myself)\b", re.I)
_RULING_EN = re.compile(r"\b(is it (halal|haram|permissible|allowed|forbidden|sinful)|can i|am i allowed|what is the ruling|"
                        r"ruling on|fatwa|is .{1,40} (halal|haram))\b|\best-ce (halal|haram|permis)|\bapakah .{0,30}(halal|haram|boleh)", re.I)
_QUESTION_START = re.compile(r"^\s*(لماذا|كيف|هل|why|how|what|pourquoi|comment|mengapa|apakah|neden|nasıl)\b", re.I)
_QUOTE_MARKERS = re.compile(r"(قال\s+رسول|قال\s+النبي|قال\s+تعالى|قال\s+الله|ﷺ|﴿|«|\"|“|the Prophet .{0,20}said|Allah says|hadith says)", re.I)

REFERRALS = [
    {"name_ar": "الرئاسة العامة للبحوث العلمية والإفتاء", "name_en": "General Presidency of Scholarly Research and Ifta",
     "url": "https://www.alifta.gov.sa", "for": "fatwa"},
    {"name_ar": "الموسوعة الفقهية — الدرر السنية", "name_en": "Fiqh encyclopedia — Dorar", "url": "https://dorar.net/feqhia", "for": "ruling"},
    {"name_ar": "بينات: أسئلة وأجوبة عن الإسلام", "name_en": "Bayyinat: questions and answers about Islam",
     "url": "https://dawa.center/file/7937", "for": "question"},
]


def classify(text: str) -> dict | None:
    """Return a scope note for the whole message, or None if it is ordinary quoted content."""
    t = text.strip()
    has_quote = bool(_QUOTE_MARKERS.search(t))
    ruling = bool(_RULING_AR.search(t) or _RULING_EN.search(t))
    personal = bool(_PERSONAL_AR.search(t) or (_RULING_EN.search(t) and _PERSONAL_EN.search(t)))
    question = t.endswith(("?", "؟")) or bool(_QUESTION_START.match(t))
    if ruling and personal:
        return {"kind": "fatwa", "level": "د", "level_latin": "D", "has_quote": has_quote,
                "message_ar": "يبدو سؤالك طلب فتوى في حالة شخصية. «ثَبَت» أداة تحقق آلية ولا تُصدر فتاوى؛ الحكم في الوقائع الشخصية يحتاج إلى مفتٍ مؤهل يعرف تفاصيلها. نحيلك إلى جهة إفتاء معتمدة.",
                "message_en": "This looks like a request for a personal fatwa. Thabat is an automated verification tool and does not issue rulings; personal cases need a qualified mufti who knows the details. Please refer to an official fatwa body.",
                "referrals": [r for r in REFERRALS if r["for"] in ("fatwa",)]}
    if ruling:
        return {"kind": "ruling", "level": "ج", "level_latin": "C", "has_quote": has_quote,
                "message_ar": "هذا سؤال عن حكم فقهي، وقد يكون فيه خلاف بين العلماء. «ثَبَت» يتحقق من نسبة النصوص ومصادرها ولا يرجّح في الأحكام؛ راجع مصدرًا فقهيًا معتمدًا أو أهل العلم.",
                "message_en": "This is a question about a legal ruling, where scholars may differ. Thabat verifies the attribution and sources of texts and does not weigh rulings; please consult an approved fiqh reference or a scholar.",
                "referrals": [r for r in REFERRALS if r["for"] in ("ruling", "fatwa")]}
    if question and not has_quote:
        return {"kind": "question", "level": "ب", "level_latin": "B", "has_quote": False,
                "message_ar": "«ثَبَت» مخصص للتحقق من الأحاديث والآيات المنقولة، وليس للإجابة عن الأسئلة العامة. للأسئلة الشائعة عن الإسلام نوصي بمرجع «بينات» المعتمد في الحزمة العلمية للتحدي.",
                "message_en": "Thabat is built to verify quoted hadith and verses, not to answer general questions. For common questions about Islam we recommend 'Bayyinat', the reference approved in the challenge's scientific package.",
                "referrals": [r for r in REFERRALS if r["for"] == "question"]}
    return None


def is_question_line(line: str) -> bool:
    """A line that is a question (not a quote) should not be verified as a quote."""
    t = line.strip()
    if _QUOTE_MARKERS.search(t):
        return False
    return t.endswith(("?", "؟")) or (bool(_QUESTION_START.match(t)) and len(t.split()) <= 25)
