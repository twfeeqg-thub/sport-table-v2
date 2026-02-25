/// <reference types="vite-plugin-pwa/client" />

import { registerSW } from 'virtual:pwa-register';

// This function is called in main.tsx to register the service worker.
export function register() {
  // The 'autoUpdate' registerType in vite.config.ts will handle the update flow automatically.
  // immediate: true will register the service worker immediately without waiting for the page to be controlled.
  registerSW({ immediate: true });
}
