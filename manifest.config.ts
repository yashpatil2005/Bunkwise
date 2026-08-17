import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Bunkwise — Attendance Intelligence',
  description: 'Know what to attend. Skip smarter. Your MGM ERP attendance, decoded.',
  version: '1.0.0',
  icons: {
    '16': 'public/icons/icon-16.png',
    '48': 'public/icons/icon-48.png',
    '128': 'public/icons/icon-128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Bunkwise',
    default_icon: {
      '16': 'public/icons/icon-16.png',
      '48': 'public/icons/icon-48.png',
    },
  },
  content_scripts: [
    {
      matches: ['https://erp.mgmu.ac.in/*', 'http://erp.mgmu.ac.in/*'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle',
    },
  ],
  host_permissions: [
    'https://erp.mgmu.ac.in/*',
    'http://erp.mgmu.ac.in/*',
  ],
  permissions: [
    'storage',
    'activeTab',
    'scripting',
  ],
});
