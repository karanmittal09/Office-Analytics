const CACHE_NAME = 'offline-analytics-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/journey/page1',
  '/journey/page2',
  '/journey/page3',
  '/journey/page4',
  '/journey/page5',
  '/admin',
  '/manifest.json',
];

const API_CACHE_NAME = 'api-cache-v1';
const ANALYTICS_API_PATTERN = /\/api\/analytics/;

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle analytics API requests
  if (ANALYTICS_API_PATTERN.test(url.pathname)) {
    event.respondWith(handleAnalyticsRequest(request));
    return;
  }

  // Handle static resources
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Return offline page if available
              if (request.destination === 'document') {
                return caches.match('/');
              }
            });
        })
    );
  }
});

// Handle analytics API requests
async function handleAnalyticsRequest(request) {
  try {
    // Try to make the request
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses for analytics data
      if (request.method === 'GET') {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } else {
      throw new Error(`Request failed: ${response.status}`);
    }
  } catch (error) {
    console.log('Analytics API request failed, handling offline:', error);
    
    // For POST requests (event submissions), store in IndexedDB for later sync
    if (request.method === 'POST') {
      try {
        const requestData = await request.json();
        await storeOfflineAnalyticsData(requestData);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Data stored offline, will sync when online',
            offline: true 
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (parseError) {
        console.error('Failed to parse request data:', parseError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to store offline data' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // For GET requests, try to return cached data
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: 'Service unavailable offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Store analytics data in IndexedDB for offline sync
async function storeOfflineAnalyticsData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineAnalyticsDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach(event => {
          store.put(event);
        });
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Background sync for analytics data
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

// Sync analytics data when back online
async function syncAnalyticsData() {
  try {
    const db = await openIndexedDB();
    const events = await getUnsyncedEvents(db);
    
    if (events.length === 0) {
      console.log('No events to sync');
      return;
    }

    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    if (response.ok) {
      const result = await response.json();
      await markEventsSynced(db, events.map(e => e.id));
      console.log(`Synced ${events.length} events`);
    } else {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineAnalyticsDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getUnsyncedEvents(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    const index = store.index('by-synced');
    const request = index.getAll(false);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markEventsSynced(db, eventIds) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    
    eventIds.forEach(id => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const event = getRequest.result;
        if (event) {
          event.synced = true;
          store.put(event);
        }
      };
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

// Message handling for manual sync triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_ANALYTICS') {
    event.waitUntil(syncAnalyticsData());
  }
});
