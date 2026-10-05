"use strict";
/* ثَبَت — desktop verification page (/verify). Same engine and same data as the app:
   every verdict, citation and grading shown here comes from the API response.
   The grading helpers mirror assets/app.js so both surfaces label results identically. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let ui = params.get("lang") === "en" ? "en" : (params.get("lang") === "ar" ? "ar" : store.get("thabat.ui", "ar"));
const AR = () => ui === "ar";

/* ------------------------------------------------------------------ copy */
const T = {
  ar: {
    analyzing: "نقرأ الرسالة ونطابقها مع المصادر…", none: "لم نجد في الرسالة آية أو حديثًا.", err: "تعذر التحقق الآن. تأكد من الاتصال وأعد المحاولة.",
    empty: "الصق نص الرسالة أولًا.", fwd: "في الرسالة ضغط لإعادة النشر («انشرها… أمانة في رقبتك»)، وهذا غالبًا علامة على رسالة غير موثقة.",
    kind: { quran: "آية", hadith: "حديث", registry: "حديث", none: "نص منسوب" }, noSource: "لا مصدر في القرآن والكتب التسعة",
    reply: "ردّ لطيف للمجموعة", link: "انسخ رابط النتيجة", card: "بطاقة صورة", copied: "نُسخ ✓", linkCopied: "نُسخ رابط النتيجة ✓",
    source: "المصدر", graders: "ماذا قال المحققون", alt: "بديلٌ صحيح بالمعنى نفسه", level: "مستوى المحتوى", alsoIn: "ورد أيضًا في", sahihayn: "في الصحيحين",
    open: "افتح المصدر", dorar: "تحقق في الدرر السنية", report: "أبلغ عن خطأ", reported: "شكرًا، وصل البلاغ للمراجعة.",
    pending: "مسودة بانتظار مراجعة مختص", reviewed: "راجعه مختص", wording: "لفظ الرسالة يختلف قليلًا عن لفظ المصدر",
    inMushaf: "في المصحف", inMsg: "↑ كما ورد في الرسالة", matched: "كلمات مطابقة", diffType: "نوع الاختلاف", fix: "التصحيح", fixV: "تُنقل الآية بلفظ المصحف",
    occT: (n) => `ورد بلفظه في ${n === 2 ? "موضعين" : n <= 10 ? n + " مواضع" : n + " موضعًا"} من القرآن`, occSub: "الآيات المتكررة نذكر مواضعها كلها، ولا نختار واحدًا منها دون بيان.",
    simT: "آيات متشابهة", simSub: "في القرآن آيات بلفظ قريب جدًا؛ نعرضها حتى لا تختلط آية بأخرى.", simDiff: (n) => (n === 1 ? "تختلف في كلمة واحدة" : n === 2 ? "تختلف في كلمتين" : `تختلف في ${n} كلمات`),
    listen: "استمع للآية", stop: "إيقاف", exactVerse: "الآية مطابقة لنص المصحف.", variantH: (n) => `الآية صحيحة، لكنها نُقلت باختلاف ${n === 1 ? "كلمة واحدة" : n === 2 ? "كلمتين" : n + " كلمات"}.`,
    dt: { wrong: "تغيير كلمة", extra: "زيادة", missing: "نقص", minor: "حرف عطف" }, added: "زيادة",
    nfTitle: "لم نجد له مصدرًا", nfBody: "بحثنا في القرآن الكريم وتسعة كتب حديثية (36,064 رواية) ولم نجد هذا النص. لا نصحّحه ولا نحكم بوضعه — فقط لم نجده، فلا يُنسب حتى يُعرف مصدره.",
    nrTitle: "وجدنا نصًا مشابهًا بلفظ آخر", nrBody: "قد يكون النص المتداول رواية بالمعنى أو محرّفًا. هذه أقرب النصوص، ولا نصدر حكمًا قبل مراجعة مختص.",
    askReview: "اطلب مراجعة من باحث", knowSource: "أعرف مصدره — أضفه",
    reportT: "أبلغ عن خطأ في النتيجة", reqT: "اطلب مراجعة من باحث", knowT: "أعرف مصدر هذا النص", reportPh: "ما الخطأ؟ (اختياري)", knowPh: "اكتب المصدر الذي تعرفه: الكتاب والرقم", send: "إرسال", cancel: "إلغاء", close: "إغلاق",
    wa: "أرسل إلى واتساب", copy: "انسخ", savePng: "حفظ الصورة", cardNote: "بطاقة لطيفة لا تُحرج المُرسل — بلا «خطأ» ولا لوم.",
    pick: "اختر نتيجة لعرض تفاصيلها", histEmpty: "لا شيء بعد. ستظهر هنا الرسائل التي تتحقق منها.", today: "اليوم", yesterday: "أمس",
    found: (q, h) => `${q} آية و${h} حديث ثابت`, reading: "نقرأ الصورة على جهازك…", readDone: "تمت القراءة ✓ راجع النص ثم اضغط «ثبّت».", readErr: "تعذرت قراءة الصورة.",
    title: (n, k) => { const nT = n === 1 ? "نص واحد" : n === 2 ? "نصّان" : `${n} نصوص`; const kT = k === n ? (n === 1 ? "ثابت" : "كلها ثابتة") : k === 0 ? (n === 1 ? "لا يثبت" : "لا شيء منها ثابت") : k === 1 ? "واحد فقط ثابت" : `${k} منها ثابتة`; return `${nT}، <span class="hl-soft">${kT}</span>.`; },
    searching: "نبحث…", sEx: ["بر الوالدين", "الرفق", "الصدق يهدي إلى البر", "النظر إلى البحر يمحو الذنوب"],
  },
  en: {
    analyzing: "Reading the message and matching it against the sources…", none: "No verse or hadith found in this message.", err: "The check could not be completed. Check your connection and try again.",
    empty: "Paste a message first.", fwd: "This message pressures you to forward it — a common sign of unverified content.",
    kind: { quran: "Verse", hadith: "Hadith", registry: "Hadith", none: "Attributed text" }, noSource: "No source in the Quran or the 9 books",
    reply: "A kind reply for the group", link: "Copy result link", card: "Image card", copied: "Copied ✓", linkCopied: "Result link copied ✓",
    source: "Source", graders: "What the scholars said", alt: "An authentic text with the same meaning", level: "Content level", alsoIn: "Also in", sahihayn: "In Bukhari/Muslim",
    open: "Open source", dorar: "Cross-check on Dorar", report: "Report a problem", reported: "Thanks — sent for review.",
    pending: "Draft — pending specialist review", reviewed: "Reviewed by a specialist", wording: "The circulating wording differs slightly from the source",
    inMushaf: "In the Mushaf", inMsg: "↑ As written in the message", matched: "Matching words", diffType: "Type of difference", fix: "Correction", fixV: "Quote the verse as in the Mushaf",
    occT: (n) => `Occurs word for word in ${n} places in the Quran`, occSub: "For repeated verses we list every place instead of silently picking one.",
    simT: "Similar verses", simSub: "The Quran has verses with very close wording; we show them so one is not confused with another.", simDiff: (n) => `${n} word(s) differ`,
    listen: "Listen to the verse", stop: "Stop", exactVerse: "The verse matches the Mushaf text.", variantH: (n) => `The verse is real, but ${n} word(s) were quoted differently.`,
    dt: { wrong: "changed word", extra: "addition", missing: "omission", minor: "conjunction" }, added: "added",
    nfTitle: "No source found", nfBody: "We searched the Quran and nine hadith collections (36,064 narrations) and did not find this text. We neither confirm nor call it fabricated — we just didn't find it, so don't attribute it until its source is known.",
    nrTitle: "We found a similar text with other wording", nrBody: "The circulating text may be a paraphrase or a distortion. These are the closest texts; no verdict without specialist review.",
    askReview: "Ask a researcher to review", knowSource: "I know its source — add it",
    reportT: "Report a problem with this result", reqT: "Ask a researcher to review", knowT: "I know the source of this text", reportPh: "What is wrong? (optional)", knowPh: "Type the source you know: book and number", send: "Send", cancel: "Cancel", close: "Close",
    wa: "Send to WhatsApp", copy: "Copy", savePng: "Save image", cardNote: "A kind card that doesn't embarrass the sender — no blame.",
    pick: "Select a result to see its details", histEmpty: "Nothing yet. Messages you check appear here.", today: "Today", yesterday: "Yesterday",
    found: (q, h) => `${q} verse(s) and ${h} authentic hadith`, reading: "Reading the image on your device…", readDone: "Done ✓ review the text, then press Verify.", readErr: "Could not read the image.",
    title: (n, k) => `${n} quote${n === 1 ? "" : "s"}, <span class="hl-soft">${k === n ? "all established" : k === 0 ? "none established" : `${k} established`}</span>.`,
    searching: "Searching…", sEx: ["kindness to parents", "backbiting", "honesty"],
  },
};
const t = (k) => T[ui][k];

