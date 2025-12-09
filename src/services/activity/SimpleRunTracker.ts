/**
 * SimpleRunTracker - Clean, working run tracker following proven patterns
 *
 * Key Architecture Decisions:
 * 1. Simple JS timer - Always works, independent of GPS signal
 * 2. Hybrid duration - GPS-synced but falls back to JS when signal lost
 * 3. Single subscription - TaskManager only, no conflicts
 * 4. Post-processing - Calculate distance from stored points after run
 *
 * Inspired by: Junior dev's guide + working reference implementation
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SplitTrackingService, type Split } from './SplitTrackingService';
import { CustomAlertManager as CustomAlert } from '../../components/ui/CustomAlert';
import {
  startNativeWorkoutSession,
  stopNativeWorkoutSession,
} from './WorkoutSessionBridge';
import TTSAnnouncementService from './TTSAnnouncementService';
import { BatteryOptimizationService } from './BatteryOptimizationService';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';
import {
  Audio,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from 'expo-av';

// Storage keys
const GPS_POINTS_KEY = '@runstr:gps_points';
const SESSION_STATE_KEY = '@runstr:session_state';
const CHECKPOINT_KEY = '@runstr:workout_checkpoint';

// Task name
export const SIMPLE_TRACKER_TASK = 'runstr-simple-tracker';

// Types
export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
}

export interface RunSession {
  id: string;
  activityType: 'running' | 'walking' | 'cycling';
  startTime: number;
  endTime?: number;
  distance: number; // meters
  duration: number; // seconds
  pausedDuration: number; // seconds
  pauseCount: number;
  gpsPoints: GPSPoint[];
  presetDistance?: number; // Optional race preset distance in meters
  splits?: Split[]; // Kilometer splits for running activities
  elevationGain?: number; // Total elevation gain in meters
}

interface SessionState {
  sessionId: string;
  activityType: string;
  isTracking: boolean;
  isPaused: boolean;
  startTime: number;
  pauseCount: number;
  presetDistance?: number; // Optional race preset distance in meters
  // SimpleDurationTracker state (for session recovery)
  trackerStartTime: number;
  trackerTotalPausedTime: number;
  trackerPauseStartTime: number;
  // GPS warm-up counter (read by SimpleRunTrackerTask, reset on new sessions)
  gpsPointCount?: number;
}

/**
 * Simple Duration Tracker (like Reference Implementation)
 * Just calculates: (now - startTime - pausedTime) / 1000
 * No GPS interference, no hybrid logic, no complexity
 */
class SimpleDurationTracker {
  private startTime: number = 0;
  private totalPausedTime: number = 0;
  private pauseStartTime: number = 0;

  start(startTime: number) {
    this.startTime = startTime;
    this.totalPausedTime = 0;
    this.pauseStartTime = 0;

    console.log(
      '[SimpleDurationTracker] Started - pure timestamp tracking (no timer)'
    );
  }

  stop() {
    console.log('[SimpleDurationTracker] Stopped');
  }

  pause() {
    this.pauseStartTime = Date.now();
    console.log('[SimpleDurationTracker] Paused');
  }

  resume() {
    if (this.pauseStartTime > 0) {
      const pauseDuration = Date.now() - this.pauseStartTime;
      this.totalPausedTime += pauseDuration;
      this.pauseStartTime = 0;
      console.log(
        `[SimpleDurationTracker] Resumed (paused for ${(
          pauseDuration / 1000
        ).toFixed(1)}s)`
      );
    }
  }

  /**
   * Get current duration in seconds
   * Pure timestamp calculation - works in foreground, background, across app restarts
   * No timer needed - just math!
   */
  getDuration(): number {
    // If paused, calculate frozen duration using pauseStartTime
    if (this.pauseStartTime > 0) {
      return Math.floor(
        (this.pauseStartTime - this.startTime - this.totalPausedTime) / 1000
      );
    }
    // Otherwise calculate from current time
    const now = Date.now();
    return Math.floor((now - this.startTime - this.totalPausedTime) / 1000);
  }

  getTotalPausedTime(): number {
    const currentPause =
      this.pauseStartTime > 0 ? Date.now() - this.pauseStartTime : 0;
    return Math.floor((this.totalPausedTime + currentPause) / 1000);
  }

  /**
   * Export tracker state for session persistence
   * Duration is calculated on-demand, no need to store it
   */
  exportState() {
    return {
      startTime: this.startTime,
      totalPausedTime: this.totalPausedTime,
      pauseStartTime: this.pauseStartTime,
    };
  }

  /**
   * Restore tracker state from saved session
   * Duration is calculated on-demand from timestamps, no timer needed
   */
  restoreState(state: {
    startTime: number;
    totalPausedTime: number;
    pauseStartTime: number;
  }) {
    this.startTime = state.startTime;
    this.totalPausedTime = state.totalPausedTime;
    this.pauseStartTime = state.pauseStartTime;

    console.log(
      '[SimpleDurationTracker] State restored - timestamp tracking active'
    );
  }
}

