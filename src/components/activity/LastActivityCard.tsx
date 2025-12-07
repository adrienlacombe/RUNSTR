/**
 * LastActivityCard - Shows PRs for running, or last activity for walking/cycling
 * Pulls data from LocalWorkoutStorageService and PersonalRecordsService
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LocalWorkoutStorageService, {
  type LocalWorkout,
} from '../../services/fitness/LocalWorkoutStorageService';
import { activityMetricsService } from '../../services/activity/ActivityMetricsService';
import {
  PersonalRecordsService,
  type CardioPR,
} from '../../services/analytics/PersonalRecordsService';

type ActivityType = 'running' | 'walking' | 'cycling';

interface LastActivityCardProps {
  activityType: ActivityType;
}

interface LastActivity {
  distance: number; // meters
  duration: number; // seconds
  date: Date;
}

interface WeeklyStats {
  totalDistance: number; // meters
  count: number;
}

interface BestWalkStats {
  steps: number;
  distance: number; // meters
  date: Date;
}

const activityLabels: Record<ActivityType, { singular: string; plural: string }> = {
  running: { singular: 'run', plural: 'runs' },
  walking: { singular: 'walk', plural: 'walks' },
  cycling: { singular: 'ride', plural: 'rides' },
};

export const LastActivityCard: React.FC<LastActivityCardProps> = ({
  activityType,
}) => {
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalDistance: 0,
    count: 0,
  });
  const [bestWalkStats, setBestWalkStats] = useState<BestWalkStats | null>(null);
  const [cardioPRs, setCardioPRs] = useState<CardioPR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityData();
  }, [activityType]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const workouts = await LocalWorkoutStorageService.getAllWorkouts();

      // For running, calculate PRs
      if (activityType === 'running') {
        const prs = PersonalRecordsService.getCardioPRs(workouts);
        setCardioPRs(prs);
      }

      // Filter by activity type for last activity
      const typeWorkouts = workouts.filter(
        (w: LocalWorkout) => w.type === activityType
      );

      // Get last activity
      if (typeWorkouts.length > 0) {
        const sorted = [...typeWorkouts].sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        const last = sorted[0];
        setLastActivity({
          distance: last.distance || 0,
          duration: last.duration || 0,
          date: new Date(last.startTime),
        });
      } else {
        setLastActivity(null);
      }

      // For walking: Calculate "Best Walk" (most steps in a single walk)
      if (activityType === 'walking') {
        const walkingWorkouts = typeWorkouts.filter(
          (w: LocalWorkout) => (w.steps || 0) > 0
        );

        if (walkingWorkouts.length > 0) {
          const best = walkingWorkouts.reduce((max: LocalWorkout, w: LocalWorkout) =>
            (w.steps || 0) > (max.steps || 0) ? w : max
          );
          setBestWalkStats({
            steps: best.steps || 0,
            distance: best.distance || 0,
            date: new Date(best.startTime),
          });
        } else {
          setBestWalkStats(null);
        }
      }

      // Calculate weekly stats (for cycling only now - walking uses Best Walk)
      if (activityType === 'cycling') {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Sunday
        weekStart.setHours(0, 0, 0, 0);

        const thisWeekWorkouts = typeWorkouts.filter(
          (w: LocalWorkout) => new Date(w.startTime) >= weekStart
        );

        setWeeklyStats({
          totalDistance: thisWeekWorkouts.reduce(
            (sum: number, w: LocalWorkout) => sum + (w.distance || 0),
            0
          ),
          count: thisWeekWorkouts.length,
        });
      }
    } catch (error) {
      console.error('[LastActivityCard] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const labels = activityLabels[activityType];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.prCard, styles.cardPlaceholder]}>
          <Text style={styles.placeholderText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Running: Show Last Run + PRs side by side
  if (activityType === 'running') {
    return (
      <View style={styles.container}>
        {/* Left: Last Run */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.cardTitle}>Last Run</Text>
          </View>
          {lastActivity ? (
            <>
              <Text style={styles.primaryStat}>
                {activityMetricsService.formatDistance(lastActivity.distance)}
              </Text>
              <Text style={styles.secondaryStat}>
                {activityMetricsService.formatDuration(lastActivity.duration)}
              </Text>
              <Text style={styles.dateStat}>
                {formatRelativeDate(lastActivity.date)}
              </Text>
            </>
          ) : (
            <Text style={styles.noDataText}>No runs yet</Text>
          )}
        </View>

        {/* Right: Personal Records */}
        <View style={styles.prCard}>
          <View style={styles.prHeader}>
            <Ionicons name="trophy-outline" size={14} color={theme.colors.orangeBright} />
            <Text style={styles.prTitle}>Personal Records</Text>
          </View>
          <View style={styles.prGrid}>
            <View style={styles.prCell}>
              <Text style={styles.prLabel}>5K</Text>
              <Text style={styles.prTime}>
                {cardioPRs?.fastest5K
                  ? PersonalRecordsService.formatDuration(cardioPRs.fastest5K.time)
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.prCell}>
              <Text style={styles.prLabel}>10K</Text>
              <Text style={styles.prTime}>
                {cardioPRs?.fastest10K
                  ? PersonalRecordsService.formatDuration(cardioPRs.fastest10K.time)
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.prCell}>
              <Text style={styles.prLabel}>Half</Text>
              <Text style={styles.prTime}>
                {cardioPRs?.fastestHalfMarathon
                  ? PersonalRecordsService.formatDuration(cardioPRs.fastestHalfMarathon.time)
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.prCell}>
              <Text style={styles.prLabel}>Full</Text>
              <Text style={styles.prTime}>
                {cardioPRs?.fastestMarathon
                  ? PersonalRecordsService.formatDuration(cardioPRs.fastestMarathon.time)
                  : '--:--'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Walking: Show Last Walk + Best Walk
  if (activityType === 'walking') {
    return (
      <View style={styles.container}>
        {/* Last Walk Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.cardTitle}>Last Walk</Text>
          </View>
          {lastActivity ? (
            <>
              <Text style={styles.primaryStat}>
                {activityMetricsService.formatDistance(lastActivity.distance)}
              </Text>
              <Text style={styles.secondaryStat}>
                {activityMetricsService.formatDuration(lastActivity.duration)}
              </Text>
              <Text style={styles.dateStat}>
                {formatRelativeDate(lastActivity.date)}
              </Text>
            </>
          ) : (
            <Text style={styles.noDataText}>No walks yet</Text>
          )}
        </View>

        {/* Best Walk Card (Most Steps) */}
        <View style={styles.prCard}>
          <View style={styles.prHeader}>
            <Ionicons name="trophy-outline" size={14} color={theme.colors.orangeBright} />
            <Text style={styles.prTitle}>Best Walk</Text>
          </View>
          {bestWalkStats ? (
            <>
              <Text style={styles.primaryStat}>
                {bestWalkStats.steps.toLocaleString()} steps
              </Text>
              <Text style={styles.secondaryStat}>
                {activityMetricsService.formatDistance(bestWalkStats.distance)}
              </Text>
              <Text style={styles.dateStat}>
                {formatRelativeDate(bestWalkStats.date)}
              </Text>
            </>
          ) : (
            <Text style={styles.noDataText}>Track walks to see your best</Text>
          )}
        </View>
      </View>
    );
  }

  // Cycling: Show Last Ride + This Week
  return (
    <View style={styles.container}>
      {/* Last Ride Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.cardTitle}>
            Last {labels.singular.charAt(0).toUpperCase() + labels.singular.slice(1)}
          </Text>
        </View>
        {lastActivity ? (
          <>
            <Text style={styles.primaryStat}>
              {activityMetricsService.formatDistance(lastActivity.distance)}
            </Text>
            <Text style={styles.secondaryStat}>
              {activityMetricsService.formatDuration(lastActivity.duration)}
            </Text>
            <Text style={styles.dateStat}>
              {formatRelativeDate(lastActivity.date)}
            </Text>
          </>
        ) : (
          <Text style={styles.noDataText}>No {labels.plural} yet</Text>
        )}
      </View>

      {/* This Week Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text style={styles.cardTitle}>This Week</Text>
        </View>
        {weeklyStats.count > 0 ? (
          <>
            <Text style={styles.primaryStat}>
              {activityMetricsService.formatDistance(weeklyStats.totalDistance)}
            </Text>
            <Text style={styles.secondaryStat}>
              {weeklyStats.count} {weeklyStats.count === 1 ? labels.singular : labels.plural}
            </Text>
          </>
        ) : (
          <Text style={styles.noDataText}>No {labels.plural} this week</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  prTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.orangeBright,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  prCell: {
    width: '47%',
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  prLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    marginBottom: 1,
  },
  prTime: {
    fontSize: 13,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  primaryStat: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  secondaryStat: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  dateStat: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});
