/**
 * SettingsTab - Plugin settings UI
 */

import { App, PluginSettingTab, Setting, Notice, ButtonComponent, TextComponent } from 'obsidian';
import MeetingSyncPlugin from '../main';
import { AIProvider } from '../types';

// Debounce utility for text inputs
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export class MeetingSyncSettingsTab extends PluginSettingTab {
  plugin: MeetingSyncPlugin;
  
  constructor(app: App, plugin: MeetingSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    containerEl.createEl('h1', { text: 'MeetingSync Settings' });
    containerEl.createEl('p', { 
      text: 'Configure how MeetingSync imports and processes your meeting transcripts.',
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
    
    // License Section
    this.createLicenseSection(containerEl);
  }
  
  /**
   * Create Sources section
   */
  private createSourcesSection(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📥 Sources' });
    
    // Otter.ai toggle
    new Setting(containerEl)
      .setName('Enable Otter.ai sync')
      .setDesc('Automatically sync transcripts from your Otter.ai account')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.otterEnabled)
        .onChange(async (value) => {
          this.plugin.settings.otterEnabled = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide related settings
        })
      );
    
    if (this.plugin.settings.otterEnabled) {
      // Otter connection status and button
      const otterStatus = this.plugin.settings.otterAccessToken 
        ? `Connected as ${this.plugin.settings.otterEmail || 'user'}`
        : 'Not connected';
      
      new Setting(containerEl)
        .setName('Otter.ai connection')
        .setDesc(otterStatus)
        .addButton(button => {
          if (this.plugin.settings.otterAccessToken) {
            button
              .setButtonText('Disconnect')
              .setWarning()
              .onClick(async () => {
                this.plugin.otterService.disconnect();
                this.plugin.settings.otterAccessToken = '';
                this.plugin.settings.otterRefreshToken = '';
                this.plugin.settings.otterEmail = '';
                await this.plugin.saveSettings();
                new Notice('Disconnected from Otter.ai');
                this.display();
              });
          } else {
            button
              .setButtonText('Connect to Otter.ai')
              .setCta()
              .onClick(() => {
                // For now, show instructions since OAuth requires server-side component
                new Notice('Otter.ai OAuth integration requires API credentials. Please check documentation.');
              });
          }
        });
      
      // Sync interval
      new Setting(containerEl)
        .setName('Sync interval')
        .setDesc('How often to check for new transcripts')
        .addDropdown(dropdown => dropdown
          .addOption('5', '5 minutes')
          .addOption('15', '15 minutes')
          .addOption('30', '30 minutes')
          .addOption('60', '60 minutes')
          .setValue(this.plugin.settings.syncInterval.toString())
          .onChange(async (value) => {
            this.plugin.settings.syncInterval = parseInt(value);
            await this.plugin.saveSettings();
            this.plugin.restartOtterSync();
          })
        );
    }
    
    // Folder watcher toggle
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
  }
  
  /**
   * Create Output section
   */
  private createOutputSection(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📁 Output' });
    
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
    containerEl.createEl('h2', { text: '🤖 AI Enrichment' });
    
    // Enable AI toggle
    new Setting(containerEl)
      .setName('Enable AI enrichment')
      .setDesc('Use AI to generate summaries, extract action items, and suggest tags')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.aiEnabled)
        .onChange(async (value) => {
          this.plugin.settings.aiEnabled = value;
          await this.plugin.saveSettings();
          this.plugin.updateAIService();
          this.display();
        })
      );
    
    if (this.plugin.settings.aiEnabled) {
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
          .setButtonText('Test Connection')
          .onClick(async () => {
            button.setButtonText('Testing...');
            button.setDisabled(true);
            
            const result = await this.plugin.aiService.testConnection();
            
            if (result.success) {
              new Notice('✓ AI connection successful!');
            } else {
              new Notice(`✗ Connection failed: ${result.message}`);
            }
            
            button.setButtonText('Test Connection');
            button.setDisabled(false);
          })
        );
      
      // Feature toggles
      containerEl.createEl('h4', { text: 'AI Features' });
      
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
    }
  }
  
  /**
   * Create Linking section
   */
  private createLinkingSection(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '🔗 Auto-Linking' });
    
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
            this.plugin.rebuildVaultIndex();
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
            this.plugin.rebuildVaultIndex();
          })
        );
      
      // Rebuild index button
      new Setting(containerEl)
        .setName('Rebuild vault index')
        .setDesc('Force re-index all notes for auto-linking')
        .addButton(button => button
          .setButtonText('Rebuild Index')
          .onClick(async () => {
            button.setButtonText('Rebuilding...');
            button.setDisabled(true);
            
            await this.plugin.rebuildVaultIndex();
            
            new Notice('Vault index rebuilt successfully');
            button.setButtonText('Rebuild Index');
            button.setDisabled(false);
          })
        );
    }
  }
  
  /**
   * Create Participants section
   */
  private createParticipantsSection(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '👥 Participants' });
    
    // Auto-create participant notes
    new Setting(containerEl)
      .setName('Auto-create participant notes')
      .setDesc('Automatically create notes for meeting participants who don\'t have one')
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
   * Create License section
   */
  private createLicenseSection(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '🔑 License' });
    
    const statusText = this.getLicenseStatusText();
    
    // License status
    new Setting(containerEl)
      .setName('License status')
      .setDesc(statusText);
    
    // License key input
    new Setting(containerEl)
      .setName('License key')
      .setDesc('Enter your Pro or Cloud license key')
      .addText(text => text
        .setPlaceholder('XXXXX-XXXXX-XXXXX-XXXXX')
        .setValue(this.plugin.settings.licenseKey)
        .onChange(async (value) => {
          this.plugin.settings.licenseKey = value;
          await this.plugin.saveSettings();
        })
      )
      .addButton(button => button
        .setButtonText('Validate')
        .onClick(async () => {
          button.setButtonText('Validating...');
          button.setDisabled(true);
          
          // Validate license (placeholder - would call actual validation API)
          await this.validateLicense();
          
          button.setButtonText('Validate');
          button.setDisabled(false);
          this.display();
        })
      );
    
    // Upgrade link
    if (this.plugin.settings.licenseStatus === 'free') {
      new Setting(containerEl)
        .setName('Upgrade to Pro')
        .setDesc('Unlock AI enrichment, Otter.ai sync, and more')
        .addButton(button => button
          .setButtonText('Learn More')
          .setCta()
          .onClick(() => {
            window.open('https://meetingsync.app/pricing', '_blank');
          })
        );
    }
  }
  
  /**
   * Get license status display text
   */
  private getLicenseStatusText(): string {
    const status = this.plugin.settings.licenseStatus;
    const expiry = this.plugin.settings.licenseExpiry;
    
    switch (status) {
      case 'pro':
        return expiry ? `Pro (valid until ${expiry})` : 'Pro';
      case 'cloud':
        return expiry ? `Pro + Cloud (active until ${expiry})` : 'Pro + Cloud';
      default:
        return 'Free tier - Some features limited';
    }
  }
  
  /**
   * Validate license key (placeholder)
   */
  private async validateLicense(): Promise<void> {
    const key = this.plugin.settings.licenseKey;
    
    if (!key) {
      this.plugin.settings.licenseStatus = 'free';
      this.plugin.settings.licenseExpiry = '';
      await this.plugin.saveSettings();
      new Notice('License cleared - Free tier active');
      return;
    }
    
    // This would call actual license validation API
    // For now, accept any key starting with "PRO-" or "CLOUD-"
    if (key.startsWith('PRO-')) {
      this.plugin.settings.licenseStatus = 'pro';
      this.plugin.settings.licenseExpiry = '2099-12-31';
      await this.plugin.saveSettings();
      new Notice('✓ Pro license activated!');
    } else if (key.startsWith('CLOUD-')) {
      this.plugin.settings.licenseStatus = 'cloud';
      this.plugin.settings.licenseExpiry = '2099-12-31';
      await this.plugin.saveSettings();
      new Notice('✓ Pro + Cloud license activated!');
    } else {
      new Notice('Invalid license key');
    }
  }
}

