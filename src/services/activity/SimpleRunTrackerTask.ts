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
import { SIMPLE_TRACKER_TASK, simpleRunTracker } from './SimpleRunTracker';

// Storage key
const SESSION_STATE_KEY = '@runstr:session_state';

/**
 * Define the background task
 * This runs even when app is minimized or screen is locked
 */
TaskManager.defineTask(SIMPLE_TRACKER_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[SimpleRunTrackerTask] Error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    try {
      // Check if session is active
      const sessionStateStr = await AsyncStorage.getItem(SESSION_STATE_KEY);
      if (!sessionStateStr) {
        console.log('[SimpleRunTrackerTask] No active session, ignoring locations');
        return;
      }

      const sessionState = JSON.parse(sessionStateStr);
      if (sessionState.isPaused) {
        console.log('[SimpleRunTrackerTask] Session paused, ignoring locations');
        return;
      }

      // Filter locations for accuracy (senior dev's recommendation)
      const validLocations = locations
        .filter((loc) => {
          const accuracy = loc.coords.accuracy || 999;
          return accuracy <= 20; // Only keep accurate readings (< 20m)
        })
        .map((loc) => ({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude || undefined,
          timestamp: loc.timestamp,
          accuracy: loc.coords.accuracy || undefined,
          speed: loc.coords.speed || undefined,
        }));

      if (validLocations.length === 0) {
        console.log('[SimpleRunTrackerTask] No valid locations (all filtered out)');
        return;
      }

      // REAL-TIME UPDATES: Update SimpleRunTracker cache directly!
      // This is how Nike Run Club / Strava work - direct data flow
      // GPS → This task → Tracker cache → UI sees fresh data
      simpleRunTracker.appendGpsPointsToCache(validLocations);

      console.log(
        `[SimpleRunTrackerTask] ✅ Real-time: Sent ${validLocations.length} GPS points to tracker`
      );
    } catch (err) {
      console.error('[SimpleRunTrackerTask] Error processing locations:', err);
    }
  }
});

console.log('[SimpleRunTrackerTask] Task registered successfully');

// Export task name for verification
export { SIMPLE_TRACKER_TASK };
