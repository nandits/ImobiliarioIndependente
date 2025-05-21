import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ testete
export default defineConfig({
  plugins: [react()],
  base: '/ImobiliarioIndependente/', 
})
