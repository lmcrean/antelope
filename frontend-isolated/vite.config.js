import react from '@vitejs/plugin-react-swc'
import { defineConfig as defineVitestConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineVitestConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false, // This allows Vite to try another port if 3001 is in use
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['e2e/**/*', 'node_modules/**/*', 'src/**/*.spec.{js,jsx,ts,tsx}']
  }
})
