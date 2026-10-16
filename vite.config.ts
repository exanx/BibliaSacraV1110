import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'health-check',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/healthz' || req.url === '/_ah/health' || req.url === '/health') {
            res.statusCode = 200;
            res.end('OK');
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/healthz' || req.url === '/_ah/health' || req.url === '/health') {
            res.statusCode = 200;
            res.end('OK');
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
});
