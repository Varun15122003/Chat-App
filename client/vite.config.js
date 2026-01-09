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
    // Docker/Browser compatibility ke liye global ko window se map karna
    global: 'window',
  },
  server: {
    // 🟢 Docker container ke bahar access dene ke liye zaroori hai
    host: '0.0.0.0', 
    
    // 🟢 Aapka fixed port
    port: 5173,

    // 🟢 HMR (Hot Module Replacement) ke liye settings taaki code change auto-reflect ho
    hmr: {
      clientPort: 443, // Agar ngrok (https) use kar rahe hain toh 443 zaroori hai
    },

    // 🟢 Security setting: Sirf in hosts ko allow karein
    allowedHosts: [
      'd46edd15437a.ngrok-free.app', 
      '.ngrok-free.app',
      'localhost',
      '.azurecontainerapps.io' // Azure deployment ke liye pehle se add kar diya
    ]
  }
})