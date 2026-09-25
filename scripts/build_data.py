"""Download and compile the open corpora Thabat searches.

Sources (see docs/SOURCES.md for licenses):
  * Hadith: fawazahmed0/hadith-api (Unlicense / public domain), served by jsDelivr.
  * Quran:  Tanzil Quran Text (CC BY 3.0, verbatim, not modified).

Output:
  data/hadith.jsonl.gz   one hadith per line with Arabic text, translations, grades
  data/quran.json        verses in Uthmani (display) and simple (matching) script
  data/build_manifest.json  what was downloaded, when, and from where

Usage:  python scripts/build_data.py [--langs eng,fra,ind,tur]
"""
from __future__ import annotations

import argparse
import datetime as dt
import gzip
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
RAW = DATA / "raw"
sys.path.insert(0, str(ROOT / "backend"))

from app.normalize import normalize_ar  # noqa: E402

HADITH_CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{edition}.min.json"
TANZIL = (
    "https://tanzil.net/pub/download/index.php?quranType={qtype}&outType=txt-2"
    "&agree=true&marks=true&sajdah=true&tatweel=true"
)

BOOKS = {
    # key: (Arabic title, English title, implicit status when no per-hadith grade exists)
    "bukhari": ("صحيح البخاري", "Sahih al-Bukhari", "sahihayn"),
    "muslim": ("صحيح مسلم", "Sahih Muslim", "sahihayn"),
    "abudawud": ("سنن أبي داود", "Sunan Abi Dawud", None),
    "tirmidhi": ("جامع الترمذي", "Jami at-Tirmidhi", None),
    "nasai": ("سنن النسائي", "Sunan an-Nasa'i", None),
    "ibnmajah": ("سنن ابن ماجه", "Sunan Ibn Majah", None),
    "malik": ("موطأ مالك", "Muwatta Malik", None),
    "nawawi": ("الأربعون النووية", "An-Nawawi's Forty", None),
    "qudsi": ("الأحاديث القدسية الأربعون", "Forty Hadith Qudsi", None),
}
DEFAULT_LANGS = ["eng", "fra", "ind", "tur"]


def fetch(url: str, dest: Path, retries: int = 3) -> bytes:
    if dest.exists() and dest.stat().st_size > 1000:
        return dest.read_bytes()
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "thabat-build/1.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                body = r.read()
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(body)
            return body
        except Exception as e:  # network hiccups on CDN are common; retry
            last = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"failed to fetch {url}: {last}")


def load_edition(edition: str) -> dict | None:
    try:
        body = fetch(HADITH_CDN.format(edition=edition), RAW / f"{edition}.json")
    except RuntimeError as e:
        print(f"  ! {e}")
        return None
    return json.loads(body.decode("utf-8"))


def build_hadith(langs: list[str]) -> tuple[int, list[dict]]:
    out_path = DATA / "hadith.jsonl.gz"
    manifest = []
    n = 0
    with gzip.open(out_path, "wt", encoding="utf-8") as out:
        for book, (title_ar, title_en, implicit) in BOOKS.items():
            print(f"- {book}")
            ara = load_edition(f"ara-{book}")
            if not ara:
                continue
            manifest.append({"edition": f"ara-{book}", "url": HADITH_CDN.format(edition=f"ara-{book}")})
            trans: dict[str, dict[float, dict]] = {}
            for lang in langs:
                ed = load_edition(f"{lang}-{book}")
                if ed:
                    trans[lang] = {h["hadithnumber"]: h for h in ed["hadiths"]}
                    manifest.append({"edition": f"{lang}-{book}", "url": HADITH_CDN.format(edition=f"{lang}-{book}")})
            for h in ara["hadiths"]:
                text = (h.get("text") or "").strip()
                if len(text) < 8:
                    continue
                num = h["hadithnumber"]
                grades = []
                for lang_map in trans.values():
                    g = lang_map.get(num, {}).get("grades") or []
                    if g:
                        grades = g
                        break
                if not grades:
                    grades = h.get("grades") or []
                translations = {}
                for lang, lang_map in trans.items():
                    t = (lang_map.get(num, {}).get("text") or "").strip()
                    if t:
                        translations[lang] = t
                rec = {
                    "id": f"{book}:{num:g}",
                    "book": book,
                    "book_ar": title_ar,
                    "book_en": title_en,
                    "number": num,
                    # Standard citation number (Muslim uses Abd al-Baqi numbering).
                    "cite": str(h.get("arabicnumber") or f"{num:g}"),
                    "ref": h.get("reference", {}),
                    "ar": text,
                    "tr": translations,
                    "grades": grades,
                    "implicit": implicit,
                }
                out.write(json.dumps(rec, ensure_ascii=False) + "\n")
                n += 1
    return n, manifest


def build_quran() -> tuple[int, list[dict]]:
    verses: dict[str, dict] = {}
    manifest = []
    for qtype, field in (("uthmani", "uthmani"), ("simple", "simple")):
        url = TANZIL.format(qtype=qtype)
        body = fetch(url, RAW / f"quran-{qtype}.txt").decode("utf-8")
        if "<html" in body[:200].lower():
            raise RuntimeError("Tanzil returned HTML instead of text; check the download URL")
        manifest.append({"edition": f"tanzil-{qtype}", "url": url})
        for line in body.splitlines():
            parts = line.split("|")
            if len(parts) != 3 or not parts[0].isdigit():
                continue
            s, a, t = int(parts[0]), int(parts[1]), parts[2].strip()
            v = verses.setdefault(f"{s}:{a}", {"surah": s, "ayah": a})
            v[field] = t
    for v in verses.values():
        v["norm"] = normalize_ar(v.get("simple") or v.get("uthmani", ""), drop_honorifics=False)
    ordered = sorted(verses.values(), key=lambda v: (v["surah"], v["ayah"]))
    (DATA / "quran.json").write_text(json.dumps(ordered, ensure_ascii=False), encoding="utf-8")
    return len(ordered), manifest


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--langs", default=",".join(DEFAULT_LANGS))
    args = ap.parse_args()
    langs = [l for l in args.langs.split(",") if l]
    DATA.mkdir(exist_ok=True)
    nq, mq = build_quran()
    print(f"quran verses: {nq}")
    nh, mh = build_hadith(langs)
    print(f"hadith records: {nh}")
    (DATA / "build_manifest.json").write_text(
        json.dumps(
            {
                "built_at": dt.datetime.now(dt.timezone.utc).isoformat(),
                "quran_verses": nq,
                "hadith_records": nh,
                "languages": ["ara", *langs],
                "sources": mq + mh,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
