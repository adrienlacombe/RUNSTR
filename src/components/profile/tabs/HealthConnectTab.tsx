/**
 * HealthConnectTab - Android Health Connect workout display
 * Shows last 30 days of Health Connect workouts - mirrors AppleHealthTab
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { CustomAlertManager } from '../../ui/CustomAlert';
import { theme } from '../../../styles/theme';
import { Card } from '../../ui/Card';
import { LoadingOverlay } from '../../ui/LoadingStates';
import { WorkoutCard } from '../shared/WorkoutCard';
import healthConnectService, { type HealthConnectDebugInfo } from '../../../services/fitness/healthConnectService';
import type { Workout } from '../../../types/workout';
import { inferActivityTypeSimple } from '../../../utils/activityInference';
import { Ionicons } from '@expo/vector-icons';

interface HealthConnectTabProps {
  userId: string;
  onCompete?: (workout: Workout) => Promise<void>;
  onSocialShare?: (workout: Workout) => Promise<void>;
}

const HealthConnectTabContent: React.FC<HealthConnectTabProps> = ({
  userId,
  onCompete,
  onSocialShare,
}) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [sdkAvailable, setSdkAvailable] = useState<boolean | null>(null);

  // Button loading state - tracks which workout is being processed
  const [postingWorkoutId, setPostingWorkoutId] = useState<string | null>(null);
  const [postingType, setPostingType] = useState<'post' | 'compete' | null>(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<HealthConnectDebugInfo | null>(null);
  const [debugExpanded, setDebugExpanded] = useState(false);

  useEffect(() => {
    // Only check status on mount, don't auto-request permissions
    checkPermissionStatus();
    // Fetch debug info
    fetchDebugInfo();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // First check if Health Connect is available
      const quickStatus = healthConnectService.getStatus();
      if (!quickStatus.available) {
        console.log('Health Connect not available on this device');
        setIsLoading(false);
        return;
      }

      // Check SDK availability (Android 14+ or Health Connect app installed)
      const status = await healthConnectService.getStatusWithRealCheck();
      setSdkAvailable(status.sdkAvailable);

      if (!status.sdkAvailable) {
        console.log('Health Connect SDK not available - need Android 14+');
        setIsLoading(false);
        return;
      }

      if (status.authorized) {
        // Already authorized
        setHasPermission(true);

        // Load cached workouts immediately for instant display
        const cached = await healthConnectService.getCachedWorkouts();
        if (cached && cached.length > 0) {
          // Transform cached data to UI format matching Workout interface
          const transformedWorkouts: Workout[] = cached.map((workout) => {
            // Use activityType from service, or infer from metrics if missing
            const activityType = workout.activityType || inferActivityTypeSimple({
              distance: workout.totalDistance,
              duration: workout.duration,
              steps: workout.steps,
              heartRate: workout.heartRate,
            });
            return {
              id: workout.id,
              userId: userId,
              type: activityType as Workout['type'],
              source: 'health_connect' as const,
              duration: workout.duration,
              distance: workout.totalDistance || 0,
              calories: workout.totalEnergyBurned || 0,
              startTime: workout.startTime,
              endTime: workout.endTime,
              syncedAt: new Date().toISOString(),
              steps: workout.steps,
              heartRate: workout.heartRate,
              metadata: {
                sourceApp: workout.sourceName,
                originalExerciseType: workout.exerciseType,
                healthConnectId: workout.id,
                syncedVia: 'health_connect_service',
              },
            };
          });
          setWorkouts(transformedWorkouts);
          setIsLoading(false);

          // Fetch fresh data in background (don't show loading spinner)
          loadHealthConnectWorkouts(false);
        } else {
          // No cache, fetch with loading state
          await loadHealthConnectWorkouts(true);
        }
      } else {
        // Not authorized - just update state, don't auto-request
        console.log('Health Connect not authorized - showing connect button');
        setHasPermission(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking Health Connect permission:', error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const info = await healthConnectService.getDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    }
  };

  const copyDebugInfo = async () => {
    if (!debugInfo) return;

    const text = `RUNSTR Health Connect Debug
========================
Provider: ${debugInfo.provider || 'Not detected'}
SDK Status: ${debugInfo.sdkStatus} (${debugInfo.sdkStatusText})
Sessions Found: ${debugInfo.exerciseSessionsFound}
Exercise Types: [${debugInfo.exerciseTypesFound.join(', ') || 'None'}]
Date Range: ${debugInfo.dateRangeQueried ? `${debugInfo.dateRangeQueried.start} to ${debugInfo.dateRangeQueried.end}` : 'Not queried'}
Permissions: ExerciseSession=${debugInfo.permissions.exerciseSession}, Steps=${debugInfo.permissions.steps}, HR=${debugInfo.permissions.heartRate}, Dist=${debugInfo.permissions.distance}, Cal=${debugInfo.permissions.calories}
Error: ${debugInfo.lastError || 'None'}
Time: ${debugInfo.timestamp}
Version: ${debugInfo.appVersion}`;

    await Clipboard.setStringAsync(text);
    CustomAlertManager.alert('Copied', 'Debug info copied to clipboard');
  };

  const handleConnectHealthConnect = async () => {
    // Manual permission request triggered by user action
    await requestPermission();
  };

  const requestPermission = async () => {
    try {
      setPermissionRequested(true);
      console.log('Requesting Health Connect permission...');

      // Use timeout to prevent hanging
      const timeoutPromise = new Promise<{ success: boolean; error?: string }>((_, reject) =>
        setTimeout(
          () => reject(new Error('Permission request timed out')),
          30000
        )
      );

      const permissionResult = await Promise.race([
        healthConnectService.requestPermissions(),
        timeoutPromise,
      ]) as { success: boolean; error?: string };

      if (permissionResult.success) {
        // Use getStatusWithRealCheck for accurate post-permission status
        const status = await healthConnectService.getStatusWithRealCheck();

        if (status.authorized) {
          setHasPermission(true);
          await loadHealthConnectWorkouts();
        } else {
          setHasPermission(false);
          CustomAlertManager.alert(
            'Permission Required',
            'Health Connect permissions are needed to sync your workouts. Please enable them in Settings.'
          );
        }
      } else {
        setHasPermission(false);
        const errorMessage =
          permissionResult.error || 'Permission request failed';

        if (errorMessage.includes('not available')) {
          CustomAlertManager.alert(
            'Health Connect Unavailable',
            'Health Connect is not available on this device. Please update to Android 14 or install Health Connect from Play Store.'
          );
        } else if (
          errorMessage.includes('timeout') ||
          errorMessage.includes('taking too long')
        ) {
          CustomAlertManager.alert(
            'Request Timed Out',
            'The permission request is taking too long. Please try again.'
          );
        } else {
          CustomAlertManager.alert(
            'Permission Error',
            `Could not request Health Connect permissions: ${errorMessage}`
          );
        }
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setHasPermission(false);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('timed out') ||
        errorMessage.includes('timeout')
      ) {
        CustomAlertManager.alert(
          'Request Timed Out',
          'The permission request is taking too long. Please try again.'
        );
      } else {
        CustomAlertManager.alert(
          'Error',
          'Failed to request Health Connect permission. Please try again later.'
        );
      }
    } finally {
      setPermissionRequested(false);
    }
  };

  const loadHealthConnectWorkouts = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      console.log('Loading Health Connect workouts (last 30 days)...');

      // Add timeout protection to prevent hanging
      const timeoutPromise = new Promise<Workout[]>(
        (_, reject) =>
          setTimeout(
            () => reject(new Error('Workout loading timed out')),
            30000
          )
      );

      const healthConnectWorkouts = await Promise.race([
        healthConnectService.getRecentWorkouts(userId, 30),
        timeoutPromise,
      ]) as Workout[];

      setWorkouts(healthConnectWorkouts || []);
      console.log(
        `Loaded ${healthConnectWorkouts?.length || 0} Health Connect workouts`
      );
    } catch (error) {
      console.error('Failed to load Health Connect workouts:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('not available') ||
        errorMessage.includes('not authorized')
      ) {
        console.log(
          'Health Connect not available or not authorized - showing empty state'
        );
      } else if (
        errorMessage.includes('timed out') ||
        errorMessage.includes('timeout')
      ) {
        console.log(
          'Health Connect workout loading timed out - showing empty state'
        );
      } else {
        console.log('Health Connect workout loading failed:', errorMessage);
      }

      setWorkouts([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      // Refresh debug info after loading attempt
      fetchDebugInfo();
    }
  };

  const handleRefresh = async () => {
    if (!hasPermission) return;

    setIsRefreshing(true);
    try {
      await loadHealthConnectWorkouts();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCompete = async (workout: Workout) => {
    if (!onCompete) {
      CustomAlertManager.alert(
        'Error',
        'Competition entry functionality not available'
      );
      return;
    }

    // Prevent double-tap
    if (postingWorkoutId === workout.id) return;

    setPostingWorkoutId(workout.id);
    setPostingType('compete');
    try {
      await onCompete(workout);
      CustomAlertManager.alert('Success', 'Workout entered into competition!');
    } catch (error) {
      console.error('Competition entry failed:', error);
      CustomAlertManager.alert(
        'Error',
        'Failed to enter workout into competition'
      );
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  const handleSocialShare = async (workout: Workout) => {
    if (!onSocialShare) {
      CustomAlertManager.alert(
        'Error',
        'Social sharing functionality not available'
      );
      return;
    }

    // Prevent double-tap
    if (postingWorkoutId === workout.id) return;

    setPostingWorkoutId(workout.id);
    setPostingType('post');
    try {
      await onSocialShare(workout);
      // Success alert handled by the EnhancedSocialShareModal
    } catch (error) {
      console.error('Social share failed:', error);
      CustomAlertManager.alert('Error', 'Failed to share workout');
    } finally {
      setPostingWorkoutId(null);
      setPostingType(null);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await healthConnectService.openHealthConnectSettings();
    } catch (error) {
      console.error('Failed to open Health Connect settings:', error);
      CustomAlertManager.alert(
        'Error',
        'Could not open Health Connect settings. Please open it manually from your device settings.'
      );
    }
  };

  const renderWorkout = ({ item }: { item: Workout }) => {
    const isPostingThis = postingWorkoutId === item.id;
    const isPostingPost = isPostingThis && postingType === 'post';
    const isPostingCompete = isPostingThis && postingType === 'compete';

    return (
      <WorkoutCard workout={item}>
        <View style={styles.buttonContainer}>
          {/* Post button - Kind 1 social sharing */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.postButton,
              isPostingPost && styles.buttonDisabled,
            ]}
            onPress={() => handleSocialShare(item)}
            disabled={isPostingThis}
          >
            {isPostingPost ? (
              <ActivityIndicator size="small" color={theme.colors.accentText} />
            ) : (
              <>
                <Ionicons
                  name="bookmark-outline"
                  size={16}
                  color={theme.colors.accentText}
                />
                <Text style={styles.postButtonText}>Share</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Compete button - Kind 1301 competition entry */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.publicButton,
              isPostingCompete && styles.buttonDisabled,
            ]}
            onPress={() => handleCompete(item)}
            disabled={isPostingThis}
          >
            {isPostingCompete ? (
              <ActivityIndicator size="small" color={theme.colors.accentText} />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color={theme.colors.accentText}
                />
                <Text style={styles.publicButtonText}>Compete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </WorkoutCard>
    );
  };

  // Don't show on iOS
  if (Platform.OS !== 'android') {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay
          message="Loading Health Connect workouts..."
          visible={true}
        />
      </View>
    );
  }

  if (!healthConnectService.getStatus().available) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Health Connect Unavailable</Text>
          <Text style={styles.emptyStateText}>
            Health Connect is not available on this device.
          </Text>
        </Card>
      </View>
    );
  }

  if (sdkAvailable === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Health Connect Unavailable</Text>
          <Text style={styles.permissionText}>
            Health Connect could not be found on this device. Please ensure Health Connect is enabled in your device settings.
          </Text>
          <Text style={styles.permissionSubtext}>
            On Android 14+, Health Connect is built-in. On older versions, install it from the Play Store.
          </Text>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={handleOpenSettings}
          >
            <Text style={styles.settingsLinkText}>
              Open Health Connect Settings
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Card style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Connect Health Connect</Text>
          <Text style={styles.permissionText}>
            View your workouts from Health Connect. We'll show your last 30 days of workout data from apps like Samsung Health, Google Fit, Strava, and more.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleConnectHealthConnect}
            disabled={permissionRequested}
          >
            <Text style={styles.permissionButtonText}>
              {permissionRequested
                ? 'Requesting Permission...'
                : 'Connect Health Connect'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={handleOpenSettings}
          >
            <Text style={styles.settingsLinkText}>
              Open Health Connect Settings
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  // Debug section component
  const renderDebugSection = () => {
    if (!debugInfo) return null;

    return (
      <Card style={styles.debugCard}>
        <TouchableOpacity
          style={styles.debugHeader}
          onPress={() => setDebugExpanded(!debugExpanded)}
          onLongPress={copyDebugInfo}
        >
          <Text style={styles.debugTitle}>
            Debug Info {debugExpanded ? '▼' : '▶'}
          </Text>
          <Text style={styles.debugHint}>(long-press to copy)</Text>
        </TouchableOpacity>

        {debugExpanded && (
          <View style={styles.debugContent}>
            <Text style={styles.debugText} selectable>
              Provider: {debugInfo.provider || 'Not detected'}
            </Text>
            <Text style={styles.debugText} selectable>
              SDK Status: {debugInfo.sdkStatus} ({debugInfo.sdkStatusText})
            </Text>
            <Text style={styles.debugText} selectable>
              Sessions Found: {debugInfo.exerciseSessionsFound}
            </Text>
            <Text style={styles.debugText} selectable>
              Exercise Types: [{debugInfo.exerciseTypesFound.join(', ') || 'None'}]
            </Text>
            <Text style={styles.debugText} selectable>
              Permissions: ES={debugInfo.permissions.exerciseSession ? '✓' : '✗'} Steps={debugInfo.permissions.steps ? '✓' : '✗'} HR={debugInfo.permissions.heartRate ? '✓' : '✗'}
            </Text>
            {debugInfo.lastError && (
              <Text style={[styles.debugText, styles.debugError]} selectable>
                Error: {debugInfo.lastError}
              </Text>
            )}
            <TouchableOpacity style={styles.copyButton} onPress={copyDebugInfo}>
              <Text style={styles.copyButtonText}>Copy Debug Info</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <FlatList
      data={workouts}
      renderItem={renderWorkout}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.text}
        />
      }
      ListEmptyComponent={
        <Card style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No workouts found</Text>
          <Text style={styles.emptyStateText}>
            No workouts found in Health Connect for the last 30 days. Record a workout in your fitness apps (Samsung Health, Google Fit, Strava, etc.) and pull to refresh.
          </Text>
          {debugInfo && (
            <View style={styles.emptyDebugSummary}>
              <Text style={styles.debugSummaryText}>
                Provider: {debugInfo.provider || 'Not detected'} | Sessions: {debugInfo.exerciseSessionsFound}
              </Text>
              {debugInfo.lastError && (
                <Text style={styles.debugSummaryError}>Error: {debugInfo.lastError}</Text>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.copyButton} onPress={copyDebugInfo}>
            <Text style={styles.copyButtonText}>Copy Debug Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={handleOpenSettings}
          >
            <Text style={styles.settingsLinkText}>
              Open Health Connect Settings
            </Text>
          </TouchableOpacity>
        </Card>
      }
      ListFooterComponent={renderDebugSection}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  postButton: {
    backgroundColor: theme.colors.accent,
  },
  publicButton: {
    backgroundColor: theme.colors.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: theme.colors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  publicButtonText: {
    color: theme.colors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  permissionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  permissionSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    opacity: 0.7,
  },
  permissionButton: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  permissionButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsLink: {
    marginTop: 16,
    padding: 8,
  },
  settingsLinkText: {
    color: theme.colors.accent,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyStateTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Debug styles
  debugCard: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 0,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debugTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  debugHint: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  debugContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  debugText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  debugError: {
    color: '#ff6b6b',
  },
  emptyDebugSummary: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    width: '100%',
  },
  debugSummaryText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
  },
  debugSummaryError: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    marginTop: 4,
  },
  copyButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    alignSelf: 'center',
  },
  copyButtonText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});

// Exported component
export const HealthConnectTab: React.FC<HealthConnectTabProps> = (props) => {
  // Only render on Android
  if (Platform.OS !== 'android') {
    return null;
  }

  return <HealthConnectTabContent {...props} />;
};
