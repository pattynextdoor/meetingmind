/**
 * NoteGenerator - Generate formatted Markdown notes from processed meetings
 */

import { App, TFile, normalizePath } from 'obsidian';
import { ProcessedMeeting, RawTranscript, AIEnrichment, SuggestedLink, ActionItem } from '../types';
import { TranscriptParser } from './TranscriptParser';

export class NoteGenerator {
  private app: App;
  private outputFolder: string;
  private filenameTemplate: string;
  private parser: TranscriptParser;
  
  constructor(app: App) {
    this.app = app;
    this.outputFolder = 'Meetings';
    this.filenameTemplate = 'YYYY-MM-DD Meeting Title';
    this.parser = new TranscriptParser();
  }
  
  /**
   * Configure output settings
   */
  configure(outputFolder: string, filenameTemplate: string): void {
    this.outputFolder = outputFolder;
    this.filenameTemplate = filenameTemplate;
  }
  
  /**
   * Generate a note from a processed meeting
   */
  async generateNote(meeting: ProcessedMeeting): Promise<TFile> {
    const content = this.buildNoteContent(meeting);
    const filename = this.generateFilename(meeting.transcript);
    const filepath = normalizePath(`${this.outputFolder}/${filename}`);
    
    // Ensure output folder exists
    await this.ensureFolder(this.outputFolder);
    
    // Handle filename collisions
    const finalPath = await this.resolveFilenameCollision(filepath, content);
    
    // Create the note
    const file = await this.app.vault.create(finalPath, content);
    
    console.log(`MeetingMind: Created note at ${finalPath}`);
    return file;
  }
  
  /**
   * Build the complete note content
   */
  buildNoteContent(meeting: ProcessedMeeting): string {
    const sections: string[] = [];
    
    // Frontmatter
    sections.push(this.buildFrontmatter(meeting));
    
    // Summary (if AI enrichment available)
    if (meeting.enrichment?.summary) {
      sections.push(this.buildSummarySection(meeting.enrichment.summary));
    }
    
    // Action Items
    if (meeting.enrichment?.actionItems && meeting.enrichment.actionItems.length > 0) {
      sections.push(this.buildActionItemsSection(meeting.enrichment.actionItems));
    }
    
    // Decisions
    if (meeting.enrichment?.decisions && meeting.enrichment.decisions.length > 0) {
      sections.push(this.buildDecisionsSection(meeting.enrichment.decisions));
    }
    
    // Transcript
    sections.push(this.buildTranscriptSection(meeting.transcript));
    
    // Suggested Links
    if (meeting.suggestedLinks && meeting.suggestedLinks.length > 0) {
      sections.push(this.buildSuggestedLinksSection(meeting.suggestedLinks));
    }
    
    return sections.join('\n\n');
  }
  
  /**
   * Build YAML frontmatter
   */
  private buildFrontmatter(meeting: ProcessedMeeting): string {
    const { transcript, enrichment } = meeting;
    
    const frontmatter: Record<string, any> = {
      date: this.formatDateISO(transcript.date),
      duration: transcript.duration,
      attendees: transcript.participants.map(p => `"[[${p}]]"`),
      source: transcript.source,
    };
    
    // Add tags if available
    if (enrichment?.suggestedTags && enrichment.suggestedTags.length > 0) {
      frontmatter.tags = enrichment.suggestedTags;
    }
    
    // Build YAML
    let yaml = '---\n';
    
    for (const [key, value] of Object.entries(frontmatter)) {
      if (Array.isArray(value)) {
        yaml += `${key}:\n`;
        for (const item of value) {
          yaml += `  - ${item}\n`;
        }
      } else {
        yaml += `${key}: ${value}\n`;
      }
    }
    
    yaml += '---';
    return yaml;
  }
  
  /**
   * Build summary section
   */
  private buildSummarySection(summary: string): string {
    return `## Summary\n\n${summary}`;
  }
  
  /**
   * Build action items section
   */
  private buildActionItemsSection(actionItems: ActionItem[]): string {
    let section = '## Action Items\n\n';
    
    for (const item of actionItems) {
      let task = `- [ ] ${item.task}`;
      
      const metadata: string[] = [];
      if (item.assignee) {
        metadata.push(`@${item.assignee}`);
      }
      if (item.dueDate) {
        metadata.push(`due: ${item.dueDate}`);
      }
      
      if (metadata.length > 0) {
        task += ` (${metadata.join(', ')})`;
      }
      
      section += task + '\n';
    }
    
    return section.trim();
  }
  
  /**
   * Build decisions section
   */
  private buildDecisionsSection(decisions: string[]): string {
    let section = '## Decisions\n\n';
    
    for (const decision of decisions) {
      section += `- ${decision}\n`;
    }
    
    return section.trim();
  }
  
