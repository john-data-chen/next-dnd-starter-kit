import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import path from 'path';
import { beforeAll, vi } from 'vitest';

// Import vi for mocking if needed

// Determine the correct path to the .env.test file relative to the project root
const envPath = path.resolve(process.cwd(), '.env.test');
console.log(`Attempting to load environment variables from: ${envPath}`); // Debugging line

// Load environment variables from .env.test specifically for tests
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env.test file:', result.error); // Debugging line
} else {
  console.log('.env.test file loaded successfully.'); // Debugging line
  // console.log('DATABASE_URL loaded:', process.env.DATABASE_URL); // Optional: Check if variable is loaded
}

// --- Add other global test setups below ---

// Example: Mocking matchMedia for testing hooks like useIsMobile or other browser APIs
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
  // Mock other browser APIs if necessary for your tests
  // e.g., localStorage, sessionStorage, etc.
});

// You can add other global mocks or configurations here
