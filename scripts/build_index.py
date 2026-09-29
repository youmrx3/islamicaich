"""Compile the downloaded corpora into the compact, committed store in data/dist/.

Run after scripts/build_data.py:  python scripts/build_index.py
"""
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.corpus import DIST, build_store  # noqa: E402

if __name__ == "__main__":
    t0 = time.time()
    info = build_store()
    size = sum(p.stat().st_size for p in DIST.glob("*"))
    print(f"built {info} in {time.time() - t0:.0f}s; data/dist = {size / 2**20:.1f} MB")
    for p in sorted(DIST.glob("*")):
        print(f"  {p.name:32s} {p.stat().st_size / 2**20:7.2f} MB")
