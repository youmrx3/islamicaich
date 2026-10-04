# Challenge log: 4–6 October 2026

Only work done during the challenge days is judged. Everything up to the git tag **`baseline-pre-challenge`** is prior work, described in [docs/BASELINE.md](docs/BASELINE.md). To see exactly what changed during the challenge:

```bash
git diff --stat baseline-pre-challenge..HEAD
git log --oneline baseline-pre-challenge..HEAD
```

---

## Day 1 · Sunday 4 October

### Brand and design
- Applied the new **Thabat brand identity** across the product: the layered mark (logo, app icon, maskable icon, favicon, social preview image), the colour system (ليل / نور / صباح / رمل / خزامى / مشمش), Alexandria for the interface and Amiri for sacred text, and a calm grading palette with a seventh colour for scholarly disagreement (خلاف).
- Re-implemented the website and app designs in code, with changes where the design was factually unsafe:
  - real counts instead of an invented "38 sources";
  - an unverified hadith quotation removed;
  - a "does it change the meaning?" judgement replaced with "quote the verse exactly as in the Mushaf";
  - no fake store badges;
  - no personal names in greetings.

### Website (`/`)
- New landing page. Every verdict on it is **fetched live from the engine**, so the website cannot drift from what the tool actually says:
  - hero phone;
  - scroll story (read → match → judge);
  - word-by-word verse tiles;
  - 3D grading ring;
  - live checker in a browser mock, with a result link and WhatsApp sharing.
- **New section «الذكاء الاصطناعي وراء ثَبَت» (`#ai`)** explains the AI method: the six stages, why it is *not RAG*, and four guarantees (deterministic, abstains, measured, fast).
- Sections on the annex's four content levels and principles, measured results, sources, upcoming features, FAQ. Arabic and English.

### Mobile app (`/app`, installable PWA)
- New app shell from the design:
  - home with paste, screenshot and clipboard;
  - an analysis animation that follows real steps;
  - results strip;
  - hadith detail with the source passage highlighted;
  - a verse panel with word tiles and a **listen** button (recitation streamed from everyayah.com);
  - history and saved items (on the device only);
  - evidence search;
  - settings (language, install, how the AI works, privacy) with the "coming soon" list.
- **Share the result kindly**: a reply sheet in 5 languages, plus a **verdict card image (PNG)** for groups.
- **Installable** on Android and iPhone: web manifest, icons, service worker (shell cached, API never cached), and app shortcuts.
- **Android share target**: share a WhatsApp message to Thabat and it is checked directly.

### Phone simulator for judges (`/mobile`)
- The real app inside a phone frame, with a list of 14 screens, a QR code to open it on a real phone, and install steps.
- **Native-only features are shown as labelled simulations** («محاكاة لميزة التطبيق الأصلي — قريبًا»). They call the real API:
  - floating bubble over a chat;
  - home-screen and lock-screen widgets;
  - iOS share sheet with Dynamic Island;
  - WhatsApp bot conversation.

### Backend
- **Specialist review workflow**: `POST /api/review` (token-protected) records approve / needs edit / reject with the reviewer's name and a note. The register and every result show "reviewed by …" or "pending review". New `/review` page.
- **Supabase** storage for reports and review decisions (`supabase/schema.sql`, row-level security; the public key can only insert reports), with a local file fallback.
- **Report kinds**: problem, request review, suggest a source.
- **Hadith of the day** (`GET /api/daily`): 18 short authentic hadith. Each text is cut from the source record itself, never retyped.
- **Verse audio links** on every verse result.
- Message understanding fixes:
  - the verse/hadith hint is taken from the text before *each* quote, so a hadith after a verse is no longer treated as a verse;
  - a forwarding-pressure clause is now removed without dropping the quote on the same line.

### Quality
- Tests: 18 → **23** (new: daily hadith comes from the source record, verse audio, the review token and decision flow, write-only public reports, pressure-line handling).
- Evaluation unchanged: **98.6%** correct, **0 critical errors**, 98.5% recall@3 on noisy Arabic.
- Visual QA at desktop and phone widths, in Arabic and English.

### Documentation and repository
- README rewritten; new [AI usage disclosure](docs/AI_USAGE.md); sources log updated (fonts, Supabase, audio, QR library, brand); deployment guide updated for Supabase.
- Outdated material removed: old screenshots, the pre-challenge decks and video, and the old pitch notes. The final presentation and video will be added at submission.

---

## Day 2 · Monday 5 October
*(to be filled)*

## Day 3 · Tuesday 6 October
*(to be filled)*
