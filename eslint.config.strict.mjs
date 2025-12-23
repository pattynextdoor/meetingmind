import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';

/**
 * Strict ESLint config matching ObsidianReviewBot rules
 * This uses recommended-type-checked for stricter type-aware linting
 */
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Type-aware rules (stricter than recommended)
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
      // Critical rules that ObsidianReviewBot treats as errors
      '@typescript-eslint/no-floating-promises': 'error', // Promises must be handled
      '@typescript-eslint/require-await': 'error', // Async methods must have await
      '@typescript-eslint/no-unnecessary-type-assertion': 'error', // No unnecessary 'as Type'
      'obsidianmd/ui/sentence-case': ['error', {
        enforceCamelCaseLower: true,
        allowAutoFix: true,
        brands: ['MeetingMind', 'Otter.ai', 'Fireflies.ai', 'Claude', 'OpenAI', 'GPT-4', 'Anthropic', 'Gumroad', 'SRT', 'VTT', 'JSON'],
        acronyms: ['API', 'AI', 'SRT', 'VTT', 'JSON'],
      }],

      // Type safety rules - bot may treat these as errors
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Other rules
      '@typescript-eslint/no-explicit-any': 'warn', // Allow with justification
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
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

