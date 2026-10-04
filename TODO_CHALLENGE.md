# Thabat — Challenge Plan (4–6 Oct 2026)

**Deadline:** Tue 6 Oct, 11:59 pm Riyadh. **We submit by Tue 8:00 pm** (rest = buffer).
Say "do W2" to start an item. **Y** = Youcef · **C** = Claude.

---

## Decisions (done)

| Topic | Decision |
|---|---|
| Mobile app | **PWA**: one codebase with the website. Installable on Android + iPhone ("Add to Home Screen"). Judges try it on the site at **`/mobile`** (the app inside a phone frame). |
| Screenshot reading in the app | Same on-device reader as the website (tesseract.js). The image never leaves the phone. |
| Database | **Supabase**: problem reports + reviewer decisions. History stays on the user's device only. |
| App stores | Later (native wrapper with Capacitor) → shown as *Coming soon*. |
| AI method | Retrieval-based verification: Arabic NLP + TF-IDF search + fuzzy alignment + rules + OCR; optional Claude for quote extraction only. **Not RAG.** |

## Must not break (check before every deploy)

- [ ] Sacred text shown **exactly** as in the source. Never typed by hand, never edited.
- [ ] No invented reference, grading or scholar name. New sayings stay **draft** until reviewed.
- [ ] Every result has: source, level أ/ب/ج/د, the "not a fatwa / automated" note.
- [ ] Tests green + evaluation **0 critical errors**.
- [ ] No secrets or real user data in the repo.
- [ ] Every AI tool used (Claude Design, Claude Code, Illustrator AI, video AI…) logged in `docs/AI_USAGE.md`.

---

## Day 1 — Sun 4 Oct

**Youcef**
- [ ] B1 Brand identity in Illustrator: logo set, colours, fonts (check licences), icon/pattern.
- [ ] B2 Export to `brand/`: SVG + PNG logos, app icon 1024 px, favicon, colour hex list, font names.
- [ ] B3 Send the **Claude Design website** export (HTML or images).
- [ ] B4 Book the **Sharia mentor** (10 am–7 pm) to review the sayings list + help with test cases.

**Claude**
- [ ] S1 Start the challenge log + `docs/AI_USAGE.md`.
- [ ] S2 Connect **Supabase** (reports + review log); keep a fallback if it's down.
- [ ] S3 Review page: approve / edit / reject + reviewer name → log → "reviewed" badge on results.
- [ ] S4 **Verdict card image**: download/share a PNG of any result.
- [ ] S5 Start the **independent test set** (≥ 60 cases) with the mentor's input.

## Day 2 — Mon 5 Oct

**Youcef**
- [ ] A1 Send the **Claude Design app** screens:
  - Home;
  - Results;
  - Result detail;
  - Reply;
  - Search;
  - History;
  - Settings;
  - Coming soon.
- [ ] A2 Social media posts: launch, how-it-works carousel, stat card, "try it" + QR. Quotes only from the app's verified output.
- [ ] A3 Quick test with **5 people**: "is this message safe to share?" Note the time + what confused them.

**Claude**
- [ ] W1 Build the **redesigned website** (landing + checker) with the new brand, AR/EN. All functions unchanged.
- [ ] W2 Build the **mobile app (PWA)** from your screens:
  - install prompt, icon and splash;
  - paste / screenshot / share-to-app on Android;
  - results, reply, search;
  - local history;
  - settings, coming soon.
- [ ] W3 **`/mobile` page**: the app inside a phone frame for the judges + a QR code to open it on a real phone.
- [ ] W4 Add more known sayings (only with checkable references, all *draft*) + run the independent test set 3 times.
- [ ] W5 Fix whatever the 5-person test shows; write down what changed.

## Day 3 — Tue 6 Oct (submit by 8 pm)

**Youcef**
- [ ] V1 **Animation video, ≤ 2:00**: problem → app in action → how the AI works → trust (levels, no fatwa) → results → try it.
- [ ] P1 Brand pages for the deck (logo, colours, type, app, social posts).
- [ ] P2 Final visual pass on the deck.

**Claude**
- [ ] Q1 Final quality check: sacred text, links, the 4 annex test types, phone sizes, offline/error states.
- [ ] R1 Deploy to Vercel + set env vars; test the live link from a phone.
- [ ] P3 **Final presentation** on the official template, with real screenshots and numbers. It marks clearly *built during 4–6 Oct* vs *before*, and includes your brand pages and the participant slide.
- [ ] R2 Update the README + docs; tag `challenge-final`.

## Submission (Tue by 8 pm) — Youcef submits

- [ ] Live link (website + `/mobile`)
- [ ] Public GitHub repo
- [ ] Video ≤ 2:00
- [ ] Presentation (PDF/PPTX)
- [ ] Sources documentation (`docs/SOURCES.md`, `docs/RELIABILITY.md`, `docs/AI_USAGE.md`)
- [ ] Save the confirmation (screenshot + email). If the portal fails: email info@IslamicAIch.org before the deadline.

---

## Coming soon (show, don't build)

Native apps on the stores · Telegram/WhatsApp bot · more hadith books · King Fahd Complex Quran text · public API · browser extension · more reply languages · offline mode.

## Log

| Time | Done | Commit |
|---|---|---|
| Sun 4 Oct | Plan written | c29e9f3 |
