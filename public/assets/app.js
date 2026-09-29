"use strict";

const I18N = {
  ar: {
    skip: "انتقل إلى أداة التحقق", tagline: "تحقّق قبل أن تنشر", nav_method: "المنهجية",
    mode_verify: "تحقّق من رسالة", mode_search: "ابحث عن دليل ثابت",
    hero_title: "وصلتك رسالة فيها حديث أو آية؟ الصقها هنا قبل أن تعيد إرسالها.",
    hero_lede: "نبحث عنها في القرآن الكريم وتسعة من كتب الحديث، ونعرض لك المصدر وحكم المحققين بأسمائهم، ونخبرك بصراحة إن لم نجدها.",
    forwarded: "رسالة معاد توجيهها", msg_label: "نص الرسالة", msg_ph: "الصق نص الرسالة هنا…",
    upload: "صورة لقطة شاشة", verify: "تحقّق", verifying: "جارٍ التحقق…", try: "جرّب:",
    ex0: "رسالة «انشرها»", ex1: "آية منقولة خطأ", ex2: "English forward", ex3: "حديث غير موجود", ex4: "حكم مختلف فيه", ex5: "طلب فتوى",
    privacy: "لا نحفظ الرسائل التي تتحقق منها. قراءة الصور تتم على جهازك.", privacy_link: "سياسة الخصوصية",
    reply_title: "ردّ مقترح للمجموعة", copy: "انسخ الرد", copied: "نُسخ ✓", send_wa: "أرسل عبر واتساب",
    foot: "ثَبَت — مشروع مفتوح المصدر لتحدي الذكاء الاصطناعي في خدمة المحتوى الإسلامي ٢٠٢٦", review_link: "صفحة المراجعة",
    n_quote: "النص المتداول", n_source: "المصدر", n_grades: "حكم المحققين", n_verdict: "النتيجة", n_alt: "البديل الثابت",
    n_correct: "اللفظ الصحيح في المصحف", flag: "أبلغ عن خطأ في هذا الحكم", flagged: "شكرًا، أُرسل البلاغ للمراجعة.",
    flag_prompt: "ما الخطأ في هذا الحكم؟ (اختياري)", flag_fail: "تعذر إرسال البلاغ الآن.",
    empty: "اكتب نص الرسالة أو ارفع صورة أولًا.", none_found: "لم نجد في الرسالة نصًا يُنسب إلى القرآن أو الحديث.",
    err: "تعذر إكمال التحقق. تأكد من الاتصال وأعد المحاولة.",
    sum_safe: "ما في الرسالة ثابت ويمكن نشره بإذن الله", sum_attn: (n) => `${n} من النصوص تحتاج انتباهًا قبل النشر`,
    sum_count: (n) => `${n} نص`, fwd_pressure: "تحتوي الرسالة على ضغط لإعادة النشر («انشرها… أمانة في رقبتك»)، وهذا غالبًا علامة على الرسائل غير الموثقة.",
    conf: { high: "ثقة عالية", medium: "ثقة متوسطة", low: "ثقة منخفضة" },
    refer: "يُحال إلى مختص", pending: "مسودة بانتظار مراجعة مختص", via_llm: "طُوبق عبر ترجمة آلية",
    other_routes: "له طرق أخرى أضعف", in_sahihayn: "في الصحيحين", q_as_h: "نُسب للنبي ﷺ وهو آية", h_as_q: "نُسب للقرآن وهو حديث",
    wording_differs: "اللفظ المتداول يختلف قليلًا عن لفظ المصدر",
    also: "ورد أيضًا في", match: "تطابق", level_word: "المستوى",
    legend: "الأحمر المشطوب: ما نُقل خطأ أو زِيد · الأخضر: اللفظ الصحيح", ocr_load: "جارٍ قراءة الصورة…", ocr_done: "تمت قراءة الصورة ✓ راجع النص قبل التحقق", ocr_err: "تعذرت قراءة الصورة",
    graders_none: "لا يوجد حكم محقق في البيانات", dorar: "تحقق أيضًا في الدرر السنية ↗", quran_ext: "افتح الآية في المصحف ↗",
    scope_refs: "جهات مقترحة:",
    transp: "نتيجة آلية من أداة مدعومة بالذكاء الاصطناعي تعتمد على مصادر موثقة، وليست فتوى ولا رأي مختص بشري.",
    s_title: "تبحث عن دليل صحيح لموضوع ما؟", s_lede: "اكتب الموضوع، ونعرض لك الآيات والأحاديث الثابتة التي تذكره فقط، مع مصدرها وحكمها. وإن لم نجد، قلنا ذلك ولم نختلق دليلًا.",
    s_label: "الموضوع", s_ph: "مثال: بر الوالدين، الصدق، الرفق", s_go: "ابحث", s_ex_none: "دليل غير موجود",
    s_all: "اعرض الروايات الضعيفة أيضًا (مع وسمها)", s_found: (q, h) => `${q} آية و${h} حديث ثابت`, s_verse: "آية",
    lang_btn: "English",
  },
  en: {
    skip: "Skip to the checker", tagline: "Verify before you forward", nav_method: "Method",
    mode_verify: "Check a message", mode_search: "Find authentic evidence",
    hero_title: "Got a message quoting a hadith or a verse? Paste it here before you forward it.",
    hero_lede: "We look it up in the Quran and nine hadith collections, show the source and each named scholar's grading, and tell you plainly when we can't find it.",
    forwarded: "Forwarded", msg_label: "Message text", msg_ph: "Paste the message here…",
    upload: "Screenshot", verify: "Check", verifying: "Checking…", try: "Try:",
    ex0: "“Share this” forward", ex1: "Misquoted verse", ex2: "English forward", ex3: "Made-up hadith", ex4: "Disputed grading", ex5: "Fatwa request",
    privacy: "Messages you check are not stored. Screenshots are read on your device.", privacy_link: "Privacy policy",
    reply_title: "Suggested reply for the group", copy: "Copy reply", copied: "Copied ✓", send_wa: "Send via WhatsApp",
    foot: "Thabat — open-source entry to the AI in Service of Islamic Content Challenge 2026", review_link: "Review queue",
    n_quote: "Circulating text", n_source: "Source", n_grades: "Scholars' grading", n_verdict: "Result", n_alt: "Authentic alternative",
    n_correct: "The verse as written in the Mushaf", flag: "Report a problem with this result", flagged: "Thanks — sent for review.",
    flag_prompt: "What is wrong with this result? (optional)", flag_fail: "The report could not be sent right now.",
    empty: "Paste a message or upload a screenshot first.", none_found: "We didn't find any text presented as Quran or hadith in this message.",
    err: "The check could not be completed. Check your connection and try again.",
    sum_safe: "Everything quoted here is established and fine to share", sum_attn: (n) => `${n} quote(s) need attention before sharing`,
    sum_count: (n) => `${n} quote(s)`, fwd_pressure: "This message pressures you to forward it (“share this… it's a trust on your neck”), a common sign of unverified content.",
    conf: { high: "High confidence", medium: "Medium confidence", low: "Low confidence" },
    refer: "Refer to a specialist", pending: "Draft — pending specialist review", via_llm: "Matched via AI translation",
    other_routes: "Also has weaker routes", in_sahihayn: "In Bukhari/Muslim", q_as_h: "Quoted as hadith, but it is a verse", h_as_q: "Quoted as Quran, but it is a hadith",
    wording_differs: "Circulating wording differs slightly from the source",
    also: "Also in", match: "Match", level_word: "Level",
    legend: "Struck red: misquoted or added · Green: the correct wording", ocr_load: "Reading screenshot…", ocr_done: "Screenshot read ✓ check the text before verifying", ocr_err: "Couldn't read the image",
    graders_none: "No grading available in the data", dorar: "Cross-check on Dorar ↗", quran_ext: "Open the verse ↗",
    scope_refs: "Suggested references:",
    transp: "Automated result from an AI-assisted tool grounded in documented sources; not a fatwa or a human specialist's opinion.",
    s_title: "Looking for authentic evidence on a topic?", s_lede: "Type a topic and we show only the verses and authentic hadith that mention it, with source and grading. If there are none, we say so instead of inventing one.",
    s_label: "Topic", s_ph: "e.g. kindness to parents, honesty, gentleness", s_go: "Search", s_ex_none: "No evidence exists",
    s_all: "Also show weak narrations (clearly labelled)", s_found: (q, h) => `${q} verse(s) and ${h} authentic hadith`, s_verse: "Verse",
    lang_btn: "العربية",
  },
};

