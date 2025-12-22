/**
 * FolderWatcher - Monitor a folder for new transcript files
 */

import { App, TFile, TFolder, Notice } from 'obsidian';

export type FileCallback = (file: TFile) => Promise<void>;

export class FolderWatcher {
  private app: App;
  private watchFolder: string;
  private callback: FileCallback | null = null;
  private enabled: boolean = false;
  private processedFiles: Set<string> = new Set();
  private watchInterval: NodeJS.Timeout | null = null;
  
  // Supported file extensions
  private readonly SUPPORTED_EXTENSIONS = ['.vtt', '.srt', '.txt', '.json'];
  
  constructor(app: App) {
    this.app = app;
    this.watchFolder = '';
  }
  
  /**
   * Configure the folder watcher
   */
  configure(watchFolder: string, enabled: boolean): void {
    this.watchFolder = watchFolder;
    this.enabled = enabled;
    
    if (enabled && watchFolder) {
      this.startWatching();
    } else {
      this.stopWatching();
    }
  }
  
  /**
   * Set the callback for processing new files
   */
  onNewFile(callback: FileCallback): void {
    this.callback = callback;
  }
  
  /**
   * Start watching the configured folder
   */
  startWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
    
    // Obsidian doesn't have native file watching outside the vault
    // So we poll for changes every 5 seconds as specified in PRD
    this.watchInterval = setInterval(() => {
      void this.checkForNewFiles();
    }, 5000);
    
    // Also check immediately
    void this.checkForNewFiles();
    
    console.debug(`MeetingMind: folder watcher started for ${this.watchFolder}`);
  }
  
  /**
   * Stop watching
   */
  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    console.debug('MeetingMind: folder watcher stopped');
  }
  
  /**
   * Check for new files in the watch folder
   */
  private async checkForNewFiles(): Promise<void> {
    if (!this.enabled || !this.watchFolder || !this.callback) {
      return;
    }
    
    try {
      // Get the folder from the vault
      const folder = this.app.vault.getAbstractFileByPath(this.watchFolder);
      
      if (!folder || !(folder instanceof TFolder)) {
        // Folder doesn't exist yet - silently wait for user to create it
        // Don't auto-create to avoid creating partial folder names while typing
        return;
      }
      
      // Get all files in the folder
      const files = folder.children.filter((f): f is TFile => 
        f instanceof TFile && this.isSupportedFile(f.name)
      );
      
      // Process any new files
      for (const file of files) {
        const fileKey = `${file.path}:${file.stat.mtime}`;
        
        if (!this.processedFiles.has(fileKey)) {
          console.debug(`MeetingMind: new transcript file detected: ${file.name}`);
          this.processedFiles.add(fileKey);
          
          try {
            await this.callback(file);
            new Notice(`MeetingMind: imported ${file.name}`);
          } catch (error) {
            console.error(`MeetingMind: failed to process ${file.name}`, error);
            new Notice(`MeetingMind: failed to import ${file.name}`);
          }
        }
      }
    } catch (error) {
      console.error('MeetingMind: folder watch error', error);
    }
  }
  
  /**
   * Check if a file has a supported extension
   */
  private isSupportedFile(filename: string): boolean {
    const lowerName = filename.toLowerCase();
    return this.SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  }
  
  /**
   * Clear processed files cache (useful for re-importing)
   */
  clearCache(): void {
    this.processedFiles.clear();
  }
  
  /**
   * Mark a specific file as processed
   */
  markProcessed(path: string, mtime: number): void {
    this.processedFiles.add(`${path}:${mtime}`);
  }
  
  /**
   * Check if a file has been processed
   */
  isProcessed(path: string, mtime: number): boolean {
    return this.processedFiles.has(`${path}:${mtime}`);
  }
  
  /**
   * Get the current watch folder
   */
  getWatchFolder(): string {
    return this.watchFolder;
  }
  
  /**
   * Check if watching is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Clean up when plugin is unloaded
   */
  destroy(): void {
    this.stopWatching();
    this.callback = null;
    this.processedFiles.clear();
  }
}