const DEMOS = [
  { ar: "رسالة «انشرها»", en: "\"Share this\" forward", text: "قال رسول الله ﷺ: «إنما الأعمال بالنيات»\nوقال تعالى: «وقل ربي زدني علما».\nوقال ﷺ: «اطلبوا العلم ولو بالصين». ومن نشرها «فُتح له باب من الجنة»\nانشرها ولا تجعلها تقف عندك 🙏" },
  { ar: "آية منقولة خطأ", en: "Misquoted verse", text: "قال تعالى: إن الله مع الصابرين إذا صبروا" },
  { ar: "حديث غير موجود", en: "Made-up hadith", text: "صيام يوم 27 رجب يعدل صيام ستين شهرًا، انشرها تؤجر" },
  { ar: "حكم مختلف فيه", en: "Disputed grading", text: "قال رسول الله ﷺ: «طلب العلم فريضة على كل مسلم»\nوقال: «أنا مدينة العلم وعلي بابها»" },
  { ar: "English forward", en: "English forward", text: "The Prophet (pbuh) said: \"Paradise lies under the feet of mothers.\" And: \"The strong man is not the one who wrestles, but the one who controls himself when angry.\"" },
  { ar: "طلب فتوى", en: "Fatwa request", text: "أنا أعيش في دولة أوروبية، هل يجوز لي أن أعقد زواجي في المحكمة فقط؟" },
];

