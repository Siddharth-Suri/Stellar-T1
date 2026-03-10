import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Stellar SDK requires global
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // polyfill Buffer for Stellar SDK in browser
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
