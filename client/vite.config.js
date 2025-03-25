import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Optional: Ensure Vite resolves these correctly
      leaflet: "/node_modules/leaflet",
      "leaflet-draw": "/node_modules/leaflet-draw",
    },
  },
  css: {
    // Ensure CSS files are processed
    preprocessorOptions: {
      css: {
        // No special config needed for plain CSS imports
      },
    },
  },
});
