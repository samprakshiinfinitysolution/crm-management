/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  CacheableResponsePlugin,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: [
    { url: "/~offline", revision: "v1" },
    ...(self.__SW_MANIFEST || []),
  ],
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  runtimeCaching: [
    // 1. Dynamic API and Realtime Socket.IO: NetworkOnly (never cache business-critical CRM data)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/socket.io"),
      handler: new NetworkOnly(),
    },

    // 2. Cloudinary & Remote Images: CacheFirst (instant 0ms load on repeat visits)
    {
      matcher: ({ url }) =>
        url.hostname.includes("res.cloudinary.com") ||
        url.hostname.includes("cloudinary.com"),
      handler: new CacheFirst({
        cacheName: "cloudinary-images-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 120,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days cache
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 3. Next.js Optimized Images (/_next/image): CacheFirst
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new CacheFirst({
        cacheName: "next-images-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days cache
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 4. Local Static Images (.png, .jpg, .jpeg, .svg, .webp, .avif, .ico)
    {
      matcher: ({ url }) =>
        /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: "static-images-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 150,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days cache
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },

    // 5. Default Serwist cache for JS chunks, CSS, fonts, and pages
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const offlineFallback = await serwist.matchPrecache("/~offline");
    if (offlineFallback) {
      return offlineFallback;
    }
  }
  return Response.error();
});

serwist.addEventListeners();
