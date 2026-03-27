import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'client/output'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/output'),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
  define: {
    // Allow overlay to know the HUD type from URL path
    '__HUD_TYPE__': JSON.stringify('cs2'),
  },
});
