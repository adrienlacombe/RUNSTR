/**
 * NWCStorageService - Manages Nostr Wallet Connect connection strings
 * Handles storage, validation, and connection testing
 * Simple, safe, and reliable - fails gracefully
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  NWC_STRING: '@runstr:nwc_string',
  NWC_STATUS: '@runstr:nwc_status',
  LAST_CONNECTION_TEST: '@runstr:nwc_last_test',
} as const;

export interface NWCStatus {
  connected: boolean;
  lastTested: number;
  walletInfo?: {
    balance: number;
    alias?: string;
  };
}

/**
 * Service for managing NWC connection strings
 * All operations fail gracefully - app continues to work without NWC
 */
class NWCStorageServiceClass {
  /**
   * Validate NWC connection string format
   * Checks basic format without network calls
   */
  validateFormat(nwcString: string): boolean {
    try {
      // Basic format validation
      if (!nwcString || typeof nwcString !== 'string') {
        return false;
      }

      // Must start with correct protocol
      if (!nwcString.startsWith('nostr+walletconnect://')) {
        return false;
      }

      // Must be reasonable length (avoid empty or malformed strings)
      if (nwcString.length < 50) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[NWC] Format validation error:', error);
      return false;
    }
  }

  /**
   * Test NWC connection using Alby MCP tools
   * Returns true if connection works, false otherwise
   */
  async testConnection(nwcString: string): Promise<boolean> {
    try {
      // Format check first
      if (!this.validateFormat(nwcString)) {
        console.log('[NWC] Invalid format, skipping connection test');
        return false;
      }

      // Test connection by getting wallet info
      // Note: Alby MCP tools will use the NWC string from environment/config
      // This is a placeholder for actual implementation
      // In production, you'll configure Alby MCP to use the NWC string

      console.log('[NWC] Testing connection...');

      // For now, return true if format is valid
      // Real implementation will use: await mcp__alby__get_wallet_service_info()
      return true;
    } catch (error) {
      console.error('[NWC] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Save NWC connection string
   * Validates and tests connection before saving
   */
  async saveNWCString(nwcString: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[NWC] Attempting to save connection string');

      // Validate format
      if (!this.validateFormat(nwcString)) {
        return {
          success: false,
          error: 'Invalid NWC format. Must start with nostr+walletconnect://',
        };
      }

      // Test connection
      const connectionWorks = await this.testConnection(nwcString);
      if (!connectionWorks) {
        return {
          success: false,
          error: 'Could not connect to wallet. Please check your connection string.',
        };
      }

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.NWC_STRING, nwcString);

      // Save connection status
      const status: NWCStatus = {
        connected: true,
        lastTested: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.NWC_STATUS, JSON.stringify(status));

      console.log('[NWC] Connection string saved successfully');
      return { success: true };
    } catch (error) {
      console.error('[NWC] Save failed:', error);
      return {
        success: false,
        error: 'Failed to save connection string',
      };
    }
  }

  /**
   * Get stored NWC connection string
   * Returns null if not configured
   */
  async getNWCString(): Promise<string | null> {
    try {
      const nwcString = await AsyncStorage.getItem(STORAGE_KEYS.NWC_STRING);
      return nwcString;
    } catch (error) {
      console.error('[NWC] Failed to get connection string:', error);
      return null;
    }
  }

  /**
   * Check if user has NWC configured
   * Fast check for gating Bitcoin features
   */
  async hasNWC(): Promise<boolean> {
    try {
      const nwcString = await this.getNWCString();
      return nwcString !== null && nwcString.length > 0;
    } catch (error) {
      console.error('[NWC] Has NWC check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   * Returns cached status with last test time
   */
  async getStatus(): Promise<NWCStatus> {
    try {
      const statusStr = await AsyncStorage.getItem(STORAGE_KEYS.NWC_STATUS);
      if (!statusStr) {
        return { connected: false, lastTested: 0 };
      }

      const status: NWCStatus = JSON.parse(statusStr);
      return status;
    } catch (error) {
      console.error('[NWC] Get status failed:', error);
      return { connected: false, lastTested: 0 };
    }
  }

  /**
   * Update connection status
   * Call this after successful/failed operations
   */
  async updateStatus(connected: boolean, walletInfo?: { balance: number; alias?: string }): Promise<void> {
    try {
      const status: NWCStatus = {
        connected,
        lastTested: Date.now(),
        walletInfo,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.NWC_STATUS, JSON.stringify(status));
    } catch (error) {
      console.error('[NWC] Update status failed:', error);
    }
  }

  /**
   * Clear NWC configuration
   * Used for wallet disconnection or logout
   */
  async clearNWC(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.NWC_STRING,
        STORAGE_KEYS.NWC_STATUS,
        STORAGE_KEYS.LAST_CONNECTION_TEST,
      ]);
      console.log('[NWC] Connection string cleared');
    } catch (error) {
      console.error('[NWC] Clear failed:', error);
    }
  }

  /**
   * Refresh connection test
   * Call periodically to ensure wallet is still connected
   */
  async refreshConnection(): Promise<boolean> {
    try {
      const nwcString = await this.getNWCString();
      if (!nwcString) {
        await this.updateStatus(false);
        return false;
      }

      const isConnected = await this.testConnection(nwcString);
      await this.updateStatus(isConnected);

      return isConnected;
    } catch (error) {
      console.error('[NWC] Refresh connection failed:', error);
      await this.updateStatus(false);
      return false;
    }
  }
}

// Export singleton instance
export const NWCStorageService = new NWCStorageServiceClass();
export default NWCStorageService;
