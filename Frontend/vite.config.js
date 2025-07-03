import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ensure tailwind is handled properly
  ],
  resolve: {
    alias: {
      '@fullcalendar/daygrid': '@fullcalendar/daygrid/main.css',
      '@fullcalendar/timegrid': '@fullcalendar/timegrid/main.css',
      '@fullcalendar/list': '@fullcalendar/list/main.css',
    },
  },
  server: {
    hmr: {
      overlay: false,  // Disable HMR overlay if needed
    },
  },
});