const EXAMPLES = [
  "قال رسول الله ﷺ: «اطلبوا العلم ولو بالصين» 🌹\nوقال ﷺ: «الطهور شطر الإيمان»\nانشرها ولا تجعلها تقف عندك، أمانة في رقبتك 🙏",
  "قال تعالى: إن الله مع الصابرين إذا صبروا 🤲",
  "The Prophet (pbuh) said: \"Paradise lies under the feet of mothers.\"\nAnd he said: \"The strong man is not the one who wrestles, but the one who controls himself when angry.\"\nForward this to 10 people!",
  "قال رسول الله ﷺ: من صلى الفجر في جماعة ثم قرأ سورة الملك سبعين مرة غفر الله له ذنوب أربعين سنة",
  "قال رسول الله ﷺ: «طلب العلم فريضة على كل مسلم»\nوقال: «أنا مدينة العلم وعلي بابها»",
  "أنا أعيش في دولة أوروبية، هل يجوز لي أن أعقد زواجي في المحكمة فقط دون ولي؟",
];

const TONE = {
  quran_exact: "quran", quran_variant: "check", authentic: "ok", authentic_by_routes: "ok",
  authentic_mawquf: "check", disputed: "check", needs_review: "check", weak: "bad", fabricated: "bad", baseless: "bad", not_found: "none",
};
const OK = ["quran_exact", "authentic", "authentic_by_routes"];
const REPLY_LANGS = [["ar", "العربية"], ["en", "English"], ["fr", "Français"], ["id", "Indonesia"], ["tr", "Türkçe"]];

