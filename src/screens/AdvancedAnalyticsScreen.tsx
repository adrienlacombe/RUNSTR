/**
 * Advanced Analytics Screen
 * Privacy-first local analytics dashboard
 * All calculations happen on-device using local workout data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { PrivacyNoticeModal } from '../components/ui/PrivacyNoticeModal';
import localWorkoutStorage from '../services/fitness/LocalWorkoutStorageService';
import type { LocalWorkout } from '../services/fitness/LocalWorkoutStorageService';
import unifiedCache from '../services/cache/UnifiedNostrCache';
import { CacheKeys, CacheTTL } from '../constants/cacheTTL';
import { Nuclear1301Service } from '../services/fitness/Nuclear1301Service';
import type { NostrWorkout } from '../types/nostrWorkout';
import type { AnalyticsSummary } from '../types/analytics';
import { CardioPerformanceAnalytics } from '../services/analytics/CardioPerformanceAnalytics';
import { StrengthTrainingAnalytics } from '../services/analytics/StrengthTrainingAnalytics';
import { WellnessAnalytics } from '../services/analytics/WellnessAnalytics';
import { NutritionAnalytics } from '../services/analytics/NutritionAnalytics';
import { HolisticHealthAnalytics } from '../services/analytics/HolisticHealthAnalytics';

const PRIVACY_NOTICE_KEY = '@runstr:analytics_privacy_accepted';

export const AdvancedAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [workouts, setWorkouts] = useState<LocalWorkout[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  const initializeAnalytics = async () => {
    try {
      // Check if user has accepted privacy notice
      const privacyAccepted = await AsyncStorage.getItem(PRIVACY_NOTICE_KEY);

      if (!privacyAccepted) {
        setShowPrivacyModal(true);
        setLoading(false);
        return;
      }

      // Load and calculate analytics
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log(
        '[AdvancedAnalytics] Loading analytics with complete workout dataset...'
      );

      // Get user's pubkey from storage
      const userPubkey = await AsyncStorage.getItem('@runstr:npub');
      const hexPubkey = await AsyncStorage.getItem('@runstr:hex_pubkey');
      const pubkey = hexPubkey || userPubkey;

      // Array to hold all workouts (local + Nostr)
      let allWorkouts: (LocalWorkout | NostrWorkout)[] = [];

      // 1. Get LOCAL unsynced workouts
      const localWorkouts = await localWorkoutStorage.getUnsyncedWorkouts();
      console.log(
        `[AdvancedAnalytics] Loaded ${localWorkouts.length} local unsynced workouts`
      );
      allWorkouts.push(...localWorkouts);

      // 2. Get CACHED or FETCH Nostr workouts
      if (pubkey) {
        // Try cache first (instant if PublicWorkoutsTab already loaded it)
        let cachedNostrWorkouts = await unifiedCache.getCachedAsync<
          NostrWorkout[]
        >(CacheKeys.USER_WORKOUTS(pubkey));

        if (cachedNostrWorkouts && cachedNostrWorkouts.length > 0) {
          console.log(
            `[AdvancedAnalytics] 📦 Cache hit: ${cachedNostrWorkouts.length} Nostr workouts`
          );
          allWorkouts.push(...cachedNostrWorkouts);
        } else {
          // No cache - fetch from Nostr
          console.log(
            '[AdvancedAnalytics] 📡 Cache miss - fetching from Nostr...'
          );
          const nuclear1301Service = Nuclear1301Service.getInstance();
          const nostrWorkouts = await nuclear1301Service.getUserWorkouts(
            pubkey
          );
          console.log(
            `[AdvancedAnalytics] ✅ Fetched ${nostrWorkouts.length} workouts from Nostr`
          );

          // Cache for future use
          await unifiedCache.set(
            CacheKeys.USER_WORKOUTS(pubkey),
            nostrWorkouts,
            CacheTTL.USER_WORKOUTS
          );

          allWorkouts.push(...nostrWorkouts);
        }
      } else {
        console.warn(
          '[AdvancedAnalytics] No pubkey available - analytics will only show local workouts'
        );
      }

      console.log(
        `[AdvancedAnalytics] Total workouts for analytics: ${allWorkouts.length}`
      );
      setWorkouts(allWorkouts as LocalWorkout[]);

      // Calculate all analytics on COMPLETE dataset
      const cardioMetrics =
        CardioPerformanceAnalytics.calculateMetrics(allWorkouts);
      const strengthMetrics =
        StrengthTrainingAnalytics.calculateMetrics(allWorkouts);
      const wellnessMetrics = WellnessAnalytics.calculateMetrics(allWorkouts);
      const nutritionMetrics = NutritionAnalytics.calculateMetrics(allWorkouts);

      // Calculate holistic score
      const holisticScore = HolisticHealthAnalytics.calculateHolisticScore(
        allWorkouts,
        cardioMetrics || undefined,
        strengthMetrics || undefined,
        wellnessMetrics || undefined,
        nutritionMetrics || undefined
      );

      // Calculate cross-activity correlations
      const correlations =
        HolisticHealthAnalytics.calculateCrossActivityCorrelations(allWorkouts);

      // Combine into summary
      const summary: AnalyticsSummary = {
        cardio: cardioMetrics || undefined,
        strength: strengthMetrics || undefined,
        wellness: wellnessMetrics || undefined,
        nutrition: nutritionMetrics || undefined,
        correlations,
        holisticScore,
        lastUpdated: new Date().toISOString(),
      };

      setAnalytics(summary);
      setLoading(false);
      console.log('[AdvancedAnalytics] ✅ Analytics calculation complete');
    } catch (error) {
      console.error('[AdvancedAnalytics] ❌ Failed to load analytics:', error);
      setLoading(false);
    }
  };

  const handlePrivacyAccept = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_NOTICE_KEY, 'true');
      setShowPrivacyModal(false);
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to save privacy acceptance:', error);
    }
  };

  const handlePrivacyClose = () => {
    setShowPrivacyModal(false);
    navigation.goBack(); // Go back if user declines
  };

  const handlePrivacyBannerPress = () => {
    setShowPrivacyModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9D42" />
          <Text style={styles.loadingText}>Calculating analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Analytics</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Privacy Notice Banner */}
        <TouchableOpacity
          style={styles.privacyNotice}
          onPress={handlePrivacyBannerPress}
        >
          <View style={styles.privacyHeader}>
            <Ionicons name="lock-closed" size={20} color="#FF9D42" />
            <Text style={styles.privacyTitle}>Your Data Stays Private</Text>
          </View>
          <Text style={styles.privacyText}>
            All analytics calculated locally on your device. Your data never
            leaves your phone.
          </Text>
          <Text style={styles.privacyLink}>Tap to learn more →</Text>
        </TouchableOpacity>

        {/* Check for data */}
        {!analytics || workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="fitness-outline"
              size={64}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyStateTitle}>No Data Yet</Text>
            <Text style={styles.emptyStateText}>
              Start recording workouts to see your advanced analytics and
              insights.
            </Text>
          </View>
        ) : (
          <>
            {/* Holistic Health Score Section */}
            {analytics.holisticScore && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overall Health Score</Text>
                <View style={styles.scoreCard}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>
                      {analytics.holisticScore.overall}
                    </Text>
                    <Text style={styles.scoreLabel}>/ 100</Text>
                  </View>
                  <View style={styles.scoreDetails}>
                    <Text style={styles.categoryLabel}>
                      {analytics.holisticScore.category.toUpperCase()}
                    </Text>
                    <Text style={styles.trendLabel}>
                      Trend:{' '}
                      {analytics.holisticScore.trend === 'improving'
                        ? '📈'
                        : analytics.holisticScore.trend === 'declining'
                        ? '📉'
                        : '➡️'}{' '}
                      {analytics.holisticScore.trend}
                    </Text>
                  </View>
                </View>

                {/* Category Breakdown */}
                <View style={styles.categoryBreakdown}>
                  {analytics.holisticScore.cardio > 0 && (
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryName}>Cardio</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${analytics.holisticScore.cardio}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryScore}>
                        {analytics.holisticScore.cardio}
                      </Text>
                    </View>
                  )}
                  {analytics.holisticScore.strength > 0 && (
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryName}>Strength</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${analytics.holisticScore.strength}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryScore}>
                        {analytics.holisticScore.strength}
                      </Text>
                    </View>
                  )}
                  {analytics.holisticScore.wellness > 0 && (
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryName}>Wellness</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${analytics.holisticScore.wellness}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryScore}>
                        {analytics.holisticScore.wellness}
                      </Text>
                    </View>
                  )}
                  <View style={styles.categoryRow}>
                    <Text style={styles.categoryName}>Balance</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${analytics.holisticScore.balance}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryScore}>
                      {analytics.holisticScore.balance}
                    </Text>
                  </View>
                </View>

                {/* Recommendations */}
                {analytics.holisticScore.recommendations.length > 0 && (
                  <View style={styles.recommendations}>
                    <Text style={styles.recommendationsTitle}>
                      Recommendations
                    </Text>
                    {analytics.holisticScore.recommendations.map(
                      (rec, index) => (
                        <View key={index} style={styles.recommendationRow}>
                          <Ionicons
                            name="bulb-outline"
                            size={16}
                            color="#FF9D42"
                          />
                          <Text style={styles.recommendationText}>{rec}</Text>
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Cardio Performance Section */}
            {analytics.cardio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cardio Performance</Text>
                <View style={styles.metricCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Pace</Text>
                    <Text style={styles.metricValue}>
                      {Math.floor(
                        analytics.cardio.paceImprovement.currentAvgPace / 60
                      )}
                      :
                      {String(
                        Math.round(
                          analytics.cardio.paceImprovement.currentAvgPace % 60
                        )
                      ).padStart(2, '0')}{' '}
                      /km
                    </Text>
                    <Text
                      style={[
                        styles.metricTrend,
                        analytics.cardio.paceImprovement.trend ===
                          'improving' && styles.metricTrendPositive,
                      ]}
                    >
                      {analytics.cardio.paceImprovement.percentChange > 0
                        ? '+'
                        : ''}
                      {analytics.cardio.paceImprovement.percentChange.toFixed(
                        1
                      )}
                      %
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Weekly Distance</Text>
                    <Text style={styles.metricValue}>
                      {analytics.cardio.distanceProgression.currentWeeklyAvg.toFixed(
                        1
                      )}{' '}
                      km
                    </Text>
                    <Text
                      style={[
                        styles.metricTrend,
                        analytics.cardio.distanceProgression.trend ===
                          'increasing' && styles.metricTrendPositive,
                      ]}
                    >
                      {analytics.cardio.distanceProgression.percentChange > 0
                        ? '+'
                        : ''}
                      {analytics.cardio.distanceProgression.percentChange.toFixed(
                        1
                      )}
                      %
                    </Text>
                  </View>
                  {analytics.cardio.vo2MaxEstimate && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>VO₂ Max Estimate</Text>
                      <Text style={styles.metricValue}>
                        {analytics.cardio.vo2MaxEstimate.estimate.toFixed(1)}{' '}
                        ml/kg/min
                      </Text>
                      <Text style={styles.metricSubtext}>
                        {analytics.cardio.vo2MaxEstimate.category}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Strength Training Section */}
            {analytics.strength && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Strength Training</Text>
                <View style={styles.metricCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Monthly Volume</Text>
                    <Text style={styles.metricValue}>
                      {
                        analytics.strength.volumeProgression
                          .currentMonthlyVolume
                      }{' '}
                      reps
                    </Text>
                    <Text
                      style={[
                        styles.metricTrend,
                        analytics.strength.volumeProgression.trend ===
                          'increasing' && styles.metricTrendPositive,
                      ]}
                    >
                      {analytics.strength.volumeProgression.percentChange > 0
                        ? '+'
                        : ''}
                      {analytics.strength.volumeProgression.percentChange.toFixed(
                        1
                      )}
                      %
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Workout Density</Text>
                    <Text style={styles.metricValue}>
                      {analytics.strength.workoutDensity.avgRepsPerMinute.toFixed(
                        1
                      )}{' '}
                      reps/min
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Wellness Section */}
            {analytics.wellness && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wellness & Recovery</Text>
                <View style={styles.metricCard}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Meditation Streak</Text>
                    <Text style={styles.metricValue}>
                      {analytics.wellness.meditationConsistency.streak} days
                    </Text>
                    <Text style={styles.metricSubtext}>
                      Best:{' '}
                      {analytics.wellness.meditationConsistency.longestStreak}{' '}
                      days
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Session</Text>
                    <Text style={styles.metricValue}>
                      {Math.floor(
                        analytics.wellness.sessionDuration.avgDuration / 60
                      )}{' '}
                      min{' '}
                      {Math.round(
                        analytics.wellness.sessionDuration.avgDuration % 60
                      )}{' '}
                      sec
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Last Updated */}
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </Text>
          </>
        )}
      </ScrollView>

      {/* Privacy Notice Modal */}
      <PrivacyNoticeModal
        visible={showPrivacyModal}
        onClose={handlePrivacyClose}
        onAccept={handlePrivacyAccept}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: '#FF9D42',
    fontWeight: theme.typography.weights.medium,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  privacyNotice: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginBottom: 24,
  },

  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  privacyTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FFB366',
  },

  privacyText: {
    fontSize: 14,
    color: '#CC7A33',
    lineHeight: 20,
    marginBottom: 8,
  },

  privacyLink: {
    fontSize: 13,
    color: '#FF9D42',
    fontWeight: theme.typography.weights.medium,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FFB366',
    marginBottom: 16,
  },

  scoreCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },

  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF9D42' + '15',
    borderWidth: 3,
    borderColor: '#FF9D42',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scoreValue: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
  },

  scoreLabel: {
    fontSize: 14,
    color: '#CC7A33',
  },

  scoreDetails: {
    flex: 1,
  },

  categoryLabel: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },

  trendLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  categoryBreakdown: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    gap: 16,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  categoryName: {
    width: 80,
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FF9D42',
    borderRadius: 4,
  },

  categoryScore: {
    width: 40,
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
    textAlign: 'right',
  },

  recommendations: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginTop: 16,
  },

  recommendationsTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },

  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },

  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  metricCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    gap: 16,
  },

  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  metricLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginRight: 12,
  },

  metricTrend: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
  },

  metricTrendPositive: {
    color: '#4CAF50',
  },

  metricSubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
