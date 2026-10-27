import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['test/**/*.integration-spec.ts'],
    globals: true,
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
