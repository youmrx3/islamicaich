"""Fast regression tests for the safety-critical behaviour. Run: pytest backend/tests -q"""
import os

os.environ["THABAT_LLM"] = "off"

import pytest

from app.corpus import get_corpus
from app.normalize import extract_matn, normalize_ar
from app.replies import build_reply
from app.verify import load_registry, segment, verify_text


@pytest.fixture(scope="session")
def corpus():
    return get_corpus()


def status_of(text):
    r = verify_text(text, use_llm=False)
    return [v["status"] for v in r["results"]], r


def test_normalization_is_orthography_insensitive():
    assert normalize_ar("إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ") == normalize_ar("انما الاعمال بالنيات")
    assert normalize_ar("الصلاة") == normalize_ar("الصلاه")
    assert "صلى" not in normalize_ar("قال رسول الله صلى الله عليه وسلم الدين النصيحة")


def test_matn_extraction_drops_isnad():
    n = normalize_ar("حدثنا فلان عن فلان قال قال رسول الله صلى الله عليه وسلم الدين النصيحة")
    assert extract_matn(n).startswith("الدين النصيحه")


def test_registry_references_resolve(corpus):
    for e in load_registry()["entries"]:
        for a in e["alternatives"]:
            if a["type"] == "hadith":
                assert a["id"] in corpus.by_id, (e["id"], a["id"])
            else:
                assert a["ref"] in corpus.quran_pos, (e["id"], a["ref"])
        assert e["review"]["status"] in ("draft", "approved")


def test_exact_verse(corpus):
    s, r = status_of("قال تعالى: وما خلقت الجن والإنس إلا ليعبدون")
    assert s == ["quran_exact"] and r["results"][0]["quran"]["ref"] == "51:56"


def test_misquoted_verse_is_flagged_with_diff(corpus):
    s, r = status_of("قال تعالى: إن الله مع الصابرين إذا صبروا")
    assert s == ["quran_variant"]
    assert any(op["op"] == "extra" for op in r["results"][0]["quran"]["diff"])


def test_authentic_hadith(corpus):
    s, r = status_of("قال رسول الله ﷺ: إنما الأعمال بالنيات")
    assert s == ["authentic"]
    assert r["results"][0]["evidence"][0]["source_url"].startswith("https://sunnah.com/")


def test_fabricated_never_authentic(corpus):
    s, r = status_of("قال رسول الله ﷺ: «اطلبوا العلم ولو بالصين» انشرها أمانة في رقبتك")
    assert s == ["fabricated"] and "forward_pressure" in r["flags"]
    assert r["results"][0]["alternatives"], "a fabricated saying should come with an authentic alternative"


def test_authentic_rendering_not_confused_with_baseless_one(corpus):
    assert status_of("Cleanliness is half of faith")[0] == ["authentic"]
    assert status_of("Cleanliness is part of faith")[0] == ["baseless"]


def test_unknown_text_abstains(corpus):
    s, r = status_of("قال رسول الله ﷺ: من قرأ آية الكرسي عشر مرات عند شرب القهوة حفظه الله من العين")
    assert s[0] in ("not_found", "needs_review")
    assert r["results"][0]["refer_to_specialist"] is True


def test_phrase_grade_differs_from_full_narration(corpus):
    s, r = status_of("طلب العلم فريضة على كل مسلم")
    assert s == ["authentic_by_routes"]


def test_segmentation_handles_nested_lead_ins():
    segs = segment("عن أبي هريرة قال: قال رسول الله ﷺ: الدين النصيحة")
    assert [x.text for x in segs] == ["الدين النصيحة"]
    assert segment("الذين إذا أصابتهم مصيبة قالوا إنا لله وإنا إليه راجعون")[0].text.startswith("الذين")


def test_reply_mentions_source_and_alternative(corpus):
    _, r = status_of("The Prophet said: Paradise lies under the feet of mothers")
    reply = build_reply(r, "en")
    assert "Nasa'i 3104" in reply and "593" in reply


def test_deterministic(corpus):
    a = verify_text("قال رسول الله ﷺ: من تشبه بقوم فهو منهم", use_llm=False)
    b = verify_text("قال رسول الله ﷺ: من تشبه بقوم فهو منهم", use_llm=False)
    assert a["results"] == b["results"]


# ---- scientific annex behaviours

def test_personal_fatwa_request_is_referred_not_answered(corpus):
    r = verify_text("أنا أعيش في دولة أوروبية، هل يجوز لي أن أعقد زواجي في المحكمة فقط؟", use_llm=False)
    assert r["scope"]["kind"] == "fatwa" and r["scope"]["level"] == "د"
    assert r["results"] == [] and r["scope"]["referrals"]


def test_general_question_is_not_reported_as_missing_quote(corpus):
    r = verify_text("لماذا يعبد المسلمون الكعبة؟", use_llm=False)
    assert r["results"] == [] and r["scope"]["kind"] == "question"


def test_every_result_has_annex_level_and_transparency(corpus):
    r = verify_text("قال رسول الله ﷺ: إنما الأعمال بالنيات", use_llm=False)
    assert r["results"][0]["level"] in ("أ", "ب", "ج", "د")
    assert "ليست فتوى" in r["transparency_ar"]


def test_evidence_search_refuses_to_invent(corpus):
    from app.search import search_evidence
    assert search_evidence(corpus, "أعطني حديثا يثبت أن النظر إلى البحر يمحو الذنوب")["abstained"] is True
    found = search_evidence(corpus, "بر الوالدين")
    assert not found["abstained"]
    assert all(h["grade"]["status"] == "authentic" for h in found["hadith"])


def test_api_smoke():
    from fastapi.testclient import TestClient
    from app.main import app
    c = TestClient(app)
    assert c.get("/api/health").json()["ok"] is True
    r = c.post("/api/verify", json={"text": "قال تعالى: إن الله مع الصابرين إذا صبروا", "reply_lang": "en"})
    assert r.status_code == 200 and r.json()["results"][0]["status"] == "quran_variant"
    assert "Al-Anfal" in r.json()["reply"]
    assert c.get("/api/search", params={"q": "honesty"}).status_code == 200