/* -------------------------------------------------------------- grading */
const STYLE = {
  sahih: ["var(--g-sahih-bg)", "var(--g-sahih-ink)", "var(--g-sahih)"], hasan: ["var(--g-hasan-bg)", "var(--g-hasan-ink)", "var(--g-hasan)"],
  daif: ["var(--g-daif-bg)", "var(--g-daif-ink)", "var(--g-daif)"], vdaif: ["var(--g-vdaif-bg)", "var(--g-vdaif-ink)", "var(--g-vdaif)"],
  mawdu: ["var(--g-mawdu-bg)", "var(--g-mawdu-ink)", "var(--g-mawdu)"], none: ["var(--g-none-bg)", "var(--g-none-ink)", "var(--g-none)"],
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
const catStyle = (cat) => ({ authentic: "sahih", weak: "daif", fabricated: "mawdu", unknown: "none" }[cat] || "none");
const BOOK = {
  bukhari: ["البخاري", "Bukhari"], muslim: ["مسلم", "Muslim"], abudawud: ["أبو داود", "Abu Dawud"], tirmidhi: ["الترمذي", "Tirmidhi"],
  nasai: ["النسائي", "Nasa'i"], ibnmajah: ["ابن ماجه", "Ibn Majah"], malik: ["الموطأ", "Muwatta"], nawawi: ["الأربعون النووية", "Nawawi 40"], qudsi: ["القدسية", "Qudsi 40"],
};
const shortCite = (e) => `${BOOK[e.book]?.[AR() ? 0 : 1] || e.book} ${e.number}`;
const cite = (x) => (AR() ? x.citation_ar : x.citation_en) || "";
function byLine(v) {
  const ev = v.evidence || [];
  if (v.kind === "quran" && v.quran) {
    const q = v.quran, n = q.changed_words;
    return esc(cite(q)) + (v.status === "quran_variant" ? ` — ${AR() ? (n === 1 ? "اختلاف كلمة" : n === 2 ? "اختلاف كلمتين" : `اختلاف ${n} كلمات`) : `${n} word(s) differ`}` : "");
  }
  if (v.registry) return esc((v.registry.sources || []).map((s) => (AR() ? s.ar : s.en).split("،")[0]).slice(0, 2).join(" · "));
  if (ev.length && v.status !== "needs_review") return esc(ev.slice(0, 3).map(shortCite).join(" · "));
  if (v.status === "needs_review") return esc((AR() ? "أقرب نص: " : "Closest: ") + ev.slice(0, 2).map(shortCite).join(" · "));
  return esc(t("noSource"));
}
const kindOf = (v) => t("kind")[v.kind] || t("kind").none;

/* --------------------------------------------------------------- data */
async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
  return res.json();
}
const post = (path, body) => api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
function guessLang(s) {
  if (/[؀-ۿ]/.test(s)) return "ar";
  const x = s.toLowerCase();
  if (/\b(le|la|les|est|vous|prophète)\b/.test(x)) return "fr";
  if (/\b(yang|dan|bersabda|nabi)\b/.test(x)) return "id";
  if (/\b(ve|bir|buyurdu|peygamber)\b/.test(x)) return "tr";
  return "en";
}

let current = null;   // { id, text, at, result }
let sel = 0;
let hlog = store.get("thabat.history", []);   // shared with the mobile app
const saveHist = () => store.set("thabat.history", hlog.slice(0, 40));
const uid = () => Math.random().toString(36).slice(2, 9);

function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 1900); }

/* ------------------------------------------------------------ language */
function applyLang() {
  document.documentElement.lang = ui; document.documentElement.dir = AR() ? "rtl" : "ltr";
  document.title = AR() ? "ثَبَت — أداة التحقّق" : "Thabat — verification tool";
  $$("[data-en]").forEach((el) => { if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML; el.innerHTML = AR() ? el.dataset.ar : esc(el.getAttribute("data-en")); });
  $$("[data-en-ph]").forEach((el) => { if (el.dataset.arph === undefined) el.dataset.arph = el.placeholder; el.placeholder = AR() ? el.dataset.arph : el.getAttribute("data-en-ph"); });
  $("#lang").textContent = AR() ? "EN" : "ع";
  $("#examples").innerHTML = DEMOS.map((d, i) => `<button class="chipbtn" data-ex="${i}">${esc(AR() ? d.ar : d.en)}</button>`).join("");
  $$("[data-ex]").forEach((b) => b.onclick = () => { $("#msg").value = DEMOS[+b.dataset.ex].text; run(); });
  $("#sexamples").innerHTML = t("sEx").map((s) => `<button class="chipbtn" data-s="${esc(s)}">${esc(s)}</button>`).join("");
  $$("[data-s]").forEach((b) => b.onclick = () => runSearch(b.dataset.s));
  drawHist();
  if (current?.result) { drawResults(); drawDetail(); }
}
$("#lang").onclick = () => { ui = AR() ? "en" : "ar"; store.set("thabat.ui", ui); applyLang(); };

