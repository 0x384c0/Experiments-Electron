import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // set for GitHub Pages project sites (e.g. "/repo-name/"), "/" for docker/local
  base: process.env.VITE_BASE_PATH ?? "/",
  // one .env at repo root for both apps, not duplicated per app
  envDir: resolve(import.meta.dirname, "../.."),
  plugins: [react()],
  // host: true binds 0.0.0.0 -- without it, in a container this can end up
  // IPv6-loopback-only ([::1]), which VS Code's port forwarding can't reach
  server: { port: 3000, host: true },
  resolve: {
    // one React copy across app + linked @experiments-electron/shared
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@experiments-electron/shared"],
  },
});
