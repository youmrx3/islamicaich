# Running and deploying Thabat

## Local (Python 3.11+)

```bash
pip install -r requirements-dev.txt
python scripts/build_data.py            # downloads Tanzil + hadith-api (~150 MB raw), ~2 min
python -m uvicorn app.main:app --app-dir backend --port 8000
# open http://localhost:8000   (first start builds the index: ~80 s, then cached)
```

Tests and evaluation:

```bash
cd backend && python -m pytest tests -q && cd ..
python eval/run_eval.py --samples 200   # writes eval/results/REPORT.md
```

Optional LLM assist: set `ANTHROPIC_API_KEY` (and optionally `THABAT_MODEL`). Set `THABAT_LLM=off` to force it off.

## Hugging Face Spaces (free, recommended for the live demo)

The index needs ~650 MB RAM. The free CPU Space has 16 GB, so it fits comfortably.

1. Create a new Space → SDK **Docker** → blank.
2. Push this repository to the Space. The Space's `README.md` needs this header (keep the GitHub README separate):
   ```yaml
   ---
   title: Thabat
   sdk: docker
   app_port: 7860
   ---
   ```
3. Optional: add `ANTHROPIC_API_KEY` under Settings → Secrets.
4. The build runs `scripts/build_data.py` and pre-builds the index, so the Space starts in seconds.

Free Spaces sleep after inactivity. Before and during judging (7–22 October), open the link daily or upgrade to a persistent tier so judges never hit a cold start.

## Render / any Docker host

`render.yaml` is included (Docker runtime, `/api/health` health check). Render's free tier (512 MB) is too small for the index; use Starter or any VM with ≥ 1 GB RAM.

```bash
docker build -t thabat .
docker run -p 7860:7860 -e ANTHROPIC_API_KEY=... thabat
```

## Demo links for judges

- `/?ex=0` fabricated saying with "share this" pressure
- `/?ex=1` misquoted verse with word diff
- `/?ex=2&lang=en` English forward
- `/?ex=3` invented hadith (abstention)
- `/?ex=4` disputed grading and phrase-vs-narration
- `/?q=<any text>` check any text; `/review` is the reviewer queue
