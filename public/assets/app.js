"use strict";
/* ثَبَت — app (PWA). All verdicts, citations and gradings shown here come from the
   API response; this file only presents them. Nothing religious is hard-coded
   except the clearly-labelled demo messages (synthetic forwards). */

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
if (params.get("embed")) document.body.classList.add("embed");

let ui = params.get("lang") === "en" ? "en" : (params.get("lang") === "ar" ? "ar" : store.get("thabat.ui", "ar"));
const AR = () => ui === "ar";
const digits = (s) => String(s);  // Western digits everywhere, easier to read in citations

/* ------------------------------------------------------------------ copy */
const T = {
  ar: {
    morning: "صباح الخير", evening: "مساء الخير", title1: "وصلتك رسالة؟", title2: "ثبّتها.",
    ph: "الصق الرسالة المُعاد توجيهها هنا…", clip: "الحافظة", photo: "صورة", check: "تحقّق",
    clipCard: "نسختَ رسالة؟", clipCardB: "تحقّق مما في الحافظة", recent: "آخر ما تحقّقت منه", try: "جرّب رسالة:",
    searchCta: "ابحث عن دليل ثابت لموضوع", tabs: ["تحقّق", "السجل", "المحفوظ"],
    reading: "قراءة النص", extracting: "استخراج النصوص", extracted: (n) => `استخراج ${num(n)} ${n === 1 ? "نص" : "نصوص"}`,
    matching: "المطابقة مع القرآن و9 كتب حديثية", grading: "جمع أحكام المحققين", done: "تم", searchingFor: (n) => n ? `نبحث عن ${num(n)} ${n === 1 ? "نص" : "نصوص"}…` : "نقرأ الرسالة…", cancel: "إلغاء",
    save: "حفظ", saved: "محفوظ", shareKind: "شارك النتيجة بلطف",
    kind: { quran: "آية", hadith: "حديث", registry: "حديث", none: "نص منسوب" },
    noSource: "لا مصدر في القرآن والكتب التسعة", fwd: "في الرسالة ضغط لإعادة النشر («انشرها… أمانة في رقبتك»)، وهذا غالبًا علامة على رسالة غير موثقة.",
    none: "لم نجد في الرسالة آية أو حديثًا.", err: "تعذر التحقق الآن. تأكد من الاتصال وأعد المحاولة.",
    source: "المصدر", graders: "ماذا قال المحققون", alt: "بديلٌ صحيح بالمعنى نفسه", level: "مستوى المحتوى",
    open: "افتح المصدر", dorar: "تحقق في الدرر السنية", report: "أبلغ عن خطأ", reported: "شكرًا، وصل البلاغ للمراجعة.",
    reportAsk: "ما الخطأ في هذه النتيجة؟ (اختياري)", alsoIn: "ورد أيضًا في", sahihayn: "في الصحيحين",
    pending: "مسودة بانتظار مراجعة مختص", reviewed: "راجعه مختص", wording: "لفظ الرسالة يختلف قليلًا عن لفظ المصدر",
    inMushaf: "في المصحف", inMsg: "كما ورد في الرسالة", matched: "كلمات مطابقة", diffType: "نوع الاختلاف", fix: "التصحيح", fixV: "تُنقل الآية بلفظ المصحف",
    occT: (n) => `ورد بلفظه في ${n === 2 ? "موضعين" : n <= 10 ? n + " مواضع" : n + " موضعًا"} من القرآن`, occSub: "الآيات المتكررة نذكر مواضعها كلها، ولا نختار واحدًا منها دون بيان.",
    simT: "آيات متشابهة", simSub: "في القرآن آيات بلفظ قريب جدًا؛ نعرضها حتى لا تختلط آية بأخرى.", simDiff: (n) => (n === 1 ? "تختلف في كلمة واحدة" : n === 2 ? "تختلف في كلمتين" : `تختلف في ${n} كلمات`),
    listen: "استمع للآية", exactVerse: "الآية مطابقة لنص المصحف.", variantH: (n) => `الآية صحيحة، لكنها نُقلت باختلاف ${n === 1 ? "كلمة واحدة" : n === 2 ? "كلمتين" : num(n) + " كلمات"}.`,
    dt: { wrong: "تغيير كلمة", extra: "زيادة", missing: "نقص", minor: "حرف عطف" },
    nfTitle: "لم نجد له مصدرًا", nfBody: "بحثنا في القرآن الكريم وتسعة كتب حديثية (36,064 رواية) ولم نجد هذا النص. لا نصحّحه ولا نحكم بوضعه — فقط لم نجده، فلا يُنسب حتى يُعرف مصدره.",
    nrTitle: "وجدنا نصًا مشابهًا بلفظ آخر", nrBody: "قد يكون النص المتداول رواية بالمعنى أو محرّفًا. هذه أقرب النصوص، ولا نصدر حكمًا قبل مراجعة مختص.",
    askReview: "اطلب مراجعة من باحث", knowSource: "أعرف مصدره — أضفه", knowAsk: "اكتب المصدر الذي تعرفه (الكتاب والرقم):",
    replyT: "ردّ لطيف للمجموعة", copy: "انسخ", copied: "نُسخ ✓", wa: "أرسل إلى واتساب", card: "بطاقة صورة", shareCard: "بطاقة المشاركة",
    cardNote: "بطاقة لطيفة لا تُحرج المُرسل — بلا «خطأ» ولا لوم.", close: "إغلاق", savePng: "حفظ الصورة", sharePng: "مشاركة",
    history: "السجل", savedT: "المحفوظ", all: "الكل", ahadith: "أحاديث", ayat: "آيات", empty: "لا شيء هنا بعد. تحقّق من رسالة لتظهر في السجل — يُحفظ على جهازك فقط.",
    today: "اليوم", yesterday: "أمس", src: { paste: "لصق", photo: "لقطة شاشة", share: "مشاركة", link: "رابط", demo: "مثال" },
    searchT: "ابحث عن دليل ثابت", searchSub: "نعرض الآيات والأحاديث الثابتة فقط مع مصدرها، أو نقول «لم نجد» دون اختلاق.", searchPh: "مثال: بر الوالدين، الرفق، الصدق", searchGo: "ابحث",
    found: (q, h) => `${num(q)} آية و${num(h)} حديث ثابت`,
    settings: "الإعدادات", lang: "اللغة", about: "عن ثَبَت", how: "كيف يعمل الذكاء الاصطناعي", privacy: "الخصوصية", site: "الموقع", install: "ثبّت التطبيق على جوالك",
    notFatwa: "«ثَبَت» أداة تحقق آلية مدعومة بالذكاء الاصطناعي تعتمد على مصادر موثقة، وليست جهة إفتاء ولا مختصًا بشريًا.",
    soonT: "قريبًا", transp: "نتيجة آلية من أداة مدعومة بالذكاء الاصطناعي تعتمد على مصادر موثقة، وليست فتوى ولا رأي مختص بشري.",
    sim: "محاكاة لميزة التطبيق الأصلي — قريبًا", copiedHint: "تم النسخ", bubbleAsk: "نسختَ نصًا دينيًا. أتحقّق منه؟", tapToCopy: "المس رسالة لنسخها",
    details: "التفاصيل", sendCard: "أرسل البطاقة", weekly: "هذا الأسبوع", checkedMsgs: "رسالة تحقّقت منها", clipW: "ثبّت ما في الحافظة", dailyH: "حديث اليوم",
    lockW: "المس للتحقق من الحافظة", lockSub: "ودجت شاشة القفل", shareTo: "مشاركة إلى", checkingN: (n) => `نتحقّق من ${num(n)} ${n === 1 ? "نص" : "نصوص"}`,
    botName: "ثَبَت", botSub: "بوت تجريبي · قريبًا", botHi: "أهلًا! وجّه لي أي رسالة فيها آية أو حديث، وسأخبرك بمصدرها.", botFound: (n) => `وجدتُ ${num(n)} ${n === 1 ? "نصًا" : "نصوص"}:`,
    botTry: "وجّه رسالة مثال", botMsg: "رسالة", fromClip: "من الحافظة", ofN: (i, n) => `${num(i)} / ${num(n)}`,
  },
  en: {
    morning: "Good morning", evening: "Good evening", title1: "Got a message?", title2: "Verify it.",
    ph: "Paste the forwarded message here…", clip: "Clipboard", photo: "Photo", check: "Check",
    clipCard: "Copied a message?", clipCardB: "Check what's on your clipboard", recent: "Recently checked", try: "Try a message:",
    searchCta: "Find authentic evidence on a topic", tabs: ["Check", "History", "Saved"],
    reading: "Reading the text", extracting: "Extracting quotes", extracted: (n) => `Extracted ${n} quote(s)`,
    matching: "Matching against the Quran + 9 hadith books", grading: "Collecting scholars' gradings", done: "done", searchingFor: (n) => n ? `Checking ${n} quote(s)…` : "Reading the message…", cancel: "Cancel",
    save: "Save", saved: "Saved", shareKind: "Share the result kindly",
    kind: { quran: "Verse", hadith: "Hadith", registry: "Hadith", none: "Attributed text" },
    noSource: "No source in the Quran or the 9 books", fwd: "This message pressures you to forward it — a common sign of unverified content.",
    none: "No verse or hadith found in this message.", err: "The check could not be completed. Check your connection and try again.",
    source: "Source", graders: "What the scholars said", alt: "An authentic text with the same meaning", level: "Content level",
    open: "Open source", dorar: "Cross-check on Dorar", report: "Report a problem", reported: "Thanks — sent for review.",
    reportAsk: "What is wrong with this result? (optional)", alsoIn: "Also in", sahihayn: "In Bukhari/Muslim",
    pending: "Draft — pending specialist review", reviewed: "Reviewed by a specialist", wording: "The circulating wording differs slightly from the source",
    inMushaf: "In the Mushaf", inMsg: "As written in the message", matched: "Matching words", diffType: "Type of difference", fix: "Correction", fixV: "Quote the verse as in the Mushaf",
    occT: (n) => `Occurs word for word in ${n} places in the Quran`, occSub: "For repeated verses we list every place instead of silently picking one.",
    simT: "Similar verses", simSub: "The Quran has verses with very close wording; we show them so one is not confused with another.", simDiff: (n) => `${n} word(s) differ`,
    listen: "Listen to the verse", exactVerse: "The verse matches the Mushaf text.", variantH: (n) => `The verse is real, but ${n} word(s) were quoted differently.`,
    dt: { wrong: "changed word", extra: "addition", missing: "omission", minor: "conjunction" },
    nfTitle: "No source found", nfBody: "We searched the Quran and nine hadith collections (36,064 narrations) and did not find this text. We neither confirm nor call it fabricated — we just didn't find it, so don't attribute it until its source is known.",
    nrTitle: "We found a similar text with other wording", nrBody: "The circulating text may be a paraphrase or a distortion. These are the closest texts; no verdict without specialist review.",
    askReview: "Ask a researcher to review", knowSource: "I know its source — add it", knowAsk: "Type the source you know (book and number):",
    replyT: "A kind reply for the group", copy: "Copy", copied: "Copied ✓", wa: "Send to WhatsApp", card: "Image card", shareCard: "Share card",
    cardNote: "A kind card that doesn't embarrass the sender — no blame.", close: "Close", savePng: "Save image", sharePng: "Share",
    history: "History", savedT: "Saved", all: "All", ahadith: "Hadith", ayat: "Verses", empty: "Nothing here yet. Checks you make appear here — stored on your device only.",
    today: "Today", yesterday: "Yesterday", src: { paste: "Paste", photo: "Screenshot", share: "Shared", link: "Link", demo: "Example" },
    searchT: "Find authentic evidence", searchSub: "We show only authentic verses and hadith with their source — or say \"none found\" instead of inventing one.", searchPh: "e.g. kindness to parents, honesty", searchGo: "Search",
    found: (q, h) => `${q} verse(s) and ${h} authentic hadith`,
    settings: "Settings", lang: "Language", about: "About Thabat", how: "How the AI works", privacy: "Privacy", site: "Website", install: "Install the app",
    notFatwa: "Thabat is an automated, AI-assisted verification tool grounded in documented sources. It is not a fatwa authority or a human specialist.",
    soonT: "Coming soon", transp: "Automated result from an AI-assisted tool grounded in documented sources; not a fatwa or a human specialist's opinion.",
    sim: "Simulation of a native-app feature — coming soon", copiedHint: "Copied", bubbleAsk: "You copied religious text. Check it?", tapToCopy: "Tap a message to copy it",
    details: "Details", sendCard: "Send card", weekly: "This week", checkedMsgs: "messages checked", clipW: "Check clipboard", dailyH: "Hadith of the day",
    lockW: "Tap to check the clipboard", lockSub: "Lock-screen widget", shareTo: "Share to", checkingN: (n) => `Checking ${n} quote(s)`,
    botName: "Thabat", botSub: "Demo bot · coming soon", botHi: "Hi! Forward me any message with a verse or hadith and I'll tell you its source.", botFound: (n) => `I found ${n} quote(s):`,
    botTry: "Forward an example", botMsg: "Message", fromClip: "From clipboard", ofN: (i, n) => `${i} / ${n}`,
  },
};
const t = (k) => T[ui][k];
function num(n) { return digits(n); }

