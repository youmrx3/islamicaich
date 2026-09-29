# Sources, tools and licences log

Required by the challenge terms (§9): type, source, purpose, date of use and legal basis of every work, dataset, model and tool used.
Dates are when the item was first used in this project. Hadith and Quran data are downloaded at build time by `scripts/build_data.py`; exact URLs are also written to `data/build_manifest.json`.

## Content sources (what verdicts are based on)

| Type | Source | Used for | Date | Licence / legal basis |
|---|---|---|---|---|
| Quran text (Uthmani script) | Tanzil Quran Text, tanzil.net, via `tanzil.net/pub/download` | Displaying the verified verse | 2026-09-25 | Creative Commons Attribution 3.0. Used verbatim; not modified. Attribution: “Tanzil Quran Text, tanzil.net”. |
| Quran text (simple/imla'i script) | Tanzil Quran Text, same source | Matching quotes typed in everyday spelling | 2026-09-25 | Same as above. Normalized copies exist only in memory as search keys and are never displayed or distributed as Quran text. |
| Hadith collections (Arabic, 9 books) | `fawazahmed0/hadith-api` v1 (GitHub), served by cdn.jsdelivr.net | Arabic text of Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah, Muwatta Malik, Nawawi's Forty, Forty Qudsi | 2026-09-25 | The Unlicense (public domain dedication). |
| Hadith translations (eng, fra, ind, tur) | Same repository | Cross-language search and display | 2026-09-25 | The Unlicense. |
| Hadith gradings | Same repository (grades by al-Albani, Zubair Ali Zai, Shuaib al-Arnaut, Ahmad Shakir, and others, as published in that dataset) | Showing each named grader's verdict; aggregating status | 2026-09-25 | The Unlicense. Gradings are attributed to their scholars by name and shown verbatim. |
| Curated register of popular sayings | Written by the team: `data/curated/registry.json` | Known fabricated, baseless, weak, disputed and "phrase-vs-narration" cases, each with an authentic alternative | 2026-09-25 | Team's own work. References cite published scholarly works (al-Albani's *al-Silsila al-Da'ifa* and *Sahih al-Jami'*, Ibn al-Jawzi's *al-Mawdu'at*, al-Sakhawi's *al-Maqasid al-Hasana*) by title and number only; no text from those works is reproduced. Every entry is marked **draft, pending specialist review**. |
| Link-outs for independent checking | sunnah.com, quran.com, dorar.net/hadith (search link per quote) | "Open source" / "cross-check" links on each result | 2026-09-25 / 2026-09-29 | Links only; no content copied. |
| Referral targets named in the scientific annex | alifta.gov.sa (fatwa), dorar.net/feqhia (fiqh), dawa.center/file/7937 (*Bayyinat* Q&A) | Referral links for fatwa requests, ruling questions and general questions | 2026-09-29 | Links only. |
| Challenge scientific annex | *المرجعية والحزمة العلمية والبيانات* (organizer document) | Content levels أ–د, mandatory standard, test cases, term dictionary | 2026-09-29 | Used as requirements; not redistributed. |

## Software, models and services

| Type | Component | Used for | Date | Licence |
|---|---|---|---|---|
| Web framework | FastAPI, Uvicorn, Pydantic | API server | 2026-09-25 | MIT / BSD-3 |
| Retrieval | NumPy (own inverted-index implementation; scikit-learn/SciPy were used before 2026-09-29 and removed) | Candidate search | 2026-09-25 | BSD-3 |
| Fuzzy alignment | RapidFuzz | Re-ranking, alignment, partial matches | 2026-09-25 | MIT |
| OCR (client side) | tesseract.js v5 (loaded from cdn.jsdelivr.net) with Arabic + English trained data | Reading screenshots on the user's device | 2026-09-25 | Apache-2.0 |
| LLM (optional) | Anthropic Claude via the official `anthropic` Python SDK (default model `claude-opus-5`, configurable) | Only: locating quotes in messy messages and proposing an Arabic search query for languages not searched directly. Never used as evidence. | 2026-09-25 | Commercial API, Anthropic terms. Off unless `ANTHROPIC_API_KEY` is set. |
| Fonts | Amiri, Reem Kufi, IBM Plex Sans Arabic, IBM Plex Sans, IBM Plex Mono (Google Fonts) | Interface typography | 2026-09-25 | SIL Open Font License 1.1 |
| Hosting | Vercel (Python runtime + CDN) | Serving the site and API | 2026-09-29 | Vercel terms. |
| Report storage (optional) | Upstash Redis via REST API | Persisting "report a problem" flags | 2026-09-29 | Upstash terms; stores no identifiers. |
| Development assistant | Claude Code (Anthropic) | Code and documentation drafting, reviewed by the team | 2026-09-25 | Disclosed per terms §9: AI-assisted output is not presented as unassisted human work. |

## Data the product does NOT use

- No real user conversations, chat logs or personal data were used to build or test Thabat. All test messages in `eval/cases.json` and the UI examples are synthetic; texts in the `invented` category were written by the team for testing and are explicitly not hadith.
- Messages submitted to the live app are processed in memory and not stored. Only explicit "report a problem" flags are saved (quote, verdict, optional comment; no identifiers).