/**
 * SimpleRunTracker - Main tracking service
 */
export class SimpleRunTracker {
  private static instance: SimpleRunTracker;

  // Core state
  private sessionId: string | null = null;
  private activityType: 'running' | 'walking' | 'cycling' = 'running';
  private isTracking = false;
  private isPaused = false;
  private pauseCount = 0;
  private presetDistance: number | null = null; // Race preset distance in meters

  // Duration tracker (simple Date.now() calculation)
  private durationTracker = new SimpleDurationTracker();

  // Split tracker (kilometer splits for running)
  private splitTracker = new SplitTrackingService();

  // Start time
  private startTime: number = 0;

  // In-memory GPS points cache (synced from AsyncStorage)
  // This prevents async reads on every UI update (fixes duration bug)
  private cachedGpsPoints: GPSPoint[] = [];

  // GPS health tracking for error recovery
  private lastGPSUpdate: number = Date.now();
  private isInGPSRecovery = false;
  private recoveryPointsSkipped = 0;
  private gpsFailureCount = 0;
  private lastGPSError: string | null = null;

  // Auto-stop callback (for UI notification when preset distance reached)
  private autoStopCallback: (() => void) | null = null;

  // FIX for 30-min race condition: Queue system for AsyncStorage writes
  private writeQueue: Promise<void> = Promise.resolve();
  private pendingPoints: GPSPoint[] = [];
  private lastFlushTime = 0;
  private readonly FLUSH_INTERVAL_MS = 10000; // Flush every 10 seconds instead of every GPS update
  private isWriting = false;

  // GPS Watchdog - detects and recovers from silent GPS failures
  // Tighter timing per user feedback: 5s check interval, 20s timeout = max 25s detection delay
  private watchdogInterval: NodeJS.Timeout | null = null;
  private gpsRestartAttempts = 0;
  private readonly MAX_GPS_RESTARTS = 5;
  private readonly GPS_TIMEOUT_MS = 20000; // 20 seconds without GPS = dead
  private readonly WATCHDOG_CHECK_MS = 5000; // Check every 5 seconds

  // Silent audio recording - keeps app alive in background (Android insurance)
  private silentRecording: Audio.Recording | null = null;

  private constructor() {
    console.log('[SimpleRunTracker] Initialized');
  }

  static getInstance(): SimpleRunTracker {
    if (!SimpleRunTracker.instance) {
      SimpleRunTracker.instance = new SimpleRunTracker();
    }
    return SimpleRunTracker.instance;
  }

  /**
   * Start tracking - INSTANT UI RESPONSE (like reference implementation)
   * Sets state immediately, GPS initializes in background
   * @param activityType - Type of activity (running, walking, cycling)
   * @param presetDistance - Optional race preset distance in meters (for auto-stop)
   */
  async startTracking(
    activityType: 'running' | 'walking' | 'cycling',
    presetDistance?: number
  ): Promise<boolean> {
    // INSTANT: Set state immediately (no await blocking)
    this.sessionId = `run_${Date.now()}`;
    this.activityType = activityType;
    this.startTime = Date.now();
    this.isTracking = true;
    this.isPaused = false;
    this.pauseCount = 0;
    this.presetDistance = presetDistance || null;
    this.cachedGpsPoints = []; // Clear cache immediately

    // FIX: Reset write queue state for new session
    this.writeQueue = Promise.resolve();
    this.pendingPoints = [];
    this.lastFlushTime = Date.now();
    this.isWriting = false;

    // CRITICAL: Prevent Android from suspending the app (Doze Mode)
    // Reference implementation uses this exact pattern - required for background GPS
    try {
      await activateKeepAwakeAsync('gps-tracking');
      console.log('[SimpleRunTracker] 🔋 Keep-awake activated - Android Doze Mode prevented');
    } catch (error) {
      console.warn('[SimpleRunTracker] Keep-awake activation failed:', error);
      // Continue anyway - tracking may still work
    }

    // INSTANT: Start timer immediately (user sees 1, 2, 3... right away!)
    this.durationTracker.start(this.startTime);
    console.log(
      '[SimpleRunTracker] ⏱️ INSTANT START - Stopwatch counting 1, 2, 3, 4, 5...'
    );

    // Start split tracking for running activities
    if (activityType === 'running') {
      this.splitTracker.start(this.startTime);
      console.log('[SimpleRunTracker] 🏃 Split tracking enabled for running');
    }

    if (presetDistance) {
      console.log(
        `[SimpleRunTracker] 🎯 Preset distance: ${(
          presetDistance / 1000
        ).toFixed(2)} km`
      );
    }

    // Background tasks (don't block UI)
    this.initializeGPS(activityType).catch((error) => {
      console.error('[SimpleRunTracker] GPS initialization failed:', error);
      // Timer still runs even if GPS fails!
    });

    // Start watchdog to detect and recover from GPS failures
    this.startWatchdog();

    // Start silent audio recording for extra Android background insurance
    this.startSilentAudio();

    return true;
  }

