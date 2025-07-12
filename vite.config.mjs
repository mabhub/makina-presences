import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// import viteESLint from '@ehutch79/vite-eslint';
import dotenv from 'dotenv';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config({ path: '.env.local' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactPlugin({
      babel: {
        plugins: [
          'react-component-data-attribute',
        ],
      },
    }),
    // viteESLint(),
    nodePolyfills({ include: ['url'] }),
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
