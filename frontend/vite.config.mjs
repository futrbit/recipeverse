import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@stripe/stripe-js'],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/pricing': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/stripe': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/generate': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});