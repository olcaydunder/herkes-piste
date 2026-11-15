/* Herkes Piste — ana ekrana eklenebilmesi için en küçük hizmet çalışanı. Hiçbir şeyi önbelleğe almaz,
   böylece güncellemeler hemen gelir. İnternet yoksa sade bir uyarı gösterir. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="background:#1B1040;color:#fff;font:600 22px system-ui;display:grid;place-items:center;height:100vh;margin:0;text-align:center">İnternet bağlantısı yok.<br>Bağlantı gelince sayfayı yenile.</body>',
    { headers: { 'content-type': 'text/html; charset=utf-8' } })));
});
