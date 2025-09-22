import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  esbuild: {
    // Treat "use client" as harmless instead of failing
    supported: {
      'directive': true,}
})