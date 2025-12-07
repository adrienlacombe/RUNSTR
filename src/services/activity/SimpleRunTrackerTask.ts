/**
 * SimpleRunTrackerTask - Background GPS point collection
 *
 * CRITICAL: This file must be imported in index.js BEFORE app initialization
 * so TaskManager knows about the background task.
 *
 * Architecture: Direct cache updates (like Nike Run Club / Strava)
 * GPS → This task → SimpleRunTracker.appendGpsPointsToCache() → Real-time UI updates
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SIMPLE_TRACKER_TASK, simpleRunTracker } from './SimpleRunTracker';
import { calculateDistance } from '../../utils/gpsValidation';
import type { GPSPoint } from './SimpleRunTracker';

// Storage keys
const SESSION_STATE_KEY = '@runstr:session_state';
const GPS_POINTS_KEY = '@runstr:gps_points';

// Activity-specific GPS filtering thresholds
// Tuned based on typical movement patterns for each activity type
// Android GPS is typically less accurate (15-50m) than iOS (5-15m), so we relax thresholds
const ACTIVITY_THRESHOLDS = {
  running: {
    maxAccuracy: Platform.OS === 'android' ? 50 : 20, // Android GPS often 30-50m in urban areas
    maxSpeed: 12, // m/s (~43 km/h - sprint speed)
    maxTeleport: Platform.OS === 'android' ? 80 : 40, // Larger gaps ok on Android
    minDistance: 1.0, // meters
  },
  walking: {
    maxAccuracy: Platform.OS === 'android' ? 55 : 25, // Walking tolerates slightly worse accuracy
    maxSpeed: 4, // m/s (~14 km/h - fast walk)
    maxTeleport: Platform.OS === 'android' ? 70 : 30, // Larger gaps ok on Android
    minDistance: 0.5, // meters (more sensitive for short steps)
  },
  cycling: {
    maxAccuracy: Platform.OS === 'android' ? 60 : 30, // Cycling at speed can have larger errors
    maxSpeed: 20, // m/s (~72 km/h - fast downhill)
    maxTeleport: Platform.OS === 'android' ? 120 : 80, // Larger gaps ok on Android
    minDistance: 2.0, // meters
  },
} as const;

type ActivityType = keyof typeof ACTIVITY_THRESHOLDS;

/**
 * Define the background task
 * This runs even when app is minimized or screen is locked
 */
