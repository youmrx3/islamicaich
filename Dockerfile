# Thabat — alternative to Vercel: one container serving the API and the site.
# The compiled corpus (data/dist) is committed, so no download happens here.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=7860
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt "uvicorn[standard]==0.54.0"

COPY index.py ./
COPY backend ./backend
COPY public ./public
COPY data/curated ./data/curated
COPY data/dist ./data/dist

RUN useradd -m thabat && mkdir -p data/flags && chown -R thabat /app
USER thabat

EXPOSE 7860
CMD ["sh", "-c", "uvicorn index:app --host 0.0.0.0 --port ${PORT}"]
