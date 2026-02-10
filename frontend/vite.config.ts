
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron to load assets
  define: {
    'process.env': {} // Polyfill process.env for libs relying on it
  }
})