const params = new URLSearchParams(location.search);
if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme");
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
let ui = params.get("lang") === "en" ? "en" : params.get("lang") === "ar" ? "ar" : (store.get("thabat.ui") || "ar");
let lastResult = null, lastSearch = null;
const $ = (s, r = document) => r.querySelector(s);
const t = (k) => I18N[ui][k];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const trim = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyLang() {
  document.documentElement.lang = ui;
  document.documentElement.dir = ui === "ar" ? "rtl" : "ltr";
  document.title = ui === "ar" ? "ثَبَت — أداة التحقق" : "Thabat — the checker";
  document.querySelectorAll("[data-i18n]").forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $("#langToggle").textContent = t("lang_btn");
  if (lastResult) render(lastResult);
  if (lastSearch) renderSearch(lastSearch);
}
$("#langToggle").addEventListener("click", () => { ui = ui === "ar" ? "en" : "ar"; store.set("thabat.ui", ui); applyLang(); });

// ---- modes
function setMode(m) {
  const verify = m !== "search";
  $("#tabVerify").setAttribute("aria-selected", verify); $("#tabSearch").setAttribute("aria-selected", !verify);
  $("#panelVerify").hidden = !verify; $("#panelSearch").hidden = verify;
}
$("#tabVerify").addEventListener("click", () => setMode("verify"));
$("#tabSearch").addEventListener("click", () => { setMode("search"); $("#sq").focus(); });

// ---- verify
const msg = $("#msg");
msg.addEventListener("input", () => { $("#count").textContent = msg.value.length; });
msg.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); });
document.querySelectorAll(".chip[data-ex]").forEach((b) => b.addEventListener("click", () => {
  msg.value = EXAMPLES[+b.dataset.ex]; $("#count").textContent = msg.value.length; run();
}));
$("#go").addEventListener("click", run);

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
  return res.json();
}

