const CACHE = "electro-variety-clientes-push-v2";
const BASE = "/electro-variety-catalogo/clientes/";
const ROOT = "/electro-variety-catalogo/";
const SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "pwa-install.js",
  ROOT + "config.js",
  ROOT + "icons/icon-192.png",
  ROOT + "icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k.startsWith("electro-variety-clientes-"))
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match(BASE + "index.html")))
  );
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Electro Variety",
      {
        body: data.body || "Hay novedades en el catálogo.",
        icon: data.icon || (ROOT + "icons/icon-192.png"),
        badge: data.badge || (ROOT + "icons/icon-192.png"),
        data: { url: data.url || BASE }
      }
    )
  );
});

function normalizeTarget(raw) {
  const target = new URL(raw || BASE, self.location.origin);
  const legacy = {
    [ROOT + "clientes.html"]: BASE,
    [ROOT + "index.html"]: ROOT + "vendedores/",
    [ROOT + "stock-deposito.html"]: ROOT + "deposito/",
    [ROOT + "stock-local.html"]: ROOT + "local/",
    [ROOT + "admin.html"]: ROOT + "administrador/"
  };
  if (legacy[target.pathname]) target.pathname = legacy[target.pathname];
  return target.href;
}

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = normalizeTarget(event.notification.data?.url);
  event.waitUntil(
    self.clients.matchAll({type:"window", includeUncontrolled:true}).then(clients => {
      for (const client of clients) {
        if (client.url.startsWith(BASE)) {
          return client.focus().then(() => client.navigate(target));
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
