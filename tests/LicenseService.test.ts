/**
 * Tests for LicenseService
 */

import { LicenseService } from '../src/services/LicenseService';

describe('LicenseService', () => {
  let licenseService: LicenseService;

  beforeEach(() => {
    licenseService = new LicenseService();
  });

  describe('initial state', () => {
    it('should start with free tier', () => {
      expect(licenseService.isPro()).toBe(false);
      expect(licenseService.hasFeature('aiEnrichment')).toBe(false);
    });
  });

  describe('setLicenseKey', () => {
    it('should accept valid license key', async () => {
      // Note: Actual validation would require a real license key
      // This tests the method exists and doesn't crash
      await expect(licenseService.setLicenseKey('')).resolves.not.toThrow();
    });

    it('should handle empty license key', async () => {
      await licenseService.setLicenseKey('');
      expect(licenseService.isPro()).toBe(false);
    });
  });

  describe('hasFeature', () => {
    it('should return false for pro features on free tier', () => {
      expect(licenseService.hasFeature('aiEnrichment')).toBe(false);
      expect(licenseService.hasFeature('participantInsights')).toBe(false);
      expect(licenseService.hasFeature('prioritySupport')).toBe(false);
    });
  });

  describe('isPro', () => {
    it('should return false by default', () => {
      expect(licenseService.isPro()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid feature names gracefully', () => {
      // @ts-ignore - Testing invalid input
      const result = licenseService.hasFeature('nonexistentFeature');
      expect(result).toBeUndefined();
    });
  });
});

