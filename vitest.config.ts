import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'scripts/**/*.{test,spec}.{ts,tsx,mjs}'],
    coverage: { reporter: ['text', 'html'] },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './vitest.server-only-stub.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
});
