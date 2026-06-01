import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  envDir: '..',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      // Proxy /api requests to the deployed Vercel backend for local dev
      '/api': {
        target: 'https://centra-budget.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