/* ---------------------------------------------------------------- modes */
function mode(m) {
  $("#mVerify").classList.toggle("on", m === "verify"); $("#mSearch").classList.toggle("on", m === "search");
  $("#pVerify").hidden = m !== "verify"; $("#pSearch").hidden = m !== "search";
  if (m === "search") $("#sq").focus(); else $("#msg").focus();
}
$("#mVerify").onclick = () => mode("verify");
$("#mSearch").onclick = () => mode("search");

/* ------------------------------------------------------------- verify */
async function run(text = $("#msg").value) {
  text = text.trim();
  if (text.length < 2) { toast(t("empty")); $("#msg").focus(); return; }
  mode("verify");
  $("#welcome").hidden = true; $("#detail").hidden = true;
  const box = $("#results"); box.hidden = false;
  box.innerHTML = `<div class="vx-card vx-loading"><div class="vx-pulse"><img src="/assets/brand/mark.svg" alt=""></div><p>${esc(t("analyzing"))}</p></div>`;
  $("#go").disabled = true;
  try {
    const result = await post("/api/verify", { text, reply_lang: guessLang(text) });
    current = { id: uid(), text, at: Date.now(), result };
    hlog = [{ id: current.id, text, source: "paste", at: current.at, result, saved: false }, ...hlog.filter((h) => h.text !== text)];
    saveHist(); drawHist();
    sel = 0; drawResults(); drawDetail();
    history.replaceState(null, "", "/verify");
  } catch (e) {
    box.innerHTML = `<div class="vx-card vx-warn">${esc(t("err"))}</div>`;
  } finally { $("#go").disabled = false; }
}

