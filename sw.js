// Service worker: permite instalar la app y abrirla aunque falle la red
const CACHE = "portal-docs-v4";
const BASE = ["./", "index.html", "admin.html", "estilos.css", "config.js", "actividad.js", "comun.js", "pwa.js", "avisos.js",
  "logo.svg", "favicon.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Siempre intenta la red primero (para tener la versión nueva); si no hay, usa la copia guardada
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
// Al tocar una notificación, abre o enfoca el panel
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => {
    const c = cs.find(x => x.url.includes("admin.html"));
    return c ? c.focus() : self.clients.openWindow("admin.html");
  }));
});
