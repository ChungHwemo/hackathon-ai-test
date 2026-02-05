import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      sonarjs: sonarjs,
    },
    rules: {
      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',

      // Kent Beck complexity constraints
      complexity: ['error', { max: 10 }],  // CC ≤ 10
      'sonarjs/cognitive-complexity': ['error', 15],  // CoC ≤ 15
      'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      'max-depth': ['error', 3],

      // SonarJS rules
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      // General
      'no-console': 'off',
      'no-undef': 'off',  // TypeScript handles this
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js'],
  },
];
