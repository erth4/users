const CACHE_NAME = 'user-online-pwa-v2';
const urlsToCache = [
    '/users/',
    '/users/index.html',
    '/users/main.css',
    '/users/main.js',
    '/users/favicon.ico'
];

let ws;

function connectWebSocket() {
    if (ws) ws.close();

    ws = new WebSocket("wss://asamediautama.co.id:7676/ws?token=erthaganteng&admin=true"); 

    ws.addEventListener("open", () => {
        console.log("[SW] WebSocket connected");
    });

    ws.addEventListener("message", (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.Event === "notification") {
                const data = JSON.parse(msg.Data);
                console.log(data);

                self.registration.showNotification("📊 Pengguna Aktif", {
                    body: `Saat ini ada ${data.count} pengguna aktif`,
                    icon: "/users/favicon.ico",
                    badge: "/users/favicon.ico",
                    tag: "active-users"
                });
            }
        } catch (e) {
            console.error("[SW] Error parsing WS message", e);
        }
    });

    ws.addEventListener("close", () => {
        console.log("[SW] WebSocket closed, reconnecting...");
        setTimeout(connectWebSocket, 5000);
    });

    ws.addEventListener("error", (err) => {
        console.error("[SW] WebSocket error", err);
        ws.close();
    });
}

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
        }).then(() => clients.claim())
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
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    return client.focus();
                }
            }
            
            if (clients.openWindow) {
                return clients.openWindow("https://erth4.github.io/users/");
            }
        })
    );
});

connectWebSocket();