  /**
   * Initialize GPS in background (non-blocking)
   * Like reference implementation - GPS starts async
   */
  private async initializeGPS(
    activityType: 'running' | 'walking' | 'cycling'
  ): Promise<void> {
    try {
      console.log(`[SimpleRunTracker] Initializing GPS for ${activityType}...`);

      // Android: Request battery optimization exemption FIRST (CRITICAL!)
      // Without this, Android will kill the background location service after ~30 seconds
      // when user switches to another app (like Spotify)
      if (Platform.OS === 'android') {
        try {
          const batteryService = BatteryOptimizationService.getInstance();
          await batteryService.requestBatteryOptimizationExemption();
          console.log('[SimpleRunTracker] Battery optimization exemption requested');
        } catch (e) {
          console.warn('[SimpleRunTracker] Battery optimization request failed:', e);
          // Continue anyway - tracking may work if user already exempted app
        }
      }

      // iOS: Start native HKWorkoutSession FIRST (signals active workout to iOS)
      // This grants unlimited background location tracking privileges
      // Android: No-op (background tracking already works)
      // DISABLED: Native workout session requires RUNSTRWorkoutBridge.m/swift native modules
      // which are not yet implemented. Commenting out to prevent crashes on real devices.
      // Note: This means iOS background tracking may be limited to ~30 minutes.
      // await startNativeWorkoutSession(activityType);
      console.log(
        '[SimpleRunTracker] Native workout session disabled - using standard background tracking'
      );

      // Clean up any existing GPS watchers
      const isAlreadyRunning = await Location.hasStartedLocationUpdatesAsync(
        SIMPLE_TRACKER_TASK
      );
      if (isAlreadyRunning) {
        console.log('[SimpleRunTracker] Cleaning up previous GPS session...');
        await Location.stopLocationUpdatesAsync(SIMPLE_TRACKER_TASK);
      }

      // Clear previous data from storage
      await AsyncStorage.removeItem(GPS_POINTS_KEY);
      await AsyncStorage.removeItem(SESSION_STATE_KEY);

      // Save fresh session state
      await this.saveSessionState();

      // Start GPS tracking (background operation)
      // CRITICAL CONFIG: These options prevent Android from batching/killing GPS updates
      await Location.startLocationUpdatesAsync(SIMPLE_TRACKER_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000, // 3 seconds (backup time-based polling)
        distanceInterval: 5, // 5 meters
        deferredUpdatesInterval: 0, // Don't batch updates - send immediately
        deferredUpdatesDistance: 0, // Don't batch updates - send immediately
        foregroundService: {
          notificationTitle: 'RUNSTR Active',
          notificationBody: 'Tracking your workout...',
          notificationColor: '#FF6B35',
          killServiceOnDestroy: false, // CRITICAL: Keep service alive when app killed
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Fitness,
        showsBackgroundLocationIndicator: true,
      });

      console.log('[SimpleRunTracker] ✅ GPS tracking started');
    } catch (error) {
      console.error('[SimpleRunTracker] GPS initialization error:', error);
      // Timer keeps running even if GPS fails!
    }
  }

  /**
   * Pause tracking
   */
  async pauseTracking(): Promise<void> {
    if (!this.isTracking || this.isPaused) {
      console.warn(
        '[SimpleRunTracker] Cannot pause - not tracking or already paused'
      );
      return;
    }

    this.isPaused = true;
    this.pauseCount++;
    this.durationTracker.pause();

    // Update session state
    await this.saveSessionState();

    console.log('[SimpleRunTracker] Paused');
  }

  /**
   * Resume tracking
   */
  async resumeTracking(): Promise<void> {
    if (!this.isTracking || !this.isPaused) {
      console.warn(
        '[SimpleRunTracker] Cannot resume - not tracking or not paused'
      );
      return;
    }

    this.isPaused = false;
    this.durationTracker.resume();

    // Update session state
    await this.saveSessionState();

    console.log('[SimpleRunTracker] Resumed');
  }

