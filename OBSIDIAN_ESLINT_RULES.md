# Obsidian Store ESLint Rules

Based on the error messages from Obsidian store submission, here are the rules they enforce:

## Required Rules

1. **Promises must be handled**
   - Rule: `@typescript-eslint/no-floating-promises`
   - Promises must be awaited, have `.catch()`, `.then()` with rejection handler, or marked with `void`

2. **No direct style manipulation**
   - Avoid `element.style.*` 
   - Use CSS classes or `setCssProps()` function

3. **Sentence case for UI text**
   - All UI text should use sentence case (first word capitalized, rest lowercase)

4. **No unnecessary type assertions**
   - Remove `as Type` when type is already correct

5. **No async without await**
   - Remove `async` keyword if function has no `await`

6. **Settings headings**
   - Don't use "settings" in headings
   - Don't include plugin name in headings

7. **File deletion**
   - Use `FileManager.trashFile()` instead of `Vault.delete()`

8. **No unnecessary escapes**
   - Remove unnecessary escape characters in regex

9. **Template literal types**
   - Fix template literals with `unknown` type

## How to Verify Locally

We can't run the exact Obsidian store ESLint, but we can add similar rules:

```bash
npm install --save-dev @typescript-eslint/eslint-plugin
```

Then add to `eslint.config.mjs`:
- `@typescript-eslint/no-floating-promises: 'error'`
- Other rules as needed

## Current Status

✅ All Obsidian store ESLint errors have been fixed
✅ Local ESLint passes
✅ Tests pass
