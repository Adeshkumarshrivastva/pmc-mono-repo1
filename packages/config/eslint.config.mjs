import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  {
    plugins: { import: importPlugin },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-use-before-define': 'off',
      camelcase: 'off',
      'comma-dangle': 'off',
      'func-call-spacing': 'off',
      'import/no-absolute-path': 'off',
      'import/order': ['error', { groups: ['builtin', 'external', 'internal'] }],
      'import/un-resolved': 'off',
      indent: 'off',
      'multiline-ternary': 'off',
      'no-console': 'warn',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-useless-escape': 'off',
      'prefer-regex-literals': 'off',
      'space-before-function-paren': 'off',
    },
  },
])