/* -------------------------------------------------------------- grading */
const STYLE = {
  sahih: ["var(--g-sahih-bg)", "var(--g-sahih-ink)", "var(--g-sahih)"],
  hasan: ["var(--g-hasan-bg)", "var(--g-hasan-ink)", "var(--g-hasan)"],
  daif: ["var(--g-daif-bg)", "var(--g-daif-ink)", "var(--g-daif)"],
  vdaif: ["var(--g-vdaif-bg)", "var(--g-vdaif-ink)", "var(--g-vdaif)"],
  mawdu: ["var(--g-mawdu-bg)", "var(--g-mawdu-ink)", "var(--g-mawdu)"],
  none: ["var(--g-none-bg)", "var(--g-none-ink)", "var(--g-none)"],
  khilaf: ["var(--g-khilaf-bg)", "var(--g-khilaf-ink)", "var(--g-khilaf)"],
};
const HEX = { sahih: "#22B07D", hasan: "#3D8DE0", daif: "#F0B020", vdaif: "#F07A2A", mawdu: "#EB4858", none: "#9A96AA", khilaf: "#8E7BEA" };
const OK = ["quran_exact", "authentic", "authentic_by_routes"];

function gradeOf(v) {
  const s = v.status, g = (v.evidence?.[0]?.grade) || {};
  const labels = (g.grades || []).map((x) => x.label.toLowerCase());
  const L = (ar, en) => (AR() ? ar : en);
  switch (s) {
    case "quran_exact": return { k: "sahih", label: L("آية مطابقة", "Exact verse") };
    case "quran_variant": return { k: "daif", label: L("آية مُحرّفة", "Misquoted verse") };
    case "authentic": {
      const hasanOnly = g.basis !== "sahihayn" && labels.length && labels.every((x) => x.includes("hasan") && !x.includes("sahih"));
      return hasanOnly ? { k: "hasan", label: L("حسن", "Hasan") } : { k: "sahih", label: L("صحيح", "Sahih") };
    }
    case "authentic_by_routes": return { k: "hasan", label: L("ثابت بمجموع طرقه", "Authentic via routes") };
    case "authentic_mawquf": return { k: "khilaf", label: L("موقوف — ليس من كلامه ﷺ", "Not the Prophet's words") };
    case "disputed": return { k: "khilaf", label: L("مختلف فيه", "Disputed") };
    case "needs_review": return { k: "vdaif", label: L("لفظ مشابه", "Similar wording") };
    case "weak": return labels.some((x) => x.includes("very")) ? { k: "vdaif", label: L("ضعيف جدًا", "Very weak") } : { k: "daif", label: L("ضعيف", "Weak") };
    case "fabricated": return { k: "mawdu", label: L("موضوع", "Fabricated") };
    case "baseless": return { k: "mawdu", label: L("لا أصل له", "No basis") };
    default: return { k: "none", label: L("لم نجد", "Not found"), dashed: true };
  }
}
function chip(v) {
  const g = gradeOf(v), [bg, ink, dot] = STYLE[g.k];
  return `<span class="chip${g.dashed ? " dashed" : ""}" style="--c-bg:${bg};--c-ink:${ink};--c-dot:${dot}">${esc(g.label)}</span>`;
}
function catStyle(cat) { return { authentic: "sahih", weak: "daif", fabricated: "mawdu", unknown: "none" }[cat] || "none"; }

const BOOK = {
  bukhari: ["البخاري", "Bukhari"], muslim: ["مسلم", "Muslim"], abudawud: ["أبو داود", "Abu Dawud"], tirmidhi: ["الترمذي", "Tirmidhi"],
  nasai: ["النسائي", "Nasa'i"], ibnmajah: ["ابن ماجه", "Ibn Majah"], malik: ["الموطأ", "Muwatta"], nawawi: ["الأربعون النووية", "Nawawi 40"], qudsi: ["القدسية", "Qudsi 40"],
};
const shortCite = (e) => `${BOOK[e.book]?.[AR() ? 0 : 1] || e.book} ${num(e.number)}`;
function byLine(v) {
  const ev = v.evidence || [];
  if (v.kind === "quran" && v.quran) {
    const q = v.quran, n = q.changed_words;
    return `${esc(digits(AR() ? q.citation_ar : q.citation_en))}${v.status === "quran_variant" ? ` — ${AR() ? (n === 1 ? "اختلاف كلمة" : n === 2 ? "اختلاف كلمتين" : `اختلاف ${num(n)} كلمات`) : `${n} word(s) differ`}` : ""}`;
  }
  if (v.registry) return esc((v.registry.sources || []).map((s) => (AR() ? s.ar : s.en).split("،")[0]).slice(0, 2).join(" · "));
  if (ev.length && v.status !== "needs_review") return esc(ev.slice(0, 3).map(shortCite).join(" · "));
  if (v.status === "needs_review") return esc((AR() ? "أقرب نص: " : "Closest: ") + ev.slice(0, 2).map(shortCite).join(" · "));
  return esc(t("noSource"));
}
function kindOf(v) { return t("kind")[v.kind] || t("kind").none; }

