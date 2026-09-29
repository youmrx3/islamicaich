"""Corpus store and lexical indexes (numpy only, serverless-friendly).

Retrieval is two-stage and fully deterministic:
  1. Candidate generation: TF-IDF over hashed terms, stored as an inverted
     index (sorted term hashes -> postings of uint16 doc ids + float16 weights).
     Arabic keys get light clitic stripping so "والصلاة" and "الصلاه" meet.
  2. Re-ranking: character-level fuzzy alignment of the quote against each
     candidate (matching.py). The verdict thresholds use that score.

The compiled store lives in data/dist/ (built by scripts/build_index.py and
committed to the repository, each file < 50 MB). At runtime the arrays are
memory-mapped and records are decompressed on demand, so a cold start takes
well under a second and no SciPy/scikit-learn is needed. Same input -> same
output on every run.
"""
from __future__ import annotations

import gzip
import json
import logging
import math
import time
import zlib
from collections import Counter
from collections.abc import Iterator, Sequence
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import numpy as np

from .normalize import extract_matn, normalize_ar, normalize_latin

log = logging.getLogger("thabat.corpus")

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DIST = DATA_DIR / "dist"
SEARCH_LANGS = ["eng", "fra", "ind", "tur"]
SHARD_BYTES = 40 * 1024 * 1024
STORE_VERSION = 4

_AR_PREFIXES = ("وال", "فال", "بال", "كال", "لل", "ال", "و", "ف")


def ar_tokens(text: str) -> list[str]:
    toks = []
    for t in text.split():
        for p in _AR_PREFIXES:
            if t.startswith(p) and len(t) - len(p) >= 3:
                t = t[len(p):]
                break
        toks.append(t)
    return toks


def latin_tokens(text: str) -> list[str]:
    return [t for t in text.split() if len(t) > 1]


def terms(text: str, kind: str, bigrams: bool) -> list[str]:
    toks = ar_tokens(text) if kind == "ar" else latin_tokens(text)
    if bigrams:
        toks = toks + [a + " " + b for a, b in zip(toks, toks[1:])]
    return toks


def h32(term: str) -> int:
    return zlib.crc32(term.encode("utf-8")) & 0xFFFFFFFF


# ------------------------------------------------------------------- index

