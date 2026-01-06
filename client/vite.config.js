import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  define: {
    global: 'window',
  },
  server: {
    // 🟢 1. Vite ko allow karein ki wo kisi bhi network interface par chale
    host: true, 
    // 🟢 2. Port fix karein (jo ngrok point kar raha hai)
    port: 5173,
    allowedHosts: [
      'd46edd15437a.ngrok-free.app', // 🟢 3. Sirf domain name dalein (no https://)
      '.ngrok-free.app'              // Optional: Saare ngrok subdomains allow karne ke liye
    ]
  }
})