import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    modulePreload: {
      polyfill: false,
      resolveDependencies(_filename, deps) {
        return deps.filter(
          (dep) =>
            !dep.includes('data-') &&
            !dep.includes('cardsData') &&
            !dep.includes('framer-motion') &&
            !dep.includes('lucide-icons') &&
            !dep.includes('securityAntiCheat') &&
            !dep.includes('audio-')
        );
      },
    },
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-core',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 25,
            },
            {
              name: 'lucide-icons',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 20,
            },
            {
              name: 'i18n-core',
              test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]|[\\/]src[\\/]i18n[\\/]locales[\\/]fr\.json$/,
              priority: 20,
            },
            {
              name: 'data-games',
              test: /[\\/]src[\\/]data[\\/]games\.ts$/,
              priority: 40,
            },
            {
              name: 'data-quiz',
              test: /[\\/]src[\\/]data[\\/]quizQuestions\.ts$/,
              priority: 40,
            },
            {
              name: 'data-steam-store',
              test: /[\\/]src[\\/]data[\\/]steamStoreData\.ts$/,
              priority: 40,
            },
            {
              name: 'data-reviews',
              test: /[\\/]src[\\/]data[\\/]reviewPuzzles\.ts$/,
              priority: 40,
            },
          ],
        },
      },
    },
  },
})
