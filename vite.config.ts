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
    {
      name: 'inject-env-variables',
      transformIndexHtml: {
        order: 'post',
        handler(html, { path }) {
          // Only inject for the main index.html and under-maintenance.html
          if (path === '/index.html' || path === '/under-maintenance.html') {
            const envScript = `
              <script>
                window.VITE_SUPABASE_URL = '${process.env.VITE_SUPABASE_URL || ''}';
                window.VITE_SUPABASE_ANON_KEY = '${process.env.VITE_SUPABASE_ANON_KEY || ''}';
              </script>
            `
            // Insert before closing head tag
            return html.replace('</head>', envScript + '</head>')
          }
          return html
        }
      }
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'public',
  build: {
    copyPublicDir: true,
  },
})
