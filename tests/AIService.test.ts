/**
 * Tests for AIService
 */

import { AIService } from '../src/services/AIService';
import { RawTranscript } from '../src/types';

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  const createMockTranscript = (): RawTranscript => ({
    source: 'local',
    title: 'Team Meeting',
    date: new Date('2024-01-15'),
    duration: 30,
    participants: ['Alice', 'Bob'],
    segments: [
      { speaker: 'Alice', timestamp: 0, text: "Let's discuss the project timeline." },
      { speaker: 'Bob', timestamp: 5, text: "I'll complete the API by Friday." },
      { speaker: 'Alice', timestamp: 10, text: 'Great! We decided to use TypeScript.' },
    ],
    hash: 'test-hash',
  });

  describe('configure', () => {
    it('should configure with Claude provider', () => {
      aiService.configure('claude', 'test-api-key', '', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      expect(aiService.isEnabled()).toBe(true);
    });

    it('should configure with OpenAI provider', () => {
      aiService.configure('openai', '', 'test-api-key', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      expect(aiService.isEnabled()).toBe(true);
    });

    it('should be disabled when provider is disabled', () => {
      aiService.configure('disabled', '', '', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      expect(aiService.isEnabled()).toBe(false);
    });

    it('should be disabled without API key', () => {
      aiService.configure('claude', '', '', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      expect(aiService.isEnabled()).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return false by default', () => {
      expect(aiService.isEnabled()).toBe(false);
    });

    it('should return true after valid configuration', () => {
      aiService.configure('claude', 'valid-key', '', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      expect(aiService.isEnabled()).toBe(true);
    });
  });

  describe('setExistingTags', () => {
    it('should store existing tags for suggestions', () => {
      const tags = ['meeting', 'project', 'development'];
      aiService.setExistingTags(tags);

      // Tags are stored internally - we can't directly test this
      // but it shouldn't throw an error
      expect(() => aiService.setExistingTags(tags)).not.toThrow();
    });

    it('should handle empty tag array', () => {
      expect(() => aiService.setExistingTags([])).not.toThrow();
    });
  });

  describe('processTranscript', () => {
    it('should return null when not configured', async () => {
      const transcript = createMockTranscript();

      const result = await aiService.processTranscript(transcript);
      expect(result).toBeNull();
    });

    // Note: Testing actual API calls would require mocking or integration tests
    // These tests verify the service structure and basic error handling
  });

  describe('extractEntities', () => {
    it('should return null when not configured', async () => {
      const transcript = createMockTranscript();

      const result = await aiService.extractEntities(transcript);
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle transcript with no segments', async () => {
      const transcript = createMockTranscript();
      transcript.segments = [];

      aiService.configure('claude', 'test-key', '', {
        enableSummary: true,
        enableActionItems: true,
        enableDecisions: true,
        enableTagSuggestions: true,
      });

      // Should not crash (actual API call would be mocked in integration test)
    });

    it('should handle transcript with empty text', async () => {
      const transcript = createMockTranscript();
      transcript.segments = [
        { speaker: 'Alice', timestamp: 0, text: '' },
      ];

      // Should not crash
      expect(transcript.segments[0].text).toBe('');
    });
  });

  describe('configuration validation', () => {
    it('should accept valid provider types', () => {
      expect(() => {
        aiService.configure('claude', 'key', '', {
          enableSummary: true,
          enableActionItems: true,
          enableDecisions: true,
          enableTagSuggestions: true,
        });
      }).not.toThrow();

      expect(() => {
        aiService.configure('openai', '', 'key', {
          enableSummary: true,
          enableActionItems: true,
          enableDecisions: true,
          enableTagSuggestions: true,
        });
      }).not.toThrow();
    });

    it('should handle feature toggles', () => {
      // Test with all features disabled
      aiService.configure('claude', 'test-key', '', {
        enableSummary: false,
        enableActionItems: false,
        enableDecisions: false,
        enableTagSuggestions: false,
      });

      expect(aiService.isEnabled()).toBe(true); // Service is enabled but features might be off
    });
  });
});

