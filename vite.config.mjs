import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'src/webapp',
  plugins: [react()],
  build: {
    outDir: path.resolve(import.meta.dirname, 'public'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, 'src/webapp/index.html'),
    },
  },
});
