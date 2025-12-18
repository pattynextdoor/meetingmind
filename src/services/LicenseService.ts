/**
 * LicenseService - Handle license validation and feature gating
 */

import { Notice, requestUrl } from 'obsidian';

export type LicenseStatus = 'free' | 'pro' | 'supporter';

export interface LicenseInfo {
  status: LicenseStatus;
  email?: string;
  validUntil?: string;
  features: {
    aiEnrichment: boolean;
    participantInsights: boolean;
    prioritySupport: boolean;
  };
}

// Features available in each tier
const TIER_FEATURES = {
  free: {
    aiEnrichment: false,
    participantInsights: false,
    prioritySupport: false,
  },
  pro: {
    aiEnrichment: true,
    participantInsights: true,
    prioritySupport: false,
  },
  supporter: {
    aiEnrichment: true,
    participantInsights: true,
    prioritySupport: true,
  },
};

export class LicenseService {
  private licenseKey: string = '';
  private licenseInfo: LicenseInfo;
  private lastValidation: number = 0;
  private readonly VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor() {
    this.licenseInfo = {
      status: 'free',
      features: TIER_FEATURES.free,
    };
  }
  
  /**
   * Set the license key and validate it
   */
  async setLicenseKey(key: string): Promise<LicenseInfo> {
    this.licenseKey = key.trim();
    
    if (!this.licenseKey) {
      this.licenseInfo = {
        status: 'free',
        features: TIER_FEATURES.free,
      };
      return this.licenseInfo;
    }
    
    return await this.validateLicense();
  }
  
  /**
   * Validate the current license key
   */
  async validateLicense(): Promise<LicenseInfo> {
    if (!this.licenseKey) {
      this.licenseInfo = {
        status: 'free',
        features: TIER_FEATURES.free,
      };
      return this.licenseInfo;
    }
    
    // Check if we validated recently
    const now = Date.now();
    if (now - this.lastValidation < this.VALIDATION_INTERVAL && this.licenseInfo.status !== 'free') {
      return this.licenseInfo;
    }
    
    try {
      // For now, use simple key format validation
      // Format: MM-PRO-XXXXX-XXXXX or MM-SUP-XXXXX-XXXXX
      const result = this.validateKeyFormat(this.licenseKey);
      this.licenseInfo = result;
      this.lastValidation = now;
      
      // In production, you'd call a validation API:
      // const result = await this.validateWithAPI(this.licenseKey);
      
      return this.licenseInfo;
    } catch (error) {
      console.error('MeetingMind: License validation failed', error);
      // On network error, keep existing status for grace period
      return this.licenseInfo;
    }
  }
  
  /**
   * Simple key format validation (for development/testing)
   * Production would use an API call to Gumroad/LemonSqueezy
   */
  private validateKeyFormat(key: string): LicenseInfo {
    const upperKey = key.toUpperCase().trim();
    
    // Pro key format: MM-PRO-XXXXX-XXXXX
    if (upperKey.startsWith('MM-PRO-') && upperKey.length >= 17) {
      return {
        status: 'pro',
        features: TIER_FEATURES.pro,
        validUntil: 'lifetime',
      };
    }
    
    // Supporter key format: MM-SUP-XXXXX-XXXXX
    if (upperKey.startsWith('MM-SUP-') && upperKey.length >= 17) {
      return {
        status: 'supporter',
        features: TIER_FEATURES.supporter,
        validUntil: 'lifetime',
      };
    }
    
    // Legacy format support: PRO-XXXXX or CLOUD-XXXXX
    if (upperKey.startsWith('PRO-')) {
      return {
        status: 'pro',
        features: TIER_FEATURES.pro,
        validUntil: 'lifetime',
      };
    }
    
    // Invalid key
    return {
      status: 'free',
      features: TIER_FEATURES.free,
    };
  }
  
  /**
   * Validate with remote API (for production)
   */
  private async validateWithAPI(key: string): Promise<LicenseInfo> {
    try {
      const response = await requestUrl({
        url: 'https://api.meetingmind.app/validate-license',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ license_key: key }),
      });
      
      if (response.status === 200) {
        const data = response.json;
        return {
          status: data.tier || 'free',
          email: data.email,
          validUntil: data.valid_until,
          features: TIER_FEATURES[data.tier as keyof typeof TIER_FEATURES] || TIER_FEATURES.free,
        };
      }
    } catch (error) {
      console.error('MeetingMind: API validation failed', error);
    }
    
    // Fallback to format validation if API fails
    return this.validateKeyFormat(key);
  }
  
  /**
   * Get current license info
   */
  getLicenseInfo(): LicenseInfo {
    return this.licenseInfo;
  }
  
  /**
   * Check if a specific feature is available
   */
  hasFeature(feature: keyof LicenseInfo['features']): boolean {
    return this.licenseInfo.features[feature];
  }
  
  /**
   * Check if user has Pro or higher
   */
  isPro(): boolean {
    return this.licenseInfo.status === 'pro' || this.licenseInfo.status === 'supporter';
  }
  
  /**
   * Check if user is a supporter
   */
  isSupporter(): boolean {
    return this.licenseInfo.status === 'supporter';
  }
  
  /**
   * Show upgrade notice for a feature
   */
  showUpgradeNotice(feature: string): void {
    new Notice(
      `${feature} requires MeetingMind Pro.\n\nUpgrade at meetingmind.app for $25 (lifetime).`,
      8000
    );
  }
  
  /**
   * Get status display text
   */
  getStatusText(): string {
    switch (this.licenseInfo.status) {
      case 'supporter':
        return '⭐ Supporter Edition';
      case 'pro':
        return '✓ Pro License';
      default:
        return 'Free (AI features locked)';
    }
  }
}

