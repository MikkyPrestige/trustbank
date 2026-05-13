import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next-auth': path.resolve(__dirname, './src/tests/__mocks__/next-auth'),
      '@/auth': path.resolve(__dirname, './src/tests/__mocks__/auth'),
    },
  },
});