function drawResults() {
  const r = current.result, vs = r.results, box = $("#results");
  const k = vs.filter((v) => OK.includes(v.status)).length;
  let msgHtml = esc(current.text);
  vs.forEach((v) => { const q = esc(v.quote); if (q && msgHtml.includes(q)) msgHtml = msgHtml.replace(q, `<mark>${q}</mark>`); });
  box.innerHTML = `
    ${vs.length ? `<div class="vx-sum"><h2>${t("title")(vs.length, k)}</h2><div class="bar">${vs.map((v) => `<i style="background:${HEX[gradeOf(v).k]}"></i>`).join("")}</div></div>` : ""}
    ${r.flags?.includes("forward_pressure") ? `<div class="vx-warn">⚠ ${esc(t("fwd"))}</div>` : ""}
    ${scopeCard(r.scope)}
    <div class="vx-cards">${vs.map((v, i) => `<button class="vx-q${i === sel ? " on" : ""}" data-i="${i}">
      <span class="top">${chip(v)}<span class="kind">${esc(kindOf(v))}</span></span>
      <span class="sacred" dir="auto">«${esc(v.quote)}»</span>
      <span class="by">${byLine(v)} <span class="lv" title="${esc(AR() ? v.level_ar : v.level_en)}">${esc(AR() ? v.level : v.level_latin)}</span></span></button>`).join("")}</div>
    ${!vs.length && !r.scope ? `<div class="vx-card vx-muted">${esc(t("none"))}</div>` : ""}
    ${vs.length ? `<div class="vx-actions"><button class="btn nur" id="aReply">${t("reply")}</button><button class="btn white" id="aCard">${t("card")}</button><button class="btn white" id="aLink">${t("link")}</button></div>` : ""}
    <details class="vx-orig"><summary>${AR() ? "الرسالة كما وصلتك" : "The message as received"}</summary><div dir="auto">${msgHtml}</div></details>`;
  $$("[data-i]", box).forEach((b) => b.onclick = () => { sel = +b.dataset.i; $$(".vx-q", box).forEach((x) => x.classList.toggle("on", x === b)); drawDetail(); });
  $("#aReply")?.addEventListener("click", replySheet);
  $("#aCard")?.addEventListener("click", () => cardSheet(sel));
  $("#aLink")?.addEventListener("click", async () => { try { await navigator.clipboard.writeText(location.origin + "/verify?q=" + encodeURIComponent(current.text)); toast(t("linkCopied")); } catch {} });
}
function scopeCard(sc) {
  if (!sc) return "";
  return `<div class="vx-scope ${sc.kind === "fatwa" ? "fatwa" : ""}"><div><span class="lv">${esc(AR() ? sc.level : sc.level_latin)}</span><b>${esc(AR() ? sc.message_ar : sc.message_en)}</b></div>
    ${sc.referrals?.length ? `<p>${sc.referrals.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(AR() ? x.name_ar : x.name_en)} ↗</a>`).join(" · ")}</p>` : ""}</div>`;
}

/* --------------------------------------------------------------- detail */
let audio = null;
function drawDetail() {
  const v = current?.result?.results?.[sel], d = $("#detail");
  if (audio) { audio.pause(); audio = null; }
  if (!v) { d.hidden = true; return; }
  d.hidden = false;
  d.innerHTML = v.kind === "quran" && v.quran ? quranDetail(v) : (v.status === "not_found" || v.status === "needs_review") ? notFound(v) : hadithDetail(v);
  d.scrollTop = 0;
  $("[data-report]", d)?.addEventListener("click", () => reportSheet(v, "problem"));
  $("#rq", d)?.addEventListener("click", () => reportSheet(v, "request_review"));
  $("#ks", d)?.addEventListener("click", () => reportSheet(v, "suggest_source"));
  $("#play", d)?.addEventListener("click", (e) => playVerse(v, e.currentTarget));
}
const levelBox = (v) => `<div class="vx-level"><span class="lv">${esc(AR() ? v.level : v.level_latin)}</span><span><b>${t("level")}</b><br>${esc(AR() ? v.level_ar : v.level_en)}</span></div>`;
function links(v) {
  const ev = v.evidence?.[0];
  return `<div class="vx-links">
    ${ev?.source_url ? `<a href="${esc(ev.source_url)}" target="_blank" rel="noopener">${t("open")} ↗</a>` : ""}
    ${/[؀-ۿ]/.test(v.quote) && v.kind !== "quran" ? `<a href="https://dorar.net/hadith/search?q=${encodeURIComponent(v.quote.slice(0, 120))}" target="_blank" rel="noopener">${t("dorar")} ↗</a>` : ""}
    <button data-report>${t("report")}</button></div>`;
}
function hadithDetail(v) {
  const g = gradeOf(v), ev = v.evidence || [], e0 = ev[0], alt = v.alternatives?.[0], notes = v.notes || [];
  const graders = (e0?.grade?.grades || []).map((x) => {
    const [cb, ci] = STYLE[catStyle(x.category)], name = AR() ? x.grader_ar : x.grader;
    return `<div class="vx-grader"><span class="av" style="--c-bg:${cb};--c-ink:${ci}">${esc(name.replace(/^ال/, "").charAt(0))}</span><span><b>${esc(name)}</b><span class="lbl">${esc(x.label)}</span></span></div>`;
  }).join("");
  const regSources = (v.registry?.sources || []).map((s) => `<div class="vx-grader"><span class="av" style="--c-bg:${STYLE[g.k][0]};--c-ink:${STYLE[g.k][1]}">${esc((AR() ? s.ar : s.en).replace(/^ال/, "").charAt(0))}</span><span><b>${esc(AR() ? s.ar : s.en)}</b></span></div>`).join("");
  return `<div class="vx-dhead" style="--c-bg:${STYLE[g.k][0]}">${chip(v)}<div class="sacred big" dir="auto">«${esc(v.quote)}»</div></div>
    <p class="vx-expl">${esc(AR() ? v.explanation_ar : v.explanation_en)}</p>
    <div class="vx-tags">${notes.includes("registry_pending_review") ? `<span class="tag">${t("pending")}</span>` : ""}
      ${notes.includes("registry_reviewed") ? `<span class="tag ok">${t("reviewed")}: ${esc(v.registry?.review?.reviewer || "")}</span>` : ""}
      ${notes.includes("wording_differs") ? `<span class="tag warn">${t("wording")}</span>` : ""}</div>
    ${e0 ? `<h3>${t("source")}</h3><div class="vx-box"><a href="${esc(e0.source_url)}" target="_blank" rel="noopener"><b>${esc(cite(e0))}</b> ↗</a>
      ${e0.snippet ? `<p class="sacred snip" dir="rtl">${esc(e0.snippet.before)} <mark>${esc(e0.snippet.match)}</mark> ${esc(e0.snippet.after)}</p>` : ""}
      ${!AR() && e0.translation ? `<p class="small">${esc(e0.translation.slice(0, 500))}</p>` : ""}
      ${ev.length > 1 ? `<p class="small">${t("alsoIn")}: ${ev.slice(1).map((e) => `<a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(shortCite(e))}</a>`).join(" · ")}</p>` : ""}</div>` : ""}
    ${graders || regSources ? `<h3>${t("graders")}</h3><div class="vx-graders">${e0?.grade?.basis === "sahihayn" ? `<div class="vx-grader"><span class="av" style="--c-bg:var(--g-sahih-bg);--c-ink:var(--g-sahih-ink)">✓</span><span><b>${t("sahihayn")}</b><span class="lbl">${esc(AR() ? e0.grade.note_ar : e0.grade.note_en)}</span></span></div>` : ""}${graders}${regSources}</div>` : ""}
    ${alt ? `<div class="vx-alt"><h4>${t("alt")}</h4><div class="sacred">${alt.type === "quran" ? "﴿" + esc(alt.text) + "﴾" : "«" + esc(alt.snippet?.match || alt.quote_ar || "") + "»"}</div>
      <a href="${esc(alt.source_url)}" target="_blank" rel="noopener">${esc(cite(alt))} ↗</a></div>` : ""}
    ${levelBox(v)}${links(v)}`;
}
function quranDetail(v) {
  const q = v.quran, ops = q.diff || [], tiles = [];
  ops.forEach((o) => {
    if (o.op === "equal" || o.op === "minor") (o.text || o.correct).split(/\s+/).filter(Boolean).forEach((w, k) => tiles.push({ k: w, m: o.op === "minor" && k === 0 ? o.quoted : "", cls: "" }));
    else if (o.op === "wrong") { const a = o.correct.split(/\s+/), b = o.quoted.split(/\s+/); a.forEach((w, k) => tiles.push({ k: w, m: b[k] || "", cls: "bad" })); }
    else if (o.op === "missing") o.correct.split(/\s+/).forEach((w) => tiles.push({ k: w, m: "—", cls: "miss" }));
    else if (o.op === "extra") o.quoted.split(/\s+/).forEach((w) => tiles.push({ k: w, m: t("added"), cls: "extra" }));
  });
  const total = tiles.filter((x) => x.cls !== "extra").length, good = tiles.filter((x) => !x.cls).length;
  const kinds = [...new Set(ops.filter((o) => o.op !== "equal").map((o) => t("dt")[o.op]))].join(AR() ? "، " : ", ");
  return `<div>${chip(v)}</div><h2 class="vx-h">${v.status === "quran_exact" ? t("exactVerse") : t("variantH")(q.changed_words)}</h2>
    <div class="vx-words"><div class="hdr"><span>${t("inMushaf")}</span><span>${esc(cite(q))}</span></div>
      <div class="tiles" dir="rtl">${tiles.map((x) => `<div class="wt ${x.cls}"><span class="k">${esc(x.k)}</span>${x.m ? `<span class="m">${esc(x.m)}</span>` : ""}</div>`).join("")}</div>
      ${v.status !== "quran_exact" ? `<p class="small">${t("inMsg")}</p>` : ""}</div>
    ${v.status !== "quran_exact" ? `<div class="vx-kv"><div><span>${t("matched")}</span><b>${AR() ? `${good} من ${total}` : `${good} of ${total}`}</b></div><div><span>${t("diffType")}</span><b>${esc(kinds)}</b></div><div><span>${t("fix")}</span><b>${t("fixV")}</b></div></div>` : ""}
    <h3>${t("source")}</h3><div class="vx-box"><p class="sacred mushaf" dir="rtl">﴿${esc(q.text_uthmani)}﴾</p>
      <button class="btn dark small" id="play">▶ <span>${t("listen")}</span></button></div>
    ${quranPlaces(q)}
    ${levelBox(v)}${links(v)}`;
}
/* repeated verses and near-identical (mutashabih) verses, straight from the engine */
function quranPlaces(q) {
  const occ = q.occurrences || [], sim = q.similar || [];
  const occBox = occ.length > 1 ? `<h3>${t("occT")(occ.length)}</h3><p class="small">${t("occSub")}</p>
    <div class="vx-places">${occ.map((o) => `<a href="https://quran.com/${o.surah}/${o.ayah}" target="_blank" rel="noopener">${esc(cite(o))}</a>`).join("")}</div>` : "";
  const simBox = sim.length ? `<h3>${t("simT")}</h3><p class="small">${t("simSub")}</p>
    ${sim.map((x) => `<div class="vx-box"><p class="sacred mushaf" dir="rtl" style="font-size:20px">﴿${esc(x.text_uthmani)}﴾</p>
      <div class="vx-simf"><a href="https://quran.com/${x.surah}/${x.ayah}" target="_blank" rel="noopener">${esc(cite(x))} ↗</a><span>${esc(t("simDiff")(x.changed_words))}</span></div></div>`).join("")}` : "";
  return occBox + simBox;
}
function playVerse(v, btn) {
  if (audio && !audio.paused) { audio.pause(); audio = null; btn.querySelector("span").textContent = t("listen"); return; }
  const list = v.quran.audio || []; let idx = 0;
  btn.querySelector("span").textContent = t("stop");
  const next = () => { if (idx >= list.length) { btn.querySelector("span").textContent = t("listen"); return; } audio = new Audio(list[idx++]); audio.onended = next; audio.play().catch(() => toast(t("err"))); };
  next();
}
function notFound(v) {
  const nr = v.status === "needs_review", ev = v.evidence || [];
  return `<div class="vx-nf"><div class="ring"><img src="/assets/brand/mark-dark.svg" alt=""></div><h2 class="vx-h">${nr ? t("nrTitle") : t("nfTitle")}</h2>
      <div class="pillq sacred" dir="auto">«${esc(v.quote)}»</div><p>${nr ? t("nrBody") : t("nfBody")}</p></div>
    ${nr ? ev.map((e) => `<div class="vx-box"><a href="${esc(e.source_url)}" target="_blank" rel="noopener"><b>${esc(cite(e))}</b> ↗</a>
      ${e.snippet ? `<p class="sacred snip" dir="rtl">${esc(e.snippet.before)} <mark>${esc(e.snippet.match)}</mark> ${esc(e.snippet.after)}</p>` : ""}
      <div>${chip({ status: e.grade?.status === "authentic" ? "authentic" : e.grade?.status === "weak" ? "weak" : e.grade?.status === "disputed" ? "disputed" : "not_found", evidence: [e] })}</div></div>`).join("") : ""}
    <div class="vx-actions"><button class="btn dark" id="rq">${t("askReview")}</button><button class="btn white" id="ks">${t("knowSource")}</button></div>
    ${levelBox(v)}${links(v)}`;
}

/* ---------------------------------------------------------------- sheets */
function sheet(html, wire) {
  const m = $("#modal"); $("#sheet").innerHTML = `<button class="vx-x" aria-label="${esc(t("close"))}">×</button>` + html; m.hidden = false;
  const close = () => { m.hidden = true; $("#sheet").innerHTML = ""; document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  m.onclick = (e) => { if (e.target === m) close(); };
  $(".vx-x").onclick = close;
  wire?.(close);
}
function replySheet() {
  const r = current.result; let lang = r.reply_lang || (AR() ? "ar" : "en");
  const paint = (text) => sheet(`<h2>${t("reply")}</h2>
    <div class="seg">${[["ar", "العربية"], ["en", "English"], ["fr", "Français"], ["id", "Indonesia"], ["tr", "Türkçe"]].map(([k, n]) => `<button data-l="${k}" class="${k === lang ? "on" : ""}">${n}</button>`).join("")}</div>
    <div class="vx-reply" dir="auto">${esc(text)}</div>
    <div class="vx-actions"><button class="btn dark" id="cp">${t("copy")}</button><a class="btn nur" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text)}">${t("wa")}</a><button class="btn white" id="cd">${t("card")}</button></div>`,
  (close) => {
    $$("[data-l]", $("#sheet")).forEach((b) => b.onclick = async () => { lang = b.dataset.l; try { paint((await post("/api/reply", { lang, result: r })).reply); } catch { toast(t("err")); } });
    $("#cp").onclick = async () => { try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch {} };
    $("#cd").onclick = () => { close(); cardSheet(sel); };
  });
  paint(r.reply || "");
}
async function cardSheet(i) {
  const v = current.result.results[i]; if (!v) return;
  const blob = await cardPng(v), url = URL.createObjectURL(blob);
  sheet(`<h2>${t("card")}</h2><img class="vx-cardimg" src="${url}" alt=""><p class="small">${t("cardNote")}</p>
    <div class="vx-actions"><a class="btn dark" href="${url}" download="thabat-card.png">${t("savePng")}</a></div>`);
}
function reportSheet(v, kind) {
  const title = { problem: t("reportT"), request_review: t("reqT"), suggest_source: t("knowT") }[kind];
  sheet(`<h2>${title}</h2><div class="pillq sacred" dir="auto">«${esc(v.quote)}»</div>
    <textarea id="rc" maxlength="1000" placeholder="${esc(kind === "suggest_source" ? t("knowPh") : t("reportPh"))}"></textarea>
    <div class="vx-actions"><button class="btn dark" id="rs">${t("send")}</button><button class="btn white" id="rx">${t("cancel")}</button></div>`,
  (close) => {
    $("#rx").onclick = close; $("#rc").focus();
    $("#rs").onclick = async () => {
      try { await post("/api/flag", { kind, quote: v.quote.slice(0, 1000), status: v.status, evidence_id: v.evidence?.[0]?.id || v.registry?.id || null, comment: $("#rc").value.slice(0, 1000) }); toast(t("reported")); close(); }
      catch { toast(t("err")); }
    };
  });
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
    x.font = '500 30px "Alexandria"'; x.fillStyle = "#0E6B48"; x.fillText(cite(alt), rtl ? R - 40 : R + 40, y + 255);
  }
  const mark = new Image(); mark.src = "/assets/brand/mark-dark.svg"; await mark.decode().catch(() => {});
  x.drawImage(mark, rtl ? W - 200 : 120, H - 220, 80, 80);
  x.font = '700 48px "Alexandria"'; x.fillStyle = "#1D1B33"; x.fillText(rtl ? "ثَبَت" : "Thabat", rtl ? W - 220 : 220, H - 162);
  x.font = '400 28px "Alexandria"'; x.fillStyle = "#6B6880"; x.textAlign = rtl ? "left" : "right"; x.fillText(location.host + "/verify", rtl ? 120 : W - 120, H - 165);
  return new Promise((ok) => c.toBlob(ok, "image/png"));
}

