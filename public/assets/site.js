"use strict";
/* ثَبَت — website interactions. Every verdict, citation and grading shown on this
   page is fetched live from the API (never typed into the page), so the website can
   never claim something the engine does not actually return. */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const params = new URLSearchParams(location.search);
let ui = params.get("lang") === "en" ? "en" : store.get("thabat.ui", "ar");
const AR = () => ui === "ar";
const clip = (t, n) => { t = String(t || ""); if (t.length <= n) return t; t = t.slice(0, n); const cut = Math.max(t.lastIndexOf(". "), t.lastIndexOf("، "), t.lastIndexOf(" ")); return t.slice(0, cut > n * 0.6 ? cut : n).replace(/[\s.،,:؛]+$/, "") + "…"; };
const dg = (s) => String(s);  // Western digits everywhere, easier to read in citations
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- language */
function applyLang() {
  document.documentElement.lang = ui; document.documentElement.dir = AR() ? "rtl" : "ltr";
  document.title = AR() ? "ثَبَت — تحقّق قبل أن تنشر" : "Thabat — verify before you forward";
  document.querySelectorAll("[data-en]").forEach((el) => { if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML; el.innerHTML = AR() ? el.dataset.ar : esc(el.getAttribute("data-en")); });
  document.querySelectorAll("[data-en-ph]").forEach((el) => { if (el.dataset.arph === undefined) el.dataset.arph = el.placeholder; el.placeholder = AR() ? el.dataset.arph : el.getAttribute("data-en-ph"); });
  $("#lang").textContent = AR() ? "EN" : "ع";
  rerender.forEach((f) => f());
}
const rerender = [];
$("#lang").onclick = () => { ui = AR() ? "en" : "ar"; store.set("thabat.ui", ui); applyLang(); };

/* ---------- grading style (same scale as the app) */
const STY = {
  sahih: ["var(--g-sahih-bg)", "var(--g-sahih-ink)", "var(--g-sahih)", "#22B07D"], hasan: ["var(--g-hasan-bg)", "var(--g-hasan-ink)", "var(--g-hasan)", "#3D8DE0"],
  daif: ["var(--g-daif-bg)", "var(--g-daif-ink)", "var(--g-daif)", "#F0B020"], vdaif: ["var(--g-vdaif-bg)", "var(--g-vdaif-ink)", "var(--g-vdaif)", "#F07A2A"],
  mawdu: ["var(--g-mawdu-bg)", "var(--g-mawdu-ink)", "var(--g-mawdu)", "#EB4858"], none: ["var(--g-none-bg)", "var(--g-none-ink)", "var(--g-none)", "#9A96AA"],
  khilaf: ["var(--g-khilaf-bg)", "var(--g-khilaf-ink)", "var(--g-khilaf)", "#8E7BEA"],
};
function grade(v) {
  const L = (a, e) => (AR() ? a : e), labels = (v.evidence?.[0]?.grade?.grades || []).map((x) => x.label.toLowerCase());
  switch (v.status) {
    case "quran_exact": return ["sahih", L("آية مطابقة", "Exact verse")];
    case "quran_variant": return ["daif", L("آية مُحرّفة", "Misquoted verse")];
    case "authentic": return ["sahih", L("صحيح", "Sahih")];
    case "authentic_by_routes": return ["hasan", L("ثابت بمجموع طرقه", "Authentic via routes")];
    case "authentic_mawquf": return ["khilaf", L("ليس من كلامه ﷺ", "Not the Prophet's words")];
    case "disputed": return ["khilaf", L("مختلف فيه", "Disputed")];
    case "needs_review": return ["vdaif", L("لفظ مشابه", "Similar wording")];
    case "weak": return labels.some((x) => x.includes("very")) ? ["vdaif", L("ضعيف جدًا", "Very weak")] : ["daif", L("ضعيف", "Weak")];
    case "fabricated": return ["mawdu", L("موضوع", "Fabricated")];
    case "baseless": return ["mawdu", L("لا أصل له", "No basis")];
    default: return ["none", L("لم نجد", "Not found"), true];
  }
}
const chip = (v) => { const [k, l, dashed] = grade(v), s = STY[k]; return `<span class="chip${dashed ? " dashed" : ""}" style="--c-bg:${s[0]};--c-ink:${s[1]};--c-dot:${s[2]}">${esc(l)}</span>`; };
const BOOK = { bukhari: ["البخاري", "Bukhari"], muslim: ["مسلم", "Muslim"], abudawud: ["أبو داود", "Abu Dawud"], tirmidhi: ["الترمذي", "Tirmidhi"], nasai: ["النسائي", "Nasa'i"], ibnmajah: ["ابن ماجه", "Ibn Majah"], malik: ["الموطأ", "Muwatta"], nawawi: ["النووية", "Nawawi"], qudsi: ["القدسية", "Qudsi"] };
function by(v) {
  if (v.quran) return esc(AR() ? dg(v.quran.citation_ar) : v.quran.citation_en);
  if (v.registry) return esc((v.registry.sources || []).map((s) => (AR() ? s.ar : s.en).split("،")[0]).slice(0, 2).join(" · "));
  const ev = v.evidence || [];
  if (ev.length && v.status !== "needs_review") return esc(ev.slice(0, 2).map((e) => `${BOOK[e.book]?.[AR() ? 0 : 1] || e.book} ${dg(e.number)}`).join(" · "));
  if (v.status === "needs_review") return esc(AR() ? "لفظ مشابه بنص آخر — يحتاج تحقق" : "Similar text with other wording — needs checking");
  return esc(AR() ? "لا مصدر في القرآن والكتب التسعة" : "No source in the Quran or the 9 books");
}
const kind = (v) => v.kind === "quran" ? (AR() ? "آية" : "Verse") : v.kind === "none" ? (AR() ? "نص منسوب" : "Attributed") : (AR() ? "حديث" : "Hadith");

