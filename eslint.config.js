import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'unicorn/better-regex': 'warn',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            args: false,
            params: false,
            props: false,
            utils: false,
          },
        },
      ],
    },
  },
  {
    files: ['app/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules, 'unicorn/no-null': 'off' },
    settings: { vitest: { typecheck: true } },
    languageOptions: { globals: { ...vitest.environments.env.globals } },
  },
  {
    files: ['src/**/*.test.{jsx,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    files: ['playwright/**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      'playwright/no-conditional-expect': 'off',
    },
  },
  eslintPluginPrettierRecommended,
);
