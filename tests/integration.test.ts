/**
 * Integration Tests - Testing services working together
 */

import { App } from 'obsidian';
import { TranscriptParser } from '../src/services/TranscriptParser';
import { VaultIndexService } from '../src/services/VaultIndex';
import { AutoLinker } from '../src/services/AutoLinker';
import { NoteGenerator } from '../src/services/NoteGenerator';
import { ProcessedMeeting } from '../src/types';

describe('Integration Tests', () => {
  let app: App;
  let parser: TranscriptParser;
  let vaultIndex: VaultIndexService;
  let autoLinker: AutoLinker;
  let noteGenerator: NoteGenerator;

  beforeEach(async () => {
    app = new App();
    parser = new TranscriptParser();
    vaultIndex = new VaultIndexService(app);
    autoLinker = new AutoLinker(vaultIndex, 3);
    noteGenerator = new NoteGenerator(app);

    // Clear mocks
    (app.vault as any)._clear();
    (app.metadataCache as any)._clear();
  });

  describe('End-to-end transcript processing', () => {
    it('should process VTT file and create note with auto-linking', async () => {
      // Set up vault with existing notes
      (app.vault as any)._setFile('People/Sarah Chen.md', '# Sarah');
      (app.vault as any)._setFile('Projects/Phoenix.md', '# Project Phoenix');
      await vaultIndex.buildIndex();

      // Parse a transcript
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
<v Sarah Chen>Let's discuss Project Phoenix status.

00:00:06.000 --> 00:00:10.000
<v John>Great, I'll update the documentation.`;

      const transcript = await parser.parseFile(vttContent, '2024-01-15-meeting.vtt');

      // Process text with auto-linking
      for (const segment of transcript.segments) {
        const result = autoLinker.processText(segment.text);
        segment.text = result.linkedText;
      }

      // Create processed meeting
      const meeting: ProcessedMeeting = {
        transcript,
        autoLinks: new Map(),
        suggestedLinks: [],
      };

      // Generate note
      const content = noteGenerator.buildNoteContent(meeting);

      // Verify auto-linking worked
      expect(content).toContain('[[Sarah Chen]]');
      expect(content).toContain('[[Phoenix]]');
      expect(content).toContain('date: 2024-01-15');
    });

    it('should handle JSON transcript with participants', async () => {
      // Set up vault
      (app.vault as any)._setFile('People/Alice.md', '# Alice');
      (app.vault as any)._setFile('People/Bob.md', '# Bob');
      await vaultIndex.buildIndex();

      // Parse JSON transcript
      const jsonContent = JSON.stringify({
        transcripts: [
          { speaker: 'Alice', start_time: 0, end_time: 5, text: 'Hello Bob' },
          { speaker: 'Bob', start_time: 6, end_time: 10, text: 'Hi Alice' },
        ],
        speakers: ['Alice', 'Bob'],
      });

      const transcript = await parser.parseFile(jsonContent, 'meeting.json');

      // Process with auto-linking
      for (const segment of transcript.segments) {
        const result = autoLinker.processText(segment.text);
        segment.text = result.linkedText;
      }

      const meeting: ProcessedMeeting = {
        transcript,
        autoLinks: new Map(),
        suggestedLinks: [],
      };

      const content = noteGenerator.buildNoteContent(meeting);

      // Verify participants are linked in frontmatter
      expect(content).toContain('- "[[Alice]]"');
      expect(content).toContain('- "[[Bob]]"');

      // Verify auto-linking in transcript
      expect(content).toContain('[[Bob]]');
      expect(content).toContain('[[Alice]]');
    });

    it('should suggest ambiguous links', async () => {
      // Set up vault with ambiguous terms
      (app.vault as any)._setFile('People/John.md', '# John');
      (app.vault as any)._setFile('Projects/John.md', '# John Project');
      await vaultIndex.buildIndex();

      // Parse transcript
      const txtContent = 'Alice: John mentioned the API issues.';
      const transcript = await parser.parseFile(txtContent, 'meeting.txt');

      // Process with auto-linking
      const suggestedLinks = [];
      for (const segment of transcript.segments) {
        const result = autoLinker.processText(segment.text);
        segment.text = result.linkedText;
        suggestedLinks.push(...result.suggestedLinks);
      }

      const meeting: ProcessedMeeting = {
        transcript,
        autoLinks: new Map(),
        suggestedLinks,
      };

      const content = noteGenerator.buildNoteContent(meeting);

      // Should include suggested links section
      expect(content).toContain('## Suggested Links');
      expect(content).toContain('"John"');
    });
  });

  describe('Vault index updates', () => {
    it('should rebuild index when new notes are added', async () => {
      // Initial index
      (app.vault as any)._setFile('First.md', '# First');
      await vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('first')).toBe('First.md');
      expect(vaultIndex.lookupExact('second')).toBeNull();

      // Add new note
      (app.vault as any)._setFile('Second.md', '# Second');
      await vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('first')).toBe('First.md');
      expect(vaultIndex.lookupExact('second')).toBe('Second.md');
    });

    it('should handle alias changes', async () => {
      // Initial setup
      (app.vault as any)._setFile('Person.md', '# John');
      (app.metadataCache as any)._setCache('Person.md', {
        frontmatter: { aliases: ['Johnny'] },
      });
      await vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('johnny')).toBe('Person.md');

      // Update aliases
      (app.metadataCache as any)._setCache('Person.md', {
        frontmatter: { aliases: ['Johnny', 'J.'] },
      });
      await vaultIndex.buildIndex();

      expect(vaultIndex.lookupExact('johnny')).toBe('Person.md');
      expect(vaultIndex.lookupExact('j.')).toBe('Person.md');
    });
  });

  describe('Complex auto-linking scenarios', () => {
    it('should handle nested links correctly', async () => {
      (app.vault as any)._setFile('API.md', '# API');
      (app.vault as any)._setFile('REST.md', '# REST');
      (app.vault as any)._setFile('REST API.md', '# REST API');
      await vaultIndex.buildIndex();

      const text = 'The REST API documentation needs updating.';
      const result = autoLinker.processText(text);

      // Should prefer longer match
      expect(result.linkedText).toContain('[[REST API]]');
    });

    it('should preserve existing links', async () => {
      (app.vault as any)._setFile('Project.md', '# Project');
      await vaultIndex.buildIndex();

      const text = 'See [[Project Notes]] about the Project status.';
      const result = autoLinker.processText(text);

      // Should not break existing link
      expect(result.linkedText).toContain('[[Project Notes]]');
      // Should link second occurrence
      expect(result.linkedText).toContain('[[Project]]');
    });
  });

  describe('Full workflow simulation', () => {
    it('should simulate complete meeting import workflow', async () => {
      // 1. Set up vault
      (app.vault as any)._setFile('People/Sarah.md', '# Sarah');
      (app.vault as any)._setFile('Projects/Phoenix.md', '# Phoenix');
      (app.vault as any)._setFile('Topics/API Design.md', '# API Design');
      await vaultIndex.buildIndex();

      // 2. Import transcript
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
<v Sarah>We need to discuss the Phoenix project and API Design.

00:00:06.000 --> 00:00:10.000
<v John>I agree. The API Design looks solid.`;

      const transcript = await parser.parseFile(vttContent, '2024-01-15-standup.vtt');

      // 3. Apply auto-linking
      const allSuggestedLinks = [];
      for (const segment of transcript.segments) {
        const result = autoLinker.processText(segment.text);
        segment.text = result.linkedText;
        allSuggestedLinks.push(...result.suggestedLinks);
      }

      // 4. Create meeting object
      const meeting: ProcessedMeeting = {
        transcript,
        autoLinks: new Map(),
        suggestedLinks: allSuggestedLinks,
      };

      // 5. Generate note
      const content = noteGenerator.buildNoteContent(meeting);

      // 6. Verify everything worked
      expect(content).toContain('[[Sarah]]');
      expect(content).toContain('[[Phoenix]]');
      expect(content).toContain('[[API Design]]');
      expect(content).toContain('date: 2024-01-15');
      expect(content).toContain('## Transcript');

      // Verify frontmatter
      expect(content).toMatch(/^---\n/);
      expect(content).toContain('duration:');
    });
  });

  describe('Performance considerations', () => {
    it('should handle large vault efficiently', async () => {
      // Create many notes
      for (let i = 0; i < 100; i++) {
        (app.vault as any)._setFile(`Note${i}.md`, `# Note ${i}`);
      }

      const startTime = Date.now();
      await vaultIndex.buildIndex();
      const elapsed = Date.now() - startTime;

      // Should complete in reasonable time (< 1 second for 100 notes)
      expect(elapsed).toBeLessThan(1000);
      expect(vaultIndex.getSortedTerms().length).toBeGreaterThan(0);
    });

    it('should handle long transcripts efficiently', async () => {
      // Create a transcript with many segments
      const segments = [];
      for (let i = 0; i < 100; i++) {
        segments.push(`00:${String(i).padStart(2, '0')}:00.000 --> 00:${String(i).padStart(2, '0')}:05.000`);
        segments.push(`Segment ${i} with some content`);
        segments.push('');
      }

      const vttContent = 'WEBVTT\n\n' + segments.join('\n');

      const startTime = Date.now();
      const transcript = await parser.parseFile(vttContent, 'long-meeting.vtt');
      const elapsed = Date.now() - startTime;

      // Should complete in reasonable time
      expect(elapsed).toBeLessThan(500);
      expect(transcript.segments.length).toBeGreaterThan(0);
    });
  });
});