/* -------------------------------------------------------------- history */
function when(ts) {
  const d = new Date(ts), now = new Date(), diff = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
  if (diff === 0) return t("today"); if (diff === 1) return t("yesterday");
  return d.toLocaleDateString(AR() ? "ar-u-nu-latn" : "en", { day: "numeric", month: "long" });
}
function drawHist() {
  const box = $("#hist");
  box.innerHTML = hlog.length ? hlog.slice(0, 8).map((h) => `<button class="vx-hrow" data-h="${esc(h.id)}"><span class="t">${esc(h.text.replace(/\s+/g, " ").slice(0, 70))}</span>
    <span class="meta"><span class="dots">${(h.result?.results || []).slice(0, 6).map((v) => `<i style="background:${HEX[gradeOf(v).k]}"></i>`).join("")}</span><span>${esc(when(h.at))}</span></span></button>`).join("") : `<p class="vx-fine">${t("histEmpty")}</p>`;
  $$("[data-h]", box).forEach((b) => b.onclick = () => {
    const h = hlog.find((x) => x.id === b.dataset.h); if (!h?.result) return;
    current = { ...h }; sel = 0; $("#msg").value = h.text; mode("verify");
    $("#welcome").hidden = true; $("#results").hidden = false; drawResults(); drawDetail();
  });
}
$("#histClear").onclick = () => { hlog = []; saveHist(); drawHist(); };

