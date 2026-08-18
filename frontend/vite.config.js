import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ==========================================
// JanaoBangla — Vite Configuration
// BRANCH: main
// Frontend build tool configuration file
// Proxy setup diye frontend theke backend call subidhajanak hobe
// ==========================================

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,  // Frontend development server ei port e chalbe

    // ==========================================
    // API Proxy — /api routes backend e pathabe
    // Ei diye CORS problem ছাড়া development e backend call hobe
    // ==========================================
    proxy: {
      '/api': {
        target:       'http://localhost:5000', // Backend server er address
        changeOrigin: true,
        secure:       false
      },
      '/uploads': {
        target:       'http://localhost:5000', // Uploaded files backend theke newa hobe
        changeOrigin: true,
        secure:       false
      }
    }
  },

  build: {
    outDir:    'dist',     // Production build output folder
    sourcemap: false       // Production e sourcemap off rakhbo
  }
});
