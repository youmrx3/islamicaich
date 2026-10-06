/* Thabat service worker: offline app shell. API calls always go to the network
   (verdicts must come from the live sources, never from a stale cache). */
const VERSION = "thabat-v2.3";
const SHELL = ["/app", "/assets/app.css", "/assets/app.js", "/assets/icon.svg",
  "/assets/brand/mark.svg", "/assets/brand/mark-dark.svg", "/assets/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  if (e.request.mode === "navigate" && url.pathname === "/app") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/app")));
    return;
  }
  if (url.pathname.startsWith("/assets/") && /\.(css|js)$/.test(url.pathname)) {
    // code and styles: always the latest deploy; the cached copy is only for offline use
    e.respondWith(fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(url.pathname, copy)); }
      return res;
    }).catch(() => caches.match(url.pathname)));
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res.ok) caches.open(VERSION).then((c) => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
