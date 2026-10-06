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

### Live deployment
- Supabase database connected and the site deployed on Vercel with its environment variables; reports and review decisions verified end to end in production.

### Verified reviewer accounts
- **Problem:** with one shared password, anyone holding it could type any name, so a decision could not be proven to come from a real specialist.
- **Now:**
  - a specialist applies at **`/join`** (name, email, qualification, affiliation, profile link);
  - the admin verifies and **approves** them on `/review`;
  - the server issues a **personal access code** (shown once, stored only as a SHA-256 hash);
  - the reviewer signs in with it and every decision is **signed with their verified name** (`reviewer_id` is linked to the account);
  - the admin can re-issue a code or **revoke** an account at any time.
- `/review` is now a sign-in screen: nothing is shown until the server accepts the code. Reviewers see the register and reports; only the admin sees reviewer applications and emails.
- Database: new `reviewers` table, readable only by the server (row-level security, no public policies), in `supabase/migrations/002_reviewers.sql`. The privacy policy explains what reviewers' data is used for.
- Tests: 23 → **25** (apply, approve, sign in, decision signed with the verified name, re-issued code disables the old one, revoke, the honeypot, the admin must sign with a name).
- Verified in production: migration applied, the full flow tested live (apply → approve → sign in with the personal code → signed decision), and the **Sharia mentor onboarded as the first approved reviewer**.

### Website and desktop tool (UI round 1)
- **New desktop verification page `/verify`**, separate from the mobile app:
  - three columns: the message, the results list, and the full details of the selected result;
  - full details include the source passage, each scholar's grading, verse word tiles with recitation, the content level, the authentic alternative, and reporting;
  - evidence search mode;
  - screenshots by drag-and-drop or paste (read on the device);
  - Ctrl+Enter to verify;
  - a kind reply in 5 languages, the verdict card image, and a result link;
  - history shared with the app.
- **Hero redesigned:**
  - it fills the first screen;
  - a balanced two-line headline;
  - a laptop showing the desktop tool and a phone showing the app's verse screen, both filled live from the engine;
  - two entry cards, «على الحاسوب» → `/verify` and «على الجوال» → `/mobile`.
- **New «انضم إلى ثَبَت» section**: specialists apply as reviewers, users add a missing source, and anyone can share the tool.
- **Western digits (0–9) everywhere** (site, app, desktop tool, dates) so book numbers and verse numbers read clearly.
- The site's verify links (navigation, the ask bar, the tool section, the final call to action) now open `/verify`.

### Repeated and similar Quran verses
- **Problem:** repeated verses (e.g. «فبأي آلاء ربكما تكذبان» ×31) were cited at one arbitrary place. Near-identical verses (mutashabihat) could in principle be confused with their twin.
- **Method** (`backend/app/matching.py`, documented in [METHODOLOGY](docs/METHODOLOGY.md)):
  1. a whole-word scan of all 6,236 verses reports **every place** a quote occurs (about 1 ms);
  2. among close candidates, the verse with the **fewest changed words** wins;
  3. near twins (1–3 words apart) are shown as **«آيات متشابهة»** with their Mushaf text.
- Shown in the app and the desktop tool («ورد بلفظه في N مواضع», «آيات متشابهة»), and in a new website section «الآيات المتكررة والمتشابهة» with two live examples.
- Tests 25 → **28**; evaluation unchanged (98.6%, 0 critical errors).

## Day 3 · Tuesday 6 October

### Presentation
- **36 slides on the official challenge template** (`presentation/Thabat_Presentation.pdf` and `.pptx`), structured on the judging criteria: problem and success criterion, solution (desktop tool, details, verse diff, honesty, similar verses, reply, app), the AI pipeline and a comparison with alternatives, sources, scientific safety (levels أ–د), human review, the measured results with a native chart and their limits, the brand, UX and privacy, what was built during the challenge days, operations and cost, the roadmap, how to try it, and the participant. Speaker notes on every slide.

### README
- A step-by-step guide for the judges to run the project on their own computer (Windows, macOS, Linux, or Docker), with what to try and troubleshooting.

### Animated film
- **The 2-minute film** (`video/thabat_film120.mp4`): 13 scenes, slower pace, covering the problem, the desktop tool and the app, the scholars' gradings by name, the verse word by word, the authentic alternative, abstention and fatwa referral, repeated and similar verses, the AI pipeline («not RAG») with the measured numbers, the kind reply in 5 languages and the card, the specialist reviewers and levels أ–د, the idea of the logo, and the outro. It has an original 2-minute score synced to all 12 transitions.
- Earlier, a 60-second animated film (8 scenes, brand transitions, kinetic Arabic type). Every verdict, citation and count on screen is fetched live from the engine. It has an original score synthesized in code (no samples). Source: `video/film60.html`, `video/score.py`, `video/render.py`.

### `/about` — the maker, the idea, the brand
- A standalone **About page** (navbar «عن ثَبَت»), written in the participant's own voice:
  - a formal opening: «when design meets the understanding of language, verification becomes within everyone's reach»;
  - the story in three moments: the chaos, the idea, the making;
  - **the idea of the logo**, an interactive mark: three lines for the forwarded message, the highlighted line for the verified text, the diamond for «here», the rounded square for safety and familiarity;
  - the brand's purpose, mission, vision and promise;
  - the palette and the typefaces;
  - the 23-board brand-identity slider with a PDF download;
  - a career section from the CV: education, experience, skills, tools, and speedcubing (second in Algeria);
  - the research (multilingual chatbots for mental-health support).
- Home page: the grading-scale section is separated from the similar-verses section by an animated divider (lines drawing out from the brand diamond, with a travelling glint) from the palette; the final call to action is followed directly by the footer.
