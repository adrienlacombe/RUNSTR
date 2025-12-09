/**
 * RewardLightningAddressService - Store and retrieve user's reward lightning address
 *
 * PURPOSE:
 * Users input their lightning address in settings to receive daily streak rewards.
 * This address is embedded in kind 1301 workout events as a ["lightning", "address"] tag,
 * allowing external reward scripts to query Nostr for workout events and pay out rewards.
 *
 * STORAGE:
 * - Key: @runstr:reward_lightning_address
 * - Value: Lightning address string (e.g., "user@getalby.com")
 *
 * VALIDATION:
 * - Format: user@domain.com (standard lightning address format)
 * - Similar to email validation but for Lightning Network addresses
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const REWARD_LIGHTNING_ADDRESS_KEY = '@runstr:reward_lightning_address';

/**
 * Service for managing the user's reward lightning address
 */
class RewardLightningAddressServiceClass {
  private cachedAddress: string | null = null;
  private cacheLoaded: boolean = false;

  /**
   * Validate lightning address format
   * Lightning addresses follow user@domain.com format
   * @param address - The address to validate
   * @returns true if valid format, false otherwise
   */
  isValidLightningAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Lightning address format: localpart@domain
    // Similar to email but for Lightning Network
    const lightningAddressRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return lightningAddressRegex.test(address.trim());
  }

  /**
   * Get the user's stored reward lightning address
   * @returns The lightning address or null if not set
   */
  async getRewardLightningAddress(): Promise<string | null> {
    try {
      // Return cached value if available
      if (this.cacheLoaded) {
        return this.cachedAddress;
      }

      const address = await AsyncStorage.getItem(REWARD_LIGHTNING_ADDRESS_KEY);
      this.cachedAddress = address;
      this.cacheLoaded = true;

      console.log(
        '[RewardLightningAddress] Retrieved address:',
        address ? `${address.substring(0, 10)}...` : 'none'
      );

      return address;
    } catch (error) {
      console.error('[RewardLightningAddress] Error getting address:', error);
      return null;
    }
  }

  /**
   * Set the user's reward lightning address
   * @param address - The lightning address to store
   * @throws Error if address format is invalid
   */
  async setRewardLightningAddress(address: string): Promise<void> {
    const trimmedAddress = address.trim();

    if (!this.isValidLightningAddress(trimmedAddress)) {
      throw new Error(
        'Invalid lightning address format. Expected format: user@domain.com'
      );
    }

    try {
      await AsyncStorage.setItem(REWARD_LIGHTNING_ADDRESS_KEY, trimmedAddress);
      this.cachedAddress = trimmedAddress;
      this.cacheLoaded = true;

      console.log(
        '[RewardLightningAddress] Saved address:',
        `${trimmedAddress.substring(0, 10)}...`
      );
    } catch (error) {
      console.error('[RewardLightningAddress] Error saving address:', error);
      throw error;
    }
  }

  /**
   * Clear the user's reward lightning address
   * Used when user wants to remove their address or log out
   */
  async clearRewardLightningAddress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REWARD_LIGHTNING_ADDRESS_KEY);
      this.cachedAddress = null;
      this.cacheLoaded = true;

      console.log('[RewardLightningAddress] Address cleared');
    } catch (error) {
      console.error('[RewardLightningAddress] Error clearing address:', error);
      throw error;
    }
  }

  /**
   * Check if user has a reward lightning address configured
   * @returns true if address is set, false otherwise
   */
  async hasRewardLightningAddress(): Promise<boolean> {
    const address = await this.getRewardLightningAddress();
    return address !== null && address.length > 0;
  }

  /**
   * Invalidate cache (useful for testing or force refresh)
   */
  invalidateCache(): void {
    this.cachedAddress = null;
    this.cacheLoaded = false;
  }
}

// Export singleton instance
export const RewardLightningAddressService =
  new RewardLightningAddressServiceClass();
