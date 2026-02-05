import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './web/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
      'web/src/services/__tests__/**/*.test.ts',
      'web/src/pages/__tests__/**/*.test.{ts,tsx}',
      'web/src/hooks/__tests__/**/*.test.ts',
    ],
    environmentMatchGlobs: [
      ['web/src/pages/__tests__/**', 'jsdom'],
      ['web/src/hooks/__tests__/**', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/**/*.d.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
