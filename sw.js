// Guarda o index.html para o site abrir sem internet. Nunca toca nas respostas (ficam no localStorage).
const CACHE = 'pesquisa-empresas-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(new Request('./', { cache: 'reload' })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || e.request.mode !== 'navigate') return;
  // Abre na hora pelo cache e atualiza em segundo plano; a versão nova vale no próximo acesso.
  const atualizar = fetch('./', { cache: 'no-cache' }).then(async (r) => {
    if (r.ok) await (await caches.open(CACHE)).put('./', r.clone());
    return r;
  });
  e.respondWith(caches.match('./').then((c) => c || atualizar));
  e.waitUntil(atualizar.catch(() => {}));
});
