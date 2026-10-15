import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from https://natascha-baum.github.io/acfs-dndPA/
  base: '/acfs-dndPA/',
  plugins: [react()],
})
