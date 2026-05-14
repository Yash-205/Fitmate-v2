import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    fileParallelism: false,
    isolate: true,
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000,
  },
});
