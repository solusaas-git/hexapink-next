// Basic Service Worker
// This is a minimal service worker to prevent 404 errors

self.addEventListener('install', (event) => {
  // Service worker installed
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Service worker activated
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle all fetch requests normally
  return;
});

