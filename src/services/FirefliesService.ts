/**
 * FirefliesService - Fireflies.ai GraphQL API integration
 * Fetches meeting transcripts from Fireflies.ai
 */

import { requestUrl, RequestUrlResponse } from 'obsidian';
import { RawTranscript, TranscriptSegment } from '../types';

// Fireflies GraphQL endpoint
const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

// GraphQL Queries
const TRANSCRIPTS_QUERY = `
  query Transcripts($limit: Int, $skip: Int) {
    transcripts(limit: $limit, skip: $skip) {
      id
      title
      date
      duration
      organizer_email
      participants
      transcript_url
    }
  }
`;

const TRANSCRIPT_DETAIL_QUERY = `
  query Transcript($id: String!) {
    transcript(id: $id) {
      id
      title
      date
      duration
      organizer_email
      participants
      transcript_url
      sentences {
        speaker_name
        speaker_id
        text
        raw_text
        start_time
        end_time
      }
      summary {
        overview
        action_items
        keywords
      }
    }
  }
`;

const USER_QUERY = `
  query User {
    user {
      user_id
      email
      name
      integrations
    }
  }
`;

export interface FirefliesTranscript {
  id: string;
  title: string;
  date: string;
  duration: number;
  organizer_email: string;
  participants: string[];
  transcript_url: string;
  sentences?: FirefliesSentence[];
  summary?: {
    overview?: string;
    action_items?: string[];
    keywords?: string[];
  };
}

export interface FirefliesSentence {
  speaker_name: string;
  speaker_id: number;
  text: string;
  raw_text: string;
  start_time: number;
  end_time: number;
}

export interface FirefliesUser {
  user_id: string;
  email: string;
  name: string;
  integrations: string[];
}

export class FirefliesService {
  private apiKey: string = '';
  private lastSyncTimestamp: number = 0;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncInterval: number = 15; // minutes
  
  // Callbacks
  private onSyncComplete: ((transcripts: RawTranscript[]) => Promise<void>) | null = null;
  private onStatusChange: ((status: { status: string; message?: string }) => void) | null = null;
  
  constructor() {}
  
  /**
   * Configure the Fireflies service
   */
  configure(
    apiKey: string,
    syncInterval: number,
    lastSyncTimestamp: number
  ): void {
    this.apiKey = apiKey;
    this.syncInterval = syncInterval;
    this.lastSyncTimestamp = lastSyncTimestamp;
  }
  
  /**
   * Set callback handlers
   */
  setCallbacks(
    onSyncComplete: (transcripts: RawTranscript[]) => Promise<void>,
    onStatusChange: (status: { status: string; message?: string }) => void
  ): void {
    this.onSyncComplete = onSyncComplete;
    this.onStatusChange = onStatusChange;
  }
  
  /**
   * Check if connected (has API key)
   */
  isConnected(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }
  
  /**
   * Test the API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; user?: FirefliesUser }> {
    if (!this.apiKey) {
      return { success: false, message: 'No API key configured' };
    }
    
    try {
      const result = await this.graphqlRequest(USER_QUERY) as {
        data?: {
          user?: {
            user_id?: string;
            name?: string;
            email?: string;
            integrations?: string[];
          };
        };
      };
      
      if (result.data?.user) {
        const user = result.data.user;
        return {
          success: true,
          message: `Connected as ${user.name || user.email || 'user'}`,
          user: {
            user_id: user.user_id || '',
            name: user.name || '',
            email: user.email || '',
            integrations: Array.isArray(user.integrations) ? user.integrations : [],
          },
        };
      }
      
      return { success: false, message: 'Could not fetch user info' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Start background sync
   */
  startSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    const intervalMs = this.syncInterval * 60 * 1000;
    
    this.syncTimer = setInterval(() => {
      void this.sync();
    }, intervalMs);
    
    // Initial sync
    void this.sync();
    
