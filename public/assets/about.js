"use strict";
/* ثَبَت — /about: language toggle, the interactive logo, and the brand-identity slider. */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const params = new URLSearchParams(location.search);
let ui = params.get("lang") === "en" ? "en" : store.get("thabat.ui", "ar");
const AR = () => ui === "ar";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rerender = [];
function applyLang() {
  document.documentElement.lang = ui; document.documentElement.dir = AR() ? "rtl" : "ltr";
  document.title = AR() ? "ثَبَت — عن المشروع وصانعه" : "Thabat — about the project and its maker";
  document.querySelectorAll("[data-en]").forEach((el) => { if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML; el.innerHTML = AR() ? el.dataset.ar : esc(el.getAttribute("data-en")); });
  $("#lang").textContent = AR() ? "EN" : "ع";
  rerender.forEach((f) => f());
}
$("#lang").onclick = () => { ui = AR() ? "en" : "ar"; store.set("thabat.ui", ui); applyLang(); };

/* ---------- the logo idea: hovering a legend item lights up that part of the mark */
(function logoIdea() {
  const mk = $("#mkBig"), items = document.querySelectorAll("#mkLegend li");
  const on = (p) => { mk.classList.add("focus"); mk.dataset.on = p; items.forEach((li) => li.classList.toggle("on", li.dataset.p === p)); };
  const off = () => { mk.classList.remove("focus"); items.forEach((li) => li.classList.remove("on")); };
  items.forEach((li) => { li.addEventListener("mouseenter", () => on(li.dataset.p)); li.addEventListener("mouseleave", off); li.addEventListener("click", () => on(li.dataset.p)); });
  // when nobody hovers, walk through the four parts slowly
  let k = 0, hovering = false;
  $("#mkLegend").addEventListener("mouseenter", () => { hovering = true; });
  $("#mkLegend").addEventListener("mouseleave", () => { hovering = false; });
  if (!reduce) setInterval(() => { if (hovering) return; const ps = ["lines", "hl", "dia", "tile"]; on(ps[k++ % 4]); }, 2200);
})();

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

applyLang();