/* ------------------------------------------------------------ icons */
const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="#2BD49A"><path d="M8 5v14l11-7z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
};
const MARK = "/assets/brand/mark-dark.svg", MARK_L = "/assets/brand/mark.svg";

/* --------------------------------------------------------------- data */
async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
  return res.json();
}
const post = (path, body) => api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

let current = null;           // { id, text, source, at, result }
let hlog = store.get("thabat.history", []);
function saveHistory() { store.set("thabat.history", hlog.slice(0, 40)); }
function remember(rec) { hlog = [rec, ...hlog.filter((h) => h.id !== rec.id)]; saveHistory(); }
function uid() { return Math.random().toString(36).slice(2, 9); }

/* -------------------------------------------------------------- router */
const app = $("#app");
const routes = {
  "": home, "analyze": analyze, "results": results, "item": item, "history": () => list("all"), "saved": () => list("saved"),
  "search": search, "settings": settings, "card": card,
  "sim/bubble": simBubble, "sim/widgets": simWidgets, "sim/ios": simIOS, "sim/whatsapp": simBot,
};
function go(path) { if (location.hash === "#/" + path) render(); else location.hash = "#/" + path; }
function render() {
  document.documentElement.lang = ui; document.documentElement.dir = AR() ? "rtl" : "ltr";
  const [path, arg] = location.hash.replace(/^#\/?/, "").split(/\/(?=\d+$)/);
  const fn = routes[path] || home;
  app.innerHTML = "";
  fn(arg);
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", render);

function tabbar(active) {
  const [a, b, c] = t("tabs");
  return `<div class="tabfade" aria-hidden="true"></div><nav class="tabbar" aria-label="tabs"><a href="#/" class="${active === 0 ? "on" : ""}">${a}</a><a href="#/history" class="${active === 1 ? "on" : ""}">${b}</a><a href="#/saved" class="${active === 2 ? "on" : ""}">${c}</a></nav>`;
}
function backbar(right = "") {
  return `<div class="topbar"><button class="iconbtn" data-back aria-label="back">${I.back}</button>${right}</div>`;
}
function wire(root = app) {
  root.querySelectorAll("[data-back]").forEach((b) => b.onclick = () => (window.history.length > 1 ? window.history.back() : go("")));
}
function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1800); }

/* ------------------------------------------------------------- screens */
const DEMOS = [
  { ar: "رسالة «انشرها»", en: "\"Share this\" forward", text: "قال رسول الله ﷺ: «إنما الأعمال بالنيات»\nوقال تعالى: «وقل ربي زدني علما».\nوقال ﷺ: «اطلبوا العلم ولو بالصين». ومن نشرها «فُتح له باب من الجنة»\nانشرها ولا تجعلها تقف عندك 🙏" },
  { ar: "آية منقولة خطأ", en: "Misquoted verse", text: "قال تعالى: إن الله مع الصابرين إذا صبروا" },
  { ar: "حديث غير موجود", en: "Made-up hadith", text: "صيام يوم 27 رجب يعدل صيام ستين شهرًا، انشرها تؤجر" },
  { ar: "حكم مختلف فيه", en: "Disputed grading", text: "قال رسول الله ﷺ: «طلب العلم فريضة على كل مسلم»\nوقال: «أنا مدينة العلم وعلي بابها»" },
  { ar: "English forward", en: "English forward", text: "The Prophet (pbuh) said: \"Paradise lies under the feet of mothers.\" And: \"The strong man is not the one who wrestles, but the one who controls himself when angry.\"" },
  { ar: "طلب فتوى", en: "Fatwa request", text: "أنا أعيش في دولة أوروبية، هل يجوز لي أن أعقد زواجي في المحكمة فقط؟" },
];

function home() {
  const hour = new Date().getHours();
  const recent = hlog.slice(0, 3);
  app.innerHTML = `<section class="screen">
    <div class="topbar"><a class="brand" href="#/"><img src="${MARK}" alt=""><span>${AR() ? "ثَبَت" : "Thabat"}</span></a>
      <button class="avatar" data-go="settings" aria-label="${esc(t("settings"))}">${I.gear}</button></div>
    <p class="hello">${hour < 12 ? t("morning") : t("evening")}</p>
    <h1 class="h-xl">${t("title1")}<br><span class="hl">${t("title2")}</span></h1>
    <div class="compose">
      <label class="sr" for="msg">${esc(t("ph"))}</label>
      <textarea id="msg" maxlength="6000" placeholder="${esc(t("ph"))}">${esc(home.draft || "")}</textarea>
      <div class="compose-row">
        <button class="chipbtn" id="clip">${t("clip")}</button>
        <label class="chipbtn" for="img">${t("photo")}<input id="img" type="file" accept="image/*" hidden></label>
        <button class="go" id="go" aria-label="${esc(t("check"))}">${I.arrow}</button>
      </div>
      <div class="ocr" id="ocr" role="status"></div>
    </div>
    <button class="clipcard" id="clipcard"><img src="${MARK}" alt=""><span><b>${t("clipCard")}</b> ${t("clipCardB")}</span></button>
    <h2 class="h-m">${t("try")}</h2>
    <div class="examples">${DEMOS.map((d, i) => `<button class="chipbtn" data-ex="${i}">${esc(AR() ? d.ar : d.en)}</button>`).join("")}</div>
    <button class="row" data-go="search" style="margin-top:12px"><span>${t("searchCta")}</span><span>${I.arrow}</span></button>
    ${recent.length ? `<h2 class="h-m">${t("recent")}</h2><div class="rows">${recent.map(histRow).join("")}</div>` : ""}
    <p class="transp">${t("transp")}</p>
  </section>${tabbar(0)}`;
  const ta = $("#msg");
  ta.oninput = () => (home.draft = ta.value);
  $("#go").onclick = () => start(ta.value, "paste");
  ta.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") start(ta.value, "paste"); });
  const readClip = async () => {
    try { const s = await navigator.clipboard.readText(); if (s?.trim()) { ta.value = s; home.draft = s; start(s, "paste"); } else toast(AR() ? "الحافظة فارغة" : "Clipboard is empty"); }
    catch { toast(AR() ? "اسمح بالوصول إلى الحافظة أو الصق النص يدويًا" : "Allow clipboard access or paste manually"); ta.focus(); }
  };
  $("#clip").onclick = readClip; $("#clipcard").onclick = readClip;
  app.querySelectorAll("[data-ex]").forEach((b) => b.onclick = () => start(DEMOS[+b.dataset.ex].text, "demo"));
  app.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => go(b.dataset.go));
  app.querySelectorAll("[data-hist]").forEach((b) => b.onclick = () => openHist(b.dataset.hist));
  $("#img").onchange = (e) => ocr(e.target.files?.[0], ta);
}

function start(text, source) {
  text = (text || "").trim();
  if (text.length < 2) { toast(AR() ? "الصق نص الرسالة أولًا" : "Paste a message first"); $("#msg")?.focus(); return; }
  current = { id: uid(), text, source, at: Date.now(), result: null, pending: post("/api/verify", { text, reply_lang: guessLang(text) }) };
  home.draft = "";
  go("analyze");
}
function guessLang(s) {
  if (/[؀-ۿ]/.test(s)) return "ar";
  const x = s.toLowerCase();
  if (/\b(le|la|les|est|vous|prophète)\b/.test(x)) return "fr";
  if (/\b(yang|dan|bersabda|nabi)\b/.test(x)) return "id";
  if (/\b(ve|bir|buyurdu|peygamber)\b/.test(x)) return "tr";
  return "en";
}

