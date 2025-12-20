/**
 * TranscriptParser - Parse various transcript formats (VTT, SRT, TXT, JSON)
 */

import { RawTranscript, TranscriptSegment } from '../types';
import * as crypto from 'crypto';

export class TranscriptParser {
  
  /**
   * Parse a transcript file based on its extension
   */
  async parseFile(content: string, filename: string): Promise<RawTranscript> {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    let segments: TranscriptSegment[];
    let participants: string[] = [];
    
    switch (extension) {
      case 'vtt':
        segments = this.parseVTT(content);
        break;
      case 'srt':
        segments = this.parseSRT(content);
        break;
      case 'json': {
        const jsonResult = this.parseJSON(content);
        segments = jsonResult.segments;
        participants = jsonResult.participants;
        break;
      }
      case 'txt':
      default:
        segments = this.parseTXT(content);
        break;
    }
    
    // Extract unique participants from segments
    if (participants.length === 0) {
      participants = [...new Set(segments.map(s => s.speaker).filter(s => s))];
    }
    
    // Calculate duration from last segment
    const duration = segments.length > 0 
      ? Math.ceil((segments[segments.length - 1].timestamp || 0) / 60)
      : 0;
    
    // Extract title from filename
    const title = this.extractTitle(filename);
    
    // Extract date from filename if present (YYYY-MM-DD format)
    const date = this.extractDateFromFilename(filename);
    
    // Generate hash for deduplication
    const hash = this.generateHash(content);
    
    return {
      source: 'local',
      title,
      date,
      duration,
      participants,
      segments,
      hash,
      rawContent: content,
    };
  }
  
  /**
   * Parse WebVTT format
   */
  private parseVTT(content: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const lines = content.split('\n');
    
    let currentSegment: Partial<TranscriptSegment> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
        continue;
      }
      
      // Check for timestamp line (HH:MM:SS.mmm or MM:SS.mmm --> HH:MM:SS.mmm or MM:SS.mmm)
      const timestampMatch = line.match(/(\d{2}:\d{2}(?::\d{2})?[.,]\d{3})\s*-->\s*(\d{2}:\d{2}(?::\d{2})?[.,]\d{3})/);
      
