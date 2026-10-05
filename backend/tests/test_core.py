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


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """API client whose report/decision store is an isolated temp folder (never Supabase)."""
    from fastapi.testclient import TestClient
    from app import flags
    from app.main import app
    for k in ("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setattr(flags, "_file", lambda name: tmp_path / f"{name}.jsonl")
    flags._cache.clear()
    yield TestClient(app)
    flags._cache.clear()


def test_daily_hadith_is_authentic_and_quoted_from_source(client):
    from app.normalize import normalize_ar
    seen = set()
    for day in range(18):
        d = client.get("/api/daily", params={"day": day}).json()
        assert d["grade"]["status"] == "authentic"
        rec = get_corpus().by_id[d["id"]]
        assert normalize_ar(d["text"]) in normalize_ar(rec["ar"])  # shown from the record, never retyped
        assert d["citation_ar"] and d["source_url"].startswith("http")
        seen.add(d["id"])
    assert len(seen) == 18  # every curated entry resolves to a real record


def test_verse_results_carry_recitation_audio(client):
    r = client.post("/api/verify", json={"text": "قال تعالى: «وقل ربي زدني علما»"}).json()
    q = r["results"][0]["quran"]
    assert r["results"][0]["status"] == "quran_variant"
    assert q["audio"] and all(a.startswith("https://everyayah.com/") for a in q["audio"])
    assert q["audio"][0].endswith("020114.mp3")


def test_review_requires_token_and_records_named_decision(client, monkeypatch):
    monkeypatch.setenv("REVIEW_TOKEN", "t0k")
    body = {"entry_id": "R001", "decision": "approved", "reviewer": "Test Reviewer", "note": "ok"}
    assert client.post("/api/review", json=body).status_code == 401
    assert client.post("/api/review", json=body, headers={"x-review-token": "bad"}).status_code == 401
    assert client.post("/api/review", json={**body, "entry_id": "R999"}, headers={"x-review-token": "t0k"}).status_code == 404
    assert client.post("/api/review", json={**body, "decision": "maybe"}, headers={"x-review-token": "t0k"}).status_code == 422
    assert client.post("/api/review", json=body, headers={"x-review-token": "t0k"}).status_code == 200
    e = next(e for e in client.get("/api/registry").json()["entries"] if e["id"] == "R001")
    assert e["review"]["status"] == "approved" and e["review"]["reviewer"] == "Test Reviewer"


def test_flags_are_write_only_for_the_public(client, monkeypatch):
    monkeypatch.setenv("REVIEW_TOKEN", "t0k")
    ok = client.post("/api/flag", json={"kind": "request_review", "quote": "نص للاختبار", "status": "not_found"})
    assert ok.status_code == 200
    assert client.post("/api/flag", json={"kind": "spam", "quote": "x", "status": "x"}).status_code == 422
    assert client.get("/api/flags").status_code == 401
    got = client.get("/api/flags", headers={"x-review-token": "t0k"}).json()["flags"]
    assert any(f["quote"] == "نص للاختبار" for f in got)


def test_pressure_line_is_removed_but_claim_is_kept():
    segs = segment("قال رسول الله ﷺ: «إنما الأعمال بالنيات» انشرها ولك الأجر، أمانة في رقبتك")
    texts = [s.text for s in segs]
    assert any("إنما الأعمال بالنيات" in t for t in texts)
    assert not any("أمانة في رقبتك" in t for t in texts)


def test_reviewer_accounts_apply_approve_sign_revoke(client, monkeypatch):
    monkeypatch.setenv("REVIEW_TOKEN", "admin-pass")
    admin = {"x-review-token": "admin-pass"}
    app_ = {"name": "د. مراجع تجريبي", "email": "rev@example.org", "title": "دكتوراه في الحديث وعلومه",
            "affiliation": "جامعة تجريبية", "profile_url": "", "note": ""}
    assert client.post("/api/reviewers/apply", json={**app_, "email": "not-an-email"}).status_code == 422
    assert client.post("/api/reviewers/apply", json={**app_, "website": "spam"}).status_code == 422  # honeypot
    assert client.post("/api/reviewers/apply", json=app_).status_code == 200

    # only the admin sees and manages applications; the public never sees emails
    assert client.get("/api/reviewers").status_code == 401
    rows = client.get("/api/reviewers", headers=admin).json()["reviewers"]
    acc = next(r for r in rows if r["email"] == "rev@example.org")
    assert acc["status"] == "pending" and "token_hash" not in acc

    # a pending applicant cannot sign in
    code = client.post(f"/api/reviewers/{acc['id']}", json={"action": "approve"}, headers=admin).json()["code"]
    assert code.startswith("THB-")
    me = client.get("/api/me", headers={"x-review-token": code}).json()
    assert me["role"] == "reviewer" and me["name"] == app_["name"]

    # a reviewer cannot manage accounts, and decisions are signed with the verified name
    assert client.get("/api/reviewers", headers={"x-review-token": code}).status_code == 403
    r = client.post("/api/review", json={"entry_id": "R002", "decision": "approved", "reviewer": "Someone Else"},
                    headers={"x-review-token": code})
    assert r.status_code == 200 and r.json()["reviewer"] == app_["name"]
    e = next(e for e in client.get("/api/registry").json()["entries"] if e["id"] == "R002")
    assert e["review"]["reviewer"] == app_["name"]

    # re-issuing a code disables the old one; revoking disables the account
    code2 = client.post(f"/api/reviewers/{acc['id']}", json={"action": "approve"}, headers=admin).json()["code"]
    assert client.get("/api/me", headers={"x-review-token": code}).status_code == 401
    assert client.post(f"/api/reviewers/{acc['id']}", json={"action": "revoke"}, headers=admin).status_code == 200
    assert client.get("/api/me", headers={"x-review-token": code2}).status_code == 401


def test_admin_must_sign_decisions_with_a_name(client, monkeypatch):
    monkeypatch.setenv("REVIEW_TOKEN", "admin-pass")
    r = client.post("/api/review", json={"entry_id": "R001", "decision": "approved"}, headers={"x-review-token": "admin-pass"})
    assert r.status_code == 422
