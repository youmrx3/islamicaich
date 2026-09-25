"use strict";

const I18N = {
  ar: {
    skip: "انتقل إلى أداة التحقق", tagline: "تحقّق قبل أن تنشر", nav_method: "المنهجية",
    hero_title: "وصلتك رسالة فيها حديث أو آية؟ الصقها هنا قبل أن تعيد إرسالها.",
    hero_lede: "نبحث عنها في القرآن الكريم وتسعة من كتب الحديث، ونعرض لك المصدر وحكم المحققين بأسمائهم، ونخبرك بصراحة إن لم نجدها.",
    forwarded: "رسالة معاد توجيهها", msg_label: "نص الرسالة", msg_ph: "الصق نص الرسالة هنا…",
    upload: "صورة لقطة شاشة", verify: "تحقّق", verifying: "جارٍ التحقق…", try: "جرّب:",
    ex0: "رسالة «انشرها»", ex1: "آية منقولة خطأ", ex2: "English forward", ex3: "حديث غير موجود", ex4: "حكم مختلف فيه",
    privacy: "لا نحفظ الرسائل التي تتحقق منها. قراءة الصور تتم على جهازك.",
    reply_title: "ردّ مقترح للمجموعة", copy: "انسخ الرد", copied: "نُسخ ✓", send_wa: "أرسل عبر واتساب",
    method_title: "كيف نصل إلى الحكم",
    m1_t: "المصادر تحكم، لا الذكاء الاصطناعي",
    m1_p: "كل حكم مصدره نص موثق: القرآن الكريم (نص تنزيل)، وتسعة كتب حديثية بأحكام محققين معروفين. قد يساعد نموذج لغوي في استخراج الاقتباسات فقط، ولا يُعتمد كلامه دليلًا.",
    m2_t: "عدم العثور ليس حكمًا بالوضع", m2_p: "إذا لم نجد النص نقول ذلك صراحة ونحيل إلى مختص، ولا نخترع مصدرًا ولا حكمًا.",
    m3_t: "نعرض الخلاف كما هو", m3_p: "عند اختلاف المحققين نعرض حكم كل واحد باسمه. وإذا ثبت اللفظ من طريق صحيح لم تُسقطه الطرق الضعيفة.",
    m4_t: "ليس فتوى", m4_p: "ثَبَت أداة للتحقق من النسبة والمصدر، وليست جهة إفتاء. سجل العبارات المشتهرة مسودة تخضع لمراجعة مختصين.",
    foot: "ثَبَت — مشروع مفتوح المصدر لتحدي الذكاء الاصطناعي في خدمة المحتوى الإسلامي ٢٠٢٦", review_link: "صفحة المراجعة",
    n_quote: "النص المتداول", n_source: "المصدر", n_grades: "حكم المحققين", n_verdict: "النتيجة", n_alt: "البديل الثابت",
    n_correct: "اللفظ الصحيح في المصحف", flag: "أبلغ عن خطأ في هذا الحكم", flagged: "شكرًا، أُرسل البلاغ للمراجعة.",
    flag_prompt: "ما الخطأ في هذا الحكم؟ (اختياري)",
    empty: "اكتب نص الرسالة أو ارفع صورة أولًا.", none_found: "لم نجد في الرسالة نصًا يُنسب إلى القرآن أو الحديث.",
    err: "تعذر إكمال التحقق. تأكد من الاتصال وأعد المحاولة.",
    sum_safe: "ما في الرسالة ثابت ويمكن نشره بإذن الله", sum_attn: (n) => `${n} من النصوص تحتاج انتباهًا قبل النشر`,
    sum_count: (n) => `${n} نص`, fwd_pressure: "تحتوي الرسالة على ضغط لإعادة النشر («انشرها… أمانة في رقبتك»)، وهذا غالبًا علامة على الرسائل غير الموثقة.",
    conf: { high: "ثقة عالية", medium: "ثقة متوسطة", low: "ثقة منخفضة" },
    refer: "يُحال إلى مختص", pending: "مسودة بانتظار مراجعة مختص", via_llm: "طُوبق عبر ترجمة آلية",
    other_routes: "له طرق أخرى أضعف", in_sahihayn: "في الصحيحين", q_as_h: "نُسب للنبي ﷺ وهو آية", wording_differs: "اللفظ المتداول يختلف قليلًا عن لفظ المصدر", h_as_q: "نُسب للقرآن وهو حديث",
    also: "ورد أيضًا في", open_src: "افتح المصدر", show_full: "عرض النص كاملًا", level: "مستوى", match: "تطابق",
    legend: "الأحمر المشطوب: ما نُقل خطأ أو زِيد · الأخضر: اللفظ الصحيح", ocr_load: "جارٍ قراءة الصورة…", ocr_done: "تمت قراءة الصورة ✓", ocr_err: "تعذرت قراءة الصورة",
    graders_none: "لا يوجد حكم محقق في البيانات", sources_line: (h) => `المصادر المفهرسة: ${h.quran_verses} آية، ${h.hadith_records.toLocaleString("ar")} رواية من ${h.collections.length} كتب. لغات البحث: العربية، الإنجليزية، الفرنسية، الإندونيسية، التركية.`,
    lang_btn: "English",
  },
  en: {
    skip: "Skip to the checker", tagline: "Verify before you forward", nav_method: "Method",
    hero_title: "Got a message quoting a hadith or a verse? Paste it here before you forward it.",
    hero_lede: "We look it up in the Quran and nine hadith collections, show the source and each named scholar's grading, and tell you plainly when we can't find it.",
    forwarded: "Forwarded", msg_label: "Message text", msg_ph: "Paste the message here…",
    upload: "Screenshot", verify: "Check", verifying: "Checking…", try: "Try:",
    ex0: "“Share this” forward", ex1: "Misquoted verse", ex2: "English forward", ex3: "Made-up hadith", ex4: "Disputed grading",
    privacy: "Messages you check are not stored. Screenshots are read on your device.",
    reply_title: "Suggested reply for the group", copy: "Copy reply", copied: "Copied ✓", send_wa: "Send via WhatsApp",
    method_title: "How we reach a verdict",
    m1_t: "Sources decide, not AI",
    m1_p: "Every verdict rests on a verified text: the Quran (Tanzil text) and nine hadith collections with named scholars' gradings. A language model may help find quotes, but its words are never used as evidence.",
    m2_t: "Not found is not “fabricated”", m2_p: "If we can't find a text we say so and refer you to a specialist. We never invent a source or a verdict.",
    m3_t: "Disagreement is shown as it is", m3_p: "When graders disagree we show each one by name. If a wording is established through a sound route, weaker routes don't cancel it.",
    m4_t: "Not a fatwa", m4_p: "Thabat checks attribution and sources; it does not issue religious rulings. The register of popular sayings is a draft under specialist review.",
    foot: "Thabat — open-source entry to the AI in Service of Islamic Content Challenge 2026", review_link: "Review queue",
    n_quote: "Circulating text", n_source: "Source", n_grades: "Scholars' grading", n_verdict: "Result", n_alt: "Authentic alternative",
    n_correct: "The verse as written in the Mushaf", flag: "Report a problem with this result", flagged: "Thanks — sent for review.",
    flag_prompt: "What is wrong with this result? (optional)",
    empty: "Paste a message or upload a screenshot first.", none_found: "We didn't find any text presented as Quran or hadith in this message.",
    err: "The check could not be completed. Check your connection and try again.",
    sum_safe: "Everything quoted here is established and fine to share", sum_attn: (n) => `${n} quote(s) need attention before sharing`,
    sum_count: (n) => `${n} quote(s)`, fwd_pressure: "This message pressures you to forward it (“share this… it's a trust on your neck”), a common sign of unverified content.",
    conf: { high: "High confidence", medium: "Medium confidence", low: "Low confidence" },
    refer: "Refer to a specialist", pending: "Draft — pending specialist review", via_llm: "Matched via AI translation",
    other_routes: "Also has weaker routes", in_sahihayn: "In Bukhari/Muslim", q_as_h: "Quoted as hadith, but it is a verse", wording_differs: "Circulating wording differs slightly from the source", h_as_q: "Quoted as Quran, but it is a hadith",
    also: "Also in", open_src: "Open source", show_full: "Show full text", level: "Level", match: "Match",
    legend: "Struck red: misquoted or added · Green: the correct wording", ocr_load: "Reading screenshot…", ocr_done: "Screenshot read ✓", ocr_err: "Couldn't read the image",
    graders_none: "No grading available in the data", sources_line: (h) => `Indexed: ${h.quran_verses} verses, ${h.hadith_records.toLocaleString("en")} narrations from ${h.collections.length} collections. Search languages: Arabic, English, French, Indonesian, Turkish.`,
    lang_btn: "العربية",
  },
};

