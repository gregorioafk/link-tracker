s; // eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': 'warn',
    },
  },
);
