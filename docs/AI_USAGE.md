# AI usage disclosure

The challenge terms (§9) require every AI tool to be disclosed, and AI-assisted work must not be presented as unassisted human work. This file covers both:

1. **AI inside the product**: what runs when a message is checked.
2. **AI used to build the project**: the tools the participant used to write code, design and produce media.

---

## 1. AI inside Thabat

Thabat uses **retrieval-based verification with Arabic NLP**. It is **not** a generative chatbot and **not RAG**. A RAG system retrieves passages and then lets a language model *write* the answer, which is where invented references come from. In Thabat every verdict is assembled from the source record itself (verbatim text, collection and number, each scholar's grading by name) using fixed, reviewable rules. No model writes evidence.

| Step | Technique | AI family | Where | What it decides |
|---|---|---|---|---|
| 1. Read images | Optical character recognition (tesseract.js v5, LSTM models for Arabic + English) | Computer vision | In the browser. The image never leaves the device | Turns a screenshot into text |
| 2. Understand the message | Arabic normalisation (diacritics, hamza, ta marbuta, alef forms), lead-in / pressure-phrase stripping, isnad–matn separation, per-quote segmentation | Rule-based Arabic NLP | Server (`backend/app/normalize.py`, `verify.py`) | Which parts are quotes, and whether each looks like a verse or a hadith |
| 3. Find candidates | TF-IDF inverted index over 36,064 narrations and 6,236 verses (hashed word terms with light Arabic clitic stripping, NumPy, memory-mapped) | Information retrieval | Server (`corpus.py`) | A short list of possible sources, despite typos and missing diacritics |
| 4. Align | Fuzzy string alignment (RapidFuzz) and word-level diff against the Mushaf | Approximate string matching | Server (`matching.py`) | Exact match, misquoted verse (which words differ), partial or similar wording |
| 5. Judge | Grade aggregation over the named scholars' gradings, register-first rules, abstention, annex content level أ/ب/ج/د, scope guard (fatwa / ruling / general question) | Rule-based reasoning (expert system) | Server (`grades.py`, `verify.py`, `scope.py`) | The status shown, or an honest "no source found" |
| 6. Optional assist | Anthropic Claude (`claude-opus-5-5` by default, configurable). **Off unless `ANTHROPIC_API_KEY` is set** | Large language model | Server (`llm.py`) | Only: locating quotes inside long or messy messages, and proposing an Arabic search query for other languages. Anything found this way goes through steps 3–5 and is labelled. It never grades, never cites, never writes the reply |

Safeguards that follow from this design:

- The same message always gives the same result (checked by the evaluation's determinism test).
- "Not found" never means "fabricated". The app abstains and refers to a specialist.
- Every result carries a transparency note: it is an automated result based on documented sources, not a fatwa and not a human scholar's opinion.
- Sacred text is displayed from the source files exactly. It is never typed by hand, generated or "corrected" by a model.

Measured results are in [`eval/results/REPORT.md`](../eval/results/REPORT.md): 98.6% correct on 73 curated cases, 0 critical errors, 98.5% recall@3 on noisy Arabic phrases (exact search: 0%).

---

## 2. AI tools used to build the project

The participant (Youcef Kouadria) is responsible for the concept, the method, the brand and every decision. AI tools were used as assistants, and their output was reviewed before use.

| Tool | Provider | Used for | Output in the repository | Human role |
|---|---|---|---|---|
| **Claude Code** | Anthropic | Coding assistant: drafting and refactoring backend and frontend code, tests, evaluation scripts and documentation; visual QA with screenshots | Code across `backend/`, `public/`, `eval/`, `scripts/`, and the docs | The participant chose the method and architecture, set the rules (no retyped sacred text, no invented references, annex levels), and reviewed and tested the output |
| **Claude Design** | Anthropic | Exploring layouts for the website and the mobile app from the participant's brief and brand | Not committed. The designs were re-implemented in code and adapted (layout, content, and corrections to factual claims) | The participant briefed and selected the designs |
| **Claude Code** (media) | Anthropic | Writing the animated film as a web page rendered frame by frame (`video/film120.html`, `video/render.py`), synthesizing its original score in code (`video/score.py`, no samples), and building the presentation on the official template | `video/`, `presentation/` | The participant directed the content, the pace and the brand, and reviewed every scene and slide; all verdicts shown in the film are fetched live from the engine |
| **Google Flow** | Google | Generating brand visuals from the participant's logo: scene and mockup images (for example the exhibition booth, the app in hand, apparel) used in the brand book | `public/assets/brandbook/` (some boards), `brand/` source files (not committed) | The participant wrote the prompts, selected the images and composed the boards; the logo and identity themselves are his own design |
| **Adobe Photoshop** (AI-assisted features) | Adobe | Compositing and retouching the brand mockups and visuals | Brand-book boards | Designed and finalised by the participant |
| **Adobe Illustrator** (AI-assisted features) | Adobe | Vector work on the brand identity and the brand-book layouts | `public/assets/brand/`, brand-book boards | The logo concept, the grid and the colour system are the participant's own design |
| **Claude (API)**, optional | Anthropic | Runtime quote extraction only (see part 1) | `backend/app/llm.py` | Off by default; never used as evidence |

### Not AI-generated

- **All Quran text, hadith text and gradings** come from the published datasets listed in [SOURCES.md](SOURCES.md), verbatim.
- **The curated register** (`data/curated/registry.json`) cites published scholarly works by title and number. Entries stay *draft* until a named specialist approves them on `/review`.
- **Test messages** are synthetic, written for testing. No real user conversations were used.
- **The brand identity** (logo, mark, colour system) is the participant's own design work; AI tools were used only for mockup scenes and finishing, as listed above.

### Complete list

The tools above are the complete list of AI tools used to build Thabat, as declared by the participant on 6 October 2026.
