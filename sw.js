// NoteDown service worker - no version number to maintain.
// Just upload a new index.html; every user gets it the next time they open the app.
const CACHE = 'notedown';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(async u => { try { await c.put(u, await fetch(new Request(u, { cache: 'reload' }))); } catch (_) {} }));
    await Promise.all(CDN.map(async u => { try { if (!(await c.match(u))) await c.put(u, await fetch(new Request(u, { mode: 'no-cors' }))); } catch (_) {} }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k); // clean up old versioned caches
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url)) return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  // Opening the app: always ask the server for the latest index.html; use cached copy only if offline.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req.url, { cache: 'no-cache' });
        if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); }
        return r;
      } catch (_) {
        const c = await caches.open(CACHE);
        return (await c.match('./index.html')) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Everything else: serve from cache instantly, refresh it in the background.
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    const net = fetch(sameOrigin ? new Request(req, { cache: 'no-cache' }) : req)
      .then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; })
      .catch(() => hit);
    return hit || net;
  })());
});
