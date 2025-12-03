/**
 * DailyStepCounterService - Cross-platform daily step counting
 * iOS: Uses Expo Pedometer API (HealthKit)
 * Android: Uses Health Connect for step data aggregation
 */

import { Pedometer } from 'expo-sensors';
import { Platform, PermissionsAndroid, Linking } from 'react-native';

// Import Health Connect service for Android
let healthConnectService: any = null;
if (Platform.OS === 'android') {
  try {
    const { HealthConnectService } = require('../fitness/healthConnectService');
    healthConnectService = HealthConnectService.getInstance();
    console.log('[DailyStepCounterService] Health Connect service loaded for Android');
  } catch (e) {
    console.warn('[DailyStepCounterService] Failed to load Health Connect service:', e);
  }
}

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
      console.log('[DailyStepCounterService] Will use Health Connect for step data');
    } else {
      console.log('[DailyStepCounterService] Will use Pedometer (HealthKit) for step data');
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
   * Android: Uses Health Connect
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android: Check Health Connect availability
        if (!healthConnectService) {
          console.log('[DailyStepCounterService] Health Connect service not loaded');
          return false;
        }
        const sdkAvailable = await healthConnectService.checkSdkAvailability();
        console.log(`[DailyStepCounterService] Health Connect SDK available: ${sdkAvailable}`);
        return sdkAvailable;
      } else {
        // iOS: Check Pedometer availability
        const available = await Pedometer.isAvailableAsync();
        console.log(`[DailyStepCounterService] Pedometer available: ${available}`);
        return available;
      }
    } catch (error) {
      console.error('[DailyStepCounterService] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Request permissions for step data
   * iOS: Automatically handled by Pedometer API (HealthKit)
   * Android: Uses Health Connect permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android: Initialize Health Connect and request permissions
        if (!healthConnectService) {
          console.warn('[DailyStepCounterService] Health Connect service not available');
          return false;
        }

        console.log('[DailyStepCounterService] Requesting Health Connect permissions...');
        const result = await healthConnectService.initialize();

        if (!result.success) {
          console.warn('[DailyStepCounterService] Health Connect permission denied:', result.error);
          return false;
        }

        console.log('[DailyStepCounterService] Health Connect permissions granted');
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
   * Android: Checks Health Connect Steps permission
   */
  async checkPermissionStatus(): Promise<
    'granted' | 'denied' | 'never_ask_again' | 'unknown'
  > {
    if (Platform.OS === 'ios') {
      return 'granted'; // iOS handles permissions through HealthKit automatically
    }

    // Android: Check Health Connect permission
    try {
      if (!healthConnectService) {
        return 'unknown';
      }

      const hasPermission = await healthConnectService.hasStepsPermission();
      return hasPermission ? 'granted' : 'denied';
    } catch (error) {
      console.error('[DailyStepCounterService] Error checking permission:', error);
      return 'unknown';
    }
  }

  /**
   * Open device settings for manual permission grant
   * Android: Opens Health Connect settings
   * iOS: Opens app settings
   */
  async openSettings(): Promise<void> {
    if (Platform.OS === 'android' && healthConnectService) {
      try {
        console.log('[DailyStepCounterService] Opening Health Connect settings');
        await healthConnectService.openHealthConnectSettings();
      } catch (error) {
        console.log('[DailyStepCounterService] Falling back to app settings');
        Linking.openSettings();
      }
    } else {
      console.log('[DailyStepCounterService] Opening app settings');
      Linking.openSettings();
    }
  }

  /**
   * Get today's step count (from midnight to now)
   * Uses cached value if less than 5 minutes old
   * iOS: Uses Pedometer API (HealthKit)
   * Android: Uses Health Connect
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
   * Android-specific step fetching via Health Connect
   */
  private async getTodayStepsAndroid(): Promise<DailyStepData | null> {
    if (!healthConnectService) {
      console.warn('[DailyStepCounterService] Android: Health Connect service not available');
      return null;
    }

    console.log('[DailyStepCounterService] Android: Querying steps from Health Connect');

    const result = await healthConnectService.getTodaySteps();

    if (!result) {
      console.warn('[DailyStepCounterService] Android: No step data returned from Health Connect');
      return null;
    }

    const stepData: DailyStepData = {
      steps: result.steps,
      startTime: result.startTime,
      endTime: result.endTime,
      lastUpdated: new Date(),
    };

    // Update cache
    this.cachedSteps = stepData;

    console.log(`[DailyStepCounterService] Android ✅ Today's steps: ${result.steps}`);
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
    // Also clear Health Connect cache on Android
    if (Platform.OS === 'android' && healthConnectService) {
      healthConnectService.clearStepsCache();
    }
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
