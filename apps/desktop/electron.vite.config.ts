import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { minify: true },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { minify: true },
  },
  renderer: {
    // one .env at repo root for both apps, not duplicated per app
    envDir: resolve("../.."),
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
      // one React copy across app + linked @experiments-electron/shared
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      exclude: ["@experiments-electron/shared"],
    },
    plugins: [react()],
    build: { minify: true },
  },
});
