import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './'
});

// List known ESM packages from node_modules that need transformation
const esmPackages = [
  'next-auth',
  '@hookform',
  'react-hook-form',
  '@dnd-kit',
  'lucide-react',
  'cmdk',
  'sonner',
  '@radix-ui',
  'react-day-picker',
  'zustand'
  // Add any other packages that cause 'SyntaxError: Cannot use import statement outside a module'
].join('|');

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Keep existing mappers if they are still needed
    '^next-auth$': require.resolve('next-auth'),
    '^next-auth/react$': require.resolve('next-auth/react'),
    '^@hookform/resolvers/zod$': require.resolve('@hookform/resolvers/zod')
  },
  // Update transformIgnorePatterns to NOT ignore specified ESM packages
  transformIgnorePatterns: [
    `/node_modules/(?!(${esmPackages})/)`, // Transform listed ESM packages
    '^.+\\.module\\.(css|sass|scss)$' // Keep ignoring CSS modules if needed
  ],
  transform: {
    // Keep your existing SWC transform config
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
            dynamicImport: true
          },
          transform: {
            react: {
              runtime: 'automatic'
            }
          },
          target: 'es2022' // Keep target as is or adjust if needed
        },
        module: {
          type: 'commonjs', // Keep outputting CommonJS
          strict: true,
          strictMode: true,
          lazy: false,
          noInterop: false
        }
      }
    ]
  },
  // Remove extensionsToTreatAsEsm as we are transforming everything to CJS
  // extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/unit/**/*.{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/']
};

export default createJestConfig(config);
