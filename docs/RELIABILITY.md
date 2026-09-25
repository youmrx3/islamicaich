# Reliability and scientific-safety plan

Maps to the rubric items "Reliability plan" (acceptance, 20%) and "Reliability and scientific safety" (final, 15%).

## 1. Approved sources and how they are used

| Content | Source | How it is used | How output is checked |
|---|---|---|---|
| Quran | Tanzil (verbatim) | Displayed only as the published Uthmani text; matching uses in-memory normalized keys | Every Quran result shows surah and ayah plus a quran.com link; misquotes get a word-level diff against the verbatim text |
| Hadith | 9 collections, Arabic + 4 translations | Displayed verbatim with collection and standard number | sunnah.com link on every result; snippet highlighting shows exactly which words matched |
| Gradings | Named graders in the dataset | Shown verbatim with grader name; aggregated by a published rule (METHODOLOGY.md) | The raw label is always visible next to our summary |
| Popular sayings | Curated register (draft) | Specialist-review badge until approved | Named reviewer and change log (below) |

## 2. Attribution (إسناد)

- No sentence about a source is generated freely. Explanations are fixed templates, reviewable in advance (`backend/app/verify.py`, `backend/app/replies.py`).
- Each result links to an independent public copy (sunnah.com / quran.com), so a user or reviewer can check in one click.
- An LLM, when enabled, cannot introduce a source: it only proposes quote boundaries and an Arabic search string. Results reached this way carry the label "matched via AI translation" and at most medium confidence.

## 3. Abstention and referral (امتناع وإحالة)

| Situation | Behaviour |
|---|---|
| Nothing found above threshold | `not_found`: "not found in indexed sources — this does not prove it is fabricated"; refer to specialist |
| Similar wording found | `needs_review`: closest texts shown; no verdict; refer to specialist |
| Graders disagree | `disputed`: every grader shown by name; refer to specialist |
| Only ungraded compilations match | `needs_review` |
| Grade of the full narration ≠ quoted phrase | Handled in the register (e.g. R014 "طلب العلم فريضة") with an explicit explanation |
| Religious ruling requested ("is it halal…") | Out of scope: Thabat checks attribution only; the method section says "not a fatwa" |

## 4. Tests (see `eval/` and `backend/tests/`)

| Test | What it proves | Current result |
|---|---|---|
| 65 curated cases in 9 categories | Correct status for exact and misquoted verses, authentic/noisy/translated hadith, register entries, invented texts, cross-attribution, multi-quote messages | 64/65 (98.5%) |
| Critical-error count | Never labels a non-established text authentic, or an authentic one fabricated | **0** |
| 200 random Arabic phrases, clean and with phone-typing noise | Finding the true source | recall@3 100% clean / 98.5% noisy (exact search: 0% noisy) |
| 100 random English phrases | Cross-language finding | recall@3 97% |
| Two identical runs | Repeatability | identical |
| 13 unit tests | Safety invariants (e.g. fabricated ≠ authentic; unknown → abstain; register references resolve) | pass |

**Conflict cases covered:** grader disagreement (disputed), phrase vs full narration (R014), companion's words attributed to the Prophet ﷺ (`authentic_mawquf`), Quran quoted as hadith and vice versa, authentic English rendering vs near-identical baseless saying.

**Missing-reference cases covered:** 11 invented texts (Arabic, English, French), all correctly abstained on (`not_found` / `needs_review`).

## 5. Human review

- **Register workflow:** entries are `draft` until a named specialist reviews them. The reviewer records a decision (approve / edit / reject) with a note. Approved entries lose the "pending review" badge.
- **User flags:** any result can be reported. Flags land in the review queue (`/review`) with the quote, the verdict and the evidence ID.
- **Planned for the challenge days:** a reviewer form writing to `data/curated/review_log.jsonl` (who, when, what changed, why), and a held-out test set written by the team's specialist.

## 6. Expected errors and handling

| Error | Mitigation |
|---|---|
| OCR misreads Arabic letters | User sees and can edit the extracted text before checking. The fuzzy matching tolerates letter errors (98.5% recall with noise). |
| Quote spans two narrations or is heavily paraphrased | `needs_review` rather than a verdict |
| Dataset grading error | Raw label shown; users and reviewers can flag it; the register can override it with a documented reason |
| LLM outage or refusal | Automatic fallback to the deterministic pipeline (no user-visible failure) |
| Short ambiguous phrases | Two-word quotes must match verbatim |