/* ------------------------------------------------------------- search */
async function runSearch(q = $("#sq").value) {
  q = q.trim(); if (q.length < 2) return;
  mode("search"); $("#sq").value = q;
  const box = $("#sres"); box.innerHTML = `<div class="vx-card vx-muted">${t("searching")}</div>`;
  try {
    const r = await api("/api/search?q=" + encodeURIComponent(q));
    if (r.abstained) { box.innerHTML = `<div class="vx-scope"><div><span class="lv">${AR() ? "ج" : "C"}</span><b>${esc(AR() ? r.message_ar : r.message_en)}</b></div></div>`; return; }
    box.innerHTML = `<p class="vx-count">${t("found")(r.quran.length, r.hadith.length)}</p><div class="vx-sgrid">` +
      r.quran.map((v) => `<article class="vx-card vx-sr"><div class="top">${chip({ status: "quran_exact" })}<span class="kind">${t("kind").quran}</span></div><p class="sacred" dir="rtl">﴿${esc(v.text)}﴾</p><a href="${esc(v.source_url)}" target="_blank" rel="noopener">${esc(cite(v))} ↗</a></article>`).join("") +
      r.hadith.map((h) => `<article class="vx-card vx-sr"><div class="top">${chip({ status: "authentic", evidence: [h] })}<span class="kind">${t("kind").hadith}</span></div>
        <p class="sacred snip" dir="rtl">${(h.highlight || []).map((w) => w.hit ? `<mark>${esc(w.w)}</mark>` : esc(w.w)).join(" ")}</p>
        <a href="${esc(h.source_url)}" target="_blank" rel="noopener">${esc(cite(h))} ↗</a>${h.also?.length ? `<span class="small"> · ${t("alsoIn")} ${h.also.map((a) => esc(cite(a))).join("، ")}</span>` : ""}</article>`).join("") + `</div>`;
  } catch { box.innerHTML = `<div class="vx-warn">${esc(t("err"))}</div>`; }
}
$("#sf").onsubmit = (e) => { e.preventDefault(); runSearch(); };

