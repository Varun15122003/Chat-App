import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 🟢 1. Import the polyfill plugin
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 🟢 2. Add the plugin here
    nodePolyfills({
      // Whether to polyfill `global` variable
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  // 🟢 3. Define global just to be safe (Previous fix)
  define: {
    global: 'window',
  },
})