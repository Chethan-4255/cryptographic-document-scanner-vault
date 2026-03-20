import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //   },
    //   manifest: {
    //     name: 'Cryptographic Document Scanner & Vault',
    //     short_name: 'DocVault',
    //     description: 'Offline-first evidence vault for police stations. SHA-256 document fingerprinting.',
    //     theme_color: '#f8fafc',
    //     background_color: '#f8fafc',
    //     display: 'standalone',
    //     start_url: '/',
    //   },
    // }),
  ],
});
