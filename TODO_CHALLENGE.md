# Thabat — Challenge Days Plan (4–6 October 2026)

**Hard deadline:** Tuesday 6 Oct 2026, **11:59 pm Riyadh time** (UTC+3).
**Our internal deadline:** Tuesday 6 Oct, **8:00 pm**. Everything is submitted by then; the last 4 hours are buffer only.
**Remaining at plan time:** ~2 days 12 h.

Every item has an ID (e.g. `W3`). To work on one, say "do W3". Tick `[x]` when done.
Owner: **Y** = Youcef (design work in Claude Design / Illustrator), **C** = Claude (code, data, QA, docs, deploy), **Y+C** = both.

---

## 0. Ground rules (read once, apply to everything)

### 0.1 Competition rules that shape this plan

- **Only work done 4–6 Oct is judged.** Everything up to tag `baseline-pre-challenge` is declared prior work. Commit often (small commits, clear messages); the git history is our proof of what was built during the challenge.
- **Required submission outputs (guide p.14), all six by the deadline:**
  1. A complete solution that **fully works**, not a prototype.
  2. A **public GitHub repo** with run docs and no secrets.
  3. A **video of 2 minutes or less**.
  4. A **presentation (PDF or PPTX)** on the unified template.
  5. **Documentation of content and religious sources**.
  6. A **live demo link**.
- **AI must do a real job** (25% of the final score). The AI has to perform a real function with a clear method. It is judged by proven value, not complexity.
- **Disclose every AI tool used** (terms §9). That includes Claude Design, Claude Code, Illustrator AI features, any image/video generator, and the Claude API. Log each tool with its purpose, date and licence in `docs/SOURCES.md`. Never present AI output as purely human work.
- **No real user data.** Test messages must be synthetic or fully anonymised (terms §9). No API keys in the repo.
- **Scientific annex:**
  - levels أ/ب/ج/د on every result;
  - no fatwa;
  - abstain rather than guess;
  - a transparency notice;
  - a published privacy policy.
  These must survive every redesign.

### 0.2 Sensitive-content rules (zero tolerance)

