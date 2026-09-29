"use strict";

// Arabic is written in the HTML; English lives in data-en attributes. Switching
// swaps them and remembers the original Arabic in data-ar.
const params = new URLSearchParams(location.search);
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
if (params.get("theme")) document.documentElement.dataset.theme = params.get("theme");
let ui = params.get("lang") === "en" ? "en" : params.get("lang") === "ar" ? "ar" : (store.get("thabat.ui") || "ar");
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function swap(el, attr, get, set) {
  const key = "ar" + attr;
  if (el.dataset[key] === undefined) el.dataset[key] = get();
  set(ui === "en" ? el.getAttribute("data-en" + (attr ? "-" + attr : "")) : el.dataset[key]);
}

function applyLang() {
  const html = document.documentElement;
  html.lang = ui; html.dir = ui === "ar" ? "rtl" : "ltr";
  document.title = ui === "ar" ? "ثَبَت — تحقّق قبل أن تنشر" : "Thabat — verify before you forward";
  document.querySelectorAll("[data-en]").forEach((el) => swap(el, "", () => el.textContent, (v) => { el.textContent = v; }));
  document.querySelectorAll("[data-en-ph]").forEach((el) => swap(el, "ph", () => el.placeholder, (v) => { el.placeholder = v; }));
  document.querySelectorAll("[data-en-alt]").forEach((el) => swap(el, "alt", () => el.alt, (v) => { el.alt = v; }));
  document.querySelectorAll("[data-en-aria]").forEach((el) => swap(el, "aria", () => el.getAttribute("aria-label"), (v) => el.setAttribute("aria-label", v)));
  $("#langToggle").textContent = ui === "ar" ? "English" : "العربية";
  document.querySelectorAll('a[href^="/app"]').forEach((a) => {
    const u = new URL(a.getAttribute("href"), location.origin);
    if (ui === "en") u.searchParams.set("lang", "en"); else u.searchParams.delete("lang");
    a.setAttribute("href", u.pathname + u.search);
  });
  if (lastTry) renderTry(lastTry);
}
$("#langToggle").addEventListener("click", () => { ui = ui === "ar" ? "en" : "ar"; store.set("thabat.ui", ui); applyLang(); });

// ---- live mini checker
const TONE = { quran_exact: "quran", quran_variant: "check", authentic: "ok", authentic_by_routes: "ok", authentic_mawquf: "check",
  disputed: "check", needs_review: "check", weak: "bad", fabricated: "bad", baseless: "bad", not_found: "none" };
let lastTry = null;

$("#tryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = $("#tryText").value.trim();
  const out = $("#tryOut");
  if (text.length < 2) { $("#tryText").focus(); return; }
  out.innerHTML = `<p class="try-hint">${ui === "ar" ? "جارٍ التحقق…" : "Checking…"}</p>`;
  try {
    const res = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, reply_lang: ui === "ar" ? "ar" : "en" }) });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
    lastTry = await res.json();
    renderTry(lastTry);
  } catch (err) {
    out.innerHTML = `<p class="err">${ui === "ar" ? "تعذر التحقق الآن، أعد المحاولة." : "The check could not be completed; please try again."} (${esc(err.message)})</p>`;
  }
});

function renderTry(r) {
  const out = $("#tryOut");
  const ar = ui === "ar";
  let html = "";
  if (r.scope) {
    html += `<div class="mini-scope"><b>${esc(ar ? r.scope.level : r.scope.level_latin)} · </b>${esc(ar ? r.scope.message_ar : r.scope.message_en)}</div>`;
  }
  if (r.results?.length) {
    html += `<ul class="mini">` + r.results.map((v) => {
      const ev = (v.evidence || [])[0];
      const cite = v.quran ? (ar ? v.quran.citation_ar : v.quran.citation_en) : ev ? (ar ? ev.citation_ar : ev.citation_en) : v.registry ? (ar ? v.registry.sources[0].ar : v.registry.sources[0].en) : "";
      const url = ev?.source_url;
      return `<li><div class="mq" dir="auto">${esc(v.quote)}</div>
        <div class="ms"><span class="seal ${TONE[v.status] || "none"}"><i>${esc(ar ? v.level : v.level_latin)}</i>${esc(ar ? v.label_ar : v.label_en)}</span>
        ${cite ? (url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(cite)}</a>` : `<span>${esc(cite)}</span>`) : ""}</div></li>`;
    }).join("") + `</ul>`;
  } else if (!r.scope) {
    html += `<p class="try-hint">${ar ? "لم نجد في النص حديثًا أو آية." : "No hadith or verse found in this text."}</p>`;
  }
  const q = encodeURIComponent($("#tryText").value.trim());
  html += `<p style="margin-top:12px"><a href="/app?q=${q}${ar ? "" : "&lang=en"}">${ar ? "افتح النتيجة الكاملة مع الرد المقترح ←" : "Open the full result with a suggested reply →"}</a></p>`;
  out.innerHTML = html;
}

applyLang();