async function verify(text) {
  const r = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, reply_lang: AR() ? "ar" : "en", use_llm: false }) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
const STORY_MSG = "قال رسول الله ﷺ: «إنما الأعمال بالنيات» وقال تعالى: «وقل ربي زدني علما». وقال ﷺ: «اطلبوا العلم ولو بالصين». ومن نشرها «فُتح له باب من الجنة»";
const storyP = verify(STORY_MSG).catch(() => null);

/* ---------- hero */
$("#ask").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#q").value.trim(); location.href = q ? "/verify?q=" + encodeURIComponent(q) : "/verify"; });
/* Hero depth: the pose is a pure function of (mouse, scroll) — eased toward its target every
   frame — so leaving the hero and coming back always lands on the same, clean layout. */
const stage = $("#stage");
function fitStage() {  // below 1000px: scale the fixed-size device scene to the available width
  const box = $("#stageBox"); if (!box) return;
  box.style.setProperty("--k", innerWidth <= 1000 ? Math.min(1, box.clientWidth / 600).toFixed(4) : 1);
}
fitStage(); addEventListener("resize", fitStage);
const pose = { mx: 0, my: 0, tx: 0, ty: 0, sp: 0, run: false };
function heroScroll() {
  const b = $(".hero").getBoundingClientRect();
  pose.sp = clamp(-b.top / Math.max(1, b.height));
  if (pose.sp >= 1) { pose.tx = pose.ty = 0; }
  heroTick();
}
function heroTick() {
  if (pose.run) return; pose.run = true;
  requestAnimationFrame(function step() {
    pose.mx += (pose.tx - pose.mx) * .09; pose.my += (pose.ty - pose.my) * .09;
    stage.style.setProperty("--mx", pose.mx.toFixed(4)); stage.style.setProperty("--my", pose.my.toFixed(4)); stage.style.setProperty("--sp", pose.sp.toFixed(4));
    if (Math.abs(pose.tx - pose.mx) > .001 || Math.abs(pose.ty - pose.my) > .001) requestAnimationFrame(step); else pose.run = false;
  });
}
if (!reduce && matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    if (pose.sp >= 1) return;  // hero off screen: stay still
    pose.tx = e.clientX / innerWidth - .5; pose.ty = e.clientY / innerHeight - .5; heroTick();
  }, { passive: true });
  document.addEventListener("mouseleave", () => { pose.tx = pose.ty = 0; heroTick(); });
  window.addEventListener("blur", () => { pose.tx = pose.ty = 0; heroTick(); });
}
function heroFill(r) {
  if (!r) return;
  const vs = r.results, ok = vs.filter((v) => ["quran_exact", "authentic", "authentic_by_routes"].includes(v.status)).length;
  // laptop: the desktop tool — the message with its quotes marked, and the results list
  let msg = esc(STORY_MSG);
  vs.forEach((v) => { const q = esc(v.quote); if (q && msg.includes(q)) msg = msg.replace(q, `<mark>${q}</mark>`); });
  $("#heroMsg").innerHTML = msg;
  $("#heroTitle").innerHTML = AR() ? `${vs.length} نصوص، <span class="hl-s">${ok === 1 ? "واحد فقط ثابت" : ok + " ثابتة"}</span>` : `${vs.length} quotes, <span class="hl-s">${ok} established</span>`;
  $("#heroBar").innerHTML = vs.map((v) => `<i style="background:${STY[grade(v)[0]][3]}"></i>`).join("");
  $("#heroCards").innerHTML = vs.map((v) => `<div class="mini-card">${chip(v)}<div class="q">«${esc(v.quote)}»</div><div class="by">${by(v)}</div></div>`).join("");
  // phone: the app's verse screen — the misquoted verse, word by word against the Mushaf
  const qv = vs.find((v) => v.kind === "quran" && v.quran);
  if (!qv) { $("#heroPhone").innerHTML = ""; return; }
  const tiles = [];
  (qv.quran.diff || []).forEach((o) => {
    if (o.op === "equal" || o.op === "minor") (o.text || o.correct).split(/\s+/).filter(Boolean).forEach((w) => tiles.push([w, ""]));
    else if (o.op === "wrong") { const a = o.correct.split(/\s+/), b = o.quoted.split(/\s+/); a.forEach((w, k) => tiles.push([w, b[k] || "", "bad"])); }
    else if (o.op === "missing") o.correct.split(/\s+/).forEach((w) => tiles.push([w, "—", "bad"]));
    else if (o.op === "extra") o.quoted.split(/\s+/).forEach((w) => tiles.push([w, AR() ? "زيادة" : "added", "bad"]));
  });
  const n = qv.quran.changed_words;
  $("#heroPhone").innerHTML = `${chip(qv)}<div class="ph-t">${AR() ? `الآية صحيحة، لكنها نُقلت باختلاف ${n === 1 ? "كلمة" : n + " كلمات"}.` : `The verse is real, but ${n} word(s) differ.`}</div>
    <div class="ph-w"><div class="ph-h"><span>${AR() ? "في المصحف" : "In the Mushaf"}</span><span>${by(qv).split(" — ")[0]}</span></div>
    <div class="ph-tiles" dir="rtl">${tiles.map(([k, m, c]) => `<span class="wt ${c || ""}"><b>${esc(k)}</b>${m ? `<small>${esc(m)}</small>` : ""}</span>`).join("")}</div></div>
    <div class="ph-btn">▶ ${AR() ? "استمع للآية" : "Listen"}</div>
    <div class="ph-lv"><b>${esc(AR() ? qv.level : qv.level_latin)}</b><span>${esc(AR() ? qv.level_ar : qv.level_en)}</span></div>`;
}
storyP.then((r) => { heroFill(r); storyCards(r); rerender.push(() => { heroFill(r); storyCards(r); }); });

