import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { mockLatestRelease } from './src/mocks/latestRelease'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib')
    }
  },
  build: {
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api/latest-release': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.url === '/api/latest-release') {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(mockLatestRelease))
            }
          })
        },
      },
    },
  },
})