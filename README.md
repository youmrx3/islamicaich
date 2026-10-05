<div align="center">

<img src="public/assets/brand/mark.svg" width="88" alt="Thabat logo">

# ثَبَت · Thabat

**وصلتك رسالة؟ ثبّتها.** Got a forwarded message? Verify it before you share it.

Verifies the Quran verses and hadith in forwarded messages against the sources, with each scholar's grading by name.

*Entry for **Track 04: Knowledge & verification tools**, AI in Service of Islamic Content Challenge 2026 ([IslamicAIch.org](https://islamicaich.org)). Built by **Youcef Kouadria**.*

[Website](#run-it) · [App (PWA)](#the-app) · [How the AI works](#how-the-ai-works) · [Results](#measured-results) · [Docs](#documentation)

</div>

![Thabat website](docs/screenshots/site-hero.png)

## The problem

Messages that start with «قال رسول الله ﷺ» or quote a verse travel through family groups every day. Some are authentic. Some are fabricated, weak, or a verse quoted with a wrong word. The person who receives one rarely has the tools or time to check, and generic AI chatbots can make it worse by **inventing a reference**.

## What Thabat does

Paste a message or share a screenshot. For **every quote in it**, Thabat:

| | |
|---|---|
| 📖 **Finds the source** | Surah and ayah, or the collection and hadith number, with a link to quran.com / sunnah.com |
| ⚖️ **Shows the grading by name** | al-Albani, Shu'ayb al-Arna'ut, Zubair Ali Zai, Ahmad Shakir… exactly as published. If scholars differ, all gradings are shown |
| 🔤 **Checks verses word by word** | A misquoted verse shows which words differ from the Mushaf, with the correct wording and a recitation |
| 🚫 **Abstains honestly** | "No source found" is never presented as "fabricated". It refers you to a specialist |
| 🧭 **Stays in scope** | Every result carries the annex's content level (أ/ب/ج/د). Fatwa requests are referred, not answered |
| 💬 **Helps you reply kindly** | A gentle reply in Arabic, English, French, Indonesian or Turkish, with an authentic alternative, or a verdict card image for the group |

## The app

One codebase serves the website and an **installable mobile app (PWA)** for Android and iPhone. Native-only features (floating bubble, widgets, iOS share sheet, WhatsApp bot) are shown as **clearly labelled simulations that call the real engine**. The native store apps are *coming soon*.

![Thabat app screens](docs/screenshots/app-strip.png)

| Feature | Status |
|---|---|
| Paste, screenshot (OCR on the device), clipboard | ✅ live |
| Results, hadith detail with the source passage, verse word tiles, listen to the verse | ✅ live |
| Reply in 5 languages, verdict card PNG, result link, WhatsApp share | ✅ live |
| History and saved items, stored **on the device only** | ✅ live |
| Evidence search by topic (verses + authentic hadith only) | ✅ live |
| Install to the home screen, offline app shell, app shortcuts | ✅ live |
| **Share a WhatsApp message into Thabat** (Android share target) | ✅ live once installed |
| Floating bubble, widgets, iOS share sheet, WhatsApp bot | 🧪 simulation in the app · native version *coming soon* |
| App Store / Google Play, Telegram bot, more hadith books | 🔜 coming soon |

**For judges:** open **`/mobile`** to use the full app inside a phone frame, or scan its QR code to open it on your own phone.

![The /mobile simulator](docs/screenshots/mobile-simulator.png)

## How the AI works

> **AI that finds the source, not AI that invents one.**

Thabat uses **retrieval-based verification with Arabic NLP**. It is **not RAG**: no language model writes the answer. Every verdict is built from the source record itself, with fixed rules that can be reviewed.

```
message ─▶ ① OCR (on device) ─▶ ② Arabic NLP: normalise, strip lead-ins & pressure, split isnad/matn
        ─▶ ③ TF-IDF retrieval over 36,064 narrations + 6,236 verses
        ─▶ ④ fuzzy alignment + word-level diff against the Mushaf
        ─▶ ⑤ rules: named gradings, register, abstention, annex level أ–د, scope guard
        ─▶ verdict + source + reply
   (⑥ optional LLM, off by default: only locates quotes in messy messages; never grades or cites)
```

The website has a full section on this (`/#ai`). Details are in [docs/METHODOLOGY.md](docs/METHODOLOGY.md); every AI tool, in the product and in its making, is listed in [docs/AI_USAGE.md](docs/AI_USAGE.md).

![The AI section of the website](docs/screenshots/site-ai.png)

## Measured results

From [`eval/results/REPORT.md`](eval/results/REPORT.md), deterministic core:

| Metric | Result |
|---|---|
| Curated cases (73, 10 categories, including the annex's own test types) | **98.6%** correct |
| Critical errors (calling a non-established text authentic or the reverse, answering a fatwa request, inventing evidence) | **0** |
| True source found from a random Arabic phrase with phone-typing noise | **98.5%** recall@3 (exact search: **0%**) |
| Same, English translations | **97%** recall@3 |
| Repeated runs | identical output |
| Speed and footprint | ~25 ms per message · ~0.3 s cold load · ~120 MB RAM |

These cases were written during development, so the figures are optimistic. A held-out test set written by a specialist is the next benchmark.

## Why it can be trusted

- **The sources decide, never the AI.** Quran text (Tanzil) and hadith text and gradings are shown verbatim. Sacred text is never typed by hand or generated.
- **Human review with verified reviewers.** Specialists apply at `/join`; the admin verifies and approves them, and each gets a personal access code (only its hash is stored). Popular sayings in the register stay *draft* until an approved specialist signs them on `/review`. Every decision is logged with the reviewer's verified name and time, and accounts can be revoked.
- **Conflicts are shown, not hidden:** scholars who disagree; a phrase graded differently from its full narration; a Companion's words attributed to the Prophet ﷺ; a verse quoted as a hadith.
- **Private by design:** messages are not stored; screenshots never leave the device; history stays on the phone. See the [privacy policy](public/privacy.html).

## Run it

```bash
pip install -r requirements-dev.txt
python -m uvicorn index:app --port 8000
```

| URL | |
|---|---|
| `http://localhost:8000/` | website |
| `/verify` | the full desktop verification tool (message → results → details, evidence search, reply, card) |
| `/app` | the app (PWA) · demos: `/app?ex=0` … `/app?ex=5` · search: `/app?mode=search` |
| `/mobile` | the app in a phone frame + QR code |
| `/join` · `/review` | apply as a reviewer · reviewer and admin sign-in |
| `/api/docs` | API (`/api/verify`, `/api/search`, `/api/daily`, `/api/reply`, `/api/flag`, `/api/review`…) |

The compiled corpus is committed in `data/dist/`, so nothing needs to be downloaded. To rebuild it from the original sources: `python scripts/build_data.py && python scripts/build_index.py`.

```bash
cd backend && python -m pytest tests -q && cd ..   # 25 tests
python eval/run_eval.py                             # evaluation report
```

### Deploy (Vercel)

Import the repository in Vercel (FastAPI is detected; no build step). Then set:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL. Run [`supabase/schema.sql`](supabase/schema.sql) once in the SQL editor (existing projects: `supabase/migrations/002_reviewers.sql`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key for storing reports and review decisions (never committed or sent to the browser) |
| `REVIEW_TOKEN` | Admin password for `/review` (approves reviewer accounts, reads reports) |
| `ANTHROPIC_API_KEY` | *Optional* LLM quote extraction |

Full guide: [docs/DEPLOY.md](docs/DEPLOY.md).

## Repository

```
index.py              ASGI entry point (Vercel) → backend.app.main:app
backend/app/          normalize · corpus · matching · grades · verify · scope · search · replies · llm · flags · main
backend/tests/        safety, annex and API tests
public/               index.html (website) · verify.html (desktop tool) · app.html (PWA) · mobile.html · join.html · review.html · privacy.html
  assets/             site.* · app.* · brand/ · icons/
  manifest.webmanifest, sw.js
data/dist/            compiled corpus (36,064 narrations + 6,236 verses)
data/curated/         registry.json (popular sayings, under review) · daily.json (hadith of the day)
supabase/             schema.sql + migrations/: reports, review decisions, reviewer accounts (RLS)
eval/                 cases, runner, results
docs/                 methodology · reliability · AI usage · sources · operations · baseline · deploy
CHALLENGE_LOG.md      what was built during 4–6 October 2026
```

## Documentation

[Methodology](docs/METHODOLOGY.md) · [Reliability & annex compliance](docs/RELIABILITY.md) · [AI usage disclosure](docs/AI_USAGE.md) · [Sources & licences](docs/SOURCES.md) · [Operations & cost](docs/OPERATIONS.md) · [Starting-version disclosure](docs/BASELINE.md) · [Challenge log](CHALLENGE_LOG.md) · [Deploy](docs/DEPLOY.md) · [Registration proposal (AR)](docs/PROPOSAL_AR.md)

## Challenge compliance

- **Judged work:** only 4–6 October 2026. Prior work is declared by the tag `baseline-pre-challenge` and described in [docs/BASELINE.md](docs/BASELINE.md); the challenge-days work is in [CHALLENGE_LOG.md](CHALLENGE_LOG.md).
- **Scientific annex:** content levels أ–د, the mandatory standard, approved references and the test types are covered in [docs/RELIABILITY.md](docs/RELIABILITY.md).
- **Disclosure:** every dataset, library, service and AI tool, with its licence, is in [SOURCES.md](docs/SOURCES.md) and [AI_USAGE.md](docs/AI_USAGE.md). No real user data was used.

## Licence

Code © 2026 Youcef Kouadria, published for the challenge's evaluation (see [`LICENSE`](LICENSE)).
Data: Tanzil Quran text (CC BY 3.0, verbatim) and fawazahmed0/hadith-api (Unlicense). Fonts: Alexandria and Amiri (OFL). Full list in [docs/SOURCES.md](docs/SOURCES.md).
