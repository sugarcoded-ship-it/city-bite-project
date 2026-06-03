import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 80, // Routes browser WebSocket traffic through Nginx
    },
    watch: {
      usePolling: true, // Forces Vite to notice the files Docker just synced
    }
  }
})
