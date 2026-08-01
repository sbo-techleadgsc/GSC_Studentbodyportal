import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { handleSpotifySearch } from './server/spotify-search.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'spotify-search-dev-proxy',
      configureServer(server) {
        server.middlewares.use('/api/spotify-search', async (req, res, next) => {
          if (!req.url) {
            next()
            return
          }

          await handleSpotifySearch(req, res, process.env)
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
