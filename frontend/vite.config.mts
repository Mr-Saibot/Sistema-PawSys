import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const directorioConfiguracion = dirname(fileURLToPath(import.meta.url));
const rutasEntrada = {
  principal: resolve(directorioConfiguracion, 'index.html'),
  ficha: resolve(directorioConfiguracion, 'ficha.html'),
};

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: rutasEntrada,
    },
  },
});
