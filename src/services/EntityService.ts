/**
 * EntityService - Auto-create and update notes for issues, updates, and topics
 */

import { App, TFile, normalizePath } from 'obsidian';
import { Entity, EntityExtraction } from '../types';
import { AIService } from './AIService';

export interface EntityInfo {
  entity: Entity;
  noteExists: boolean;
  notePath: string | null;
}

export class EntityService {
  private app: App;
  private aiService: AIService | null;
  private issuesFolder: string;
  private updatesFolder: string;
  private topicsFolder: string;
  private enableIssues: boolean;
  private enableTopics: boolean;
  private enrichManualNotes: boolean;
  
  constructor(app: App, aiService?: AIService) {
    this.app = app;
    this.aiService = aiService || null;
    this.issuesFolder = 'Issues';
    this.updatesFolder = 'Updates';
    this.topicsFolder = 'Topics';
    this.enableIssues = true;
    this.enableTopics = true;
    this.enrichManualNotes = false;
  }
  
  /**
   * Set the AI service for synthesis operations
   */
  setAIService(aiService: AIService): void {
    this.aiService = aiService;
  }
  
  /**
   * Configure entity extraction settings
   */
  configure(
    issuesFolder: string,
    updatesFolder: string,
    topicsFolder: string,
    enableIssues: boolean,
    enableTopics: boolean,
    enrichManualNotes: boolean
  ): void {
    this.issuesFolder = issuesFolder;
    this.updatesFolder = updatesFolder;
    this.topicsFolder = topicsFolder;
    this.enableIssues = enableIssues;
    this.enableTopics = enableTopics;
    this.enrichManualNotes = enrichManualNotes;
  }
  
  /**
   * Get all existing entities from the vault
   * Returns a list of entities with their current status
   */
  async getExistingEntities(): Promise<Array<{ name: string; type: 'issue' | 'update' | 'topic'; currentStatus?: string; path: string }>> {
    const entities: Array<{ name: string; type: 'issue' | 'update' | 'topic'; currentStatus?: string; path: string }> = [];
    const folders = [];
    if (this.enableIssues && this.issuesFolder) folders.push({ path: this.issuesFolder, type: 'issue' as const });
    if (this.enableTopics && this.topicsFolder) folders.push({ path: this.topicsFolder, type: 'topic' as const });
    
    for (const folder of folders) {
      try {
        const folderFile = this.app.vault.getAbstractFileByPath(folder.path);
        if (!folderFile) continue;
        
        const files = this.app.vault.getMarkdownFiles().filter(file => 
          file.path.startsWith(folder.path + '/')
        );
        
        for (const file of files) {
          try {
            const content = await this.app.vault.read(file);
            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;
            
            // Extract status from frontmatter or content
            let status: string | undefined;
            if (frontmatter?.status) {
              status = frontmatter.status;
            } else {
              // Try to parse from content
              const statusMatch = content.match(/^## Status\s*$\n\n(.+?)(?=\n## |$)/m);
              if (statusMatch) {
                status = statusMatch[1].trim();
              }
            }
            
            entities.push({
              name: file.basename,
              type: folder.type,
              currentStatus: status,
              path: file.path,
            });
          } catch (error) {
            console.error(`MeetingMind: Failed to read entity file ${file.path}`, error);
          }
        }
      } catch (error) {
        console.error(`MeetingMind: Failed to read entity folder ${folder.path}`, error);
      }
    }
    
    return entities;
  }
  
  /**
   * Update entity status based on status change analysis
   */
  async updateEntityStatus(
    entityPath: string,
    newStatus: 'resolved' | 'completed' | 'stale' | 'in-progress' | 'blocked',
    reason?: string
  ): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(entityPath);
    if (!(file instanceof TFile)) return;
    
    try {
      let content = await this.app.vault.read(file);
      
      // Update status in frontmatter if it exists
      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;
      
      if (frontmatter) {
        // Update frontmatter status
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/m;
        const frontmatterMatch = content.match(frontmatterRegex);
        if (frontmatterMatch) {
          let frontmatterContent = frontmatterMatch[1];
          
          // Update or add status field
          if (frontmatterContent.includes('status:')) {
            frontmatterContent = frontmatterContent.replace(/status:\s*.+/, `status: ${newStatus}`);
          } else {
            frontmatterContent += `\nstatus: ${newStatus}`;
          }
          
          content = content.replace(frontmatterRegex, `---\n${frontmatterContent}\n---\n\n`);
        }
      }
      
      // Update status section in content
      const statusSectionRegex = /^## Status\s*$\n\n(.+?)(?=\n## |$)/m;
      if (statusSectionRegex.test(content)) {
        let statusText = newStatus;
        if (reason) {
          statusText += ` — ${reason}`;
        }
        content = content.replace(statusSectionRegex, `## Status\n\n${statusText}\n`);
      } else {
        // Add status section after description
        const descIndex = content.indexOf('## Description');
        if (descIndex !== -1) {
          const descEnd = content.indexOf('\n\n', descIndex + 15);
          if (descEnd !== -1) {
            let statusText = newStatus;
            if (reason) {
              statusText += ` — ${reason}`;
            }
            content = content.slice(0, descEnd + 2) + 
              `## Status\n\n${statusText}\n\n` + 
              content.slice(descEnd + 2);
          }
        }
      }
      
      await this.app.vault.modify(file, content);
      console.debug(`MeetingMind: Updated entity status for ${entityPath} to ${newStatus}`);
    } catch (error) {
      console.error(`MeetingMind: Failed to update entity status for ${entityPath}`, error);
    }
  }
  
