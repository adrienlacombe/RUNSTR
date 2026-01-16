/**
 * WorkoutHistoryScreen - Workout History View
 * Local Tab: Local Activity Tracker workouts (zero loading time)
 * Apple Health Tab: HealthKit workouts with post buttons (iOS)
 * Health Connect Tab: Health Connect workouts (Android)
 *
 * Tabs are displayed in the header row next to the back button.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomAlertManager } from '../components/ui/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { WorkoutPublishingService } from '../services/nostr/workoutPublishingService';
import localWorkoutStorage from '../services/fitness/LocalWorkoutStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnifiedSigningService } from '../services/auth/UnifiedSigningService';
import { nostrProfileService } from '../services/nostr/NostrProfileService';
import type { NostrProfile } from '../services/nostr/NostrProfileService';
import Toast from 'react-native-toast-message';

// Rewards & Steps
import { TotalRewardsCard } from '../components/rewards/TotalRewardsCard';
import { DailyRewardService } from '../services/rewards/DailyRewardService';
import { StepRewardService } from '../services/rewards/StepRewardService';
import { dailyStepCounterService } from '../services/activity/DailyStepCounterService';
import type { PublishableWorkout } from '../services/nostr/workoutPublishingService';

// UI Components
import { LoadingOverlay } from '../components/ui/LoadingStates';
import { Ionicons } from '@expo/vector-icons';
import { EnhancedSocialShareModal } from '../components/profile/shared/EnhancedSocialShareModal';

// Unified Workout Components
import { WorkoutTabNavigator } from '../components/profile/WorkoutTabNavigator';

// Import type from the service file (not from the default export)
import type { LocalWorkout } from '../services/fitness/LocalWorkoutStorageService';
import { inferActivityTypeSimple } from '../utils/activityInference';

interface WorkoutHistoryScreenProps {
  route?: {
    params?: {
      userId?: string;
      pubkey?: string;
    };
  };
}

export const WorkoutHistoryScreen: React.FC<WorkoutHistoryScreenProps> = ({
  route,
}) => {
  const navigation = useNavigation<any>();
  const [pubkey, setPubkey] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  // Note: signer is no longer cached in state - we get a fresh signer at publish time
  // to ensure we're using current auth after sign out/sign in
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<NostrProfile | null>(null);

  // Activity stats state (for TotalRewardsCard)
  const [workouts, setWorkouts] = useState<LocalWorkout[]>([]);
  const [weeklyRewardsEarned, setWeeklyRewardsEarned] = useState(0);
  const [stepTodaySats, setStepTodaySats] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [isPublishingSteps, setIsPublishingSteps] = useState(false);
  const [showStepSocialModal, setShowStepSocialModal] = useState(false);
  const [stepWorkoutForPost, setStepWorkoutForPost] = useState<PublishableWorkout | null>(null);

  // Services - localWorkoutStorage is already a singleton instance
  const publishingService = WorkoutPublishingService.getInstance();

  // Load user credentials on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('[WorkoutHistory] Loading user data...');

      // Try to get from route params first
      let activePubkey = route?.params?.pubkey || '';
      let activeUserId = route?.params?.userId || '';

      // Fallback to AsyncStorage if not in params
      if (!activePubkey) {
        const storedNpub = await AsyncStorage.getItem('@runstr:npub');
        const storedHexPubkey = await AsyncStorage.getItem(
          '@runstr:hex_pubkey'
        );
        activePubkey = storedHexPubkey || storedNpub || '';
        console.log(
          '[WorkoutHistory] Loaded pubkey from storage:',
          activePubkey?.slice(0, 20) + '...'
        );
      }

      if (!activeUserId) {
        activeUserId = activePubkey; // Use pubkey as userId fallback
      }

      setPubkey(activePubkey);
      setUserId(activeUserId);

      // Note: Signer is now loaded fresh at publish time (not cached here)
      // This ensures we always use current auth state after sign out/sign in
      console.log('[WorkoutHistory] ✅ User data loaded (signer loaded at publish time)');
    } catch (error) {
      console.error('[WorkoutHistory] ❌ Failed to load user data:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Load user profile in background (non-blocking, for social cards only)
  useEffect(() => {
    if (pubkey) {
      console.log('[WorkoutHistory] Loading profile in background...');
      nostrProfileService
        .getProfile(pubkey)
        .then((profile) => {
          setUserProfile(profile);
          console.log('[WorkoutHistory] ✅ User profile loaded (background)');
        })
        .catch((profileError) => {
          console.warn(
            '[WorkoutHistory] Failed to load profile (background):',
            profileError
          );
        });
    }
  }, [pubkey]);

  /**
   * Load activity stats data (workouts, rewards, steps)
   */
  const loadActivityStats = async (checkMilestones: boolean = false) => {
    try {
      // Load workouts for streak calculation
      const allWorkouts = await localWorkoutStorage.getAllWorkouts();
      setWorkouts(allWorkouts);

      // Get current steps from device
      const stepData = await dailyStepCounterService.getTodaySteps();
      const steps = stepData?.steps ?? 0;
      setCurrentSteps(steps);

      // Load rewards and step stats if we have pubkey
      if (pubkey) {
        const weeklyRewards = await DailyRewardService.getWeeklyRewardsEarned(pubkey);
        setWeeklyRewardsEarned(weeklyRewards);

        const stats = await StepRewardService.getStats(pubkey);
        setStepTodaySats(stats.todaySats);

        // Check and reward new milestones if requested
        if (checkMilestones && steps > 0) {
          await StepRewardService.checkAndRewardMilestones(steps, pubkey);
          const updatedStats = await StepRewardService.getStats(pubkey);
          setStepTodaySats(updatedStats.todaySats);
        }
      }
    } catch (error) {
      console.error('[WorkoutHistory] Error loading activity stats:', error);
    }
  };

  // Periodic step polling while screen is active
  useFocusEffect(
    useCallback(() => {
      // Initial load with milestone check
      loadActivityStats(true);

      // Poll every 30 seconds while screen is focused
      const interval = setInterval(() => {
        loadActivityStats(true);
      }, 30000);

      return () => clearInterval(interval);
    }, [pubkey])
  );

  /**
   * Create a synthetic walking workout from current step count
   */
  const createStepWorkout = async (): Promise<PublishableWorkout | null> => {
    if (!pubkey) return null;

    const now = new Date();

    return {
      id: `steps_${now.toISOString().split('T')[0]}_${Date.now()}`,
      userId: pubkey,
      type: 'walking',
      source: 'manual',
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      duration: 0,
      distance: 0,
      calories: 0,
      syncedAt: now.toISOString(),
      metadata: {
        steps: currentSteps,
      },
      unitSystem: 'metric',
    };
  };

  /**
   * Open social share modal for steps
   */
  const handleStepShare = async () => {
    const stepWorkout = await createStepWorkout();
    if (stepWorkout) {
      setStepWorkoutForPost(stepWorkout);
      setShowStepSocialModal(true);
    }
  };

  /**
   * Publish today's steps as a kind 1301 walking workout event (competition entry)
   */
  const handleStepCompete = async () => {
    setIsPublishingSteps(true);
    try {
      const freshSigner = await UnifiedSigningService.getInstance().getSigner();
      if (!freshSigner) {
        throw new Error('No signer available');
      }

      const stepWorkout = await createStepWorkout();
      if (!stepWorkout) {
        throw new Error('No user pubkey found');
      }

      const result = await publishingService.saveWorkoutToNostr(
        stepWorkout,
        freshSigner,
        stepWorkout.userId
      );

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Steps Published!',
          text2: `${currentSteps.toLocaleString()} steps entered into competition`,
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        throw new Error(result.error || 'Failed to publish');
      }
    } catch (error) {
      console.error('[WorkoutHistory] Step compete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Publish Failed',
        text2: error instanceof Error ? error.message : 'Could not publish steps',
        position: 'top',
      });
    } finally {
      setIsPublishingSteps(false);
    }
  };

  /**
   * Handle posting a HealthKit workout to Nostr as kind 1301 competition entry
   */
  const handleCompeteHealthKit = async (workout: any) => {
    try {
      console.log(
        `[WorkoutHistory] Entering HealthKit workout ${workout.id} into competition...`
      );

      // Get fresh signer to ensure we're using current auth (not stale cached state)
      const freshSigner = await UnifiedSigningService.getInstance().getSigner();
      if (!freshSigner) {
        CustomAlertManager.alert(
          'Error',
          'Not authenticated. Please sign in again.'
        );
        return;
      }

      // Convert HealthKit workout to PublishableWorkout format
      // Use workout type or infer from metrics (never 'other' for cardio)
      const workoutType = workout.type || inferActivityTypeSimple({
        distance: workout.distance,
        duration: workout.duration,
        steps: workout.steps,
      });
      const publishableWorkout = {
        id: workout.id,
        userId: userId,
        source: 'healthkit' as const,
        type: workoutType,
        duration: workout.duration, // Already in seconds from HealthKit
        distance: workout.distance || 0,
        calories: workout.calories || 0,
        startTime: workout.startTime,
        endTime: workout.endTime,
        syncedAt: new Date().toISOString(),
        metadata: {
          sourceApp: 'Apple Health',
        },
      };

      // Publish to Nostr as kind 1301 competition entry
      const result = await publishingService.saveWorkoutToNostr(
        publishableWorkout,
        freshSigner,
        userId
      );

      if (result.success && result.eventId) {
        console.log(
          `[WorkoutHistory] ✅ HealthKit workout entered as kind 1301: ${result.eventId}`
        );

        // Show reward earned notification if applicable
        if (result.rewardEarned && result.rewardAmount) {
          CustomAlertManager.alert(
            '🎉 Reward Earned!',
            `You earned ${result.rewardAmount} sats for today's workout!`
          );
        } else {
          CustomAlertManager.alert(
            'Success',
            'Workout entered into competition!'
          );
        }
      } else {
        throw new Error(result.error || 'Failed to publish workout');
      }
    } catch (error) {
      console.error('[WorkoutHistory] ❌ Competition entry failed:', error);
      // Re-throw so parent tab knows the operation failed
      throw error;
    }
  };

  /**
   * Handle posting a HealthKit workout to social feeds as kind 1
   * Opens the EnhancedSocialShareModal for template selection
   */
  const handleSocialShareHealthKit = async (workout: any) => {
    console.log(
      `[WorkoutHistory] Opening social share modal for HealthKit workout ${workout.id}...`
    );
    setSelectedWorkout(workout);
    setShowSocialModal(true);
  };

  /**
   * Handle posting a Health Connect workout to Nostr as kind 1301 competition entry
   */
  const handleCompeteHealthConnect = async (workout: any) => {
    try {
      console.log(
        `[WorkoutHistory] Entering Health Connect workout ${workout.id} into competition...`
      );

      // Get fresh signer to ensure we're using current auth (not stale cached state)
      const freshSigner = await UnifiedSigningService.getInstance().getSigner();
      if (!freshSigner) {
        CustomAlertManager.alert(
          'Error',
          'Not authenticated. Please sign in again.'
        );
        return;
      }

      // Convert Health Connect workout to PublishableWorkout format
      // Use workout type or infer from metrics (never 'other' for cardio)
      const workoutType = workout.type || inferActivityTypeSimple({
        distance: workout.distance,
        duration: workout.duration,
        steps: workout.steps,
      });
      const publishableWorkout = {
        id: workout.id,
        userId: userId,
        source: 'health_connect' as const,
        type: workoutType,
        duration: workout.duration, // Already in seconds from Health Connect
        distance: workout.distance || 0,
        calories: workout.calories || 0,
        startTime: workout.startTime,
        endTime: workout.endTime,
        syncedAt: new Date().toISOString(),
        metadata: {
          sourceApp: workout.metadata?.sourceApp || 'Health Connect',
        },
      };

      // Publish to Nostr as kind 1301 competition entry
      const result = await publishingService.saveWorkoutToNostr(
        publishableWorkout,
        freshSigner,
        userId
      );

      if (result.success && result.eventId) {
        console.log(
          `[WorkoutHistory] ✅ Health Connect workout entered as kind 1301: ${result.eventId}`
        );

        // Show reward earned notification if applicable
        if (result.rewardEarned && result.rewardAmount) {
          CustomAlertManager.alert(
            '🎉 Reward Earned!',
            `You earned ${result.rewardAmount} sats for today's workout!`
          );
        } else {
          CustomAlertManager.alert(
            'Success',
            'Workout entered into competition!'
          );
        }
      } else {
        throw new Error(result.error || 'Failed to publish workout');
      }
    } catch (error) {
      console.error(
        '[WorkoutHistory] ❌ Health Connect competition entry failed:',
        error
      );
      // Re-throw so parent tab knows the operation failed
      throw error;
    }
  };

  /**
   * Handle posting a Health Connect workout to social feeds as kind 1
   * Opens the enhanced social share modal
   */
  const handleSocialShareHealthConnect = async (workout: any) => {
    console.log(
      `[WorkoutHistory] Opening social share modal for Health Connect workout ${workout.id}...`
    );
    setSelectedWorkout(workout);
    setShowSocialModal(true);
  };

  /**
   * Handle posting a local workout to Nostr as kind 1 social event
   * Opens enhanced social share modal with image generation
   */
  const handlePostToSocial = async (workout: LocalWorkout) => {
    console.log(
      `[WorkoutHistory] Opening social share modal for workout ${workout.id}...`
    );
    setSelectedWorkout(workout);
    setShowSocialModal(true);
  };

  /**
   * Handle posting a local workout to Nostr as kind 1301 event
   * Saves workout data for competitions
   */
  const handlePostToNostr = async (workout: LocalWorkout) => {
    try {
      console.log(
        `[WorkoutHistory] Posting workout ${workout.id} as kind 1301...`
      );

      // Get fresh signer to ensure we're using current auth (not stale cached state)
      const freshSigner = await UnifiedSigningService.getInstance().getSigner();
      if (!freshSigner) {
        CustomAlertManager.alert(
          'Error',
          'Not authenticated. Please sign in again.'
        );
        return;
      }

      // Convert LocalWorkout to PublishableWorkout format
      const { splits, ...workoutData } = workout;

      const publishableWorkout = {
        ...workoutData,
        id: workout.id,
        userId: userId,
        source: 'manual' as const,
        type: workout.type,
        duration: workout.duration, // Keep in seconds for kind 1301
        distance: workout.distance,
        calories: workout.calories,
        startTime: workout.startTime,
        endTime: workout.endTime,
        syncedAt: workout.syncedAt || new Date().toISOString(),
      };

      // Publish to Nostr as kind 1301 workout event
      const result = await publishingService.saveWorkoutToNostr(
        publishableWorkout,
        freshSigner,
        userId
      );

      if (result.success && result.eventId) {
        console.log(
          `[WorkoutHistory] ✅ Workout published as kind 1301: ${result.eventId}`
        );

        // Mark workout as synced - IT WILL DISAPPEAR FROM PRIVATE TAB
        await localWorkoutStorage.markAsSynced(workout.id, result.eventId);
        console.log(`[WorkoutHistory] ✅ Workout marked as synced`);

        // Success alert handled by child component (PrivateWorkoutsTab)
      } else {
        throw new Error(result.error || 'Failed to publish workout');
      }
    } catch (error) {
      console.error('[WorkoutHistory] ❌ Post to Nostr (1301) failed:', error);
      // Re-throw so PrivateWorkoutsTab knows the operation failed
      // (it shows its own error alert via catch block)
      throw error;
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleNavigateToAnalytics = () => {
    navigation.navigate('AdvancedAnalytics' as any);
  };

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingOverlay message="Loading..." visible={true} />
      </SafeAreaView>
    );
  }

  if (!pubkey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.errorTitle}>No User Found</Text>
          <Text style={styles.errorMessage}>
            Please log in to view your workouts
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleGoBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
      </View>

      {/* Activity Stats Card - YOUR ACTIVITY */}
      <View style={styles.activityCardContainer}>
        <TotalRewardsCard
          workouts={workouts}
          weeklyRewardsEarned={weeklyRewardsEarned}
          stepRewardsEarned={stepTodaySats}
          currentSteps={currentSteps}
          onShare={handleStepShare}
          onCompete={handleStepCompete}
          isPublishing={isPublishingSteps}
        />
      </View>

      {/* Unified Workout List - all sources merged into one view */}
      <WorkoutTabNavigator
        userId={userId}
        pubkey={pubkey}
        onPostToNostr={handlePostToNostr}
        onPostToSocial={handlePostToSocial}
        onCompeteHealthKit={handleCompeteHealthKit}
        onSocialShareHealthKit={handleSocialShareHealthKit}
        onCompeteHealthConnect={handleCompeteHealthConnect}
        onSocialShareHealthConnect={handleSocialShareHealthConnect}
        onNavigateToAnalytics={handleNavigateToAnalytics}
      />

      {/* Enhanced Social Share Modal */}
      <EnhancedSocialShareModal
        visible={showSocialModal}
        workout={selectedWorkout}
        userId={userId}
        userAvatar={userProfile?.picture}
        userName={userProfile?.name || userProfile?.display_name}
        onClose={() => {
          setShowSocialModal(false);
          setSelectedWorkout(null);
        }}
        onSuccess={() => {
          setShowSocialModal(false);
          setSelectedWorkout(null);
          // Success alert handled by child component (PrivateWorkoutsTab)
        }}
      />

      {/* Step Social Share Modal */}
      {stepWorkoutForPost && (
        <EnhancedSocialShareModal
          visible={showStepSocialModal}
          workout={stepWorkoutForPost}
          userId={stepWorkoutForPost.userId}
          userAvatar={userProfile?.picture}
          userName={userProfile?.name || userProfile?.display_name}
          onClose={() => {
            setShowStepSocialModal(false);
            setStepWorkoutForPost(null);
          }}
        />
      )}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    marginLeft: 8,
  },

  activityCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  errorButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },

  errorButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.accentText,
  },
});
