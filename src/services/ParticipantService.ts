/**
 * ParticipantService - Auto-create and update participant notes
 */

import { App, TFile, normalizePath } from 'obsidian';
import { ParticipantInsight } from '../types';
import { AIService } from './AIService';

export interface ParticipantInfo {
  name: string;
  noteExists: boolean;
  notePath: string | null;
}

export class ParticipantService {
  private app: App;
  private aiService: AIService | null;
  private peopleFolder: string;
  
  constructor(app: App, aiService?: AIService) {
    this.app = app;
    this.aiService = aiService || null;
    this.peopleFolder = '';
  }
  
  /**
   * Set the AI service for synthesis operations
   */
  setAIService(aiService: AIService): void {
    this.aiService = aiService;
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
      console.debug(`MeetingMind: created participant note for ${name}`);
      return filePath;
    } catch (error) {
      console.error(`MeetingMind: failed to create note for ${name}`, error);
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
    
    // Owns section (topics and updates)
    if ((insight?.ownedTopics && insight.ownedTopics.length > 0) || (insight?.updates && insight.updates.length > 0)) {
      content += `## Owns\n`;
      
      // Add owned topics
      if (insight?.ownedTopics && insight.ownedTopics.length > 0) {
        for (const topic of insight.ownedTopics) {
          content += `- [[${topic}]] — *active topic*\n`;
        }
      }
      
      // Add updates as plain text with status and date
      if (insight?.updates && insight.updates.length > 0) {
        for (const update of insight.updates) {
          const statusEmoji = update.status === 'completed' ? '✅' : update.status === 'blocked' ? '🚫' : '🔄';
          content += `- ${statusEmoji} ${update.name} — *${update.status} ${update.date}* (from [[${meetingLink}|${meetingTitle}]])\n`;
        }
      }
      
      content += `\n`;
    }
    
    // Action items section (active)
    if (insight?.actionItems && insight.actionItems.length > 0) {
      content += `## Active Action Items\n\n`;
      for (const item of insight.actionItems) {
        let task = `- [ ] ${item.task}`;
        if (item.dueDate) {
          task += ` (due: ${item.dueDate})`;
        }
        task += ` — from [[${meetingLink}|${meetingTitle}]]`;
        content += task + '\n';
      }
      content += `\n`;
    }
    
    // Wins section
    if (insight?.wins && insight.wins.length > 0) {
      content += `## Recent Wins\n\n`;
      for (const win of insight.wins) {
        content += `- ✅ ${win} — from [[${meetingLink}|${meetingTitle}]]\n`;
      }
      content += `\n`;
    }
    
    // Raised Issues section
    if (insight?.raisedIssues && insight.raisedIssues.length > 0) {
      content += `## Raised Issues\n\n`;
      for (const issue of insight.raisedIssues) {
        content += `- [[${issue}]]\n`;
      }
      content += `\n`;
    }
    
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
    
    // Archive section (empty initially)
    content += `## Archive\n\n`;
    content += `*Completed items and older meetings*\n\n`;
    
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
        console.debug(`MeetingMind: meeting already referenced in ${notePath}`);
        return;
      }
      
      // Extract person name from file path
      const personName = file.basename;
      
