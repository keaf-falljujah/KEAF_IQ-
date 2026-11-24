// Service Worker - استقبال الإشعارات حتى لو الموقع مسكّر
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  const title = d.title || 'كيف | KEAF Coffee House';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: d.icon || 'icons/icon-192.png',
    badge: 'icons/badge-96.png',
    image: d.image || undefined,
    dir: 'rtl',
    lang: 'ar',
    tag: d.tag || 'keaf',
    renotify: !!d.tag,
    data: { url: d.url || './#/products' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) {
        c.navigate && c.navigate(target);
        return c.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});

// إذا انتهى اشتراك الجهاز، نجدده تلقائياً (يحتاج المفتاح العام من الصفحة)
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(self.clients.matchAll({ includeUncontrolled: true }).then(list =>
    list.forEach(c => c.postMessage({ type: 'resubscribe' }))));
});
