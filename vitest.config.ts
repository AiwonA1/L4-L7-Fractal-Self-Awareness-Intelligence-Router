/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Do not statically import tsconfigPaths
// import tsconfigPaths from 'vite-tsconfig-paths' 
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async () => { // Make the function async
  // Dynamically import the ESM module
  const tsconfigPaths = (await import('vite-tsconfig-paths')).default;

  return {
    plugins: [
      react(),
      tsconfigPaths() // Use the dynamically imported plugin
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    // Manual alias section was removed previously
  }
}) 