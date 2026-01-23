import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    maxWorkers: 2,
    teardownTimeout: 5000,
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'src/database/migrations',
        'src/database/seeds',
        '**/*.d.ts',
        '**/*.js',
        'eslint.config.mjs',
        'vitest.config.ts',
      ],
    },
  },
});
