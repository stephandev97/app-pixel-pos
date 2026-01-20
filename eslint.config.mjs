// eslint.config.mjs (Flat config, sin "extends")
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  // Ignorar carpetas de build
  { ignores: ['dist/**', 'build/**', '**/node_modules/**'] },

  // Bases planas (flat) sin "extends"
  js.configs.recommended, // reglas recomendadas de JS (flat)
  react.configs.flat.recommended, // React recomendado (flat)

  // Config general para tu código
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, Intl: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      // Calidad base
      'no-unused-vars': 'off',
      'no-console': 'off',

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/order': 'off',
      'import/no-unresolved': 'off',

      // Prettier
      'prettier/prettier': 'warn',

      // Limpieza automática
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Override para proceso MAIN/PRELOAD de Electron (Node)
  {
    files: ['electron/**', 'main/**', 'src/main/**', 'src/preload/**', 'public/main.js'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Config para archivos de test
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
      },
    },
  },
];
