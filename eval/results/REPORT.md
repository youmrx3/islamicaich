# Thabat evaluation report

Run: 2026-09-29 11:45 UTC · corpus: 36064 hadith, 6236 verses · seed 42 · LLM: off (deterministic core)

## 1. Curated cases

- **Accuracy:** 72/73 (98.6%)
- **Critical errors:** 0 (a non-established text called authentic, or an authentic text called fabricated/weak)
- **Median latency:** 23.4 ms per message

| Category | Correct | Total |
|---|---:|---:|
| annex | 8 | 8 |
| cross_attribution | 2 | 2 |
| hadith_ar | 11 | 11 |
| hadith_ar_noisy | 5 | 5 |
| hadith_translation | 5 | 6 |
| invented | 11 | 11 |
| multi | 1 | 1 |
| quran_exact | 11 | 11 |
| quran_variant | 5 | 5 |
| registry | 13 | 13 |

### Cases not matching expectation

| Category | Text | Expected | Got | Critical |
|---|---|---|---|---|
| hadith_translation | Sesungguhnya setiap amalan tergantung pada niatnya | authentic, needs_review | not_found | no |

## 2. Sampled retrieval vs. simpler baselines

A random phrase (8–12 words) from a random hadith is searched. *Noisy* adds one dropped word and one common phone misspelling (ه/ة, ي/ى, ا/أ…).
Baselines: *exact raw* = Ctrl+F on the source as published (with diacritics); *exact normalized* = Ctrl+F after removing diacritics.

| Suite | n | Thabat recall@1 | Thabat recall@3 | Baseline exact (raw) | Baseline exact (normalized) |
|---|---:|---:|---:|---:|---:|
| arabic_clean | 200 | 100.0% | 100.0% | 0.0% | 100.0% |
| arabic_noisy | 200 | 94.0% | 98.5% | 0.0% | 0.0% |
| english | 100 | 97.0% | 97.0% | 3.0% | 100.0% |

## 3. Determinism

Two full runs of the curated suite produced identical outputs.

## Limits of this evaluation

- The curated cases were written during development and matching thresholds were tuned while running them, so these figures are optimistic. A held-out set written by a hadith specialist (planned for the challenge days) is the honest test.
- Curated expectations for the register were written by the team from published gradings and must be confirmed by a hadith specialist (all register entries are marked draft).
- Sampled retrieval measures finding the right source, not the correctness of the scholars' gradings, which are taken from the dataset as published.
- Paraphrases far from any published translation are out of scope for the deterministic core; the optional LLM step targets them and is evaluated separately.
