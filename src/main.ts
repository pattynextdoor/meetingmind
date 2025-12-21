/**
 * MeetingMind - Obsidian Plugin
 * Automatically import meeting transcripts with AI-powered enrichment and auto-linking
 */

import { 
  Plugin, 
  TFile, 
  Notice, 
  addIcon,
  setIcon,
  Modal,
  App
} from 'obsidian';

import { 
  MeetingMindSettings, 
  DEFAULT_SETTINGS, 
  RawTranscript, 
  ProcessedMeeting,
  SyncLogEntry,
  TranscriptSegment,
  EntityExtraction,
  AIEnrichment
} from './types';

import { TranscriptParser } from './services/TranscriptParser';
import { VaultIndexService } from './services/VaultIndex';
import { AutoLinker } from './services/AutoLinker';
import { AIService } from './services/AIService';
import { FolderWatcher } from './services/FolderWatcher';
import { OtterService } from './services/OtterService';
import { FirefliesService } from './services/FirefliesService';
import { NoteGenerator } from './services/NoteGenerator';
import { ParticipantService } from './services/ParticipantService';
import { EntityService } from './services/EntityService';
import { LicenseService } from './services/LicenseService';
import { StatsService } from './services/StatsService';
import { MeetingMindSettingsTab } from './ui/SettingsTab';
import { SyncLogModal } from './ui/SyncLogModal';

