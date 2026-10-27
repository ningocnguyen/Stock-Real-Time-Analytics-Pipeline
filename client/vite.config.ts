import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleAiRequest } from './api/ai';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    {
      name: 'local-ai-api',
      configureServer(server) {
        const { GEMINI_API_KEY } = loadEnv(mode, process.cwd(), 'GEMINI_');
        server.middlewares.use('/api/ai', async (request, response) => {
          response.setHeader('Content-Type', 'application/json');
          if (request.method !== 'POST') {
            response.statusCode = 405;
            response.end(JSON.stringify({ error: 'Method not allowed.' }));
            return;
          }

          try {
            const chunks: Buffer[] = [];
            let size = 0;
            for await (const chunk of request) {
              size += chunk.length;
              if (size > 12_000) {
                response.statusCode = 413;
                response.end(JSON.stringify({ error: 'Request too large.' }));
                return;
              }
              chunks.push(chunk);
            }
            const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            const result = await handleAiRequest(payload, GEMINI_API_KEY);
            response.statusCode = result.status;
            response.end(JSON.stringify(result.body));
          } catch {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: 'Invalid JSON.' }));
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['recharts', 'lodash'],
  }
}));
