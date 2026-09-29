# Methodology

## The problem

Forwarded messages in WhatsApp, Telegram and social media routinely attribute sayings to the Prophet ﷺ that are weak, fabricated or baseless, and misquote Quran verses (words added, dropped or swapped). People forward them with good intentions. Correcting them today means one of:

- asking a knowledgeable person (slow, and not everyone has one), or
- searching sites such as dorar.net or sunnah.com, which needs the exact wording, fails on everyday spelling, typos and translations, and does not work from a screenshot, or
- asking a general chatbot, which can invent references (the "hallucination" risk the challenge highlights).

**Thabat's single job:** paste a message or upload a screenshot, and within a second see, for each quote, where it comes from, what named scholars said about it, and a gentle, sourced reply you can send back, or an honest "we could not find this."

## Pipeline

```
message / screenshot
   │  (screenshot → on-device OCR, tesseract.js ara+eng)
   ▼
1. Segment      split into quotes; strip lead-ins ("قال رسول الله ﷺ:", "The Prophet (pbuh) said"),
                emojis, and forwarding pressure ("انشرها… أمانة في رقبتك"), which is flagged separately.
                [optional LLM: find quotes in messy text; propose an Arabic query for other languages]
   ▼
2. Retrieve     hashed TF-IDF (Arabic uni+bigrams, translations unigrams) over normalized text (Arabic: no diacritics, unified
                alef/ya/ta-marbuta, clitic stripping; matn separated from isnad) → top 40–60 candidates
   ▼
3. Align        character-level fuzzy alignment (RapidFuzz partial ratio + token coverage) → score 0..1
                Quran: best span of 1–4 consecutive verses, then a word-level diff
   ▼
4. Decide       register → Quran → hadith, with explicit thresholds and tie-break rules (below)
   ▼
5. Explain      evidence (collection, number, link), each grader by name with the exact label,
                authentic alternative, and a deterministic reply in ar / en / fr / id / tr
```

## Decision rules

| Rule | Why |
|---|---|
| Curated register first, unless a real narration matches clearly better (+0.03). | The register holds nuance the dataset lacks (e.g. a phrase graded differently from the full narration). But "Cleanliness is half of faith" is Muslim 223 and must not be caught by the baseless "Cleanliness is part of faith". |
| Quran exact match wins ties with hadith. A *misquoted* verse is reported only if it scores within 0.03 of the best hadith match. | Many hadith quote verses; a hadith that shares a verse phrase ("من كان يؤمن بالله واليوم الآخر") must not be mislabelled a misquoted verse. |
| A weak Quran match (0.62–0.80) counts only with ≥4 consecutive exact verse words forming half the quote. | Catches "ادعوني أستجب لكم إن الله يحب الداعين" (40:60 with an invented ending) without false alarms. |
| Hadith: strong ≥ 0.86 (Arabic) / 0.80 (translations); candidate ≥ 0.70 / 0.62. | Below candidate → **not found**. Between → **needs review** with the closest texts shown. |
| Two-word quotes only count on verbatim matches. | Very short sayings ("الدين النصيحة") are common but ambiguous. |
| Grade aggregation over all strong matches: any authentic *marfu'* route → authentic (weaker routes noted); only authentic *mawquf/maqtu'* → "sound, but not the Prophet's words"; graders disagree → disputed; all weak → weak; all fabricated → fabricated. | Mirrors the hadith-science principle that a text established through one sound route is not cancelled by weaker routes. |
| Sahih al-Bukhari and Sahih Muslim entries have no per-hadith grades in the dataset; they are marked "in the two Sahihs". | Scholarly consensus on accepting their connected reports. |
| Nawawi's Forty and Forty Qudsi (secondary compilations, ungraded) never decide a verdict alone. | They cite primary sources; the primary source should decide. |

## Status taxonomy and the annex's four content levels

The challenge's scientific annex (*المرجعية والحزمة العلمية والبيانات*, p.2) defines four content levels, each with a required behaviour. Every Thabat result carries one of them (`backend/app/verify.py`, `STATUS` and `LEVELS`):

