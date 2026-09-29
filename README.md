# ثَبَت · Thabat — verify before you forward

> **ثَبَت** أداة تتحقق من الأحاديث والآيات المتداولة في رسائل واتساب ووسائل التواصل قبل نشرها. تحدد مصدر كل نص في القرآن الكريم وتسعة من كتب الحديث، وتعرض حكم المحققين بأسمائهم، وتكشف تحريف لفظ الآيات كلمةً كلمة، وتمتنع بصراحة حين لا تجد مصدرًا، ثم تقترح ردًّا لطيفًا بخمس لغات مع بديل صحيح ثابت. وكل نتيجة موسومة بأحد **مستويات المحتوى الأربعة (أ/ب/ج/د)** المعتمدة في الحزمة العلمية للتحدي.
>
> Entry for **Track 04 — Knowledge & verification tools** of the *AI in Service of Islamic Content Challenge 2026* (IslamicAIch.org).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youmrx3/islamicaich)

![Thabat checking a forwarded message](docs/screenshots/ex0.png)

## What it does

| | |
|---|---|
| **Check a message** (`/app`) | Paste a forwarded message or upload a screenshot (OCR runs on the device). For every quote: the source (surah:ayah, or collection + standard number, linked to quran.com / sunnah.com), each grader by name with their exact label, a clear status, the annex content level (أ/ب/ج/د), an authentic alternative, and a ready reply in Arabic, English, French, Indonesian or Turkish. Misquoted verses get a word-level diff. |
| **Find evidence** (`/app?mode=search`) | Type a topic, get only the verses and authentic hadith that mention it, with source and grading, or an honest "none found". Evidence is never invented. |
| **Stays in scope** | Personal fatwa requests → level د, no ruling, referral to an official fatwa body. Ruling questions → level ج, referral. General questions → pointer to the approved Q&A reference (Bayyinat). |
| **Forwarding pressure** | Flags "انشرها… أمانة في رقبتك" / "forward to 10 people". |
| **Human review** | Draft register under specialist review; any result can be reported to a token-protected review queue (`/review`). |

## Results (`eval/results/REPORT.md`, deterministic core)

| Metric | Result |
|---|---|
| Curated cases (73, 10 categories, including the annex's own test types) | **98.6%** correct |
| Critical errors (non-established called authentic or the reverse; answering a fatwa request; inventing evidence) | **0** |
| True source found from a random Arabic phrase with phone-typing noise | **98.5%** recall@3 (exact search: **0%**) |
| Same, English translations | **97%** recall@3 |
| Repeated runs | identical output |
| Median latency / cold start / memory | ~25 ms per message · ~0.3 s index load · ~120 MB RAM |

These cases were written during development, so the figures are optimistic. A held-out, specialist-written test set is the next benchmark.

## Why it can be trusted

- **Sources decide, never the AI.** Verdicts come only from verbatim source data and fixed, reviewable templates. An optional LLM (Claude) may only locate quotes or propose an Arabic search query, and anything found that way is labelled.
- **Not found ≠ fabricated.** When the sources are silent, Thabat abstains and refers you to a specialist.
- **Conflicts are explicit:** grader disagreement; a phrase graded differently from its full narration; a Companion's words attributed to the Prophet ﷺ; a verse quoted as hadith.
- **Transparent and private:** every result says it is automated and not a fatwa; messages are not stored; screenshots never leave the device. See the [privacy policy](public/privacy.html).

Details: [Methodology](docs/METHODOLOGY.md) · [Reliability & annex compliance](docs/RELIABILITY.md) · [Sources & licences log](docs/SOURCES.md) · [Operations & cost](docs/OPERATIONS.md) · [Starting-version disclosure](docs/BASELINE.md) · [Deploy](docs/DEPLOY.md)

## Run locally

```bash
pip install -r requirements-dev.txt
python -m uvicorn index:app --port 8000
# http://localhost:8000  (landing)  ·  /app  (checker)  ·  /api/docs  (API)
```

The compiled corpus is committed in `data/dist/`, so no download is needed. To rebuild it from the original sources: `python scripts/build_data.py && python scripts/build_index.py`.

Tests and evaluation:

```bash
cd backend && python -m pytest tests -q && cd ..
python eval/run_eval.py --samples 200
```

## Deploy on Vercel

Import the repository in Vercel. It is detected as a FastAPI project (`index.py` → `app`), `public/` is served from the CDN, and `data/dist/` is bundled with the function. No build step is needed. Optional environment variables:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Enables the optional LLM quote extraction (`THABAT_MODEL` to change the model, `THABAT_LLM=off` to disable) |
| `REVIEW_TOKEN` | Enables the reviewer queue at `/review` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or Vercel KV's `KV_REST_API_*`) | Persistent storage for problem reports |

Full guide: [docs/DEPLOY.md](docs/DEPLOY.md).

## Repository layout

```
index.py            Vercel/ASGI entrypoint (exposes backend.app.main:app)
backend/app/        normalize · corpus (numpy index + compressed store) · matching (Quran diff, hadith)
                    grades · verify (pipeline, annex levels) · scope (fatwa/question guard)
                    search (evidence finder) · replies (5 languages) · llm (optional) · flags · main (API)
backend/tests/      safety-invariant, annex and API tests
public/             landing page, checker app, review page, privacy policy, assets
data/dist/          compiled corpus: 36,064 narrations + 6,236 verses (built by scripts/)
data/curated/       registry.json — popular sayings (draft, pending specialist review)
eval/               cases.json, run_eval.py, results/REPORT.md
docs/               methodology, reliability, sources, operations, baseline, deploy, screenshots
proposal/           registration proposal (Arabic), pitch outline, demo script
deliverables/       presentation (PPTX/PDF), project brief
```

## Licence

Code: © 2026 the Thabat team, published for the challenge's evaluation (see `LICENSE`).
Data: Tanzil Quran text (CC BY 3.0, verbatim) and fawazahmed0/hadith-api (Unlicense). Full list in [docs/SOURCES.md](docs/SOURCES.md).
