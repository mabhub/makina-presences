import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import viteESLint from '@ehutch79/vite-eslint';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
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
