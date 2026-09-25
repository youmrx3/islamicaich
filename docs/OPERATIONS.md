# Operations, cost and sustainability

Maps to "Operational realism and continuation" (final, 10%).

## Measured footprint (local measurement, 2026-09-25)

| Item | Value |
|---|---|
| Memory at runtime | ~600 MB (index + corpus) |
| Cold start | ~3.5 s with cached index (≈80 s first build, done at image build time) |
| Latency | median ≈ 60 ms per message on a laptop CPU (deterministic core) |
| Disk | ~35 MB compressed corpus + ~330 MB index file |
| External calls at runtime | none (LLM optional) |

## Monthly cost estimates

| Scenario | Hosting | LLM | Total |
|---|---|---|---|
| Pilot (≤ 10k checks/month) | Hugging Face Space, CPU basic: free | off | **$0** |
| Pilot with LLM assist | free | ~10k × ≈1.2k tokens on Claude ≈ $10–15 (estimate at $5 / $25 per M input / output tokens) | **≈ $15** |
| Production (≤ 300k checks/month) | 1 small VM, 2 vCPU / 2 GB RAM, ≈ $12–25 | LLM only on messages the core cannot resolve (~20%), ≈ $60–90 | **≈ $75–115** |

The LLM figures are estimates to be replaced by measured token counts during the challenge days (the app logs token usage per request, without content).

## Dependencies and fallbacks

| Dependency | Critical? | Fallback |
|---|---|---|
| Tanzil / hadith-api downloads | only at build time | Raw files can be vendored; the index is built once and cached |
| Claude API | no | Deterministic pipeline runs without it |
| tesseract.js CDN | for screenshots only | Self-host the script and trained data (Apache-2.0) |
| Hosting provider | yes | Single Docker image: HF Spaces, Render, Fly.io or any VM |

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
