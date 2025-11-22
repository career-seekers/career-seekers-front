import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
  },
  server: {
    allowedHosts: [
      'career-seekers.ru',
    ],
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'career-seekers.ru',
      protocol: 'wss',
      clientPort: 443,
    }
  },
})