"""Gentle, ready-to-send replies for the group chat where the message was found.

Correcting someone in public is delicate. Templates follow three principles:
thank the sender's good intention, state the finding briefly with its source,
and offer an authentic alternative so the good intention still has an outlet.
Templates are deterministic (no LLM), so wording is reviewable in advance.
"""
from __future__ import annotations

LANGS = ("ar", "en", "fr", "id", "tr")

T = {
    "ar": {
        "open": "جزاك الله خيرًا على حرصك على نشر الخير 🌿",
        "fabricated": "تنبيه لطيف: عبارة «{q}» لا تثبت نسبتها إلى النبي ﷺ. {why}",
        "baseless": "تنبيه لطيف: عبارة «{q}» لا أصل لها حديثًا بهذا اللفظ. {why}",
        "weak": "تنبيه لطيف: «{q}» رُويت بإسناد ضعيف، فلا تُنسب إلى النبي ﷺ جزمًا. {why}",
        "disputed": "للفائدة: «{q}» مختلف في ثبوتها بين أهل الحديث، فالأحوط عدم الجزم بنسبتها حتى يُسأل أهل العلم.",
        "authentic_mawquf": "للفائدة: «{q}» ثابتة، لكنها من كلام أحد السلف وليست من كلام النبي ﷺ.",
        "quran_variant": "للفائدة: الآية وردت في المصحف بلفظ: ﴿{correct}﴾ [{ref}]{extra}، والأولى نقلها بلفظها.",
        "extra": "، وليس فيها «{x}»",
        "not_found": "للفائدة: لم أجد «{q}» في كتب الحديث المشهورة، فالأحوط عدم نسبتها إلى النبي ﷺ حتى يُعرف مصدرها.",
        "needs_review": "للفائدة: «{q}» يشبه حديثًا واردًا بلفظ آخر، فالأولى نقله بلفظه الثابت من مصدره.",
        "alt": "ومن الثابت الصحيح في هذا المعنى: «{text}» ({cite}).",
        "close": "قال ﷺ: «كفى بالمرء كذبًا أن يحدث بكل ما سمع» (سنن أبي داود 4992، صححه الألباني).",
        "ok": "جزاك الله خيرًا 🌿 تحققت منه: {items}.",
    },
    "en": {
        "open": "May Allah reward you for wanting to share good 🌿",
        "fabricated": "A gentle note: “{q}” is not authentically attributed to the Prophet ﷺ. {why}",
        "baseless": "A gentle note: “{q}” has no basis as a hadith with this wording. {why}",
        "weak": "A gentle note: “{q}” is reported only through a weak chain, so it shouldn't be attributed to the Prophet ﷺ with certainty. {why}",
        "disputed": "For benefit: scholars differ on whether “{q}” is authentic, so it's safer not to attribute it with certainty until a scholar is consulted.",
        "authentic_mawquf": "For benefit: “{q}” is sound, but these are the words of an early Muslim, not of the Prophet ﷺ.",
        "quran_variant": "For benefit: the verse reads ﴿{correct}﴾ [{ref}]{extra} — best to quote it exactly.",
        "extra": "; the words “{x}” are not part of it",
        "not_found": "For benefit: I couldn't find “{q}” in the major hadith collections, so it's safer not to attribute it to the Prophet ﷺ until its source is known.",
        "needs_review": "For benefit: “{q}” resembles a hadith reported with different wording — best to quote the established wording from its source.",
        "alt": "An authentic narration with this meaning: “{text}” ({cite}).",
        "close": "The Prophet ﷺ said: “It is enough of a lie for a person to relate everything he hears” (Abu Dawud 4992, graded sahih by al-Albani).",
        "ok": "JazakAllahu khayran 🌿 I checked it: {items}.",
    },
    "fr": {
        "open": "Qu'Allah te récompense pour ta volonté de partager le bien 🌿",
        "fabricated": "Petite remarque : « {q} » n'est pas authentiquement attribué au Prophète ﷺ. {why}",
        "baseless": "Petite remarque : « {q} » n'a pas d'origine comme hadith avec cette formulation. {why}",
        "weak": "Petite remarque : « {q} » n'est rapporté que par une chaîne faible ; on ne l'attribue pas au Prophète ﷺ avec certitude. {why}",
        "disputed": "Pour information : les savants divergent sur l'authenticité de « {q} » ; mieux vaut ne pas l'attribuer avec certitude.",
        "authentic_mawquf": "Pour information : « {q} » est authentique, mais ce sont les paroles d'un pieux prédécesseur, pas du Prophète ﷺ.",
        "quran_variant": "Pour information : le verset se lit ﴿{correct}﴾ [{ref}]{extra} — mieux vaut le citer exactement.",
        "extra": " ; « {x} » n'en fait pas partie",
        "not_found": "Pour information : je n'ai pas trouvé « {q} » dans les grands recueils de hadiths ; mieux vaut ne pas l'attribuer au Prophète ﷺ tant que sa source est inconnue.",
        "needs_review": "Pour information : « {q} » ressemble à un hadith rapporté avec une autre formulation — mieux vaut citer la formulation authentique.",
        "alt": "Une narration authentique sur ce sens : « {text} » ({cite}).",
        "close": "Le Prophète ﷺ a dit : « Il suffit comme mensonge à une personne de rapporter tout ce qu'elle entend » (Abu Dawud 4992).",
        "ok": "Qu'Allah te récompense 🌿 J'ai vérifié : {items}.",
    },
    "id": {
        "open": "Jazakallahu khairan atas semangatnya menyebarkan kebaikan 🌿",
        "fabricated": "Sekadar mengingatkan: “{q}” tidak sahih disandarkan kepada Nabi ﷺ. {why}",
        "baseless": "Sekadar mengingatkan: “{q}” tidak ada asalnya sebagai hadits dengan lafaz ini. {why}",
        "weak": "Sekadar mengingatkan: “{q}” hanya diriwayatkan dengan sanad lemah, jadi jangan dipastikan sebagai sabda Nabi ﷺ. {why}",
        "disputed": "Sebagai faedah: ulama berbeda pendapat tentang kesahihan “{q}”, jadi lebih hati-hati untuk tidak memastikannya.",
        "authentic_mawquf": "Sebagai faedah: “{q}” sahih, tetapi itu perkataan salaf, bukan sabda Nabi ﷺ.",
        "quran_variant": "Sebagai faedah: lafaz ayatnya ﴿{correct}﴾ [{ref}]{extra} — sebaiknya dikutip persis.",
        "extra": "; kata “{x}” bukan bagian dari ayat",
        "not_found": "Sebagai faedah: saya tidak menemukan “{q}” dalam kitab-kitab hadits utama, jadi lebih aman tidak disandarkan kepada Nabi ﷺ sampai sumbernya jelas.",
        "needs_review": "Sebagai faedah: “{q}” mirip dengan hadits yang diriwayatkan dengan lafaz lain — sebaiknya kutip lafaz yang sahih.",
        "alt": "Hadits sahih yang semakna: “{text}” ({cite}).",
        "close": "Nabi ﷺ bersabda: “Cukuplah seseorang dikatakan pendusta jika ia menceritakan semua yang ia dengar” (Abu Dawud 4992).",
        "ok": "Jazakallahu khairan 🌿 Sudah saya cek: {items}.",
    },
    "tr": {
        "open": "Hayrı paylaşma gayretin için Allah razı olsun 🌿",
        "fabricated": "Nazik bir hatırlatma: “{q}” sözünün Peygamber ﷺ'e nispeti sahih değildir. {why}",
        "baseless": "Nazik bir hatırlatma: “{q}” bu lafızla hadis olarak aslı yoktur. {why}",
        "weak": "Nazik bir hatırlatma: “{q}” yalnızca zayıf bir senedle rivayet edilmiştir; kesin olarak Peygamber ﷺ'e nispet edilmemelidir. {why}",
        "disputed": "Bilgi için: “{q}” sözünün sıhhati konusunda âlimler ihtilaf etmiştir; kesin nispet etmemek daha ihtiyatlıdır.",
        "authentic_mawquf": "Bilgi için: “{q}” sahihtir, ancak Peygamber ﷺ'in değil, selef âlimlerinden birinin sözüdür.",
        "quran_variant": "Bilgi için: ayetin lafzı ﴿{correct}﴾ [{ref}] şeklindedir{extra} — aynen nakletmek evladır.",
        "extra": "; “{x}” ifadesi ayette yoktur",
        "not_found": "Bilgi için: “{q}” sözünü temel hadis kaynaklarında bulamadım; kaynağı bilinene kadar Peygamber ﷺ'e nispet etmemek daha güvenlidir.",
        "needs_review": "Bilgi için: “{q}” başka lafızla rivayet edilen bir hadise benziyor — sahih lafzıyla nakletmek evladır.",
        "alt": "Bu manada sahih bir rivayet: “{text}” ({cite}).",
        "close": "Peygamber ﷺ buyurdu: “Kişiye yalan olarak, her duyduğunu anlatması yeter” (Ebu Davud 4992).",
        "ok": "Allah razı olsun 🌿 Kontrol ettim: {items}.",
    },
}

