import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';

/**
 * ESLint config matching ObsidianReviewBot's exact rules
 * 
 * Based on actual errors reported by ObsidianReviewBot:
 * - require-await: Async methods must have await
 * - no-floating-promises: Promises must be handled
 * - no-unnecessary-type-assertion: No unnecessary 'as Type'
 * - sentence-case: UI text must use sentence case
 * - no-unsafe-*: Type safety rules (may be checked)
 * 
 * Run with: npm run lint:bot
 */
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // Type-aware for require-await to work properly
  // Note: obsidianmd.configs.recommended includes sentence-case, but we override it below
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
      // Critical rules that ObsidianReviewBot ALWAYS checks (from PR comments)
      '@typescript-eslint/no-floating-promises': 'error', // Promises must be handled
      '@typescript-eslint/require-await': 'error', // Async methods must have await
      '@typescript-eslint/no-unnecessary-type-assertion': 'error', // No unnecessary 'as Type'
      'obsidianmd/ui/sentence-case': ['error', {
        enforceCamelCaseLower: true,
        allowAutoFix: true,
        brands: ['MeetingMind', 'Otter.ai', 'Fireflies.ai', 'Claude', 'OpenAI', 'GPT-4', 'Anthropic', 'Gumroad', 'SRT', 'VTT', 'JSON'],
        acronyms: ['API', 'AI', 'SRT', 'VTT', 'JSON'],
      }],

      // Type safety rules - bot may check these, but they're often warnings
      // Set to 'error' to catch them, but note: bot might only flag some
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Other rules - less critical
      '@typescript-eslint/no-explicit-any': 'warn',
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

