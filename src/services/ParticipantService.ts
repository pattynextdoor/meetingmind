/**
 * ParticipantService - Auto-create and update participant notes
 */

import { App, TFile, normalizePath } from 'obsidian';
import { ParticipantInsight, ActionItem } from '../types';

export interface ParticipantInfo {
  name: string;
  noteExists: boolean;
  notePath: string | null;
}

export class ParticipantService {
  private app: App;
  private peopleFolder: string;
  
  constructor(app: App) {
    this.app = app;
    this.peopleFolder = '';
  }
  
  /**
   * Configure the people folder location
   */
  configure(peopleFolder: string): void {
    this.peopleFolder = peopleFolder;
  }
  
  /**
   * Check which participants have existing notes
   */
  checkParticipants(participants: string[]): ParticipantInfo[] {
    return participants.map(name => {
      const notePath = this.findParticipantNote(name);
      return {
        name,
        noteExists: notePath !== null,
        notePath,
      };
    });
  }
  
  /**
   * Find an existing note for a participant
   */
  private findParticipantNote(name: string): string | null {
    const possiblePaths = [
      `${name}.md`,
      `People/${name}.md`,
      `Contacts/${name}.md`,
      `Team/${name}.md`,
    ];
    
    if (this.peopleFolder) {
      possiblePaths.unshift(`${this.peopleFolder}/${name}.md`);
    }
    
    for (const path of possiblePaths) {
      const normalizedPath = normalizePath(path);
      const file = this.app.vault.getAbstractFileByPath(normalizedPath);
      if (file instanceof TFile) {
        return normalizedPath;
      }
    }
    
    // Search by alias or basename
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.frontmatter?.aliases) {
        const aliases = Array.isArray(cache.frontmatter.aliases)
          ? cache.frontmatter.aliases
          : [cache.frontmatter.aliases];
        if (aliases.some((a: string) => a.toLowerCase() === name.toLowerCase())) {
          return file.path;
        }
      }
      if (file.basename.toLowerCase() === name.toLowerCase()) {
        return file.path;
      }
    }
    
    return null;
  }
  
  /**
   * Create or update notes for participants with AI insights
   */
  async processParticipants(
    participants: string[],
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date,
    insights?: ParticipantInsight[]
  ): Promise<{ created: string[]; updated: string[] }> {
    const created: string[] = [];
    const updated: string[] = [];
    
    // Ensure people folder exists if configured
    if (this.peopleFolder) {
      await this.ensureFolder(this.peopleFolder);
    }
    
    // Create a map of insights by participant name
    const insightMap = new Map<string, ParticipantInsight>();
    if (insights) {
      for (const insight of insights) {
        insightMap.set(insight.name.toLowerCase(), insight);
      }
    }
    
    for (const name of participants) {
      const insight = insightMap.get(name.toLowerCase());
      const existingPath = this.findParticipantNote(name);
      
      if (existingPath) {
        // Update existing note
        await this.updateParticipantNote(existingPath, meetingTitle, meetingPath, meetingDate, insight);
        updated.push(name);
      } else {
        // Create new participant note
        const newPath = await this.createParticipantNote(name, meetingTitle, meetingPath, meetingDate, insight);
        if (newPath) {
          created.push(name);
        }
      }
    }
    
    return { created, updated };
  }
  
  /**
   * Create a new participant note with insights
   */
  private async createParticipantNote(
    name: string,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date,
    insight?: ParticipantInsight
  ): Promise<string | null> {
    const folderPath = this.peopleFolder || '';
    const fileName = `${name}.md`;
    const filePath = folderPath ? normalizePath(`${folderPath}/${fileName}`) : fileName;
    
    if (this.app.vault.getAbstractFileByPath(filePath)) {
      return null;
    }
    
    const content = this.generateNewParticipantNote(name, meetingTitle, meetingPath, meetingDate, insight);
    
    try {
      await this.app.vault.create(filePath, content);
      console.log(`MeetingMind: Created participant note for ${name}`);
      return filePath;
    } catch (error) {
      console.error(`MeetingMind: Failed to create note for ${name}`, error);
      return null;
    }
  }
  
  /**
   * Generate content for a new participant note
   */
  private generateNewParticipantNote(
    name: string,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date,
    insight?: ParticipantInsight
  ): string {
    const date = new Date().toISOString().split('T')[0];
    const meetingLink = meetingPath.replace(/\.md$/, '');
    const meetingDateStr = meetingDate.toISOString().split('T')[0];
    
    let content = `---
created: ${date}
type: person
tags: [person]
---

# ${name}

`;

    // Add role if we have insight
    if (insight?.role) {
      content += `**Role**: ${insight.role}\n\n`;
    }
    
    content += `## About\n\n\n`;
    
    // Meetings section
    content += `## Meetings\n\n`;
    content += `### [[${meetingLink}|${meetingTitle}]] (${meetingDateStr})\n\n`;
    
    // Add key points from this meeting
    if (insight?.keyPoints && insight.keyPoints.length > 0) {
      content += `**Key Contributions:**\n`;
      for (const point of insight.keyPoints) {
        content += `- ${point}\n`;
      }
      content += `\n`;
    }
    
    // Add sentiment if available
    if (insight?.sentiment) {
      content += `*${insight.sentiment}*\n\n`;
    }
    
    // Action items section
    content += `## Action Items\n\n`;
    
    if (insight?.actionItems && insight.actionItems.length > 0) {
      for (const item of insight.actionItems) {
        let task = `- [ ] ${item.task}`;
        if (item.dueDate) {
          task += ` (due: ${item.dueDate})`;
        }
        task += ` — from [[${meetingLink}|${meetingTitle}]]`;
        content += task + '\n';
      }
    } else {
      content += `*No action items yet*\n`;
    }
    
    content += `\n## Notes\n\n`;
    
    return content;
  }
  
  /**
   * Update an existing participant note with new meeting info
   */
  private async updateParticipantNote(
    notePath: string,
    meetingTitle: string,
    meetingPath: string,
    meetingDate: Date,
    insight?: ParticipantInsight
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
      
      // Update role if we have one and there's no existing role
      if (insight?.role && !content.includes('**Role**:')) {
        const aboutIndex = content.indexOf('## About');
        if (aboutIndex !== -1) {
          content = content.slice(0, aboutIndex) + 
            `**Role**: ${insight.role}\n\n` + 
            content.slice(aboutIndex);
        }
      }
      
      // Add meeting entry
      const meetingsHeaderRegex = /^## Meetings\s*$/m;
      const meetingEntry = this.generateMeetingEntry(meetingTitle, meetingLink, meetingDateStr, insight);
      
      if (meetingsHeaderRegex.test(content)) {
        content = content.replace(
          meetingsHeaderRegex,
          `## Meetings\n\n${meetingEntry}`
        );
      } else {
        // No Meetings section - add before Action Items or at end
        const actionItemsIndex = content.indexOf('## Action Items');
        if (actionItemsIndex !== -1) {
          content = content.slice(0, actionItemsIndex) + 
            `## Meetings\n\n${meetingEntry}\n` + 
            content.slice(actionItemsIndex);
        } else {
          content = content.trimEnd() + `\n\n## Meetings\n\n${meetingEntry}\n`;
        }
      }
      
      // Add new action items
      if (insight?.actionItems && insight.actionItems.length > 0) {
        const actionItemsRegex = /^## Action Items\s*$/m;
        const newActionItems = insight.actionItems.map(item => {
          let task = `- [ ] ${item.task}`;
          if (item.dueDate) {
            task += ` (due: ${item.dueDate})`;
          }
          task += ` — from [[${meetingLink}|${meetingTitle}]]`;
          return task;
        }).join('\n');
        
        if (actionItemsRegex.test(content)) {
          // Remove placeholder text if present
          content = content.replace(/\*No action items yet\*\n?/, '');
          content = content.replace(
            actionItemsRegex,
            `## Action Items\n\n${newActionItems}`
          );
        } else {
          content = content.trimEnd() + `\n\n## Action Items\n\n${newActionItems}\n`;
        }
      }
      
      await this.app.vault.modify(file, content);
      console.log(`MeetingMind: Updated participant note ${notePath}`);
      
    } catch (error) {
      console.error(`MeetingMind: Failed to update ${notePath}`, error);
    }
  }
  
  /**
   * Generate a meeting entry for a participant note
   */
  private generateMeetingEntry(
    meetingTitle: string,
    meetingLink: string,
    meetingDate: string,
    insight?: ParticipantInsight
  ): string {
    let entry = `### [[${meetingLink}|${meetingTitle}]] (${meetingDate})\n\n`;
    
    if (insight?.keyPoints && insight.keyPoints.length > 0) {
      entry += `**Key Contributions:**\n`;
      for (const point of insight.keyPoints) {
        entry += `- ${point}\n`;
      }
      entry += `\n`;
    }
    
    if (insight?.sentiment) {
      entry += `*${insight.sentiment}*\n\n`;
    }
    
    return entry;
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
      } catch (e) {
        // Folder might already exist
      }
    }
  }
}