_OK_ITEM = {
    "ar": {"quran_exact": "آية مطابقة ({ref})", "authentic": "حديث ثابت ({cite})", "authentic_by_routes": "ثابت بمجموع طرقه"},
    "en": {"quran_exact": "exact verse ({ref})", "authentic": "authentic hadith ({cite})", "authentic_by_routes": "authentic via combined routes"},
    "fr": {"quran_exact": "verset exact ({ref})", "authentic": "hadith authentique ({cite})", "authentic_by_routes": "authentique par l'ensemble des chaînes"},
    "id": {"quran_exact": "ayat sesuai ({ref})", "authentic": "hadits sahih ({cite})", "authentic_by_routes": "sahih dengan gabungan jalur"},
    "tr": {"quran_exact": "ayet doğru ({ref})", "authentic": "sahih hadis ({cite})", "authentic_by_routes": "tüm tarikleriyle sahih"},
}

_CITE_KEY = {"ar": "citation_ar"}


def _short(text: str, n: int = 140) -> str:
    text = " ".join(text.split())
    return text if len(text) <= n else text[: n - 1].rsplit(" ", 1)[0] + "…"


def _alt_text(alt: dict, lang: str) -> str:
    if alt.get("type") == "quran":
        return f"﴿{_short(alt['text'], 160)}﴾"
    if lang == "ar":
        snippet = alt.get("snippet", {}).get("match") or _matn_hint(alt.get("ar", ""))
        return _short(snippet, 160)
    if lang == "en" and alt.get("quote_en"):
        return alt["quote_en"]
    return _short(alt.get("translation") or alt.get("ar", ""), 200)


