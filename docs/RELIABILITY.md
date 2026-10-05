# Reliability, scientific safety and compliance with the scientific annex

Maps to the rubric items "Reliability plan" (acceptance, 20%) and "Reliability and scientific safety" (final, 15%), and to the challenge's scientific annex *المرجعية والحزمة العلمية والبيانات* (the "annex").

## 1. The annex's mandatory scientific standard (p.5), item by item

| Annex requirement | How Thabat meets it | Where |
|---|---|---|
| **Reliability & attribution**: every religious text or ruling shown is traceable to its source; nothing is attributed to a source that doesn't contain it; revealed text is distinguished from generated explanation; insufficient information is admitted | Every result shows the collection and number (or surah:ayah) with a link to a public copy and a dorar.net cross-check link. Sacred text is displayed verbatim in a distinct typeface; explanations are fixed templates labelled separately. `not_found` / `needs_review` admit insufficiency. | `verify.py`, `public/app.html` |
| **Definitive vs. ijtihad**: disputed matters are not presented as certain | `disputed` → level ج, each grader named; weak/fabricated gradings are attributed to the named scholars (level ب), not asserted by the tool | `grades.py`, `verify.py` |
| **No independent fatwa** | Scope guard: personal ruling requests → level د, no ruling, referral; ruling questions → level ج, referral | `scope.py` |
| **Hallucination resistance**: abstain, qualify or refer when references are missing or confidence is low | Nothing is generated as evidence. Below-threshold matches → abstain + refer. Evidence search refuses to invent ("no matching evidence found"). The optional LLM cannot introduce a source. | `verify.py`, `search.py`, `llm.py` |
| **Da'wah quality**: consider the addressee's background, level, language and context; clarity and good presentation | Replies begin by thanking the sender's intention, give the finding and source, offer an authentic alternative, and are available in 5 languages; the UI is bilingual (ar/en) | `replies.py` |
| **Translation & localisation**: preserve the meaning of Islamic terms | Reply templates keep terms such as *hadith*, *sahih* and ﷺ, and add an explanation rather than a loose translation. The Jamhara term dictionary (islamic-content.com) is the reference for new templates. | `replies.py` |
| **Transparency**: disclose that it is an AI-assisted tool | Every result page and API response carries "automated result from an AI-assisted tool… not a fatwa or a human specialist's opinion" (`transparency_ar` / `transparency_en`) | `verify.py`, UI |
| **Privacy**: collect no personal data beyond need, under a published policy; no religious inferences about the user | Messages are processed in memory and not stored; OCR runs on the device; reports carry no identifiers; published policy at `/privacy`; no profiling | `main.py`, `public/privacy.html` |

## 2. Approved references (annex pp.3–4) and our use

| Domain | Annex reference | Thabat |
|---|---|---|
| Quran | Approved script and text (King Fahd Complex print) | Tanzil Uthmani text following the Madinah Mushaf, displayed verbatim; quran.com link for each verse. **Planned:** switch display to the King Fahd Complex digital text (KFGQPC Hafs). |
| Hadith | Authentic hadith from the two Sahihs, plus other books after confirming authenticity (dorar.net/hadith, shamela.ws). "Never attribute a hadith without a source and an approved grading in the data." | Bukhari & Muslim marked "in the two Sahihs"; other books shown with named graders' verdicts; every hadith result links to sunnah.com and offers a dorar.net cross-check. Ungraded matches never produce an "authentic" verdict. |
| Common questions | *Bayyinat* (dawa.center/file/7937) | Referral target for general questions |
| Fiqh | Four-madhhab references / dorar.net/feqhia | Referral target for ruling questions (no weighing) |
| Terms | Jamhara dictionary (islamic-content.com/dictionary) | Reference for reply wording |

## 3. Attribution, abstention and referral

| Situation | Behaviour | Level |
|---|---|---|
| Exact verse / authentic hadith | Direct answer with source | أ |
| Misquoted verse | Gentle correction, correct text, surah and ayah | أ |
| Weak / fabricated / baseless (named graders or reviewed register) | Grading attributed with reference + authentic alternative | ب |
| Graders disagree | All graders shown; refer | ج |
| Similar wording only / nothing found | Abstain; "not found ≠ fabricated"; refer | ج |
| Personal fatwa request | No ruling; referral to an official fatwa body | د |

## 4. Tests (`eval/`, `backend/tests/`)

| Test | What it shows | Result |
|---|---|---|
| 73 curated cases in 10 categories, including the annex's test types (misquoted verse in a question, "give me a hadith proving X" with none existing, personal fatwa, ruling question, general question) | Correct status or behaviour | 72/73 (98.6%) |
| Critical errors (non-established called authentic or the reverse; a fatwa request answered; evidence invented) | Safety | **0** |
| 200 random Arabic phrases, clean and with phone-typing noise | Finding the true source | recall@3 100% / 98.5% (exact search 0% with noise) |
| 100 random English phrases | Cross-language | recall@3 97% |
| Two full runs | Repeatability | identical |
| 18 unit/API tests | Safety invariants, annex behaviours, endpoints | pass |

**Conflict cases covered:** grader disagreement; phrase vs full narration (R014); Companion's words attributed to the Prophet ﷺ; Quran quoted as hadith and the reverse; an authentic English rendering vs a near-identical baseless saying.
**Missing-reference cases covered:** 11 invented texts in 3 languages, plus 2 "prove X" evidence requests: all abstained.
**Honest limit:** the cases were written during development; the specialist's held-out set is the real benchmark.

## 5. Human review

- **Reviewers are verified:** specialists apply at `/join`, the admin checks their qualification before approving, and each receives a personal access code (stored only as a hash; revocable). There is no shared password for reviewers.
- **Register:** entries stay `draft` (with a visible badge) until an approved hadith specialist approves them; every decision is signed with the reviewer's verified name and logged (who, when, what, note).
- **User reports:** any result can be reported; reports go to the token-protected review queue (`/review`), stored in Supabase in production.

## 6. Expected errors and handling

| Error | Mitigation |
|---|---|
| OCR misreads Arabic | Extracted text is shown for editing before checking; matching tolerates letter errors |
| Heavy paraphrase / text spanning narrations | `needs_review`, not a verdict |
| Dataset grading error | Raw label always visible; reportable; the register can override it with a documented reason |
| LLM outage or refusal | Automatic fallback to the deterministic pipeline |
| Short ambiguous phrases | Two-word quotes must match verbatim |
| Lexical search misses a synonym | Search abstains rather than guessing (safe failure) |
