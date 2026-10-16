"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // In development mode, unregister any active service worker left over from previous production builds
    // to prevent stale chunk 404s and cache interference with hot reloading.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.log("[PWA] Unregistered leftover production service worker in dev mode.");
            }
          });
        }
      });

      // Clear all cache storages in dev mode so outdated chunks or fonts never conflict
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // In production mode, register the service worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[PWA] Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  }, []);

  return null;
}
