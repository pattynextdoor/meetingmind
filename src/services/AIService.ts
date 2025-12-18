/**
 * AIService - AI-powered enrichment for meeting transcripts
 * Supports Claude (Anthropic), GPT-4 (OpenAI), and cloud-hosted option
 */

import { requestUrl, RequestUrlResponse } from 'obsidian';
import { AIEnrichment, AIProvider, RawTranscript, TranscriptSegment } from '../types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Token limits for chunking (approximate, being conservative)
const MAX_TOKENS_PER_CHUNK = 30000; // ~120KB of text
const CHARS_PER_TOKEN = 4; // Rough estimate

export class AIService {
  private provider: AIProvider;
  private claudeApiKey: string;
  private openaiApiKey: string;
  private enableSummary: boolean;
  private enableActionItems: boolean;
  private enableDecisions: boolean;
  private enableTagSuggestions: boolean;
  private existingTags: string[];
  
  constructor() {
    this.provider = 'disabled';
    this.claudeApiKey = '';
    this.openaiApiKey = '';
    this.enableSummary = true;
    this.enableActionItems = true;
    this.enableDecisions = true;
    this.enableTagSuggestions = true;
    this.existingTags = [];
  }
  
  /**
   * Configure the AI service
   */
  configure(
    provider: AIProvider,
    claudeApiKey: string,
    openaiApiKey: string,
    options: {
      enableSummary: boolean;
      enableActionItems: boolean;
      enableDecisions: boolean;
      enableTagSuggestions: boolean;
    }
  ): void {
    this.provider = provider;
    this.claudeApiKey = claudeApiKey;
    this.openaiApiKey = openaiApiKey;
    this.enableSummary = options.enableSummary;
    this.enableActionItems = options.enableActionItems;
    this.enableDecisions = options.enableDecisions;
    this.enableTagSuggestions = options.enableTagSuggestions;
  }
  
  /**
   * Set existing tags from vault for better tag suggestions
   */
  setExistingTags(tags: string[]): void {
    this.existingTags = tags;
  }
  
  /**
   * Check if AI is enabled and configured
   */
  isEnabled(): boolean {
    if (this.provider === 'disabled') return false;
    if (this.provider === 'claude' && !this.claudeApiKey) return false;
    if (this.provider === 'openai' && !this.openaiApiKey) return false;
    return true;
  }
  
  /**
   * Process a transcript and return AI enrichment
   */
  async processTranscript(transcript: RawTranscript): Promise<AIEnrichment | null> {
    if (!this.isEnabled()) {
      return null;
    }
    
    // Convert transcript to text
    const transcriptText = this.formatTranscriptForAI(transcript);
    
    // Check if we need to chunk
    const estimatedTokens = transcriptText.length / CHARS_PER_TOKEN;
    
    if (estimatedTokens > MAX_TOKENS_PER_CHUNK) {
      return await this.processLongTranscript(transcript, transcriptText);
    }
    
    return await this.processChunk(transcriptText);
  }
  
  /**
   * Process a long transcript by chunking
   */
  private async processLongTranscript(transcript: RawTranscript, fullText: string): Promise<AIEnrichment> {
    // Split into chunks based on time segments (~30 min each)
    const chunks = this.splitIntoChunks(transcript.segments);
    const chunkResults: AIEnrichment[] = [];
    
    for (const chunk of chunks) {
      const chunkText = this.formatSegmentsForAI(chunk);
      const result = await this.processChunk(chunkText);
      if (result) {
        chunkResults.push(result);
      }
    }
    
    // Merge results
    return this.mergeChunkResults(chunkResults);
  }
  
