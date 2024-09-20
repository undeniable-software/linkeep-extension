import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

const apiUrl = import.meta.env.VITE_LINKEEP_API_URL as string;

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entries',

  manifest: {
    permissions: ['activeTab', 'storage', 'cookies'],
    host_permissions: [
      'https://mylinkeep.com/*',
      'https://linkeep-api.onrender.com',
      'https://clerk.mylinkeep.com/*',
    ],
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
