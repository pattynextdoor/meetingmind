/**
 * Tests for AutoLinker service
 */

import { AutoLinker } from '../src/services/AutoLinker';
import { VaultIndexService } from '../src/services/VaultIndex';
import { App } from 'obsidian';

describe('AutoLinker', () => {
  let app: App;
  let vaultIndex: VaultIndexService;
  let autoLinker: AutoLinker;

  beforeEach(async () => {
    app = new App();
    vaultIndex = new VaultIndexService(app);
    autoLinker = new AutoLinker(vaultIndex, 3);
    
    // Clear mocks
    (app.vault as any)._clear();
    (app.metadataCache as any)._clear();
    
    // Set up a basic vault
    (app.vault as any)._setFile('People/Sarah Chen.md', '# Sarah');
    (app.vault as any)._setFile('Projects/Project Phoenix.md', '# Phoenix');
    (app.vault as any)._setFile('Notes/API.md', '# API Documentation');
    
    vaultIndex.buildIndex();
  });

  describe('processText', () => {
    it('should create links for exact matches', () => {
      const text = 'Sarah Chen is working on Project Phoenix.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Sarah Chen]]');
      expect(result.linkedText).toContain('[[Project Phoenix]]');
    });

    it('should only link first occurrence of each term', () => {
      const text = 'Sarah Chen met with Sarah Chen about the project.';
      const result = autoLinker.processText(text);

      // Count occurrences of the link
      const linkCount = (result.linkedText.match(/\[\[Sarah Chen\]\]/g) || []).length;
      expect(linkCount).toBe(1);
      
      // Second occurrence should remain as plain text
      expect(result.linkedText).toMatch(/\[\[Sarah Chen\]\].*Sarah Chen/);
    });

    it('should preserve case in display text', () => {
      const text = 'SARAH CHEN is working on project phoenix.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Sarah Chen|SARAH CHEN]]');
      expect(result.linkedText).toContain('[[Project Phoenix|project phoenix]]');
    });

    it('should use simple link when case matches', () => {
      const text = 'Sarah Chen is here.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Sarah Chen]]');
      expect(result.linkedText).not.toContain('[[Sarah Chen|Sarah Chen]]');
    });

    it('should match word boundaries only', () => {
      const text = 'The API documentation is at API.md and myAPI.';
      const result = autoLinker.processText(text);

      // Should link standalone "API" but not "myAPI"
      const linkCount = (result.linkedText.match(/\[\[API\]\]/g) || []).length;
      expect(linkCount).toBe(1);
      expect(result.linkedText).toContain('myAPI'); // No link
    });

    it('should not link inside existing wiki-links', () => {
      const text = 'See [[Sarah Chen Notes]] for details about Sarah Chen.';
      const result = autoLinker.processText(text);

      // Should not modify the existing link
      expect(result.linkedText).toContain('[[Sarah Chen Notes]]');
      
      // Should link the second occurrence
      expect(result.linkedText).toMatch(/\[\[Sarah Chen Notes\]\].*\[\[Sarah Chen\]\]/);
    });

    it('should not link inside markdown links', () => {
      const text = '[Sarah Chen Profile](https://example.com) and Sarah Chen.';
      const result = autoLinker.processText(text);

      // Should not modify the markdown link
      expect(result.linkedText).toContain('[Sarah Chen Profile](https://example.com)');
      
      // Should link the second occurrence
      expect(result.linkedText.match(/\[\[Sarah Chen\]\]/g)?.length).toBe(1);
    });

    it('should prefer longer matches', () => {
      // Clear and set up overlapping terms
      (app.vault as any)._clear();
      (app.vault as any)._setFile('Phoenix.md', '# Phoenix');
      (app.vault as any)._setFile('Project Phoenix.md', '# Project Phoenix');
      
      vaultIndex.buildIndex();
      const text = 'Working on Project Phoenix today.';
      const result = autoLinker.processText(text);

      // Should link to "Project Phoenix" not just "Phoenix"
      expect(result.linkedText).toContain('[[Project Phoenix]]');
      expect(result.linkedText).not.toContain('[[Phoenix]]');
    });

    it('should handle ambiguous matches', async () => {
      // Clear and add ambiguous terms
      (app.vault as any)._clear();
      (app.vault as any)._setFile('People/John.md', '# John');
      (app.vault as any)._setFile('Projects/John.md', '# John Project');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3);

      const text = 'John is working on the project.';
      const result = autoLinker.processText(text);

      // Should not auto-link ambiguous term
      expect(result.linkedText).not.toContain('[[John]]');
      
      // Should provide suggestions
      expect(result.suggestedLinks.length).toBeGreaterThan(0);
      const johnSuggestion = result.suggestedLinks.find(s => s.term === 'John');
      expect(johnSuggestion).toBeDefined();
      expect(johnSuggestion?.candidates).toHaveLength(2);
    });

    it('should skip terms with too many ambiguous matches', async () => {
      // Clear and add many ambiguous terms
      (app.vault as any)._clear();
      (app.vault as any)._setFile('A/Test.md', '# Test');
      (app.vault as any)._setFile('B/Test.md', '# Test');
      (app.vault as any)._setFile('C/Test.md', '# Test');
      (app.vault as any)._setFile('D/Test.md', '# Test');
      (app.vault as any)._setFile('E/Test.md', '# Test');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3); // Max 3 suggestions

      const text = 'This is a test.';
      const result = autoLinker.processText(text);

      // Should not link or suggest (too many matches)
      expect(result.linkedText).not.toContain('[[test]]');
      expect(result.suggestedLinks.length).toBe(0);
    });

    it('should handle empty text', () => {
      const result = autoLinker.processText('');
      
      expect(result.linkedText).toBe('');
      expect(result.suggestedLinks).toEqual([]);
    });

    it('should handle text with no matches', () => {
      const text = 'This text has no matching terms at all.';
      const result = autoLinker.processText(text);
      
      expect(result.linkedText).toBe(text);
      expect(result.suggestedLinks).toEqual([]);
    });

    it('should not link very short terms', () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('AB.md', '# AB');
      
      vaultIndex.buildIndex();
      const text = 'AB testing is important.';
      const result = autoLinker.processText(text);

      // Terms less than 3 characters should be skipped
      expect(result.linkedText).toBe(text);
    });
  });

  describe('suggested links deduplication', () => {
    it('should not duplicate suggested links', async () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('People/John.md', '# John');
      (app.vault as any)._setFile('Projects/John.md', '# John');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3);

      const text = 'John mentioned John several times.';
      const result = autoLinker.processText(text);

      // Should only have one suggestion for "John" despite multiple occurrences
      const johnSuggestions = result.suggestedLinks.filter(
        s => s.term.toLowerCase() === 'john'
      );
      expect(johnSuggestions).toHaveLength(1);
    });
  });

  describe('setMaxMatches', () => {
    it('should update max matches threshold', async () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('A/Test.md', '# Test');
      (app.vault as any)._setFile('B/Test.md', '# Test');
      (app.vault as any)._setFile('C/Test.md', '# Test');
      (app.vault as any)._setFile('D/Test.md', '# Test');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 2); // Max 2

      let text = 'This is a test.';
      let result = autoLinker.processText(text);
      
      // Should skip (4 matches > 2 max)
      expect(result.suggestedLinks.length).toBe(0);

      // Increase threshold
      autoLinker.setMaxMatches(5);
      result = autoLinker.processText(text);
      
      // Should now suggest
      expect(result.suggestedLinks.length).toBeGreaterThan(0);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple links in one sentence', () => {
      const text = 'Sarah Chen and API work on Project Phoenix together.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Sarah Chen]]');
      expect(result.linkedText).toContain('[[API]]');
      expect(result.linkedText).toContain('[[Project Phoenix]]');
    });

    it('should handle adjacent terms', async () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('API.md', '# API');
      (app.vault as any)._setFile('Documentation.md', '# Documentation');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3);

      const text = 'API Documentation is ready.';
      const result = autoLinker.processText(text);

      // Should link both terms
      expect(result.linkedText).toContain('[[API]]');
      expect(result.linkedText).toContain('[[Documentation]]');
    });

    it('should preserve punctuation and spacing', () => {
      const text = 'Hello, Sarah Chen! How is Project Phoenix?';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('Hello, [[Sarah Chen]]!');
      expect(result.linkedText).toContain('[[Project Phoenix]]?');
    });

    it('should handle terms at start and end of text', () => {
      const text = 'Sarah Chen works on projects like Project Phoenix';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Sarah Chen]]');
      expect(result.linkedText).toContain('[[Project Phoenix]]');
    });
  });

  describe('edge cases with special characters', () => {
    it('should handle terms with special regex characters', async () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('C++.md', '# C++');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3);

      const text = 'Learning C++ programming.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[C++]]');
    });

    it('should handle terms with hyphens', async () => {
      (app.vault as any)._clear();
      (app.vault as any)._setFile('Test-Driven-Development.md', '# TDD');
      
      vaultIndex.buildIndex();
      autoLinker = new AutoLinker(vaultIndex, 3);

      const text = 'Use Test-Driven-Development for quality.';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toContain('[[Test-Driven-Development]]');
    });
  });

  describe('performance considerations', () => {
    it('should handle large text efficiently', async () => {
      const text = 'Sarah Chen '.repeat(100) + 'Project Phoenix';
      
      const startTime = Date.now();
      const result = autoLinker.processText(text);
      const elapsed = Date.now() - startTime;

      // Should complete in reasonable time (< 100ms for this size)
      expect(elapsed).toBeLessThan(100);
      
      // Should still only link first occurrence
      const sarahCount = (result.linkedText.match(/\[\[Sarah Chen\]\]/g) || []).length;
      expect(sarahCount).toBe(1);
    });
  });

  describe('link format', () => {
    it('should use display text format when case differs', () => {
      const text = 'SARAH CHEN';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toBe('[[Sarah Chen|SARAH CHEN]]');
    });

    it('should use simple format when case matches exactly', () => {
      const text = 'Sarah Chen';
      const result = autoLinker.processText(text);

      expect(result.linkedText).toBe('[[Sarah Chen]]');
    });

    it('should use simple format for case-insensitive match', () => {
      const text = 'sarah chen';
      const result = autoLinker.processText(text);

      // When original text is all lowercase, use display text
      expect(result.linkedText).toBe('[[Sarah Chen|sarah chen]]');
    });
  });
});

