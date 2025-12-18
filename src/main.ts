/**
 * MeetingSync - Obsidian Plugin
 * Automatically import meeting transcripts with AI-powered enrichment and auto-linking
 */

import { 
  App, 
  Plugin, 
  TFile, 
  Notice, 
  addIcon,
  setIcon,
  FileSystemAdapter
} from 'obsidian';

import { 
  MeetingSyncSettings, 
  DEFAULT_SETTINGS, 
  RawTranscript, 
  ProcessedMeeting,
  SyncLogEntry,
  SyncStatus
} from './types';

import { TranscriptParser } from './services/TranscriptParser';
import { VaultIndexService } from './services/VaultIndex';
import { AutoLinker } from './services/AutoLinker';
import { AIService } from './services/AIService';
import { FolderWatcher } from './services/FolderWatcher';
import { OtterService } from './services/OtterService';
import { NoteGenerator } from './services/NoteGenerator';
import { MeetingSyncSettingsTab } from './ui/SettingsTab';
import { SyncLogModal } from './ui/SyncLogModal';

// Custom icon for status bar
const SYNC_ICON = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="40"/><path d="M50 25v25l15 15"/></svg>`;

export default class MeetingSyncPlugin extends Plugin {
  settings: MeetingSyncSettings;
  
  // Services
  transcriptParser: TranscriptParser;
  vaultIndex: VaultIndexService;
  autoLinker: AutoLinker;
  aiService: AIService;
  folderWatcher: FolderWatcher;
  otterService: OtterService;
  noteGenerator: NoteGenerator;
  
  // UI Elements
  statusBarItem: HTMLElement;
  
  // State
  syncLogs: SyncLogEntry[] = [];
  private maxLogs = 100;
  
  async onload(): Promise<void> {
    console.log('MeetingSync: Loading plugin');
    
    // Load settings
    await this.loadSettings();
    
    // Initialize services
    this.initializeServices();
    
    // Register custom icon
    addIcon('meeting-sync', SYNC_ICON);
    
    // Add settings tab
    this.addSettingTab(new MeetingSyncSettingsTab(this.app, this));
    
    // Add status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.updateStatusBar('idle');
    this.statusBarItem.addEventListener('click', () => this.showSyncLog());
    
    // Register commands
    this.registerCommands();
    
    // Register event handlers
    this.registerEventHandlers();
    
    // Start services
    await this.startServices();
    
    console.log('MeetingSync: Plugin loaded successfully');
  }
  
  async onunload(): Promise<void> {
    console.log('MeetingSync: Unloading plugin');
    
    // Clean up services
    this.folderWatcher?.destroy();
    this.otterService?.destroy();
  }
  
  /**
   * Initialize all services
   */
  private initializeServices(): void {
    this.transcriptParser = new TranscriptParser();
    this.vaultIndex = new VaultIndexService(this.app);
    this.autoLinker = new AutoLinker(this.vaultIndex, this.settings.maxMatchesBeforeSkip);
    this.aiService = new AIService();
    this.folderWatcher = new FolderWatcher(this.app);
    this.otterService = new OtterService();
    this.noteGenerator = new NoteGenerator(this.app);
    
    // Configure services with current settings
    this.updateAllServices();
  }
  
  /**
   * Update all services with current settings
   */
  private updateAllServices(): void {
    this.updateVaultIndex();
    this.updateAutoLinker();
    this.updateAIService();
    this.updateFolderWatcher();
    this.updateOtterService();
    this.updateNoteGenerator();
  }
  
  /**
   * Start background services
   */
  private async startServices(): Promise<void> {
    // Build vault index
    await this.vaultIndex.buildIndex();
    
    // Start folder watcher if enabled
    if (this.settings.folderWatcherEnabled && this.settings.watchFolder) {
      this.folderWatcher.startWatching();
    }
    
    // Start Otter sync if enabled and connected
    if (this.settings.otterEnabled && this.settings.otterAccessToken) {
      this.otterService.startSync();
    }
    
    // Collect existing tags for AI suggestions
    this.collectExistingTags();
  }
  
  /**
   * Register all commands
   */
  private registerCommands(): void {
    // Sync now
    this.addCommand({
      id: 'sync-now',
      name: 'Sync now',
      callback: () => this.syncNow(),
    });
    
    // Import file
    this.addCommand({
      id: 'import-file',
      name: 'Import file',
      callback: () => this.importFile(),
    });
    
    // Rebuild vault index
    this.addCommand({
      id: 'rebuild-vault-index',
      name: 'Rebuild vault index',
      callback: () => this.rebuildVaultIndex(),
    });
    
    // Reprocess current note
    this.addCommand({
      id: 'reprocess-current-note',
      name: 'Reprocess current note',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === 'md') {
          if (!checking) {
            this.reprocessNote(file);
          }
          return true;
        }
        return false;
      },
    });
    
    // View sync log
    this.addCommand({
      id: 'view-sync-log',
      name: 'View sync log',
      callback: () => this.showSyncLog(),
    });
  }
  
  /**
   * Register event handlers for vault changes
   */
  private registerEventHandlers(): void {
    // Update index when files change
    this.registerEvent(
      this.app.vault.on('create', () => {
        this.vaultIndex.scheduleIncrementalUpdate();
      })
    );
    
    this.registerEvent(
      this.app.vault.on('rename', () => {
        this.vaultIndex.scheduleIncrementalUpdate();
      })
    );
    
    this.registerEvent(
      this.app.vault.on('delete', () => {
        this.vaultIndex.scheduleIncrementalUpdate();
      })
    );
    
    // Set up folder watcher callback
    this.folderWatcher.onNewFile(async (file) => {
      await this.processLocalFile(file);
    });
    
    // Set up Otter service callbacks
    this.otterService.setCallbacks(
      async (transcripts) => {
        for (const transcript of transcripts) {
          await this.processTranscript(transcript);
        }
      },
      (status) => {
        this.updateStatusBar(status.status, status.message);
      },
      async (accessToken, refreshToken) => {
        this.settings.otterAccessToken = accessToken;
        this.settings.otterRefreshToken = refreshToken;
        await this.saveSettings();
      }
    );
  }
  
  /**
   * Process a local transcript file
   */
  private async processLocalFile(file: TFile): Promise<void> {
    try {
      this.addLog('Import', 'processing', `Processing ${file.name}...`);
      
      // Read file content
      const content = await this.app.vault.read(file);
      
      // Parse transcript
      const transcript = await this.transcriptParser.parseFile(content, file.name);
      
      // Check for duplicates
      if (this.isDuplicate(transcript.hash)) {
        this.addLog('Import', 'warning', `Skipped duplicate: ${file.name}`);
        return;
      }
      
      // Process the transcript
      await this.processTranscript(transcript);
      
      this.addLog('Import', 'success', `Imported ${file.name}`);
      
    } catch (error: any) {
      this.addLog('Import', 'error', `Failed to import ${file.name}`, error.message);
      console.error('MeetingSync: Import failed', error);
    }
  }
  
  /**
   * Process a transcript and create a note
   */
  async processTranscript(transcript: RawTranscript): Promise<TFile | null> {
    try {
      // Check for duplicate
      if (this.isDuplicate(transcript.hash)) {
        console.log(`MeetingSync: Skipping duplicate transcript ${transcript.title}`);
        return null;
      }
      
      // AI enrichment (if enabled)
      let enrichment = null;
      if (this.settings.aiEnabled && this.aiService.isEnabled()) {
        try {
          this.updateStatusBar('syncing', 'AI processing...');
          enrichment = await this.aiService.processTranscript(transcript);
        } catch (error) {
          console.error('MeetingSync: AI enrichment failed', error);
          // Continue without AI enrichment
        }
      }
      
      // Auto-linking (if enabled)
      let autoLinks = new Map<string, string>();
      let suggestedLinks: { term: string; candidates: string[] }[] = [];
      
      if (this.settings.autoLinkingEnabled) {
        // Get all text to process
        const textToProcess = this.getTextForAutoLinking(transcript, enrichment);
        const linkResult = this.autoLinker.processText(textToProcess);
        suggestedLinks = linkResult.suggestedLinks;
        
        // Build autoLinks map from the result
        // We'll apply links during note generation
      }
      
      // Create processed meeting object
      const processedMeeting: ProcessedMeeting = {
        transcript,
        enrichment: enrichment || undefined,
        autoLinks,
        suggestedLinks,
      };
      
      // Generate note
      const file = await this.noteGenerator.generateNote(processedMeeting);
      
      // Mark as processed
      this.markProcessed(transcript.hash);
      
      this.updateStatusBar('idle');
      return file;
      
    } catch (error: any) {
      this.updateStatusBar('error', error.message);
      throw error;
    }
  }
  
  /**
   * Get combined text for auto-linking
   */
  private getTextForAutoLinking(transcript: RawTranscript, enrichment: any): string {
    const parts: string[] = [];
    
    // Add transcript segments
    parts.push(transcript.segments.map(s => s.text).join(' '));
    
    // Add enrichment text if available
    if (enrichment) {
      if (enrichment.summary) {
        parts.push(enrichment.summary);
      }
      if (enrichment.actionItems) {
        parts.push(enrichment.actionItems.map((a: any) => a.task).join(' '));
      }
      if (enrichment.decisions) {
        parts.push(enrichment.decisions.join(' '));
      }
    }
    
    return parts.join('\n');
  }
  
  /**
   * Check if a transcript has already been processed
   */
  private isDuplicate(hash: string): boolean {
    return this.settings.processedHashes.includes(hash);
  }
  
  /**
   * Mark a transcript as processed
   */
  private async markProcessed(hash: string): Promise<void> {
    if (!this.settings.processedHashes.includes(hash)) {
      this.settings.processedHashes.push(hash);
      
      // Keep only last 1000 hashes to prevent unbounded growth
      if (this.settings.processedHashes.length > 1000) {
        this.settings.processedHashes = this.settings.processedHashes.slice(-1000);
      }
      
      await this.saveSettings();
    }
  }
  
  /**
   * Collect existing tags from vault for AI suggestions
   */
  private collectExistingTags(): void {
    const tags = new Set<string>();
    
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      
      // Get tags from frontmatter
      if (cache?.frontmatter?.tags) {
        const fmTags = Array.isArray(cache.frontmatter.tags) 
          ? cache.frontmatter.tags 
          : [cache.frontmatter.tags];
        fmTags.forEach(t => tags.add(String(t)));
      }
      
      // Get inline tags
      if (cache?.tags) {
        cache.tags.forEach(t => tags.add(t.tag.replace('#', '')));
      }
    }
    
    this.aiService.setExistingTags(Array.from(tags));
  }
  
  // ===== Command Implementations =====
  
  /**
   * Trigger immediate sync
   */
  async syncNow(): Promise<void> {
    if (this.settings.otterEnabled && this.settings.otterAccessToken) {
      new Notice('Starting Otter.ai sync...');
      await this.otterService.sync();
    } else {
      new Notice('Otter.ai sync is not configured');
    }
  }
  
  /**
   * Import a file manually
   */
  async importFile(): Promise<void> {
    // Use Obsidian's file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vtt,.srt,.txt,.json';
    
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const content = await file.text();
        const transcript = await this.transcriptParser.parseFile(content, file.name);
        
        if (this.isDuplicate(transcript.hash)) {
          new Notice('This transcript has already been imported');
          return;
        }
        
        new Notice(`Importing ${file.name}...`);
        const note = await this.processTranscript(transcript);
        
        if (note) {
          new Notice(`Created: ${note.basename}`);
          // Open the new note
          await this.app.workspace.openLinkText(note.path, '', false);
        }
        
      } catch (error: any) {
        new Notice(`Import failed: ${error.message}`);
        console.error('MeetingSync: Import failed', error);
      }
    };
    
    input.click();
  }
  
  /**
   * Rebuild the vault index
   */
  async rebuildVaultIndex(): Promise<void> {
    const startTime = Date.now();
    await this.vaultIndex.buildIndex();
    const elapsed = Date.now() - startTime;
    
    const index = this.vaultIndex.getIndex();
    new Notice(`Vault index rebuilt in ${elapsed}ms (${index.sortedTerms.length} terms)`);
  }
  
  /**
   * Reprocess an existing meeting note
   */
  async reprocessNote(file: TFile): Promise<void> {
    new Notice('Reprocessing feature coming soon');
    // TODO: Implement re-processing of existing notes
  }
  
  /**
   * Show the sync log modal
   */
  showSyncLog(): void {
    new SyncLogModal(this.app, this.syncLogs).open();
  }
  
  // ===== Service Update Methods =====
  
  updateVaultIndex(): void {
    const excludedFolders = this.settings.excludedFolders
      .split(',')
      .map(f => f.trim())
      .filter(f => f);
    
    this.vaultIndex.configure(excludedFolders, this.settings.generateImplicitAliases);
  }
  
  updateAutoLinker(): void {
    this.autoLinker.setMaxMatches(this.settings.maxMatchesBeforeSkip);
  }
  
  updateAIService(): void {
    this.aiService.configure(
      this.settings.aiProvider,
      this.settings.claudeApiKey,
      this.settings.openaiApiKey,
      {
        enableSummary: this.settings.enableSummary,
        enableActionItems: this.settings.enableActionItems,
        enableDecisions: this.settings.enableDecisions,
        enableTagSuggestions: this.settings.enableTagSuggestions,
      }
    );
  }
  
  updateFolderWatcher(): void {
    this.folderWatcher.configure(
      this.settings.watchFolder,
      this.settings.folderWatcherEnabled
    );
  }
  
  updateOtterService(): void {
    this.otterService.configure(
      this.settings.otterAccessToken,
      this.settings.otterRefreshToken,
      this.settings.otterEmail,
      this.settings.syncInterval,
      this.settings.lastSyncTimestamp
    );
  }
  
  updateNoteGenerator(): void {
    this.noteGenerator.configure(
      this.settings.outputFolder,
      this.settings.filenameTemplate
    );
  }
  
  restartOtterSync(): void {
    this.otterService.stopSync();
    this.updateOtterService();
    
    if (this.settings.otterEnabled && this.settings.otterAccessToken) {
      this.otterService.startSync();
    }
  }
  
  // ===== UI Methods =====
  
  /**
   * Update the status bar indicator
   */
  private updateStatusBar(status: 'idle' | 'syncing' | 'error', message?: string): void {
    this.statusBarItem.empty();
    
    const icon = this.statusBarItem.createSpan({ cls: 'meetingsync-status-icon' });
    
    switch (status) {
      case 'idle':
        setIcon(icon, 'check');
        this.statusBarItem.setAttribute('aria-label', 'MeetingSync: Idle');
        break;
      case 'syncing':
        setIcon(icon, 'sync');
        icon.addClass('meetingsync-spinning');
        this.statusBarItem.setAttribute('aria-label', `MeetingSync: ${message || 'Syncing...'}`);
        break;
      case 'error':
        setIcon(icon, 'alert-triangle');
        this.statusBarItem.setAttribute('aria-label', `MeetingSync: ${message || 'Error'}`);
        break;
    }
  }
  
  /**
   * Add a log entry
   */
  private addLog(action: string, status: 'success' | 'error' | 'warning' | 'processing', message: string, details?: string): void {
    // Map 'processing' to 'warning' for the log entry type
    const logStatus = status === 'processing' ? 'warning' : status;
    
    this.syncLogs.push({
      timestamp: new Date(),
      action,
      status: logStatus,
      message,
      details,
    });
    
    // Keep only recent logs
    if (this.syncLogs.length > this.maxLogs) {
      this.syncLogs = this.syncLogs.slice(-this.maxLogs);
    }
  }
  
  // ===== Settings =====
  
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