TaskManager.defineTask(SIMPLE_TRACKER_TASK, async ({ data, error }) => {
  // WATCHDOG HEARTBEAT: Write timestamp immediately to prove we're alive
  // The foreground watchdog reads this to detect if GPS has silently died
  await AsyncStorage.setItem('@runstr:last_gps_time', Date.now().toString());

  if (error) {
    console.error('[GPS-FLOW] ❌ TaskManager error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log(`[GPS-FLOW] 📍 Received ${locations.length} raw GPS points`);

    try {
      // Check if session is active (via AsyncStorage - shared between JS contexts!)
      const sessionStateStr = await AsyncStorage.getItem(SESSION_STATE_KEY);
      if (!sessionStateStr) {
        console.log(
          '[GPS-FLOW] ⏹️ No active session in AsyncStorage, ignoring'
        );
        return;
      }

      const sessionState = JSON.parse(sessionStateStr);
      console.log(
        `[GPS-FLOW] 📋 Session active: ${sessionState.activityType}, paused: ${sessionState.isPaused}, gpsCount: ${sessionState.gpsPointCount || 0}`
      );

      if (sessionState.isPaused) {
        console.log('[GPS-FLOW] ⏸️ Session paused, ignoring');
        return;
      }

      // Get activity-specific thresholds
      const activityType = (sessionState.activityType || 'running') as ActivityType;
      const thresholds = ACTIVITY_THRESHOLDS[activityType] || ACTIVITY_THRESHOLDS.running;

      // Get last valid GPS point for distance calculations
      let lastValidLocation: GPSPoint | null = null;
      const storedPointsStr = await AsyncStorage.getItem(GPS_POINTS_KEY);
      if (storedPointsStr) {
        const storedPoints = JSON.parse(storedPointsStr);
        if (storedPoints.length > 0) {
          lastValidLocation = storedPoints[storedPoints.length - 1];
        }
      }

      // Track GPS warm-up points (skip first 3 points to eliminate startup jump)
      let gpsPointCount = sessionState.gpsPointCount || 0;

      // Enhanced filtering with GPS warm-up buffer and validation
      const validLocations = [];

      for (const loc of locations) {
        const accuracy = loc.coords.accuracy || 999;

        // 1. Accuracy check (activity-specific threshold)
        if (accuracy > thresholds.maxAccuracy) {
          console.log(
            `[SimpleRunTrackerTask] Rejected: poor accuracy ${accuracy.toFixed(
              1
            )}m > ${thresholds.maxAccuracy}m`
          );
          continue;
        }

        // 2. GPS warm-up buffer (skip first 3 points to prevent initial jump)
        if (gpsPointCount < 3) {
          gpsPointCount++;
          sessionState.gpsPointCount = gpsPointCount;
          await AsyncStorage.setItem(
            SESSION_STATE_KEY,
            JSON.stringify(sessionState)
          );
          console.log(
            `[SimpleRunTrackerTask] GPS warm-up: skipping point ${gpsPointCount}/3`
          );
          continue; // Skip this point for distance calculation
        }

        const currentPoint: GPSPoint = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude || undefined,
          timestamp: loc.timestamp,
          accuracy: loc.coords.accuracy || undefined,
          speed: loc.coords.speed || undefined,
        };

        // If this is the first valid point after warm-up, accept it
        if (!lastValidLocation) {
          validLocations.push(currentPoint);
          lastValidLocation = currentPoint;
          continue;
        }

        // 3. Minimum time interval (reduce noise from too-frequent updates)
        const timeDiff = (loc.timestamp - lastValidLocation.timestamp) / 1000; // seconds
        if (timeDiff < 1.0) {
          console.log(
            `[SimpleRunTrackerTask] Rejected: too soon (${timeDiff.toFixed(
              2
            )}s < 1.0s)`
          );
          continue;
        }

        // 4. Calculate distance for validation
        const distance = calculateDistance(
          {
            latitude: lastValidLocation.latitude,
            longitude: lastValidLocation.longitude,
            timestamp: lastValidLocation.timestamp,
            accuracy: lastValidLocation.accuracy,
          },
          {
            latitude: currentPoint.latitude,
            longitude: currentPoint.longitude,
            timestamp: currentPoint.timestamp,
            accuracy: currentPoint.accuracy,
          }
        );

        // 5. GPS jitter filter (activity-specific minimum distance)
        if (distance < thresholds.minDistance) {
          // Don't log - this is normal when stationary
          continue;
        }

        // 6. GPS teleportation filter (activity-specific threshold)
        if (distance > thresholds.maxTeleport) {
          console.log(
            `[SimpleRunTrackerTask] Rejected: jump too large (${distance.toFixed(
              1
            )}m > ${thresholds.maxTeleport}m)`
          );
          continue;
        }

        // 7. Speed validation (activity-specific threshold)
        const speed = loc.coords.speed || distance / timeDiff;
        if (speed > thresholds.maxSpeed) {
          console.log(
            `[SimpleRunTrackerTask] Rejected: unrealistic speed (${speed.toFixed(
              1
            )} m/s > ${thresholds.maxSpeed} m/s)`
          );
          continue;
        }

        // Point passed all validation checks
        validLocations.push(currentPoint);
        lastValidLocation = currentPoint;
      }

      if (validLocations.length === 0) {
        console.log('[GPS-FLOW] ⚠️ All points filtered out, nothing to send');
        return;
      }

      // REAL-TIME UPDATES: Update SimpleRunTracker cache directly!
      // This is how Nike Run Club / Strava work - direct data flow
      // GPS → This task → Tracker cache → UI sees fresh data
      //
      // CRITICAL: This call goes to the singleton in the background JS context.
      // The isTracking check was removed from appendGpsPointsToCache() because
      // the background singleton has isTracking=false (separate JS context).
      // Session validation is done above via AsyncStorage (which IS shared).
      console.log(
        `[GPS-FLOW] 📤 Sending ${validLocations.length} valid points to cache...`
      );
      simpleRunTracker.appendGpsPointsToCache(validLocations);

      console.log(
        `[GPS-FLOW] ✅ SUCCESS: ${validLocations.length} GPS points added to tracker cache`
      );
    } catch (err) {
      console.error('[GPS-FLOW] ❌ Error processing locations:', err);
    }
  }
});

console.log('[SimpleRunTrackerTask] Task registered successfully');

// Export task name for verification
export { SIMPLE_TRACKER_TASK };
