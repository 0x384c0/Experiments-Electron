import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // set for GitHub Pages project sites (e.g. "/repo-name/"), "/" for docker/local
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  server: { port: 3000 },
  resolve: {
    // one React copy across app + linked @experiments-electron/shared
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@experiments-electron/shared"],
  },
});
