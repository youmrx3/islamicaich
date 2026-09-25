# Thabat — single container: API + static frontend.
# The corpus is downloaded from its public sources and indexed at build time,
# so the running container needs no network access except the optional LLM.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=7860
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY scripts ./scripts
COPY frontend ./frontend
COPY data/curated ./data/curated

# Download sources (Tanzil + hadith-api), then build the search index once.
RUN python scripts/build_data.py && \
    python -c "import sys; sys.path.insert(0,'backend'); from app.corpus import load_corpus; load_corpus()" && \
    rm -rf data/raw

RUN useradd -m thabat && mkdir -p data/flags && chown -R thabat /app
USER thabat

EXPOSE 7860
CMD ["sh", "-c", "uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port ${PORT}"]
