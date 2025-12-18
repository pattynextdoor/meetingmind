/**
 * SyncLogModal - Display recent sync activity
 */

import { App, Modal } from 'obsidian';
import { SyncLogEntry } from '../types';

export class SyncLogModal extends Modal {
  private logs: SyncLogEntry[];
  
  constructor(app: App, logs: SyncLogEntry[]) {
    super(app);
    this.logs = logs;
  }
  
  onOpen(): void {
    const { contentEl } = this;
    
    contentEl.createEl('h2', { text: 'MeetingMind Activity Log' });
    
    if (this.logs.length === 0) {
      contentEl.createEl('p', { 
        text: 'No recent activity',
        cls: 'sync-log-empty'
      });
      return;
    }
    
    const logContainer = contentEl.createDiv({ cls: 'sync-log-container' });
    
    // Display logs in reverse chronological order
    const sortedLogs = [...this.logs].reverse();
    
    for (const log of sortedLogs) {
      const entry = logContainer.createDiv({ cls: `sync-log-entry sync-log-${log.status}` });
      
      // Timestamp
      const timestamp = entry.createSpan({ cls: 'sync-log-timestamp' });
      timestamp.setText(this.formatTimestamp(log.timestamp));
      
      // Status icon
      const statusIcon = entry.createSpan({ cls: 'sync-log-icon' });
      statusIcon.setText(this.getStatusIcon(log.status));
      
      // Action and message
      const content = entry.createDiv({ cls: 'sync-log-content' });
      content.createEl('strong', { text: log.action });
      content.createEl('span', { text: ` - ${log.message}` });
      
      // Details if present
      if (log.details) {
        const details = content.createEl('div', { cls: 'sync-log-details' });
        details.setText(log.details);
      }
    }
    
    // Add styles
    this.addStyles();
  }
  
  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
  
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Show date
    return date.toLocaleString();
  }
  
  private getStatusIcon(status: 'success' | 'error' | 'warning'): string {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '•';
    }
  }
  
  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .sync-log-container {
        max-height: 400px;
        overflow-y: auto;
      }
      
      .sync-log-entry {
        padding: 8px 12px;
        margin-bottom: 8px;
        border-radius: 4px;
        background: var(--background-secondary);
        border-left: 3px solid var(--text-muted);
      }
      
      .sync-log-success {
        border-left-color: var(--color-green);
      }
      
      .sync-log-error {
        border-left-color: var(--color-red);
      }
      
      .sync-log-warning {
        border-left-color: var(--color-orange);
      }
      
      .sync-log-timestamp {
        font-size: 0.85em;
        color: var(--text-muted);
        margin-right: 8px;
      }
      
      .sync-log-icon {
        margin-right: 8px;
      }
      
      .sync-log-content {
        margin-top: 4px;
      }
      
      .sync-log-details {
        font-size: 0.85em;
        color: var(--text-muted);
        margin-top: 4px;
        padding-left: 8px;
        border-left: 2px solid var(--background-modifier-border);
      }
      
      .sync-log-empty {
        color: var(--text-muted);
        text-align: center;
        padding: 20px;
      }
    `;
    this.contentEl.appendChild(style);
  }
}

