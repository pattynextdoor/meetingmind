/**
 * MeetingMind Type Definitions
 * Based on the PRD technical data structures
 */

export interface TranscriptSegment {
  speaker: string;
  timestamp: number; // seconds from start
  text: string;
  endTimestamp?: number;
}

export interface RawTranscript {
  source: 'otter' | 'local';
  title: string;
  date: Date;
  duration: number; // minutes
  participants: string[];
  segments: TranscriptSegment[];
  sourceUrl?: string;
  hash: string; // for deduplication
  rawContent?: string;
}

export interface VaultIndex {
  // alias (lowercase) -> note path
  exactMatches: Map<string, string>;
  // alias -> array of possible paths
  ambiguousMatches: Map<string, string[]>;
  // sorted by length desc for matching
  sortedTerms: string[];
  lastUpdated: Date;
}

export interface AIEnrichment {
  summary: string;
  actionItems: ActionItem[];
  decisions: string[];
  suggestedTags: string[];
  participantInsights?: ParticipantInsight[];
  entities?: EntityExtraction;
}

export interface ParticipantInsight {
  name: string;
  role?: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  sentiment?: string;
  wins?: string[]; // Achievements, completions, successes mentioned
  updates?: Array<{ name: string; status: 'in-progress' | 'completed' | 'blocked' | 'resolved' | 'stale'; date: string }>; // Updates owned by this person (not separate notes)
  ownedTopics?: string[]; // Topics this person owns
  raisedIssues?: string[]; // Issues this person raised
}

export interface Entity {
  type: 'issue' | 'update' | 'topic';
  name: string;
  description?: string;
  mentionedBy?: string; // For issues: who raised it; for topics: who owns it
  status?: 'in-progress' | 'completed' | 'blocked' | 'resolved' | 'stale';
  relatedTo?: string;
  category?: string;
  resolvedDate?: string; // ISO date when status changed to resolved
}

export interface EntityStatusUpdate {
  entityName: string;
  entityType: 'issue' | 'update' | 'topic';
  newStatus?: 'resolved' | 'completed' | 'stale' | 'in-progress' | 'blocked';
  reason?: string; // Why the status changed
}

export interface EntityExtraction {
  issues: Entity[];
  updates: Entity[];
  topics: Entity[];
}

export interface ActionItem {
  task: string;
  assignee?: string;
  dueDate?: string;
}

export interface SuggestedLink {
  term: string;
  candidates: string[];
}

export interface ProcessedMeeting {
  transcript: RawTranscript;
  enrichment?: AIEnrichment;
  autoLinks: Map<string, string>; // term -> note path
  suggestedLinks: SuggestedLink[];
}

export interface SyncStatus {
  lastSync: Date | null;
  status: 'idle' | 'syncing' | 'error';
  message?: string;
}

export type AIProvider = 'claude' | 'openai' | 'cloud' | 'disabled';

export interface MeetingMindSettings {
  // Otter.ai settings (legacy - kept for migration)
  otterEnabled: boolean;
  otterAccessToken: string;
  otterRefreshToken: string;
  otterEmail: string;
  syncInterval: number; // minutes
  lastSyncTimestamp: number;
  
  // Fireflies.ai settings
  firefliesEnabled: boolean;
  firefliesApiKey: string;
  firefliesSyncInterval: number; // minutes
  firefliesLastSync: number;
  
  // Folder watcher settings
  folderWatcherEnabled: boolean;
  watchFolder: string;
  
  // Output settings
  outputFolder: string;
  filenameTemplate: string;
  
  // AI settings
  aiEnabled: boolean;
  aiProvider: AIProvider;
  claudeApiKey: string;
  openaiApiKey: string;
  enableSummary: boolean;
  enableActionItems: boolean;
  enableDecisions: boolean;
  enableTagSuggestions: boolean;
  
  // Auto-linking settings
  autoLinkingEnabled: boolean;
  generateImplicitAliases: boolean;
  maxMatchesBeforeSkip: number;
  excludedFolders: string;
  
  // Participant settings
  autoCreateParticipants: boolean;
  peopleFolder: string;
  updateExistingParticipants: boolean;
  
  // Entity extraction settings (Pro)
  autoExtractEntities: boolean;
  entityIssuesFolder: string;
  entityUpdatesFolder: string; // Deprecated but kept for migration
  entityTopicsFolder: string;
  enableIssueExtraction: boolean;
  enableUpdateExtraction: boolean; // Now only enriches People notes, doesn't create separate notes
  enableTopicExtraction: boolean;
  issueArchiveDays: number; // Days before archiving resolved issues
  
  // License settings
  licenseKey: string;
  licenseStatus: 'free' | 'pro' | 'supporter';
  licenseExpiry: string;
  
  // Processed transcripts (for deduplication)
  processedHashes: string[];
}

export const DEFAULT_SETTINGS: MeetingMindSettings = {
  otterEnabled: false,
  otterAccessToken: '',
  otterRefreshToken: '',
  otterEmail: '',
  syncInterval: 15,
  lastSyncTimestamp: 0,
  
  firefliesEnabled: false,
  firefliesApiKey: '',
  firefliesSyncInterval: 15,
  firefliesLastSync: 0,
  
  folderWatcherEnabled: false,
  watchFolder: '',
  
  outputFolder: 'Meetings',
  filenameTemplate: 'YYYY-MM-DD Meeting Title',
  
  aiEnabled: false,
  aiProvider: 'disabled',
  claudeApiKey: '',
  openaiApiKey: '',
  enableSummary: true,
  enableActionItems: true,
  enableDecisions: true,
  enableTagSuggestions: true,
  
  autoLinkingEnabled: true,
  generateImplicitAliases: true,
  maxMatchesBeforeSkip: 3,
  excludedFolders: 'templates,archive',
  
  autoCreateParticipants: true,
  peopleFolder: 'People',
  updateExistingParticipants: true,
  
  autoExtractEntities: false,
  entityIssuesFolder: 'Issues',
  entityUpdatesFolder: 'Updates', // Deprecated
  entityTopicsFolder: 'Topics',
  enableIssueExtraction: true,
  enableUpdateExtraction: true, // For People note enrichment only
  enableTopicExtraction: true,
  issueArchiveDays: 30,
  
  licenseKey: '',
  licenseStatus: 'free',
  licenseExpiry: '',
  
  processedHashes: [],
};

export interface OtterTranscript {
  id: string;
  title: string;
  created_at: string;
  duration: number;
  summary?: string;
  transcripts: {
    speaker: string;
    start_time: number;
    end_time: number;
    text: string;
  }[];
}

export interface SyncLogEntry {
  timestamp: Date;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