      // Synthesize the About section with new context from this meeting
      if (this.aiService && insight) {
        // Extract existing About section content
        const aboutMatch = content.match(/## About\s*\n\n([\s\S]*?)(?=\n\n##|$)/);
        const existingAbout = aboutMatch ? aboutMatch[1].trim() : '';
        
        // Build context from insight
        const contextParts: string[] = [];
        if (insight.role) contextParts.push(`Role: ${insight.role}`);
        if (insight.keyPoints && insight.keyPoints.length > 0) {
          contextParts.push(`Key contributions: ${insight.keyPoints.join('; ')}`);
        }
        if (insight.actionItems && insight.actionItems.length > 0) {
          contextParts.push(`Working on: ${insight.actionItems.map(a => a.task).join('; ')}`);
        }
        if (insight.ownedTopics && insight.ownedTopics.length > 0) {
          contextParts.push(`Owns topics: ${insight.ownedTopics.join(', ')}`);
        }
        if (insight.wins && insight.wins.length > 0) {
          contextParts.push(`Recent wins: ${insight.wins.join('; ')}`);
        }
        
        if (contextParts.length > 0) {
          const newContext = contextParts.join('. ');
          const synthesizedAbout = await this.aiService.synthesizePersonAbout(
            personName,
            existingAbout,
            newContext,
            meetingTitle
          );
          
          if (synthesizedAbout) {
            // Update the About section
            if (content.includes('## About')) {
              content = content.replace(
                /## About\s*\n\n[\s\S]*?(?=\n\n##|$)/,
                `## About\n\n${synthesizedAbout}`
              );
            } else {
              // Add About section after role or at the start
              const roleIndex = content.indexOf('**Role**:');
              if (roleIndex !== -1) {
                const roleEndIndex = content.indexOf('\n\n', roleIndex);
                if (roleEndIndex !== -1) {
                  content = content.slice(0, roleEndIndex + 2) + 
                    `## About\n\n${synthesizedAbout}\n\n` + 
                    content.slice(roleEndIndex + 2);
                }
              } else {
                // Add after frontmatter/title
                const titleMatch = content.match(/^# .+\n\n/m);
                if (titleMatch) {
                  const insertPos = content.indexOf(titleMatch[0]) + titleMatch[0].length;
                  content = content.slice(0, insertPos) + 
                    `## About\n\n${synthesizedAbout}\n\n` + 
                    content.slice(insertPos);
                }
              }
            }
            console.debug(`MeetingMind: synthesized About section for ${personName}`);
          }
        }
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
      
      // Remove old "Top of Mind" section logic - no longer used
      
      // Ensure Archive section exists
      if (!content.includes('## Archive')) {
        const notesIndex = content.indexOf('## Notes');
        if (notesIndex !== -1) {
          content = content.slice(0, notesIndex) + 
            `## Archive\n\n*Completed items and older meetings*\n\n` +
            content.slice(notesIndex);
        } else {
          content = content.trimEnd() + `\n\n## Archive\n\n*Completed items and older meetings*\n\n`;
        }
      }
      
      // Add owned topics and updates to Owns section
      if ((insight?.ownedTopics && insight.ownedTopics.length > 0) || (insight?.updates && insight.updates.length > 0)) {
        // Check if Owns section exists
        if (content.includes('## Owns')) {
          // Add to existing Owns section
          let ownsContent = '';
          
          if (insight?.ownedTopics && insight.ownedTopics.length > 0) {
            for (const topic of insight.ownedTopics) {
              ownsContent += `- [[${topic}]] — *active topic*\n`;
            }
          }
          
          if (insight?.updates && insight.updates.length > 0) {
            for (const update of insight.updates) {
              const statusEmoji = update.status === 'completed' ? '✅' : update.status === 'blocked' ? '🚫' : '🔄';
              ownsContent += `- ${statusEmoji} ${update.name} — *${update.status} ${update.date}* (from [[${meetingLink}|${meetingTitle}]])\n`;
            }
          }
          
          content = content.replace(
            /(## Owns\n)/,
            `$1${ownsContent}`
          );
        } else {
          // Create new Owns section before Raised Issues
          let ownsSection = `## Owns\n`;
          
          if (insight?.ownedTopics && insight.ownedTopics.length > 0) {
            for (const topic of insight.ownedTopics) {
              ownsSection += `- [[${topic}]] — *active topic*\n`;
            }
          }
          
          if (insight?.updates && insight.updates.length > 0) {
            for (const update of insight.updates) {
              const statusEmoji = update.status === 'completed' ? '✅' : update.status === 'blocked' ? '🚫' : '🔄';
              ownsSection += `- ${statusEmoji} ${update.name} — *${update.status} ${update.date}* (from [[${meetingLink}|${meetingTitle}]])\n`;
            }
          }
          
          ownsSection += `\n`;
          
          // Insert before Raised Issues or Meetings section
          const raisedIssuesIndex = content.indexOf('## Raised Issues');
          const meetingsIndex = content.indexOf('## Meetings');
          const insertIndex = raisedIssuesIndex !== -1 ? raisedIssuesIndex : meetingsIndex;
          
          if (insertIndex !== -1) {
            content = content.slice(0, insertIndex) + ownsSection + content.slice(insertIndex);
          } else {
            content = content.trimEnd() + `\n\n${ownsSection}`;
          }
        }
      }
      
      // Add raised issues
      if (insight?.raisedIssues && insight.raisedIssues.length > 0) {
        // Check if Raised Issues section exists
        if (content.includes('## Raised Issues')) {
          // Add to existing section
          let issuesContent = '';
          for (const issue of insight.raisedIssues) {
            // Check if this issue is already listed
            if (!content.includes(`[[${issue}]]`)) {
              issuesContent += `- [[${issue}]]\n`;
            }
          }
          
          if (issuesContent) {
            content = content.replace(
              /(## Raised Issues\n\n)/,
              `$1${issuesContent}`
            );
          }
        } else {
          // Create new Raised Issues section before Meetings
          let issuesSection = `## Raised Issues\n\n`;
          for (const issue of insight.raisedIssues) {
            issuesSection += `- [[${issue}]]\n`;
          }
          issuesSection += `\n`;
          
          const meetingsIndex = content.indexOf('## Meetings');
          if (meetingsIndex !== -1) {
            content = content.slice(0, meetingsIndex) + 
              issuesSection + 
              content.slice(meetingsIndex);
          } else {
            // Fallback: add before Archive
            const archiveIndex = content.indexOf('## Archive');
            if (archiveIndex !== -1) {
              content = content.slice(0, archiveIndex) + 
                issuesSection + 
                content.slice(archiveIndex);
            }
          }
        }
      }
      
      // Add wins to Recent Wins section
      if (insight?.wins && insight.wins.length > 0) {
        const winsContent = insight.wins.map(win => `- ✅ ${win} — from [[${meetingLink}|${meetingTitle}]]`).join('\n');
        
        if (content.includes('## Recent Wins')) {
          // Add to existing Recent Wins section
          content = content.replace(
            /(## Recent Wins\n\n)/,
            `$1${winsContent}\n`
          );
        } else {
          // Create new Recent Wins section before Active Action Items or Raised Issues
          const winsSection = `## Recent Wins\n\n${winsContent}\n\n`;
          const actionItemsIndex = content.indexOf('## Active Action Items');
          const raisedIssuesIndex = content.indexOf('## Raised Issues');
          const insertIndex = actionItemsIndex !== -1 ? actionItemsIndex : raisedIssuesIndex;
          
          if (insertIndex !== -1) {
            content = content.slice(0, insertIndex) + winsSection + content.slice(insertIndex);
          } else {
            content = content.trimEnd() + `\n\n${winsSection}`;
          }
        }
      }
      
      // Add new action items to Active Action Items section
      if (insight?.actionItems && insight.actionItems.length > 0) {
        const newActionItems = insight.actionItems.map(item => {
          let task = `- [ ] ${item.task}`;
          if (item.dueDate) {
            task += ` (due: ${item.dueDate})`;
          }
          task += ` — from [[${meetingLink}|${meetingTitle}]]`;
          return task;
        }).join('\n');
        
        // Check if Active Action Items section exists (##) or subsection (###)
        if (content.includes('## Active Action Items')) {
          // Add to existing top-level section
          content = content.replace(
            /(## Active Action Items\n\n)/,
            `$1${newActionItems}\n`
          );
        } else if (content.includes('### Active Action Items')) {
          // Add to existing subsection (from old structure)
          content = content.replace(
            /(### Active Action Items\n\n)/,
            `$1${newActionItems}\n`
          );
        } else {
          // Create new section before Raised Issues or Meetings
          const actionItemsSection = `## Active Action Items\n\n${newActionItems}\n\n`;
          const raisedIssuesIndex = content.indexOf('## Raised Issues');
          const meetingsIndex = content.indexOf('## Meetings');
          const insertIndex = raisedIssuesIndex !== -1 ? raisedIssuesIndex : meetingsIndex;
          
          if (insertIndex !== -1) {
            content = content.slice(0, insertIndex) + actionItemsSection + content.slice(insertIndex);
          } else {
            content = content.trimEnd() + `\n\n${actionItemsSection}`;
          }
        }
      }
      
      await this.app.vault.modify(file, content);
      console.debug(`MeetingMind: updated participant note ${notePath}`);
      
    } catch (error) {
      console.error(`MeetingMind: failed to update ${notePath}`, error);
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
      } catch {
        // Folder might already exist
      }
    }
  }
  
  /**
   * Clean up orphaned meeting references from participant notes
   * Removes references to meeting files that no longer exist
   */
  async cleanupOrphanedReferences(): Promise<{ cleaned: number; removed: number; deleted: number }> {
    let cleaned = 0;
    let removed = 0;
    const deleted = 0;
    
    if (!this.peopleFolder) {
      return { cleaned, removed, deleted };
    }
    
    try {
      const folder = this.app.vault.getAbstractFileByPath(this.peopleFolder);
      if (!folder) {
        return { cleaned, removed, deleted };
      }
      
      // Get all markdown files in the people folder
      const files = this.app.vault.getMarkdownFiles().filter(file => 
        file.path.startsWith(this.peopleFolder + '/')
      );
      
      for (const file of files) {
        let content = await this.app.vault.read(file);
        const originalContent = content;
        
        // Find the Meetings section
        const meetingsHeaderRegex = /^## Meetings\s*$/m;
        if (!meetingsHeaderRegex.test(content)) {
          continue;
        }
        
        // Extract meeting entries (lines starting with ### [[link|title]] (date))
        const meetingEntryRegex = /^### \[\[([^\]]+)\|([^\]]+)\]\] \(([^)]+)\)\s*$/gm;
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
        
        // Check each meeting reference (in reverse order to preserve indices)
        let hasChanges = false;
        for (let i = meetingEntries.length - 1; i >= 0; i--) {
          const entry = meetingEntries[i];
          // Try to find the meeting file
          const meetingPath = entry.link.endsWith('.md') ? entry.link : `${entry.link}.md`;
          const meetingFile = this.app.vault.getAbstractFileByPath(meetingPath);
          
          if (!meetingFile) {
            // Meeting file doesn't exist - find and remove the entire entry block
            // Entry format: ### [[link|title]] (date)\n\n[optional content]\n\n
            // Find from the header line to the next ### or ## section
            const escapedLink = entry.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedTitle = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedDate = entry.date.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Match from the header to the next meeting entry or section
            const entryBlockRegex = new RegExp(
              `^### \\[\\[${escapedLink}\\|${escapedTitle}\\]\\] \\(${escapedDate}\\)\\s*\\n(?:[^#]|\\n)*?(?=\\n### |\\n## |$)`,
              'gm'
            );
            
            content = content.replace(entryBlockRegex, '');
            removed++;
            hasChanges = true;
          }
        }
        
        // Also check action items that reference meetings
        const actionItemRegex = /- \[ \] (.+?) — from \[\[([^\]]+)\|([^\]]+)\]\]/g;
        let actionItemMatch;
        while ((actionItemMatch = actionItemRegex.exec(content)) !== null) {
          const meetingLink = actionItemMatch[2];
          const meetingPath = meetingLink.endsWith('.md') ? meetingLink : `${meetingLink}.md`;
          const meetingFile = this.app.vault.getAbstractFileByPath(meetingPath);
          
          if (!meetingFile) {
            // Remove the action item line
            content = content.replace(actionItemMatch[0] + '\n', '');
            removed++;
            hasChanges = true;
          }
        }
        
        // Clean up empty Meetings section
        if (hasChanges) {
          const meetingsSectionRegex = /^## Meetings\s*$\n\n(?:(?:###|-) .*\n?)*/m;
          const meetingsSection = content.match(meetingsSectionRegex);
          if (meetingsSection && meetingsSection[0].trim() === '## Meetings') {
            // Section is empty, remove it
            content = content.replace(meetingsSectionRegex, '');
          }
          
          // Clean up empty Action Items section
          const actionItemsSectionRegex = /^## Action Items\s*$\n\n(?:\*No action items yet\*|(?:(?:- \[ \]|-) .*\n?)*)/m;
          const actionItemsSection = content.match(actionItemsSectionRegex);
          if (actionItemsSection && (actionItemsSection[0].includes('*No action items yet*') || actionItemsSection[0].trim() === '## Action Items')) {
            // Section is empty, remove it
            content = content.replace(actionItemsSectionRegex, '');
          }
          
          if (content !== originalContent) {
            await this.app.vault.modify(file, content);
            cleaned++;
          }
        }
      }
      
      return { cleaned, removed, deleted };
    } catch (error) {
      console.error('MeetingMind: failed to cleanup participant references', error);
      return { cleaned, removed, deleted };
    }
  }
}
