const CACHE_NAME="ludo-gongonia-v0-11-1-pwa";
const CORE=[
 "./","./index.html","./icono-ludo.svg",
 "./254B8872-2807-4A38-8683-F09BDD31B2BA.png",
 "./IMG_0912.JPG","./assets/consejo-cuatro-reinos.JPG",
 "./ficha-reino-rojo.webp","./ficha-reino-verde.webp",
 "./ficha-reino-amarillo.webp","./ficha-reino-azul.webp",
 "./tablero-gongonia.PNG",
 "./The%20Kelta%20Mountains.mp3",
 "./The%20Routa%20Plains%20of%20A%CC%81nganor%20(Take%202).mp3"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("ludo-gongonia-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).then(response=>{
   const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));return response;
  }).catch(()=>caches.match("./index.html")));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
  return response;
 })));
});