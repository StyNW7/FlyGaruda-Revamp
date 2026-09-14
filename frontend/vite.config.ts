import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FlyGaruda',
        short_name: 'FlyGaruda',
        description:
          'FlyGaruda — the redesigned Garuda Indonesia mobile experience. Discover the value, book effortlessly, travel confidently.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFFFFF',
        theme_color: '#0C265D',
        lang: 'en',
        categories: ['travel'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell + brand assets; large mascot images are cached at runtime instead
        globPatterns: [
          '**/*.{js,css,html,ico,svg,woff,woff2}',
          'brand/*.png',
          'collaborator/*.png',
          'pwa-*.png',
          'maskable-*.png',
          'apple-touch-icon-*.png',
        ],
        globIgnores: ['Images/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // SPA: serve index.html for any client-side route when offline
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Mascot illustrations: cache on first use so visited screens work offline
            urlPattern: /\/mascot\/.*\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'mascot-images',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet (Plus Jakarta Sans)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Allows testing the manifest/install prompt with `npm run dev`
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
