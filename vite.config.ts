
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: 'generateSW',
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      // This section will now automatically generate icons and the manifest.
      includeAssets: ["/logo.png"],
      manifest: {
        "short_name": "الرياضي الذكي",
        "name": "الرياضي الذكي | AI-Uncode",
        "description": "نظام إدارة المحتوى الرياضي بدعم من AI-Uncode. المدير التنفيذي: المهندس توفيق العبدلي",
        "icons": [
          {
            "src": "/pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/pwa-maskable-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "theme_color": "#020617",
        "background_color": "#020617"
      },
      // This will add the apple-touch-icon link to the index.html
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

