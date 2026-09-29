# Running and deploying Thabat

## Vercel (primary)

The repository is ready for Vercel as is:

- `index.py` exposes the FastAPI `app` (Vercel's FastAPI preset detects it; `pyproject.toml` also sets `tool.vercel.entrypoint = "index:app"`).
- `public/` (landing page, checker, privacy, review page, assets) is served from Vercel's CDN; `vercel.json` enables `cleanUrls`, so `/app` serves `app.html`.
- `data/dist/` (the compiled corpus, ~111 MB, files < 50 MB each) is bundled with the function and memory-mapped at runtime. Total function bundle ≈ 220 MB, under the 500 MB Python limit.
- Only `requirements.txt` is installed at runtime (FastAPI, NumPy, RapidFuzz, Pydantic, Anthropic SDK, httpx). No build command is needed.

### Steps

1. Push the repository to GitHub (done: `github.com/youmrx3/islamicaich`).
2. In Vercel: **Add New… → Project → Import** the repository. Framework preset: FastAPI (auto-detected). Leave build settings empty.
3. Optional **Environment Variables** (Project → Settings → Environment Variables):
   | Variable | Effect |
   |---|---|
   | `ANTHROPIC_API_KEY` | turns on optional LLM quote extraction (default model `claude-opus-5`; override with `THABAT_MODEL`) |
   | `REVIEW_TOKEN` | enables `/review` and `GET /api/flags` (reviewers type this token) |
   | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | stores problem reports in Redis. Add via Vercel Marketplace → Upstash (it may name them `KV_REST_API_URL` / `KV_REST_API_TOKEN`, which also work). Without it, reports go to the function's temporary `/tmp` and are lost on redeploy. |
   | `THABAT_RATE_PER_MIN` | requests per minute per client (default 40) |
4. **Deploy.** Check `https://<your-app>.vercel.app/api/health`: it should return `"ok": true` and `"hadith_records": 36064`.

### After deploying

- Landing page: `/` · checker: `/app` · evidence search: `/app?mode=search` · API docs: `/api/docs` · health: `/api/health`.
- Demo links for judges: `/app?ex=0` fabricated saying + forwarding pressure · `/app?ex=1` misquoted verse · `/app?ex=2&lang=en` English forward · `/app?ex=3` invented hadith (abstain) · `/app?ex=4` disputed + phrase-vs-narration · `/app?ex=5` personal fatwa request (level د) · `/app?sq=بر الوالدين` evidence search.

## Local

```bash
pip install -r requirements-dev.txt
python -m uvicorn index:app --port 8000
```

Locally, the FastAPI app also serves `public/`. Tests: `cd backend && python -m pytest tests -q`. Evaluation: `python eval/run_eval.py`.

## Rebuilding the corpus (only when sources change)

```bash
python scripts/build_data.py    # downloads Tanzil + fawazahmed0/hadith-api into data/ (≈150 MB raw)
python scripts/build_index.py   # compiles data/dist/ (numpy inverted index + compressed record shards)
```

Commit the new `data/dist/`.

## Alternatives

A `Dockerfile` (port 7860) and `render.yaml` are included for Hugging Face Spaces, Render or any container host. The whole app needs ~120 MB RAM.
