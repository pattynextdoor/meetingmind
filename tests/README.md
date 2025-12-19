# MeetingMind Tests

Comprehensive test suite for the MeetingMind Obsidian plugin.

## Overview

This directory contains unit tests, integration tests, and mocks for all major services in the MeetingMind plugin.

## Test Structure

```
tests/
├── __mocks__/
│   └── obsidian.ts          # Mock Obsidian API
├── TranscriptParser.test.ts  # Transcript parsing tests
├── VaultIndex.test.ts        # Vault indexing tests
├── AutoLinker.test.ts        # Auto-linking tests
├── NoteGenerator.test.ts     # Note generation tests
├── AIService.test.ts         # AI service tests
├── LicenseService.test.ts    # License validation tests
├── integration.test.ts       # End-to-end integration tests
└── README.md                 # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test TranscriptParser.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should parse VTT"
```

## Test Coverage

The test suite covers:

### TranscriptParser Service
- ✅ VTT format parsing
- ✅ SRT format parsing
- ✅ JSON format parsing (Otter.ai, custom formats)
- ✅ Plain text parsing
- ✅ Timestamp parsing and formatting
- ✅ Title extraction
- ✅ Hash generation
- ✅ Duration calculation
- ✅ Participant extraction
- ✅ Edge cases and error handling

### VaultIndex Service
- ✅ Note title indexing
- ✅ Explicit alias indexing
- ✅ Implicit alias generation
- ✅ Excluded folder handling
- ✅ Exact match lookups
- ✅ Ambiguous match handling
- ✅ Case-insensitive matching
- ✅ Index rebuilding
- ✅ Configuration updates

### AutoLinker Service
- ✅ Exact match linking
- ✅ First-occurrence-only linking
- ✅ Case preservation in display text
- ✅ Word boundary matching
- ✅ Existing link preservation
- ✅ Ambiguous match suggestions
- ✅ Longest-match-first algorithm
- ✅ Special character handling
- ✅ Performance with large texts

### NoteGenerator Service
- ✅ Frontmatter generation
- ✅ Summary section
- ✅ Action items formatting
- ✅ Decisions section
- ✅ Transcript section with collapsible callout
- ✅ Suggested links section
- ✅ Filename generation from templates
- ✅ Filename sanitization
- ✅ Date formatting
- ✅ Edge cases

### AIService
- ✅ Configuration validation
- ✅ Provider support (Claude, OpenAI)
- ✅ Feature toggles
- ✅ Error handling
- ✅ Tag suggestions

### LicenseService
- ✅ License validation
- ✅ Feature access control
- ✅ Pro tier detection
- ✅ Free tier limitations

### Integration Tests
- ✅ End-to-end transcript processing
- ✅ Auto-linking workflow
- ✅ Vault index updates
- ✅ Complex linking scenarios
- ✅ Full meeting import simulation
- ✅ Performance benchmarks

## Writing Tests

### Test Structure Template

```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    service = new ServiceName();
    // Setup
  });

  describe('methodName', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = service.method(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Using Mocks

The Obsidian API is mocked in `__mocks__/obsidian.ts`. Use helper methods to set up test data:

```typescript
import { App } from 'obsidian';

const app = new App();

// Add a file to the mock vault
(app.vault as any)._setFile('Notes/Test.md', '# Content');

// Set metadata cache
(app.metadataCache as any)._setCache('Notes/Test.md', {
  frontmatter: { aliases: ['Test'] }
});

// Clear between tests
(app.vault as any)._clear();
(app.metadataCache as any)._clear();
```

## Test Guidelines

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test public APIs, not private methods

2. **Write Clear Test Names**
   - Use descriptive names: `should parse VTT with speaker format`
   - Follow pattern: `should [expected behavior] when [condition]`

3. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data
   - Act: Execute the code being tested
   - Assert: Verify the results

4. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Very large inputs
   - Special characters
   - Boundary conditions

5. **Keep Tests Independent**
   - Each test should run independently
   - Use `beforeEach` to reset state
   - Don't rely on test execution order

6. **Use Meaningful Assertions**
   - Be specific: `expect(result.length).toBe(3)` not just `expect(result).toBeTruthy()`
   - Test multiple aspects when relevant

## Continuous Integration

Tests run automatically on:
- Push to main branch
- Pull requests
- Pre-commit hooks (if configured)

See `.github/workflows/test.yml` for CI configuration.

## Coverage Goals

- Aim for >80% code coverage
- 100% coverage for critical paths:
  - Transcript parsing
  - Auto-linking logic
  - Note generation
  - Data validation

## Debugging Tests

### Run tests with verbose output
```bash
npm test -- --verbose
```

### Debug a specific test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand TranscriptParser.test.ts
```

### View coverage report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Common Issues

### Mock not working
- Ensure mock is in `__mocks__` directory
- Check that module name matches exactly
- Clear Jest cache: `npx jest --clearCache`

### Tests timing out
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises
- Verify async/await usage

### Flaky tests
- Avoid hardcoded timestamps
- Use deterministic data
- Ensure proper cleanup in `afterEach`

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Update this README if adding new test categories
4. Maintain >80% coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Obsidian API Docs](https://docs.obsidian.md/Plugins)

