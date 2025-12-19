/**
 * LicenseService - Handle license validation and feature gating
 * Supports Gumroad license keys with API validation
 */

import { Notice, requestUrl } from 'obsidian';

export type LicenseStatus = 'free' | 'pro' | 'supporter';

export interface LicenseInfo {
  status: LicenseStatus;
  email?: string;
  validUntil?: string;
  purchaseDate?: string;
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

// Gumroad product configuration
// Product: https://tumbucon.gumroad.com/l/meetingmind-pro
const GUMROAD_PRODUCT_ID = 'meetingmind-pro';

export class LicenseService {
  private licenseKey: string = '';
  private licenseInfo: LicenseInfo;
  private lastValidation: number = 0;
  private readonly VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days offline grace
  
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
    
    // Check if we validated recently (cache valid licenses)
    const now = Date.now();
    if (now - this.lastValidation < this.VALIDATION_INTERVAL && this.licenseInfo.status !== 'free') {
      return this.licenseInfo;
    }
    
    try {
      // Detect key format and validate accordingly
      if (this.isGumroadKey(this.licenseKey)) {
        // Gumroad keys MUST be validated via API - no fallback to prevent abuse
        const result = await this.validateWithGumroad(this.licenseKey);
        this.licenseInfo = result;
        this.lastValidation = now;
        return this.licenseInfo;
      }
      
      // Non-Gumroad keys (dev/test only)
      const result = this.validateKeyFormat(this.licenseKey);
      this.licenseInfo = result;
      this.lastValidation = now;
      
      return this.licenseInfo;
    } catch (error) {
      console.error('MeetingMind: License validation failed', error);
      
      // On network error, keep existing Pro status for grace period
      // This only applies if they previously had a validated license
      if (this.licenseInfo.status !== 'free' && now - this.lastValidation < this.GRACE_PERIOD) {
        console.log('MeetingMind: Using cached license during grace period');
        return this.licenseInfo;
      }
      
      // Network failed and no cached license - return free
      this.licenseInfo = {
        status: 'free',
        features: TIER_FEATURES.free,
      };
      return this.licenseInfo;
    }
  }
  
  /**
   * Check if key looks like a Gumroad license key
   * Gumroad keys are typically: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX (32 hex + 3 dashes = 35 chars)
   */
  private isGumroadKey(key: string): boolean {
    // Gumroad format: 8 hex chars, dash, repeated 4 times
    const gumroadPattern = /^[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}-[A-F0-9]{8}$/i;
    return gumroadPattern.test(key.trim());
  }
  
  /**
   * Validate license key with Gumroad API
   */
  private async validateWithGumroad(key: string): Promise<LicenseInfo> {
    try {
      console.log('MeetingMind: Validating license with Gumroad...');
      console.log('MeetingMind: Product ID:', GUMROAD_PRODUCT_ID);
      console.log('MeetingMind: License key format check passed');
      
      const response = await requestUrl({
        url: 'https://api.gumroad.com/v2/licenses/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product_id=${GUMROAD_PRODUCT_ID}&license_key=${encodeURIComponent(key)}`,
        throw: false, // Don't throw on non-200 responses
      });
      
      console.log('MeetingMind: Gumroad response status:', response.status);
      
      let data;
      try {
        data = response.json;
        console.log('MeetingMind: Gumroad response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('MeetingMind: Response text:', response.text);
      }
      
      if (response.status === 200 && data?.success) {
        console.log('MeetingMind: Gumroad license valid!');
        
        // Check if the license has been refunded
        if (data.purchase?.refunded) {
          console.log('MeetingMind: License has been refunded');
          return {
            status: 'free',
            features: TIER_FEATURES.free,
          };
        }
        
        // Check if it's a supporter tier (you can add variants in Gumroad)
        const isSupporter = data.purchase?.variants?.includes('supporter') || 
                          data.purchase?.price >= 5000; // $50+ = supporter
        
        return {
          status: isSupporter ? 'supporter' : 'pro',
          email: data.purchase?.email,
          purchaseDate: data.purchase?.created_at,
          features: isSupporter ? TIER_FEATURES.supporter : TIER_FEATURES.pro,
          validUntil: 'lifetime',
        };
      } else {
        // Log the specific error from Gumroad
        console.log('MeetingMind: Gumroad validation failed');
        console.log('MeetingMind: Error message:', data?.message || 'Unknown error');
        
        // If Gumroad says the license is valid format but wrong product, 
        // it might be a product_id mismatch
        if (data?.message?.includes('product')) {
          console.log('MeetingMind: Possible product_id mismatch. Check Gumroad dashboard for correct permalink.');
        }
      }
    } catch (error: any) {
      console.error('MeetingMind: Gumroad API error:', error);
      console.error('MeetingMind: Error details:', error.message || error);
      
      // Network errors - don't invalidate existing license, trigger grace period
      throw error;
    }
    
    return {
      status: 'free',
      features: TIER_FEATURES.free,
    };
  }
  
  /**
   * Format validation for non-Gumroad keys (development/testing only)
   * Gumroad keys MUST be validated via API - no fallback
   */
  private validateKeyFormat(key: string): LicenseInfo {
    const upperKey = key.toUpperCase().trim();
    
    // Gumroad-format keys are NOT accepted here - they must pass API validation
    // This prevents abuse by generating random keys
    if (this.isGumroadKey(key)) {
      console.log('MeetingMind: Gumroad keys require API validation');
      return {
        status: 'free',
        features: TIER_FEATURES.free,
      };
    }
    
    // Development/testing keys
    // TEST-PRO works in all environments for testing/demo purposes
    if (upperKey === 'DEV-MODE' || upperKey === 'TEST-PRO') {
      console.log('MeetingMind: Using test license key (TEST-PRO)');
      return {
        status: 'pro',
        features: TIER_FEATURES.pro,
        validUntil: 'test',
      };
    }
    
    // Invalid key
    return {
      status: 'free',
      features: TIER_FEATURES.free,
    };
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
      `${feature} requires MeetingMind Pro.\n\nGet it at tumbucon.gumroad.com/l/meetingmind-pro for $25 (lifetime).`,
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
        return '✓ Pro License (Active)';
      default:
        return 'Free (AI features locked)';
    }
  }
  
  /**
   * Get the license key (masked for display)
   */
  getMaskedKey(): string {
    if (!this.licenseKey) return '';
    if (this.licenseKey.length <= 8) return '****';
    return this.licenseKey.slice(0, 4) + '...' + this.licenseKey.slice(-4);
  }
}
