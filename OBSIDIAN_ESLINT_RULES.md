# Obsidian Store ESLint Rules

Based on the error messages from Obsidian store submission, here are the rules they enforce:

## Required Rules (Always Checked by ObsidianReviewBot)

1. **Promises must be handled**
   - Rule: `@typescript-eslint/no-floating-promises`
   - Promises must be awaited, have `.catch()`, `.then()` with rejection handler, or marked with `void`

2. **No async without await**
   - Rule: `@typescript-eslint/require-await`
   - Remove `async` keyword if function has no `await`

3. **No unnecessary type assertions**
   - Rule: `@typescript-eslint/no-unnecessary-type-assertion`
   - Remove `as Type` when type is already correct

4. **Sentence case for UI text**
   - Rule: `obsidianmd/ui/sentence-case`
   - All UI text should use sentence case (first word capitalized, rest lowercase)

## How to Run Bot's Linting Rules Locally

### Quick Check (Matches Bot's Critical Rules)

```bash
npm run lint:bot
```

This runs `eslint.config.bot.mjs` which matches the exact rules ObsidianReviewBot checks:
- ✅ `require-await`: error
- ✅ `no-floating-promises`: error
- ✅ `no-unnecessary-type-assertion`: error
- ✅ `sentence-case`: error
- ⚠️ Type safety rules: warnings (bot may check some)

### Strict Check (All Type Safety Rules as Errors)

```bash
npm run lint:strict
```

This runs `eslint.config.strict.mjs` which treats ALL type safety rules as errors:
- All bot rules above, PLUS:
- `no-unsafe-assignment`: error
- `no-unsafe-member-access`: error
- `no-unsafe-return`: error
- `no-unsafe-call`: error
- `no-unsafe-argument`: error

### Standard Check (Development)

```bash
npm run lint
```

This runs `eslint.config.mjs` with warnings for type safety (faster, less strict).

## Why Bot Rules May Differ

The ObsidianReviewBot uses:
- **Type-aware linting**: `recommendedTypeChecked` preset (requires `project: './tsconfig.json'`)
- **Stricter type checking**: Can catch errors that regular linting misses
- **Different rule levels**: Some rules may be errors for bot but warnings locally

## Key Differences

| Rule | Local (standard) | Bot Mode | Strict Mode |
|------|------------------|----------|-------------|
| `require-await` | error | error | error |
| `no-floating-promises` | error | error | error |
| `no-unnecessary-type-assertion` | warn | error | error |
| `sentence-case` | error | error | error |
| `no-unsafe-assignment` | warn | warn | error |
| `no-unsafe-member-access` | warn | warn | error |
| `no-unsafe-call` | warn | warn | error |

## Troubleshooting

### Bot finds errors but local doesn't

1. **Run bot mode**: `npm run lint:bot`
2. **Check TypeScript config**: Ensure `tsconfig.json` has proper `include` paths
3. **Clear cache**: Delete `node_modules/.cache` if using ESLint cache

### Sentence-case rule not detecting violations locally

**Known Issue**: The `obsidianmd/ui/sentence-case` rule may not detect all violations locally, even though the bot finds them. This can happen because:

1. **Rule limitations**: The rule may only check specific patterns (like `.setName()`, `.setDesc()`) and not all UI text
2. **Type-aware requirement**: The rule needs type-aware linting (`recommendedTypeChecked`) to work properly
3. **Configuration differences**: The bot may use different rule settings than local

**Workaround**: 
- Manually check UI text strings for sentence case violations
- Look for title case (e.g., `'Activity Log'`, `'Configuration'`) and convert to sentence case (`'activity log'`, `'configuration'`)
- Use `npm run lint:bot:fix` to auto-fix what can be fixed
- Review bot comments carefully - they often catch violations we miss locally

**Common violations to check manually**:
- `.setName('Title Case')` → should be `.setName('title case')`
- `.setDesc('Title Case Text')` → should be `.setDesc('title case text')`
- `createEl('h2', { text: 'Title Case' })` → should be `createEl('h2', { text: 'title case' })`
- Console messages: `'MeetingMind: Title Case'` → should be `'MeetingMind: title case'`

### Type-aware rules not working

Ensure `eslint.config.mjs` has:
```javascript
parserOptions: {
  project: './tsconfig.json', // Required for type-aware rules
}
```

### Auto-fix sentence case

```bash
npm run lint:bot:fix
```

This will auto-fix sentence case violations.

## Current Status

✅ All Obsidian store ESLint errors have been fixed
✅ Local ESLint passes
✅ Bot mode linting passes (critical rules only)
⚠️ Strict mode shows type safety warnings (acceptable for now)