  /**
   * Build transcript section with collapsible callout
   */
  private buildTranscriptSection(transcript: RawTranscript): string {
    const totalDuration = transcript.duration * 60; // Convert to seconds
    
    let section = '## Transcript\n\n';
    section += '> [!note]- Full transcript (click to expand)\n>\n';
    
    for (const segment of transcript.segments) {
      const timestamp = this.parser.formatTimestamp(segment.timestamp, totalDuration);
      const speaker = segment.speaker ? `**${segment.speaker}**` : '';
      
      // Format: > **Speaker** (00:00): Text
      if (speaker) {
        section += `> ${speaker} (${timestamp}): ${segment.text}\n`;
      } else {
        section += `> (${timestamp}): ${segment.text}\n`;
      }
    }
    
    return section.trim();
  }
  
  /**
   * Build suggested links section
   */
  private buildSuggestedLinksSection(suggestedLinks: SuggestedLink[]): string {
    let section = '## Suggested Links\n\n';
    section += '*The following terms might refer to existing notes:*\n\n';
    
    for (const suggestion of suggestedLinks) {
      const candidates = suggestion.candidates.map(c => `[[${c}]]`).join(', ');
      section += `- **"${suggestion.term}"** might refer to: ${candidates}\n`;
    }
    
    return section.trim();
  }
  
  /**
   * Generate filename from template and meeting data
   */
  private generateFilename(transcript: RawTranscript): string {
    const date = transcript.date;
    const title = this.sanitizeFilename(transcript.title);
    
    let filename = this.filenameTemplate
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('Meeting Title', title)
      .replace('Title', title);
    
    // Ensure .md extension
    if (!filename.endsWith('.md')) {
      filename += '.md';
    }
    
    return filename;
  }
  
  /**
   * Sanitize filename to be safe across all platforms
   */
  private sanitizeFilename(name: string): string {
    // Remove or replace characters that are invalid in filenames
    return name
      .replace(/[<>:"/\\|?*]/g, '') // Windows invalid chars
      .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Control characters
      .replace(/^\.+/, '') // Leading dots
      .replace(/\.+$/, '') // Trailing dots
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .trim()
      .substring(0, 200); // Limit length
  }
  
  /**
   * Format date to ISO format (YYYY-MM-DD)
   */
  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Ensure a folder exists, creating it if necessary
   */
  private async ensureFolder(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);
    
    if (!folder) {
      try {
        await this.app.vault.createFolder(normalizedPath);
        console.log(`MeetingMind: Created folder ${normalizedPath}`);
      } catch (e) {
        // Folder might already exist or there's a race condition
        console.log(`MeetingMind: Folder ${normalizedPath} may already exist`);
      }
    }
  }
  
  /**
   * Resolve filename collision by appending numbers
   */
  private async resolveFilenameCollision(filepath: string, newContent: string): Promise<string> {
    let finalPath = filepath;
    let counter = 1;
    
    while (true) {
      const existingFile = this.app.vault.getAbstractFileByPath(finalPath);
      
      if (!existingFile) {
        // No collision
        break;
      }
      
      // File exists - check if it's the same content (duplicate)
      if (existingFile instanceof TFile) {
        const existingContent = await this.app.vault.read(existingFile);
        
        // If content is similar (same transcript), don't create duplicate
        if (this.isSimilarContent(existingContent, newContent)) {
          throw new Error(`Duplicate note already exists at ${finalPath}`);
        }
      }
      
      // Different content - append counter
      counter++;
      const basePath = filepath.replace(/\.md$/, '');
      finalPath = `${basePath} (${counter}).md`;
    }
    
    return finalPath;
  }
  
  /**
   * Check if two note contents are similar (same transcript)
   */
  private isSimilarContent(content1: string, content2: string): boolean {
    // Extract transcript sections and compare
    const transcript1 = this.extractTranscriptText(content1);
    const transcript2 = this.extractTranscriptText(content2);
    
    if (!transcript1 || !transcript2) {
      return false;
    }
    
    // Simple similarity check - compare normalized text
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    return normalize(transcript1) === normalize(transcript2);
  }
  
  /**
   * Extract transcript text from note content
   */
  private extractTranscriptText(content: string): string | null {
    const match = content.match(/## Transcript\n\n[\s\S]*?> \[\!note\][^\n]*\n([\s\S]*?)(?=\n## |$)/);
    return match ? match[1] : null;
  }
  
  /**
   * Apply auto-links to a text section
   */
  applyAutoLinks(text: string, links: Map<string, string>): string {
    let result = text;
    
    // Sort links by term length (longest first) to avoid partial replacements
    const sortedEntries = Array.from(links.entries()).sort((a, b) => b[0].length - a[0].length);
    
    for (const [term, notePath] of sortedEntries) {
      const noteName = notePath.replace(/\.md$/, '').split('/').pop() || notePath;
      
      // Create word boundary regex
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      
      // Only replace first occurrence
      let replaced = false;
      result = result.replace(regex, (match) => {
        if (replaced) return match;
        replaced = true;
        
        // Use display text if different case
        if (match.toLowerCase() === noteName.toLowerCase()) {
          return `[[${noteName}]]`;
        }
        return `[[${noteName}|${match}]]`;
      });
    }
    
    return result;
  }
}

