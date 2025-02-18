import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig as defineVitestConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineVitestConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['e2e/**/*', 'node_modules/**/*']
  }
})