async function run() {
  const text = msg.value.trim();
  const out = $("#out");
  out.hidden = false; $("#results").innerHTML = ""; $("#replyBox").hidden = true; $("#scopeNote").hidden = true; $("#transparency").textContent = "";
  if (text.length < 2) { $("#summary").innerHTML = `<span class="error">${esc(t("empty"))}</span>`; msg.focus(); return; }
  const btn = $("#go");
  btn.disabled = true; btn.textContent = t("verifying");
  $("#summary").innerHTML = `<span class="loading">${esc(t("verifying"))}</span>`;
  try {
    lastResult = await api("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reply_lang: guessReplyLang(text) }) });
    render(lastResult);
    if (!params.has("noscroll")) $("#summary").scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  } catch (e) {
    $("#summary").innerHTML = `<span class="error">${esc(t("err"))} (${esc(e.message)})</span>`;
  } finally { btn.disabled = false; btn.textContent = t("verify"); }
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
    s.innerHTML = r.scope ? "" : `<strong>${esc(t("none_found"))}</strong>`;
    s.hidden = !!r.scope;
  } else {
    s.hidden = false;
    const attn = results.filter((v) => !OK.includes(v.status)).length;
    s.innerHTML = `<strong style="color:var(--${r.summary.safe_to_share ? "malachite" : "cinnabar"})">${esc(r.summary.safe_to_share ? t("sum_safe") : t("sum_attn")(attn))}</strong>
      <span class="pill">${esc(t("sum_count")(results.length))}</span>
      ${r.llm_used ? `<span class="pill">LLM ✓</span>` : ""}
      <span class="pill mono">${r.elapsed_ms ?? ""} ms</span>
      ${r.flags?.includes("forward_pressure") ? `<span class="flag-warn">⚠ ${esc(t("fwd_pressure"))}</span>` : ""}`;
  }
  renderScope(r.scope);
  const ol = $("#results");
  ol.innerHTML = "";
  results.forEach((v) => ol.appendChild(card(v)));
  renderReply(r);
  $("#transparency").textContent = t("transp");
}