const EXAMPLES = [
  "قال رسول الله ﷺ: «اطلبوا العلم ولو بالصين» 🌹\nوقال ﷺ: «الطهور شطر الإيمان»\nانشرها ولا تجعلها تقف عندك، أمانة في رقبتك 🙏",
  "قال تعالى: إن الله مع الصابرين إذا صبروا 🤲",
  "The Prophet (pbuh) said: \"Paradise lies under the feet of mothers.\"\nAnd he said: \"The strong man is not the one who wrestles, but the one who controls himself when angry.\"\nForward this to 10 people!",
  "قال رسول الله ﷺ: من صلى الفجر في جماعة ثم قرأ سورة الملك سبعين مرة غفر الله له ذنوب أربعين سنة",
  "قال رسول الله ﷺ: «طلب العلم فريضة على كل مسلم»\nوقال: «أنا مدينة العلم وعلي بابها»",
];

const TONE = {
  quran_exact: "quran", quran_variant: "check", authentic: "ok", authentic_by_routes: "ok",
  authentic_mawquf: "check", disputed: "check", needs_review: "check", weak: "bad", fabricated: "bad", baseless: "bad", not_found: "none",
};
const REPLY_LANGS = [["ar", "العربية"], ["en", "English"], ["fr", "Français"], ["id", "Indonesia"], ["tr", "Türkçe"]];