| Status | Annex level | Behaviour required by the annex, and what Thabat does |
|---|---|---|
| `quran_exact` | **أ** stable original information | Direct answer documented with its source: surah and ayah, Mushaf text, link |
| `quran_variant` | **أ** | "A question containing a misquoted verse": gentle correction showing the surah, ayah and correct text; the distorted wording is never built upon (annex p.6) |
| `authentic` | **أ** | Direct answer: collection, number and named graders |
| `authentic_by_routes` | **ب** explanation | Reference shown, with the explanation that the quoted phrase and the full narration are graded differently |
| `authentic_mawquf` | **ب** | "Sound, but the words of a Companion or Successor, not the Prophet ﷺ" |
| `weak`, `fabricated`, `baseless` | **ب** | Grading attributed to named scholars with the reference; not presented as Thabat's own judgement |
| `disputed` | **ج** disputed | The disagreement is stated, each grader named, and the question is referred to a specialist |
| `needs_review`, `not_found` | **ج** | Abstain and refer ("not found in indexed sources ≠ fabricated") |
| fatwa request (scope guard) | **د** fatwa / personal case | No independent ruling; states the tool's nature and refers to an official fatwa body |

## Scope guard (`backend/app/scope.py`)

The annex forbids independent fatwas and requires referral for personal cases. Users still paste such questions, so before verifying, every message is classified:

| Detected | Example | Response |
|---|---|---|
| Personal ruling request | «أنا في دولة أوروبية، هل يجوز لي…؟», "Is it halal for me to…" | Level **د**: "Thabat does not issue fatwas" + referral (alifta.gov.sa) |
| Ruling question | «ما حكم الموسيقى؟» | Level **ج**: no weighing of opinions; referral to an approved fiqh reference (dorar.net/feqhia) |
| General question with no quote | «لماذا يعبد المسلمون الكعبة؟» | Out of scope; pointer to *Bayyinat*, the Q&A reference named in the annex |

A question line is still checked (some hadith are phrased as questions) and only dropped if nothing matches, so it is never reported as a "missing quote".

## Evidence search (`backend/app/search.py`)

"Give me an authentic hadith about X" is served from the same index. Only verses and hadith graded acceptable (marfu') are returned. Topic terms must all appear (≤ 3 terms) or 75% of them (longer topics). When nothing qualifies, the answer is the annex's required behaviour: "no matching evidence found; we will not invent one".

## Role of AI, and why this design

| Component | Technique | Why this and not something bigger |
|---|---|---|
| Arabic normalization + matn extraction | Rule-based NLP | Removes the main failure of exact search (diacritics, spelling, isnad). Deterministic and auditable. |
| Candidate retrieval | TF-IDF over hashed terms, stored as a NumPy inverted index (uint16 doc ids, float16 weights, memory-mapped) | ≈25 ms per message on CPU, ~0.3 s cold start, ~120 MB RAM, identical results on every run, and small enough to run as a serverless function. |
| Re-ranking/alignment | Fuzzy character alignment | Tolerates typos and partial quotes. Gives the exact aligned span, which drives the Quran word diff and the highlighted hadith snippet. |
| Screenshot reading | OCR (tesseract.js), on device | Most forwards arrive as images. Running OCR on the user's device keeps images private. |
| Quote finding / cross-language query | LLM (Claude), optional | Helps with messy, long or other-language messages. Its output is only a search query; it cannot create evidence. Matches found this way are labelled and capped at medium confidence. |

**Why not a RAG chatbot?** Generating an answer invites the model to paraphrase or invent a reference. Thabat never generates the evidence. Every sentence a user sees about a source is either verbatim source data or a fixed, reviewable template.

## Known limitations

- Coverage is limited to the Quran and nine hadith books. Many narrations (e.g. Musnad Ahmad, al-Hakim, al-Tabarani, al-Bayhaqi) are not yet indexed, so a real but uncovered hadith returns **not found**, never "fabricated". Adding collections is the first roadmap item.
- Gradings are those in the dataset. Scholars' gradings of the full narration may not apply to a quoted fragment (see register entry R014). The register handles known cases; others need specialist review.
- Paraphrases far from any published translation (e.g. the Indonesian case in the evaluation) are missed by the deterministic core; the optional LLM step targets them.
- The curated register is a draft until reviewed by a qualified specialist.