@dataclass
class Index:
    kind: str  # "ar" | "latin"
    bigrams: bool
    term_hash: np.ndarray  # uint32, sorted
    term_idf: np.ndarray  # float32
    ptr: np.ndarray  # int64, len = n_terms + 1
    docs: np.ndarray  # uint16 row ids
    weights: np.ndarray  # float16, doc-normalized tf-idf
    row_to_pos: np.ndarray | None  # uint16 row -> record position (None = identity)
    n_rows: int

    def search(self, query: str, k: int = 40) -> list[tuple[int, float]]:
        cnt = Counter(h32(t) for t in terms(query, self.kind, self.bigrams))
        if not cnt:
            return []
        hs = np.fromiter(cnt.keys(), dtype=np.uint32)
        loc = np.searchsorted(self.term_hash, hs)
        loc = np.minimum(loc, len(self.term_hash) - 1)
        found = self.term_hash[loc] == hs
        if not found.any():
            return []
        scores = np.zeros(self.n_rows, dtype=np.float32)
        tfs = np.fromiter(cnt.values(), dtype=np.float32)
        for li, tf in zip(loc[found], tfs[found]):
            a, b = int(self.ptr[li]), int(self.ptr[li + 1])
            qw = (1.0 + math.log(tf)) * float(self.term_idf[li])
            scores[self.docs[a:b]] += self.weights[a:b].astype(np.float32) * qw
        nz = int(np.count_nonzero(scores))
        if nz == 0:
            return []
        k = min(k, nz)
        top = np.argpartition(-scores, k - 1)[:k]
        top = top[np.argsort(-scores[top], kind="stable")]
        pos = top if self.row_to_pos is None else self.row_to_pos[top]
        return [(int(p), float(scores[r])) for p, r in zip(pos, top)]

    # -- build / persist
    @classmethod
    def build(cls, texts: list[str], kind: str, bigrams: bool, row_to_pos: list[int] | None) -> "Index":
        n = len(texts)
        postings: dict[int, list[tuple[int, float]]] = {}
        doc_terms = []
        for row, text in enumerate(texts):
            c = Counter(h32(t) for t in terms(text, kind, bigrams))
            doc_terms.append(c)
            for hsh in c:
                postings.setdefault(hsh, []).append((row, 0.0))
        df = {hsh: len(p) for hsh, p in postings.items()}
        idf = {hsh: math.log((1 + n) / (1 + d)) + 1.0 for hsh, d in df.items()}
        # doc-normalized weights (sublinear tf * idf, L2 per doc)
        rows_w: dict[int, list[tuple[int, float]]] = {}
        for row, c in enumerate(doc_terms):
            ws = {hsh: (1.0 + math.log(tf)) * idf[hsh] for hsh, tf in c.items()}
            norm = math.sqrt(sum(w * w for w in ws.values())) or 1.0
            for hsh, w in ws.items():
                rows_w.setdefault(hsh, []).append((row, w / norm))
        keys = np.array(sorted(rows_w), dtype=np.uint32)
        ptr = np.zeros(len(keys) + 1, dtype=np.int64)
        docs_l, w_l = [], []
        for i, hsh in enumerate(keys):
            plist = rows_w[int(hsh)]
            docs_l.extend(r for r, _ in plist)
            w_l.extend(w for _, w in plist)
            ptr[i + 1] = ptr[i] + len(plist)
        return cls(kind, bigrams, keys, np.array([idf[int(h)] for h in keys], dtype=np.float32), ptr,
                   np.array(docs_l, dtype=np.uint16), np.array(w_l, dtype=np.float16),
                   None if row_to_pos is None else np.array(row_to_pos, dtype=np.uint16), n)

    def save(self, prefix: Path) -> None:
        np.save(f"{prefix}.hash.npy", self.term_hash)
        np.save(f"{prefix}.idf.npy", self.term_idf)
        np.save(f"{prefix}.ptr.npy", self.ptr)
        np.save(f"{prefix}.docs.npy", self.docs)
        np.save(f"{prefix}.w.npy", self.weights)
        if self.row_to_pos is not None:
            np.save(f"{prefix}.rows.npy", self.row_to_pos)
        Path(f"{prefix}.json").write_text(json.dumps({"kind": self.kind, "bigrams": self.bigrams, "n_rows": self.n_rows}))

    @classmethod
    def load(cls, prefix: Path) -> "Index":
        meta = json.loads(Path(f"{prefix}.json").read_text())
        m = lambda s: np.load(f"{prefix}.{s}.npy", mmap_mode="r")  # noqa: E731
        rows = Path(f"{prefix}.rows.npy")
        return cls(meta["kind"], meta["bigrams"], m("hash"), m("idf"), m("ptr"), m("docs"), m("w"),
                   np.load(rows, mmap_mode="r") if rows.exists() else None, meta["n_rows"])


# ------------------------------------------------------------ record store

class RecordStore(Sequence):
    """Hadith records kept compressed in memory; decompressed on access."""

    def __init__(self, dist: Path):
        meta = json.loads((dist / "records.json").read_text(encoding="utf-8"))
        self._shards = [(dist / name).read_bytes() for name in meta["shards"]]
        self._offsets = np.load(dist / "records.offsets.npy")  # (n, 3): shard, start, length
        self.ids: list[str] = meta["ids"]
        self._pos = {rid: i for i, rid in enumerate(self.ids)}

    def __len__(self) -> int:
        return len(self.ids)

    @lru_cache(maxsize=4096)
    def _get(self, i: int) -> dict:
        s, a, n = (int(x) for x in self._offsets[i])
        return json.loads(zlib.decompress(self._shards[s][a:a + n]))

    def __getitem__(self, i):  # type: ignore[override]
        if isinstance(i, slice):
            return [self._get(j) for j in range(*i.indices(len(self)))]
        if i < 0:
            i += len(self)
        return self._get(i)

    def __iter__(self) -> Iterator[dict]:
        for i in range(len(self)):
            yield self._get(i)

    def position(self, rid: str) -> int | None:
        return self._pos.get(rid)


class ById:
    """dict-like id -> record view over the store."""

    def __init__(self, store: RecordStore):
        self._s = store

    def get(self, rid: str, default=None):
        p = self._s.position(rid)
        return default if p is None else self._s[p]

    def __contains__(self, rid: str) -> bool:
        return self._s.position(rid) is not None

    def __getitem__(self, rid: str) -> dict:
        p = self._s.position(rid)
        if p is None:
            raise KeyError(rid)
        return self._s[p]


# ------------------------------------------------------------------ corpus

