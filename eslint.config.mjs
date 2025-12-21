import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2015,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-floating-promises': 'error', // Obsidian store requirement - promises must be handled
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn', // Changed from 'error' to 'warn' for false positives
      'obsidianmd/ui/sentence-case': ['warn', {
        brands: ['MeetingMind', 'Otter.ai', 'Fireflies.ai', 'Claude', 'OpenAI', 'GPT-4', 'Anthropic', 'Gumroad', 'SRT', 'VTT', 'JSON'],
        acronyms: ['API', 'AI', 'SRT', 'VTT', 'JSON'],
      }],
      'no-console': 'off',
      'no-undef': 'off', // TypeScript handles this
    },
    ignores: [
      'node_modules/**',
      'frontend/**',
      'main.js',
      '*.config.mjs',
      'dist/**',
    ],
  }
);