- **Never edit sacred text.** Quran and hadith text is displayed **exactly** as in the source data, and no design mock-up may contain typed-by-hand Quran or hadith. Copy it from the app output, or use lorem placeholders in mock-ups and real data in the build.
- **Never invent a reference, grading, number or scholar name.** Anything not traceable to the dataset or a published book stays out.
- **Every new register entry is marked `draft`** until a qualified reviewer approves it (use the challenge's **Sharia mentor**, sessions 10:00 am–7:00 pm).
- **Gate before every deploy:** tests pass, evaluation shows 0 critical errors, and the sacred-text spot-check (`Q1`) passes. No exceptions.
- **Marketing copy** (social posts, video, slides) **quotes Quran or hadith only from the app's verified output**, with its citation.

---

## 1. Scope: what ships now vs. upcoming

### 1.1 Core functions (already built, must keep working on web **and** mobile)

| # | Function | Web | Mobile |
|---|---|:-:|:-:|
| F1 | Check a pasted message: split quotes, verdict per quote | ✅ | ☐ |
| F2 | Screenshot → text (OCR), then check | ✅ | ☐ (see decision D2) |
| F3 | Quran: exact verse / misquote with word-level correction, surah and ayah | ✅ | ☐ |
| F4 | Hadith: source, number, named graders, grade aggregation | ✅ | ☐ |
| F5 | Content level أ/ب/ج/د on every result | ✅ | ☐ |
| F6 | Authentic alternative for non-established sayings | ✅ | ☐ |
| F7 | Suggested reply in AR/EN/FR/ID/TR: copy, share, WhatsApp | ✅ | ☐ |
| F8 | Honest abstention ("not found ≠ fabricated") + referral | ✅ | ☐ |
| F9 | Scope guard: fatwa (level د) / ruling (ج) / general question | ✅ | ☐ |
| F10 | Evidence search ("authentic hadith about X", no invention) | ✅ | ☐ |
| F11 | Forwarding-pressure warning | ✅ | ☐ |
| F12 | Report a problem → review queue | ✅ | ☐ |
| F13 | AR/EN interface, transparency notice, privacy policy | ✅ | ☐ |

### 1.2 Built during the challenge (judged additions)

| # | Addition | Priority |
|---|---|---|
| N1 | **Mobile app (Android + iOS)** on the same API | Must |
| N2 | **Redesigned website** from Claude Design + new brand | Must |
| N3 | **Shareable verdict card** (PNG image of a result, for groups) | Must |
| N4 | **"Share to Thabat"** from WhatsApp/Telegram (Android share sheet; iOS share if time) | Should |
| N5 | **Specialist review workflow** (approve/edit/reject + log) | Must |
| N6 | **Held-out test set** (≥ 60 cases not written by us; Sharia mentor helps) + 3 repeated runs | Must |
| N7 | **Register expansion** to 30–60 popular sayings, each with reference + alternative, all `draft` until reviewed | Should |
| N8 | **LLM assist measured**: other-language set (Urdu, Malay, Spanish, German) with vs. without Claude, plus cost per message | Should (needs API key) |
| N9 | **Mini user test**: 5 people, time-to-verdict and clarity, plus changes made because of it | Must (scored under UX) |

### 1.3 Upcoming (shown in app/site/deck as "قريبًا / Coming soon", NOT built now)

- U1 Telegram / WhatsApp bot
- U2 More collections (Musnad Ahmad, al-Hakim, al-Bayhaqi)
- U3 King Fahd Complex digital Quran text for display
- U4 Public API with keys for platforms
- U5 App Store / Google Play public release (see D3)
- U6 Browser extension
- U7 More reply languages (Urdu, Malay, Bengali)
- U8 Offline mode on mobile

---

## 2. Decisions needed from Youcef (answer before the related phase)

| ID | Question | Recommendation |
|---|---|---|
| D1 | Mobile framework | **Expo (React Native)**: one codebase for Android + iOS, builds in the cloud, and runs on your phone today via Expo Go. |
| D2 | Mobile OCR. Google ML Kit on-device does **not** read Arabic. | **(a)** on-device OCR in a hidden WebView with tesseract.js (keeps the "image never leaves the phone" promise) — recommended. Or **(b)** send the image to the server with an explicit consent toggle, which means updating the privacy policy. |
| D3 | Store publishing | Apple review takes days and needs a $99 account, so it can't be guaranteed by 6 Oct. **Deliver:** Android APK download link + iOS via Expo Go / TestFlight link. Public store release becomes U5. |
| D4 | Claude API key for N8 / LLM features | If yes: set `ANTHROPIC_API_KEY` on Vercel. If no: N8 moves to upcoming. |
| D5 | Domain | Use `*.vercel.app` (free) or a custom domain? |
| D6 | Public repo + your photo | Keep the participant photo in the deck **only**, outside the repo (current state), or allow it in the repo? |
| D7 | Video tool | After Effects (you), or I build it in code (HTML/Remotion animation from your brand assets)? |

---

## 3. Timeline at a glance

| When (Riyadh) | Youcef | Claude |
|---|---|---|
| **Day 1 — Sun 4 Oct** (now → 10 pm) | Brand identity in Illustrator (B1–B6); export assets; send Claude Design website files | Setup (S1–S4); N5 review workflow; N3 verdict card; start N6 test set with mentor |
| **Day 2 — Mon 5 Oct** (9 am → 10 pm) | App designs (A1); social posts (B7); user test with 5 people (N9) | Implement website redesign (W1–W8); build mobile app (M1–M12); N7, N8 |
| **Day 3 — Tue 6 Oct** (9 am → 8 pm) | Animation video (V1–V6); final deck with brand (P1–P9) | Final QA (Q1–Q8); deploy (R1–R6); docs; submission pack (Z1–Z9) |
| **Tue 8 pm → 11:59 pm** | Buffer only | Buffer only |

Mentor slots (10 am–7 pm daily): book the **Sharia mentor** for Day 1 afternoon (register + test set) and the **technical/UX mentor** for Day 2.

---

## 4. Detailed checklist

### S — Setup (Day 1, first hour) — C
- [ ] S1 Commit a challenge-start marker (`CHALLENGE_LOG.md`: start time, plan link). All new work goes after `baseline-pre-challenge`.
- [ ] S2 Create folders: `brand/` (exported assets), `mobile/` (app), `design/` (Claude Design exports, reference only).
- [ ] S3 Add `docs/AI_USAGE.md`: every AI tool, what it did, and what a human reviewed (rules §9). Keep it updated in every phase.
- [ ] S4 Confirm the live baseline on Vercel (`/api/health` ok) so we always have a working fallback.

### B — Brand identity (Illustrator) — Y (Claude: specs, export checks, integration)
- [ ] B1 Logo system: primary (Arabic «ثَبَت» + mark), horizontal, stacked, icon-only, monochrome; light and dark versions.
- [ ] B2 Colour palette with hex values + status colours. The status colours must keep their meaning: **verified, misquoted/check, not established, not found**. Check WCAG contrast; I'll verify the numbers.
- [ ] B3 Typography: Arabic + Latin pair; **check the font licences** allow web and app use (log in SOURCES).
- [ ] B4 Iconography + pattern/motif (the "seal/stamp" and "chain" ideas fit the product).
- [ ] B5 App icon (1024×1024, no transparency for iOS) + adaptive Android icon (foreground/background) + favicon (SVG + 32 px PNG) + social share image (1200×630).
- [ ] B6 Export package to `brand/`: SVG + PNG @1x/@2x/@3x, colour tokens (I'll turn them into CSS/JS tokens), a short brand guideline PDF.
- [ ] B7 Social media posts (Day 2), suggested set:
  - launch announcement;
  - "how it works" carousel (3–5 slides);
  - a "did you know this saying isn't authentic?" post, **using only app-verified text and citation**;
  - a stat card (0 critical errors / 98.6%);
  - a "try it" CTA with the link and QR code.
  - Sizes: Instagram 1080×1350 and 1080×1080, Story 1080×1920, X/LinkedIn 1200×675.

### W — Website redesign (from Claude Design) — Y gives design → C implements
- [ ] W1 Y: export the Claude Design website (HTML/CSS or images + spec) into `design/website/`.
- [ ] W2 C: map every design section to existing functions; list any design element that has no backing data (we don't fake data).
- [ ] W3 C: implement the landing page in `public/index.html` + `assets/` with the new brand tokens, AR/EN, RTL/LTR.
- [ ] W4 C: implement the checker app screens (`public/app.html`). All F1–F13 behaviour unchanged: verdict cards, levels, diff, alternatives, replies, scope notes.
- [ ] W5 C: privacy + review pages in the new style; "Coming soon" section for U1–U8.
- [ ] W6 C: N3 verdict card download/share button on each result.
- [ ] W7 C: responsive QA at 375 / 768 / 1280 / 1440 px; keyboard and focus states; reduced motion.
- [ ] W8 C: update screenshots in `docs/screenshots/` and the README.

### M — Mobile app (Android + iOS, Expo) — Y designs → C builds
- [ ] A1 Y: app screens in Claude Design, exported to `design/app/`:
  - splash and onboarding (what it does / not a fatwa / privacy);
  - Home (paste / screenshot / search);
  - Results list;
  - Result detail (source, graders, level, alternative);
  - Reply sheet (languages, copy, share);
  - Evidence search;
  - History (local only);
  - Settings (language, theme, about, privacy);
  - Coming soon.
- [ ] M1 C: scaffold the Expo app in `mobile/` (TypeScript, expo-router, RTL support, AR/EN i18n).
- [ ] M2 C: API client to the live Vercel API with timeout/retry, and clear error/offline states.
- [ ] M3 C: Home: paste box + "paste from clipboard" + examples.
- [ ] M4 C: OCR per decision D2.
- [ ] M5 C: Results + Result detail, mirroring the web verdict cards (level badge, diff, graders, alternative, transparency note).
- [ ] M6 C: Reply sheet: language switch, copy, native share (WhatsApp etc.).
- [ ] M7 C: Evidence search screen.
- [ ] M8 C: History stored **only on the device** (can be cleared); report-a-problem.
- [ ] M9 C: Settings, About, privacy, "not a fatwa" notice, Coming soon (U1–U8).
- [ ] M10 C: N4 Android share intent ("Share to Thabat" from WhatsApp); iOS share extension only if time allows (else upcoming).
- [ ] M11 C: app icon/splash from B5; brand tokens from B6.
- [ ] M12 C: builds:
  - Android **APK** (EAS cloud build) with a download link;
  - iOS via **Expo Go QR / TestFlight** (per D3).
  - Test on a real Android phone + an iPhone (or Expo Go).

### N — Judged improvements to the engine (C, with mentor where noted)
- [ ] N5 Review workflow: `/review` gains approve / edit / reject with a reviewer name + note → `review_log`; an approved badge in results.
- [ ] N6 Held-out test set (≥ 60): written with/by the **Sharia mentor** or from public Q&A sources (anonymised), never seen by the tuning. Run 3 times; report accuracy + critical errors honestly, even if lower.
- [ ] N7 Register expansion: only sayings with a **published, checkable reference**; each has an authentic alternative from the dataset; all `draft` until reviewed. Tests confirm every reference resolves.
- [ ] N8 LLM assist evaluation (if D4 = yes): an other-language set with vs. without Claude; gain, cost per message and failure cases; the LLM never decides a verdict.
- [ ] N9 Mini user test (5 people, ~10 min each): task "is this message safe to share?" with vs. without Thabat; time + correctness + 3 clarity questions; document findings + the UI changes made.

### Q — Quality gate (sensitive data) — C, before every deploy
- [ ] Q1 Sacred-text spot-check: 20 random verses + 20 hadith shown in the app match the source byte-for-byte (automated test).
- [ ] Q2 Every citation link opens the right hadith/verse (automated check on a sample).
- [ ] Q3 `pytest` all green; evaluation: **0 critical errors**, determinism ✓.
- [ ] Q4 Annex behaviours on web **and** app: misquoted verse, "give me a hadith proving X", personal fatwa, general question.
- [ ] Q5 No secrets in the repo (scan); no real user data in tests/fixtures.
- [ ] Q6 Accessibility: contrast, font sizes, screen-reader labels on key buttons (web + app).
- [ ] Q7 Error states: offline, server down, empty input, very long input, image with no text.
- [ ] Q8 Final read of all Arabic copy for spelling/grammar (Y) and religious wording (mentor if possible).

### R — Release — C
- [ ] R1 Deploy the redesigned web to Vercel; set env vars (`REVIEW_TOKEN`, Upstash, optional `ANTHROPIC_API_KEY`).
- [ ] R2 Smoke-test the live URL with the demo links (`/app?ex=0…5`, `/app?sq=…`).
- [ ] R3 Publish the Android APK link + iOS link on the website ("Download the app").
- [ ] R4 Tag `challenge-final` on the submitted commit; record commits between the two tags in `docs/BASELINE.md`.
- [ ] R5 Keep it alive during judging (7–22 Oct): daily health check; no breaking changes.
- [ ] R6 README: what was built 4–6 Oct vs. baseline, how to run web + app.

### V — Animation video (≤ 2:00, hard limit) — Y (+C per D7)
- [ ] V1 Script (90–110 s) on the arc problem → app in action → how AI works → trust (levels, no fatwa, abstain) → results → call to action.
- [ ] V2 Storyboard: 10–12 scenes using the brand; **real app screen recordings** for the product parts.
- [ ] V3 Screen-record the live web + mobile app flows (clean, synthetic examples only).
- [ ] V4 Animate (AE or code per D7); Arabic captions + English subtitles; optional voice-over.
- [ ] V5 Check: length ≤ 2:00, 1080p, readable captions, no misquoted text, sources visible where shown.
- [ ] V6 Export MP4 (H.264) + upload (YouTube unlisted/Drive) for the submission link.

### P — Final presentation (official template + brand) — Y+C
Structure (5-min pitch + appendix):
1. Cover
2. Hook
3. Problem
4. Current alternatives
5. Solution
6. **Live demo** slide (web + app)
7. How it works
8. How AI is used (each component + why)
9. Annex levels أ–د
10. Reliability and the review workflow
11. Results (baseline + held-out + user test)
12. Comparison vs. exact search
13. Added value
14. Mobile app
15. Brand identity
16. Operations & cost
17. Roadmap (built now / upcoming)
18. Participant
19. Thanks

Appendix: methodology details, sources log, test cases, AI-usage disclosure.

- [ ] P1 Y: brand pages from Illustrator (logo, colours, type, applications, social posts) to place in the deck.
- [ ] P2 C: rebuild the deck on the official template with the new content + real screenshots (web + app).
- [ ] P3 C: real numbers only, each with its source; the held-out results stated honestly.
- [ ] P4 C: clearly mark **what was built 4–6 Oct vs. the baseline** (scored under "presentation clarity").
- [ ] P5 Y+C: speaker notes for the 5-minute pitch + likely judge questions with answers.
- [ ] P6 C: export PPTX + PDF, check RTL/number rendering (the Arabic/number ordering issues we fixed before).
- [ ] P7 Y: final visual pass in PowerPoint.
- [ ] P8 Keep the participant slide (photo + bio) per D6.
- [ ] P9 Rehearse: 5:00 timed run with the live demo + a fallback video if the internet fails.

### Z — Submission pack (Tue by 8 pm) — Y submits, C prepares
- [ ] Z1 Live link (web) works from a phone on mobile data.
- [ ] Z2 Public GitHub repo: README, run docs, no secrets, licences.
- [ ] Z3 Video ≤ 2:00 (file + link).
- [ ] Z4 Presentation PDF/PPTX.
- [ ] Z5 Content/source documentation: `docs/SOURCES.md`, `docs/RELIABILITY.md`, register, `AI_USAGE.md`.
- [ ] Z6 App download links (APK + iOS) in the README and on the site.
- [ ] Z7 Starting-version disclosure + list of challenge-day commits.
- [ ] Z8 Submit on the portal; **keep the confirmation** (screenshot + email).
- [ ] Z9 If the portal fails: email info@IslamicAIch.org with the subject «تعذر التسليم – رقم المشاركة», the evidence, the time and a private link, before the deadline.

---

## 5. What Claude needs from Youcef, and when

| Needed | By | For |
|---|---|---|
| Answers to D1–D7 | Day 1, early | M, N8, R, V |
| Brand tokens (hex, fonts + licences) + logo SVGs | Day 1 evening | W3, M11 |
| Claude Design **website** export | Day 1 evening | W1–W8 |
| Claude Design **app** screens | Day 2 morning | M1–M12 |
| Sharia mentor session notes (register + test set) | Day 1–2 | N5–N7 |
| User-test notes (5 people) | Day 2 evening | N9, P3 |
| Brand pages + social posts | Day 3 midday | P1, B7 |

## 6. Log

| Time (Riyadh) | Done | Commit |
|---|---|---|
| | | |
