/**
 * UnifiedWorkoutsTab - Single unified view of ALL workouts
 * Merges local workouts with Apple Health (iOS) / Health Connect (Android)
 * Shows source badges, conditional delete (local only), and background health sync
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../../styles/theme';
import { Card } from '../../ui/Card';
import { CustomAlert } from '../../ui/CustomAlert';
import { EnhancedWorkoutCard } from '../shared/EnhancedWorkoutCard';
import {
  MonthlyWorkoutGroup,
  groupWorkoutsByMonth,
} from '../shared/MonthlyWorkoutGroup';
import localWorkoutStorage from '../../../services/fitness/LocalWorkoutStorageService';
import healthKitService from '../../../services/fitness/healthKitService';
import healthConnectService from '../../../services/fitness/healthConnectService';
import { mergeWorkoutsWithDeduplication } from '../../../utils/unifiedWorkoutMerge';
import type { LocalWorkout } from '../../../services/fitness/LocalWorkoutStorageService';
import type { Workout } from '../../../types/workout';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

interface UnifiedWorkoutsTabProps {
  userId: string;
  pubkey?: string;
  onRefresh?: () => void;
  onPostToNostr?: (workout: LocalWorkout) => Promise<void>;
  onPostToSocial?: (workout: LocalWorkout) => Promise<void>;
  onCompeteHealthApp?: (workout: Workout) => Promise<void>;
  onSocialShareHealthApp?: (workout: Workout) => Promise<void>;
}

export const UnifiedWorkoutsTab: React.FC<UnifiedWorkoutsTabProps> = ({
  userId,
  onRefresh,
  onPostToNostr,
  onPostToSocial,
  onCompeteHealthApp,
  onSocialShareHealthApp,
}) => {
  // Local workout state
  const [localWorkouts, setLocalWorkouts] = useState<LocalWorkout[]>([]);
  // Merged workouts for display
  const [mergedWorkouts, setMergedWorkouts] = useState<Workout[]>([]);
  // Track local workout IDs for conditional actions
  const [localWorkoutIds, setLocalWorkoutIds] = useState<Set<string>>(new Set());

  // Health app state
  const [healthWorkouts, setHealthWorkouts] = useState<Workout[]>([]);
  const [healthPermission, setHealthPermission] = useState(false);
  const [healthAvailable, setHealthAvailable] = useState(false);
  const [isHealthSyncing, setIsHealthSyncing] = useState(false);
  const [permissionDismissed, setPermissionDismissed] = useState(false);

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postingWorkoutId, setPostingWorkoutId] = useState<string | null>(null);
  const [postingType, setPostingType] = useState<'social' | 'nostr' | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  // Load local workouts instantly on mount
  useEffect(() => {
    loadLocalWorkouts();
    checkHealthPermission();
  }, []);

  // Merge workouts whenever local or health workouts change
  useEffect(() => {
    const result = mergeWorkoutsWithDeduplication(localWorkouts, healthWorkouts, userId);
    setMergedWorkouts(result.workouts);

    // Track local workout IDs
    const ids = new Set(localWorkouts.map((w) => w.id));
    setLocalWorkoutIds(ids);

    if (result.duplicatesRemoved > 0) {
      console.log(`[UnifiedWorkouts] Removed ${result.duplicatesRemoved} duplicates`);
    }
  }, [localWorkouts, healthWorkouts, userId]);

  /**
   * Load local workouts from AsyncStorage (instant)
   */
  const loadLocalWorkouts = async () => {
    try {
      console.log('[UnifiedWorkouts] Loading local workouts...');
      const allLocalWorkouts = await localWorkoutStorage.getAllWorkouts();
      console.log(`[UnifiedWorkouts] Loaded ${allLocalWorkouts.length} local workouts`);
      setLocalWorkouts(allLocalWorkouts);
    } catch (error) {
      console.error('[UnifiedWorkouts] Failed to load local workouts:', error);
      setLocalWorkouts([]);
    }
  };

  /**
   * Check health app permission status (without triggering prompt)
   */
  const checkHealthPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = healthKitService.getStatus();
        setHealthAvailable(status.available);
        if (status.authorized) {
          setHealthPermission(true);
          // Load health workouts in background
          loadHealthWorkouts(false);
        }
      } else if (Platform.OS === 'android') {
        const status = healthConnectService.getStatus();
        setHealthAvailable(status.available);
        if (status.authorized) {
          setHealthPermission(true);
          loadHealthWorkouts(false);
        }
      }
    } catch (error) {
      console.error('[UnifiedWorkouts] Error checking health permission:', error);
    }
  };

  /**
   * Load health app workouts (background by default)
   */
  const loadHealthWorkouts = async (showLoading: boolean = false) => {
    if (showLoading) {
      setIsHealthSyncing(true);
    }

    try {
      let workouts: Workout[] = [];

      if (Platform.OS === 'ios') {
        // Try cached first for instant display
        const cached = await healthKitService.getCachedWorkouts();
        if (cached && cached.length > 0) {
          workouts = transformHealthKitWorkouts(cached);
          setHealthWorkouts(workouts);
        }

        // Fetch fresh in background
        const fresh = await healthKitService.getRecentWorkouts(userId, 30);
        if (fresh) {
          workouts = fresh;
          setHealthWorkouts(workouts);
        }
      } else if (Platform.OS === 'android') {
        // Try cached first
        const cached = await healthConnectService.getCachedWorkouts();
        if (cached && cached.length > 0) {
          workouts = transformHealthConnectWorkouts(cached);
          setHealthWorkouts(workouts);
        }

        // Fetch fresh
        const fresh = await healthConnectService.getRecentWorkouts(userId, 30);
        if (fresh) {
          workouts = fresh;
          setHealthWorkouts(workouts);
        }
      }

      console.log(`[UnifiedWorkouts] Loaded ${workouts.length} health workouts`);
    } catch (error) {
      console.error('[UnifiedWorkouts] Failed to load health workouts:', error);
    } finally {
      setIsHealthSyncing(false);
    }
  };

  /**
   * Transform HealthKit workouts to Workout interface
   */
  const transformHealthKitWorkouts = (cached: any[]): Workout[] => {
    return cached.map((workout) => ({
      id: workout.UUID || workout.id || `hk_${Date.now()}`,
      userId: userId,
      type: (workout.activityType || 'running') as Workout['type'],
      source: 'healthkit' as const,
      duration: workout.duration,
      distance: workout.totalDistance || 0,
      calories: workout.totalEnergyBurned || 0,
      startTime: workout.startDate,
      endTime: workout.endDate,
      syncedAt: new Date().toISOString(),
      metadata: {
        sourceApp: workout.sourceName,
        healthKitId: workout.UUID,
      },
    }));
  };

  /**
   * Transform Health Connect workouts to Workout interface
   */
  const transformHealthConnectWorkouts = (cached: any[]): Workout[] => {
    return cached.map((workout) => ({
      id: workout.id,
      userId: userId,
      type: (workout.activityType || 'running') as Workout['type'],
      source: 'health_connect' as const,
      duration: workout.duration,
      distance: workout.totalDistance || 0,
      calories: workout.totalEnergyBurned || 0,
      startTime: workout.startTime,
      endTime: workout.endTime,
      syncedAt: new Date().toISOString(),
      steps: workout.steps,
      metadata: {
        sourceApp: workout.sourceName,
        healthConnectId: workout.id,
      },
    }));
  };

  /**
   * Request health app permission (user-initiated)
   */
  const handleConnectHealth = async () => {
    const healthAppName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

    try {
      if (Platform.OS === 'ios') {
        // Check if HealthKit is actually available first
        const quickStatus = healthKitService.getStatus();
        if (!quickStatus.available) {
          Toast.show({
            type: 'error',
            text1: 'Not Available',
            text2: 'Apple Health is not available on this device',
          });
          return;
        }

        const result = await healthKitService.requestPermissions();
        if (!result.success) {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: result.error || 'Could not access Apple Health',
          });
          return;
        }

        // Try to actually load workouts to verify it works
        setHealthPermission(true);
        await loadHealthWorkouts(true);

        // Show success - errors would have been caught
        Toast.show({
          type: 'success',
          text1: 'Connected',
          text2: 'Apple Health synced',
        });
      } else if (Platform.OS === 'android') {
        const quickStatus = healthConnectService.getStatus();
        if (!quickStatus.available) {
          Toast.show({
            type: 'error',
            text1: 'Not Available',
            text2: 'Health Connect is not available on this device',
          });
          return;
        }

        const result = await healthConnectService.requestPermissions();
        if (!result.success) {
          Toast.show({
            type: 'error',
            text1: 'Permission Denied',
            text2: result.error || 'Could not access Health Connect',
          });
          return;
        }

        setHealthPermission(true);
        await loadHealthWorkouts(true);

        Toast.show({
          type: 'success',
          text1: 'Connected',
          text2: 'Health Connect synced',
        });
      }
    } catch (error) {
      console.error('[UnifiedWorkouts] Permission request failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: `Could not connect to ${healthAppName}`,
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadLocalWorkouts();
      if (healthPermission) {
        await loadHealthWorkouts(false);
      }
      onRefresh?.();
    } catch (error) {
      console.error('[UnifiedWorkouts] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Post local workout to Nostr (kind 1301)
   */
  const handlePostToNostr = async (workout: LocalWorkout) => {
    if (!onPostToNostr) return;

    try {
      setPostingWorkoutId(workout.id);
      setPostingType('nostr');
      await onPostToNostr(workout);
      await loadLocalWorkouts();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Workout submitted!',
      });
    } catch (error) {
      console.error('[UnifiedWorkouts] Post to Nostr failed:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to post workout',
        buttons: [{ text: 'OK', style: 'default' }],
      });
      setAlertVisible(true);
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  /**
   * Post local workout to social (kind 1)
   */
  const handlePostToSocial = async (workout: LocalWorkout) => {
    if (!onPostToSocial) return;

    try {
      setPostingWorkoutId(workout.id);
      setPostingType('social');
      await onPostToSocial(workout);
    } catch (error) {
      console.error('[UnifiedWorkouts] Post to social failed:', error);
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  /**
   * Compete with health app workout (kind 1301)
   */
  const handleCompeteHealthApp = async (workout: Workout) => {
    if (!onCompeteHealthApp) return;

    try {
      setPostingWorkoutId(workout.id);
      setPostingType('nostr');
      await onCompeteHealthApp(workout);
    } catch (error) {
      console.error('[UnifiedWorkouts] Health compete failed:', error);
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  /**
   * Social share health app workout (kind 1)
   */
  const handleSocialShareHealthApp = async (workout: Workout) => {
    if (!onSocialShareHealthApp) return;

    try {
      setPostingWorkoutId(workout.id);
      setPostingType('social');
      await onSocialShareHealthApp(workout);
    } catch (error) {
      console.error('[UnifiedWorkouts] Health social share failed:', error);
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  /**
   * Delete local workout
   */
  const handleDeleteWorkout = async (workoutId: string) => {
    setAlertConfig({
      title: 'Delete Workout',
      message: 'Are you sure? This cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await localWorkoutStorage.deleteWorkout(workoutId);
              await loadLocalWorkouts();
              console.log(`[UnifiedWorkouts] Deleted workout ${workoutId}`);
            } catch (error) {
              console.error('[UnifiedWorkouts] Delete failed:', error);
            }
          },
        },
      ],
    });
    setAlertVisible(true);
  };

  // Group workouts by month
  const monthlyGroups = groupWorkoutsByMonth(mergedWorkouts);

  /**
   * Render individual workout with conditional actions
   */
  const renderWorkout = useCallback(
    (workout: Workout) => {
      const isLocal = localWorkoutIds.has(workout.id);
      const isHealthSource =
        workout.source === 'healthkit' || workout.source === 'health_connect';
      const canDelete = isLocal && !isHealthSource;
      const isPosting = postingWorkoutId === workout.id;

      // Find original local workout for callbacks
      const localWorkout = localWorkouts.find((w) => w.id === workout.id);

      return (
        <View style={styles.workoutContainer}>
          <EnhancedWorkoutCard workout={workout} hideActions={true} />

          <View style={styles.workoutActions}>
            {/* Share button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.postButton]}
              onPress={() => {
                if (isLocal && localWorkout) {
                  handlePostToSocial(localWorkout);
                } else {
                  handleSocialShareHealthApp(workout);
                }
              }}
              disabled={isPosting && postingType === 'social'}
            >
              {isPosting && postingType === 'social' ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="bookmark-outline" size={16} color="#000" />
                  <Text style={styles.postButtonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Compete button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.publicButton]}
              onPress={() => {
                if (isLocal && localWorkout) {
                  handlePostToNostr(localWorkout);
                } else {
                  handleCompeteHealthApp(workout);
                }
              }}
              disabled={isPosting && postingType === 'nostr'}
            >
              {isPosting && postingType === 'nostr' ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={16} color="#000" />
                  <Text style={styles.publicButtonText}>Compete</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Delete button - only for local non-health workouts */}
            {canDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteWorkout(workout.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.colors.accent}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [localWorkoutIds, localWorkouts, postingWorkoutId, postingType]
  );

  const renderMonthlyGroup = ({ item }: { item: any }) => (
    <MonthlyWorkoutGroup
      group={item}
      renderWorkout={renderWorkout}
      defaultExpanded={false}
    />
  );

  const healthAppName = Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect';

  return (
    <View style={styles.container}>
      {/* Health permission banner */}
      {healthAvailable && !healthPermission && !permissionDismissed && (
        <TouchableOpacity
          style={styles.permissionBanner}
          onPress={handleConnectHealth}
        >
          <Text style={styles.bannerText}>
            Sync {healthAppName}
          </Text>
          <View style={styles.bannerRight}>
            {isHealthSyncing ? (
              <ActivityIndicator size="small" color={theme.colors.textMuted} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textMuted}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={(e) => {
              e.stopPropagation();
              setPermissionDismissed(true);
            }}
          >
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <FlatList
        data={monthlyGroups}
        renderItem={renderMonthlyGroup}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.text}
          />
        }
        ListFooterComponent={
          <>
            {mergedWorkouts.length > 0 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {mergedWorkouts.length} workout
                  {mergedWorkouts.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.footerSubtext}>
                  {localWorkouts.length} local
                  {healthWorkouts.length > 0 &&
                    ` + ${healthWorkouts.length} from ${healthAppName}`}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <Card style={styles.emptyState}>
            <Ionicons
              name="fitness-outline"
              size={64}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyStateTitle}>No Workouts Yet</Text>
            <Text style={styles.emptyStateText}>
              Use the Activity Tracker to record workouts
              {healthAvailable && !healthPermission
                ? `, or connect ${healthAppName} to import your workout history.`
                : '.'}
            </Text>
          </Card>
        }
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 10,
  },
  bannerText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
  bannerRight: {
    marginRight: 8,
  },
  dismissButton: {
    padding: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
  },
  footerSubtext: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  workoutContainer: {
    marginBottom: 12,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  postButton: {
    backgroundColor: '#FF9D42',
    flex: 1.5,
  },
  postButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
  },
  publicButton: {
    backgroundColor: '#FF9D42',
    flex: 1.5,
  },
  publicButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
  },
  deleteButton: {
    backgroundColor: theme.colors.accent + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
    margin: 16,
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
