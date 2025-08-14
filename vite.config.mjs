import { sentryVitePlugin } from '@sentry/vite-plugin';
import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
// import viteESLint from '@ehutch79/vite-eslint';
import dotenv from 'dotenv';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

dotenv.config({ path: '.env.local' }); //eslint-disable-line require-hook

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin({
    babel: {
      plugins: [
        'react-component-data-attribute',
      ],
    },
  }),
  // viteESLint(),
  nodePolyfills({ include: ['url'] }), sentryVitePlugin({
    org: 'makinacorpus',
    project: 'makina-presences',
    url: 'https://sentry.makina-corpus.net',
  })],

  server: {
    proxy: {
      '^/.netlify': {
        target: process.env.LAMBDA_ROOT, //eslint-disable-line no-process-env
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true,
  },
});
