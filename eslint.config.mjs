// @ts-check
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierConfigRecommended from 'eslint-plugin-prettier/recommended';
import reactCompiler from "eslint-plugin-react-compiler";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

const nextConfig = compat.extends('next/core-web-vitals');
// @ts-expect-error - Known type incompatibility with ESLint 9
const patchedConfig = fixupConfigRules(nextConfig);

const config = [
  ...patchedConfig,
  ...ts.configs.recommended,
  prettierConfigRecommended,
  reactCompiler.configs.recommended,
  {
    ignores: [
      '.next/**/*',
      'src/components/ui/**/*.{js,jsx,ts,tsx}',
      'src/components/ui/*.{js,jsx,ts,tsx}',
      '__tests__/**/*.{js,jsx,ts,tsx}',
    ]
  }
];

export default config;