const params = new URLSearchParams(location.search);
let ui = params.get("lang") === "en" ? "en" : params.get("lang") === "ar" ? "ar" :
  (() => { try { return localStorage.getItem("thabat.ui") || "ar"; } catch { return "ar"; } })();
let lastResult = null;
let health = null;
const $ = (s, r = document) => r.querySelector(s);
const t = (k) => I18N[ui][k];

function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function applyLang() {
  document.documentElement.lang = ui;
  document.documentElement.dir = ui === "ar" ? "rtl" : "ltr";
  document.title = ui === "ar" ? "ثَبَت — تحقّق قبل أن تنشر" : "Thabat — verify before you forward";
  document.querySelectorAll("[data-i18n]").forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $("#langToggle").textContent = t("lang_btn");
  if (health) $("#sourcesLine").textContent = t("sources_line")(health);
  if (lastResult) render(lastResult);
}

$("#langToggle").addEventListener("click", () => {
  ui = ui === "ar" ? "en" : "ar";
  try { localStorage.setItem("thabat.ui", ui); } catch {}
  applyLang();

// Shareable, reproducible checks: /?ex=2 runs example 2, /?q=<text> runs any text.
if (params.has("ex") || params.has("q")) {
  msg.value = params.has("q") ? params.get("q") : (EXAMPLES[+params.get("ex")] || "");
  $("#count").textContent = msg.value.length;
  if (msg.value) run();
}
});

