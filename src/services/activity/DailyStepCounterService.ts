/**
 * DailyStepCounterService - Cross-platform daily step counting
 * iOS: Uses Expo Pedometer API (HealthKit) for auto-counting
 * Android: Uses LocalWorkoutStorageService (tracked workouts only - more reliable than Health Connect)
 */

import { Pedometer } from 'expo-sensors';
import { Platform, Linking } from 'react-native';
import LocalWorkoutStorageService from '../fitness/LocalWorkoutStorageService';

export interface DailyStepData {
  steps: number;
  startTime: Date;
  endTime: Date;
  lastUpdated: Date;
}

export class DailyStepCounterService {
  private static instance: DailyStepCounterService;
  private cachedSteps: DailyStepData | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    console.log(`[DailyStepCounterService] Initialized for ${Platform.OS}`);
    if (Platform.OS === 'android') {
      console.log('[DailyStepCounterService] Will use local workout storage for tracked steps');
    } else {
      console.log('[DailyStepCounterService] Will use Pedometer (HealthKit) for auto-counted steps');
    }
  }

  static getInstance(): DailyStepCounterService {
    if (!DailyStepCounterService.instance) {
      DailyStepCounterService.instance = new DailyStepCounterService();
    }
    return DailyStepCounterService.instance;
  }

  /**
   * Check if step counting is available on the device
   * iOS: Uses Pedometer (HealthKit)
   * Android: Always available (uses local workout storage)
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android: Always available since we use local workout storage
        console.log('[DailyStepCounterService] Android: Using local workout storage (always available)');
        return true;
      } else {
        // iOS: Check Pedometer availability
        const available = await Pedometer.isAvailableAsync();
        console.log(`[DailyStepCounterService] Pedometer available: ${available}`);
        return available;
      }
    } catch (error) {
      console.error('[DailyStepCounterService] Error checking availability:', error);
      return Platform.OS === 'android'; // Android always true, iOS false on error
    }
  }

  /**
   * Request permissions for step data
   * iOS: Automatically handled by Pedometer API (HealthKit)
   * Android: No permissions needed (uses local workout storage)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android: No permissions needed for local workout storage
        console.log('[DailyStepCounterService] Android: No permissions needed for local workout storage');
        return true;
      } else {
        // iOS: Check Pedometer availability and request HealthKit access
        const available = await Pedometer.isAvailableAsync();
        if (!available) {
          console.warn('[DailyStepCounterService] Pedometer not available on this device');
          return false;
        }

        // Test if we can access step data (iOS auto-prompts HealthKit permission here)
        const now = new Date();
        const testStart = new Date(now.getTime() - 1000); // 1 second ago
        await Pedometer.getStepCountAsync(testStart, now);

        console.log('[DailyStepCounterService] iOS permissions granted - step data accessible');
        return true;
      }
    } catch (error) {
      console.error('[DailyStepCounterService] Permission error:', error);
      return false;
    }
  }

  /**
   * Check if step counting permission is currently granted
   * iOS: Always returns 'granted' (handled by HealthKit)
   * Android: Always returns 'granted' (uses local workout storage - no permissions needed)
   */
  async checkPermissionStatus(): Promise<
    'granted' | 'denied' | 'never_ask_again' | 'unknown'
  > {
    // Both platforms: always granted
    // iOS: handled by HealthKit automatically
    // Android: uses local workout storage, no permissions needed
    return 'granted';
  }

  /**
   * Open device settings for manual permission grant
   * Opens app settings on both platforms
   */
  async openSettings(): Promise<void> {
    console.log('[DailyStepCounterService] Opening app settings');
    Linking.openSettings();
  }

  /**
   * Get today's step count (from midnight to now)
   * Uses cached value if less than 5 minutes old
   * iOS: Uses Pedometer API (HealthKit) - auto-counted throughout day
   * Android: Uses LocalWorkoutStorageService - tracked workouts only
   */
  async getTodaySteps(): Promise<DailyStepData | null> {
    try {
      // Check cache validity (works for both platforms)
      if (this.cachedSteps && this.isCacheValid()) {
        console.log('[DailyStepCounterService] Returning cached steps');
        return this.cachedSteps;
      }

      if (Platform.OS === 'android') {
        // Android: Use Health Connect
        return await this.getTodayStepsAndroid();
      } else {
        // iOS: Use Pedometer (HealthKit)
        return await this.getTodayStepsIOS();
      }
    } catch (error) {
      console.error('[DailyStepCounterService] Error getting steps:', error);
      return null;
    }
  }

  /**
   * iOS-specific step fetching via Pedometer (HealthKit)
   */
  private async getTodayStepsIOS(): Promise<DailyStepData | null> {
    // Calculate today's time range (midnight to now)
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Midnight today
    const end = new Date(); // Now

    console.log(`[DailyStepCounterService] iOS: Querying steps from ${start.toISOString()} to ${end.toISOString()}`);

    // Query pedometer data
    const result = await Pedometer.getStepCountAsync(start, end);

    if (!result) {
      console.warn('[DailyStepCounterService] iOS: No step data returned');
      return null;
    }

    const stepData: DailyStepData = {
      steps: result.steps,
      startTime: start,
      endTime: end,
      lastUpdated: new Date(),
    };

    // Update cache
    this.cachedSteps = stepData;

    console.log(`[DailyStepCounterService] iOS ✅ Today's steps: ${result.steps}`);
    return stepData;
  }

  /**
   * Android-specific step fetching from local workout storage
   * Shows "Tracked Steps" - only steps from in-app tracked workouts
   */
  private async getTodayStepsAndroid(): Promise<DailyStepData | null> {
    console.log('[DailyStepCounterService] Android: Querying tracked steps from local storage');

    const result = await LocalWorkoutStorageService.getTodayTrackedSteps();

    // Calculate time bounds for today
    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0); // Midnight today
    const endTime = new Date(); // Now

    const stepData: DailyStepData = {
      steps: result.steps,
      startTime,
      endTime,
      lastUpdated: new Date(),
    };

    // Update cache
    this.cachedSteps = stepData;

    console.log(`[DailyStepCounterService] Android ✅ Tracked steps: ${result.steps} from ${result.workoutCount} workouts`);
    return stepData;
  }

  /**
   * Get step count for a specific date range
   */
  async getSteps(start: Date, end: Date): Promise<number | null> {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result ? result.steps : null;
    } catch (error) {
      console.error(
        '[DailyStepCounterService] Error getting steps for range:',
        error
      );
      return null;
    }
  }

  /**
   * Clear cached step data (forces fresh query on next call)
   */
  clearCache(): void {
    this.cachedSteps = null;
    console.log('[DailyStepCounterService] Cache cleared');
  }

  /**
   * Check if cached data is still valid (less than 5 minutes old)
   */
  private isCacheValid(): boolean {
    if (!this.cachedSteps) return false;

    const age = Date.now() - this.cachedSteps.lastUpdated.getTime();
    return age < this.cacheExpiry;
  }

  /**
   * Subscribe to live step updates (real-time)
   * Returns unsubscribe function
   */
  subscribeLiveSteps(callback: (steps: number) => void): () => void {
    let subscription: any = null;

    const startSubscription = async () => {
      try {
        subscription = Pedometer.watchStepCount((result) => {
          console.log(
            `[DailyStepCounterService] Live step update: ${result.steps}`
          );
          callback(result.steps);
        });
      } catch (error) {
        console.error(
          '[DailyStepCounterService] Error subscribing to live steps:',
          error
        );
      }
    };

    startSubscription();

    // Return unsubscribe function
    return () => {
      if (subscription) {
        subscription.remove();
        console.log('[DailyStepCounterService] Unsubscribed from live steps');
      }
    };
  }

  /**
   * Get platform-specific info for debugging
   */
  getPlatformInfo(): { platform: string; available: boolean } {
    return {
      platform: Platform.OS,
      available: false, // Will be updated by isAvailable()
    };
  }
}

// Export singleton instance
export const dailyStepCounterService = DailyStepCounterService.getInstance();