  /**
   * Process entities and create/update notes
   * Note: Updates are no longer created as separate notes, only used for People note enrichment
   */
  async processEntities(
    entities: EntityExtraction,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date
  ): Promise<{ created: string[]; updated: string[] }> {
    const created: string[] = [];
    const updated: string[] = [];
    
    // Process issues
    if (this.enableIssues && entities.issues.length > 0) {
      await this.ensureFolder(this.issuesFolder);
      for (const issue of entities.issues) {
        const existingPath = this.findEntityNote(issue);
        if (existingPath) {
          await this.updateEntityNote(existingPath, issue, meetingTitle, meetingPath, meetingDate);
          updated.push(issue.name);
        } else {
          const newPath = await this.createEntityNote(issue, this.issuesFolder, meetingTitle, meetingPath, meetingDate);
          if (newPath) {
            created.push(issue.name);
          }
        }
      }
    }
    
    // Updates are no longer created as separate notes
    // They are only used to enrich People notes
    
    // Process topics
    if (this.enableTopics && entities.topics.length > 0) {
      await this.ensureFolder(this.topicsFolder);
      for (const topic of entities.topics) {
        const existingPath = this.findEntityNote(topic);
        if (existingPath) {
          await this.updateEntityNote(existingPath, topic, meetingTitle, meetingPath, meetingDate);
          updated.push(topic.name);
        } else {
          const newPath = await this.createEntityNote(topic, this.topicsFolder, meetingTitle, meetingPath, meetingDate);
          if (newPath) {
            created.push(topic.name);
          }
        }
      }
    }
    
    return { created, updated };
  }
  
  /**
   * Find an existing note for an entity
   */
  private findEntityNote(entity: Entity): string | null {
    const folder = this.getFolderForType(entity.type);
    const possiblePaths = [
      `${folder}/${entity.name}.md`,
      `${entity.name}.md`,
    ];
    
    // First, check specific paths with type verification
    for (const path of possiblePaths) {
      const normalizedPath = normalizePath(path);
      const file = this.app.vault.getAbstractFileByPath(normalizedPath);
      if (file instanceof TFile) {
        // Verify it's the right type by checking frontmatter
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache?.frontmatter?.type === entity.type) {
          return normalizedPath;
        }
      }
    }
    
