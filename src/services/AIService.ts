/**
 * AIService - AI-powered enrichment for meeting transcripts
 * Supports Claude (Anthropic), GPT-4 (OpenAI), and cloud-hosted option
 */

import { requestUrl, RequestUrlResponse } from 'obsidian';
import { AIEnrichment, AIProvider, RawTranscript, TranscriptSegment, ParticipantInsight, EntityExtraction, Entity, EntityStatusUpdate } from '../types';

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
    
    let enrichment: AIEnrichment | null;
    
    if (estimatedTokens > MAX_TOKENS_PER_CHUNK) {
      enrichment = await this.processLongTranscript(transcript, transcriptText);
    } else {
      enrichment = await this.processChunk(transcriptText);
    }
    
    // Generate participant insights if we have participants
    if (enrichment && transcript.participants.length > 0) {
      try {
        const insights = await this.generateParticipantInsights(transcript);
        if (insights) {
          enrichment.participantInsights = insights;
        }
      } catch (error) {
        console.error('MeetingMind: Failed to generate participant insights', error);
        // Continue without participant insights
      }
    }
    
    return enrichment;
  }
  
  /**
   * Generate per-participant insights from the transcript
   */
  async generateParticipantInsights(transcript: RawTranscript): Promise<ParticipantInsight[] | null> {
    if (!this.isEnabled()) {
      return null;
    }
    
    const transcriptText = this.formatTranscriptForAI(transcript);
    const participants = transcript.participants.join(', ');
    
    const prompt = `Analyze this meeting transcript and provide insights for each participant.

PARTICIPANTS: ${participants}

For each participant, extract:
1. Their likely role or expertise (inferred from what they discuss)
2. Key points they made or contributed
3. Action items specifically assigned to them
4. Wins/achievements: Things they completed, accomplished, or succeeded at (e.g., "Finished the API migration", "Launched feature X", "Resolved bug Y")
5. Their overall engagement/sentiment (brief)

Return as JSON:
{
  "participants": [
    {
      "name": "Participant Name",
      "role": "Their likely role (e.g., 'Frontend Engineer', 'Project Manager')",
      "keyPoints": ["Point 1", "Point 2"],
      "actionItems": [{"task": "Task description", "dueDate": "date if mentioned"}],
      "wins": ["Achievement 1", "Achievement 2"],
      "sentiment": "Brief description of their engagement"
    }
  ]
}

Only include participants who actually spoke in the transcript. Return valid JSON only. Wins should be specific accomplishments mentioned in the meeting.

TRANSCRIPT:
${transcriptText}`;

    try {
      let response: string;
      
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'cloud') {
        response = await this.callClaude(prompt);
      } else {
        return null;
      }
      
      return this.parseParticipantInsights(response);
    } catch (error) {
      console.error('MeetingMind: Failed to generate participant insights', error);
      return null;
    }
  }
  
  /**
   * Enrich participant insights with entity information (updates, topics, issues)
   */
  enrichParticipantInsightsWithEntities(
    insights: ParticipantInsight[],
    entities: EntityExtraction,
    meetingDate: Date
  ): ParticipantInsight[] {
    const meetingDateStr = meetingDate.toISOString().split('T')[0];
    
    return insights.map(insight => {
      const enriched = { ...insight };
      
      // Add updates owned by this participant
      enriched.updates = entities.updates
        .filter(update => update.mentionedBy?.toLowerCase() === insight.name.toLowerCase())
        .map(update => ({
          name: update.name,
          status: update.status || 'in-progress',
          date: meetingDateStr
        }));
      
      // Add topics owned by this participant
      enriched.ownedTopics = entities.topics
        .filter(topic => topic.mentionedBy?.toLowerCase() === insight.name.toLowerCase())
        .map(topic => topic.name);
      
      // Add issues raised by this participant
      enriched.raisedIssues = entities.issues
        .filter(issue => issue.mentionedBy?.toLowerCase() === insight.name.toLowerCase())
        .map(issue => issue.name);
      
      return enriched;
    });
  }
  
  /**
   * Parse participant insights from AI response
   */
  private parseParticipantInsights(response: string): ParticipantInsight[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const data = JSON.parse(jsonMatch[0]) as { participants?: Array<{
        name?: string;
        role?: string;
        keyPoints?: string[];
        actionItems?: Array<string | { task?: string; dueDate?: string; due_date?: string }>;
        wins?: string[];
        sentiment?: string;
      }> };
      const participants = data.participants || [];
      
      return participants.map((p) => ({
        name: p.name || '',
        role: p.role || undefined,
        keyPoints: p.keyPoints || [],
        actionItems: (p.actionItems || []).map((item) => ({
          task: typeof item === 'string' ? item : (item.task || ''),
          assignee: p.name,
          dueDate: typeof item === 'object' && item !== null ? (item.dueDate || item.due_date || undefined) : undefined,
        })),
        wins: p.wins || [],
        sentiment: p.sentiment || undefined,
      }));
    } catch (error) {
      console.error('MeetingMind: Failed to parse participant insights', error);
      return [];
    }
  }
  
  /**
   * Extract entities (issues, updates, topics) from transcript
   */
  async extractEntities(transcript: RawTranscript): Promise<EntityExtraction | null> {
    if (!this.isEnabled()) {
      return null;
    }
    
    const transcriptText = this.formatTranscriptForAI(transcript);
    
    const prompt = `Analyze this meeting transcript and extract the following entities:

ISSUES: Technical problems, blockers, bugs, or challenges mentioned. These should be specific, actionable problems that need resolution.
Format: { "name": "Issue name", "description": "Brief context", "mentionedBy": "Person who raised it", "status": "in-progress|blocked|resolved" }

UPDATES: Progress updates, milestones, status changes, completion announcements. These should be substantive updates about work progress.
Format: { "name": "Update name", "description": "What changed", "status": "in-progress|completed|blocked", "mentionedBy": "Person who owns this work" }

TOPICS: Important concepts, systems, initiatives, or recurring themes discussed. These should be significant topics that are worth documenting.
Format: { "name": "Topic name", "description": "What it is", "category": "technical|process|product", "mentionedBy": "Person who owns or leads this topic" }

Return as JSON:
{
  "issues": [
    {
      "name": "Issue name",
      "description": "Brief description",
      "mentionedBy": "Person name or null",
      "status": "in-progress|blocked|resolved"
    }
  ],
  "updates": [
    {
      "name": "Update name",
      "description": "What changed",
      "status": "in-progress|completed|blocked",
      "mentionedBy": "Person name or null"
    }
  ],
  "topics": [
    {
      "name": "Topic name",
      "description": "What it is",
      "category": "technical|process|product",
      "mentionedBy": "Person name or null"
    }
  ]
}

Only extract clear, substantive mentions. Return empty arrays if none found. Return valid JSON only.

TRANSCRIPT:
${transcriptText}`;

    try {
      let response: string;
      
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'cloud') {
        response = await this.callClaude(prompt);
      } else {
        return null;
      }
      
      return this.parseEntityExtraction(response);
    } catch (error) {
      console.error('MeetingMind: Failed to extract entities', error);
      return null;
    }
  }
  
  /**
   * Parse entity extraction from AI response
   */
  private parseEntityExtraction(response: string): EntityExtraction {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const data = JSON.parse(jsonMatch[0]) as {
        issues?: Array<Record<string, unknown>>;
        updates?: Array<Record<string, unknown>>;
        topics?: Array<Record<string, unknown>>;
      };
      
      const parseEntity = (item: Record<string, unknown>, type: 'issue' | 'update' | 'topic'): Entity => {
        const entity: Entity = {
          type,
          name: typeof item.name === 'string' ? item.name : '',
        };
        
        if (typeof item.description === 'string') {
          entity.description = item.description;
        }
        if (typeof item.mentionedBy === 'string') {
          entity.mentionedBy = item.mentionedBy;
        }
        if (typeof item.status === 'string' && ['in-progress', 'completed', 'blocked'].includes(item.status)) {
          entity.status = item.status as 'in-progress' | 'completed' | 'blocked';
        }
        if (typeof item.relatedTo === 'string') {
          entity.relatedTo = item.relatedTo;
        }
        if (typeof item.category === 'string') {
          entity.category = item.category;
        }
        
        return entity;
      };
      
      return {
        issues: (data.issues || []).map((item) => parseEntity(item, 'issue')),
        updates: (data.updates || []).map((item) => parseEntity(item, 'update')),
        topics: (data.topics || []).map((item) => parseEntity(item, 'topic')),
      };
    } catch (error) {
      console.error('MeetingMind: Failed to parse entity extraction', error);
      return {
        issues: [],
        updates: [],
        topics: [],
      };
    }
  }
  
  /**
   * Synthesize a new description by combining existing content with new information
   * Used to update entity and participant notes with accumulated context
   */
  async synthesizeDescription(
    entityName: string,
    entityType: 'issue' | 'topic' | 'person',
    existingDescription: string,
    newContext: string,
    meetingTitle: string
  ): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }
    
    const prompt = `You are updating a knowledge base entry. Synthesize the existing description with new information from a recent meeting.

ENTITY: ${entityName}
TYPE: ${entityType}

EXISTING DESCRIPTION:
${existingDescription || '(No existing description)'}

NEW CONTEXT FROM "${meetingTitle}":
${newContext}

INSTRUCTIONS:
1. Create a comprehensive, synthesized description that incorporates both the existing information and new context
2. Keep the most important and relevant details from both sources
3. Remove redundancy - don't repeat the same information
4. Maintain a professional, concise tone
5. For people: focus on their role, responsibilities, current projects, and expertise
6. For issues: focus on the problem, impact, current status, and any progress
7. For topics: focus on what it is, why it matters, and current state
8. Keep it to 2-4 sentences maximum
9. Write in present tense

Return ONLY the synthesized description text, no JSON or extra formatting.`;

    try {
      let response: string;
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else {
        return null;
      }
      
      // Clean up the response - remove any quotes or extra whitespace
      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('MeetingMind: Failed to synthesize description', error);
      return null;
    }
  }
  
  /**
   * Synthesize a person's "About" section based on accumulated meeting context
   */
  async synthesizePersonAbout(
    personName: string,
    existingAbout: string,
    recentMeetingContext: string,
    meetingTitle: string
  ): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }
    
    const prompt = `You are updating a person's profile in a knowledge base. Synthesize what we know about them.

PERSON: ${personName}

EXISTING "ABOUT" SECTION:
${existingAbout || '(No existing information)'}

NEW CONTEXT FROM "${meetingTitle}":
${recentMeetingContext}

INSTRUCTIONS:
1. Create a comprehensive "About" section that captures who this person is professionally
2. Include: their role, what they're working on, their expertise, and responsibilities
3. Incorporate new information without losing important existing context
4. Write in third person (e.g., "Sarah leads the frontend team...")
5. Keep it concise: 2-4 sentences
6. Focus on actionable, useful information for someone who needs to work with them

Return ONLY the synthesized "About" text, no JSON or extra formatting.`;

    try {
      let response: string;
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else {
        return null;
      }
      
      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('MeetingMind: Failed to synthesize person about', error);
      return null;
    }
  }
  
  /**
   * Process a long transcript by chunking
   */
  private async processLongTranscript(transcript: RawTranscript, _fullText: string): Promise<AIEnrichment> {
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
      console.error('MeetingMind: AI processing failed', error);
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
        const errorMessage = (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error && typeof error.error.message === 'string') 
          ? error.error.message 
          : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string')
          ? error.message
          : String(response.status);
        throw new Error(`Claude API error: ${errorMessage}`);
      }
      
      const data = response.json;
      return data.content[0].text;
    } catch (error: unknown) {
      console.error('Claude API call failed:', error);
      // Re-throw with more context
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Claude API request failed: ${String(error)}`);
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
      const errorMessage = (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error && typeof error.error.message === 'string')
        ? error.error.message
        : String(response.status);
      throw new Error(`OpenAI API error: ${errorMessage}`);
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
      
      const data = JSON.parse(jsonMatch[0]) as {
        summary?: string;
        actionItems?: Array<string | { task?: string; assignee?: string; dueDate?: string; due_date?: string }>;
        decisions?: string[];
        suggestedTags?: string[];
        tags?: string[];
      };
      
      return {
        summary: data.summary || '',
        actionItems: (data.actionItems || []).map((item) => ({
          task: typeof item === 'string' ? item : (item.task || ''),
          assignee: typeof item === 'object' && item !== null ? (item.assignee || undefined) : undefined,
          dueDate: typeof item === 'object' && item !== null ? (item.dueDate || item.due_date || undefined) : undefined,
        })),
        decisions: data.decisions || [],
        suggestedTags: (data.suggestedTags || data.tags || []).map((tag: string) => 
          tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        ),
      };
    } catch (error) {
      console.error('MeetingMind: Failed to parse AI response', error, response);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Analyze meeting context to detect status changes for existing entities
   * Checks if issues are resolved, updates are completed/stale, etc.
   */
  async analyzeEntityStatusChanges(
    transcript: RawTranscript,
    existingEntities: Array<{ name: string; type: 'issue' | 'update' | 'topic'; currentStatus?: string }>
  ): Promise<EntityStatusUpdate[]> {
    if (!this.isEnabled() || existingEntities.length === 0) {
      return [];
    }
    
    const transcriptText = this.formatTranscriptForAI(transcript);
    const entitiesList = existingEntities.map(e => `- ${e.name} (${e.type}, current: ${e.currentStatus || 'none'})`).join('\n');
    
    const prompt = `Analyze this meeting transcript and determine if any of these existing entities have status changes.

EXISTING ENTITIES:
${entitiesList}

For each entity mentioned in the meeting, determine:
- If an ISSUE was resolved, fixed, or closed → status: "resolved"
- If an UPDATE was completed or finished → status: "completed"  
- If an UPDATE or ISSUE hasn't been mentioned in a while and seems outdated → status: "stale"
- If an ISSUE is still being worked on → status: "in-progress"
- If an ISSUE is blocked → status: "blocked"

Return as JSON:
{
  "statusUpdates": [
    {
      "entityName": "Exact name from list above",
      "entityType": "issue|update|topic",
      "newStatus": "resolved|completed|stale|in-progress|blocked",
      "reason": "Brief explanation of why status changed"
    }
  ]
}

Only include entities that have clear status changes mentioned in the meeting. Return empty array if none. Return valid JSON only.

TRANSCRIPT:
${transcriptText}`;

    try {
      let response: string;
      
      if (this.provider === 'claude') {
        response = await this.callClaude(prompt);
      } else if (this.provider === 'openai') {
        response = await this.callOpenAI(prompt);
      } else if (this.provider === 'cloud') {
        response = await this.callClaude(prompt);
      } else {
        return [];
      }
      
      return this.parseEntityStatusUpdates(response);
    } catch (error) {
      console.error('MeetingMind: Failed to analyze entity status changes', error);
      return [];
    }
  }
  
  /**
   * Parse entity status updates from AI response
   */
  private parseEntityStatusUpdates(response: string): EntityStatusUpdate[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return [];
      }
      
      const data = JSON.parse(jsonMatch[0]) as {
        statusUpdates?: Array<{
          entityName?: string;
          entityType?: 'issue' | 'update' | 'topic';
          newStatus?: string;
          reason?: string;
        }>;
      };
      
      if (!data.statusUpdates || !Array.isArray(data.statusUpdates)) {
        return [];
      }
      
      const validStatuses = ['in-progress', 'completed', 'blocked', 'resolved', 'stale'] as const;
      
      const updates: EntityStatusUpdate[] = [];
      
      for (const update of data.statusUpdates) {
        const entityName = update.entityName || '';
        if (!entityName) continue;
        
        const newStatus = update.newStatus && typeof update.newStatus === 'string' && validStatuses.includes(update.newStatus as typeof validStatuses[number])
          ? (update.newStatus as typeof validStatuses[number])
          : undefined;
        
        if (!newStatus) continue;
        
        updates.push({
          entityName,
          entityType: (update.entityType || 'issue') as 'issue' | 'update' | 'topic',
          newStatus,
          reason: update.reason,
        });
      }
      
      return updates;
    } catch (error) {
      console.error('MeetingMind: Failed to parse entity status updates', error);
      return [];
    }
  }
}

