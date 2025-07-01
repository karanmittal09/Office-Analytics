export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('New service worker available');
            // You could show a notification to the user here
          }
        });
      }
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
      
      if (event.data.type === 'SYNC_COMPLETE') {
        console.log('Background sync completed');
        // You could update UI here
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};

export const triggerBackgroundSync = async (tag: string = 'analytics-sync'): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log('Background sync registered:', tag);
    } else {
      // Fallback: send message to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_ANALYTICS',
          tag,
        });
      }
    }
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
};

export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const addOnlineListener = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
};

export const addOfflineListener = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
};