  /**
   * Stop tracking and return final session
   */
  async stopTracking(): Promise<RunSession | null> {
    if (!this.isTracking) {
      console.warn('[SimpleRunTracker] Not tracking, nothing to stop');
      return null;
    }

    console.log('[SimpleRunTracker] Stopping tracking...');

    // Stop watchdog first
    this.stopWatchdog();

    // Stop silent audio recording
    await this.stopSilentAudio();

    // FIX: Flush any pending GPS points before stopping
    if (this.pendingPoints.length > 0) {
      console.log(
        `[SimpleRunTracker] Flushing ${this.pendingPoints.length} pending GPS points before stop...`
      );
      this.flushPendingPointsToStorage();
      // FIX 7: Wait for write queue with timeout to prevent hanging
      try {
        await Promise.race([
          this.writeQueue,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Write queue timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.warn('[SimpleRunTracker] Write queue timeout, continuing stop');
      }
    }

    // Stop GPS
    try {
      const isRunning = await Location.hasStartedLocationUpdatesAsync(
        SIMPLE_TRACKER_TASK
      );
      if (isRunning) {
        await Location.stopLocationUpdatesAsync(SIMPLE_TRACKER_TASK);
      }
    } catch (error) {
      console.error('[SimpleRunTracker] Error stopping GPS:', error);
    }

    // Allow device to sleep again (release keep-awake)
    try {
      deactivateKeepAwake('gps-tracking');
      console.log('[SimpleRunTracker] 🔋 Keep-awake deactivated - device can sleep');
    } catch (error) {
      console.warn('[SimpleRunTracker] Keep-awake deactivation failed:', error);
    }

    // Stop duration tracker
    this.durationTracker.stop();

    // iOS: Stop native HKWorkoutSession
    // Android: No-op
    await stopNativeWorkoutSession();

    // Sync final GPS points from storage to cache
    await this.syncGpsPointsFromStorage();
    console.log(
      `[SimpleRunTracker] Retrieved ${this.cachedGpsPoints.length} GPS points`
    );

    // Calculate distance and elevation from GPS points (post-processing)
    const distance = this.calculateTotalDistance(this.cachedGpsPoints);
    const elevationGain = this.calculateElevationGain(this.cachedGpsPoints);

    // Get splits for running activities
    const splits =
      this.activityType === 'running'
        ? this.splitTracker.getSplits()
        : undefined;

    // Create final session (using cached GPS points)
    const session: RunSession = {
      id: this.sessionId || `run_${Date.now()}`,
      activityType: this.activityType,
      startTime: this.startTime,
      endTime: Date.now(),
      distance,
      duration: this.durationTracker.getDuration(),
      pausedDuration: this.durationTracker.getTotalPausedTime(),
      pauseCount: this.pauseCount,
      gpsPoints: this.cachedGpsPoints,
      presetDistance: this.presetDistance || undefined,
      splits,
      elevationGain,
    };

    console.log(
      `[SimpleRunTracker] ✅ Splits recorded: ${splits?.length || 0} km markers`
    );

    // Reset ALL state to prevent corruption between sessions
    // CRITICAL: Must reset everything to prevent decreasing distance pattern (3km→1.4km→0.6km)
    this.isTracking = false;
    this.isPaused = false;
    this.sessionId = null;
    this.presetDistance = null;
    this.autoStopCallback = null;

    // Reset GPS state (prevents stale data from affecting next session)
    this.cachedGpsPoints = [];
    this.pendingPoints = [];
    this.lastGPSUpdate = Date.now();
    this.lastFlushTime = 0;

    // Reset GPS recovery state (prevents accumulated failure counts)
    this.isInGPSRecovery = false;
    this.recoveryPointsSkipped = 0;
    this.gpsFailureCount = 0;
    this.lastGPSError = null;

    // Reset split tracker for next session
    this.splitTracker.reset();

    // Clear session state from AsyncStorage
    await AsyncStorage.removeItem(SESSION_STATE_KEY);
    await AsyncStorage.removeItem(GPS_POINTS_KEY);

    console.log(
      `[SimpleRunTracker] ✅ Session completed: ${(distance / 1000).toFixed(
        2
      )} km in ${session.duration}s`
    );

    return session;
  }

  /**
   * Get current session data (for live UI updates)
   * NOW SYNCHRONOUS - uses in-memory cache instead of AsyncStorage
   */
  getCurrentSession(): Partial<RunSession> | null {
    if (!this.isTracking) {
      return null;
    }

    // Use cached GPS points (no async read needed!)
    const distance = this.calculateTotalDistance(this.cachedGpsPoints);
    const elevationGain = this.calculateElevationGain(this.cachedGpsPoints);

    // Get splits for running activities
    const splits =
      this.activityType === 'running'
        ? this.splitTracker.getSplits()
        : undefined;

    return {
      id: this.sessionId || `run_${Date.now()}`,
      activityType: this.activityType,
      startTime: this.startTime,
      distance,
      duration: this.durationTracker.getDuration(),
      pausedDuration: this.durationTracker.getTotalPausedTime(),
      pauseCount: this.pauseCount,
      gpsPoints: this.cachedGpsPoints.slice(-100), // Last 100 points for route display
      presetDistance: this.presetDistance || undefined,
      splits,
      elevationGain,
    };
  }

  /**
   * Sync GPS points from AsyncStorage to in-memory cache
   * Call this when app returns to foreground or background task adds new points
   */
  async syncGpsPointsFromStorage(): Promise<void> {
    try {
      const points = await this.getStoredPoints();
      this.cachedGpsPoints = points;
      console.log(
        `[SimpleRunTracker] Synced ${points.length} GPS points to cache (for distance only)`
      );
      // Timer runs independently - no GPS duration updates!
    } catch (error) {
      console.error('[SimpleRunTracker] Error syncing GPS points:', error);
    }
  }

  /**
   * Set callback for auto-stop when preset distance is reached
   * @param callback - Function to call when auto-stop is triggered
   */
  setAutoStopCallback(callback: () => void): void {
    this.autoStopCallback = callback;
  }

  /**
   * Check if auto-stop should be triggered (preset distance reached)
   * Can be called from UI update interval for more responsive auto-stopping
   * @returns true if auto-stop was triggered
   */
  checkAutoStop(): boolean {
    if (!this.presetDistance || !this.isTracking) {
      return false;
    }

    const currentDistance = this.calculateTotalDistance(this.cachedGpsPoints);

    if (currentDistance >= this.presetDistance) {
      console.log(
        `[SimpleRunTracker] 🎯 AUTO-STOP: Reached preset distance ${(
          this.presetDistance / 1000
        ).toFixed(2)} km`
      );

      // Trigger callback if set (UI will call stopTracking)
      if (this.autoStopCallback) {
        this.autoStopCallback();
      }

      return true;
    }

    return false;
  }

  /**
   * Append GPS points from background task (REAL-TIME UPDATES!)
   * This is called by SimpleRunTrackerTask when GPS data arrives
   *
   * Architecture: GPS ONLY for distance, timer is independent stopwatch
   * GPS → Background Task → Direct cache update → Distance updates
   * Timer → Pure JS stopwatch → Counts 1, 2, 3, 4, 5...
   *
   * CRITICAL FIX: Do NOT check this.isTracking here!
   * On Android, background TaskManager runs in a SEPARATE JavaScript context.
   * The singleton in the background task is a DIFFERENT instance with isTracking=false.
   * Session validation is done in SimpleRunTrackerTask via AsyncStorage (shared between contexts).
   */
  appendGpsPointsToCache(points: GPSPoint[]): void {
    // REMOVED: isTracking check - background task validates session via AsyncStorage
    // The background task only calls this if session is active (checked in SimpleRunTrackerTask.ts)

    if (points.length === 0) {
      // No points received - check for GPS failure
      const now = Date.now();
      const timeSinceLastGPS = now - this.lastGPSUpdate;

      if (timeSinceLastGPS > 10000) {
        // 10 seconds without GPS
        this.gpsFailureCount++;
        console.error(
          `🚨 [SimpleRunTracker] GPS FAILURE DETECTED - No updates for ${(
            timeSinceLastGPS / 1000
          ).toFixed(1)}s`
        );
        console.error(
          `🚨 [SimpleRunTracker] Failure count: ${this.gpsFailureCount}`
        );

        if (timeSinceLastGPS > 30000 && this.gpsFailureCount > 3) {
          // GPS has been dead for 30+ seconds - alert user
          this.lastGPSError = `GPS signal lost for ${Math.floor(
            timeSinceLastGPS / 1000
          )} seconds`;
          CustomAlert.alert(
            'GPS Signal Lost',
            'Distance tracking has stopped. Please ensure you have a clear view of the sky.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
      return;
    }

    // GPS recovery detection
    const now = Date.now();
    const timeSinceLastGPS = now - this.lastGPSUpdate;

    if (timeSinceLastGPS > 10000 && !this.isInGPSRecovery) {
      console.log(
        `🔄 [SimpleRunTracker] GPS recovered after ${(
          timeSinceLastGPS / 1000
        ).toFixed(1)}s - entering recovery mode`
      );
      this.isInGPSRecovery = true;
      this.recoveryPointsSkipped = 0;
    }

    // Skip first 3 points after GPS recovery (they're often inaccurate)
    if (this.isInGPSRecovery) {
      if (this.recoveryPointsSkipped < 3) {
        this.recoveryPointsSkipped++;
        console.log(
          `🔄 [SimpleRunTracker] Skipping recovery point ${this.recoveryPointsSkipped}/3 for distance calculation`
        );
        // Still add to cache for route data but don't update distance
        this.cachedGpsPoints.push(...points);
        this.lastGPSUpdate = now;
        return;
      } else {
        console.log(
          '✅ [SimpleRunTracker] GPS recovery complete - resuming normal tracking'
        );
        this.isInGPSRecovery = false;
        this.gpsFailureCount = 0;
        this.lastGPSError = null;
      }
    }

    // Update GPS health
    this.lastGPSUpdate = now;

    // Update in-memory cache (instant distance updates!)
    this.cachedGpsPoints.push(...points);

    // Keep cache trimmed (last 10,000 points max)
    if (this.cachedGpsPoints.length > 10000) {
      this.cachedGpsPoints = this.cachedGpsPoints.slice(-10000);
    }

    // Update split tracker for running activities
    if (this.activityType === 'running') {
      const currentDistance = this.calculateTotalDistance(this.cachedGpsPoints);
      const currentDuration = this.durationTracker.getDuration();
      const pausedDuration = this.durationTracker.getTotalPausedTime() * 1000; // Convert to ms

      const newSplit = this.splitTracker.update(
        currentDistance,
        currentDuration,
        pausedDuration
      );

      if (newSplit) {
        console.log(
          `[SimpleRunTracker] 🏃 Split ${
            newSplit.number
          }: ${this.splitTracker.formatSplitTime(
            newSplit.splitTime
          )} (${this.splitTracker.formatPace(newSplit.pace)}/km)`
        );

        // Announce split via TTS (non-blocking)
        TTSAnnouncementService.announceSplit(newSplit).catch((err) => {
          console.error('[SimpleRunTracker] Failed to announce split:', err);
        });
      }
    }

    // Check for auto-stop (preset distance reached)
    this.checkAutoStop();

    // DO NOT update duration - timer runs independently like a stopwatch!
    // GPS is ONLY for distance calculation

    // FIX for 30-min race condition: Batch points instead of immediate writes
    this.pendingPoints.push(...points);

    // Only flush to storage periodically or if we have many pending points
    const currentTime = Date.now();
    const shouldFlush =
      currentTime - this.lastFlushTime > this.FLUSH_INTERVAL_MS ||
      this.pendingPoints.length > 100;

    if (shouldFlush && !this.isWriting) {
      this.flushPendingPointsToStorage();
      this.lastFlushTime = currentTime;
    }

    console.log(
      `[SimpleRunTracker] 📍 Appended ${points.length} GPS points to cache (${this.cachedGpsPoints.length} total, ${this.pendingPoints.length} pending)`
    );
  }

  /**
   * Flush pending points to storage using write queue (prevents race conditions)
   * This serializes all AsyncStorage writes to prevent "sync already in progress" errors
   */
  private flushPendingPointsToStorage(): void {
    if (this.pendingPoints.length === 0) {
      return;
    }

    // Copy pending points and clear the buffer
    const pointsToSave = [...this.pendingPoints];
    this.pendingPoints = [];

    // Add to write queue to serialize operations
    // FIX 3: Always return a value to maintain promise chain
    this.writeQueue = this.writeQueue
      .then(async () => {
        this.isWriting = true;
        try {
          await this.appendGpsPointsToStorage(pointsToSave);
        } catch (error) {
          console.error('[SimpleRunTracker] Queue write failed:', error);
          // Don't re-throw - let tracking continue even if storage fails
        } finally {
          this.isWriting = false;
        }
        return; // Explicitly resolve to maintain chain
      })
      .catch((err) => {
        console.error('[SimpleRunTracker] Write queue error:', err);
        this.isWriting = false;
        return; // FIX 3: Resolve to prevent chain break
      });
  }

  /**
   * Incrementally append GPS points to AsyncStorage (FIX for iOS 30-min crash)
   * Only saves NEW points instead of entire array every time
   * This prevents AsyncStorage from being overwhelmed on iOS devices
   */
  private async appendGpsPointsToStorage(newPoints: GPSPoint[]): Promise<void> {
    try {
      // Get existing points from storage
      const existingData = await AsyncStorage.getItem(GPS_POINTS_KEY);
      const existing = existingData ? JSON.parse(existingData) : [];

      // Append new points to existing
      const combined = [...existing, ...newPoints];

      // Trim if too large (keep last 5000 points = ~1.4 hours of data)
      // This prevents unbounded growth while keeping enough for long workouts
      const trimmed = combined.length > 5000 ? combined.slice(-5000) : combined;

      // Save back to storage
      await AsyncStorage.setItem(GPS_POINTS_KEY, JSON.stringify(trimmed));

      console.log(
        `[SimpleRunTracker] 💾 Incremental save: Added ${newPoints.length} points, ` +
          `${trimmed.length} total in storage (was ${existing.length})`
      );
    } catch (error) {
      console.error(
        '[SimpleRunTracker] Error appending GPS points to storage:',
        error
      );
      // Don't let storage errors crash the tracking - in-memory cache is primary
    }
  }

  /**
   * Save entire GPS points array to storage (used for initial save)
   * Keep this method for backward compatibility and initial state save
   */
  private async saveGpsPointsToStorage(points: GPSPoint[]): Promise<void> {
    try {
      // Trim to reasonable size before saving
      const trimmed = points.length > 5000 ? points.slice(-5000) : points;
      await AsyncStorage.setItem(GPS_POINTS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error(
        '[SimpleRunTracker] Error saving GPS points to storage:',
        error
      );
    }
  }

  /**
   * Calculate total distance from GPS points using Haversine formula
   */
  private calculateTotalDistance(points: GPSPoint[]): number {
    if (points.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.haversineDistance(points[i - 1], points[i]);
    }

    return totalDistance;
  }

  /**
   * Haversine formula for distance between two GPS points
   */
  private haversineDistance(p1: GPSPoint, p2: GPSPoint): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (p1.latitude * Math.PI) / 180;
    const φ2 = (p2.latitude * Math.PI) / 180;
    const Δφ = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const Δλ = ((p2.longitude - p1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate total elevation gain from GPS points
   * Only counts positive changes > 2m to filter altimeter noise
   */
  private calculateElevationGain(points: GPSPoint[]): number {
    if (points.length < 2) return 0;

    let totalGain = 0;
    let lastAltitude: number | null = null;

    for (const point of points) {
      if (point.altitude === undefined || point.altitude === null) continue;

      if (lastAltitude !== null) {
        const delta = point.altitude - lastAltitude;
        // Only count gains > 2m to filter GPS altitude noise
        if (delta > 2) {
          totalGain += delta;
        }
      }
      lastAltitude = point.altitude;
    }

    return Math.round(totalGain);
  }

  /**
   * Get stored GPS points from AsyncStorage
   */
  private async getStoredPoints(): Promise<GPSPoint[]> {
    try {
      const stored = await AsyncStorage.getItem(GPS_POINTS_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[SimpleRunTracker] Error reading GPS points:', error);
      return [];
    }
  }

  /**
   * Save session state to AsyncStorage (includes complete tracker state)
   * Duration is calculated on-demand, no need to persist it
   */
  private async saveSessionState() {
    try {
      const trackerState = this.durationTracker.exportState();
      const state: SessionState = {
        sessionId: this.sessionId || '',
        activityType: this.activityType,
        isTracking: this.isTracking,
        isPaused: this.isPaused,
        startTime: this.startTime,
        pauseCount: this.pauseCount,
        presetDistance: this.presetDistance || undefined,
        // Include tracker state for session recovery
        trackerStartTime: trackerState.startTime,
        trackerTotalPausedTime: trackerState.totalPausedTime,
        trackerPauseStartTime: trackerState.pauseStartTime,
        // Reset GPS warm-up counter for new sessions
        // This is read by SimpleRunTrackerTask to skip first 3 GPS points
        gpsPointCount: 0,
      };
      await AsyncStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
      console.log('[SimpleRunTracker] Session state saved');
    } catch (error) {
      console.error('[SimpleRunTracker] Error saving session state:', error);
    }
  }

  /**
   * Get tracking state
   */
  getTrackingState(): 'idle' | 'tracking' | 'paused' {
    if (!this.isTracking) return 'idle';
    return this.isPaused ? 'paused' : 'tracking';
  }

  /**
   * Check if tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Check if paused
   */
  isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get GPS health status for UI display
   */
  getGPSStatus(): {
    isHealthy: boolean;
    lastUpdateSeconds: number;
    errorMessage: string | null;
    isInRecovery: boolean;
  } {
    const now = Date.now();
    const timeSinceLastGPS = (now - this.lastGPSUpdate) / 1000;

    return {
      isHealthy: timeSinceLastGPS < 10 && !this.isInGPSRecovery,
      lastUpdateSeconds: Math.floor(timeSinceLastGPS),
      errorMessage: this.lastGPSError,
      isInRecovery: this.isInGPSRecovery,
    };
  }

  /**
   * Start GPS watchdog - detects and recovers from silent GPS failures
   * Runs in foreground, reads timestamp written by background task
   */
  private startWatchdog(): void {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
    }
    this.gpsRestartAttempts = 0;

    this.watchdogInterval = setInterval(async () => {
      if (!this.isTracking || this.isPaused) return;

      // Read last GPS time from AsyncStorage (shared with background task)
      try {
        const lastTimeStr = await AsyncStorage.getItem('@runstr:last_gps_time');
        if (lastTimeStr) {
          this.lastGPSUpdate = parseInt(lastTimeStr, 10);
        }
      } catch (e) {
        console.warn('[WATCHDOG] Failed to read last GPS time:', e);
      }

      const gap = Date.now() - this.lastGPSUpdate;

      if (gap > this.GPS_TIMEOUT_MS) {
        console.warn(
          `[WATCHDOG] GPS silent for ${(gap / 1000).toFixed(0)}s - attempting recovery`
        );
        await this.attemptGPSRecovery();
      }
    }, this.WATCHDOG_CHECK_MS);

    console.log('[WATCHDOG] Started - monitoring GPS health every 5s');
  }

  /**
   * Stop GPS watchdog
   */
  private stopWatchdog(): void {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
    console.log('[WATCHDOG] Stopped');
  }

  /**
   * Attempt to recover GPS by restarting the location task
   */
  private async attemptGPSRecovery(): Promise<void> {
    if (this.gpsRestartAttempts >= this.MAX_GPS_RESTARTS) {
      console.error(
        `[WATCHDOG] Max restart attempts (${this.MAX_GPS_RESTARTS}) reached - GPS may be unavailable`
      );
      this.lastGPSError =
        'GPS repeatedly failed to restart. Please check your location settings.';
      return;
    }

    this.gpsRestartAttempts++;
    console.log(
      `[WATCHDOG] GPS recovery attempt ${this.gpsRestartAttempts}/${this.MAX_GPS_RESTARTS}`
    );

    try {
      // Stop existing GPS task
      const isRunning = await Location.hasStartedLocationUpdatesAsync(
        SIMPLE_TRACKER_TASK
      );
      if (isRunning) {
        await Location.stopLocationUpdatesAsync(SIMPLE_TRACKER_TASK);
      }

      // Brief pause before restarting
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Restart GPS
      await this.initializeGPS(this.activityType);

      // Update last GPS time to prevent immediate re-trigger
      this.lastGPSUpdate = Date.now();
      await AsyncStorage.setItem(
        '@runstr:last_gps_time',
        this.lastGPSUpdate.toString()
      );

      console.log('[WATCHDOG] GPS recovery successful');
    } catch (error) {
      console.error('[WATCHDOG] GPS recovery failed:', error);
    }
  }

  /**
   * Start silent audio recording to keep app process alive in background
   * This is an insurance policy for Android - some devices aggressively kill apps
   * even with foreground services
   */
  private async startSilentAudio(): Promise<void> {
    // Only needed on Android
    if (Platform.OS !== 'android') return;

    try {
      // Configure audio session for background playback
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      });

      // Recording trick: keeps audio session alive without needing a file
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      await recording.startAsync();
      this.silentRecording = recording;
      console.log(
        '[SimpleRunTracker] Silent audio recording started (background keep-alive)'
      );
    } catch (e) {
      // Non-fatal - GPS should still work without this
      console.warn('[SimpleRunTracker] Silent audio failed (non-fatal):', e);
    }
  }

  /**
   * Stop silent audio recording
   * FIX 5: Clear reference FIRST to prevent orphaned recordings
   */
  private async stopSilentAudio(): Promise<void> {
    // FIX 5: Capture reference and clear immediately
    // This prevents conflicts if startSilentAudio is called while we're stopping
    const recording = this.silentRecording;
    this.silentRecording = null;

    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      console.log('[SimpleRunTracker] Silent audio recording stopped');
    } catch (e) {
      // Non-fatal - reference already cleared, no orphan
      console.warn('[SimpleRunTracker] Stop silent audio failed:', e);
    }
  }

  /**
   * Check for active session and restore if found
   * Call this when app returns to foreground or on screen mount
   */
  async restoreSession(): Promise<boolean> {
    try {
      const sessionStateStr = await AsyncStorage.getItem(SESSION_STATE_KEY);
      if (!sessionStateStr) {
        console.log('[SimpleRunTracker] No active session to restore');
        return false;
      }

      const sessionState: SessionState = JSON.parse(sessionStateStr);

      // Restore session data
      this.sessionId = sessionState.sessionId;
      this.activityType = sessionState.activityType as
        | 'running'
        | 'walking'
        | 'cycling';
      this.isTracking = sessionState.isTracking;
      this.isPaused = sessionState.isPaused;
      this.startTime = sessionState.startTime;
      this.pauseCount = sessionState.pauseCount;
      this.presetDistance = sessionState.presetDistance || null;

      // Restore duration tracker state
      this.durationTracker.restoreState({
        startTime: sessionState.trackerStartTime,
        totalPausedTime: sessionState.trackerTotalPausedTime,
        pauseStartTime: sessionState.trackerPauseStartTime,
      });

      // Sync GPS points from storage to cache
      await this.syncGpsPointsFromStorage();

      // CRITICAL FIX: Restart GPS tracking if session was tracking
      if (this.isTracking && !this.isPaused) {
        console.log(
          '[SimpleRunTracker] 🔄 Restarting GPS tracking for restored session...'
        );

        // Check if task is already running
        const isTaskRunning = await TaskManager.isTaskRegisteredAsync(
          SIMPLE_TRACKER_TASK
        );

        if (!isTaskRunning) {
          // Restart GPS tracking
          await this.initializeGPS(this.activityType);
          console.log(
            '[SimpleRunTracker] ✅ GPS tracking restarted successfully'
          );
        } else {
          console.log('[SimpleRunTracker] ℹ️ GPS task already running');
        }

        // Update last GPS update time to prevent immediate failure detection
        this.lastGPSUpdate = Date.now();

        // Start watchdog for restored session
        this.startWatchdog();

        // Start silent audio for restored session too
        this.startSilentAudio();
      }

      console.log(
        `[SimpleRunTracker] ✅ Session restored: ${sessionState.sessionId}`
      );
      if (this.presetDistance) {
        console.log(
          `[SimpleRunTracker] 🎯 Restored preset distance: ${(
            this.presetDistance / 1000
          ).toFixed(2)} km`
        );
      }
      return true;
    } catch (error) {
      console.error('[SimpleRunTracker] Error restoring session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const simpleRunTracker = SimpleRunTracker.getInstance();
