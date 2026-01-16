/**
 * Unified Workout Merge Utility
 * Merges local workouts with health app workouts (HealthKit/Health Connect)
 * Handles deduplication to avoid showing the same workout twice
 */

import type { LocalWorkout } from '../services/fitness/LocalWorkoutStorageService';
import type { Workout } from '../types/workout';

export interface MergeResult {
  workouts: Workout[];
  duplicatesRemoved: number;
  localCount: number;
  healthCount: number;
}

/**
 * Check if two workouts are duplicates using fuzzy matching
 * Matches by: same start time (within 1 minute) + same type + similar duration (within 10 seconds)
 */
function isDuplicateByFuzzyMatch(
  healthWorkout: Workout,
  localWorkouts: LocalWorkout[]
): boolean {
  const healthStart = new Date(healthWorkout.startTime).getTime();
  const TIME_WINDOW_MS = 60 * 1000; // 1 minute tolerance
  const DURATION_TOLERANCE_S = 10; // 10 second tolerance

  return localWorkouts.some((local) => {
    const localStart = new Date(local.startTime).getTime();
    const timeDiff = Math.abs(healthStart - localStart);
    const durationDiff = Math.abs(
      (healthWorkout.duration || 0) - (local.duration || 0)
    );

    // Match if: same time window + same type + similar duration
    return (
      timeDiff <= TIME_WINDOW_MS &&
      healthWorkout.type === local.type &&
      durationDiff <= DURATION_TOLERANCE_S
    );
  });
}

/**
 * Convert LocalWorkout to Workout interface for unified display
 */
export function localToWorkout(local: LocalWorkout, userId: string): Workout {
  return {
    id: local.id,
    userId: userId,
    type: local.type,
    source: local.source as Workout['source'],
    duration: local.duration,
    distance: local.distance,
    calories: local.calories,
    startTime: local.startTime,
    endTime: local.endTime,
    syncedAt: local.syncedAt || new Date().toISOString(),
    pace: local.pace,
    metadata: {
      isLocal: true,
      originalSource: local.source,
      steps: local.steps,
    },
  };
}

/**
 * Merge local workouts with health app workouts, removing duplicates
 *
 * Deduplication strategy:
 * 1. Local workouts with source='healthkit' or 'health_connect' were previously imported
 *    - These should NOT show duplicate health app entries
 * 2. Check exact ID match (healthkit UUID or health_connect ID)
 * 3. Check fuzzy match: same start time (1 min) + type + duration (10s)
 *
 * @param localWorkouts - Workouts from LocalWorkoutStorageService
 * @param healthWorkouts - Workouts from HealthKit or Health Connect
 * @param userId - Current user ID
 * @returns Merged, deduplicated, sorted workout list
 */
export function mergeWorkoutsWithDeduplication(
  localWorkouts: LocalWorkout[],
  healthWorkouts: Workout[],
  userId: string
): MergeResult {
  // Build a set of IDs from local workouts that came from health apps
  const importedHealthIds = new Set<string>();
  localWorkouts.forEach((w) => {
    if (w.source === 'healthkit' || w.source === 'health_connect') {
      importedHealthIds.add(w.id);
    }
  });

  // Filter out health workouts that are already in local storage
  const uniqueHealthWorkouts = healthWorkouts.filter((hw) => {
    // Check exact ID match
    if (importedHealthIds.has(hw.id)) {
      return false;
    }

    // Check fuzzy match (time + type + duration)
    if (isDuplicateByFuzzyMatch(hw, localWorkouts)) {
      return false;
    }

    return true;
  });

  const duplicatesRemoved = healthWorkouts.length - uniqueHealthWorkouts.length;

  // Convert local workouts to Workout format
  const convertedLocalWorkouts = localWorkouts.map((w) =>
    localToWorkout(w, userId)
  );

  // Merge and sort by startTime (newest first)
  const merged = [...convertedLocalWorkouts, ...uniqueHealthWorkouts].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return {
    workouts: merged,
    duplicatesRemoved,
    localCount: localWorkouts.length,
    healthCount: uniqueHealthWorkouts.length,
  };
}
