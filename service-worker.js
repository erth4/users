const CACHE_NAME = 'user-online-pwa-v2';
const urlsToCache = [
    '/users/',
    '/users/index.html',
    '/users/main.css',
    '/users/main.js',
    '/users/favicon.ico'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});

self.addEventListener("message", event => {
    const data = event.data;
    if (data.type === "SHOW_ACTIVE_USERS") {
        self.registration.showNotification("📊 Pengguna Aktif", {
            body: `Saat ini ada ${data.count} pengguna aktif.`,
            icon: "/users/favicon.ico",
            badge: "/users/favicon.ico",
            tag: "active-users",
            renotify: false
        });
    }
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow("/")
    );
});