const msg = $("#msg");
msg.addEventListener("input", () => { $("#count").textContent = msg.value.length; });
msg.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
document.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
  msg.value = EXAMPLES[+b.dataset.ex]; $("#count").textContent = msg.value.length; run();
}));
$("#go").addEventListener("click", run);

async function run() {
  const text = msg.value.trim();
  const out = $("#out");
  if (text.length < 2) { out.hidden = false; $("#summary").innerHTML = `<span class="error">${esc(t("empty"))}</span>`; $("#results").innerHTML = ""; $("#replyBox").hidden = true; msg.focus(); return; }
  const btn = $("#go");
  btn.disabled = true; btn.textContent = t("verifying");
  out.hidden = false; $("#summary").innerHTML = `<span class="loading">${esc(t("verifying"))}</span>`; $("#results").innerHTML = ""; $("#replyBox").hidden = true;
  try {
    const res = await fetch("/api/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reply_lang: guessReplyLang(text) }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || res.status);
    lastResult = await res.json();
    render(lastResult);
    if (!params.has("noscroll")) $("#summary").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } catch (e) {
    $("#summary").innerHTML = `<span class="error">${esc(t("err"))} (${esc(e.message)})</span>`;
  } finally {
    btn.disabled = false; btn.textContent = t("verify");
  }
}

function guessReplyLang(text) {
  if (/[؀-ۿ]/.test(text)) return "ar";
  const s = text.toLowerCase();
  if (/\b(le|la|les|est|vous|prophète)\b/.test(s)) return "fr";
  if (/\b(yang|dan|bersabda|nabi)\b/.test(s)) return "id";
  if (/\b(ve|bir|buyurdu|peygamber)\b/.test(s)) return "tr";
  return "en";
}

function render(r) {
  const results = r.results || [];
  const s = $("#summary");
  if (!results.length) {
    s.innerHTML = `<strong>${esc(t("none_found"))}</strong>`;
  } else {
    const attn = results.filter((v) => !["quran_exact", "authentic", "authentic_by_routes"].includes(v.status)).length;
    s.innerHTML = `<strong style="color:var(--${r.summary.safe_to_share ? "malachite" : "cinnabar"})">${esc(r.summary.safe_to_share ? t("sum_safe") : t("sum_attn")(attn))}</strong>
      <span class="pill">${esc(t("sum_count")(results.length))}</span>
      ${r.llm_used ? `<span class="pill">LLM ✓</span>` : ""}
      <span class="pill mono">${r.elapsed_ms ?? ""} ms</span>
      ${r.flags?.includes("forward_pressure") ? `<span class="flag-warn">⚠ ${esc(t("fwd_pressure"))}</span>` : ""}`;
  }
  const ol = $("#results");
  ol.innerHTML = "";
  results.forEach((v) => ol.appendChild(card(v)));
  renderReply(r);
}

function card(v) {
  const li = $("#tplResult").content.firstElementChild.cloneNode(true);
  li.dataset.tone = TONE[v.status] || "none";
  li.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $(".quote", li).textContent = v.quote;

  const src = $(".node-source", li);
  const grades = $(".node-grades", li);
  const ev = v.evidence || [];
  if (v.kind === "quran" && v.quran) {
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div class="src-title"><a href="${esc(ev[0]?.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? v.quran.citation_ar : v.quran.citation_en)}</a></div>
      ${v.status === "quran_variant" ? `<span class="node-label" style="margin-top:8px">${esc(t("n_correct"))}</span><p class="diff" dir="rtl" lang="ar">${diffHtml(v.quran.diff)}</p><div class="legend">${esc(t("legend"))}</div>` : `<p class="sacred" dir="rtl" lang="ar">${esc(v.quran.text_uthmani)}</p>`}`;
    grades.remove();
  } else if (ev.length) {
    const e0 = ev[0];
    const also = ev.slice(1).map((e) => `<a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? e.citation_ar : e.citation_en)}</a>`).join(" · ");
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div class="src-title"><a href="${esc(e0.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? e0.citation_ar : e0.citation_en)}</a> <span class="mono">${esc(t("match"))} ${Math.round(e0.score * 100)}%</span></div>
      ${e0.snippet ? `<p class="sacred" dir="rtl" lang="ar">${esc(e0.snippet.before)} <mark>${esc(e0.snippet.match)}</mark> ${esc(e0.snippet.after)}</p>` : ""}
      ${ui === "en" && e0.translation ? `<p class="trans">${esc(trim(e0.translation, 360))}</p>` : ""}
      ${also ? `<div class="more">${esc(t("also"))}: ${also}</div>` : ""}`;
    grades.innerHTML = `<span class="node-label">${esc(t("n_grades"))}</span>${gradesHtml(ev)}`;
  } else if (v.registry) {
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div>${v.registry.sources.map((s) => `<div class="src-title">${esc(ui === "ar" ? s.ar : s.en)}</div>`).join("")}</div>`;
    grades.remove();
  } else {
    src.remove(); grades.remove();
  }

  $(".seal-level", li).textContent = `${v.level}`;
  $(".seal-label", li).textContent = ui === "ar" ? v.label_ar : v.label_en;
  $(".seal", li).title = ui === "ar" ? v.level_ar : v.level_en;
  $(".explain", li).textContent = ui === "ar" ? v.explanation_ar : v.explanation_en;
  const tags = [`<span class="tag">${esc(t("conf")[v.confidence])}</span>`];
  if (v.refer_to_specialist) tags.push(`<span class="tag refer">↗ ${esc(t("refer"))}</span>`);
  if (v.notes?.includes("registry_pending_review")) tags.push(`<span class="tag warn">${esc(t("pending"))}</span>`);
  if (v.via === "llm_translation") tags.push(`<span class="tag warn">${esc(t("via_llm"))}</span>`);
  if (v.notes?.includes("other_routes_weaker")) tags.push(`<span class="tag">${esc(t("other_routes"))}</span>`);
  if (v.notes?.includes("quran_attributed_as_hadith")) tags.push(`<span class="tag warn">${esc(t("q_as_h"))}</span>`);
  if (v.notes?.includes("wording_differs")) tags.push(`<span class="tag warn">${esc(t("wording_differs"))}</span>`);
  if (v.notes?.includes("hadith_attributed_as_quran")) tags.push(`<span class="tag warn">${esc(t("h_as_q"))}</span>`);
  $(".meta", li).innerHTML = tags.join("");

  const alts = v.alternatives || [];
  if (alts.length) {
    const a = alts[0];
    const altNode = $(".node-alt", li);
    altNode.hidden = false;
    const text = a.type === "quran" ? a.text : (a.snippet?.match || a.quote_ar || a.ar);
    altNode.innerHTML = `<span class="node-label">${esc(t("n_alt"))}</span>
      <p class="sacred" dir="rtl" lang="ar">${a.type === "quran" ? "﴿" + esc(text) + "﴾" : "«" + esc(text) + "»"}</p>
      ${ui === "en" && (a.quote_en || a.translation) ? `<p class="trans">${esc(a.quote_en || trim(a.translation, 240))}</p>` : ""}
      <div class="src-title"><a href="${esc(a.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? a.citation_ar : a.citation_en)}</a>
      ${a.grade ? `<span class="mono"> · ${esc(a.grade.basis === "sahihayn" ? t("in_sahihayn") : [...new Set((a.grade.grades || []).map((g) => g.label))].slice(0, 2).join(" / "))}</span>` : ""}</div>`;
  }

  $(".flag", li).addEventListener("click", async (e) => {
    const comment = window.prompt(t("flag_prompt")) ?? null;
    if (comment === null) return;
    await fetch("/api/flag", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote: v.quote.slice(0, 1000), status: v.status, evidence_id: ev[0]?.id || v.registry?.id || null, comment: comment.slice(0, 1000) }) }).catch(() => {});
    e.target.textContent = t("flagged"); e.target.disabled = true;
  });
  return li;
}

function gradesHtml(ev) {
  const e0 = ev[0];
  const g = e0.grade;
  if (g.basis === "sahihayn") return `<div class="grades"><span class="grade" data-c="authentic"><b>${esc(t("in_sahihayn"))}</b></span></div><p class="more">${esc(ui === "ar" ? g.note_ar : g.note_en)}</p>`;
  if (!g.grades?.length) return `<p class="more">${esc(t("graders_none"))}</p>`;
  return `<div class="grades">${g.grades.map((x) => `<span class="grade" data-c="${esc(x.category)}"><b>${esc(ui === "ar" ? x.grader_ar : x.grader)}</b>: <span class="raw">${esc(x.label)}</span></span>`).join("")}</div>
    <p class="more">${esc(ui === "ar" ? g.note_ar : g.note_en)}</p>`;
}

function diffHtml(ops) {
  return ops.map((o) => {
    if (o.op === "equal") return esc(o.text);
    if (o.op === "minor") return `<span class="minor" title="${esc(o.quoted)}">${esc(o.correct)}</span>`;
    if (o.op === "wrong") return `<span class="wrong">${esc(o.quoted)}</span> <span class="fix">${esc(o.correct)}</span>`;
    if (o.op === "extra") return `<span class="extra">${esc(o.quoted)}</span>`;
    if (o.op === "missing") return `<span class="missing">${esc(o.correct)}</span>`;
    return "";
  }).join(" ");
}

function trim(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

function renderReply(r) {
  const box = $("#replyBox");
  if (!r.reply) { box.hidden = true; return; }
  box.hidden = false;
  const seg = $("#replyLangs");
  seg.innerHTML = REPLY_LANGS.map(([k, n]) => `<button type="button" role="tab" data-l="${k}" aria-selected="${k === r.reply_lang}">${n}</button>`).join("");
  seg.querySelectorAll("button").forEach((b) => b.addEventListener("click", async () => {
    const res = await fetch("/api/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: b.dataset.l, result: r }) });
    const j = await res.json();
    r.reply = j.reply; r.reply_lang = j.lang; renderReply(r);
  }));
  $("#replyText").textContent = r.reply;
  $("#waReply").href = "https://wa.me/?text=" + encodeURIComponent(r.reply);
}

$("#copyReply").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#replyText").textContent); $("#copyReply").textContent = t("copied"); setTimeout(() => ($("#copyReply").textContent = t("copy")), 1800); } catch {}
});

// ---- screenshot OCR, fully on-device (tesseract.js, Arabic + English)
let tesseractLoading = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  if (!tesseractLoading) tesseractLoading = new Promise((ok, bad) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload = ok; s.onerror = bad; document.head.appendChild(s);
  });
  return tesseractLoading;
}
$("#img").addEventListener("change", async (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  const st = $("#ocrStatus");
  st.textContent = t("ocr_load");
  try {
    await loadTesseract();
    const { data } = await window.Tesseract.recognize(f, "ara+eng");
    msg.value = (msg.value ? msg.value + "\n" : "") + data.text.trim();
    $("#count").textContent = msg.value.length;
    st.textContent = t("ocr_done");
  } catch (err) {
    st.textContent = t("ocr_err");
  } finally { e.target.value = ""; }
});

fetch("/api/health").then((r) => r.json()).then((h) => { health = h; $("#sourcesLine").textContent = t("sources_line")(h); }).catch(() => {});
applyLang();

// Shareable, reproducible checks: /?ex=2 runs example 2, /?q=<text> runs any text.
if (params.has("ex") || params.has("q")) {
  msg.value = params.has("q") ? params.get("q") : (EXAMPLES[+params.get("ex")] || "");
  $("#count").textContent = msg.value.length;
  if (msg.value) run();
}