/* ---------- scroll helpers */
const clamp = (v) => Math.max(0, Math.min(1, v));
const sticky = (el) => { const b = el.getBoundingClientRect(); return clamp(-b.top / Math.max(1, b.height - innerHeight)); };
const pass = (el) => { const b = el.getBoundingClientRect(); return clamp((innerHeight - b.top) / (innerHeight + b.height)); };
const wide = () => innerWidth > 1000;

/* ---------- story */
let storyData = null;
const POS = [[150, -110], [-150, -110], [150, 110], [-150, 110]];
function storyCards(r) {
  storyData = r;
  if (!r) return;
  $("#storyCards").innerHTML = r.results.slice(0, 4).map((v) => `<div class="scard"><span class="kind">${esc(kind(v))}</span>${chip(v)}<div class="q">«${esc(v.quote)}»</div><div class="by">${by(v)}</div></div>`).join("");
  onScroll();
}
function story() {
  const sec = $("#how"); if (!sec) return;
  const p = wide() ? sticky(sec) : 1;
  const step = p < .3 ? 0 : p < .62 ? 1 : 2;
  document.querySelectorAll(".cap").forEach((c, i) => c.classList.toggle("on", !wide() || i === step));
  document.querySelectorAll("#capdots i").forEach((d, i) => d.classList.toggle("on", i === step));
  const hl = clamp(p / .25);
  $("#storyMsg").style.setProperty("--hlw", `${hl * 100}%`);
  const k = clamp((p - .3) / .3);
  $("#scene").style.setProperty("--k", wide() ? k : 1);
  document.querySelectorAll(".scard").forEach((c, i) => {
    const rise = wide() ? clamp((p - .32 - i * .05) / .25) : 1;
    if (innerWidth < 620) { c.style.opacity = ""; c.style.transform = ""; return; }
    const sc = 1;
    const [x, y] = POS[i] || [0, 0];
    c.style.opacity = rise;
    c.style.transform = `translate(-50%,-50%) translate(${x * rise * sc}px, ${(y * rise + 40 * (1 - rise)) * sc}px) scale(${(.7 + .3 * rise) * sc})`;
  });
}