def _matn_hint(ar: str) -> str:
    # Show the Prophet's words, not the chain of narrators.
    for mark in ("صلى الله عليه وسلم", "ﷺ"):
        i = ar.find(mark)
        if i != -1:
            return ar[i + len(mark):].strip(" :«\"‏.")
    return ar


def build_reply(result: dict, lang: str = "ar") -> str:
    lang = lang if lang in LANGS else "en"
    t = T[lang]
    cite_key = _CITE_KEY.get(lang, "citation_en")
    items = result.get("results", [])
    problems = [v for v in items if v["status"] not in ("quran_exact", "authentic", "authentic_by_routes")]
    if not items:
        return ""
    if not problems:
        oks = []
        for v in items:
            ev = (v.get("evidence") or [{}])[0]
            oks.append(_OK_ITEM[lang].get(v["status"], "").format(ref=ev.get("ref", ""), cite=ev.get(cite_key, "")))
        return t["ok"].format(items="، ".join(oks) if lang == "ar" else "; ".join(oks))
    lines = [t["open"]]
    for v in problems:
        q = _short(v["quote"], 90)
        why = ""
        if v.get("registry") and v["registry"].get("sources"):
            src = v["registry"]["sources"][0]
            why = f"({src['ar'] if lang == 'ar' else src['en']})"
        if v["status"] == "quran_variant" and v.get("quran"):
            correct = " ".join(op.get("text") or op.get("correct", "") for op in v["quran"]["diff"] if op["op"] != "extra")
            extras = " ".join(op["quoted"] for op in v["quran"]["diff"] if op["op"] in ("extra", "wrong"))
            ref = v["quran"].get("citation_ar" if lang == "ar" else "citation_en", v["quran"]["ref"])
            lines.append(t["quran_variant"].format(correct=_short(correct, 200), ref=ref,
                                                   extra=t["extra"].format(x=extras) if extras else ""))
        else:
            lines.append(t.get(v["status"], t["needs_review"]).format(q=q, why=why).strip())
        for alt in v.get("alternatives", [])[:1]:
            lines.append(t["alt"].format(text=_alt_text(alt, lang), cite=alt.get(cite_key) or alt.get("citation_en", "")))
    if any(v["status"] in ("fabricated", "baseless", "weak", "not_found") for v in problems):
        lines.append(t["close"])
    return "\n".join(lines)
