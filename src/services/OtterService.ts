/**
 * OtterService - Otter.ai API integration
 * Handles OAuth, transcript fetching, and sync
 */

import { requestUrl, RequestUrlResponse, Notice } from 'obsidian';
import { RawTranscript, OtterTranscript, TranscriptSegment, SyncStatus } from '../types';
import { TranscriptParser } from './TranscriptParser';

// Otter.ai API endpoints (these would need to be updated with actual Otter API endpoints)
const OTTER_API_BASE = 'https://otter.ai/forward/api/v1';
const OTTER_AUTH_URL = 'https://otter.ai/forward/api/v1/auth';

export class OtterService {
  private accessToken: string = '';
  private refreshToken: string = '';
  private email: string = '';
  private syncInterval: number = 15; // minutes
  private lastSyncTimestamp: number = 0;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncStatus: SyncStatus = { lastSync: null, status: 'idle' };
  private parser: TranscriptParser;
  
  // Callbacks
  private onSyncComplete: ((transcripts: RawTranscript[]) => Promise<void>) | null = null;
  private onStatusChange: ((status: SyncStatus) => void) | null = null;
  private onTokenRefresh: ((accessToken: string, refreshToken: string) => void) | null = null;
  
  // Rate limiting
  private retryDelay: number = 60000; // 1 minute initial
  private maxRetryDelay: number = 1800000; // 30 minutes max
  
  constructor() {
    this.parser = new TranscriptParser();
  }
  