/* ---------- live tool */
let toolResult = null;
async function runTool() {
  const text = $("#tq").value.trim(); if (text.length < 2) return;
  const box = $("#tres"); box.innerHTML = `<div class="res-item">…</div>`;
  try {
    toolResult = await verify(text); drawTool();
  } catch { box.innerHTML = `<div class="res-item">${AR() ? "تعذر التحقق الآن، أعد المحاولة." : "The check failed; please retry."}</div>`; }
}
function drawTool() {
  const r = toolResult; if (!r) return;
  const box = $("#tres");
  const scope = r.scope ? `<div class="res-item"><b>${esc(AR() ? r.scope.level : r.scope.level_latin)} · </b>${esc(AR() ? r.scope.message_ar : r.scope.message_en)}</div>` : "";
  box.innerHTML = `<b>${AR() ? `وجدنا ${dg(r.results.length)} نصوص` : `We found ${r.results.length} quote(s)`}</b>` + scope +
    r.results.map((v) => `<div class="res-item"><span class="lv" title="${esc(AR() ? v.level_ar : v.level_en)}">${esc(AR() ? v.level : v.level_latin)}</span>${chip(v)}<div class="q">«${esc(v.quote)}»</div><div class="by">${by(v)}</div></div>`).join("") +
    `<p style="font-size:12px;color:var(--muted);margin:0">${esc(AR() ? r.transparency_ar : r.transparency_en)}</p>`;
  $("#tact").hidden = false;
  $("#twa").href = "https://wa.me/?text=" + encodeURIComponent(r.reply || "");
}
$("#tgo").onclick = runTool;
$("#tlink").onclick = async () => { const u = location.origin + "/verify?q=" + encodeURIComponent($("#tq").value.trim()); try { await navigator.clipboard.writeText(u); $("#tlink").textContent = AR() ? "نُسخ ✓" : "Copied ✓"; } catch { prompt("", u); } };
$("#toolUrl").textContent = location.host + "/verify";
rerender.push(drawTool);

