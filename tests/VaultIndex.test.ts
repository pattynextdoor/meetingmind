/**
 * Tests for VaultIndex service
 */

import { VaultIndexService } from '../src/services/VaultIndex';
import { App, Vault, MetadataCache, TFile } from 'obsidian';

describe('VaultIndexService', () => {
  let app: App;
  let vaultIndex: VaultIndexService;

  beforeEach(() => {
    app = new App();
    vaultIndex = new VaultIndexService(app);
    
    // Clear mocks
    (app.vault as any)._clear();
    (app.metadataCache as any)._clear();
  });

  describe('buildIndex', () => {
    it('should index note titles', async () => {
      const file = (app.vault as any)._setFile('Notes/Project Phoenix.md', '# Content');

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('project phoenix')).toBe('Notes/Project Phoenix.md');
    });

    it('should index explicit aliases', async () => {
      const file = (app.vault as any)._setFile('Notes/John Smith.md', '# Content');
      
      (app.metadataCache as any)._setCache('Notes/John Smith.md', {
        frontmatter: {
          aliases: ['John', 'J. Smith'],
        },
      });

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('john')).toBe('Notes/John Smith.md');
      expect(vaultIndex.lookupExact('j. smith')).toBe('Notes/John Smith.md');
      expect(vaultIndex.lookupExact('john smith')).toBe('Notes/John Smith.md');
    });

    it('should handle string alias in frontmatter', async () => {
      const file = (app.vault as any)._setFile('Notes/Test.md', '# Content');
      
      (app.metadataCache as any)._setCache('Notes/Test.md', {
        frontmatter: {
          aliases: 'SingleAlias',
        },
      });

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('singlealias')).toBe('Notes/Test.md');
    });

    it('should generate implicit aliases for multi-word titles', async () => {
      const file = (app.vault as any)._setFile('Notes/Project Phoenix Team.md', '# Content');

      vaultIndex.configure([], true);
      vaultIndex.buildIndex();

      // Words longer than 3 characters should be indexed
      expect(vaultIndex.hasMatches('project')).toBe(true);
      expect(vaultIndex.hasMatches('phoenix')).toBe(true);
      expect(vaultIndex.hasMatches('team')).toBe(true);
    });

    it('should not generate implicit aliases when disabled', async () => {
      const file = (app.vault as any)._setFile('Notes/Project Phoenix.md', '# Content');

      vaultIndex.configure([], false);
      vaultIndex.buildIndex();

      // Full title should be indexed
      expect(vaultIndex.lookupExact('project phoenix')).toBe('Notes/Project Phoenix.md');
      
      // Individual words should not be indexed as separate terms
      expect(vaultIndex.lookupExact('project')).toBeNull();
    });

    it('should exclude configured folders', async () => {
      (app.vault as any)._setFile('Notes/Valid.md', '# Content');
      (app.vault as any)._setFile('Archive/Old.md', '# Content');
      (app.vault as any)._setFile('Templates/Template.md', '# Content');

      vaultIndex.configure(['Archive', 'Templates'], true);
      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('valid')).toBe('Notes/Valid.md');
      expect(vaultIndex.lookupExact('old')).toBeNull();
      expect(vaultIndex.lookupExact('template')).toBeNull();
    });

    it('should handle ambiguous matches', async () => {
      (app.vault as any)._setFile('People/John.md', '# Content');
      (app.vault as any)._setFile('Projects/John.md', '# Content');

      vaultIndex.buildIndex();

      // Should be ambiguous
      expect(vaultIndex.lookupExact('john')).toBeNull();
      const ambiguous = vaultIndex.lookupAmbiguous('john');
      expect(ambiguous).toHaveLength(2);
      expect(ambiguous).toContain('People/John.md');
      expect(ambiguous).toContain('Projects/John.md');
    });

    it('should prefer longer explicit aliases', async () => {
      (app.vault as any)._setFile('Notes/Phoenix.md', '# Content');
      (app.vault as any)._setFile('Notes/Project Phoenix.md', '# Content');

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('project phoenix')).toBe('Notes/Project Phoenix.md');
      expect(vaultIndex.lookupExact('phoenix')).toBeNull(); // Ambiguous
    });

    it('should handle case-insensitive matching', async () => {
      (app.vault as any)._setFile('Notes/Test Note.md', '# Content');

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('test note')).toBe('Notes/Test Note.md');
      expect(vaultIndex.lookupExact('TEST NOTE')).toBe('Notes/Test Note.md');
      expect(vaultIndex.lookupExact('Test Note')).toBe('Notes/Test Note.md');
    });
  });

  describe('lookupExact', () => {
    beforeEach(async () => {
      (app.vault as any)._setFile('Notes/Project Phoenix.md', '# Content');
      (app.vault as any)._setFile('People/Sarah Chen.md', '# Content');
      vaultIndex.buildIndex();
    });

    it('should return path for exact matches', () => {
      expect(vaultIndex.lookupExact('project phoenix')).toBe('Notes/Project Phoenix.md');
      expect(vaultIndex.lookupExact('sarah chen')).toBe('People/Sarah Chen.md');
    });

    it('should return null for non-existent terms', () => {
      expect(vaultIndex.lookupExact('nonexistent')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(vaultIndex.lookupExact('PROJECT PHOENIX')).toBe('Notes/Project Phoenix.md');
    });
  });

  describe('lookupAmbiguous', () => {
    beforeEach(async () => {
      (app.vault as any)._setFile('People/John.md', '# Content');
      (app.vault as any)._setFile('Projects/John.md', '# Content');
      vaultIndex.buildIndex();
    });

    it('should return all matching paths', () => {
      const results = vaultIndex.lookupAmbiguous('john');
      expect(results).toHaveLength(2);
      expect(results).toContain('People/John.md');
      expect(results).toContain('Projects/John.md');
    });

    it('should return empty array for non-ambiguous terms', () => {
      expect(vaultIndex.lookupAmbiguous('nonexistent')).toEqual([]);
    });
  });

  describe('hasMatches', () => {
    beforeEach(async () => {
      (app.vault as any)._setFile('Notes/Project Phoenix.md', '# Content');
      (app.vault as any)._setFile('People/John.md', '# Content');
      (app.vault as any)._setFile('Projects/John.md', '# Content');
      vaultIndex.buildIndex();
    });

    it('should return true for exact matches', () => {
      expect(vaultIndex.hasMatches('project phoenix')).toBe(true);
    });

    it('should return true for ambiguous matches', () => {
      expect(vaultIndex.hasMatches('john')).toBe(true);
    });

    it('should return false for non-existent terms', () => {
      expect(vaultIndex.hasMatches('nonexistent')).toBe(false);
    });
  });

  describe('getSortedTerms', () => {
    beforeEach(async () => {
      (app.vault as any)._setFile('Notes/A.md', '# Content');
      (app.vault as any)._setFile('Notes/BB.md', '# Content');
      (app.vault as any)._setFile('Notes/CCC.md', '# Content');
      vaultIndex.buildIndex();
    });

    it('should return terms sorted by length descending', () => {
      const terms = vaultIndex.getSortedTerms();
      
      expect(terms.length).toBeGreaterThan(0);
      
      // Check that terms are sorted by length descending
      for (let i = 0; i < terms.length - 1; i++) {
        expect(terms[i].length).toBeGreaterThanOrEqual(terms[i + 1].length);
      }
    });

    it('should include both exact and ambiguous matches', async () => {
      // Clear and rebuild with specific scenario
      (app.vault as any)._clear();
      (app.vault as any)._setFile('Notes/Unique.md', '# Content');
      (app.vault as any)._setFile('Notes/John.md', '# Content');
      (app.vault as any)._setFile('People/John.md', '# Content');
      vaultIndex.buildIndex();

      const terms = vaultIndex.getSortedTerms();
      
      expect(terms).toContain('unique'); // exact match
      expect(terms).toContain('john'); // ambiguous match
    });
  });

  describe('getNoteName', () => {
    it('should extract basename from path', () => {
      expect(vaultIndex.getNoteName('Notes/Project Phoenix.md')).toBe('Project Phoenix');
      expect(vaultIndex.getNoteName('People/Sarah Chen.md')).toBe('Sarah Chen');
      expect(vaultIndex.getNoteName('Simple.md')).toBe('Simple');
    });

    it('should handle paths without .md extension', () => {
      expect(vaultIndex.getNoteName('Notes/File')).toBe('File');
    });
  });

  describe('edge cases', () => {
    it('should handle empty vault', async () => {
      vaultIndex.buildIndex();

      expect(vaultIndex.getSortedTerms()).toEqual([]);
      expect(vaultIndex.lookupExact('anything')).toBeNull();
    });

    it('should handle notes with special characters', async () => {
      (app.vault as any)._setFile('Notes/Test-Note_123.md', '# Content');

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('test-note_123')).toBe('Notes/Test-Note_123.md');
    });

    it('should filter out short implicit aliases', async () => {
      (app.vault as any)._setFile('Notes/A B C Test.md', '# Content');

      vaultIndex.configure([], true);
      vaultIndex.buildIndex();

      // Short words (3 chars or less) should not be indexed as implicit aliases
      expect(vaultIndex.lookupExact('a')).toBeNull();
      expect(vaultIndex.lookupExact('b')).toBeNull();
      expect(vaultIndex.lookupExact('c')).toBeNull();
      
      // Longer word should be indexed
      expect(vaultIndex.hasMatches('test')).toBe(true);
    });

    it('should handle empty and whitespace-only aliases', async () => {
      const file = (app.vault as any)._setFile('Notes/Test.md', '# Content');
      
      (app.metadataCache as any)._setCache('Notes/Test.md', {
        frontmatter: {
          aliases: ['Valid', '', '   ', 'Another'],
        },
      });

      vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('valid')).toBe('Notes/Test.md');
      expect(vaultIndex.lookupExact('another')).toBe('Notes/Test.md');
      expect(vaultIndex.lookupExact('test')).toBe('Notes/Test.md');
    });
  });

  describe('configure', () => {
    it('should update excluded folders', async () => {
      (app.vault as any)._setFile('Archive/Test.md', '# Content');

      vaultIndex.configure([], true);
      vaultIndex.buildIndex();
      expect(vaultIndex.lookupExact('test')).toBe('Archive/Test.md');

      vaultIndex.configure(['Archive'], true);
      vaultIndex.buildIndex();
      expect(vaultIndex.lookupExact('test')).toBeNull();
    });

    it('should toggle implicit alias generation', async () => {
      (app.vault as any)._setFile('Notes/Multi Word Title.md', '# Content');

      vaultIndex.configure([], true);
      vaultIndex.buildIndex();
      expect(vaultIndex.hasMatches('multi')).toBe(true);

      vaultIndex.configure([], false);
      vaultIndex.buildIndex();
      expect(vaultIndex.lookupExact('multi')).toBeNull();
    });
  });
});

