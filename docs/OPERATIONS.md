# Operations, cost and sustainability

Maps to "Operational realism and continuation" (final, 10%).

## Measured footprint (local measurement, 2026-09-29)

| Item | Value |
|---|---|
| Memory at runtime | ~120 MB (memory-mapped NumPy index + compressed record shards) |
| Cold start | ~0.3 s to load the corpus (~1.5 s including Python imports) |
| Latency | median ≈ 25 ms per message; evidence search ≈ 10–55 ms |
| Deployed bundle | ≈ 220 MB (111 MB data + ~110 MB Python packages), under Vercel's 500 MB limit |
| External calls at runtime | none (LLM optional; Upstash only when a report is sent) |

## Monthly cost estimates

| Scenario | Hosting | LLM | Total |
|---|---|---|---|
| Pilot (≤ 10k checks/month) | Vercel Hobby (free) + Upstash free tier | off | **$0** |
| Pilot with LLM assist | free | ~10k × ≈1.2k tokens on Claude ≈ $10–15 (estimate at $5 / $25 per M input / output tokens) | **≈ $15** |
| Production (≤ 300k checks/month) | Vercel Pro ($20/month), ~25 ms CPU per check | LLM only on messages the core cannot resolve (~20%), ≈ $60–90 | **≈ $80–110** |

The LLM figures are estimates to be replaced by measured token counts during the challenge days (the app logs token usage per request, without content).

## Dependencies and fallbacks

| Dependency | Critical? | Fallback |
|---|---|---|
| Tanzil / hadith-api downloads | only at build time | Raw files can be vendored; the index is built once and cached |
| Claude API | no | Deterministic pipeline runs without it |
| tesseract.js CDN | for screenshots only | Self-host the script and trained data (Apache-2.0) |
| Hosting provider (Vercel) | yes | Same code runs from the included Dockerfile on Render, HF Spaces, Fly.io or any VM (~120 MB RAM) |

## Maintenance and content review

| Task | Frequency | Owner |
|---|---|---|
| Review user flags and new register entries | weekly | Content specialist (hadith) |
| Add collections (Musnad Ahmad, al-Hakim, al-Bayhaqi…) | quarterly | Data engineer |
| Re-run evaluation after every change (CI) | every commit | Developer |
| Update the held-out test set with new viral messages | monthly | Specialist + developer |

## Adoption path

1. **Daʿwah and fatwa-desk staff** (e.g. centres that receive "is this hadith authentic?" questions daily): use the web app and reply templates directly.
2. **Browser extension / WhatsApp & Telegram bot:** forward a message to the bot and get the verdict card back. Uses the same `/api/verify` endpoint.
3. **Open API** for content platforms and moderators, to pre-screen posts that quote hadith.