// Custom icon for status bar
const SYNC_ICON = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="40"/><path d="M50 25v25l15 15"/></svg>`;

export default class MeetingMindPlugin extends Plugin {
  settings: MeetingMindSettings;
  
  // Services
  transcriptParser: TranscriptParser;
  vaultIndex: VaultIndexService;
  autoLinker: AutoLinker;
  aiService: AIService;
  folderWatcher: FolderWatcher;
  otterService: OtterService;
  firefliesService: FirefliesService;
  noteGenerator: NoteGenerator;
  participantService: ParticipantService;
  entityService: EntityService;
  licenseService: LicenseService;
  statsService: StatsService;
  
  // UI Elements
  statusBarItem: HTMLElement;
  
  // State
  syncLogs: SyncLogEntry[] = [];
  private maxLogs = 100;
  
  async onload(): Promise<void> {
    console.debug('MeetingMind: Loading plugin');
    
    // Load settings
    await this.loadSettings();
    
    // Initialize services
    await this.initializeServices();
    
    // Register custom icon
    addIcon('meeting-sync', SYNC_ICON);
    
    // Add settings tab
    this.addSettingTab(new MeetingMindSettingsTab(this.app, this));
    
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
    
    console.debug('MeetingMind: Plugin loaded successfully');
  }
  
  onunload(): void {
    console.debug('MeetingMind: Unloading plugin');
    
    // Clean up services
    this.folderWatcher?.destroy();
    this.otterService?.destroy();
    this.firefliesService?.destroy();
  }
  
  /**
   * Initialize all services
   */
  private async initializeServices(): Promise<void> {
    this.transcriptParser = new TranscriptParser();
    this.vaultIndex = new VaultIndexService(this.app);
    this.autoLinker = new AutoLinker(this.vaultIndex, this.settings.maxMatchesBeforeSkip);
    this.aiService = new AIService();
    this.folderWatcher = new FolderWatcher(this.app);
    this.otterService = new OtterService();
    this.firefliesService = new FirefliesService();
    this.noteGenerator = new NoteGenerator(this.app);
    this.participantService = new ParticipantService(this.app, this.aiService);
    this.entityService = new EntityService(this.app, this.aiService);
    this.licenseService = new LicenseService();
    this.statsService = new StatsService(this.app);
    
    // Initialize license
    if (this.settings.licenseKey) {
      await this.licenseService.setLicenseKey(this.settings.licenseKey);
    }
    
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
    this.updateFirefliesService();
    this.updateNoteGenerator();
    this.updateParticipantService();
    this.updateEntityService();
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
    
    // Start Fireflies sync if enabled and configured
    if (this.settings.firefliesEnabled && this.settings.firefliesApiKey) {
      this.firefliesService.startSync();
    }
    
    // Archive resolved issues (run silently in background)
    if (this.settings.autoExtractEntities && this.settings.enableIssueExtraction) {
      this.entityService.archiveResolvedIssues(this.settings.issueArchiveDays)
        .then(result => {
          if (result.archived > 0) {
            console.debug(`MeetingMind: Auto-archived ${result.archived} resolved issue(s)`);
          }
        })
        .catch(error => {
          console.error('MeetingMind: Auto-archive failed', error);
        });
    }
    
    // Collect existing tags for AI suggestions
    this.collectExistingTags();
  }
  
  /**
   * Register all commands
   */
  private registerCommands(): void {
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
    
    // Reprocess all meetings in folder
    this.addCommand({
      id: 'reprocess-all-meetings',
      name: 'Reprocess all meetings (add AI to existing notes)',
      callback: () => this.reprocessAllMeetings(),
    });
    
    // View sync log
    this.addCommand({
      id: 'view-sync-log',
      name: 'View sync log',
      callback: () => this.showSyncLog(),
    });
    
    // Clear import history
    this.addCommand({
      id: 'clear-import-history',
      name: 'Clear import history',
      callback: () => this.clearImportHistory(),
    });
    
    // Cleanup orphaned references
    this.addCommand({
      id: 'cleanup-orphaned-references',
      name: 'Cleanup orphaned references',
      callback: () => this.cleanupOrphanedReferences(),
    });
    
    // Archive resolved issues
    this.addCommand({
      id: 'archive-resolved-issues',
      name: 'Archive resolved issues',
      callback: () => this.archiveResolvedIssues(),
    });
    
    // Generate meeting dashboard
    this.addCommand({
      id: 'generate-dashboard',
      name: 'Generate meeting dashboard',
      callback: () => this.generateDashboard(),
    });
    
    // Update meeting dashboard
    this.addCommand({
      id: 'update-dashboard',
      name: 'Update dashboard',
      callback: () => this.generateDashboard(),
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
    
    // Set up Fireflies service callbacks
    this.firefliesService.setCallbacks(
      async (transcripts) => {
        for (const transcript of transcripts) {
          await this.processTranscript(transcript);
        }
      },
      (status) => {
        const statusType = status.status === 'idle' || status.status === 'syncing' || status.status === 'error' 
          ? status.status 
          : 'idle';
        this.updateStatusBar(statusType, status.message);
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
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.addLog('Import', 'error', `Failed to import ${file.name}`, errorMessage);
      console.error('MeetingMind: Import failed', error);
    }
  }
  
  /**
   * Process a transcript and create a note
   * @param skipDuplicateCheck - If true, skips the duplicate check (for manual imports)
   */
  async processTranscript(transcript: RawTranscript, skipDuplicateCheck: boolean = false): Promise<TFile | null> {
    try {
      // Check for duplicate (unless skipped for manual imports)
      if (!skipDuplicateCheck && this.isDuplicate(transcript.hash)) {
        console.debug(`MeetingMind: Skipping duplicate transcript ${transcript.title}`);
        return null;
      }
      
      // Step 1: AI enrichment
      const enrichment = await this.runAIEnrichment(transcript);
      
      // Step 2: Auto-linking
      const suggestedLinks = this.applyAutoLinking(transcript, enrichment);
      
      // Step 3: Extract entities (needed before participant processing)
      let entities: EntityExtraction | null = null;
      const hasAILicense = this.licenseService.hasFeature('aiEnrichment');
      if (this.settings.autoExtractEntities && hasAILicense && enrichment) {
        entities = await this.aiService.extractEntities(transcript);
        if (entities) {
          enrichment.entities = entities;
          
          // Enrich participant insights with entity information
          if (enrichment.participantInsights && enrichment.participantInsights.length > 0) {
            enrichment.participantInsights = this.aiService.enrichParticipantInsightsWithEntities(
              enrichment.participantInsights,
              entities,
              transcript.date
            );
          }
        }
      }
      
      // Step 4: Generate meeting note
      const processedMeeting: ProcessedMeeting = {
        transcript,
        enrichment: enrichment || undefined,
        autoLinks: new Map<string, string>(),
        suggestedLinks,
      };
      const file = await this.noteGenerator.generateNote(processedMeeting);
      
      // Step 5: Process participants (now with enriched insights)
      await this.handleParticipants(transcript, file, enrichment);
      
      // Step 6: Process entities (create/update entity notes)
      if (entities) {
        await this.handleEntities(transcript, file, enrichment, entities);
      }
      
      // Mark as processed
      await this.markProcessed(transcript.hash);
      
      this.updateStatusBar('idle');
      return file;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.updateStatusBar('error', errorMessage);
      throw error;
    }
  }
  
  // ==================== Transcript Processing Steps ====================
  
  /**
   * Run AI enrichment on the transcript if enabled and licensed
   */
  private async runAIEnrichment(transcript: RawTranscript): Promise<AIEnrichment | null> {
    if (!this.settings.aiEnabled || !this.aiService.isEnabled()) {
      return null;
    }
    
    const hasAILicense = this.licenseService.hasFeature('aiEnrichment');
    if (!hasAILicense) {
      console.debug('MeetingMind: AI features require Pro license');
      return null;
    }
    
    try {
      this.updateStatusBar('syncing', 'AI processing...');
      return await this.aiService.processTranscript(transcript);
    } catch (error) {
      console.error('MeetingMind: AI enrichment failed', error);
      return null; // Continue without AI enrichment
    }
  }
  
  /**
   * Apply auto-linking to transcript segments and enrichment
   * Returns the list of suggested (ambiguous) links
   */
  private applyAutoLinking(
    transcript: RawTranscript, 
    enrichment: AIEnrichment | null
  ): { term: string; candidates: string[] }[] {
    if (!this.settings.autoLinkingEnabled) {
      return [];
    }
    
    const suggestedLinks: { term: string; candidates: string[] }[] = [];
    
    // Apply to transcript segments
    for (const segment of transcript.segments) {
      const linkResult = this.autoLinker.processText(segment.text);
      segment.text = linkResult.linkedText;
      
      // Collect suggested links (deduplicated)
      for (const suggestion of linkResult.suggestedLinks) {
        const alreadyExists = suggestedLinks.some(
          s => s.term.toLowerCase() === suggestion.term.toLowerCase()
        );
        if (!alreadyExists) {
          suggestedLinks.push(suggestion);
        }
      }
    }
    
    // Apply to AI enrichment summary if available
    if (enrichment?.summary) {
      const summaryResult = this.autoLinker.processText(enrichment.summary);
      enrichment.summary = summaryResult.linkedText;
    }
    
    return suggestedLinks;
  }
  
  /**
   * Create or update participant notes based on meeting attendees
   */
  private async handleParticipants(
    transcript: RawTranscript,
    file: TFile,
    enrichment: AIEnrichment | null
  ): Promise<void> {
    if (!this.settings.autoCreateParticipants || transcript.participants.length === 0) {
      return;
    }
    
    try {
      const hasInsightsLicense = this.licenseService.hasFeature('participantInsights');
      const participantInsights = hasInsightsLicense ? enrichment?.participantInsights : undefined;
      
      const result = await this.participantService.processParticipants(
        transcript.participants,
        transcript.title,
        file.path,
        transcript.date,
        participantInsights
      );
      
      if (result.created.length > 0) {
        console.debug(`MeetingMind: Created participant notes for: ${result.created.join(', ')}`);
        new Notice(`Created notes for: ${result.created.join(', ')}`);
        this.vaultIndex.scheduleIncrementalUpdate();
      }
      
      if (result.updated.length > 0) {
        console.debug(`MeetingMind: Updated participant notes for: ${result.updated.join(', ')}`);
      }
    } catch (error) {
      console.error('MeetingMind: Failed to process participant notes', error);
      // Continue - don't block meeting note creation
    }
  }
  
  /**
   * Extract and process entities (issues, updates, topics) from the transcript
   */
  private async handleEntities(
    transcript: RawTranscript,
    file: TFile,
    enrichment: AIEnrichment | null,
    entities: EntityExtraction
  ): Promise<void> {
    if (!this.settings.autoExtractEntities || !enrichment) {
      return;
    }
    
    try {
      // Analyze and update status of existing entities
      await this.updateExistingEntityStatuses(transcript);
      
      // Create/update entity notes
      await this.createEntityNotes(transcript, file, entities);
    } catch (error) {
      console.error('MeetingMind: Failed to process entities', error);
      // Continue - don't block meeting note creation
    }
  }
  
  /**
   * Analyze meeting content to update status of existing entities
   */
  private async updateExistingEntityStatuses(transcript: RawTranscript): Promise<void> {
    const existingEntities = await this.entityService.getExistingEntities();
    
    if (existingEntities.length === 0) {
      return;
    }
    
    try {
      const statusUpdates = await this.aiService.analyzeEntityStatusChanges(
        transcript,
        existingEntities.map(e => ({ name: e.name, type: e.type, currentStatus: e.currentStatus }))
      );
      
      for (const update of statusUpdates) {
        const entity = existingEntities.find(e => 
          e.name.toLowerCase() === update.entityName.toLowerCase() && 
          e.type === update.entityType
        );
        
        if (entity && update.newStatus) {
          await this.entityService.updateEntityStatus(
            entity.path,
            update.newStatus,
            update.reason
          );
        }
      }
      
      if (statusUpdates.length > 0) {
        console.debug(`MeetingMind: Updated status for ${statusUpdates.length} entity(ies)`);
      }
    } catch (error) {
      console.error('MeetingMind: Failed to analyze entity status changes', error);
      // Continue - don't block entity extraction
    }
  }
  
  /**
   * Create entity notes from extracted entities
   */
  private async createEntityNotes(
    transcript: RawTranscript,
    file: TFile,
    entities: EntityExtraction
  ): Promise<void> {
    const hasEntities = entities.issues.length > 0 || 
                        entities.updates.length > 0 || 
                        entities.topics.length > 0;
    
    if (!hasEntities) {
      return;
    }
    
    const entityResult = await this.entityService.processEntities(
      entities,
      transcript.title,
      file.path,
      transcript.date
    );
    
    if (entityResult.created.length > 0) {
      console.debug(`MeetingMind: Created entity notes for: ${entityResult.created.join(', ')}`);
      new Notice(`Created notes for: ${entityResult.created.join(', ')}`);
      this.vaultIndex.scheduleIncrementalUpdate();
    }
    
    if (entityResult.updated.length > 0) {
      console.debug(`MeetingMind: Updated entity notes for: ${entityResult.updated.join(', ')}`);
    }
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
   * Import files manually (supports multiple file selection)
   * Skips duplicate check for manual imports
   */
  importFile(): void {
    // Use Obsidian's file picker with multiple selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vtt,.srt,.txt,.json';
    input.multiple = true; // Allow multiple file selection
    
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      void (async () => {
        const totalFiles = files.length;
        let successCount = 0;
        let failCount = 0;
        let lastCreatedNote: TFile | null = null;
        
        // Show initial notice for bulk imports
        if (totalFiles > 1) {
          new Notice(`Importing ${totalFiles} files...`);
        }
        
        // Process each file sequentially
        for (let i = 0; i < totalFiles; i++) {
          const file = files[i];
          
          try {
            const content = await file.text();
            const transcript = await this.transcriptParser.parseFile(content, file.name);
            
            // Show progress for single file or update for bulk
            if (totalFiles === 1) {
              new Notice(`Importing ${file.name}...`);
            } else {
              this.updateStatusBar('syncing', `${i + 1}/${totalFiles}`);
            }
            
            // Manual imports skip duplicate check - user explicitly chose to import
            const note = await this.processTranscript(transcript, true); // skipDuplicateCheck = true
            
            if (note) {
              successCount++;
              lastCreatedNote = note;
              
              if (totalFiles === 1) {
                new Notice(`Created: ${note.basename}`);
              }
            }
            
          } catch (error: unknown) {
            failCount++;
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`MeetingMind: Import failed for ${file.name}`, error);
            
            if (totalFiles === 1) {
              new Notice(`Import failed: ${errorMessage}`);
            }
          }
        }
        
        // Show summary for bulk imports
        if (totalFiles > 1) {
          this.updateStatusBar('idle');
          if (failCount === 0) {
            new Notice(`✅ Imported ${successCount} meetings successfully!`);
          } else {
            new Notice(`Imported ${successCount}/${totalFiles} meetings (${failCount} failed)`);
          }
        }
        
        // Open the last created note
        if (lastCreatedNote) {
          await this.app.workspace.openLinkText(lastCreatedNote.path, '', false);
        }
      })();
    };
    
    input.click();
  }
  
  /**
   * Clear the import history to allow re-importing transcripts
   */
  async clearImportHistory(): Promise<void> {
    this.settings.processedHashes = [];
    await this.saveSettings();
    new Notice('Import history cleared. You can now re-import transcripts.');
  }
  
  /**
   * Generate or update the meeting dashboard
   */
  async generateDashboard(): Promise<void> {
    try {
      new Notice('Generating meeting dashboard...');
      const dashboardPath = `${this.settings.outputFolder}/Meeting Dashboard.md`;
      const file = await this.statsService.generateDashboardNote(dashboardPath);
      
      // Open the dashboard
      await this.app.workspace.getLeaf().openFile(file);
      new Notice('Meeting dashboard updated!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('MeetingMind: Dashboard generation failed', error);
      new Notice(`Dashboard failed: ${errorMessage}`);
    }
  }
  
  /**
   * Clean up orphaned references to deleted meeting files
   * Removes references from participant notes and entity notes
   */
  async cleanupOrphanedReferences(): Promise<void> {
    try {
      new Notice('Cleaning up orphaned references...');
      this.updateStatusBar('syncing', 'Cleaning up...');
      
      // Cleanup participant notes
      const participantResult = await this.participantService.cleanupOrphanedReferences();
      
      // Cleanup entity notes
      const entityResult = await this.entityService.cleanupOrphanedReferences();
      
      const totalCleaned = participantResult.cleaned + entityResult.cleaned;
      const totalRemoved = participantResult.removed + entityResult.removed;
      const totalDeleted = participantResult.deleted + entityResult.deleted;
      
      this.updateStatusBar('idle');
      
      if (totalRemoved > 0 || totalDeleted > 0) {
        let message = `Cleaned up ${totalRemoved} orphaned reference(s) from ${totalCleaned} note(s)`;
        if (totalDeleted > 0) {
          message += `. ${totalDeleted} empty entity note(s) deleted.`;
        }
        new Notice(message);
      } else {
        new Notice('No orphaned references found');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('MeetingMind: Cleanup failed', error);
      new Notice(`Cleanup failed: ${errorMessage}`);
      this.updateStatusBar('error', errorMessage);
    }
  }
  
  /**
   * Archive resolved issues that have been resolved for more than the configured days
   */
  async archiveResolvedIssues(): Promise<void> {
    try {
      new Notice('Archiving resolved issues...');
      this.updateStatusBar('syncing', 'Archiving...');
      
      const result = await this.entityService.archiveResolvedIssues(this.settings.issueArchiveDays);
      
      this.updateStatusBar('idle');
      
      if (result.archived > 0) {
        let message = `Archived ${result.archived} resolved issue(s)`;
        if (result.errors.length > 0) {
          message += ` (${result.errors.length} error(s))`;
        }
        new Notice(message);
        
        if (result.errors.length > 0) {
          console.error('MeetingMind: Archive errors:', result.errors);
        }
        
        // Rebuild vault index after archiving
        this.vaultIndex.scheduleIncrementalUpdate();
      } else {
        new Notice('No issues ready for archiving');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('MeetingMind: Archive failed', error);
      new Notice(`Archive failed: ${errorMessage}`);
      this.updateStatusBar('error', errorMessage);
    }
  }
  
  /**
   * Reprocess all meetings in the output folder to add AI enrichment
   * Useful when upgrading from Free to Pro
   */
  async reprocessAllMeetings(): Promise<void> {
    try {
      // Check if AI is enabled and licensed
      const hasAILicense = this.licenseService.hasFeature('aiEnrichment');
      
      if (!this.settings.aiEnabled || !this.aiService.isEnabled()) {
        new Notice('Please enable AI enrichment in settings first');
        return;
      }
      
      if (!hasAILicense) {
        new Notice('Pro license required for AI enrichment');
        return;
      }
      
      new Notice('Finding meetings to reprocess...');
      this.updateStatusBar('syncing', 'Finding meetings...');
      
      // Get all markdown files in the meetings folder
      const meetingsFolder = this.settings.outputFolder;
      const allFiles = this.app.vault.getMarkdownFiles();
      const meetingFiles = allFiles.filter(file => 
        file.path.startsWith(meetingsFolder + '/') && 
        !file.path.includes('/Archive/')
      );
      
      if (meetingFiles.length === 0) {
        new Notice(`No meetings found in ${meetingsFolder}/`);
        this.updateStatusBar('idle');
        return;
      }
      
      // Ask for confirmation
      const confirmed = await this.confirmBatchReprocess(meetingFiles.length);
      if (!confirmed) {
        new Notice('Reprocess cancelled');
        this.updateStatusBar('idle');
        return;
      }
      
      // Process each meeting
      let processed = 0;
      let skipped = 0;
      let failed = 0;
      
      for (const file of meetingFiles) {
        try {
          this.updateStatusBar('syncing', `Processing ${processed + 1}/${meetingFiles.length}...`);
          
          // Read and parse the note
          const content = await this.app.vault.read(file);
          const parsed = this.parseExistingNote(content);
          
          if (!parsed) {
            console.debug(`MeetingMind: Skipping ${file.basename} - not a meeting note`);
            skipped++;
            continue;
          }
          
          // Check if it already has AI enrichment
          if (parsed.existingEnrichment?.summary) {
            console.debug(`MeetingMind: Skipping ${file.basename} - already has AI enrichment`);
            skipped++;
            continue;
          }
          
          // Reprocess the note
          await this.reprocessNoteInternal(file, parsed.transcript);
          processed++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`MeetingMind: Failed to reprocess ${file.basename}`, error);
          failed++;
        }
      }
      
      this.updateStatusBar('idle');
      
      // Show summary
      let summary = `Reprocessed ${processed} meeting(s)`;
      if (skipped > 0) {
        summary += `, skipped ${skipped}`;
      }
      if (failed > 0) {
        summary += `, failed ${failed}`;
      }
      
      new Notice(summary);
      
      // Log to sync log
      this.syncLogs.push({
        timestamp: new Date(),
        action: 'Batch reprocess',
        status: failed > 0 ? 'warning' : 'success',
        message: summary,
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('MeetingMind: Batch reprocess failed', error);
      new Notice(`Batch reprocess failed: ${errorMessage}`);
      this.updateStatusBar('error', errorMessage);
    }
  }
  
  /**
   * Ask user to confirm batch reprocess
   */
  private async confirmBatchReprocess(count: number): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new (class extends Modal {
        constructor(app: App) {
          super(app);
        }
        
        onOpen() {
          const { contentEl } = this;
          
          contentEl.createEl('h2', { text: 'Reprocess all meetings?' });
          
          contentEl.createEl('p', { 
            text: `This will add AI enrichment (summaries, action items, etc.) to ${count} meeting note(s).`
          });
          
          contentEl.createEl('p', { 
            text: 'This may take several minutes and will use your AI API credits.',
            cls: 'mod-warning'
          });
          
          const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
          
          buttonContainer.createEl('button', { text: 'Cancel' })
            .addEventListener('click', () => {
              resolve(false);
              this.close();
            });
          
          const confirmBtn = buttonContainer.createEl('button', { 
            text: `Reprocess ${count} meeting(s)`,
            cls: 'mod-cta'
          });
          confirmBtn.addEventListener('click', () => {
            resolve(true);
            this.close();
          });
        }
        
        onClose() {
          const { contentEl } = this;
          contentEl.empty();
        }
      })(this.app);
      
      modal.open();
    });
  }
  
  /**
   * Internal reprocess method (without UI notifications)
   */
  private async reprocessNoteInternal(file: TFile, transcript: RawTranscript): Promise<void> {
    // AI enrichment
    const enrichment = await this.aiService.processTranscript(transcript);
    
    // Extract entities if enabled
    let entities: EntityExtraction | null = null;
    if (this.settings.autoExtractEntities && enrichment) {
      entities = await this.aiService.extractEntities(transcript);
      if (entities) {
        enrichment.entities = entities;
        
        // Enrich participant insights with entity information
        if (enrichment.participantInsights && enrichment.participantInsights.length > 0) {
          enrichment.participantInsights = this.aiService.enrichParticipantInsightsWithEntities(
            enrichment.participantInsights,
            entities,
            transcript.date
          );
        }
      }
    }
    
    // Re-run auto-linking
    const suggestedLinks = this.applyAutoLinking(transcript, enrichment);
    
    // Create processed meeting
    const processedMeeting: ProcessedMeeting = {
      transcript,
      enrichment: enrichment || undefined,
      autoLinks: new Map(),
      suggestedLinks,
    };
    
    // Generate new content
    const newContent = this.noteGenerator.buildNoteContent(processedMeeting);
    
    // Update file
    await this.app.vault.modify(file, newContent);
    
    // Process participants if enabled
    if (this.settings.autoCreateParticipants) {
      await this.handleParticipants(transcript, file, enrichment);
    }
    
    // Process entities if we extracted them
    if (entities) {
      await this.handleEntities(transcript, file, enrichment, entities);
    }
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
   * Re-runs AI enrichment and auto-linking on the note
   */
  async reprocessNote(file: TFile): Promise<void> {
    try {
      new Notice(`Reprocessing ${file.basename}...`);
      
      // Read the current note content
      const content = await this.app.vault.read(file);
      
      // Parse the note to extract transcript data
      const parsed = this.parseExistingNote(content);
      if (!parsed) {
        new Notice('Could not parse note. Is this a MeetingMind meeting note?');
        return;
      }
      
      const { transcript, existingEnrichment } = parsed;
      
      // AI enrichment (if enabled and licensed)
      let enrichment = existingEnrichment;
      const hasAILicense = this.licenseService.hasFeature('aiEnrichment');
      
      if (this.settings.aiEnabled && this.aiService.isEnabled() && hasAILicense) {
        try {
          this.updateStatusBar('syncing', 'AI processing...');
          enrichment = await this.aiService.processTranscript(transcript);
          new Notice('AI enrichment complete');
        } catch (error) {
          console.error('MeetingMind: AI enrichment failed during reprocess', error);
          new Notice('AI enrichment failed, keeping existing content');
        }
      }
      
      // Re-run auto-linking on transcript segments
      let suggestedLinks: { term: string; candidates: string[] }[] = [];
      
      if (this.settings.autoLinkingEnabled) {
        for (const segment of transcript.segments) {
          const linkResult = this.autoLinker.processText(segment.text);
          segment.text = linkResult.linkedText;
          
          for (const suggestion of linkResult.suggestedLinks) {
            if (!suggestedLinks.find(s => s.term.toLowerCase() === suggestion.term.toLowerCase())) {
              suggestedLinks.push(suggestion);
            }
          }
        }
        
        // Also apply to summary if available
        if (enrichment?.summary) {
          const summaryResult = this.autoLinker.processText(enrichment.summary);
          enrichment.summary = summaryResult.linkedText;
        }
      }
      
      // Create processed meeting object
      const processedMeeting: ProcessedMeeting = {
        transcript,
        enrichment: enrichment || undefined,
        autoLinks: new Map(),
        suggestedLinks,
      };
      
      // Generate new note content
      const newContent = this.noteGenerator.buildNoteContent(processedMeeting);
      
      // Update the file in place
      await this.app.vault.modify(file, newContent);
      
      this.updateStatusBar('idle');
      new Notice(`Reprocessed ${file.basename}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('MeetingMind: Reprocess failed', error);
      new Notice(`Reprocess failed: ${errorMessage}`);
      this.updateStatusBar('error', errorMessage);
    }
  }
  
  /**
   * Parse an existing meeting note to extract transcript data
   */
  private parseExistingNote(content: string): { transcript: RawTranscript; existingEnrichment: AIEnrichment | null } | null {
    try {
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return null;
      }
      
      const frontmatter = frontmatterMatch[1];
      
      // Parse frontmatter values
      const dateMatch = frontmatter.match(/date:\s*(.+)/);
      const durationMatch = frontmatter.match(/duration:\s*(\d+)/);
      const sourceMatch = frontmatter.match(/source:\s*(\w+)/);
      const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s+-\s*.+\n)*)/);
      
      // Extract participants/attendees
      const attendeesMatch = frontmatter.match(/attendees:\s*\n((?:\s+-\s*.+\n)*)/);
      const participants: string[] = [];
      if (attendeesMatch) {
        const attendeeLines = attendeesMatch[1].match(/-\s*"?\[\[([^\]]+)\]\]"?/g) || [];
        for (const line of attendeeLines) {
          const nameMatch = line.match(/\[\[([^\]|]+)/);
          if (nameMatch) {
            participants.push(nameMatch[1]);
          }
        }
      }
      
      // Extract transcript from callout
      const transcriptMatch = content.match(/## Transcript\n\n> \[\!note\][^\n]*\n([\s\S]*?)(?=\n## |$)/);
      if (!transcriptMatch) {
        return null;
      }
      
      const transcriptLines = transcriptMatch[1].split('\n').filter(line => line.startsWith('> '));
      const segments: TranscriptSegment[] = [];
      
      for (const line of transcriptLines) {
        // Parse: > **Speaker** (00:00): Text  or  > (00:00): Text
        const segmentMatch = line.match(/^>\s*(?:\*\*([^*]+)\*\*\s*)?\((\d+:\d+(?::\d+)?)\):\s*(.+)/);
        if (segmentMatch) {
          const speaker = segmentMatch[1] || '';
          const timestampStr = segmentMatch[2];
          const text = segmentMatch[3];
          
          // Parse timestamp to seconds
          const timeParts = timestampStr.split(':').map(Number);
          let timestamp = 0;
          if (timeParts.length === 3) {
            timestamp = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          } else if (timeParts.length === 2) {
            timestamp = timeParts[0] * 60 + timeParts[1];
          }
          
          segments.push({ speaker, timestamp, text });
        }
      }
      
      if (segments.length === 0) {
        return null;
      }
      
      // Extract existing enrichment if present
      let existingEnrichment: AIEnrichment | null = null;
      
      const summaryMatch = content.match(/## Summary\n\n([\s\S]*?)(?=\n## |$)/);
      const actionItemsMatch = content.match(/## Action Items\n\n([\s\S]*?)(?=\n## |$)/);
      const decisionsMatch = content.match(/## Decisions\n\n([\s\S]*?)(?=\n## |$)/);
      
      if (summaryMatch || actionItemsMatch || decisionsMatch) {
        existingEnrichment = {
          summary: summaryMatch ? summaryMatch[1].trim() : '',
          actionItems: [],
          decisions: [],
          suggestedTags: [],
        };
        
        // Parse action items
        if (actionItemsMatch) {
          const itemLines = actionItemsMatch[1].match(/- \[.\]\s+(.+)/g) || [];
          for (const itemLine of itemLines) {
            const taskMatch = itemLine.match(/- \[.\]\s+(.+?)(?:\s+\(([^)]+)\))?$/);
            if (taskMatch) {
              const task = taskMatch[1];
              const metadata = taskMatch[2] || '';
              const assigneeMatch = metadata.match(/@(\w+)/);
              const dueMatch = metadata.match(/due:\s*([^,)]+)/);
              
              existingEnrichment.actionItems.push({
                task,
                assignee: assigneeMatch ? assigneeMatch[1] : undefined,
                dueDate: dueMatch ? dueMatch[1].trim() : undefined,
              });
            }
          }
        }
        
        // Parse decisions
        if (decisionsMatch) {
          const decisionLines = decisionsMatch[1].match(/^-\s+(.+)/gm) || [];
          existingEnrichment.decisions = decisionLines.map(line => line.replace(/^-\s+/, ''));
        }
        
        // Parse existing tags from frontmatter
        if (tagsMatch) {
          const tagLines = tagsMatch[1].match(/-\s*(.+)/g) || [];
          existingEnrichment.suggestedTags = tagLines.map(line => line.replace(/^-\s*/, '').trim());
        }
      }
      
      // Build RawTranscript
      const date = dateMatch ? new Date(dateMatch[1]) : new Date();
      const duration = durationMatch ? parseInt(durationMatch[1]) : 0;
      const source = (sourceMatch ? sourceMatch[1] : 'local') as 'otter' | 'local';
      
      // Generate hash from transcript content
      const transcriptText = segments.map(s => s.text).join(' ');
      const hash = this.transcriptParser.generateHash(transcriptText);
      
      const transcript: RawTranscript = {
        source,
        title: '', // Will use existing filename
        date,
        duration,
        participants,
        segments,
        hash,
      };
      
      return { transcript, existingEnrichment };
      
    } catch (error) {
      console.error('MeetingMind: Failed to parse existing note', error);
      return null;
    }
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
  
  updateFirefliesService(): void {
    this.firefliesService.configure(
      this.settings.firefliesApiKey,
      this.settings.firefliesSyncInterval,
      this.settings.firefliesLastSync
    );
  }
  
  restartFirefliesSync(): void {
    this.firefliesService.stopSync();
    this.updateFirefliesService();
    
    if (this.settings.firefliesEnabled && this.settings.firefliesApiKey) {
      this.firefliesService.startSync();
    }
  }
  
  updateNoteGenerator(): void {
    this.noteGenerator.configure(
      this.settings.outputFolder,
      this.settings.filenameTemplate
    );
  }
  
  updateParticipantService(): void {
    this.participantService.configure(
      this.settings.peopleFolder
    );
  }
  
  updateEntityService(): void {
    this.entityService.configure(
      this.settings.entityIssuesFolder,
      this.settings.entityUpdatesFolder,
      this.settings.entityTopicsFolder,
      this.settings.enableIssueExtraction,
      this.settings.enableUpdateExtraction,
      this.settings.enableTopicExtraction,
      this.settings.enrichManualNotes
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
    
    const icon = this.statusBarItem.createSpan({ cls: 'meetingmind-status-icon' });
    
    switch (status) {
      case 'idle':
        setIcon(icon, 'check');
        this.statusBarItem.setAttribute('aria-label', 'MeetingMind: Idle');
        break;
      case 'syncing':
        setIcon(icon, 'sync');
        icon.addClass('meetingmind-spinning');
        this.statusBarItem.setAttribute('aria-label', `MeetingMind: ${message || 'Syncing...'}`);
        break;
      case 'error':
        setIcon(icon, 'alert-triangle');
        this.statusBarItem.setAttribute('aria-label', `MeetingMind: ${message || 'Error'}`);
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