    // Search by name and type in frontmatter
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.type === entity.type && 
          file.basename.toLowerCase() === entity.name.toLowerCase()) {
        return file.path;
      }
    }
    
    // If enrichManualNotes is enabled, look for ANY note with this name (case-insensitive)
    // This allows enriching manually-created notes
    if (this.enrichManualNotes) {
      for (const file of files) {
        if (file.basename.toLowerCase() === entity.name.toLowerCase()) {
          console.debug(`MeetingMind: Found manually-created note for ${entity.name} at ${file.path}`);
          return file.path;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get folder path for entity type
   */
  private getFolderForType(type: 'issue' | 'update' | 'topic'): string {
    switch (type) {
      case 'issue':
        return this.issuesFolder;
      case 'update':
        return this.updatesFolder;
      case 'topic':
        return this.topicsFolder;
    }
  }
  
  /**
   * Create a new entity note
   */
  private async createEntityNote(
    entity: Entity,
    folder: string,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date
  ): Promise<string | null> {
    const fileName = `${entity.name}.md`;
    const filePath = normalizePath(`${folder}/${fileName}`);
    
    if (this.app.vault.getAbstractFileByPath(filePath)) {
      return null;
    }
    
    const content = this.generateEntityNote(entity, meetingTitle, meetingPath, meetingDate);
    
    try {
      await this.app.vault.create(filePath, content);
      console.debug(`MeetingMind: Created ${entity.type} note for ${entity.name}`);
      return filePath;
    } catch (error) {
      console.error(`MeetingMind: Failed to create note for ${entity.name}`, error);
      return null;
    }
  }
  
  /**
   * Generate content for a new entity note
   */
  private generateEntityNote(
    entity: Entity,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date
  ): string {
    const date = new Date().toISOString().split('T')[0];
    const meetingLink = meetingPath.replace(/\.md$/, '');
    const meetingDateStr = meetingDate.toISOString().split('T')[0];
    
    // Build frontmatter
    let frontmatter = `---
type: ${entity.type}
created: ${date}`;
    
    if (entity.status) {
      frontmatter += `\nstatus: ${entity.status}`;
    }
    
    if (entity.type === 'issue' && entity.status === 'resolved' && entity.resolvedDate) {
      frontmatter += `\nresolved_date: ${entity.resolvedDate}`;
    }
    
    if (entity.category) {
      frontmatter += `\ncategory: ${entity.category}`;
    }
    
    frontmatter += `\n---\n\n`;
    
    let content = frontmatter;
    content += `# ${entity.name}\n\n`;

    // Add description if available
    if (entity.description) {
      content += `## Description\n\n${entity.description}\n\n`;
    }
    
    // Add "Raised by" for issues with wiki-link
    if (entity.type === 'issue' && entity.mentionedBy) {
      content += `**Raised by**: [[${entity.mentionedBy}]]\n\n`;
    }
    
    // Add "Owner" for topics with wiki-link
    if (entity.type === 'topic' && entity.mentionedBy) {
      content += `**Owner**: [[${entity.mentionedBy}]]\n\n`;
    }
    
    // Add status section
    if (entity.status) {
      content += `## Status\n\n${entity.status}\n\n`;
    }
    
    // Add related to
    if (entity.relatedTo) {
      content += `## Related To\n\n[[${entity.relatedTo}]]\n\n`;
    }
    
    // Related meetings
    content += `## Related Meetings\n\n`;
    content += `- [[${meetingLink}|${meetingTitle}]] (${meetingDateStr})\n\n`;
    
    // Notes section
    content += `## Notes\n\n`;
    
    return content;
  }
  
  /**
   * Update an existing entity note with new meeting info and accumulated context
   */
  private async updateEntityNote(
    notePath: string,
    entity: Entity,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date
  ): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(notePath);
    if (!(file instanceof TFile)) return;
    
    try {
      let content = await this.app.vault.read(file);
      const meetingLink = meetingPath.replace(/\.md$/, '');
      const meetingDateStr = meetingDate.toISOString().split('T')[0];
      
      // Check if this meeting is already referenced
      if (content.includes(meetingLink)) {
        console.debug(`MeetingMind: Meeting already referenced in ${notePath}`);
        return;
      }
      
      // Add frontmatter if it doesn't exist (for manually-created notes)
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/m;
      if (!frontmatterRegex.test(content)) {
        const frontmatter = `---
type: ${entity.type}
created: ${new Date().toISOString().split('T')[0]}
${entity.status ? `status: ${entity.status}` : ''}
${entity.category ? `category: ${entity.category}` : ''}
---

`;
        content = frontmatter + content;
        console.debug(`MeetingMind: Added frontmatter to manually-created note ${notePath}`);
      }
      
      // Extract existing description for synthesis
      const descriptionMatch = content.match(/## Description\s*\n\n([\s\S]*?)(?=\n\n(?:\*\*|##)|$)/);
      const existingDescription = descriptionMatch ? descriptionMatch[1].trim() : '';
      
      // If no Description section exists, try to use existing content as description
      let contentForSynthesis = existingDescription;
      if (!existingDescription && !content.includes('## Description')) {
        // Extract content after title/frontmatter as the existing description
        const contentWithoutFrontmatter = content.replace(frontmatterRegex, '');
        const contentAfterTitle = contentWithoutFrontmatter.replace(/^# .+\n+/m, '').trim();
        if (contentAfterTitle && !contentAfterTitle.startsWith('##')) {
          contentForSynthesis = contentAfterTitle.split('\n##')[0].trim();
        }
      }
      
      // Synthesize new description using AI if available
      if (this.aiService && entity.description) {
        const entityType = entity.type === 'issue' ? 'issue' : 'topic';
        const synthesizedDescription = await this.aiService.synthesizeDescription(
          entity.name,
          entityType,
          contentForSynthesis,
          entity.description,
          meetingTitle
        );
        
        if (synthesizedDescription) {
          // Update the description section with synthesized content
          if (content.includes('## Description')) {
            content = content.replace(
              /## Description\s*\n\n[\s\S]*?(?=\n\n(?:\*\*|##)|$)/,
              `## Description\n\n${synthesizedDescription}`
            );
          } else {
            // Add description section after the title/frontmatter
            const titleMatch = content.match(/^# .+\n\n/m);
            if (titleMatch) {
              const insertPos = content.indexOf(titleMatch[0]) + titleMatch[0].length;
              content = content.slice(0, insertPos) + 
                `## Description\n\n${synthesizedDescription}\n\n` + 
                content.slice(insertPos);
            } else {
              // No title found, add at the beginning after frontmatter
              const afterFrontmatter = content.replace(frontmatterRegex, '');
              const frontmatterMatch = content.match(frontmatterRegex);
              if (frontmatterMatch) {
                content = frontmatterMatch[0] + 
                  `# ${entity.name}\n\n## Description\n\n${synthesizedDescription}\n\n` + 
                  afterFrontmatter;
              }
            }
          }
          console.debug(`MeetingMind: Synthesized description for ${entity.name}`);
        }
      }
      
      // Update status if provided and different
      if (entity.status) {
        const cache = this.app.metadataCache.getFileCache(file);
        const currentStatus = cache?.frontmatter?.status;
        
        // Update frontmatter status
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/m;
        const frontmatterMatch = content.match(frontmatterRegex);
        if (frontmatterMatch) {
          let frontmatterContent = frontmatterMatch[1];
          
          // Update or add status field
          if (frontmatterContent.includes('status:')) {
            frontmatterContent = frontmatterContent.replace(/status:\s*.+/, `status: ${entity.status}`);
          } else {
            frontmatterContent += `\nstatus: ${entity.status}`;
          }
          
          // Add resolved_date if status changed to resolved
          if (entity.type === 'issue' && entity.status === 'resolved' && currentStatus !== 'resolved') {
            const resolvedDate = new Date().toISOString().split('T')[0];
            if (frontmatterContent.includes('resolved_date:')) {
              frontmatterContent = frontmatterContent.replace(/resolved_date:\s*.+/, `resolved_date: ${resolvedDate}`);
            } else {
              frontmatterContent += `\nresolved_date: ${resolvedDate}`;
            }
          }
          
          content = content.replace(frontmatterRegex, `---\n${frontmatterContent}\n---\n\n`);
        }
        
        // Update status section in content
        const statusRegex = /^## Status\s*$/m;
        if (statusRegex.test(content)) {
          // Update existing status section
          content = content.replace(
            /^## Status\s*$\n\n.*?\n\n/m,
            `## Status\n\n${entity.status}\n\n`
          );
        } else {
          // Add status section after description or Raised by/Owner
          const descIndex = content.indexOf('## Description');
          const raisedByIndex = content.indexOf('**Raised by**:');
          const ownerIndex = content.indexOf('**Owner**:');
          
          let insertIndex = -1;
          if (descIndex !== -1) {
            insertIndex = content.indexOf('\n\n', descIndex + 15);
          } else if (raisedByIndex !== -1 || ownerIndex !== -1) {
            const startIndex = Math.max(raisedByIndex, ownerIndex);
            insertIndex = content.indexOf('\n\n', startIndex);
          }
          
          if (insertIndex !== -1) {
            content = content.slice(0, insertIndex + 2) + 
              `## Status\n\n${entity.status}\n\n` + 
              content.slice(insertIndex + 2);
          }
        }
      }
      
      // Add new context/description from this meeting to the Updates section (changelog)
      if (entity.description) {
        const updateEntry = `- **${meetingDateStr}** (from [[${meetingLink}|${meetingTitle}]]): ${entity.description}\n`;
        
        const updatesHeaderRegex = /^## Updates\s*$/m;
        if (updatesHeaderRegex.test(content)) {
          // Add to existing Updates section (prepend to keep most recent first)
          content = content.replace(
            updatesHeaderRegex,
            `## Updates\n\n${updateEntry}`
          );
        } else {
          // Create new Updates section before Related Meetings
          const relatedMeetingsIndex = content.indexOf('## Related Meetings');
          const notesIndex = content.indexOf('## Notes');
          
          if (relatedMeetingsIndex !== -1) {
            content = content.slice(0, relatedMeetingsIndex) + 
              `## Updates\n\n${updateEntry}\n` + 
              content.slice(relatedMeetingsIndex);
          } else if (notesIndex !== -1) {
            content = content.slice(0, notesIndex) + 
              `## Updates\n\n${updateEntry}\n` + 
              content.slice(notesIndex);
          } else {
            content = content.trimEnd() + `\n\n## Updates\n\n${updateEntry}\n`;
          }
        }
      }
      
      // Add meeting to Related Meetings section
      const meetingsHeaderRegex = /^## Related Meetings\s*$/m;
      const meetingEntry = `- [[${meetingLink}|${meetingTitle}]] (${meetingDateStr})\n`;
      
      if (meetingsHeaderRegex.test(content)) {
        // Add to existing section
        content = content.replace(
          meetingsHeaderRegex,
          `## Related Meetings\n\n${meetingEntry}`
        );
      } else {
        // Create new section before Notes
        const notesIndex = content.indexOf('## Notes');
        if (notesIndex !== -1) {
          content = content.slice(0, notesIndex) + 
            `## Related Meetings\n\n${meetingEntry}\n` + 
            content.slice(notesIndex);
        } else {
          content = content.trimEnd() + `\n\n## Related Meetings\n\n${meetingEntry}\n`;
        }
      }
      
      await this.app.vault.modify(file, content);
      console.debug(`MeetingMind: Updated ${entity.type} note ${notePath} with new context`);
      
    } catch (error) {
      console.error(`MeetingMind: Failed to update ${notePath}`, error);
    }
  }
  
  /**
   * Ensure a folder exists
   */
  private async ensureFolder(folderPath: string): Promise<void> {
    const normalizedPath = normalizePath(folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);
    
    if (!folder) {
      try {
        await this.app.vault.createFolder(normalizedPath);
        console.debug(`MeetingMind: Created folder ${normalizedPath}`);
      } catch {
        // Folder might already exist
        console.debug(`MeetingMind: Folder ${normalizedPath} may already exist`);
      }
    }
  }
  
  /**
   * Archive resolved issues that have been resolved for more than the specified days
   */
  async archiveResolvedIssues(archiveDays: number): Promise<{ archived: number; errors: string[] }> {
    let archived = 0;
    const errors: string[] = [];
    
    if (!this.enableIssues || !this.issuesFolder) {
      return { archived, errors };
    }
    
    try {
      const folder = this.app.vault.getAbstractFileByPath(this.issuesFolder);
      if (!folder) {
        return { archived, errors };
      }
      
      // Get all markdown files in the issues folder (not in Archive subfolder)
      const files = this.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(this.issuesFolder + '/') && 
        !file.path.includes('/Archive/')
      );
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - archiveDays);
      
      for (const file of files) {
        try {
          const cache = this.app.metadataCache.getFileCache(file);
          const frontmatter = cache?.frontmatter;
          
          // Check if issue is resolved and has been resolved long enough
          if (frontmatter?.status === 'resolved' && frontmatter?.resolved_date) {
            const resolvedDate = new Date(frontmatter.resolved_date);
            
            if (resolvedDate < cutoffDate) {
              // Archive this issue
              const yearMonth = resolvedDate.toISOString().slice(0, 7); // YYYY-MM
              const archivePath = `${this.issuesFolder}/Archive/${yearMonth}`;
              
              // Ensure archive folder exists
              await this.ensureFolder(archivePath);
              
              // Move the file
              const newPath = `${archivePath}/${file.name}`;
              await this.app.vault.rename(file, newPath);
              
              console.debug(`MeetingMind: Archived ${file.path} to ${newPath}`);
              archived++;
              
              // Update links in People notes
              await this.updateLinksAfterArchive(file.path, newPath, file.basename);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to archive ${file.path}: ${error}`;
          console.error(`MeetingMind: ${errorMsg}`);
          errors.push(errorMsg);
        }
      }
      
      return { archived, errors };
    } catch (error) {
      const errorMsg = `Failed to archive issues: ${error}`;
      console.error(`MeetingMind: ${errorMsg}`);
      errors.push(errorMsg);
      return { archived, errors };
    }
  }
  
  /**
   * Update links in People notes after archiving an issue
   */
  private async updateLinksAfterArchive(oldPath: string, newPath: string, basename: string): Promise<void> {
    if (!this.app.workspace) return;
    
    try {
      // Get all markdown files (focus on People folder if configured)
      const files = this.app.vault.getMarkdownFiles();
      
      for (const file of files) {
        try {
          let content = await this.app.vault.read(file);
          const oldLink = `[[${basename}]]`;
          const newLink = `[[${newPath.replace(/\.md$/, '')}|${basename}]]`;
          
          // Only update if the old link exists
          if (content.includes(oldLink)) {
            content = content.replace(new RegExp(`\\[\\[${basename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\]`, 'g'), newLink);
            await this.app.vault.modify(file, content);
            console.debug(`MeetingMind: Updated links in ${file.path}`);
          }
        } catch (error) {
          console.error(`MeetingMind: Failed to update links in ${file.path}`, error);
        }
      }
    } catch (error) {
      console.error('MeetingMind: Failed to update links after archive', error);
    }
  }
  
  /**
   * Clean up orphaned meeting references from entity notes
   * Removes references to meeting files that no longer exist
   */
  async cleanupOrphanedReferences(): Promise<{ cleaned: number; removed: number; deleted: number }> {
    let cleaned = 0;
    let removed = 0;
    let deleted = 0;
    
    const folders = [];
    if (this.enableIssues && this.issuesFolder) folders.push(this.issuesFolder);
    if (this.enableTopics && this.topicsFolder) folders.push(this.topicsFolder);
    
    for (const folderPath of folders) {
      try {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) continue;
        
        // Get all markdown files in this folder
        const files = this.app.vault.getMarkdownFiles().filter(file => 
          file.path.startsWith(folderPath + '/')
        );
        
        for (const file of files) {
          let content = await this.app.vault.read(file);
          const originalContent = content;
          
          // Find the Related Meetings section
          const meetingsHeaderRegex = /^## Related Meetings\s*$/m;
          if (!meetingsHeaderRegex.test(content)) {
            continue;
          }
          
          // Extract meeting entries (lines starting with - [[link|title]] (date))
          const meetingEntryRegex = /^- \[\[([^\]]+)\|([^\]]+)\]\] \(([^)]+)\)\s*$/gm;
          const meetingEntries: Array<{ fullMatch: string; link: string; title: string; date: string }> = [];
          let match;
          
          while ((match = meetingEntryRegex.exec(content)) !== null) {
            meetingEntries.push({
              fullMatch: match[0],
              link: match[1],
              title: match[2],
              date: match[3],
            });
          }
          
          // Check each meeting reference
          let hasChanges = false;
          for (const entry of meetingEntries) {
            // Try to find the meeting file
            const meetingPath = entry.link.endsWith('.md') ? entry.link : `${entry.link}.md`;
            const meetingFile = this.app.vault.getAbstractFileByPath(meetingPath);
            
            if (!meetingFile) {
              // Meeting file doesn't exist - remove this entry
              content = content.replace(new RegExp(`^- \\[\\[${entry.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\|${entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\] \\(${entry.date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\s*$`, 'gm'), '');
              removed++;
              hasChanges = true;
            }
          }
          
          // Clean up empty Related Meetings section
          if (hasChanges) {
            const meetingsSectionRegex = /^## Related Meetings\s*$\n\n(?:(?:- \[\[.*?\]\] \(.*?\)\s*)*)/m;
            const meetingsSection = content.match(meetingsSectionRegex);
            if (meetingsSection && meetingsSection[0].trim() === '## Related Meetings') {
              // Section is empty, remove it
              content = content.replace(meetingsSectionRegex, '');
            }
            
            // Check if we should delete the entire entity note
            // Delete if: no meeting references left AND Notes section is empty
            const notesSectionMatch = content.match(/^## Notes\s*$\n\n([\s\S]*?)(?=\n## |$)/);
            const notesContent = notesSectionMatch ? notesSectionMatch[1].trim() : '';
            const hasNotesContent = notesContent.length > 0;
            
            // Check if there are any other meaningful sections beyond frontmatter and title
            const descMatch = content.match(/^## Description\s*$\n\n([\s\S]+?)(?=\n## |$)/);
            const hasDescription = descMatch && descMatch[1].trim().length > 0;
            
            const statusMatch = content.match(/^## Status\s*$\n\n([\s\S]+?)(?=\n## |$)/);
            const hasStatus = statusMatch && statusMatch[1].trim().length > 0;
            
            const hasRelatedTo = /^## Related To\s*$/m.test(content);
            
            const categoryMatch = content.match(/^## Category\s*$\n\n([\s\S]+?)(?=\n## |$)/);
            const hasCategory = categoryMatch && categoryMatch[1].trim().length > 0;
            
            const hasMentionedBy = /\*\*Mentioned by\*\*:/.test(content);
            
            const hasOtherContent = !!(hasDescription || hasStatus || hasRelatedTo || hasCategory || hasMentionedBy || hasNotesContent);
            
            // If no meetings left and no other meaningful content, delete the file
            if (!hasOtherContent && !meetingsHeaderRegex.test(content)) {
              await this.app.vault.trash(file, false);
              deleted++;
              continue; // Skip to next file
            }
            
            if (content !== originalContent) {
              await this.app.vault.modify(file, content);
              cleaned++;
            }
          }
        }
      } catch (error) {
        console.error(`MeetingMind: Failed to cleanup entity references in ${folderPath}`, error);
      }
    }
    
    return { cleaned, removed, deleted };
  }
}