function analyze() {
  if (!current?.pending) return go("");
  app.innerHTML = `<section class="screen dark nopad">
    <div class="topbar"><span></span><button class="ghostbtn" id="cancel">${t("cancel")}</button></div>
    <div class="msgbox" id="mb">${esc(current.text)}</div>
    <div class="pulse"><img src="${MARK_L}" alt=""></div>
    <h2 class="h-l" style="text-align:center" id="hd">${t("searchingFor")(0)}</h2>
    <ol class="steps" id="st">
      <li class="done"><span class="st">✓</span>${t("reading")}<span class="n">${t("done")}</span></li>
      <li class="now"><span class="st">…</span><span id="s2">${t("extracting")}</span><span class="n"></span></li>
      <li><span class="st"></span>${t("matching")}<span class="n"></span></li>
      <li><span class="st"></span>${t("grading")}<span class="n"></span></li>
    </ol></section>`;
  let cancelled = false;
  $("#cancel").onclick = () => { cancelled = true; go(""); };
  const steps = [...app.querySelectorAll("#st li")];
  const mark = (i, state) => { const li = steps[i]; li.className = state; li.querySelector(".st").textContent = state === "done" ? "✓" : state === "now" ? "…" : ""; if (state === "done") li.querySelector(".n").textContent = t("done"); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const t0 = Date.now();
  current.pending.then(async (res) => {
    if (cancelled) return;
    const n = res.results.length;
    // highlight the quotes we found inside the original message
    let html = esc(current.text);
    res.results.forEach((v) => { const q = esc(v.quote); if (q && html.includes(q)) html = html.replace(q, `<mark>${q}</mark>`); });
    $("#mb").innerHTML = html;
    $("#hd").textContent = t("searchingFor")(n);
    $("#s2").textContent = t("extracted")(n); mark(1, "done"); mark(2, "now");
    await wait(Math.max(350, 700 - (Date.now() - t0)));
    if (cancelled) return;
    mark(2, "done"); mark(3, "now"); await wait(450); if (cancelled) return; mark(3, "done"); await wait(250);
    current.result = res; delete current.pending;
    remember({ id: current.id, text: current.text, source: current.source, at: current.at, result: res, saved: false });
    if (!cancelled) location.replace("#/" + (params.get("open") && !analyze.opened ? (analyze.opened = true, params.get("open")) : "results"));
  }).catch((e) => { if (!cancelled) { app.innerHTML = `<section class="screen"><div class="topbar"></div><p class="warn">${esc(t("err"))} (${esc(e.message)})</p><button class="btn layl" data-back>${t("close")}</button></section>`; wire(); } });
}

function summaryTitle(vs) {
  const n = vs.length, k = vs.filter((v) => OK.includes(v.status)).length;
  if (!AR()) return `${n} quote${n === 1 ? "" : "s"}, <span class="hl-soft">${k === n ? "all established" : k === 0 ? "none established" : `${k} established`}</span>.`;
  const nTxt = n === 1 ? "نص واحد" : n === 2 ? "نصّان" : `${num(n)} نصوص`;
  const kTxt = k === n ? (n === 1 ? "ثابت" : "كلها ثابتة") : k === 0 ? (n === 1 ? "لا يثبت" : "لا شيء منها ثابت") : k === 1 ? "واحد فقط ثابت" : `${num(k)} منها ثابتة`;
  return `${nTxt}، <span class="hl-soft">${kTxt}</span>.`;
}

function results() {
  if (!current?.result) return go("");
  const r = current.result, vs = r.results;
  const saved = hlog.find((h) => h.id === current.id)?.saved;
  app.innerHTML = `<section class="screen">
    ${backbar(`<button class="pillbtn${saved ? " on" : ""}" id="save">${saved ? t("saved") : t("save")}</button>`)}
    ${vs.length ? `<h1 class="h-l">${summaryTitle(vs)}</h1>
      <div class="bar">${vs.map((v) => `<i style="background:${HEX[gradeOf(v).k]}"></i>`).join("")}</div>` : ""}
    ${r.flags?.includes("forward_pressure") ? `<div class="warn">⚠ ${esc(t("fwd"))}</div>` : ""}
    ${scopeCard(r.scope)}
    ${vs.map((v, i) => `<button class="qcard" data-i="${i}">
        <div class="top">${chip(v)}<span class="kind">${esc(kindOf(v))} ←</span></div>
        <div class="sacred" dir="auto">«${esc(v.quote)}»</div>
        <div class="by">${byLine(v)} <span class="lv" title="${esc(AR() ? v.level_ar : v.level_en)}">${esc(AR() ? v.level : v.level_latin)}</span></div>
      </button>`).join("")}
    ${!vs.length && !r.scope ? `<p class="empty">${esc(t("none"))}</p>` : ""}
    ${vs.length ? `<div class="cta"><button class="btn nur" id="share">${t("shareKind")}</button></div>` : ""}
    <p class="transp">${t("transp")}</p>
  </section>${tabbar(0)}`;
  wire();
  app.querySelectorAll("[data-i]").forEach((b) => b.onclick = () => go("item/" + b.dataset.i));
  $("#save").onclick = () => { const h = hlog.find((x) => x.id === current.id); if (h) { h.saved = !h.saved; saveHistory(); } results(); };
  $("#share")?.addEventListener("click", () => replySheet());
}
function scopeCard(sc) {
  if (!sc) return "";
  return `<div class="scope ${sc.kind === "fatwa" ? "fatwa" : ""}"><div style="display:flex;gap:10px;align-items:flex-start">
    <span class="lv">${esc(AR() ? sc.level : sc.level_latin)}</span><b>${esc(AR() ? sc.message_ar : sc.message_en)}</b></div>
    ${sc.referrals?.length ? `<p class="small" style="margin:8px 0 0">${sc.referrals.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(AR() ? x.name_ar : x.name_en)}</a>`).join(" · ")}</p>` : ""}</div>`;
}

function item(i) {
  const v = current?.result?.results?.[+i];
  if (!v) return go("");
  if (v.kind === "quran" && v.quran) return quranDetail(v, +i);
  if (v.status === "not_found" || v.status === "needs_review") return notFound(v, +i);
  return hadithDetail(v, +i);
}
function levelBox(v) {
  return `<div class="levelbox"><span class="lv">${esc(AR() ? v.level : v.level_latin)}</span><span><b>${t("level")}</b><br>${esc(AR() ? v.level_ar : v.level_en)}</span></div>`;
}
function footLinks(v, i) {
  const ev = v.evidence?.[0];
  return `<div class="links">
    ${ev?.source_url ? `<a href="${esc(ev.source_url)}" target="_blank" rel="noopener">${t("open")} ↗</a>` : ""}
    ${/[؀-ۿ]/.test(v.quote) && v.kind !== "quran" ? `<a href="https://dorar.net/hadith/search?q=${encodeURIComponent(v.quote.slice(0, 120))}" target="_blank" rel="noopener">${t("dorar")} ↗</a>` : ""}
    <button data-report>${t("report")}</button>
    <button data-card="${i}">${t("card")}</button></div>`;
}
function wireDetail(v) {
  wire();
  app.querySelector("[data-report]")?.addEventListener("click", (e) => report(v, "problem", e.target));
  app.querySelectorAll("[data-card]").forEach((b) => b.onclick = () => go("card/" + b.dataset.card));
}
async function report(v, kind, btn) {
  const ask = kind === "suggest_source" ? t("knowAsk") : t("reportAsk");
  const comment = window.prompt(ask);
  if (comment === null) return;
  try {
    await post("/api/flag", { kind, quote: v.quote.slice(0, 1000), status: v.status, evidence_id: v.evidence?.[0]?.id || v.registry?.id || null, comment: comment.slice(0, 1000) });
    toast(t("reported")); if (btn) btn.disabled = true;
  } catch { toast(t("err")); }
}

function hadithDetail(v, i) {
  const g = gradeOf(v), [bg] = STYLE[g.k], ev = v.evidence || [];
  const e0 = ev[0];
  const graders = (e0?.grade?.grades || []).map((x) => {
    const [cb, ci] = STYLE[catStyle(x.category)];
    const name = AR() ? x.grader_ar : x.grader;
    return `<div class="box grader"><span class="av" style="--c-bg:${cb};--c-ink:${ci}">${esc(name.replace(/^ال/, "").charAt(0))}</span><span><b>${esc(name)}</b><span class="lbl">${esc(x.label)}</span></span></div>`;
  }).join("");
  const regSources = (v.registry?.sources || []).map((s) => `<div class="box grader"><span class="av" style="--c-bg:${STYLE[g.k][0]};--c-ink:${STYLE[g.k][1]}">${esc((AR() ? s.ar : s.en).replace(/^ال/, "").charAt(0))}</span><span><b>${esc(AR() ? s.ar : s.en)}</b></span></div>`).join("");
  const alt = v.alternatives?.[0];
  const notes = v.notes || [];
  app.innerHTML = `<section class="screen">
    <div class="dhead" style="--c-bg:${bg}">${backbar()}<div style="margin-top:10px">${chip(v)}</div>
      <div class="sacred" dir="auto">«${esc(v.quote)}»</div></div>
    <p style="margin:14px 0 4px">${esc(AR() ? v.explanation_ar : v.explanation_en)}</p>
    ${notes.includes("registry_pending_review") ? `<span class="tag-soon">${t("pending")}</span>` : ""}
    ${notes.includes("registry_reviewed") ? `<span class="tag-soon" style="background:var(--g-sahih-bg)">${t("reviewed")}: ${esc(v.registry?.review?.reviewer || "")}</span>` : ""}
    ${notes.includes("wording_differs") ? `<span class="tag-soon" style="background:var(--g-daif-bg)">${t("wording")}</span>` : ""}
    ${e0 ? `<h2 class="h-m">${t("source")}</h2><div class="box"><a href="${esc(e0.source_url)}" target="_blank" rel="noopener"><b>${esc(digits(AR() ? e0.citation_ar : e0.citation_en))}</b></a>
        ${e0.snippet ? `<p class="sacred snip" style="font-size:18px;margin:6px 0 0" dir="rtl">${esc(e0.snippet.before)} <mark>${esc(e0.snippet.match)}</mark> ${esc(e0.snippet.after)}</p>` : ""}
        ${!AR() && e0.translation ? `<p class="small">${esc(e0.translation.slice(0, 400))}</p>` : ""}
        ${ev.length > 1 ? `<p class="small" style="margin:6px 0 0">${t("alsoIn")}: ${ev.slice(1).map((e) => `<a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(shortCite(e))}</a>`).join(" · ")}</p>` : ""}</div>` : ""}
    ${graders || regSources ? `<h2 class="h-m">${t("graders")}</h2>${e0?.grade?.basis === "sahihayn" ? `<div class="box grader"><span class="av" style="--c-bg:var(--g-sahih-bg);--c-ink:var(--g-sahih-ink)">✓</span><span><b>${t("sahihayn")}</b><span class="lbl">${esc(AR() ? e0.grade.note_ar : e0.grade.note_en)}</span></span></div>` : ""}${graders}${regSources}` : ""}
    ${levelBox(v)}
    ${alt ? `<div class="alt"><h4>${t("alt")}</h4><div class="sacred" style="font-size:19px">${alt.type === "quran" ? "﴿" + esc(alt.text) + "﴾" : "«" + esc(alt.snippet?.match || alt.quote_ar || "") + "»"}</div>
      <a class="src" href="${esc(alt.source_url)}" target="_blank" rel="noopener">${esc(digits((AR() ? alt.citation_ar : alt.citation_en)))}</a></div>` : ""}
    ${footLinks(v, i)}
    <p class="transp">${t("transp")}</p></section>${tabbar(0)}`;
  wireDetail(v);
}

function quranDetail(v, i) {
  const q = v.quran, ops = q.diff || [];
  const tiles = [];
  ops.forEach((o) => {
    if (o.op === "equal" || o.op === "minor") (o.text || o.correct).split(/\s+/).filter(Boolean).forEach((w, k) => tiles.push({ k: w, m: o.op === "minor" && k === 0 ? o.quoted : "", cls: "" }));
    else if (o.op === "wrong") { const a = o.correct.split(/\s+/), b = o.quoted.split(/\s+/); a.forEach((w, k) => tiles.push({ k: w, m: b[k] || "", cls: "bad" })); }
    else if (o.op === "missing") o.correct.split(/\s+/).forEach((w) => tiles.push({ k: w, m: "—", cls: "miss" }));
    else if (o.op === "extra") o.quoted.split(/\s+/).forEach((w) => tiles.push({ k: w, m: AR() ? "زيادة" : "added", cls: "extra" }));
  });
  const total = tiles.filter((x) => x.cls !== "extra").length, good = tiles.filter((x) => !x.cls).length;
  const kinds = [...new Set(ops.filter((o) => o.op !== "equal").map((o) => t("dt")[o.op]))].join("، ");
  app.innerHTML = `<section class="screen">${backbar()}
    <div style="margin-top:10px">${chip(v)}</div>
    <h1 class="h-l">${v.status === "quran_exact" ? t("exactVerse") : t("variantH")(q.changed_words)}</h1>
    <div class="wordpanel"><div class="hdr"><span>${t("inMushaf")}</span><span>${esc(digits(AR() ? q.citation_ar : q.citation_en))}</span></div>
      <div class="words" dir="rtl">${tiles.map((x) => `<div class="wt ${x.cls}"><span class="k">${esc(x.k)}</span>${x.m ? `<span class="m">${esc(x.m)}</span>` : ""}</div>`).join("")}</div>
      ${v.status !== "quran_exact" ? `<p class="small" style="margin:10px 0 0;text-align:center">↑ ${t("inMsg")}</p>` : ""}</div>
    ${v.status !== "quran_exact" ? `<div class="kv"><span>${t("matched")}</span><b>${AR() ? `${num(good)} من ${num(total)}` : `${good} of ${total}`}</b></div>
      <div class="kv"><span>${t("diffType")}</span><b>${esc(kinds)}</b></div>
      <div class="kv"><span>${t("fix")}</span><b>${t("fixV")}</b></div>` : ""}
    <h2 class="h-m">${t("source")}</h2><div class="box"><p class="sacred" style="margin:0" dir="rtl">﴿${esc(q.text_uthmani)}﴾</p></div>
    ${quranPlaces(q)}
    ${levelBox(v)}
    <div class="btns" style="margin-top:14px"><button class="btn layl" id="play">${I.play}<span>${t("listen")}</span></button></div>
    ${footLinks(v, i)}
    <p class="transp">${t("transp")}</p></section>${tabbar(0)}`;
  wireDetail(v);
  let audio = null, idx = 0;
  $("#play").onclick = () => {
    if (audio && !audio.paused) { audio.pause(); return; }
    idx = 0; const list = q.audio || [];
    const playNext = () => { if (idx >= list.length) return; audio = new Audio(list[idx++]); audio.onended = playNext; audio.play().catch(() => toast(t("err"))); };
    playNext();
  };
}

/* repeated verses and near-identical (mutashabih) verses, straight from the engine */
function quranPlaces(q) {
  const occ = q.occurrences || [], sim = q.similar || [];
  const occBox = occ.length > 1 ? `<h2 class="h-m">${t("occT")(occ.length)}</h2><p class="small" style="margin:-4px 0 8px">${t("occSub")}</p>
    <div class="places">${occ.map((o) => `<a href="https://quran.com/${o.surah}/${o.ayah}" target="_blank" rel="noopener">${esc(AR() ? o.citation_ar : o.citation_en)}</a>`).join("")}</div>` : "";
  const simBox = sim.length ? `<h2 class="h-m">${t("simT")}</h2><p class="small" style="margin:-4px 0 8px">${t("simSub")}</p>
    ${sim.map((x) => `<div class="box simv"><p class="sacred" dir="rtl">﴿${esc(x.text_uthmani)}﴾</p>
      <div class="simf"><a href="https://quran.com/${x.surah}/${x.ayah}" target="_blank" rel="noopener">${esc(AR() ? x.citation_ar : x.citation_en)}</a><span>${esc(t("simDiff")(x.changed_words))}</span></div></div>`).join("")}` : "";
  return occBox + simBox;
}

function notFound(v, i) {
  const nr = v.status === "needs_review";
  const ev = v.evidence || [];
  app.innerHTML = `<section class="screen">${backbar()}
    <div class="nf"><div class="ring"><img src="${MARK}" alt=""></div>
      <h1 class="h-l">${nr ? t("nrTitle") : t("nfTitle")}</h1>
      <div class="pillq" dir="auto">«${esc(v.quote)}»</div>
      <p class="sub">${nr ? t("nrBody") : t("nfBody")}</p></div>
    ${nr ? ev.map((e) => `<div class="box"><a href="${esc(e.source_url)}" target="_blank" rel="noopener"><b>${esc(digits(AR() ? e.citation_ar : e.citation_en))}</b></a>
      ${e.snippet ? `<p class="sacred snip" style="font-size:17px;margin:4px 0 0" dir="rtl">${esc(e.snippet.before)} <mark>${esc(e.snippet.match)}</mark> ${esc(e.snippet.after)}</p>` : ""}
      <div style="margin-top:6px">${chip({ status: e.grade?.status === "authentic" ? "authentic" : e.grade?.status === "weak" ? "weak" : e.grade?.status === "disputed" ? "disputed" : "not_found", evidence: [e] })}</div></div>`).join("") : ""}
    ${levelBox(v)}
    <div class="btns" style="margin-top:16px"><button class="btn layl" id="rq">${t("askReview")}</button><button class="btn white" id="ks">${t("knowSource")}</button></div>
    ${footLinks(v, i)}
    <p class="transp">${t("transp")}</p></section>${tabbar(0)}`;
  wireDetail(v);
  $("#rq").onclick = (e) => report(v, "request_review", e.target);
  $("#ks").onclick = (e) => report(v, "suggest_source", e.target);
}

/* ------------------------------------------------------- reply sheet */
async function replySheet() {
  const r = current.result;
  let lang = r.reply_lang || (AR() ? "ar" : "en");
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  const paint = (text) => {
    bg.innerHTML = `<div class="sheet" role="dialog" aria-label="${esc(t("replyT"))}"><div class="grab"></div><h2 class="h-m" style="margin-top:0">${t("replyT")}</h2>
      <div class="seg">${[["ar", "العربية"], ["en", "English"], ["fr", "Français"], ["id", "Indonesia"], ["tr", "Türkçe"]].map(([k, n]) => `<button data-l="${k}" class="${k === lang ? "on" : ""}">${n}</button>`).join("")}</div>
      <div class="reply" dir="auto">${esc(text)}</div>
      <div class="btns" style="grid-template-columns:1fr 1fr;margin-top:12px"><button class="btn white" id="cp">${t("copy")}</button><a class="btn nur" id="wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${t("wa")}</a></div>
      <button class="btn line" id="cd" style="margin-top:10px">${t("shareCard")}</button></div>`;
    bg.querySelectorAll("[data-l]").forEach((b) => b.onclick = async () => { lang = b.dataset.l; try { paint((await post("/api/reply", { lang, result: r })).reply); } catch { toast(t("err")); } });
    $("#cp", bg).onclick = async () => { try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch {} };
    $("#cd", bg).onclick = () => { bg.remove(); go("card/0"); };
  };
  paint(r.reply || "");
  bg.onclick = (e) => { if (e.target === bg) bg.remove(); };
  document.body.appendChild(bg);
}

/* ------------------------------------------------------ share card */
function card(i = 0) {
  const vs = current?.result?.results || [];
  if (!vs.length) return go("");
  i = Math.min(+i || 0, vs.length - 1);
  const v = vs[i], alt = v.alternatives?.[0];
  app.innerHTML = `<section class="screen nopad">
    <div class="pager"><button class="pillbtn" data-back>${t("close")}</button><span>${t("ofN")(i + 1, vs.length)}</span></div>
    <div class="sharecard" id="sc">${chip(v)}
      <div class="sacred" style="font-size:24px;margin:12px 0 6px" dir="auto">«${esc(v.quote)}»</div>
      <p class="small" style="color:var(--layl-soft)">${byLine(v)}</p>
      ${alt ? `<div class="alt" style="margin-top:10px"><span class="small" style="color:var(--g-sahih-ink)">${AR() ? "والصحيح:" : "Authentic:"}</span> <span class="sacred" style="font-size:18px">«${esc(alt.snippet?.match || alt.quote_ar || alt.text || "")}»</span> <span class="src">${esc(digits((AR() ? alt.citation_ar : alt.citation_en)))}</span></div>` : ""}
      <div class="foot"><span>${esc(location.host)}/app</span><b><img src="${MARK}" alt="">${AR() ? "ثَبَت" : "Thabat"}</b></div></div>
    <p class="small" style="text-align:center;margin:12px 0">${t("cardNote")}</p>
    <div class="examples" style="justify-content:center">${vs.map((_, k) => `<button class="chipbtn${k === i ? "" : ""}" style="${k === i ? "background:var(--layl);color:var(--sabah)" : ""}" data-k="${k}">${num(k + 1)}</button>`).join("")}</div>
    <div class="btns two" style="margin-top:auto;padding-top:20px"><button class="btn white" id="png">${t("savePng")}</button><button class="btn layl" id="sh">${t("sharePng")}</button></div>
  </section>`;
  wire();
  app.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => location.replace("#/card/" + b.dataset.k));
  $("#png").onclick = async () => { const blob = await cardPng(v); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "thabat-card.png"; a.click(); };
  $("#sh").onclick = async () => {
    const blob = await cardPng(v), file = new File([blob], "thabat-card.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: current.result.reply || "" }); } catch {} }
    else window.open("https://wa.me/?text=" + encodeURIComponent(current.result.reply || ""), "_blank");
  };
}
async function cardPng(v) {
  await document.fonts.load('700 40px "Alexandria"'); await document.fonts.load('400 48px "Amiri"');
  const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), g = gradeOf(v), rtl = AR();
  x.fillStyle = "#F1E7D8"; x.fillRect(0, 0, W, H);
  const rr = (X, Y, w, h, r, fill) => { x.beginPath(); x.roundRect(X, Y, w, h, r); x.fillStyle = fill; x.fill(); };
  rr(60, 60, W - 120, H - 120, 56, "#FFF7EC");
  x.direction = rtl ? "rtl" : "ltr"; x.textAlign = rtl ? "right" : "left";
  const R = rtl ? W - 120 : 120;
  const chipBg = { sahih: "#D3F5E5", hasan: "#D6EBFF", daif: "#FFF0C7", vdaif: "#FFE0C9", mawdu: "#FFD9DC", none: "#EDEAF2", khilaf: "#E4DCFF" }[g.k];
  const chipInk = { sahih: "#0E6B48", hasan: "#1D5A94", daif: "#8A5A00", vdaif: "#9A4410", mawdu: "#A3202E", none: "#4E4A60", khilaf: "#4B3B9A" }[g.k];
  x.font = '700 40px "Alexandria"'; const cw = x.measureText(g.label).width + 90;
  rr(rtl ? R - cw : R, 130, cw, 76, 38, chipBg);
  x.fillStyle = HEX[g.k]; x.beginPath(); x.arc(rtl ? R - 36 : R + 36, 168, 10, 0, 7); x.fill();
  x.fillStyle = chipInk; x.fillText(g.label, rtl ? R - 60 : R + 60, 182);
  const wrap = (text, font, y, lh, maxW, color, maxLines = 6) => {
    x.font = font; x.fillStyle = color; const words = text.split(/\s+/); let line = "", lines = [];
    for (const w of words) { const test = line ? line + " " + w : w; if (x.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
    if (line) lines.push(line); lines = lines.slice(0, maxLines);
    lines.forEach((l, k) => x.fillText(l, R, y + k * lh)); return y + lines.length * lh;
  };
  let y = wrap(`«${v.quote}»`, '400 64px "Amiri"', 320, 100, W - 240, "#1D1B33");
  const tmp = document.createElement("div"); tmp.innerHTML = byLine(v);
  y = wrap(tmp.textContent, '400 34px "Alexandria"', y + 30, 52, W - 240, "#4A4760", 3);
  const alt = v.alternatives?.[0];
  if (alt) {
    rr(120, y + 40, W - 240, 250, 40, "#D3F5E5");
    wrap((rtl ? "والصحيح: " : "Authentic: ") + "«" + (alt.snippet?.match || alt.quote_ar || alt.text || "") + "»", '400 44px "Amiri"', y + 115, 64, W - 320, "#0E6B48", 2);
    x.font = '500 30px "Alexandria"'; x.fillStyle = "#0E6B48"; x.fillText(rtl ? alt.citation_ar : alt.citation_en, rtl ? R - 40 : R + 40, y + 255);
  }
  const mark = new Image(); mark.src = MARK; await mark.decode().catch(() => {});
  x.drawImage(mark, rtl ? W - 200 : 120, H - 220, 80, 80);
  x.font = '700 48px "Alexandria"'; x.fillStyle = "#1D1B33"; x.fillText(rtl ? "ثَبَت" : "Thabat", rtl ? W - 220 : 220, H - 162);
  x.font = '400 28px "Alexandria"'; x.fillStyle = "#6B6880"; x.textAlign = rtl ? "left" : "right"; x.fillText(location.host + "/app", rtl ? 120 : W - 120, H - 165);
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}

/* ------------------------------------------------------ hlog / saved */
function when(ts) {
  const d = new Date(ts), now = new Date(), day = 864e5;
  const diff = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / day);
  if (diff === 0) return t("today"); if (diff === 1) return t("yesterday");
  return d.toLocaleDateString(AR() ? "ar-u-nu-latn" : "en", { day: "numeric", month: "long" });
}
function histRow(h) {
  const vs = h.result?.results || [];
  return `<button class="row" data-hist="${esc(h.id)}"><span style="min-width:0"><span class="t" style="display:block">${esc(h.text.replace(/\s+/g, " ").slice(0, 60))}</span><span class="small">${esc(t("src")[h.source] || "")}</span></span>
    <span class="meta"><span class="dots">${vs.slice(0, 5).map((v) => `<i style="background:${HEX[gradeOf(v).k]}"></i>`).join("")}</span><span class="small">${esc(when(h.at))}</span></span></button>`;
}
function openHist(id) { const h = hlog.find((x) => x.id === id); if (h) { current = { ...h }; go("results"); } }
function list(mode) {
  let filter = list.f || "all";
  const draw = () => {
    let items = hlog.slice();
    if (mode === "saved") items = items.filter((h) => h.saved);
    if (filter === "hadith") items = items.filter((h) => h.result?.results?.some((v) => v.kind !== "quran"));
    if (filter === "quran") items = items.filter((h) => h.result?.results?.some((v) => v.kind === "quran"));
    app.innerHTML = `<section class="screen"><div class="topbar"></div><h1 class="h-xl" style="margin-bottom:14px">${mode === "saved" ? t("savedT") : t("history")}</h1>
      <div class="tabs">${[["all", t("all")], ["hadith", t("ahadith")], ["quran", t("ayat")]].map(([k, n]) => `<button class="pillbtn${k === filter ? " on" : ""}" data-f="${k}">${n}</button>`).join("")}</div>
      ${items.length ? `<div class="rows">${items.map(histRow).join("")}</div>` : `<p class="empty">${t("empty")}</p>`}</section>${tabbar(mode === "saved" ? 2 : 1)}`;
    app.querySelectorAll("[data-f]").forEach((b) => b.onclick = () => { filter = list.f = b.dataset.f; draw(); });
    app.querySelectorAll("[data-hist]").forEach((b) => b.onclick = () => openHist(b.dataset.hist));
  };
  draw();
}

/* ---------------------------------------------------------------- search */
function search() {
  app.innerHTML = `<section class="screen">${backbar()}<h1 class="h-l">${t("searchT")}</h1><p class="sub">${t("searchSub")}</p>
    <form class="search" id="sf"><input id="sq" maxlength="300" placeholder="${esc(t("searchPh"))}" value="${esc(search.last || "")}"><button class="go" style="width:52px;height:52px" aria-label="${esc(t("searchGo"))}">${I.arrow}</button></form>
    <div class="examples" style="margin-top:10px">${(AR() ? ["بر الوالدين", "الرفق", "الصدق يهدي إلى البر", "النظر إلى البحر يمحو الذنوب"] : ["kindness to parents", "backbiting", "honesty"]).map((s) => `<button class="chipbtn" data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    <div id="sr" style="margin-top:14px"></div><p class="transp">${t("transp")}</p></section>${tabbar(0)}`;
  wire();
  const run = async (q) => {
    q = q.trim(); if (q.length < 2) return; search.last = q; $("#sq").value = q;
    const box = $("#sr"); box.innerHTML = `<p class="small">…</p>`;
    try {
      const r = await api("/api/search?q=" + encodeURIComponent(q));
      if (r.abstained) { box.innerHTML = `<div class="scope"><div style="display:flex;gap:10px"><span class="lv">${AR() ? "ج" : "C"}</span><b>${esc(AR() ? r.message_ar : r.message_en)}</b></div></div>`; return; }
      box.innerHTML = `<p class="small">${t("found")(r.quran.length, r.hadith.length)}</p>` +
        r.quran.map((v) => `<div class="qcard"><div class="top">${chip({ status: "quran_exact" })}<span class="kind">${t("kind").quran}</span></div><div class="sacred" dir="rtl">﴿${esc(v.text)}﴾</div><a class="by" href="${esc(v.source_url)}" target="_blank" rel="noopener">${esc(digits(AR() ? v.citation_ar : v.citation_en))}</a></div>`).join("") +
        r.hadith.map((h) => `<div class="qcard"><div class="top">${chip({ status: "authentic", evidence: [h] })}<span class="kind">${t("kind").hadith}</span></div>
          <div class="sacred snip" dir="rtl">${(h.highlight || []).map((w) => w.hit ? `<mark>${esc(w.w)}</mark>` : esc(w.w)).join(" ")}</div>
          <a class="by" href="${esc(h.source_url)}" target="_blank" rel="noopener">${esc(digits(AR() ? h.citation_ar : h.citation_en))}</a>${h.also?.length ? ` <span class="small">· ${t("alsoIn")} ${h.also.map((a) => esc(digits(AR() ? a.citation_ar : a.citation_en))).join("، ")}</span>` : ""}</div>`).join("");
    } catch (e) { box.innerHTML = `<p class="warn">${esc(t("err"))}</p>`; }
  };
  $("#sf").onsubmit = (e) => { e.preventDefault(); run($("#sq").value); };
  app.querySelectorAll("[data-s]").forEach((b) => b.onclick = () => run(b.dataset.s));
  if (search.pending) { const q = search.pending; search.pending = null; run(q); }
}

/* -------------------------------------------------------------- settings */
let installEvt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; });
function settings() {
  const soon = AR()
    ? [["بوت واتساب وتيليجرام", "وجّه الرسالة واستلم الحكم"], ["الفقاعة العائمة", "فوق كل محادثة على Android"], ["الودجت", "على الشاشة الرئيسية وشاشة القفل"], ["كتب أكثر", "مسند أحمد والمستدرك والبيهقي"], ["المتاجر", "App Store و Google Play"], ["لغات أكثر", "الأردية والملايوية والبنغالية"]]
    : [["WhatsApp & Telegram bot", "Forward and get a verdict"], ["Floating bubble", "Over every chat on Android"], ["Widgets", "Home and lock screen"], ["More books", "Musnad Ahmad, al-Hakim, al-Bayhaqi"], ["App stores", "App Store & Google Play"], ["More languages", "Urdu, Malay, Bengali"]];
  app.innerHTML = `<section class="screen">${backbar()}<h1 class="h-xl" style="margin-bottom:14px">${t("settings")}</h1>
    <button class="setrow" id="lang"><span>${t("lang")}</span><b>${AR() ? "العربية" : "English"}</b></button>
    ${installEvt ? `<button class="setrow" id="inst"><span>${t("install")}</span><b>↓</b></button>` : ""}
    <a class="setrow" href="/#ai" target="_top"><span>${t("how")}</span><b>↗</b></a>
    <a class="setrow" href="/" target="_top"><span>${t("site")}</span><b>↗</b></a>
    <a class="setrow" href="/privacy" target="_top"><span>${t("privacy")}</span><b>↗</b></a>
    <div class="box" style="margin-top:10px"><b>${t("about")}</b><p class="small" style="margin:6px 0 0">${t("notFatwa")}</p></div>
    <h2 class="h-m">${t("soonT")} <span class="tag-soon">${t("soonT")}</span></h2>
    <div class="soon">${soon.map(([a, b]) => `<div><b>${esc(a)}</b>${esc(b)}</div>`).join("")}</div>
    <p class="small" style="text-align:center;margin-top:18px">v1.1 · ${AR() ? "بيانات: القرآن الكريم + 36,064 رواية من 9 كتب" : "Data: the Quran + 36,064 narrations from 9 books"}</p>
  </section>${tabbar(-1)}`;
  wire();
  $("#lang").onclick = () => { ui = AR() ? "en" : "ar"; store.set("thabat.ui", ui); render(); };
  $("#inst")?.addEventListener("click", async () => { installEvt.prompt(); installEvt = null; });
}

