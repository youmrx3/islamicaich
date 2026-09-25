"""Thabat evaluation harness.

Runs three suites and writes eval/results/latest.json + eval/results/REPORT.md:

  1. Curated cases (eval/cases.json): status accuracy per category, and
     CRITICAL errors — e.g. calling a non-established text authentic, or an
     authentic hadith fabricated. The target for critical errors is zero.
  2. Sampled retrieval (seeded random): take a real phrase from N random
     hadith (Arabic matn and English translation), optionally add typing
     noise, and check the correct source is returned. Compared against two
     simpler baselines: exact search on raw text, and exact search after
     removing diacritics (i.e. what a careful person could do with Ctrl+F).
  3. Determinism: the full curated suite is run twice; outputs must match.

Usage:  python eval/run_eval.py [--samples 200] [--seed 42]
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import random
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

import os  # noqa: E402

os.environ.setdefault("THABAT_LLM", "off")  # evaluate the deterministic core

from app.corpus import get_corpus  # noqa: E402
from app.matching import _ar_keys, _latin_key, match_hadith  # noqa: E402
from app.normalize import extract_matn, normalize_ar, normalize_latin  # noqa: E402
from app.verify import verify_text  # noqa: E402

OUT = ROOT / "eval" / "results"


# ------------------------------------------------------------ curated suite

def run_curated() -> tuple[dict, list[dict]]:
    cases = json.loads((ROOT / "eval" / "cases.json").read_text(encoding="utf-8"))["cases"]
    rows = []
    for c in cases:
        t0 = time.time()
        r = verify_text(c["text"], use_llm=False)
        ms = (time.time() - t0) * 1000
        statuses = [v["status"] for v in r["results"]]
        if "expect_multi" in c:
            ok = sorted(statuses) == sorted(c["expect_multi"])
            critical = False
            got = statuses
        else:
            got = statuses[0] if statuses else "no_result"
            ok = got in c["expect"]
            critical = got in c.get("critical_if", [])
            if ok and c.get("ref") and r["results"][0].get("quran"):
                ok = r["results"][0]["quran"]["ref"] in c["ref"]
        rows.append({"cat": c["cat"], "text": c["text"], "expected": c.get("expect") or c.get("expect_multi"),
                     "got": got, "ok": ok, "critical": critical, "ms": round(ms, 1),
                     "evidence": [(e.get("id") or e.get("ref")) for v in r["results"] for e in v.get("evidence", [])][:3]})
    by_cat = defaultdict(lambda: [0, 0])
    for row in rows:
        by_cat[row["cat"]][0] += row["ok"]
        by_cat[row["cat"]][1] += 1
    summary = {
        "cases": len(rows),
        "correct": sum(r["ok"] for r in rows),
        "accuracy": round(sum(r["ok"] for r in rows) / len(rows), 4),
        "critical_errors": sum(r["critical"] for r in rows),
        "by_category": {k: {"correct": v[0], "total": v[1]} for k, v in sorted(by_cat.items())},
        "median_ms": sorted(r["ms"] for r in rows)[len(rows) // 2],
    }
    return summary, rows


# ----------------------------------------------------------- sampled suite

def _noisy_ar(words: list[str], rng: random.Random) -> list[str]:
    """Simulate phone typing: drop one word and misspell one letter."""
    w = list(words)
    if len(w) > 6:
        del w[rng.randrange(1, len(w) - 1)]
    i = rng.randrange(len(w))
    swaps = {"ه": "ة", "ة": "ه", "ي": "ى", "ا": "أ", "ت": "ة", "ض": "ظ", "ذ": "ز"}
    chars = list(w[i])
    for k, ch in enumerate(chars):
        if ch in swaps:
            chars[k] = swaps[ch]
            break
    w[i] = "".join(chars)
    return w


def run_sampled(n: int, seed: int) -> dict:
    c = get_corpus()
    rng = random.Random(seed)
    pool = [i for i, r in enumerate(c.hadith) if r["book"] not in ("nawawi", "qudsi")]
    res = {"arabic_clean": Counter(), "arabic_noisy": Counter(), "english": Counter()}
    examples = []
    tried = 0
    while res["arabic_clean"]["n"] < n and tried < n * 5:
        tried += 1
        pos = rng.choice(pool)
        r = c.hadith[pos]
        full, matn = _ar_keys(r["ar"])
        words = matn.split()
        if len(words) < 14:
            continue
        start = rng.randrange(0, len(words) - 10)
        window = words[start:start + rng.randint(8, 12)]
        q_clean = " ".join(window)
        q_noisy = " ".join(_noisy_ar(window, rng))
        raw_words = r["ar"].split()
        for kind, q in (("arabic_clean", q_clean), ("arabic_noisy", q_noisy)):
            res[kind]["n"] += 1
            hits = match_hadith(c, q, "ara", k=5).hits
            ids = [h.id for h in hits]
            ok_any = any(q_clean in _ar_keys(h.record["ar"])[0] for h in hits[:3]) or r["id"] in ids[:3]
            res[kind]["top3"] += ok_any
            res[kind]["top1"] += bool(hits) and (hits[0].id == r["id"] or q_clean in _ar_keys(hits[0].record["ar"])[0])
            # Baselines (both cannot handle noise by construction).
            res[kind]["base_exact_raw"] += q in r["ar"]  # Ctrl+F on the vocalized source text
            res[kind]["base_exact_norm"] += q in full  # Ctrl+F after stripping diacritics
        if len(examples) < 5:
            examples.append({"id": r["id"], "query_clean": q_clean, "query_noisy": q_noisy})

    tried = 0
    eng_pool = [i for i in pool if c.hadith[i]["tr"].get("eng")]
    while res["english"]["n"] < n // 2 and tried < n * 5:
        tried += 1
        r = c.hadith[rng.choice(eng_pool)]
        words = _latin_key(r["tr"]["eng"]).split()
        if len(words) < 20:
            continue
        start = rng.randrange(0, len(words) - 12)
        q = " ".join(words[start:start + 12])
        res["english"]["n"] += 1
        hits = match_hadith(c, q, "eng", k=5).hits
        res["english"]["top3"] += any(h.id == r["id"] or q in _latin_key(h.record["tr"].get("eng", "")) for h in hits[:3])
        res["english"]["top1"] += bool(hits) and (hits[0].id == r["id"] or q in _latin_key(hits[0].record["tr"].get("eng", "")))
        res["english"]["base_exact_raw"] += q in r["tr"]["eng"]
        res["english"]["base_exact_norm"] += q in _latin_key(r["tr"]["eng"])

    out = {}
    for k, v in res.items():
        nn = max(v["n"], 1)
        out[k] = {"n": v["n"], "recall@1": round(v["top1"] / nn, 4), "recall@3": round(v["top3"] / nn, 4),
                  "baseline_exact_raw": round(v["base_exact_raw"] / nn, 4),
                  "baseline_exact_normalized": round(v["base_exact_norm"] / nn, 4)}
    out["examples"] = examples
    return out


# ------------------------------------------------------------------ report

def write_report(summary: dict, rows: list[dict], sampled: dict, deterministic: bool, meta: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = {"meta": meta, "curated": summary, "curated_rows": rows, "sampled": sampled, "deterministic": deterministic}
    (OUT / "latest.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    L = [f"# Thabat evaluation report", "",
         f"Run: {meta['at']} · corpus: {meta['hadith']} hadith, {meta['verses']} verses · seed {meta['seed']} · LLM: off (deterministic core)", "",
         "## 1. Curated cases", "",
         f"- **Accuracy:** {summary['correct']}/{summary['cases']} ({summary['accuracy']:.1%})",
         f"- **Critical errors:** {summary['critical_errors']} (a non-established text called authentic, or an authentic text called fabricated/weak)",
         f"- **Median latency:** {summary['median_ms']} ms per message", "",
         "| Category | Correct | Total |", "|---|---:|---:|"]
    for k, v in summary["by_category"].items():
        L.append(f"| {k} | {v['correct']} | {v['total']} |")
    fails = [r for r in rows if not r["ok"]]
    if fails:
        L += ["", "### Cases not matching expectation", "", "| Category | Text | Expected | Got | Critical |", "|---|---|---|---|---|"]
        for r in fails:
            L.append(f"| {r['cat']} | {r['text'][:70]} | {', '.join(r['expected'])} | {r['got']} | {'YES' if r['critical'] else 'no'} |")
    L += ["", "## 2. Sampled retrieval vs. simpler baselines", "",
          "A random phrase (8–12 words) from a random hadith is searched. *Noisy* adds one dropped word and one common phone misspelling (ه/ة, ي/ى, ا/أ…).",
          "Baselines: *exact raw* = Ctrl+F on the source as published (with diacritics); *exact normalized* = Ctrl+F after removing diacritics.", "",
          "| Suite | n | Thabat recall@1 | Thabat recall@3 | Baseline exact (raw) | Baseline exact (normalized) |", "|---|---:|---:|---:|---:|---:|"]
    for k in ("arabic_clean", "arabic_noisy", "english"):
        v = sampled[k]
        L.append(f"| {k} | {v['n']} | {v['recall@1']:.1%} | {v['recall@3']:.1%} | {v['baseline_exact_raw']:.1%} | {v['baseline_exact_normalized']:.1%} |")
    L += ["", "## 3. Determinism", "", f"Two full runs of the curated suite produced {'identical' if deterministic else 'DIFFERENT'} outputs.", "",
          "## Limits of this evaluation", "",
          "- The curated cases were written during development and matching thresholds were tuned while running them, so these figures are optimistic. A held-out set written by a hadith specialist (planned for the challenge days) is the honest test.",
          "- Curated expectations for the register were written by the team from published gradings and must be confirmed by a hadith specialist (all register entries are marked draft).",
          "- Sampled retrieval measures finding the right source, not the correctness of the scholars' gradings, which are taken from the dataset as published.",
          "- Paraphrases far from any published translation are out of scope for the deterministic core; the optional LLM step targets them and is evaluated separately."]
    (OUT / "REPORT.md").write_text("\n".join(L) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--samples", type=int, default=200)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    c = get_corpus()
    summary, rows = run_curated()
    _, rows2 = run_curated()
    deterministic = [(r["got"], r["evidence"]) for r in rows] == [(r["got"], r["evidence"]) for r in rows2]
    sampled = run_sampled(args.samples, args.seed)
    meta = {"at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), "hadith": len(c.hadith),
            "verses": len(c.quran), "seed": args.seed, "samples": args.samples}
    write_report(summary, rows, sampled, deterministic, meta)
    print(json.dumps({"curated": {k: summary[k] for k in ("accuracy", "critical_errors", "median_ms")},
                      "sampled": {k: v for k, v in sampled.items() if k != "examples"},
                      "deterministic": deterministic}, indent=2))
    for r in rows:
        if not r["ok"]:
            print("MISS", r["cat"], "|", r["text"][:60], "| expected", r["expected"], "| got", r["got"], "| critical" if r["critical"] else "")


if __name__ == "__main__":
    main()
