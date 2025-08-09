import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcssVite from '@tailwindcss/vite'
// Removed custom aliasing

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcssVite()],
})
