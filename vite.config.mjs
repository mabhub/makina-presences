import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import viteESLint from '@ehutch79/vite-eslint';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactPlugin(),
    viteESLint(),
  ],
  server: {
    proxy: {
      '^/.netlify': {
        target: process.env.LAMBDA_ROOT,
        changeOrigin: true,
      },
    },
  },
});