  /**
   * Split transcript segments into chunks of ~30 minutes each
   */
  private splitIntoChunks(segments: TranscriptSegment[]): TranscriptSegment[][] {
    const chunks: TranscriptSegment[][] = [];
    const CHUNK_DURATION = 30 * 60; // 30 minutes in seconds
    
    let currentChunk: TranscriptSegment[] = [];
    let chunkStartTime = segments[0]?.timestamp || 0;
    
    for (const segment of segments) {
      if (segment.timestamp - chunkStartTime > CHUNK_DURATION && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        chunkStartTime = segment.timestamp;
      }
      currentChunk.push(segment);
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  /**
   * Merge enrichment results from multiple chunks
   */
  private mergeChunkResults(results: AIEnrichment[]): AIEnrichment {
    const allActionItems = results.flatMap(r => r.actionItems);
    const allDecisions = results.flatMap(r => r.decisions);
    const allSummaries = results.map(r => r.summary).filter(s => s);
    const allTags = results.flatMap(r => r.suggestedTags);
    
    // Deduplicate action items by task text
    const uniqueActionItems = allActionItems.filter((item, index, self) =>
      index === self.findIndex(t => t.task.toLowerCase() === item.task.toLowerCase())
    );
    
    // Deduplicate decisions
    const uniqueDecisions = [...new Set(allDecisions)];
    
    // Deduplicate tags
    const uniqueTags = [...new Set(allTags)].slice(0, 5);
    
    // Combine summaries into hierarchical summary
    let combinedSummary = '';
    if (allSummaries.length === 1) {
      combinedSummary = allSummaries[0];
    } else if (allSummaries.length > 1) {
      combinedSummary = `**Overall:** ${allSummaries[0]}\n\n`;
      allSummaries.slice(1).forEach((summary, i) => {
        combinedSummary += `**Part ${i + 2}:** ${summary}\n\n`;
      });
      combinedSummary = combinedSummary.trim();
    }
    
    return {
      summary: combinedSummary,
      actionItems: uniqueActionItems,
      decisions: uniqueDecisions,
      suggestedTags: uniqueTags,
    };
  }
  
  /**
   * Process a single chunk of transcript
   */
  private async processChunk(transcriptText: string): Promise<AIEnrichment | null> {
    const prompt = this.buildPrompt(transcriptText);
    
    try {
      let response: string;
      
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'cloud') {
        // Cloud would call our backend - for now, fall back to Claude
        response = await this.callClaude(prompt);
      } else {
        return null;
      }
      
      return this.parseResponse(response);
    } catch (error) {
      console.error('MeetingSync: AI processing failed', error);
      throw error;
    }
  }
  
  /**
   * Build the prompt for AI enrichment
   */
  private buildPrompt(transcriptText: string): string {
    const sections: string[] = [];
    
    if (this.enableSummary) {
      sections.push('SUMMARY: A 2-4 sentence summary capturing the main topics discussed and any conclusions reached.');
    }
    
    if (this.enableActionItems) {
      sections.push('ACTION_ITEMS: A list of action items, tasks, commitments, or follow-ups mentioned. For each, include the task description, and if mentioned, the assignee and due date. If no action items are present, return an empty array.');
    }
    
    if (this.enableDecisions) {
      sections.push('DECISIONS: A list of explicit decisions made during the meeting. If no decisions were made, return an empty array.');
    }
    
    if (this.enableTagSuggestions) {
      const tagsHint = this.existingTags.length > 0 
        ? `Consider using these existing tags from the vault when relevant: ${this.existingTags.slice(0, 20).join(', ')}.`
        : '';
      sections.push(`TAGS: 3-5 relevant tags based on topics discussed. ${tagsHint}`);
    }
    
    return `Analyze the following meeting transcript and extract the requested information.

Return your response in the following JSON format:
{
  "summary": "string",
  "actionItems": [{"task": "string", "assignee": "string or null", "dueDate": "string or null"}],
  "decisions": ["string"],
  "suggestedTags": ["string"]
}

Only include the sections that are requested. Return valid JSON only, no additional text.

Requested sections:
${sections.join('\n')}

MEETING TRANSCRIPT:
${transcriptText}`;
  }
  
  /**
   * Call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    try {
      const response: RequestUrlResponse = await requestUrl({
        url: CLAUDE_API_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });
      
      if (response.status !== 200) {
        const error = response.json;
        console.error('Claude API response:', response.status, error);
        throw new Error(`Claude API error: ${error.error?.message || error.message || response.status}`);
      }
      
      const data = response.json;
      return data.content[0].text;
    } catch (error: any) {
      console.error('Claude API call failed:', error);
      // Re-throw with more context
      if (error.message) {
        throw error;
      }
      throw new Error(`Claude API request failed: ${error}`);
    }
  }
  
  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    const response: RequestUrlResponse = await requestUrl({
      url: OPENAI_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });
    
    if (response.status !== 200) {
      const error = response.json;
      throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
    }
    
    const data = response.json;
    return data.choices[0].message.content;
  }
  
  /**
   * Parse AI response into enrichment object
   */
  private parseResponse(response: string): AIEnrichment {
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      
      return {
        summary: data.summary || '',
        actionItems: (data.actionItems || []).map((item: any) => ({
          task: item.task || item,
          assignee: item.assignee || undefined,
          dueDate: item.dueDate || item.due_date || undefined,
        })),
        decisions: data.decisions || [],
        suggestedTags: (data.suggestedTags || data.tags || []).map((tag: string) => 
          tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        ),
      };
    } catch (error) {
      console.error('MeetingSync: Failed to parse AI response', error, response);
      return {
        summary: '',
        actionItems: [],
        decisions: [],
        suggestedTags: [],
      };
    }
  }
  
  /**
   * Format transcript for AI processing
   */
  private formatTranscriptForAI(transcript: RawTranscript): string {
    return this.formatSegmentsForAI(transcript.segments);
  }
  
  /**
   * Format segments for AI processing
   */
  private formatSegmentsForAI(segments: TranscriptSegment[]): string {
    return segments.map(seg => {
      const speaker = seg.speaker ? `${seg.speaker}: ` : '';
      return `${speaker}${seg.text}`;
    }).join('\n');
  }
  
  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isEnabled()) {
      return { success: false, message: 'AI is not configured' };
    }
    
    try {
      const testPrompt = 'Return exactly: {"test": "success"}';
      
      if (this.provider === 'claude') {
        await this.callClaude(testPrompt);
      } else if (this.provider === 'openai') {
        await this.callOpenAI(testPrompt);
      }
      
      return { success: true, message: 'Connection successful!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' };
    }
  }
}

