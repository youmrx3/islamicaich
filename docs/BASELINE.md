# Starting-version disclosure (prior work)

The challenge terms (§8 and FAQ Q2) allow building on earlier work if the starting version is documented before 4 October 2026, its components and rights are disclosed, and **only the work done from 4 to 6 October is judged**.

## Starting version

- Git tag: **`baseline-pre-challenge`** (points at the last commit pushed before 4 October 2026).
- Everything in the repository at that tag is prior work and must not be presented as challenge-days work.

### What the starting version contains

| Area | State at baseline |
|---|---|
| Data pipeline | Download and compile Tanzil Quran + 9 hadith collections (Arabic + eng/fra/ind/tur) with gradings |
| Matching engine | Arabic normalization, matn extraction, hashed TF-IDF retrieval, fuzzy alignment, Quran word diff |
| Verdict logic | Status taxonomy, grade aggregation, register-first decision rules, abstention |
| Curated register | 14 draft entries (unreviewed) |
| Web app | Landing page, checker (verify + evidence search), privacy policy, token-protected review page; Arabic/English; on-device OCR; reply templates (5 languages) |
| Annex compliance | Content levels أ–د on every result, scope guard for fatwa/ruling/general questions, transparency notice, privacy policy |
| Deployment | Vercel-ready (numpy index, ~120 MB RAM), Dockerfile alternative |
| Evaluation | 73 curated cases incl. the annex's test types, sampled retrieval with baselines, determinism check, 18 unit/API tests |
| Optional LLM | Quote extraction / Arabic query proposal (not evaluated with a live key yet) |

### Rights

All code in the starting version was written by the participant, Youcef Kouadria, with an AI coding assistant (disclosed in AI_USAGE.md). Third-party data and libraries, with their licences, are listed in SOURCES.md. There are no employer, university or client claims on it.

## Planned challenge-days work (4–6 October 2026)

This is the part to be judged. Each item has a measurable definition of done.

| # | Deliverable | Done when |
|---|---|---|
| 1 | **Specialist review workflow**: reviewer form in `/review`, approve/edit/reject, review log, "approved" badge | Specialist has reviewed all register entries in the live app; log shows who/when/what |
| 2 | **Held-out test set** written by the specialist (≥ 60 cases incl. conflict and missing-reference cases) | Report shows accuracy and critical errors on unseen cases, 3 repeated runs |
| 3 | **Coverage expansion**: register to ≥ 60 popular sayings from real viral messages (anonymized), each with alternative and reference | Register tests pass; every entry reviewed |
| 4 | **LLM assist evaluated**: cross-language set (Urdu, Malay, Spanish, German) measured with and without the LLM | Report shows the gain and the cost per message |
| 5 | **Telegram bot** (forward a message → verdict card) on the same API | Live bot link in the submission |
| 6 | **User test** with 5–8 target users (imams / daʿwah volunteers / general users): task success, time to verdict, clarity | Findings and the UI changes made because of them, documented |
| 7 | **Shareable verdict card image** (PNG) for replying in groups | Card renders for every status in ar/en |

The submission will list exactly which commits fall between `baseline-pre-challenge` and the final tag.

> **Progress against this plan** is recorded day by day in [CHALLENGE_LOG.md](../CHALLENGE_LOG.md). On day 1 the plan was adjusted: the participant delivered a full brand identity and new website/app designs, so the redesigned website, the installable mobile app (PWA) with the `/mobile` simulator, Supabase storage and the review workflow (item 1) and verdict card (item 7) were prioritised. The Telegram bot (item 5) moved to *coming soon*.
