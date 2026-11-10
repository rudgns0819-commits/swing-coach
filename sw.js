// 오프라인 캐시: AI 모델/wasm(용량 큼)은 한 번 받으면 캐시에서 사용
const CACHE = 'swing-coach-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      const net = fetch(e.request).then((res) => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => hit);
      // 모델/wasm은 캐시 우선, 나머지는 네트워크 우선
      return /\/(models|wasm)\//.test(url.pathname) && hit ? hit : net;
    }),
  );
});
