/**
 * LeaderboardsContent - Embeddable leaderboards for Compete screen toggle
 * Shows GLOBAL daily leaderboards for all running workouts (not team-specific)
 *
 * ARCHITECTURE: Uses WorkoutEventStore as SINGLE SOURCE OF TRUTH
 * - Pull-to-refresh anywhere updates WorkoutEventStore
 * - This component reads from the store and shows ALL running workouts
 * - Running workouts only (no walking)
 * - Distance >= threshold (not narrow ranges like 4.5-5.5km)
 * - NO team filtering - shows everyone's workouts
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { DailyLeaderboardCard } from '../team/DailyLeaderboardCard';
import { useWorkoutEventStore } from '../../hooks/useWorkoutEventStore';
import { hexToNpub } from '../../utils/ndkConversion';
import type { StoredWorkout } from '../../services/fitness/WorkoutEventStore';

// ============================================================================
// Types
// ============================================================================

interface LeaderboardEntry {
  rank: number;
  npub: string;
  name: string;
  score: number;
  formattedScore: string;
  workoutCount: number;
}

interface GlobalLeaderboards {
  leaderboard5k: LeaderboardEntry[];
  leaderboard10k: LeaderboardEntry[];
  leaderboardHalf: LeaderboardEntry[];
  leaderboardMarathon: LeaderboardEntry[];
}

interface LeaderboardsContentProps {
  /** Increment to trigger re-calculation after store refresh */
  refreshTrigger?: number;
}

// ============================================================================
// Constants - Distance thresholds (>= not narrow range)
// ============================================================================

const DISTANCE_THRESHOLDS_KM = {
  '5k': 5,
  '10k': 10,
  'half': 21,
  'marathon': 42,
};

// ============================================================================
// Component
// ============================================================================

export const LeaderboardsContent: React.FC<LeaderboardsContentProps> = ({
  refreshTrigger = 0,
}) => {
  // SINGLE SOURCE OF TRUTH: Read from central WorkoutEventStore
  const { workouts, isLoading: storeLoading } = useWorkoutEventStore();

  // Calculate GLOBAL leaderboards from store data (no team filtering)
  // Recalculates when workouts change or refreshTrigger changes
  const globalLeaderboards: GlobalLeaderboards = useMemo(() => {
    console.log('[LeaderboardsContent] ==========================================');
    console.log('[LeaderboardsContent] ========== CALCULATING GLOBAL LEADERBOARDS ==========');
    console.log('[LeaderboardsContent] ==========================================');
    console.log(`[LeaderboardsContent] refreshTrigger: ${refreshTrigger}`);
    console.log(`[LeaderboardsContent] Total workouts in store: ${workouts.length}`);

    // Get today's date range
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(todayMidnight.getTime() / 1000);

    // Filter to today's workouts (NO TEAM FILTERING - global leaderboard)
    const todaysWorkouts = workouts.filter(w => w.createdAt >= todayTimestamp);
    console.log(`[LeaderboardsContent] Today's workouts (global): ${todaysWorkouts.length}`);

    // Log sample workouts
    if (todaysWorkouts.length > 0) {
      console.log('[LeaderboardsContent] Sample today\'s workouts:');
      todaysWorkouts.slice(0, 10).forEach((w, i) => {
        console.log(`  ${i + 1}. id=${w.id.slice(0, 8)}, type=${w.activityType}, distance=${w.distance}m, pubkey=${w.pubkey.slice(0, 8)}`);
      });
    }

    // Calculate leaderboards from ALL today's workouts (no team filter)
    return {
      leaderboard5k: calculateDistanceLeaderboard(todaysWorkouts, '5k'),
      leaderboard10k: calculateDistanceLeaderboard(todaysWorkouts, '10k'),
      leaderboardHalf: calculateDistanceLeaderboard(todaysWorkouts, 'half'),
      leaderboardMarathon: calculateDistanceLeaderboard(todaysWorkouts, 'marathon'),
    };
  }, [workouts, refreshTrigger]);

  // Calculate if there are any active leaderboards
  const hasAnyLeaderboards =
    globalLeaderboards.leaderboard5k.length > 0 ||
    globalLeaderboards.leaderboard10k.length > 0 ||
    globalLeaderboards.leaderboardHalf.length > 0 ||
    globalLeaderboards.leaderboardMarathon.length > 0;

  // Loading state (only on initial load when store is empty)
  if (storeLoading && workouts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading leaderboards...</Text>
      </View>
    );
  }

  // Empty state - No running workouts today
  if (!hasAnyLeaderboards) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="fitness-outline"
          size={64}
          color={theme.colors.accent}
        />
        <Text style={styles.emptyTitle}>No Running Workouts Today</Text>
        <Text style={styles.emptyText}>
          Be the first to complete a running workout (5K+) and appear on the leaderboard!
        </Text>
        <Text style={styles.emptyHint}>Pull down to refresh</Text>
      </View>
    );
  }

  // Main content - Show GLOBAL leaderboards (not team-specific)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Ionicons
          name="trophy"
          size={20}
          color={theme.colors.accent}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>Daily Leaderboards</Text>
      </View>

      {/* Daily leaderboard cards */}
      <View style={styles.leaderboardsContainer}>
        {globalLeaderboards.leaderboard5k.length > 0 && (
          <DailyLeaderboardCard
            title="5K"
            distance="5km"
            participants={globalLeaderboards.leaderboard5k.length}
            entries={globalLeaderboards.leaderboard5k}
            onPress={() => console.log('Navigate to 5K leaderboard')}
          />
        )}

        {globalLeaderboards.leaderboard10k.length > 0 && (
          <DailyLeaderboardCard
            title="10K"
            distance="10km"
            participants={globalLeaderboards.leaderboard10k.length}
            entries={globalLeaderboards.leaderboard10k}
            onPress={() => console.log('Navigate to 10K leaderboard')}
          />
        )}

        {globalLeaderboards.leaderboardHalf.length > 0 && (
          <DailyLeaderboardCard
            title="Half Marathon"
            distance="21.1km"
            participants={globalLeaderboards.leaderboardHalf.length}
            entries={globalLeaderboards.leaderboardHalf}
            onPress={() => console.log('Navigate to Half Marathon leaderboard')}
          />
        )}

        {globalLeaderboards.leaderboardMarathon.length > 0 && (
          <DailyLeaderboardCard
            title="Marathon"
            distance="42.2km"
            participants={globalLeaderboards.leaderboardMarathon.length}
            entries={globalLeaderboards.leaderboardMarathon}
            onPress={() => console.log('Navigate to Marathon leaderboard')}
          />
        )}
      </View>
    </View>
  );
};

