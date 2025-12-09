import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Импорт плагина Tailwind V4

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // <-- Использование плагина Tailwind V4
  ],
})