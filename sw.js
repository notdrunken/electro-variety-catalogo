const CACHE = "electro-variety-pwa-v5-apps-v2";

const SHELL = [
  "./",
  "./index.html",
  "./clientes.html",
  "./stock-deposito.html",
  "./stock-local.html",
  "./admin.html",
  "./manifest-vendedores.webmanifest",
  "./manifest-clientes.webmanifest",
  "./manifest-deposito.webmanifest",
  "./manifest-local.webmanifest",
  "./manifest-admin.webmanifest",
  "./pwa-install.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
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
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
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
      .catch(() =>
        caches.match(event.request).then(response =>
          response || caches.match("./index.html")
        )
      )
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
        icon: data.icon || "./icons/icon-192.png",
        badge: data.badge || "./icons/icon-192.png",
        data: { url: data.url || "./clientes.html" }
      }
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const raw = event.notification.data?.url || "./clientes.html";
  const target = new URL(raw, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clients => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope)) {
          return client.focus().then(() => client.navigate(target));
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