  /**
   * Configure the Otter service
   */
  configure(
    accessToken: string,
    refreshToken: string,
    email: string,
    syncInterval: number,
    lastSyncTimestamp: number
  ): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.email = email;
    this.syncInterval = syncInterval;
    this.lastSyncTimestamp = lastSyncTimestamp;
  }
  
  /**
   * Set callback handlers
   */
  setCallbacks(
    onSyncComplete: (transcripts: RawTranscript[]) => Promise<void>,
    onStatusChange: (status: SyncStatus) => void,
    onTokenRefresh: (accessToken: string, refreshToken: string) => void
  ): void {
    this.onSyncComplete = onSyncComplete;
    this.onStatusChange = onStatusChange;
    this.onTokenRefresh = onTokenRefresh;
  }
  
  /**
   * Check if connected to Otter
   */
  isConnected(): boolean {
    return !!this.accessToken;
  }
  
  /**
   * Get the connected email
   */
  getEmail(): string {
    return this.email;
  }
  
  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.syncStatus;
  }
  
  /**
   * Start background sync
   */
  startSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    // Convert minutes to milliseconds
    const intervalMs = this.syncInterval * 60 * 1000;
    
    this.syncTimer = setInterval(() => {
      this.sync();
    }, intervalMs);
    
    // Initial sync
    this.sync();
    
    console.log(`MeetingSync: Otter sync started (every ${this.syncInterval} minutes)`);
  }
  
  /**
   * Stop background sync
   */
  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('MeetingSync: Otter sync stopped');
  }
  
  /**
   * Trigger immediate sync
   */
  async sync(): Promise<void> {
    if (!this.isConnected()) {
      console.log('MeetingSync: Cannot sync - not connected to Otter');
      return;
    }
    
    this.updateStatus('syncing', 'Syncing with Otter.ai...');
    
    try {
      // Fetch new transcripts since last sync
      const transcripts = await this.fetchTranscriptsSince(this.lastSyncTimestamp);
      
      if (transcripts.length > 0 && this.onSyncComplete) {
        await this.onSyncComplete(transcripts);
      }
      
      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      
      // Reset retry delay on success
      this.retryDelay = 60000;
      
      this.updateStatus('idle', `Synced ${transcripts.length} transcripts`);
      console.log(`MeetingSync: Otter sync complete - ${transcripts.length} new transcripts`);
      
    } catch (error: any) {
      console.error('MeetingSync: Otter sync failed', error);
      
      if (error.status === 401) {
        // Token expired - try refresh
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry sync after refresh
          await this.sync();
          return;
        }
        this.updateStatus('error', 'Otter.ai connection expired. Please re-authenticate.');
      } else if (error.status === 429) {
        // Rate limited
        this.updateStatus('error', `Rate limited. Retrying in ${Math.round(this.retryDelay / 60000)} minutes.`);
        this.scheduleRetry();
      } else {
        this.updateStatus('error', `Sync failed: ${error.message}`);
      }
    }
  }
  
  /**
   * Fetch transcripts created after a given timestamp
   */
  private async fetchTranscriptsSince(timestamp: number): Promise<RawTranscript[]> {
    const transcripts: RawTranscript[] = [];
    
    // If no timestamp, get transcripts from last 7 days
    const since = timestamp || Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const response = await this.apiRequest(`/speeches?created_after=${since}`);
    
    if (!response.speeches || !Array.isArray(response.speeches)) {
      return transcripts;
    }
    
    for (const speech of response.speeches) {
      try {
        const fullTranscript = await this.fetchTranscript(speech.id);
        if (fullTranscript) {
          transcripts.push(fullTranscript);
        }
      } catch (e) {
        console.error(`MeetingSync: Failed to fetch transcript ${speech.id}`, e);
      }
    }
    
    return transcripts;
  }
  
  /**
   * Fetch a single transcript by ID
   */
  private async fetchTranscript(id: string): Promise<RawTranscript | null> {
    try {
      const response = await this.apiRequest(`/speeches/${id}`);
      
      if (!response) {
        return null;
      }
      
      const segments: TranscriptSegment[] = (response.transcripts || []).map((t: any) => ({
        speaker: t.speaker || 'Unknown',
        timestamp: t.start_time || 0,
        endTimestamp: t.end_time,
        text: t.text || '',
      }));
      
      // Extract unique participants
      const participants = [...new Set(segments.map(s => s.speaker).filter(s => s && s !== 'Unknown'))];
      
      // Generate content hash for deduplication
      const contentForHash = segments.map(s => s.text).join('');
      const hash = this.parser.generateHash(contentForHash + response.id);
      
      return {
        source: 'otter',
        title: response.title || 'Untitled Meeting',
        date: new Date(response.created_at || Date.now()),
        duration: Math.ceil((response.duration || 0) / 60),
        participants,
        segments,
        sourceUrl: response.share_url || `https://otter.ai/u/${id}`,
        hash,
      };
    } catch (error) {
      console.error(`MeetingSync: Failed to fetch transcript ${id}`, error);
      return null;
    }
  }
  
  /**
   * Make an authenticated API request
   */
  private async apiRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const response: RequestUrlResponse = await requestUrl({
      url: `${OTTER_API_BASE}${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (response.status === 401) {
      const error: any = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
    
    if (response.status === 429) {
      const error: any = new Error('Rate limited');
      error.status = 429;
      throw error;
    }
    
    if (response.status !== 200) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json;
  }
  
  /**
   * Try to refresh the access token
   */
  private async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }
    
    try {
      const response: RequestUrlResponse = await requestUrl({
        url: `${OTTER_AUTH_URL}/refresh`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });
      
      if (response.status === 200) {
        const data = response.json;
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token || this.refreshToken;
        
        if (this.onTokenRefresh) {
          this.onTokenRefresh(this.accessToken, this.refreshToken);
        }
        
        console.log('MeetingSync: Otter token refreshed successfully');
        return true;
      }
    } catch (error) {
      console.error('MeetingSync: Token refresh failed', error);
    }
    
    return false;
  }
  
  /**
   * Schedule a retry with exponential backoff
   */
  private scheduleRetry(): void {
    setTimeout(() => {
      this.sync();
    }, this.retryDelay);
    
    // Increase delay for next retry (exponential backoff)
    this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
  }
  
  /**
   * Update and broadcast sync status
   */
  private updateStatus(status: 'idle' | 'syncing' | 'error', message?: string): void {
    this.syncStatus = {
      lastSync: status === 'idle' ? new Date() : this.syncStatus.lastSync,
      status,
      message,
    };
    
    if (this.onStatusChange) {
      this.onStatusChange(this.syncStatus);
    }
  }
  
  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }
  
  /**
   * Initiate OAuth flow
   * Returns the authorization URL to open in browser
   */
  getAuthUrl(redirectUri: string): string {
    // Note: Otter.ai's actual OAuth implementation may differ
    // This is a placeholder structure
    const params = new URLSearchParams({
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'read',
    });
    
    return `${OTTER_AUTH_URL}/authorize?${params.toString()}`;
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken: string;
    email: string;
  } | null> {
    try {
      const response: RequestUrlResponse = await requestUrl({
        url: `${OTTER_AUTH_URL}/token`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });
      
      if (response.status === 200) {
        const data = response.json;
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          email: data.email || '',
        };
      }
    } catch (error) {
      console.error('MeetingSync: OAuth token exchange failed', error);
    }
    
    return null;
  }
  
  /**
   * Disconnect from Otter (clear credentials)
   */
  disconnect(): void {
    this.stopSync();
    this.accessToken = '';
    this.refreshToken = '';
    this.email = '';
    this.updateStatus('idle', 'Disconnected');
  }
  
  /**
   * Clean up when plugin is unloaded
   */
  destroy(): void {
    this.stopSync();
    this.onSyncComplete = null;
    this.onStatusChange = null;
    this.onTokenRefresh = null;
  }
}

