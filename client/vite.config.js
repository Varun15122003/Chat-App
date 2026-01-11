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
    // Azure/Docker environment compatibility
    'global': 'window',
  },
  // Build settings zaroori hain taaki output sahi folder mein jaye
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: '0.0.0.0', 
    port: 5173,
    allowedHosts: [
      'localhost',
      '.azurewebsites.net', // 🟢 Azure Web Apps ke liye ye zaroori hai
      'webchatapp.azurewebsites.net'
    ]
  }
})