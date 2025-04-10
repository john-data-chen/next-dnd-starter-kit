import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './'
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/app/layout.tsx',
    '!src/app/providers.tsx'
  ],
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/unit/**/*.{js,jsx,ts,tsx}'
  ],
  // 排除 e2e 測試
  testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/']
};

export default createJestConfig(config);