function renderScope(sc) {
  const box = $("#scopeNote");
  if (!sc) { box.hidden = true; return; }
  box.hidden = false;
  box.dataset.kind = sc.kind;
  box.innerHTML = `<div class="scope-head"><span class="seal-level">${esc(ui === "ar" ? sc.level : sc.level_latin)}</span>
    <strong>${esc(ui === "ar" ? sc.message_ar : sc.message_en)}</strong></div>
    ${sc.referrals?.length ? `<p class="scope-refs">${esc(t("scope_refs"))} ${sc.referrals.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? x.name_ar : x.name_en)}</a>`).join(" · ")}</p>` : ""}`;
}

function levelLabel(v) { return ui === "ar" ? v.level : v.level_latin; }

function card(v) {
  const li = $("#tplResult").content.firstElementChild.cloneNode(true);
  li.dataset.tone = TONE[v.status] || "none";
  li.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $(".quote", li).textContent = v.quote;

  const src = $(".node-source", li), grades = $(".node-grades", li), ev = v.evidence || [];
  if (v.kind === "quran" && v.quran) {
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div class="src-title"><a href="${esc(ev[0]?.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? v.quran.citation_ar : v.quran.citation_en)}</a></div>
      ${v.status === "quran_variant" ? `<span class="node-label" style="margin-top:8px">${esc(t("n_correct"))}</span><p class="diff" dir="rtl" lang="ar">${diffHtml(v.quran.diff)}</p><div class="legend">${esc(t("legend"))}</div>` : `<p class="sacred" dir="rtl" lang="ar">${esc(v.quran.text_uthmani)}</p>`}`;
    grades.remove();
  } else if (ev.length) {
    const e0 = ev[0];
    const also = ev.slice(1).map((e) => `<a href="${esc(e.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? e.citation_ar : e.citation_en)}</a>`).join(" · ");
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div class="src-title"><a href="${esc(e0.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? e0.citation_ar : e0.citation_en)}</a> <span class="pill-sm">${esc(t("match"))} ${Math.round(e0.score * 100)}%</span></div>
      ${e0.snippet ? `<p class="sacred" dir="rtl" lang="ar">${esc(e0.snippet.before)} <mark>${esc(e0.snippet.match)}</mark> ${esc(e0.snippet.after)}</p>` : ""}
      ${ui === "en" && e0.translation ? `<p class="trans">${esc(trim(e0.translation, 360))}</p>` : ""}
      ${also ? `<div class="more">${esc(t("also"))}: ${also}</div>` : ""}`;
    grades.innerHTML = `<span class="node-label">${esc(t("n_grades"))}</span>${gradesHtml(e0.grade)}`;
  } else if (v.registry) {
    src.innerHTML = `<span class="node-label">${esc(t("n_source"))}</span>
      <div>${v.registry.sources.map((s) => `<div class="src-title">${esc(ui === "ar" ? s.ar : s.en)}</div>`).join("")}</div>`;
    grades.remove();
  } else { src.remove(); grades.remove(); }

  $(".seal-level", li).textContent = levelLabel(v);
  $(".seal-level", li).title = ui === "ar" ? v.level_ar : v.level_en;
  $(".seal-label", li).textContent = ui === "ar" ? v.label_ar : v.label_en;
  $(".explain", li).textContent = ui === "ar" ? v.explanation_ar : v.explanation_en;
  const tags = [`<span class="tag" title="${esc(ui === "ar" ? v.level_ar : v.level_en)}">${esc(t("level_word"))} ${esc(levelLabel(v))}</span>`,
    `<span class="tag">${esc(t("conf")[v.confidence])}</span>`];
  if (v.refer_to_specialist) tags.push(`<span class="tag refer">↗ ${esc(t("refer"))}</span>`);
  const notes = v.notes || [];
  if (notes.includes("registry_pending_review")) tags.push(`<span class="tag warn">${esc(t("pending"))}</span>`);
  if (v.via === "llm_translation") tags.push(`<span class="tag warn">${esc(t("via_llm"))}</span>`);
  if (notes.includes("other_routes_weaker")) tags.push(`<span class="tag">${esc(t("other_routes"))}</span>`);
  if (notes.includes("wording_differs")) tags.push(`<span class="tag warn">${esc(t("wording_differs"))}</span>`);
  if (notes.includes("quran_attributed_as_hadith")) tags.push(`<span class="tag warn">${esc(t("q_as_h"))}</span>`);
  if (notes.includes("hadith_attributed_as_quran")) tags.push(`<span class="tag warn">${esc(t("h_as_q"))}</span>`);
  $(".meta", li).innerHTML = tags.join("");

  const alts = v.alternatives || [];
  if (alts.length) {
    const a = alts[0], altNode = $(".node-alt", li);
    altNode.hidden = false;
    const text = a.type === "quran" ? a.text : (a.snippet?.match || a.quote_ar || a.ar);
    altNode.innerHTML = `<span class="node-label">${esc(t("n_alt"))}</span>
      <p class="sacred" dir="rtl" lang="ar">${a.type === "quran" ? "﴿" + esc(text) + "﴾" : "«" + esc(text) + "»"}</p>
      ${ui === "en" && (a.quote_en || a.translation) ? `<p class="trans">${esc(a.quote_en || trim(a.translation, 240))}</p>` : ""}
      <div class="src-title"><a href="${esc(a.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? a.citation_ar : a.citation_en)}</a>
      ${a.grade ? `<span class="pill-sm">${esc(a.grade.basis === "sahihayn" ? t("in_sahihayn") : [...new Set((a.grade.grades || []).map((g) => g.label))].slice(0, 2).join(" / "))}</span>` : ""}</div>`;
  }

  // Independent cross-check, as the scientific annex recommends (dorar.net/hadith, quran text).
  const ext = $(".verify-ext", li);
  if (v.kind === "quran" && v.quran) { ext.hidden = false; ext.href = ev[0]?.source_url; ext.textContent = t("quran_ext"); }
  else if (/[؀-ۿ]/.test(v.quote)) { ext.hidden = false; ext.href = "https://dorar.net/hadith/search?q=" + encodeURIComponent(v.quote.slice(0, 120)); ext.textContent = t("dorar"); }

  $(".flag", li).addEventListener("click", async (e) => {
    const comment = window.prompt(t("flag_prompt"));
    if (comment === null) return;
    try {
      await api("/api/flag", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: v.quote.slice(0, 1000), status: v.status, evidence_id: ev[0]?.id || v.registry?.id || null, comment: comment.slice(0, 1000) }) });
      e.target.textContent = t("flagged"); e.target.disabled = true;
    } catch { e.target.textContent = t("flag_fail"); }
  });
  return li;
}

function gradesHtml(g) {
  if (!g) return "";
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

function renderReply(r) {
  const box = $("#replyBox");
  if (!r.reply) { box.hidden = true; return; }
  box.hidden = false;
  const seg = $("#replyLangs");
  seg.innerHTML = REPLY_LANGS.map(([k, n]) => `<button type="button" role="tab" data-l="${k}" aria-selected="${k === r.reply_lang}">${n}</button>`).join("");
  seg.querySelectorAll("button").forEach((b) => b.addEventListener("click", async () => {
    try {
      const j = await api("/api/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang: b.dataset.l, result: r }) });
      r.reply = j.reply; r.reply_lang = j.lang; renderReply(r);
    } catch {}
  }));
  $("#replyText").textContent = r.reply;
  $("#waReply").href = "https://wa.me/?text=" + encodeURIComponent(r.reply);
}

$("#copyReply").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#replyText").textContent); $("#copyReply").textContent = t("copied"); setTimeout(() => ($("#copyReply").textContent = t("copy")), 1800); } catch {}
});

// ---- search mode
$("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); runSearch(); });
document.querySelectorAll(".chip[data-sq]").forEach((b) => b.addEventListener("click", () => { $("#sq").value = b.dataset.sq; runSearch(); }));

async function runSearch() {
  const q = $("#sq").value.trim();
  if (q.length < 2) { $("#sq").focus(); return; }
  $("#sOut").hidden = false; $("#sResults").innerHTML = "";
  $("#sSummary").innerHTML = `<span class="loading">${esc(t("verifying"))}</span>`;
  try {
    lastSearch = await api(`/api/search?q=${encodeURIComponent(q)}${$("#allGrades").checked ? "&all_grades=true" : ""}`);
    renderSearch(lastSearch);
  } catch (e) { $("#sSummary").innerHTML = `<span class="error">${esc(t("err"))} (${esc(e.message)})</span>`; }
}

function renderSearch(r) {
  const s = $("#sSummary"), ol = $("#sResults");
  ol.innerHTML = "";
  if (r.abstained) {
    s.innerHTML = `<div class="scope-head"><span class="seal-level">${ui === "ar" ? "ج" : "C"}</span><strong>${esc(ui === "ar" ? r.message_ar : r.message_en)}</strong></div>`;
    return;
  }
  s.innerHTML = `<strong>${esc(t("s_found")(r.quran.length, r.hadith.length))}</strong> <span class="pill mono">${r.elapsed_ms} ms</span>`;
  r.quran.forEach((v) => {
    const li = document.createElement("li");
    li.className = "card"; li.dataset.tone = "quran";
    li.innerHTML = `<div class="chain" aria-hidden="true"></div><div class="node"><span class="node-label">${esc(t("s_verse"))}</span>
      <p class="sacred" dir="rtl" lang="ar">﴿${esc(v.text)}﴾</p>
      <div class="src-title"><a href="${esc(v.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? v.citation_ar : v.citation_en)}</a></div></div>`;
    ol.appendChild(li);
  });
  r.hadith.forEach((h) => {
    const li = document.createElement("li");
    li.className = "card"; li.dataset.tone = h.grade.status === "authentic" ? "ok" : h.grade.status === "weak" || h.grade.status === "fabricated" ? "bad" : "check";
    const hl = h.highlight ? h.highlight.map((x) => x.hit ? `<mark>${esc(x.w)}</mark>` : esc(x.w)).join(" ") : esc(trim(h.ar, 400));
    const tr = h.translations?.[ui === "en" ? "eng" : "eng"];
    li.innerHTML = `<div class="chain" aria-hidden="true"></div>
      <div class="node"><span class="node-label">${esc(t("n_source"))}</span>
        <div class="src-title"><a href="${esc(h.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? h.citation_ar : h.citation_en)}</a></div>
        <p class="sacred" dir="rtl" lang="ar">${hl}</p>
        ${ui === "en" && tr ? `<p class="trans">${esc(trim(tr, 360))}</p>` : ""}
        ${h.also?.length ? `<div class="more">${esc(t("also"))}: ${h.also.map((x) => `<a href="${esc(x.source_url)}" target="_blank" rel="noopener">${esc(ui === "ar" ? x.citation_ar : x.citation_en)}</a>`).join(" · ")}</div>` : ""}</div>
      <div class="node"><span class="node-label">${esc(t("n_grades"))}</span>${gradesHtml(h.grade)}</div>`;
    ol.appendChild(li);
  });
}

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
  } catch { st.textContent = t("ocr_err"); } finally { e.target.value = ""; }
});

applyLang();
if (params.get("mode") === "search") setMode("search");
// Shareable, reproducible checks: /app?ex=2 runs example 2, /app?q=<text> checks any text, /app?mode=search&sq=<topic> searches.
if (params.has("ex") || params.has("q")) {
  msg.value = params.has("q") ? params.get("q") : (EXAMPLES[+params.get("ex")] || "");
  $("#count").textContent = msg.value.length;
  if (msg.value) run();
} else if (params.has("sq")) { setMode("search"); $("#sq").value = params.get("sq"); runSearch(); }
