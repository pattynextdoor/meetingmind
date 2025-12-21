/**
 * SettingsTab - Plugin settings UI
 */

import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import MeetingMindPlugin from '../main';
import { AIProvider } from '../types';

// Debounce utility for text inputs
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export class MeetingMindSettingsTab extends PluginSettingTab {
  plugin: MeetingMindPlugin;
  
  constructor(app: App, plugin: MeetingMindPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    new Setting(containerEl)
      .setName('Configuration')
      .setHeading();
    
    containerEl.createEl('p', { 
      text: 'Configure how MeetingMind imports and processes your meeting transcripts.',
      cls: 'setting-item-description'
    });
    
    // Sources Section
    this.createSourcesSection(containerEl);
    
    // Output Section
    this.createOutputSection(containerEl);
    
    // AI Section
    this.createAISection(containerEl);
    
    // Linking Section
    this.createLinkingSection(containerEl);
    
    // Participants Section
    this.createParticipantsSection(containerEl);
    
    // Entity Extraction Section
    this.createEntitySection(containerEl);
    
    // License Section
    this.createLicenseSection(containerEl);
  }
  
  /**
   * Create Sources section
   */
  private createSourcesSection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('📥 Sources')
      .setHeading();
    
    // Folder watcher toggle (primary method)
    new Setting(containerEl)
      .setName('Enable folder watcher')
      .setDesc('Watch a folder for new transcript files (.vtt, .srt, .txt, .json)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.folderWatcherEnabled)
        .onChange(async (value) => {
          this.plugin.settings.folderWatcherEnabled = value;
          await this.plugin.saveSettings();
          this.plugin.updateFolderWatcher();
          this.display();
        })
      );
    
    if (this.plugin.settings.folderWatcherEnabled) {
      // Watch folder path - debounced to avoid creating folders on every keystroke
      const debouncedWatchFolderUpdate = debounce(async (value: string) => {
        this.plugin.settings.watchFolder = value;
        await this.plugin.saveSettings();
        this.plugin.updateFolderWatcher();
      }, 1000); // Wait 1 second after user stops typing
      
      new Setting(containerEl)
        .setName('Watch folder')
        .setDesc('Folder path to watch for new transcript files')
        .addText(text => text
          .setPlaceholder('Transcripts/Import')
          .setValue(this.plugin.settings.watchFolder)
          .onChange(debouncedWatchFolderUpdate)
        );
    }
    
    // Otter.ai export guide
    const otterGuide = containerEl.createDiv({ cls: 'meetingmind-otter-guide' });
    new Setting(otterGuide)
      .setName('🦦 Using Otter.ai?')
      .setHeading();
    otterGuide.createEl('p', { 
      text: 'Export your transcripts from Otter.ai and drop them in your watched folder:',
      cls: 'setting-item-description'
    });
    const steps = otterGuide.createEl('ol', { cls: 'meetingmind-otter-steps' });
    steps.createEl('li', { text: 'Open your transcript in Otter.ai' });
    steps.createEl('li', { text: 'Click the "..." menu → Export' });
    steps.createEl('li', { text: 'Choose "Text" or "SRT" format' });
    steps.createEl('li', { text: 'Save to your watched folder' });
    otterGuide.createEl('p', { 
      text: 'MeetingMind will automatically import and process it!',
      cls: 'setting-item-description meetingmind-otter-tip'
    });
    
    // Fireflies.ai Integration
    new Setting(containerEl)
      .setName('🔥 Fireflies.ai integration')
      .setHeading();
    
    new Setting(containerEl)
      .setName('Enable Fireflies.ai sync')
      .setDesc('Automatically sync transcripts from your Fireflies.ai account')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.firefliesEnabled)
        .onChange(async (value) => {
          this.plugin.settings.firefliesEnabled = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );
    
    if (this.plugin.settings.firefliesEnabled) {
      // API Key
      new Setting(containerEl)
        .setName('Fireflies API key')
        .setDesc('Get your API key from app.fireflies.ai → Integrations → Fireflies API')
        .addText(text => {
          text
            .setPlaceholder('Enter your Fireflies API key')
            .setValue(this.plugin.settings.firefliesApiKey)
            .onChange(async (value) => {
              this.plugin.settings.firefliesApiKey = value;
              await this.plugin.saveSettings();
              this.plugin.updateFirefliesService();
            });
          text.inputEl.type = 'password';
          text.inputEl.addClass('meetingmind-api-key-input');
        });
      
      // Test connection button
      new Setting(containerEl)
        .setName('Test connection')
        .setDesc('Verify your Fireflies API key is working')
        .addButton(button => button
          .setButtonText('Test connection')
          .onClick(async () => {
            button.setButtonText('Testing...');
            button.setDisabled(true);
            
            const result = await this.plugin.firefliesService.testConnection();
            
            if (result.success) {
              new Notice(`✓ ${result.message}`);
            } else {
              new Notice(`✗ ${result.message}`);
            }
            
            button.setButtonText('Test connection');
            button.setDisabled(false);
          })
        );
      
      // Sync interval
      new Setting(containerEl)
        .setName('Sync interval')
        .setDesc('How often to check for new transcripts')
        .addDropdown(dropdown => dropdown
          .addOption('5', '5 minutes')
          .addOption('15', '15 minutes')
          .addOption('30', '30 minutes')
          .addOption('60', '60 minutes')
          .setValue(this.plugin.settings.firefliesSyncInterval.toString())
          .onChange(async (value) => {
            this.plugin.settings.firefliesSyncInterval = parseInt(value);
            await this.plugin.saveSettings();
            this.plugin.restartFirefliesSync();
          })
        );
      
      // Sync now button
      new Setting(containerEl)
        .setName('Sync now')
        .setDesc('Manually trigger a sync with Fireflies.ai')
        .addButton(button => button
          .setButtonText('Sync now')
          .setCta()
          .onClick(async () => {
            button.setButtonText('Syncing...');
            button.setDisabled(true);
            
            try {
              const transcripts = await this.plugin.firefliesService.sync();
              new Notice(`Synced ${transcripts.length} transcripts from Fireflies.ai`);
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Sync failed';
              new Notice(`Sync failed: ${errorMessage}`);
            }
            
            button.setButtonText('Sync now');
            button.setDisabled(false);
          })
        );
    }
  }
  
  /**
   * Create Output section
   */
  private createOutputSection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('📁 Output')
      .setHeading();
    
    // Destination folder
    new Setting(containerEl)
      .setName('Destination folder')
      .setDesc('Where to save processed meeting notes')
      .addText(text => text
        .setPlaceholder('Meetings')
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async (value) => {
          this.plugin.settings.outputFolder = value || 'Meetings';
          await this.plugin.saveSettings();
          this.plugin.updateNoteGenerator();
        })
      );
    
    // Filename template
    new Setting(containerEl)
      .setName('Filename template')
      .setDesc('Template for generated filenames. Variables: YYYY, MM, DD, Title')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD Meeting Title')
        .setValue(this.plugin.settings.filenameTemplate)
        .onChange(async (value) => {
          this.plugin.settings.filenameTemplate = value || 'YYYY-MM-DD Meeting Title';
          await this.plugin.saveSettings();
          this.plugin.updateNoteGenerator();
        })
      );
  }
  
  /**
   * Create AI section
   */
  private createAISection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('🤖 AI enrichment')
      .setHeading();
    
    // Check license status
    const hasAILicense = this.plugin.licenseService.hasFeature('aiEnrichment');
    
    // Show upgrade banner if no license
    if (!hasAILicense) {
      const banner = containerEl.createDiv({ cls: 'meetingmind-pro-banner' });
      banner.createEl('div', { 
        text: '⭐ AI features require MeetingMind Pro', 
        cls: 'meetingmind-pro-banner-title' 
      });
      banner.createEl('div', { 
        text: 'Get AI-powered summaries, action items, decisions, and smart participant insights.', 
        cls: 'meetingmind-pro-banner-desc' 
      });
      
      const buttonContainer = banner.createDiv({ cls: 'meetingmind-pro-banner-buttons' });
      const upgradeBtn = buttonContainer.createEl('button', { 
        text: 'Upgrade for $39 (lifetime)', 
        cls: 'mod-cta' 
      });
      upgradeBtn.addEventListener('click', () => {
        window.open('https://tumbucon.gumroad.com/l/meetingmind-pro', '_blank');
      });
    }
    
    // Enable AI toggle
    const aiToggleSetting = new Setting(containerEl)
      .setName('Enable AI enrichment')
      .setDesc('Use AI to generate summaries, extract action items, and suggest tags')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.aiEnabled)
        .onChange(async (value) => {
          if (value && !hasAILicense) {
            this.plugin.licenseService.showUpgradeNotice('AI enrichment');
            toggle.setValue(false);
            return;
          }
          this.plugin.settings.aiEnabled = value;
          await this.plugin.saveSettings();
          this.plugin.updateAIService();
          this.display();
        })
      );
    
    // Visually indicate if locked
    if (!hasAILicense) {
      aiToggleSetting.setDesc('Use AI to generate summaries, extract action items, and suggest tags (Pro required)');
    }
    
    if (this.plugin.settings.aiEnabled && hasAILicense) {
      // AI Provider
      new Setting(containerEl)
        .setName('AI provider')
        .setDesc('Choose which AI service to use for processing')
        .addDropdown(dropdown => dropdown
          .addOption('claude', 'Claude (Anthropic)')
          .addOption('openai', 'GPT-4 (OpenAI)')
          .addOption('cloud', 'Cloud (hosted)')
          .setValue(this.plugin.settings.aiProvider)
          .onChange(async (value) => {
            this.plugin.settings.aiProvider = value as AIProvider;
            await this.plugin.saveSettings();
            this.plugin.updateAIService();
            this.display();
          })
        );
      
      // Claude API Key
      if (this.plugin.settings.aiProvider === 'claude') {
        new Setting(containerEl)
          .setName('Claude API key')
          .setDesc('Your Anthropic API key')
          .addText(text => {
            text
              .setPlaceholder('sk-ant-...')
              .setValue(this.plugin.settings.claudeApiKey)
              .onChange(async (value) => {
                this.plugin.settings.claudeApiKey = value;
                await this.plugin.saveSettings();
                this.plugin.updateAIService();
              });
            text.inputEl.type = 'password';
          });
      }
      
      // OpenAI API Key
      if (this.plugin.settings.aiProvider === 'openai') {
        new Setting(containerEl)
          .setName('OpenAI API key')
          .setDesc('Your OpenAI API key')
          .addText(text => {
            text
              .setPlaceholder('sk-...')
              .setValue(this.plugin.settings.openaiApiKey)
              .onChange(async (value) => {
                this.plugin.settings.openaiApiKey = value;
                await this.plugin.saveSettings();
                this.plugin.updateAIService();
              });
            text.inputEl.type = 'password';
          });
      }
      
      // Cloud info
      if (this.plugin.settings.aiProvider === 'cloud') {
        new Setting(containerEl)
          .setName('Cloud processing')
          .setDesc('AI processing happens on our servers. Requires Pro + Cloud subscription.')
          .setClass('setting-item-description');
      }
      
      // Test connection button
      new Setting(containerEl)
        .setName('Test API connection')
        .setDesc('Verify your API key is working')
        .addButton(button => button
          .setButtonText('Test connection')
          .onClick(async () => {
            button.setButtonText('Testing...');
            button.setDisabled(true);
            
            const result = await this.plugin.aiService.testConnection();
            
            if (result.success) {
              new Notice('✓ AI connection successful!');
            } else {
              new Notice(`✗ Connection failed: ${result.message}`);
            }
            
            button.setButtonText('Test connection');
            button.setDisabled(false);
          })
        );
      
      // Feature toggles
      new Setting(containerEl)
        .setName('AI features')
        .setHeading();
      
      new Setting(containerEl)
        .setName('Generate summary')
        .setDesc('Create a 2-4 sentence summary of the meeting')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableSummary)
          .onChange(async (value) => {
            this.plugin.settings.enableSummary = value;
            await this.plugin.saveSettings();
            this.plugin.updateAIService();
          })
        );
      
      new Setting(containerEl)
        .setName('Extract action items')
        .setDesc('Find tasks and commitments mentioned in the meeting')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableActionItems)
          .onChange(async (value) => {
            this.plugin.settings.enableActionItems = value;
            await this.plugin.saveSettings();
            this.plugin.updateAIService();
          })
        );
      
      new Setting(containerEl)
        .setName('Extract decisions')
        .setDesc('Identify explicit decisions made during the meeting')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableDecisions)
          .onChange(async (value) => {
            this.plugin.settings.enableDecisions = value;
            await this.plugin.saveSettings();
            this.plugin.updateAIService();
          })
        );
      
      new Setting(containerEl)
        .setName('Suggest tags')
        .setDesc('Recommend relevant tags based on meeting content')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableTagSuggestions)
          .onChange(async (value) => {
            this.plugin.settings.enableTagSuggestions = value;
            await this.plugin.saveSettings();
            this.plugin.updateAIService();
          })
        );
    } else if (!hasAILicense) {
      // Show what Pro includes when AI is disabled
      const featuresEl = containerEl.createDiv({ cls: 'meetingmind-pro-features' });
      featuresEl.createEl('p', { text: 'With AI enrichment Pro, you get:' });
      const list = featuresEl.createEl('ul');
      list.createEl('li', { text: '📝 Automatic 2-4 sentence summaries' });
      list.createEl('li', { text: '✅ Action item extraction with owners' });
      list.createEl('li', { text: '🎯 Decision tracking' });
      list.createEl('li', { text: '🏷️ Smart tag suggestions from your vault' });
      list.createEl('li', { text: '👤 AI-powered participant insights' });
    }
  }
  
  /**
   * Create Linking section
   */
  private createLinkingSection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('🔗 Auto-linking')
      .setHeading();
    
    // Enable auto-linking
    new Setting(containerEl)
      .setName('Enable auto-linking')
      .setDesc('Automatically create [[wiki-links]] to existing notes mentioned in transcripts')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoLinkingEnabled)
        .onChange(async (value) => {
          this.plugin.settings.autoLinkingEnabled = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );
    
    if (this.plugin.settings.autoLinkingEnabled) {
      // Implicit aliases
      new Setting(containerEl)
        .setName('Generate implicit aliases')
        .setDesc('Create aliases from individual words in multi-word note titles (e.g., "Sarah" from "Sarah Chen")')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.generateImplicitAliases)
          .onChange(async (value) => {
            this.plugin.settings.generateImplicitAliases = value;
            await this.plugin.saveSettings();
            void this.plugin.rebuildVaultIndex();
          })
        );
      
      // Max matches threshold
      new Setting(containerEl)
        .setName('Maximum matches')
        .setDesc('Skip auto-linking if a term matches more than this many notes')
        .addText(text => text
          .setPlaceholder('3')
          .setValue(this.plugin.settings.maxMatchesBeforeSkip.toString())
          .onChange(async (value) => {
            const num = parseInt(value);
            if (!isNaN(num) && num > 0) {
              this.plugin.settings.maxMatchesBeforeSkip = num;
              await this.plugin.saveSettings();
              this.plugin.updateAutoLinker();
            }
          })
        );
      
      // Excluded folders
      new Setting(containerEl)
        .setName('Exclude folders')
        .setDesc('Folders to exclude from the link index (comma-separated)')
        .addText(text => text
          .setPlaceholder('templates, archive')
          .setValue(this.plugin.settings.excludedFolders)
          .onChange(async (value) => {
            this.plugin.settings.excludedFolders = value;
            await this.plugin.saveSettings();
            void this.plugin.rebuildVaultIndex();
          })
        );
      
      // Rebuild index button
      new Setting(containerEl)
        .setName('Rebuild vault index')
        .setDesc('Force re-index all notes for auto-linking')
        .addButton(button => button
          .setButtonText('Rebuild index')
          .onClick(async () => {
            button.setButtonText('Rebuilding...');
            button.setDisabled(true);
            
            await this.plugin.rebuildVaultIndex();
            
            new Notice('Vault index rebuilt successfully');
            button.setButtonText('Rebuild index');
            button.setDisabled(false);
          })
        );
    }
  }
  
  /**
   * Create Participants section
   */
  private createParticipantsSection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('👥 Participants')
      .setHeading();
    
    // Auto-create participant notes
    new Setting(containerEl)
      .setName('Auto-create participant notes')
      .setDesc('Automatically create notes for meeting participants who do not have one')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoCreateParticipants)
        .onChange(async (value) => {
          this.plugin.settings.autoCreateParticipants = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );
    
    if (this.plugin.settings.autoCreateParticipants) {
      // People folder - debounced
      const debouncedPeopleFolderUpdate = debounce(async (value: string) => {
        this.plugin.settings.peopleFolder = value;
        await this.plugin.saveSettings();
        this.plugin.updateParticipantService();
      }, 1000);
      
      new Setting(containerEl)
        .setName('People folder')
        .setDesc('Folder where participant notes are created (leave empty for vault root)')
        .addText(text => text
          .setPlaceholder('People')
          .setValue(this.plugin.settings.peopleFolder)
          .onChange(debouncedPeopleFolderUpdate)
        );
      
      // Update existing participant notes
      new Setting(containerEl)
        .setName('Update existing participant notes')
        .setDesc('Add meeting references to existing participant notes')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.updateExistingParticipants)
          .onChange(async (value) => {
            this.plugin.settings.updateExistingParticipants = value;
            await this.plugin.saveSettings();
          })
        );
    }
  }
  
  /**
   * Create Entity Extraction section (Pro)
   */
  private createEntitySection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('📊 Entity extraction (Pro)')
      .setHeading();
    
    const isPro = this.plugin.licenseService.isPro();
    
    if (!isPro) {
      const upgradeNote = containerEl.createDiv({ cls: 'meetingmind-pro-note' });
      upgradeNote.createEl('p', { 
        text: 'Entity extraction requires MeetingMind Pro. Upgrade to automatically create notes for issues, updates, and topics mentioned in meetings.'
      });
      return;
    }
    
    // Master toggle
    new Setting(containerEl)
      .setName('Auto-extract entities')
      .setDesc('Automatically create notes for issues, updates, and topics mentioned in meetings')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoExtractEntities)
        .onChange(async (value) => {
          this.plugin.settings.autoExtractEntities = value;
          await this.plugin.saveSettings();
          this.plugin.updateEntityService();
          this.display();
        })
      );
    
    if (this.plugin.settings.autoExtractEntities) {
      // Entity type toggles
      new Setting(containerEl)
        .setName('Extract issues')
        .setDesc('Create notes for blockers, problems, and bugs mentioned')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableIssueExtraction)
          .onChange(async (value) => {
            this.plugin.settings.enableIssueExtraction = value;
            await this.plugin.saveSettings();
            this.plugin.updateEntityService();
          })
        );
      
      new Setting(containerEl)
        .setName('Extract topics')
        .setDesc('Create notes for important concepts, systems, and recurring themes')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enableTopicExtraction)
          .onChange(async (value) => {
            this.plugin.settings.enableTopicExtraction = value;
            await this.plugin.saveSettings();
            this.plugin.updateEntityService();
          })
        );
      
      new Setting(containerEl)
        .setName('Enrich manually-created notes')
        .setDesc('Allow MeetingMind to find and enrich notes you created manually (adds frontmatter, AI synthesis). If disabled, only enriches notes created by MeetingMind.')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.enrichManualNotes)
          .onChange(async (value) => {
            this.plugin.settings.enrichManualNotes = value;
            await this.plugin.saveSettings();
            this.plugin.updateEntityService();
          })
        );
      
      // Folder paths - debounced
      const debouncedFolderUpdate = debounce(async () => {
        await this.plugin.saveSettings();
        this.plugin.updateEntityService();
      }, 1000);
      
      new Setting(containerEl)
        .setName('Issues folder')
        .setDesc('Folder where issue notes are created')
        .addText(text => text
          .setPlaceholder('Issues')
          .setValue(this.plugin.settings.entityIssuesFolder)
          .onChange(async (value) => {
            this.plugin.settings.entityIssuesFolder = value || 'Issues';
            debouncedFolderUpdate();
          })
        );
      
      // Note: Updates are no longer created as separate notes - they appear in People notes
      
      new Setting(containerEl)
        .setName('Topics folder')
        .setDesc('Folder where topic notes are created')
        .addText(text => text
          .setPlaceholder('Topics')
          .setValue(this.plugin.settings.entityTopicsFolder)
          .onChange(async (value) => {
            this.plugin.settings.entityTopicsFolder = value || 'Topics';
            debouncedFolderUpdate();
          })
        );
      
      // Info box
      const infoBox = containerEl.createDiv({ cls: 'meetingmind-info-box' });
      infoBox.createEl('p', {
        text: 'Entity notes are automatically created when mentioned in meetings and linked back to the meeting notes.'
      });
    }
  }
  
  /**
   * Create License section
   */
  private createLicenseSection(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName('🔑 License')
      .setHeading();
    
    const licenseInfo = this.plugin.licenseService.getLicenseInfo();
    const statusText = this.plugin.licenseService.getStatusText();
    
    // License status display
    const statusSetting = new Setting(containerEl)
      .setName('License status')
      .setDesc(statusText);
    
    // Add status indicator
    if (licenseInfo.status === 'pro' || licenseInfo.status === 'supporter') {
      statusSetting.descEl.addClass('meetingmind-license-active');
    }
    
    // License key input
    new Setting(containerEl)
      .setName('License key')
      .setDesc('Enter your license key from Gumroad (e.g., XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)')
      .addText(text => text
        .setPlaceholder('Paste your Gumroad license key')
        .setValue(this.plugin.settings.licenseKey)
        .onChange(async (value) => {
          this.plugin.settings.licenseKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addButton(button => button
        .setButtonText('Activate')
        .onClick(async () => {
          button.setButtonText('Validating...');
          button.setDisabled(true);
          
          try {
            const result = await this.plugin.licenseService.setLicenseKey(
              this.plugin.settings.licenseKey
            );
            
            // Update settings with validation result
            this.plugin.settings.licenseStatus = result.status;
            await this.plugin.saveSettings();
            
            if (result.status === 'pro' || result.status === 'supporter') {
              new Notice(`✓ ${result.status === 'supporter' ? 'Supporter' : 'Pro'} license activated!`);
            } else if (this.plugin.settings.licenseKey) {
              new Notice('Invalid license key. Please check and try again.');
            } else {
              new Notice('License cleared - Free tier active');
            }
          } catch {
            new Notice('License validation failed. Please try again.');
          }
          
          button.setButtonText('Activate');
          button.setDisabled(false);
          this.display();
        })
      );
    
    // Show different content based on license status
    if (!this.plugin.licenseService.isPro()) {
      // Free tier - show upgrade options
      const upgradeContainer = containerEl.createDiv({ cls: 'meetingmind-upgrade-section' });
      
      new Setting(upgradeContainer)
        .setName('Upgrade to Pro')
        .setHeading();
      
      const priceEl = upgradeContainer.createDiv({ cls: 'meetingmind-price' });
      priceEl.createEl('span', { text: '$39', cls: 'meetingmind-price-amount' });
      priceEl.createEl('span', { text: ' one-time payment', cls: 'meetingmind-price-label' });
      
      const benefitsEl = upgradeContainer.createDiv({ cls: 'meetingmind-upgrade-benefits' });
      benefitsEl.createEl('p', { text: 'Unlock AI-powered features:' });
      const list = benefitsEl.createEl('ul');
      list.createEl('li', { text: '🤖 AI summaries, action items & decisions' });
      list.createEl('li', { text: '👤 Smart participant insights' });
      list.createEl('li', { text: '🏷️ Intelligent tag suggestions' });
      list.createEl('li', { text: '♾️ Lifetime license - pay once, use forever' });
      list.createEl('li', { text: '🔑 Bring your own API key (Claude or OpenAI)' });
      
      const freeEl = benefitsEl.createDiv({ cls: 'meetingmind-free-note' });
      freeEl.createEl('p', { 
        text: '✓ Everything else is free: transcript parsing, auto-linking, folder watcher, and participant tracking.'
      });
      
      new Setting(upgradeContainer)
        .addButton(button => button
          .setButtonText('Get Pro license')
          .setCta()
          .onClick(() => {
            window.open('https://tumbucon.gumroad.com/l/meetingmind-pro', '_blank');
          })
        );
    } else {
      // Pro/Supporter - show thank you
      const thankYou = containerEl.createDiv({ cls: 'meetingmind-license-thanks' });
      thankYou.createEl('p', { 
        text: '🎉 Thank you for supporting MeetingMind! All AI features are unlocked.'
      });
      
      if (this.plugin.licenseService.isSupporter()) {
        thankYou.createEl('p', { 
          text: '⭐ As a Supporter, you also get priority support and early access to new features.',
          cls: 'meetingmind-supporter-note'
        });
      }
    }
  }
}

