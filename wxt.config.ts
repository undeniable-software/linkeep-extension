import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

const apiUrl = import.meta.env.LINKEEP_API_URL;

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entries',
  manifest: {
    permissions: ['activeTab', 'webRequest', 'cookies', 'storage'],
    host_permissions: [apiUrl + '/*'],
    web_accessible_resources: [
      {
        matches: ['<all_urls>'],
        resources: ['popup.html'],
      },
    ],
  },
  vite: () => ({
    plugins: [react()],
  }),
});
