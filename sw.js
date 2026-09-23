const CACHE = "electro-variety-pwa-v6-multi-app";
const BASE = "/electro-variety-catalogo/";
const SHELL = [
  BASE,
  BASE + "vendedores/",
  BASE + "vendedores/index.html",
  BASE + "vendedores/manifest.webmanifest",
  BASE + "clientes/",
  BASE + "clientes/index.html",
  BASE + "clientes/manifest.webmanifest",
  BASE + "deposito/",
  BASE + "deposito/index.html",
  BASE + "deposito/manifest.webmanifest",
  BASE + "local/",
  BASE + "local/index.html",
  BASE + "local/manifest.webmanifest",
  BASE + "administrador/",
  BASE + "administrador/index.html",
  BASE + "administrador/manifest.webmanifest",
  BASE + "vendedores/pwa-install.js",
  BASE + "clientes/pwa-install.js",
  BASE + "deposito/pwa-install.js",
  BASE + "local/pwa-install.js",
  BASE + "administrador/pwa-install.js",
  BASE + "config.js",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
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
      .catch(() => caches.match(event.request).then(response => {
        if (response) return response;
        const p = url.pathname;
        if (p.includes(BASE + "clientes/")) return caches.match(BASE + "clientes/index.html");
        if (p.includes(BASE + "deposito/")) return caches.match(BASE + "deposito/index.html");
        if (p.includes(BASE + "local/")) return caches.match(BASE + "local/index.html");
        if (p.includes(BASE + "administrador/")) return caches.match(BASE + "administrador/index.html");
        return caches.match(BASE + "vendedores/index.html");
      }))
  );
});

function normalizeTarget(raw) {
  const target = new URL(raw || (BASE + "clientes/"), self.location.origin);
  const legacy = {
    [BASE + "clientes.html"]: BASE + "clientes/",
    [BASE + "index.html"]: BASE + "vendedores/",
    [BASE + "stock-deposito.html"]: BASE + "deposito/",
    [BASE + "stock-local.html"]: BASE + "local/",
    [BASE + "admin.html"]: BASE + "administrador/"
  };
  if (legacy[target.pathname]) {
    target.pathname = legacy[target.pathname];
  }
  return target.href;
}

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Electro Variety",
      {
        body: data.body || "Hay novedades en el catálogo.",
        icon: data.icon || (BASE + "icons/icon-192.png"),
        badge: data.badge || (BASE + "icons/icon-192.png"),
        data: { url: data.url || (BASE + "clientes/") }
      }
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = normalizeTarget(event.notification.data?.url);
  const targetUrl = new URL(target);
  const targetDir = targetUrl.pathname.endsWith("/")
    ? targetUrl.pathname
    : targetUrl.pathname.substring(0, targetUrl.pathname.lastIndexOf("/") + 1);

  event.waitUntil(
    self.clients.matchAll({type: "window", includeUncontrolled: true}).then(clients => {
      for (const client of clients) {
        if (client.url.startsWith(targetDir)) {
          return client.focus().then(() => client.navigate(target));
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
