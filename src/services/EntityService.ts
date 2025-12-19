/**
 * EntityService - Auto-create and update notes for issues, updates, and topics
 */

import { App, TFile, normalizePath } from 'obsidian';
import { Entity, EntityExtraction } from '../types';

export interface EntityInfo {
  entity: Entity;
  noteExists: boolean;
  notePath: string | null;
}

export class EntityService {
  private app: App;
  private issuesFolder: string;
  private updatesFolder: string;
  private topicsFolder: string;
  private enableIssues: boolean;
  private enableUpdates: boolean;
  private enableTopics: boolean;
  
  constructor(app: App) {
    this.app = app;
    this.issuesFolder = 'Issues';
    this.updatesFolder = 'Updates';
    this.topicsFolder = 'Topics';
    this.enableIssues = true;
    this.enableUpdates = true;
    this.enableTopics = true;
  }
  
  /**
   * Configure entity extraction settings
   */
  configure(
    issuesFolder: string,
    updatesFolder: string,
    topicsFolder: string,
    enableIssues: boolean,
    enableUpdates: boolean,
    enableTopics: boolean
  ): void {
    this.issuesFolder = issuesFolder;
    this.updatesFolder = updatesFolder;
    this.topicsFolder = topicsFolder;
    this.enableIssues = enableIssues;
    this.enableUpdates = enableUpdates;
    this.enableTopics = enableTopics;
  }
  
  /**
   * Get all existing entities from the vault
   * Returns a list of entities with their current status
   */
  async getExistingEntities(): Promise<Array<{ name: string; type: 'issue' | 'update' | 'topic'; currentStatus?: string; path: string }>> {
    const entities: Array<{ name: string; type: 'issue' | 'update' | 'topic'; currentStatus?: string; path: string }> = [];
    const folders = [];
    if (this.enableIssues && this.issuesFolder) folders.push({ path: this.issuesFolder, type: 'issue' as const });
    if (this.enableUpdates && this.updatesFolder) folders.push({ path: this.updatesFolder, type: 'update' as const });
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
      console.log(`MeetingMind: Updated entity status for ${entityPath} to ${newStatus}`);
    } catch (error) {
      console.error(`MeetingMind: Failed to update entity status for ${entityPath}`, error);
    }
  }
  
  /**
   * Process entities and create/update notes
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
    
    // Process updates
    if (this.enableUpdates && entities.updates.length > 0) {
      await this.ensureFolder(this.updatesFolder);
      for (const update of entities.updates) {
        const existingPath = this.findEntityNote(update);
        if (existingPath) {
          await this.updateEntityNote(existingPath, update, meetingTitle, meetingPath, meetingDate);
          updated.push(update.name);
        } else {
          const newPath = await this.createEntityNote(update, this.updatesFolder, meetingTitle, meetingPath, meetingDate);
          if (newPath) {
            created.push(update.name);
          }
        }
      }
    }
    
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
    
    // Search by name and type
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.type === entity.type && 
          file.basename.toLowerCase() === entity.name.toLowerCase()) {
        return file.path;
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
      console.log(`MeetingMind: Created ${entity.type} note for ${entity.name}`);
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
    
    let content = `---
type: ${entity.type}
created: ${date}
---

# ${entity.name}

`;

    // Add description if available
    if (entity.description) {
      content += `## Description\n\n${entity.description}\n\n`;
    }
    
    // Add status for updates
    if (entity.type === 'update' && entity.status) {
      content += `## Status\n\n${entity.status}\n\n`;
    }
    
    // Add status for issues (if blocked)
    if (entity.type === 'issue' && entity.status) {
      content += `## Status\n\n${entity.status}\n\n`;
    }
    
    // Add related to
    if (entity.relatedTo) {
      content += `## Related To\n\n[[${entity.relatedTo}]]\n\n`;
    }
    
    // Add category for topics
    if (entity.type === 'topic' && entity.category) {
      content += `## Category\n\n${entity.category}\n\n`;
    }
    
    // Add mentioned by
    if (entity.mentionedBy) {
      content += `**Mentioned by**: ${entity.mentionedBy}\n\n`;
    }
    
    // Related meetings
    content += `## Related Meetings\n\n`;
    content += `- [[${meetingLink}|${meetingTitle}]] (${meetingDateStr})\n\n`;
    
    // Notes section
    content += `## Notes\n\n`;
    
    return content;
  }
  
  /**
   * Update an existing entity note with new meeting info
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
        console.log(`MeetingMind: Meeting already referenced in ${notePath}`);
        return;
      }
      
      // Update status if provided and different
      if (entity.status) {
        const statusRegex = /^## Status\s*$/m;
        if (statusRegex.test(content)) {
          // Update existing status section
          content = content.replace(
            /^## Status\s*$\n\n.*?\n\n/m,
            `## Status\n\n${entity.status}\n\n`
          );
        } else {
          // Add status section after description
          const descIndex = content.indexOf('## Description');
          if (descIndex !== -1) {
            const descEnd = content.indexOf('\n\n', descIndex + 15);
            if (descEnd !== -1) {
              content = content.slice(0, descEnd + 2) + 
                `## Status\n\n${entity.status}\n\n` + 
                content.slice(descEnd + 2);
            }
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
      console.log(`MeetingMind: Updated ${entity.type} note ${notePath}`);
      
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
        console.log(`MeetingMind: Created folder ${normalizedPath}`);
      } catch (e) {
        // Folder might already exist
        console.log(`MeetingMind: Folder ${normalizedPath} may already exist`);
      }
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
    if (this.enableUpdates && this.updatesFolder) folders.push(this.updatesFolder);
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
              await this.app.vault.delete(file);
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