/* ------------------------------------------------------------------- OCR */
let tesseract = null;
async function ocr(file, ta) {
  if (!file) return;
  const st = $("#ocr"); st.textContent = AR() ? "نقرأ الصورة على جهازك…" : "Reading the image on your device…";
  try {
    if (!window.Tesseract) await (tesseract ||= new Promise((ok, bad) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }));
    const { data } = await window.Tesseract.recognize(file, "ara+eng");
    ta.value = (ta.value ? ta.value + "\n" : "") + data.text.trim(); home.draft = ta.value;
    st.textContent = AR() ? "تمت القراءة ✓ راجع النص ثم اضغط تحقّق" : "Done ✓ review the text, then check";
  } catch { st.textContent = AR() ? "تعذرت قراءة الصورة" : "Couldn't read the image"; }
}

/* ======================================================= SIMULATIONS
   Native-app features shown inside the /mobile phone frame. They run the real
   verification API; only the surrounding OS chrome (chat app, home screen) is simulated. */
const SIM_CHAT = [
  { who: "أم خالد", text: "↪ مُعاد توجيهه كثيرًا\nصيام يوم 27 رجب يعدل صيام ستين شهرًا، انشرها تؤجر…" },
  { who: "أبو سعد", text: "قال ﷺ: «من قال سبحان الله وبحمده في يوم مئة مرة حطت خطاياه»" },
  { who: "خالد", text: "قال ﷺ: «اطلبوا العلم ولو بالصين»" },
  { me: true, text: "جزاكم الله خيرًا" },
];
function simShell(inner) { return `<section class="sim"><span class="simtag">${t("sim")}</span>${inner}</section>`; }