/* ---------- quran tiles (from the live engine) */
let tiles = [];
verify("قال تعالى: وقل ربي زدني علما").then((r) => {
  const v = r.results.find((x) => x.quran); if (!v) return;
  const ops = v.quran.diff;
  ops.forEach((o) => {
    if (o.op === "equal" || o.op === "minor") (o.text || o.correct).split(/\s+/).forEach((w) => tiles.push({ m: w.replace(/[ً-ْٰۖ-ۭ]/g, ""), k: w, bad: false }));
    if (o.op === "wrong") tiles.push({ m: o.quoted, k: o.correct, bad: true });
  });
  drawTiles(v);
  rerender.push(() => drawTiles(v));
}).catch(() => {});
function drawTiles(v) {
  $("#tiles").innerHTML = tiles.map((t) => `<div class="tile${t.bad ? " bad" : ""}"><div class="front"><span class="lbl">${AR() ? "في الرسالة" : "In the message"}</span><span class="w">${esc(t.m)}</span></div><div class="back"><span class="lbl">${t.bad ? (AR() ? "مختلفة" : "different") : (AR() ? "مطابقة" : "matches")}</span><span class="w">${esc(t.k)}</span></div></div>`).join("");
  const bad = tiles.find((t) => t.bad);
  $("#qcap").textContent = bad ? (AR() ? `كلمة واحدة مختلفة: «${bad.m}» والصواب ﴿${bad.k}﴾ — ${dg(v.quran.citation_ar)}` : `One word differs: "${bad.m}" — the Mushaf has ﴿${bad.k}﴾ — ${v.quran.citation_en}`) : "";
  onScroll();
}
function quran() {
  const sec = $("#quran"); if (!sec) return;
  const q = wide() ? sticky(sec) : pass(sec) * 1.6;
  document.querySelectorAll(".tile").forEach((t, i) => t.classList.toggle("flip", q > .12 + i * .14));
  $("#qcap").classList.toggle("on", q > .12 + tiles.length * .14);
}

/* ---------- grades ring */
const RING = () => AR() ? [
  ["sahih", "صحيح", "ثابت بإسناد متصل، ونذكر من صحّحه.", "«إنما الأعمال بالنيات» — البخاري 1 ومسلم 1907"],
  ["hasan", "حسن", "مقبول دون الصحيح.", "نذكر من حسّنه باسمه دائمًا"],
  ["daif", "ضعيف", "في إسناده علّة.", "نذكر من ضعّفه وحكمه بنصه"],
  ["vdaif", "ضعيف جدًا", "علّة شديدة.", "يُنقل حكم المحقق كما هو"],
  ["mawdu", "موضوع", "مكذوب أو باطل.", "«اطلبوا العلم ولو بالصين» — حكم عليه الألباني بأنه باطل"],
  ["none", "لم نجد", "نقولها بصراحة.", "لا نخمّن ولا نلفّق مصدرًا"],
] : [
  ["sahih", "Sahih", "Established with a connected chain; we name who graded it.", "“Actions are by intentions” — Bukhari 1, Muslim 1907"],
  ["hasan", "Hasan", "Acceptable, below sahih.", "We always name who graded it hasan"],
  ["daif", "Weak", "A defect in the chain.", "We name who graded it weak, word for word"],
  ["vdaif", "Very weak", "A severe defect.", "The grader's verdict, as published"],
  ["mawdu", "Fabricated", "Forged or baseless.", "“Seek knowledge even in China” — al-Albani: baseless"],
  ["none", "Not found", "We say so plainly.", "We never guess or invent a source"],
];
function drawRing() {
  $("#carousel").innerHTML = RING().map(([k, n, d, ex], i) => `<div class="gcard" data-i="${i}"><span class="chip${k === "none" ? " dashed" : ""}" style="--c-bg:${STY[k][0]};--c-ink:${STY[k][1]};--c-dot:${STY[k][2]}">${esc(n)}</span><span class="nm">${esc(n)}</span><p>${esc(d)}</p><div class="ex">${esc(ex)}</div></div>`).join("");
  ring();
}
function ring() {
  const sec = $("#grades"); if (!sec) return;
  const p = wide() ? sticky(sec) : pass(sec);
  const R = innerWidth < 620 ? 230 : 300, active = Math.round(p * 5);
  $("#carousel").style.transform = `translateZ(${-R}px) rotateY(${(AR() ? 1 : -1) * p * 300}deg)`;
  document.querySelectorAll(".gcard").forEach((c, i) => { c.style.transform = `rotateY(${(AR() ? -1 : 1) * i * 60}deg) translateZ(${R}px) scale(${i === active ? 1.06 : .92})`; });
}
rerender.push(drawRing);

