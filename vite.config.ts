import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const APP_BASE = "/workout-app/";

function listFiles(dir: string, prefix = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "service-worker.js") return [];
    const rel = `${prefix}${entry.name}`;
    return entry.isDirectory() ? listFiles(resolve(dir, entry.name), `${rel}/`) : [`${APP_BASE}${rel}`];
  });
}

function precacheServiceWorker(): Plugin {
  return {
    name: "precache-service-worker",
    apply: "build",
    closeBundle() {
        const files = [...new Set([...listFiles(resolve(root, "dist")), APP_BASE, `${APP_BASE}index.html`])];
      const cacheName = `workout-app-${Date.now()}`;
      writeFileSync(resolve(root, "dist/service-worker.js"), `const CACHE = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(files)};
const APP_BASE = ${JSON.stringify(APP_BASE)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      const cache = await caches.open(CACHE);
      cache.put(event.request, response.clone());
      return response;
    } catch {
      if (event.request.mode === "navigate") {
        const fallback = await caches.match(APP_BASE + "index.html");
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});
`);
    }
  };
}

export default defineConfig({
  base: APP_BASE,
  plugins: [react(), precacheServiceWorker()],
  build: {
    sourcemap: false
  }
});
