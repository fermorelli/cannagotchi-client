import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // Match the existing Vercel API rewrite unless a local backend is explicitly selected.
  const apiTarget = env.VITE_API_TARGET || 'https://cannagotchi-server.vercel.app';

  return {
    plugins: [react()],
    build: {
      outDir: 'build',
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
