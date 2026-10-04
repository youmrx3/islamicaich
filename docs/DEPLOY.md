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
   | `ANTHROPIC_API_KEY` | turns on optional LLM quote extraction (default model `claude-opus-5-5`; override with `THABAT_MODEL`) |
   | `REVIEW_TOKEN` | enables `/review` and `GET /api/flags` (reviewers type this token) |
   | `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`) | the Supabase project URL, e.g. `https://<project>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | server-side key used by the API to store reports **and** reviewer decisions. Set it only as a Vercel environment variable; it is never sent to the browser and must never be committed. With only `SUPABASE_ANON_KEY`, reports are stored but review decisions are refused by row-level security. Without any key, data goes to the function's temporary `/tmp` and is lost on redeploy. |
   | `THABAT_RATE_PER_MIN` | requests per minute per client (default 40) |
4. **Create the tables once:** Supabase dashboard → SQL Editor → paste and run [`supabase/schema.sql`](../supabase/schema.sql) (tables `reports` and `review_decisions`, with row-level security).
5. **Deploy.** Check `https://<your-app>.vercel.app/api/health`: it should return `"ok": true` and `"hadith_records": 36064`.

### After deploying

- Website: `/` · app (PWA): `/app` · app in a phone frame for judges: `/mobile` · evidence search: `/app?mode=search` · review page: `/review` · privacy: `/privacy` · API docs: `/api/docs` · health: `/api/health`.
- Installing the app: open `/app` on a phone → Android Chrome *Install app* / iPhone Safari *Share → Add to Home Screen*. On Android the installed app also appears in the system share sheet (Web Share Target), so a WhatsApp message can be shared straight into Thabat.
- Demo links for judges: `/app?ex=0` fabricated saying + forwarding pressure · `/app?ex=1` misquoted verse · `/app?ex=2&lang=en` English forward · `/app?ex=3` invented hadith (abstain) · `/app?ex=4` disputed + phrase-vs-narration · `/app?ex=5` personal fatwa request (level د) · `/app?sq=بر الوالدين` evidence search.

## Local

```bash
pip install -r requirements-dev.txt
python -m uvicorn index:app --port 8000
```

Locally, the FastAPI app also serves `public/` (with clean URLs such as `/app` and `/mobile`). Without Supabase variables, reports and decisions go to `data/flags/*.jsonl` (git-ignored). Tests: `cd backend && python -m pytest tests -q`. Evaluation: `python eval/run_eval.py`.

## Rebuilding the corpus (only when sources change)

```bash
python scripts/build_data.py    # downloads Tanzil + fawazahmed0/hadith-api into data/ (≈150 MB raw)
python scripts/build_index.py   # compiles data/dist/ (numpy inverted index + compressed record shards)
```

Commit the new `data/dist/`.

## Alternatives

A `Dockerfile` (port 7860) and `render.yaml` are included for Hugging Face Spaces, Render or any container host. The whole app needs ~120 MB RAM.
