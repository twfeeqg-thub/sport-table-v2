
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // This is the crucial addition: tells the plugin to generate a service worker.
      strategies: 'generateSW',
      workbox: {
        // This ensures all assets output by the build process are precached.
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      includeAssets: ["/logo.png"],
      manifest: {
        "short_name": "الرياضي الذكي",
        "name": "الرياضي الذكي | AI-Uncode",
        "description": "نظام إدارة المحتوى الرياضي بدعم من AI-Uncode. المدير التنفيذي: المهندس توفيق العبدلي",
        "icons": [
          {
            "src": "/logo.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "/logo.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "theme_color": "#020617",
        "background_color": "#020617"
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});