    console.debug(`MeetingMind: fireflies sync started (every ${this.syncInterval} minutes)`);
  }
  
  /**
   * Stop background sync
   */
  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.debug('MeetingMind: fireflies sync stopped');
  }
  
  /**
   * Trigger immediate sync
   */
  async sync(): Promise<RawTranscript[]> {
    if (!this.isConnected()) {
      console.debug('MeetingMind: cannot sync - Fireflies not configured');
      return [];
    }
    
    this.updateStatus('syncing', 'Syncing with Fireflies.ai...');
    
    try {
      // Fetch recent transcripts
      const transcripts = await this.fetchTranscriptsSince(this.lastSyncTimestamp);
      
      if (transcripts.length > 0 && this.onSyncComplete) {
        await this.onSyncComplete(transcripts);
      }
      
      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      
      this.updateStatus('idle', `Synced ${transcripts.length} transcripts from Fireflies`);
      console.debug(`MeetingMind: fireflies sync complete - ${transcripts.length} new transcripts`);
      
      return transcripts;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Fireflies sync failed';
      console.error('MeetingMind: fireflies sync failed', error);
      this.updateStatus('error', `Fireflies sync failed: ${errorMessage}`);
      return [];
    }
  }
  
  /**
   * Fetch transcripts since a given timestamp
   */
  private async fetchTranscriptsSince(timestamp: number): Promise<RawTranscript[]> {
    const rawTranscripts: RawTranscript[] = [];
    
    try {
      // Fetch list of transcripts
      const listResult = await this.graphqlRequest(TRANSCRIPTS_QUERY, {
        limit: 50,
        skip: 0,
      }) as {
        data?: {
          transcripts?: FirefliesTranscript[];
        };
      };
      
      if (!listResult.data?.transcripts) {
        console.debug('MeetingMind: no transcripts returned from Fireflies');
        return [];
      }
      
      const transcripts: FirefliesTranscript[] = listResult.data.transcripts;
      
      // Filter to only transcripts after the timestamp
      const sinceDate = timestamp ? new Date(timestamp) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newTranscripts = transcripts.filter(t => new Date(t.date) > sinceDate);
      
      console.debug(`MeetingMind: found ${newTranscripts.length} new Fireflies transcripts`);
      
      // Fetch full details for each new transcript
      for (const transcript of newTranscripts) {
        try {
          const fullTranscript = await this.fetchTranscriptDetail(transcript.id);
          if (fullTranscript) {
            rawTranscripts.push(fullTranscript);
          }
        } catch (e) {
          console.error(`MeetingMind: failed to fetch Fireflies transcript ${transcript.id}`, e);
        }
      }
      
    } catch (error) {
      console.error('MeetingMind: failed to fetch Fireflies transcripts list', error);
      throw error;
    }
    
    return rawTranscripts;
  }
  
  /**
   * Fetch a single transcript with full details
   */
  private async fetchTranscriptDetail(id: string): Promise<RawTranscript | null> {
    try {
      const result = await this.graphqlRequest(TRANSCRIPT_DETAIL_QUERY, { id }) as {
        data?: {
          transcript?: FirefliesTranscript;
        };
      };
      
      if (!result.data?.transcript) {
        return null;
      }
      
      const transcript: FirefliesTranscript = result.data.transcript;
      return this.convertToRawTranscript(transcript);
      
    } catch (error) {
      console.error(`MeetingMind: failed to fetch Fireflies transcript ${id}`, error);
      return null;
    }
  }
  
  /**
   * Convert Fireflies transcript to MeetingMind RawTranscript format
   */
  private convertToRawTranscript(fireflies: FirefliesTranscript): RawTranscript {
    // Convert sentences to segments
    const segments: TranscriptSegment[] = (fireflies.sentences || []).map(sentence => ({
      speaker: sentence.speaker_name || 'Unknown',
      timestamp: sentence.start_time || 0,
      endTimestamp: sentence.end_time,
      text: sentence.text || sentence.raw_text || '',
    }));
    
    // Extract unique participants from sentences
    const speakerNames = new Set<string>();
    for (const sentence of fireflies.sentences || []) {
      if (sentence.speaker_name) {
        speakerNames.add(sentence.speaker_name);
      }
    }
    
    // Also include participants list from transcript metadata
    const participants = Array.from(new Set([
      ...Array.from(speakerNames),
      ...(fireflies.participants || []),
    ])).filter(p => p && p !== 'Unknown');
    
    // Generate hash for deduplication
    const contentForHash = segments.map(s => s.text).join('') + fireflies.id;
    const hash = this.generateHash(contentForHash);
    
    return {
      source: 'local', // We'll treat it as local since we're importing
      title: fireflies.title || 'Untitled Meeting',
      date: new Date(fireflies.date),
      duration: Math.ceil((fireflies.duration || 0) / 60), // Convert seconds to minutes
      participants,
      segments,
      sourceUrl: fireflies.transcript_url,
      hash,
      rawContent: fireflies.summary?.overview,
    };
  }
  
  /**
   * Make a GraphQL request to Fireflies API
   */
  private async graphqlRequest(query: string, variables?: Record<string, unknown>): Promise<unknown> {
    const response: RequestUrlResponse = await requestUrl({
      url: FIREFLIES_API_URL,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    if (response.status !== 200) {
      const error = new Error(`Fireflies API error: ${response.status}`) as Error & { status: number };
      error.status = response.status;
      throw error;
    }
    
    const data = response.json as {
      errors?: Array<{ message?: string }>;
      data?: unknown;
    };
    
    if (data.errors && data.errors.length > 0) {
      const errorMessage = data.errors.map((e) => e.message || 'Unknown error').join(', ');
      throw new Error(`Fireflies API error: ${errorMessage}`);
    }
    
    return data;
  }
  
  /**
   * Generate a simple hash for deduplication
   */
  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `fireflies-${Math.abs(hash).toString(16)}`;
  }
  
  /**
   * Update status via callback
   */
  private updateStatus(status: string, message?: string): void {
    if (this.onStatusChange) {
      this.onStatusChange({ status, message });
    }
  }
  
  /**
   * Clean up when plugin is unloaded
   */
  destroy(): void {
    this.stopSync();
    this.onSyncComplete = null;
    this.onStatusChange = null;
  }
}