/* ---------- bubble mock + widgets + bot (live) */
let bubbleDone = false;
function bubble() {
  const m = $("#bubbleMock"); if (!m || bubbleDone) return;
  if (pass(m) > .45) {
    bubbleDone = true;
    $("#bfb").style.top = "250px";
    verify("قال ﷺ: «من قال سبحان الله وبحمده في يوم مئة مرة حطت خطاياه»").then((r) => {
      const v = r.results[0]; if (!v) return;
      $("#bres").innerHTML = `${chip(v)}<div class="sacred" style="font-size:16px;margin:6px 0 2px">«${esc(v.quote)}»</div><div style="font-size:12px;color:var(--muted)">${by(v)}</div>`;
      setTimeout(() => $("#bpnl").classList.add("on"), 500);
    }).catch(() => {});
  }
}
fetch("/api/daily").then((r) => r.json()).then((d) => {
  const draw = () => { $("#dtext").textContent = "«" + d.text + "»"; $("#dcite").textContent = AR() ? dg(d.citation_ar) : d.citation_en; $("#dchip").innerHTML = chip({ status: "authentic", evidence: [d] }); };
  draw(); rerender.push(draw);
}).catch(() => {});
verify("«اطلبوا العلم ولو بالصين»").then((r) => {
  const draw = () => { const v = r.results[0]; $("#botReply").innerHTML = v ? `${chip(v)} ${esc(clip(AR() ? v.explanation_ar : v.explanation_en, 160))}` : ""; };
  draw(); rerender.push(draw);
}).catch(() => {});

/* ---------- CTA layered mark */
(function stack() {
  const s = $("#stack");
  s.innerHTML = Array.from({ length: 9 }, (_, i) => `<span style="transform:translateZ(${-(9 - i) * 3}px)"></span>`).join("") + `<img src="/assets/brand/mark.svg" alt="">`;
})();
function cta() {
  const c = $("#cta"); if (!c) return; const p = pass(c);
  $("#stack").style.setProperty("--sy", `${(p - .5) * 120}deg`); $("#stack").style.setProperty("--sx", `${(.5 - p) * 36}deg`);
}

/* ---------- loop */
let raf = 0;
function onScroll() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (!reduce) heroScroll(); story(); quran(); ring(); bubble(); cta(); }); }
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
drawRing();
applyLang();
onScroll();

/* ---------- join: share the tool itself (never a verdict text) */
$("#shareSite")?.addEventListener("click", async () => {
  const url = location.origin + "/", text = AR() ? "قبل أن تنشر أي رسالة فيها آية أو حديث، تحقّق منها في «ثَبَت»:" : "Before you forward a message with a verse or hadith, check it on Thabat:";
  if (navigator.share) { try { await navigator.share({ title: "Thabat", text, url }); return; } catch { return; } }
  window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
});

/* ---------- on a phone, "the app" means the real app, not the phone simulator */
if (matchMedia("(max-width: 760px)").matches) document.querySelectorAll('a[href="/mobile"]').forEach((a) => { a.href = "/app"; });

