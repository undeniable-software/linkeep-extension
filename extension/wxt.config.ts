import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entries',
  manifest: {
    permissions: ['activeTab', 'webRequest'],
  },
  vite: () => ({
    plugins: [react()],
  }),
});
