const CACHE_NAME = "ludo-gongonia-v0-11-1-pwa-v2";
const SHELL = "./index.html";

// Recursos locales que utiliza el juego. Cada archivo se guarda por separado:
// si uno falta o falla, no se cancela la instalación completa.
const ASSETS = [
  "./icono-ludo.svg",
  "./254B8872-2807-4A38-8683-F09BDD31B2BA.png",
  "./IMG_0912.JPG",
  "./assets/consejo-cuatro-reinos.JPG",
  "./assets/consejo-cuatro-reinos.png",
  "./dado-gongonia-ornamentado.svg",
  "./dado-gongonia.webp",
  "./ficha-reino-rojo.webp",
  "./ficha-reino-verde.webp",
  "./ficha-reino-amarillo.webp",
  "./ficha-reino-azul.webp",
  "./tablero-gongonia.PNG",
  "./mesa-mantel-gongonia-v0112.svg",
  "./mesa-mantel-gongonia.svg",
  "./mesa-mantel-horizontal-v0113.svg",
  "./ornamento-lateral-partida.svg",
  "./sello-cuatro-reinos.svg",
  "./The%20Kelta%20Mountains.mp3",
  "./The%20Routa%20Plains%20of%20A%CC%81nganor%20(Take%202).mp3"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // El documento principal sí es imprescindible para abrir el juego offline.
    const page = await fetch(SHELL, { cache: "reload" });
    if (!page.ok) throw new Error("No se pudo guardar index.html para uso sin conexión.");
    await cache.put(SHELL, page);

    // El resto se descarga individualmente para que un recurso defectuoso
    // no impida instalar el Service Worker.
    await Promise.all(ASSETS.map(async path => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        // Se omite únicamente el recurso que no pudo descargarse.
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("ludo-gongonia-") && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(SHELL, response.clone());
        }
        return response;
      } catch (error) {
        const cachedPage = await caches.match(SHELL);
        if (cachedPage) return cachedPage;
        return new Response("Ludo de Gongonia no está disponible sin conexión todavía.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
