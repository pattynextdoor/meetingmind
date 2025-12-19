/**
 * Tests for TranscriptParser service
 */

import { TranscriptParser } from '../src/services/TranscriptParser';
import { RawTranscript, TranscriptSegment } from '../src/types';

describe('TranscriptParser', () => {
  let parser: TranscriptParser;

  beforeEach(() => {
    parser = new TranscriptParser();
  });

  describe('parseVTT', () => {
    it('should parse a basic VTT file', async () => {
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
<v John>Hello everyone, welcome to the meeting.

00:00:06.000 --> 00:00:10.000
<v Sarah>Thanks John. Let's discuss the project status.`;

      const result = await parser.parseFile(vttContent, 'meeting.vtt');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].speaker).toBe('John');
      expect(result.segments[0].text).toBe('Hello everyone, welcome to the meeting.');
      expect(result.segments[0].timestamp).toBe(0);
      expect(result.segments[1].speaker).toBe('Sarah');
      expect(result.participants).toContain('John');
      expect(result.participants).toContain('Sarah');
    });

    it('should parse VTT with speaker: format', async () => {
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
John: Hello everyone

00:00:06.000 --> 00:00:10.000
Sarah: Thanks for joining`;

      const result = await parser.parseFile(vttContent, 'meeting.vtt');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].speaker).toBe('John');
      expect(result.segments[1].speaker).toBe('Sarah');
    });

    it('should handle VTT without speakers', async () => {
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
This is a narrated video.

00:00:06.000 --> 00:00:10.000
With multiple segments.`;

      const result = await parser.parseFile(vttContent, 'video.vtt');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].speaker).toBe('');
      expect(result.segments[0].text).toBe('This is a narrated video.');
    });
  });

  describe('parseSRT', () => {
    it('should parse a basic SRT file', async () => {
      const srtContent = `1
00:00:00,000 --> 00:00:05,000
John: Hello everyone

2
00:00:06,000 --> 00:00:10,000
Sarah: Thanks for joining`;

      const result = await parser.parseFile(srtContent, 'meeting.srt');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].speaker).toBe('John');
      expect(result.segments[0].text).toBe('Hello everyone');
      expect(result.segments[0].timestamp).toBe(0);
      expect(result.segments[1].timestamp).toBe(6);
    });

    it('should strip HTML tags from SRT', async () => {
      const srtContent = `1
00:00:00,000 --> 00:00:05,000
<b>John</b>: <i>Hello</i> everyone`;

      const result = await parser.parseFile(srtContent, 'meeting.srt');

      expect(result.segments[0].text).toBe('Hello everyone');
    });
  });

  describe('parseJSON', () => {
    it('should parse Otter.ai format', async () => {
      const jsonContent = JSON.stringify({
        transcripts: [
          {
            speaker: 'John',
            start_time: 0,
            end_time: 5,
            text: 'Hello everyone',
          },
          {
            speaker: 'Sarah',
            start_time: 6,
            end_time: 10,
            text: 'Thanks for joining',
          },
        ],
        speakers: ['John', 'Sarah'],
      });

      const result = await parser.parseFile(jsonContent, 'meeting.json');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].speaker).toBe('John');
      expect(result.segments[0].timestamp).toBe(0);
      expect(result.participants).toEqual(['John', 'Sarah']);
    });

    it('should parse array format', async () => {
      const jsonContent = JSON.stringify([
        {
          speaker: 'John',
          timestamp: 0,
          text: 'Hello',
        },
        {
          speaker: 'Sarah',
          timestamp: 10,
          text: 'Hi there',
        },
      ]);

      const result = await parser.parseFile(jsonContent, 'meeting.json');

      expect(result.segments).toHaveLength(2);
      expect(result.participants).toContain('John');
      expect(result.participants).toContain('Sarah');
    });

    it('should parse object with segments property', async () => {
      const jsonContent = JSON.stringify({
        segments: [
          {
            speaker: 'John',
            timestamp: 0,
            text: 'Hello',
          },
        ],
        participants: ['John', 'Sarah'],
      });

      const result = await parser.parseFile(jsonContent, 'meeting.json');

      expect(result.segments).toHaveLength(1);
      expect(result.participants).toEqual(['John', 'Sarah']);
    });
  });

  describe('parseTXT', () => {
    it('should parse plain text with speaker format', async () => {
      const txtContent = `John: Hello everyone
Sarah: Thanks for joining
John: Let's get started`;

      const result = await parser.parseFile(txtContent, 'meeting.txt');

      expect(result.segments).toHaveLength(3);
      expect(result.segments[0].speaker).toBe('John');
      expect(result.segments[1].speaker).toBe('Sarah');
    });

    it('should parse text with timestamps', async () => {
      const txtContent = `[00:00] John: Hello everyone
[00:15] Sarah: Thanks for joining`;

      const result = await parser.parseFile(txtContent, 'meeting.txt');

      expect(result.segments).toHaveLength(2);
      expect(result.segments[0].timestamp).toBe(0);
      expect(result.segments[1].timestamp).toBe(15);
    });

    it('should handle text without speakers', async () => {
      const txtContent = `This is line one
This is line two
This is line three`;

      const result = await parser.parseFile(txtContent, 'notes.txt');

      expect(result.segments).toHaveLength(3);
      expect(result.segments[0].text).toBe('This is line one');
    });
  });

  describe('timestamp parsing', () => {
    it('should parse HH:MM:SS format', async () => {
      const vttContent = `WEBVTT

01:30:45.000 --> 01:30:50.000
Test content`;

      const result = await parser.parseFile(vttContent, 'test.vtt');

      // 1 hour 30 minutes 45 seconds = 5445 seconds
      expect(result.segments[0].timestamp).toBe(5445);
    });

    it('should parse MM:SS format', async () => {
      const vttContent = `WEBVTT

05:30.000 --> 05:35.000
Test content`;

      const result = await parser.parseFile(vttContent, 'test.vtt');

      // 5 minutes 30 seconds = 330 seconds
      expect(result.segments[0].timestamp).toBe(330);
    });
  });

  describe('formatTimestamp', () => {
    it('should format short timestamps as MM:SS', () => {
      expect(parser.formatTimestamp(65, 3599)).toBe('01:05');
      expect(parser.formatTimestamp(3599, 3599)).toBe('59:59');
    });

    it('should format long timestamps as HH:MM:SS', () => {
      expect(parser.formatTimestamp(3665, 7200)).toBe('01:01:05');
      expect(parser.formatTimestamp(7199, 7200)).toBe('01:59:59');
    });
  });

  describe('title extraction', () => {
    it('should extract title from filename', async () => {
      const content = 'John: Hello';
      
      const result1 = await parser.parseFile(content, 'Project Kickoff.txt');
      expect(result1.title).toBe('Project Kickoff');

      const result2 = await parser.parseFile(content, 'meeting_notes.txt');
      expect(result2.title).toBe('meeting_notes');
    });

    it('should remove date prefix from title', async () => {
      const content = 'John: Hello';
      
      const result = await parser.parseFile(content, '2024-01-15 Team Standup.txt');
      expect(result.title).toBe('Team Standup');
    });

    it('should return "Meeting" for empty filename', async () => {
      const content = 'John: Hello';
      
      const result = await parser.parseFile(content, '.txt');
      expect(result.title).toBe('Meeting');
    });
  });

  describe('hash generation', () => {
    it('should generate consistent hashes', () => {
      const content = 'test content';
      const hash1 = parser.generateHash(content);
      const hash2 = parser.generateHash(content);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', () => {
      const hash1 = parser.generateHash('content 1');
      const hash2 = parser.generateHash('content 2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('duration calculation', () => {
    it('should calculate duration from last segment', async () => {
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
Start

00:10:00.000 --> 00:10:05.000
End`;

      const result = await parser.parseFile(vttContent, 'meeting.vtt');

      // Duration should be in minutes, rounded up
      expect(result.duration).toBe(Math.ceil(600 / 60)); // 10 minutes
    });

    it('should return 0 for empty transcript', async () => {
      const vttContent = `WEBVTT`;

      const result = await parser.parseFile(vttContent, 'empty.vtt');

      expect(result.duration).toBe(0);
    });
  });

  describe('participant extraction', () => {
    it('should extract unique participants from segments', async () => {
      const txtContent = `John: First message
Sarah: Reply
John: Another message
Mike: Hello`;

      const result = await parser.parseFile(txtContent, 'meeting.txt');

      expect(result.participants).toHaveLength(3);
      expect(result.participants).toContain('John');
      expect(result.participants).toContain('Sarah');
      expect(result.participants).toContain('Mike');
    });

    it('should filter out empty speakers', async () => {
      const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
John: Hello

00:00:06.000 --> 00:00:10.000
Message without speaker`;

      const result = await parser.parseFile(vttContent, 'meeting.vtt');

      expect(result.participants).toEqual(['John']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', async () => {
      const result = await parser.parseFile('', 'empty.txt');

      expect(result.segments).toHaveLength(0);
      expect(result.participants).toHaveLength(0);
    });

    it('should handle malformed JSON gracefully', async () => {
      const result = await parser.parseFile('{invalid json}', 'bad.json');

      expect(result.segments).toHaveLength(0);
    });

    it('should handle very long speaker names', async () => {
      const txtContent = `This is a really long name that should not be treated as a speaker: Hello`;

      const result = await parser.parseFile(txtContent, 'test.txt');

      // Should treat the whole line as text, not separate speaker and text
      expect(result.segments[0].speaker).toBe('');
    });
  });
});

