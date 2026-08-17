import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
