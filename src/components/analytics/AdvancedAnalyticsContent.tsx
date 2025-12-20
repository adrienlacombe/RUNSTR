/**
 * AdvancedAnalyticsContent - Embeddable analytics content for Stats screen toggle
 * All calculations happen on-device using local workout data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../styles/theme';
import { PrivacyNoticeModal } from '../ui/PrivacyNoticeModal';
import localWorkoutStorage from '../../services/fitness/LocalWorkoutStorageService';
import type { LocalWorkout } from '../../services/fitness/LocalWorkoutStorageService';
import type { AnalyticsSummary, HealthProfile } from '../../types/analytics';
import { CardioPerformanceAnalytics } from '../../services/analytics/CardioPerformanceAnalytics';
import { BodyCompositionAnalytics } from '../../services/analytics/BodyCompositionAnalytics';
import { LevelCard } from './LevelCard';
import { CoachRunstrCard } from './CoachRunstrCard';
import { GoalsHabitsCard } from './GoalsHabitsCard';
import { CollapsibleAchievementsCard } from './CollapsibleAchievementsCard';
import { PersonalRecordsService } from '../../services/analytics/PersonalRecordsService';
import type { AllPersonalRecords } from '../../services/analytics/PersonalRecordsService';

const PRIVACY_NOTICE_KEY = '@runstr:analytics_privacy_accepted';
const HEALTH_PROFILE_KEY = '@runstr:health_profile';

interface AdvancedAnalyticsContentProps {
  onPrivacyDeclined?: () => void;
}

export const AdvancedAnalyticsContent: React.FC<AdvancedAnalyticsContentProps> = ({
  onPrivacyDeclined,
}) => {
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [workouts, setWorkouts] = useState<LocalWorkout[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [personalRecords, setPersonalRecords] = useState<AllPersonalRecords | null>(null);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  const initializeAnalytics = async () => {
    try {
      const privacyAccepted = await AsyncStorage.getItem(PRIVACY_NOTICE_KEY);

      if (!privacyAccepted) {
        setShowPrivacyModal(true);
        setLoading(false);
        return;
      }

      await loadAnalytics();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      console.log('[AdvancedAnalyticsContent] Loading analytics...');

      // Load health profile
      const profileData = await AsyncStorage.getItem(HEALTH_PROFILE_KEY);
      const profile: HealthProfile | null = profileData ? JSON.parse(profileData) : null;
      setHealthProfile(profile);

      // Get ALL local workouts
      const allWorkouts = await localWorkoutStorage.getAllWorkouts();
      console.log(`[AdvancedAnalyticsContent] Total workouts: ${allWorkouts.length}`);
      setWorkouts(allWorkouts);

      // Calculate analytics
      const cardioMetrics = profile
        ? CardioPerformanceAnalytics.calculateMetrics(allWorkouts, profile)
        : CardioPerformanceAnalytics.calculateMetrics(allWorkouts);

      const bodyComposition =
        profile && (profile.weight || profile.height)
          ? BodyCompositionAnalytics.calculateMetrics(profile, allWorkouts)
          : undefined;

      const prs = PersonalRecordsService.getAllPRs(allWorkouts);

      const summary: AnalyticsSummary = {
        cardio: cardioMetrics || undefined,
        bodyComposition: bodyComposition || undefined,
        lastUpdated: new Date().toISOString(),
      };

      setAnalytics(summary);
      setPersonalRecords(prs);
      setLoading(false);
    } catch (error) {
      console.error('[AdvancedAnalyticsContent] Failed to load analytics:', error);
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
    onPrivacyDeclined?.();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9D42" />
        <Text style={styles.loadingText}>Calculating analytics...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* RUNSTR Rank (Web of Trust) */}
        <LevelCard />

        {/* Achievements (Personal Records) */}
        {personalRecords && (
          <CollapsibleAchievementsCard personalRecords={personalRecords} />
        )}

        {/* Goals & Habits */}
        <GoalsHabitsCard />

        {/* COACH RUNSTR - AI-Powered Insights */}
        <CoachRunstrCard workouts={workouts} />

        {/* Last Updated */}
        {analytics && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          </Text>
        )}
      </ScrollView>

      {/* Privacy Notice Modal */}
      <PrivacyNoticeModal
        visible={showPrivacyModal}
        onClose={handlePrivacyClose}
        onAccept={handlePrivacyAccept}
      />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 48,
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
    padding: 12,
    paddingBottom: 80,
  },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AdvancedAnalyticsContent;
