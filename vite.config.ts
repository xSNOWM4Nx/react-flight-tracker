import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  server: {
    proxy: {
      '/oskyapi': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oskyapi/, ''),
        secure: false,
      },
      '/oskytokenapi': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    },
  },
  build: {
    chunkSizeWarningLimit: 2100
  },
})