function simBubble() {
  app.innerHTML = simShell(`<div class="chathead"><span class="av"></span><span><b>${AR() ? "مجموعة العائلة" : "Family group"}</b><span class="small">${AR() ? "أم خالد، أبو سعد، +21" : "+21 members"}</span></span></div>
    <div class="chat" id="chat">${SIM_CHAT.map((m, i) => `<button class="bub${m.me ? " me" : ""}" data-m="${i}">${m.who ? `<div class="fw">${esc(m.who)}</div>` : ""}${esc(m.text).replace(/\n/g, "<br>")}</button>`).join("")}
    <span class="hint" id="hint">${t("tapToCopy")}</span></div>
    <button class="floatbub" id="fb" aria-label="Thabat"><img src="${MARK}" alt=""></button>
    <div class="composer"><input placeholder="${esc(t("botMsg"))}" disabled><button>${I.send}</button></div>`);
  let copied = null;
  app.querySelectorAll("[data-m]").forEach((b) => b.onclick = () => {
    app.querySelectorAll(".bub").forEach((x) => x.classList.remove("copied")); b.classList.add("copied");
    copied = SIM_CHAT[+b.dataset.m].text; $("#hint").textContent = t("copiedHint") + " · " + t("bubbleAsk");
    const fb = $("#fb"); fb.classList.add("glow"); if (!fb.querySelector(".badge")) fb.insertAdjacentHTML("beforeend", '<span class="badge">1</span>');
  });
  $("#fb").onclick = async () => {
    if (!copied) { toast(t("tapToCopy")); return; }
    const panel = document.createElement("div"); panel.className = "panel"; panel.innerHTML = `<p class="small">…</p>`;
    app.querySelector(".sim").appendChild(panel);
    try {
      const r = await post("/api/verify", { text: copied, reply_lang: "ar" });
      current = { id: uid(), text: copied, source: "share", at: Date.now(), result: r };
      remember({ ...current, saved: false });
      const vs = r.results;
      panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:20px">${vs.length ? summaryTitle(vs) : t("none")}</b><span class="small">${t("fromClip")}</span></div>
        ${vs.map((v) => `<div class="qcard" style="background:var(--white)"><div class="top">${chip(v)}</div><div class="sacred" dir="auto">«${esc(v.quote)}»</div><div class="by">${byLine(v)}</div></div>`).join("")}
        ${vs.some((v) => v.notes?.includes("wording_differs")) ? `<div class="warn">${t("wording")}</div>` : ""}
        <div class="btns two"><button class="btn white" id="dt">${t("details")}</button><button class="btn layl" id="sc">${t("sendCard")}</button></div>
        <button class="btn line" id="x" style="margin-top:8px">×</button>`;
      $("#dt", panel).onclick = () => go("results");
      $("#sc", panel).onclick = () => go("card/0");
      $("#x", panel).onclick = () => panel.remove();
    } catch { panel.innerHTML = `<p class="warn">${t("err")}</p>`; }
  };
}

async function simWidgets() {
  const week = hlog.filter((h) => Date.now() - h.at < 7 * 864e5);
  const dots = week.flatMap((h) => (h.result?.results || []).map((v) => HEX[gradeOf(v).k])).slice(0, 12);
  app.innerHTML = simShell(`<div class="homescreen">
    <div class="wgrid">
      <button class="wgt green" id="w1"><img src="${MARK}" alt="" style="width:46px"><b style="font-size:22px;line-height:1.3">${t("clipW")}</b></button>
      <div class="wgt cream"><span class="small">${t("weekly")}</span><span class="big">${num(week.length)}</span>
        <span class="bar" style="margin:4px 0">${(dots.length ? dots : ["#EDEAF2"]).map((c) => `<i style="background:${c}"></i>`).join("")}</span><span class="small">${t("checkedMsgs")}</span></div>
    </div>
    <div class="wgt dark" id="w3"><div style="display:flex;justify-content:space-between;align-items:center"><span style="display:flex;gap:8px;align-items:center"><img src="${MARK_L}" alt="" style="width:26px">${t("dailyH")}</span><span id="dchip"></span></div>
      <div class="sacred" id="dtext" style="font-size:22px;margin:8px 0 2px">…</div><span class="small" id="dcite" style="color:#C9C5DE"></span></div>
    <div class="appicons"><img src="/assets/icons/icon-192.png" alt="ثبت"><div></div><div></div><div></div></div>
    <button class="lockw" id="w4"><span class="ring"><img src="${MARK_L}" alt=""></span><span><span class="small" style="color:#C9C5DE">${t("lockSub")}</span><br><b>${t("lockW")}</b></span></button>
  </div>`);
  const clipGo = async () => { try { const s = await navigator.clipboard.readText(); if (s?.trim()) return start(s, "paste"); } catch {} go(""); };
  $("#w1").onclick = clipGo; $("#w4").onclick = clipGo;
  try {
    const d = await api("/api/daily");
    $("#dtext").textContent = "«" + d.text + "»";
    $("#dcite").textContent = digits(AR() ? d.citation_ar : d.citation_en);
    $("#dchip").innerHTML = chip({ status: "authentic", evidence: [d] });
  } catch { $("#dtext").textContent = ""; }
}

function simIOS() {
  app.innerHTML = simShell(`<div class="island" id="isl"><img src="${MARK_L}" alt=""><span id="islt">${AR() ? "ثَبَت" : "Thabat"}</span></div>
    <div class="chat" style="padding-top:64px;background:#E9E1D6;flex:1">${SIM_CHAT.slice(0, 2).map((m) => `<div class="bub">${esc(m.text).replace(/\n/g, "<br>")}</div>`).join("")}</div>
    <div class="sheet" style="position:relative;width:100%"><div class="grab"></div><b>${t("shareTo")}</b>
      <div class="shareapps" style="margin-top:12px"><button id="th"><div class="ic"><img src="/assets/icons/icon-192.png" alt=""></div>${AR() ? "ثَبَت" : "Thabat"}</button>
        <button><div class="ic"></div>${AR() ? "الرسائل" : "Messages"}</button><button><div class="ic"></div>${AR() ? "البريد" : "Mail"}</button><button><div class="ic"></div>${AR() ? "ملاحظات" : "Notes"}</button></div></div>`);
  $("#th").onclick = async () => {
    const text = SIM_CHAT.slice(0, 2).map((m) => m.text).join("\n");
    $("#islt").textContent = "…";
    try {
      const r = await post("/api/verify", { text, reply_lang: "ar" });
      current = { id: uid(), text, source: "share", at: Date.now(), result: r }; remember({ ...current, saved: false });
      $("#isl").innerHTML = `<img src="${MARK_L}" alt=""><span>${t("checkingN")(r.results.length)}</span><span class="dots">${r.results.map((v) => `<i style="background:${HEX[gradeOf(v).k]}"></i>`).join("")}</span>`;
      setTimeout(() => go("results"), 1600);
    } catch { $("#islt").textContent = "!"; }
  };
}

function simBot() {
  const log = [{ bot: true, html: esc(t("botHi")) }];
  const draw = () => {
    app.innerHTML = simShell(`<div class="chathead" style="background:var(--layl);color:var(--sabah)"><img src="${MARK_L}" alt="" style="width:42px"><span><b>${t("botName")}</b><span class="small" style="color:#C9C5DE">${t("botSub")}</span></span></div>
      <div class="chat" id="chat">${log.map((m) => `<div class="bub${m.bot ? " bot" : " me"}">${m.html}</div>`).join("")}
        <div class="quick"><button class="chipbtn" id="ex">${t("botTry")}</button></div></div>
      <form class="composer" id="cf"><input id="ci" placeholder="${esc(t("botMsg"))}"><button aria-label="send">${I.send}</button></form>`);
    const chat = $("#chat"); chat.scrollTop = chat.scrollHeight;
    $("#ex").onclick = () => send(DEMOS[0].text);
    $("#cf").onsubmit = (e) => { e.preventDefault(); send($("#ci").value); };
  };
  const send = async (text) => {
    text = text.trim(); if (!text) return;
    log.push({ html: esc(text).replace(/\n/g, "<br>") }); draw();
    try {
      const r = await post("/api/verify", { text, reply_lang: "ar" });
      current = { id: uid(), text, source: "share", at: Date.now(), result: r }; remember({ ...current, saved: false });
      const lines = r.results.map((v) => `${chip(v)} «${esc(v.quote.slice(0, 60))}» — ${byLine(v)}`).join("<br>");
      log.push({ bot: true, html: r.results.length ? `<b>${t("botFound")(r.results.length)}</b><br>${lines}<br><a href="#/results">${t("details")} ←</a>` : esc(r.scope ? (AR() ? r.scope.message_ar : r.scope.message_en) : t("none")) });
    } catch { log.push({ bot: true, html: esc(t("err")) }); }
    draw();
  };
  draw();
}

/* ------------------------------------------------------------------ boot */
if ("serviceWorker" in navigator && !params.get("embed")) navigator.serviceWorker.register("/sw.js").catch(() => {});
(function boot() {
  const q = params.get("q") || params.get("text"), ex = params.get("ex"), sq = params.get("sq");
  const shared = params.get("title") || params.get("url");
  if (q || shared) { start([q, params.get("url")].filter(Boolean).join("\n"), params.get("source") === "share" || shared ? "share" : "link"); window.history.replaceState(null, "", location.pathname + (params.get("embed") ? "?embed=1" : "") + location.hash); }
  else if (ex !== null && DEMOS[+ex]) start(DEMOS[+ex].text, "demo");
  else if (sq) { search.pending = sq; location.hash = "#/search"; render(); }
  else if (params.get("mode") === "search") { location.hash = "#/search"; render(); }
  else render();
})();
