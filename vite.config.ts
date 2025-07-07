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
      // All requests to /oskyapi will be proxied to the OpenSky Network API
      '/oskyapi': {
        target: 'https://opensky-network.org/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oskyapi/, ''),
        secure: false,
      },
    },
  },
})