/* ------------------------------------------------------- input & OCR */
$("#go").onclick = () => run();
$("#msg").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); } });
$("#clear").onclick = () => { $("#msg").value = ""; $("#ocr").textContent = ""; $("#msg").focus(); };
$("#paste").onclick = async () => { try { const s = await navigator.clipboard.readText(); if (s) { $("#msg").value = s; $("#msg").focus(); } } catch { $("#msg").focus(); } };
$("#img").onchange = (e) => ocr(e.target.files[0]);
const drop = $("#drop");
["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (e) => { const f = [...(e.dataTransfer?.files || [])].find((x) => x.type.startsWith("image/")); if (f) ocr(f); });
$("#msg").addEventListener("paste", (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/")); if (f) { e.preventDefault(); ocr(f); } });
let tess = null;
async function ocr(file) {
  if (!file) return;
  const st = $("#ocr"); st.textContent = t("reading");
  try {
    if (!window.Tesseract) await (tess ||= new Promise((ok, bad) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }));
    const { data } = await window.Tesseract.recognize(file, "ara+eng");
    const ta = $("#msg"); ta.value = (ta.value ? ta.value + "\n" : "") + data.text.trim();
    st.textContent = t("readDone");
  } catch { st.textContent = t("readErr"); }
}

/* ---------------------------------------------------------------- start */
applyLang();
if (params.get("mode") === "search" || params.get("sq")) { mode("search"); if (params.get("sq")) runSearch(params.get("sq")); }
else {
  const q = params.get("q") || params.get("text");
  const ex = params.get("ex");
  if (q) { $("#msg").value = q; run(q); }
  else if (ex !== null && DEMOS[+ex]) { $("#msg").value = DEMOS[+ex].text; run(); }
  else $("#msg").focus();
}
