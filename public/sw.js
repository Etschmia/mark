// Dynamic cache name with timestamp to force updates
const CACHE_VERSION = 1768253851838; // This will be replaced by build process
const CACHE_NAME = `markdown-editor-pro-v${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Editor.tsx',
  '/components/Preview.tsx',
  '/components/Toolbar.tsx',
  '/components/HelpModal.tsx',
  '/components/CheatSheetModal.tsx',
  '/components/SettingsModal.tsx',
  '/components/preview-themes.ts',
  '/components/icons/Icons.tsx',
  '/utils/exportUtils.ts',
  '/manifest.json',
  // External resources that should be cached
  'https://cdn.tailwindcss.com/3.4.0',
  'https://fonts.googleapis.com/css2?family=Fira+Code&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // For HTML documents, try network first to get fresh content
    event.request.mode === 'navigate' ? 
      networkFirstStrategy(event.request) : 
      cacheFirstStrategy(event.request)
  );
});

// Network-first strategy for HTML documents (ensures fresh content)
async function networkFirstStrategy(request) {
  try {
    console.log('[ServiceWorker] Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache the fresh response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[ServiceWorker] Network failed, falling back to cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.log('[ServiceWorker] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    throw error;
  }
}

// Handle background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any background sync tasks here
      Promise.resolve()
    );
  }
});

// Handle push notifications (optional for future use)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received');
  
  const options = {
    body: 'Markdown Editor Pro notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Markdown Editor Pro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    // Clear all caches and update
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[ServiceWorker] Force clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[ServiceWorker] All caches cleared, updating...');
        self.skipWaiting();
      })
    );
  }
});