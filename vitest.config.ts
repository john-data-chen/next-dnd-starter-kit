import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vitest/config';

// Import the 'path' module

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '__tests__/e2e/**'],
    globals: true, // Ensure Vitest global APIs are enabled,
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', '__tests__/**/*.test.{ts,tsx}']
    }
  },
  resolve: {
    // Add the resolve configuration
    alias: {
      '@': path.resolve(__dirname, './src') // Map '@' to the 'src' directory
    }
  }
});
