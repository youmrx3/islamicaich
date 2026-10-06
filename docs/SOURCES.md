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
| Curated register of popular sayings | Written by the participant: `data/curated/registry.json` | Known fabricated, baseless, weak, disputed and "phrase-vs-narration" cases, each with an authentic alternative | 2026-09-25 | Participant's own work. References cite published scholarly works (al-Albani's *al-Silsila al-Da'ifa* and *Sahih al-Jami'*, Ibn al-Jawzi's *al-Mawdu'at*, al-Sakhawi's *al-Maqasid al-Hasana*) by title and number only; no text from those works is reproduced. Every entry is marked **draft, pending specialist review**. |
| Link-outs for independent checking | sunnah.com, quran.com, dorar.net/hadith (search link per quote) | "Open source" / "cross-check" links on each result | 2026-09-25 / 2026-09-29 | Links only; no content copied. |
| Verse recitation audio | everyayah.com, recitation of Mishary Rashid Alafasy (128 kbps), file `{surah}{ayah}.mp3` | "Listen" button on verse results; streamed from everyayah.com when the user presses play | 2026-10-04 | Streamed from the publisher, not copied or redistributed. The text shown is always the Tanzil text, never derived from audio. |
| Referral targets named in the scientific annex | alifta.gov.sa (fatwa), dorar.net/feqhia (fiqh), dawa.center/file/7937 (*Bayyinat* Q&A) | Referral links for fatwa requests, ruling questions and general questions | 2026-09-29 | Links only. |
| Challenge scientific annex | *المرجعية والحزمة العلمية والبيانات* (organizer document) | Content levels أ–د, mandatory standard, test cases, term dictionary | 2026-09-29 | Used as requirements; not redistributed. |

## Software, models and services

| Type | Component | Used for | Date | Licence |
|---|---|---|---|---|
| Web framework | FastAPI, Uvicorn, Pydantic | API server | 2026-09-25 | MIT / BSD-3 |
| Retrieval | NumPy (own inverted-index implementation; scikit-learn/SciPy were used before 2026-09-29 and removed) | Candidate search | 2026-09-25 | BSD-3 |
| Fuzzy alignment | RapidFuzz | Re-ranking, alignment, partial matches | 2026-09-25 | MIT |
| OCR (client side) | tesseract.js v5 (loaded from cdn.jsdelivr.net) with Arabic + English trained data | Reading screenshots on the user's device | 2026-09-25 | Apache-2.0 |
| LLM (optional) | Anthropic Claude via the official `anthropic` Python SDK (default model `claude-opus-5-5`, configurable) | Only: locating quotes in messy messages and proposing an Arabic search query for languages not searched directly. Never used as evidence. | 2026-09-25 | Commercial API, Anthropic terms. Off unless `ANTHROPIC_API_KEY` is set. |
| Fonts | Alexandria (interface) and Amiri (sacred text), Google Fonts. Earlier versions used Reem Kufi and IBM Plex (replaced on 2026-10-04) | Typography of the website and app | 2026-10-04 | SIL Open Font License 1.1 |
| QR code (client side) | qrcode-generator 1.4.4 (Kazuhiko Arase), loaded from cdn.jsdelivr.net | QR code on `/mobile` that opens the app on a phone | 2026-10-04 | MIT |
| Hosting | Vercel (Python runtime + CDN) | Serving the site and API | 2026-09-29 | Vercel terms. |
| Database | Supabase (Postgres, accessed through its REST API with row-level security; schema in `supabase/schema.sql`) | Storing "report a problem" / "request review" flags and the specialists' review decisions | 2026-10-04 (replaced Upstash Redis, used from 2026-09-29) | Supabase terms. Stores no identifiers and no message history; the anonymous key can only insert reports. |
| AI tools used to build the project | Claude Code, Claude Design and others | Listed one by one, with what each produced, in [AI_USAGE.md](AI_USAGE.md) | 2026-09-25 → | Disclosed per terms §9: AI-assisted output is not presented as unassisted human work. |

## Brand and visual assets

| Asset | Origin | Licence |
|---|---|---|
| Thabat brand identity (logo, mark, colours, app icons) | Designed by the participant, Youcef Kouadria (`public/assets/brand/`, `public/assets/icons/`) | Participant's own work |
| Website and app layouts | The participant's design files (made with Claude Design, see [AI_USAGE.md](AI_USAGE.md)), re-implemented and adapted in code | Participant's own work |
| Brand identity book (23 boards + PDF) shown on the website | The participant's own design, `public/assets/brandbook/` (web-sized copies of the original boards) | Participant's own work |
| Participant photo and bio (website section «من صنع ثَبَت») | Provided by the participant for publication | Published with the participant's consent |
| Challenge logo (footer, "participating in") | Organizer's logo, `public/assets/brand/challenge.svg` | Used only to indicate participation, as provided by the organizer |

## Data the product does NOT use

- No real user conversations, chat logs or personal data were used to build or test Thabat. All test messages in `eval/cases.json` and the UI examples are synthetic; texts in the `invented` category were written for testing and are explicitly not hadith.
- Messages submitted to the live app are processed in memory and not stored on the server. The app's history and saved items stay in the browser's local storage on the user's device. Only explicit "report a problem" / "request review" flags are saved (quote, verdict, optional comment; no identifiers).
- The "simulation" screens (floating bubble, widgets, iOS share sheet, WhatsApp bot) use synthetic messages; the group names and senders shown in them are invented.