// ============================================================================
// Leaderboard Calculation
// ============================================================================

/**
 * Calculate leaderboard for a specific distance category
 * - RUNNING ONLY (no walking, jogging)
 * - Distance >= threshold (not narrow range)
 * - Best time per user
 */
function calculateDistanceLeaderboard(
  workouts: StoredWorkout[],
  category: '5k' | '10k' | 'half' | 'marathon'
): LeaderboardEntry[] {
  const thresholdKm = DISTANCE_THRESHOLDS_KM[category];
  const thresholdMeters = thresholdKm * 1000;

  console.log(`[LeaderboardsContent] DEBUG - calculateDistanceLeaderboard(${category})`);
  console.log(`  Input workouts: ${workouts.length}`);
  console.log(`  Threshold: >= ${thresholdMeters}m (${thresholdKm}km)`);

  // Filter workouts:
  // 1. RUNNING ONLY (not walking, jogging, cycling, etc.)
  // 2. Distance >= threshold
  const eligibleWorkouts = workouts.filter((w) => {
    if (!w.distance || !w.duration) {
      console.log(`  SKIP ${w.id.slice(0, 8)}: missing distance(${w.distance}) or duration(${w.duration})`);
      return false;
    }

    // RUNNING ONLY - this is for race leaderboards
    const isRunning = w.activityType?.toLowerCase() === 'running';
    if (!isRunning) {
      console.log(`  SKIP ${w.id.slice(0, 8)}: not running (type="${w.activityType}")`);
      return false;
    }

    // Distance must be >= threshold (not narrow range)
    const meetsDistance = w.distance >= thresholdMeters;
    if (!meetsDistance) {
      console.log(`  SKIP ${w.id.slice(0, 8)}: distance ${w.distance}m < ${thresholdMeters}m threshold`);
      return false;
    }

    console.log(`  PASS ${w.id.slice(0, 8)}: running, ${w.distance}m >= ${thresholdMeters}m`);
    return true;
  });

  console.log(`[LeaderboardsContent] ${category}: ${eligibleWorkouts.length} eligible running workouts (>= ${thresholdKm}km)`);

  if (eligibleWorkouts.length === 0) return [];

  // Group by user and find best time
  const userBestTimes = new Map<
    string,
    { workout: StoredWorkout; bestDuration: number }
  >();

  for (const workout of eligibleWorkouts) {
    // Extract time for this specific distance from splits (or estimate from pace)
    const targetTime = extractTargetDistanceTime(workout, thresholdKm);

    const existing = userBestTimes.get(workout.pubkey);
    if (!existing || targetTime < existing.bestDuration) {
      userBestTimes.set(workout.pubkey, {
        workout,
        bestDuration: targetTime,
      });
    }
  }

  // Convert to leaderboard entries and sort by time
  const entries: LeaderboardEntry[] = [];
  for (const [pubkey, data] of userBestTimes) {
    const npub = hexToNpub(pubkey) || pubkey;
    entries.push({
      rank: 0, // Will be set after sorting
      npub,
      name: data.workout.profileName || shortenPubkey(pubkey),
      score: data.bestDuration,
      formattedScore: formatDuration(data.bestDuration),
      workoutCount: 1,
    });
  }

  // Sort by duration (fastest first)
  entries.sort((a, b) => a.score - b.score);

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

/**
 * Extract time for a specific distance from workout splits
 * - If exact split exists, use it
 * - If splits exist but no exact match, use closest split <= target
 * - If no splits, estimate from average pace
 */
function extractTargetDistanceTime(
  workout: StoredWorkout,
  targetDistanceKm: number
): number {
  console.log(`[extractTargetDistanceTime] workout=${workout.id.slice(0, 8)}, target=${targetDistanceKm}km`);
  console.log(`  splits: ${workout.splits ? `Map(${workout.splits.size})` : 'undefined'}`);

  // If no splits, estimate from average pace
  if (!workout.splits || workout.splits.size === 0) {
    if (workout.distance && workout.distance > 0 && workout.duration) {
      const distanceKm = workout.distance / 1000;
      const avgPacePerKm = workout.duration / distanceKm;
      const estimatedTime = Math.round(avgPacePerKm * targetDistanceKm);
      console.log(`  No splits - estimating: ${distanceKm.toFixed(2)}km in ${workout.duration}s = ${avgPacePerKm.toFixed(1)}s/km`);
      console.log(`  Estimated ${targetDistanceKm}km time: ${estimatedTime}s (${formatDuration(estimatedTime)})`);
      return estimatedTime;
    }
    console.log(`  No splits and missing distance/duration - using total duration: ${workout.duration}`);
    return workout.duration || 0;
  }

  // Log all available splits
  console.log(`  Available splits:`);
  for (const [km, time] of workout.splits.entries()) {
    console.log(`    km ${km}: ${time}s (${formatDuration(time)})`);
  }

  // Try exact split match
  const exactSplit = workout.splits.get(targetDistanceKm);
  if (exactSplit) {
    console.log(`  EXACT split match at km ${targetDistanceKm}: ${exactSplit}s (${formatDuration(exactSplit)})`);
    return exactSplit;
  }

  // Use closest split <= target
  let closestKm = 0;
  let closestTime = 0;
  for (const [km, time] of workout.splits.entries()) {
    if (km <= targetDistanceKm && km > closestKm) {
      closestKm = km;
      closestTime = time;
    }
  }

  if (closestTime > 0) {
    console.log(`  Closest split <= ${targetDistanceKm}km: km ${closestKm} = ${closestTime}s (${formatDuration(closestTime)})`);
    return closestTime;
  }

  // Fallback to total duration
  console.log(`  No suitable split found - using total duration: ${workout.duration}`);
  return workout.duration || 0;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Shorten a pubkey for display
 */
function shortenPubkey(pubkey: string): string {
  if (pubkey.length <= 12) return pubkey;
  return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.accent,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 16,
    fontStyle: 'italic',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  leaderboardsContainer: {
    gap: 12,
  },
});

export default LeaderboardsContent;