/* ---------- repeated & similar verses (live from the engine) */
const placesTxt = (n) => AR() ? (n === 2 ? "موضعين" : n <= 10 ? n + " مواضع" : n + " موضعًا") : `${n} places`;
const diffTxt = (n) => AR() ? (n === 1 ? "تختلف في كلمة" : n === 2 ? "تختلف في كلمتين" : `تختلف في ${n} كلمات`) : `${n} word(s) differ`;
const qcite = (x) => esc(AR() ? x.citation_ar : x.citation_en);
Promise.all([verify("قال تعالى: «فبأي آلاء ربكما تكذبان»"), verify("قال تعالى: «وما الحياة الدنيا إلا لهو ولعب»")]).then(([rep, mix]) => {
  const draw = () => {
    const a = rep.results[0], b = mix.results[0];
    if (a?.quran) {
      const q = a.quran, occ = q.occurrences || [];
      $("#mutRep .mut-q").textContent = "«" + a.quote + "»";
      $("#mutRep .mut-body").innerHTML = `<div class="mut-line">${chip(a)}<b>${AR() ? "ورد بلفظه في " + placesTxt(occ.length) : "Occurs word for word in " + placesTxt(occ.length)}</b></div>
        <div class="mut-line">${occ.slice(0, 8).map((o) => `<span class="mut-chip">${qcite(o)}</span>`).join("")}${occ.length > 8 ? `<span class="mut-more">+${occ.length - 8}</span>` : ""}</div>`;
    }
    if (b?.quran) {
      const q = b.quran, tw = (q.similar || [])[0];
      $("#mutMix .mut-q").textContent = "«" + b.quote + "»";
      $("#mutMix .mut-body").innerHTML = `<div class="mut-line">${chip(b)}<b>${AR() ? "الأقرب لفظًا: " : "Closest wording: "}${qcite(q)}</b><span class="mut-chip">${esc(diffTxt(q.changed_words))}</span></div>
        ${tw ? `<div class="mut-twin"><span class="sacred" dir="rtl">﴿${esc(tw.text_uthmani)}﴾</span><span class="meta"><span>${AR() ? "آية متشابهة: " : "Similar verse: "}${qcite(tw)}</span><i>${esc(diffTxt(tw.changed_words))}</i></span></div>` : ""}`;
    }
  };
  draw(); rerender.push(draw);
}).catch(() => {});

