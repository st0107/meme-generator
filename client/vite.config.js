import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/generate-meme': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    define: {
      __APP_MODE__: JSON.stringify(mode),
    },
  };
});