@dataclass
class Corpus:
    hadith: Sequence = field(default_factory=list)
    quran: list[dict] = field(default_factory=list)
    quran_pos: dict[str, int] = field(default_factory=dict)
    idx_hadith_ar: Index | None = None
    idx_hadith_tr: dict[str, Index] = field(default_factory=dict)
    idx_quran: Index | None = None
    manifest: dict = field(default_factory=dict)
    by_id: object = None

    @property
    def ready(self) -> bool:
        return self.idx_hadith_ar is not None and self.idx_quran is not None


def build_store(data_dir: Path = DATA_DIR, dist: Path = DIST) -> dict:
    """Compile data/hadith.jsonl.gz + data/quran.json into data/dist/."""
    hp, qp = data_dir / "hadith.jsonl.gz", data_dir / "quran.json"
    dist.mkdir(parents=True, exist_ok=True)
    for old in dist.glob("*"):
        old.unlink()
    records, matn_keys, tr_keys = [], [], {l: [] for l in SEARCH_LANGS}
    with gzip.open(hp, "rt", encoding="utf-8") as f:
        for pos, line in enumerate(f):
            r = json.loads(line)
            r["tr"] = {k: v for k, v in r.get("tr", {}).items() if k in SEARCH_LANGS}
            r.pop("ref", None)
            matn_keys.append(extract_matn(normalize_ar(r["ar"])))
            for lang, t in r["tr"].items():
                tr_keys[lang].append((pos, normalize_latin(t)))
            records.append(r)
    assert len(records) < 65535, "uint16 doc ids"

    shards, offsets, buf, shard_no = [], [], bytearray(), 0
    for r in records:
        blob = zlib.compress(json.dumps(r, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), 9)
        if len(buf) + len(blob) > SHARD_BYTES:
            shards.append(bytes(buf)); buf = bytearray(); shard_no += 1
        offsets.append((shard_no, len(buf), len(blob)))
        buf += blob
    shards.append(bytes(buf))
    names = []
    for i, s in enumerate(shards):
        name = f"records-{i:02d}.bin"
        (dist / name).write_bytes(s)
        names.append(name)
    np.save(dist / "records.offsets.npy", np.array(offsets, dtype=np.int64))
    (dist / "records.json").write_text(json.dumps({"version": STORE_VERSION, "shards": names,
                                                  "ids": [r["id"] for r in records]}, ensure_ascii=False), encoding="utf-8")

    Index.build(matn_keys, "ar", True, None).save(dist / "idx-hadith-ara")
    for lang, rows in tr_keys.items():
        if rows:
            Index.build([t for _, t in rows], "latin", False, [p for p, _ in rows]).save(dist / f"idx-hadith-{lang}")
    quran = json.loads(qp.read_text(encoding="utf-8"))
    Index.build([v["norm"] for v in quran], "ar", True, None).save(dist / "idx-quran")
    with gzip.open(dist / "quran.json.gz", "wt", encoding="utf-8") as f:
        json.dump(quran, f, ensure_ascii=False, separators=(",", ":"))
    mp = data_dir / "build_manifest.json"
    manifest = json.loads(mp.read_text(encoding="utf-8")) if mp.exists() else {}
    manifest["store_version"] = STORE_VERSION
    (dist / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"records": len(records), "verses": len(quran), "shards": len(names)}


def load_corpus(dist: Path = DIST) -> Corpus:
    t0 = time.time()
    if not (dist / "records.json").exists():
        raise FileNotFoundError(f"Compiled store not found in {dist}. Run: python scripts/build_data.py && python scripts/build_index.py")
    c = Corpus()
    store = RecordStore(dist)
    c.hadith, c.by_id = store, ById(store)
    with gzip.open(dist / "quran.json.gz", "rt", encoding="utf-8") as f:
        c.quran = json.load(f)
    c.quran_pos = {f"{v['surah']}:{v['ayah']}": i for i, v in enumerate(c.quran)}
    c.idx_hadith_ar = Index.load(dist / "idx-hadith-ara")
    for lang in SEARCH_LANGS:
        if (dist / f"idx-hadith-{lang}.json").exists():
            c.idx_hadith_tr[lang] = Index.load(dist / f"idx-hadith-{lang}")
    c.idx_quran = Index.load(dist / "idx-quran")
    mp = dist / "manifest.json"
    if mp.exists():
        c.manifest = json.loads(mp.read_text(encoding="utf-8"))
    log.info("corpus loaded: %d hadith, %d verses in %.2fs", len(store), len(c.quran), time.time() - t0)
    return c


_CORPUS: Corpus | None = None


def get_corpus() -> Corpus:
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = load_corpus()
    return _CORPUS