/* ---------- maker: the brand identity, as an animated slider */
const BB = [
  [1, "s", "الغلاف — لأن الدقة أمانة", "Cover — because precision is a trust"], [2, "s", "الرسالة", "The mission"], [3, "s", "المشكلة", "The problem"],
  [4, "s", "التموضع والوعد", "Positioning and promise"], [5, "s", "نبرة الصوت", "Tone of voice"],
  [9, "m", "الرسمة الأولى", "The first sketch"], [10, "m", "بناء الشعار على الشبكة", "The mark on its grid"], [6, "m", "ولادة الشعار 1", "The mark is born · 1"],
  [7, "m", "ولادة الشعار 2", "The mark is born · 2"], [8, "m", "ولادة الشعار 3", "The mark is born · 3"], [12, "m", "نُسخ الشعار", "Logo lockups"], [14, "m", "الخلفيات والاستخدام الخاطئ", "Backgrounds and misuse"],
  [16, "c", "لوحة الألوان", "Colour palette"], [18, "c", "الخطوط", "Typography"], [20, "c", "عناصر الواجهة", "Interface elements"],
  [11, "a", "التطبيق في يد المستخدم", "The app in hand"], [13, "a", "الشعار مجسّمًا", "The mark in stone"], [15, "a", "العلامة ثلاثية الأبعاد", "The 3D mark"],
  [17, "a", "جناح المعرض", "Exhibition stand"], [19, "a", "الهوية على الملابس", "Apparel"], [21, "a", "إعلان التطبيق", "App advert"],
  [22, "a", "جناح ثَبَت", "The Thabat booth"], [23, "a", "الشركاء", "Partners"],
];
const BB_TABS = [["all", "الكل", "All"], ["s", "الاستراتيجية", "Strategy"], ["m", "الشعار", "The mark"], ["c", "الألوان والخطوط", "Colour & type"], ["a", "التطبيقات", "Applications"]];
(function brandbook() {
  const stage = $("#bbStage"); if (!stage) return;
  const nn = (n) => String(n).padStart(2, "0");
  let tab = "all", list = BB, i = 0, timer = 0, t0 = 0, paused = false;
  const DUR = 5200;
  function drawTabs() {
    $("#bbTabs").innerHTML = BB_TABS.map(([k, a, e]) => `<button role="tab" class="${k === tab ? "on" : ""}" data-k="${k}">${AR() ? a : e}<small>${k === "all" ? BB.length : BB.filter((b) => b[1] === k).length}</small></button>`).join("");
    document.querySelectorAll("#bbTabs button").forEach((b) => b.onclick = () => { tab = b.dataset.k; list = tab === "all" ? BB : BB.filter((x) => x[1] === tab); i = 0; build(); });
  }
  function build() {
    drawTabs();
    $("#bbSlides").innerHTML = list.map(([n], k) => `<div class="bb-slide${k === 0 ? " on" : ""}" data-k="${k}"><img src="/assets/brandbook/${nn(n)}.jpg" alt="" ${k < 2 ? "" : 'loading="lazy"'}></div>`).join("");
    $("#bbThumbs").innerHTML = list.map(([n], k) => `<button class="${k === 0 ? "on" : ""}" data-k="${k}" aria-label="${k + 1}"><img src="/assets/brandbook/t/${nn(n)}.jpg" alt="" loading="lazy"></button>`).join("");
    document.querySelectorAll("#bbThumbs button").forEach((b) => b.onclick = () => go(+b.dataset.k));
    document.querySelectorAll(".bb-slide").forEach((s) => s.onclick = () => openBig(list[+s.dataset.k][0]));
    meta(); restart();
  }
  function meta() {
    const [, , a, e] = list[i];
    $("#bbCap").textContent = AR() ? a : e;
    $("#bbCount").textContent = `${nn(i + 1)} / ${nn(list.length)}`;
  }
  function go(k, dir) {
    if (!list.length) return;
    k = (k + list.length) % list.length; if (k === i && dir === undefined) return;
    const fwd = dir ?? (k > i ? 1 : -1), s = document.querySelectorAll(".bb-slide"), rtl = AR() ? -1 : 1;
    const cur = s[i], nxt = s[k];
    cur.style.setProperty("--to", `${-6 * fwd * rtl}%`); cur.classList.remove("on"); cur.classList.add("out");
    nxt.classList.remove("out"); nxt.style.setProperty("--from", `${6 * fwd * rtl}%`);
    void nxt.offsetWidth; nxt.classList.add("on");
    setTimeout(() => cur.classList.remove("out"), 900);
    i = k; meta();
    document.querySelectorAll("#bbThumbs button").forEach((b, j) => b.classList.toggle("on", j === i));
    document.querySelector("#bbThumbs button.on")?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    restart();
  }
  function restart() { t0 = performance.now(); }
  function loop(now) {
    if (!paused && !reduce) {
      const p = Math.min(1, (now - t0) / DUR);
      $("#bbProg").style.width = (p * 100).toFixed(1) + "%";
      if (p >= 1) go(i + 1, 1);
    }
    timer = requestAnimationFrame(loop);
  }
  function openBig(n) { $("#bbBig").src = `/assets/brandbook/${nn(n)}.jpg`; $("#bbLight").hidden = false; paused = true; }
  const closeBig = () => { $("#bbLight").hidden = true; paused = false; restart(); };
  $("#bbLight").onclick = closeBig;
  $("#bbPrev").onclick = () => go(i - 1, -1);
  $("#bbNext").onclick = () => go(i + 1, 1);
  stage.addEventListener("mouseenter", () => { paused = true; });
  stage.addEventListener("mouseleave", () => { paused = false; restart(); });
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(AR() ? i + 1 : i - 1, AR() ? 1 : -1);
    if (e.key === "ArrowRight") go(AR() ? i - 1 : i + 1, AR() ? -1 : 1);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#bbLight").hidden) closeBig(); });
  let sx = null;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; paused = true; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; paused = false;
    if (Math.abs(dx) > 40) { const fwd = (dx < 0) !== AR(); go(fwd ? i + 1 : i - 1, fwd ? 1 : -1); } else restart();
  });
  // only animate while the slider is on screen
  new IntersectionObserver(([en]) => { paused = !en.isIntersecting; if (en.isIntersecting) restart(); }, { threshold: .25 }).observe(stage);
  rerender.push(() => { drawTabs(); meta(); });
  build(); requestAnimationFrame(loop);
})();
