/**
 * StepRewardsPreferencesService - Step reward destination preferences
 * Handles saving/loading step reward destination with AsyncStorage persistence
 *
 * By default, step rewards go to the user's selected charity (normie-friendly).
 * Power users can toggle this in Advanced Settings to receive step rewards themselves.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@runstr:step_rewards_to_user';

export class StepRewardsPreferencesService {
  private static cachedValue: boolean | null = null;

  /**
   * Check if step rewards should go to user (instead of charity)
   * Default: false (charity gets step rewards)
   */
  static async shouldSendToUser(): Promise<boolean> {
    // Return cached value if available
    if (this.cachedValue !== null) {
      return this.cachedValue;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored === null) {
        // Default to false (step rewards go to charity for normie-friendly experience)
        this.cachedValue = false;
        return false;
      }

      this.cachedValue = stored === 'true';
      return this.cachedValue;
    } catch (error) {
      console.error('[StepRewardsPrefs] Error loading preference:', error);
      return false; // Default to charity on error
    }
  }

  /**
   * Set whether step rewards go to user
   */
  static async setSendToUser(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(enabled));
      this.cachedValue = enabled;
      console.log(
        `[StepRewardsPrefs] Step rewards destination: ${enabled ? 'user' : 'charity'}`
      );
    } catch (error) {
      console.error('[StepRewardsPrefs] Error saving preference:', error);
      throw error;
    }
  }

  /**
   * Clear cached value (useful for testing or user logout)
   */
  static clearCache(): void {
    this.cachedValue = null;
  }
}