      if (timestampMatch) {
        // Save previous segment
        if (currentSegment && currentSegment.text && currentSegment.timestamp !== undefined) {
          segments.push({
            timestamp: currentSegment.timestamp,
            endTimestamp: currentSegment.endTimestamp,
            speaker: currentSegment.speaker || '',
            text: currentSegment.text,
          });
        }
        
        currentSegment = {
          timestamp: this.parseTimestamp(timestampMatch[1]),
          endTimestamp: this.parseTimestamp(timestampMatch[2]),
          speaker: '',
          text: '',
        };
      } else if (currentSegment && line && !line.match(/^\d+$/)) {
        // Parse speaker and text
        const speakerMatch = line.match(/^<v\s+([^>]+)>(.*)$/);
        if (speakerMatch) {
          currentSegment.speaker = speakerMatch[1].trim();
          currentSegment.text = (currentSegment.text ? currentSegment.text + ' ' : '') + speakerMatch[2].trim();
        } else {
          // Check for "Speaker: text" format
          const colonMatch = line.match(/^([^:]+):\s*(.*)$/);
          if (colonMatch && colonMatch[1].length < 30 && !currentSegment.speaker) {
            currentSegment.speaker = colonMatch[1].trim();
            currentSegment.text = colonMatch[2].trim();
          } else {
            currentSegment.text = (currentSegment.text ? currentSegment.text + ' ' : '') + line;
          }
        }
      }
    }
    
    // Add final segment
    if (currentSegment && currentSegment.text && currentSegment.timestamp !== undefined) {
      segments.push({
        timestamp: currentSegment.timestamp,
        endTimestamp: currentSegment.endTimestamp,
        speaker: currentSegment.speaker || '',
        text: currentSegment.text,
      });
    }
    
    return segments;
  }
  
  /**
   * Parse SRT (SubRip) format
   */
  private parseSRT(content: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const blocks = content.split(/\n\n+/);
    
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;
      
      // First line is index number
      // Second line is timestamp
      const timestampLine = lines[1];
      const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/);
      
      if (!timestampMatch) continue;
      
      // Remaining lines are text
      const textLines = lines.slice(2).join(' ');
      
      // Try to extract speaker
      let speaker = '';
      let text = textLines;
      
      const speakerMatch = textLines.match(/^([^:]+):\s*(.*)$/);
      if (speakerMatch && speakerMatch[1].length < 30) {
        speaker = speakerMatch[1].trim();
        text = speakerMatch[2].trim();
      }
      
      segments.push({
        timestamp: this.parseTimestamp(timestampMatch[1]),
        endTimestamp: this.parseTimestamp(timestampMatch[2]),
        speaker,
        text: this.stripHTMLTags(text),
      });
    }
    
    return segments;
  }
  
  /**
   * Parse JSON format (supports various structures)
   */
  private parseJSON(content: string): { segments: TranscriptSegment[]; participants: string[] } {
    const segments: TranscriptSegment[] = [];
    let participants: string[] = [];
    
    try {
      const data = JSON.parse(content);
      
      // Handle Otter.ai export format (transcripts plural)
      if (data.transcripts && Array.isArray(data.transcripts)) {
        for (const t of data.transcripts) {
          segments.push({
            speaker: t.speaker || '',
            timestamp: t.start_time || t.start || 0,
            endTimestamp: t.end_time || t.end,
            text: t.text || t.transcript || '',
          });
        }
        // Use explicit speakers list if provided (preferred for Otter format)
        if (data.speakers && Array.isArray(data.speakers)) {
          participants = data.speakers;
        }
      }
      // Handle simple transcript format (transcript singular - common export format)
      else if (data.transcript && Array.isArray(data.transcript)) {
        for (const t of data.transcript) {
          segments.push({
            speaker: t.speaker || '',
            timestamp: t.start_time || t.start || t.timestamp || 0,
            endTimestamp: t.end_time || t.end,
            text: t.text || '',
          });
        }
      }
      // Handle array of segments directly
      else if (Array.isArray(data)) {
        for (const item of data) {
          segments.push({
            speaker: item.speaker || item.name || '',
            timestamp: item.timestamp || item.start || item.start_time || 0,
            endTimestamp: item.end || item.end_time,
            text: item.text || item.content || item.transcript || '',
          });
        }
      }
      // Handle object with segments property
      else if (data.segments && Array.isArray(data.segments)) {
        for (const seg of data.segments) {
          segments.push({
            speaker: seg.speaker || '',
            timestamp: seg.timestamp || seg.start || 0,
            endTimestamp: seg.end,
            text: seg.text || '',
          });
        }
      }
      
      // Extract participants from explicit fields if not already set
      if (participants.length === 0) {
        if (data.participants && Array.isArray(data.participants)) {
          participants = data.participants;
        } else if (data.speakers && Array.isArray(data.speakers)) {
          participants = data.speakers;
        } else if (data.attendees && Array.isArray(data.attendees)) {
          participants = data.attendees;
        }
      }
    } catch (e) {
      console.error('Failed to parse JSON transcript:', e);
    }
    
    return { segments, participants };
  }
  
  /**
   * Parse plain text format (best effort)
   */
  private parseTXT(content: string): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const lines = content.split('\n');
    
    let currentTimestamp = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Try to match "Speaker: text" pattern
      const speakerMatch = trimmed.match(/^([^:]+):\s*(.+)$/);
      
      // Try to match timestamp patterns
      const timestampMatch = trimmed.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*/);
      
      let speaker = '';
      let text = trimmed;
      let timestamp = currentTimestamp;
      
      if (timestampMatch) {
        timestamp = this.parseTimestamp(timestampMatch[1]);
        text = trimmed.substring(timestampMatch[0].length);
        currentTimestamp = timestamp;
        
        // Check for speaker after timestamp
        const afterTimestamp = text.match(/^([^:]+):\s*(.+)$/);
        if (afterTimestamp && afterTimestamp[1].length < 30) {
          speaker = afterTimestamp[1].trim();
          text = afterTimestamp[2].trim();
        }
      } else if (speakerMatch && speakerMatch[1].length < 30) {
        speaker = speakerMatch[1].trim();
        text = speakerMatch[2].trim();
        // Increment timestamp by ~10 seconds for each line
        currentTimestamp += 10;
        timestamp = currentTimestamp;
      } else {
        // Increment timestamp
        currentTimestamp += 10;
        timestamp = currentTimestamp;
      }
      
      if (text) {
        segments.push({
          speaker,
          timestamp,
          text,
        });
      }
    }
    
    return segments;
  }
  
  /**
   * Parse timestamp string to seconds
   */
  private parseTimestamp(timestamp: string): number {
    // Remove milliseconds separator variations
    const normalized = timestamp.replace(',', '.');
    const parts = normalized.split(':');
    
    let seconds = 0;
    
    if (parts.length === 3) {
      // HH:MM:SS.mmm
      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      // MM:SS.mmm
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    
    return Math.floor(seconds);
  }
  
  /**
   * Format seconds to readable timestamp
   */
  formatTimestamp(seconds: number, totalDuration: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    // Use HH:MM:SS for meetings over an hour, MM:SS otherwise
    if (totalDuration >= 3600) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Extract title from filename
   */
  private extractTitle(filename: string): string {
    // Remove extension
    const withoutExt = filename.replace(/\.[^.]+$/, '');
    // Remove date prefix if present (YYYY-MM-DD)
    const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}\s*[-_]?\s*/, '');
    // Clean up and return
    return withoutDate.trim() || 'Meeting';
  }
  
  /**
   * Extract date from filename if present (YYYY-MM-DD format)
   */
  private extractDateFromFilename(filename: string): Date {
    // Try to extract date from filename (YYYY-MM-DD format)
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const parsedDate = new Date(dateStr);
      // Check if date is valid
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    // Default to current date if no date found in filename
    return new Date();
  }
  
  /**
   * Generate hash for deduplication
   */
  generateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }
  
  /**
   * Strip HTML tags from text
   */
  private stripHTMLTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }
}

