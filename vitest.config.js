import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      exclude: ["__tests__/**"],
    },
  },
});
