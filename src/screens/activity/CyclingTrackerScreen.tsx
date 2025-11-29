/**
 * CyclingTrackerScreen - Cycling activity tracker with speed metrics
 * Displays distance, time, speed, and elevation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppStateManager } from '../../services/core/AppStateManager';
import { HoldToStartButton } from '../../components/activity/HoldToStartButton';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { simpleLocationTrackingService } from '../../services/activity/SimpleLocationTrackingService';
import { activityMetricsService } from '../../services/activity/ActivityMetricsService';
import type { TrackingSession } from '../../services/activity/SimpleLocationTrackingService';
import { WorkoutSummaryModal } from '../../components/activity/WorkoutSummaryModal';
import LocalWorkoutStorageService from '../../services/fitness/LocalWorkoutStorageService';
import { RouteSelectionModal } from '../../components/routes/RouteSelectionModal';
import routeMatchingService from '../../services/routes/RouteMatchingService';
import type { SavedRoute } from '../../services/routes/RouteStorageService';
import { theme } from '../../styles/theme';
import { appPermissionService } from '../../services/initialization/AppPermissionService';
import { PermissionRequestModal } from '../../components/permissions/PermissionRequestModal';

export const CyclingTrackerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState({
    distance: '0.00 km',
    duration: '0:00',
    speed: '0.0 km/h',
    elevation: '0 m',
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);
  const [routeSelectionVisible, setRouteSelectionVisible] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [countdown, setCountdown] = useState<3 | 2 | 1 | 'GO' | null>(null);
  const [workoutData, setWorkoutData] = useState<{
    type: 'running' | 'walking' | 'cycling';
    distance: number;
    duration: number;
    calories: number;
    elevation?: number;
    speed?: number;
    localWorkoutId?: string; // For marking as synced later
    gpsCoordinates?: Array<{
      latitude: number;
      longitude: number;
      altitude?: number;
      timestamp?: number;
    }>; // For route saving
  } | null>(null);
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const metricsUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0); // When pause started
  const totalPausedTimeRef = useRef<number>(0); // Cumulative pause duration in ms
  const isPausedRef = useRef<boolean>(false); // Ref to avoid stale closure in timer
  const isTrackingRef = useRef<boolean>(false); // Track isTracking without re-subscribing

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (metricsUpdateRef.current) clearInterval(metricsUpdateRef.current);
    };
  }, []);

  // AppState listener for background/foreground transitions - using AppStateManager
  useEffect(() => {
    const appStateManager = AppStateManager;
    const unsubscribe = appStateManager.onStateChange((isActive) => {
      if (!isActive) {
        // App going to background - clear timers to prevent crashes
        console.log(
          '[CyclingTrackerScreen] App backgrounding, clearing timers...'
        );
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (metricsUpdateRef.current) {
          clearInterval(metricsUpdateRef.current);
          metricsUpdateRef.current = null;
        }
      } else if (isActive && isTrackingRef.current) {
        // App returned to foreground while tracking - restart timers and sync
        console.log(
          '[CyclingTrackerScreen] App returned to foreground, restarting timers and syncing...'
        );

        // Restart timers
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            if (!isPausedRef.current) {
              const now = Date.now();
              const totalElapsed = Math.floor(
                (now - startTimeRef.current - totalPausedTimeRef.current) / 1000
              );
              setElapsedTime(totalElapsed);
            }
          }, 1000);
        }
        if (!metricsUpdateRef.current) {
          metricsUpdateRef.current = setInterval(updateMetrics, 1000);
        }

        // Force immediate sync of metrics
        const session = simpleLocationTrackingService.getCurrentSession();
        if (session) {
          const now = Date.now();
          const currentElapsed = Math.floor(
            (now - startTimeRef.current - totalPausedTimeRef.current) / 1000
          );

          const speed = activityMetricsService.calculateSpeed(
            session.distance,
            currentElapsed
          );

          setMetrics({
            distance: activityMetricsService.formatDistance(session.distance),
            duration: activityMetricsService.formatDuration(currentElapsed),
            speed: activityMetricsService.formatSpeed(speed),
            elevation: activityMetricsService.formatElevation(
              session.elevationGain
            ),
          });
          setElapsedTime(currentElapsed);
          setCurrentSpeed(speed);

          console.log(
            `[CyclingTrackerScreen] ✅ Synced: ${(
              session.distance / 1000
            ).toFixed(2)} km, ` +
              `${currentElapsed}s, ${speed.toFixed(
                1
              )} km/h, tracking continued in background`
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []); // Subscribe only once to avoid race conditions

  // Update the ref whenever isTracking changes
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  const handleHoldComplete = async () => {
    console.log('[CyclingTrackerScreen] Hold complete, starting countdown...');

    // Check permissions BEFORE countdown
    const permissionStatus = await appPermissionService.checkAllPermissions();

    if (!permissionStatus.location) {
      console.log('[CyclingTrackerScreen] Missing permissions, showing modal');
      setShowPermissionModal(true);
      return;
    }

    // Start countdown: 3 → 2 → 1 → GO!
    setCountdown(3);
    setTimeout(() => {
      setCountdown(2);
      setTimeout(() => {
        setCountdown(1);
        setTimeout(() => {
          setCountdown('GO');
          setTimeout(() => {
            setCountdown(null);
            // Start tracking after countdown completes
            proceedWithTracking();
          }, 500); // Show "GO!" for 0.5 seconds
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const proceedWithTracking = async () => {
    try {
      // Start tracking without re-checking permissions (already checked in handleHoldComplete)
      const started = await simpleLocationTrackingService.startTracking(
        'cycling'
      );
      if (started) {
        initializeTracking();
      }
    } catch (error) {
      // Get detailed error message from service
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Show detailed error with helpful context
      setAlertConfig({
        title: 'Cannot Start Tracking',
        message: errorMessage,
        buttons: [
          { text: 'OK', style: 'default' },
          ...(Platform.OS === 'android'
            ? [
                {
                  text: 'Settings',
                  style: 'default' as const,
                  onPress: () => {
                    // Open Android app settings
                    const { Linking } = require('react-native');
                    Linking.openSettings();
                  },
                },
              ]
            : []),
        ],
      });
      setAlertVisible(true);
      console.error(
        '[CyclingTrackerScreen] Failed to start tracking:',
        errorMessage
      );
    }
  };

  const initializeTracking = () => {
    setIsTracking(true);
    setIsPaused(false);
    isPausedRef.current = false;
    startTimeRef.current = Date.now();
    pauseStartTimeRef.current = 0;
    totalPausedTimeRef.current = 0;

    // Initialize route matching if a route is selected
    if (selectedRoute) {
      routeMatchingService.startMatching(selectedRoute);
      console.log(
        `[CyclingTrackerScreen] Started route matching for: ${selectedRoute.name}`
      );
    }

    timerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        const now = Date.now();
        const totalElapsed = Math.floor(
          (now - startTimeRef.current - totalPausedTimeRef.current) / 1000
        );
        setElapsedTime(totalElapsed);
      }
    }, 1000);

    metricsUpdateRef.current = setInterval(updateMetrics, 1000); // Update every second for speed
  };

  const updateMetrics = () => {
    // CRITICAL: Don't update UI if app is backgrounded
    const appStateManager = AppStateManager;
    if (!appStateManager.isActive()) {
      return;
    }

    const session = simpleLocationTrackingService.getCurrentSession();
    if (session) {
      // Calculate current speed based on distance and time
      let speed = activityMetricsService.calculateSpeed(
        session.distance,
        elapsedTime
      );

      setCurrentSpeed(speed);
      setMetrics({
        distance: activityMetricsService.formatDistance(session.distance),
        duration: activityMetricsService.formatDuration(elapsedTime),
        speed: activityMetricsService.formatSpeed(speed),
        elevation: activityMetricsService.formatElevation(
          session.elevationGain
        ),
      });
    }
  };

  const pauseTracking = async () => {
    if (!isPaused) {
      await simpleLocationTrackingService.pauseTracking();
      setIsPaused(true);
      isPausedRef.current = true;
      pauseStartTimeRef.current = Date.now(); // Store when pause started
    }
  };

  const resumeTracking = async () => {
    if (isPaused) {
      const pauseDuration = Date.now() - pauseStartTimeRef.current; // Calculate how long we were paused
      totalPausedTimeRef.current += pauseDuration; // Add to cumulative total
      await simpleLocationTrackingService.resumeTracking();
      setIsPaused(false);
      isPausedRef.current = false;
    }
  };

  const stopTracking = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (metricsUpdateRef.current) {
      clearInterval(metricsUpdateRef.current);
      metricsUpdateRef.current = null;
    }

    // Stop route matching if active
    if (selectedRoute) {
      routeMatchingService.stopMatching();
    }

    const session = await simpleLocationTrackingService.stopTracking();
    setIsTracking(false);
    setIsPaused(false);

    if (session && session.distance > 50) {
      // Minimum 50 meters for cycling
      showWorkoutSummary(session);
    } else {
      resetMetrics();
    }
  };

  const showWorkoutSummary = async (session: TrackingSession) => {
    const avgSpeed = activityMetricsService.calculateSpeed(
      session.distance,
      elapsedTime
    );
    const calories = activityMetricsService.estimateCalories(
      'cycling',
      session.distance,
      elapsedTime
    );

    // Convert LocationPoint[] to GPSCoordinate[] for route saving
    const gpsCoordinates = session.positions.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
      altitude: point.altitude,
      timestamp: point.timestamp,
    }));

    // Save workout to local storage BEFORE showing modal
    try {
      const workoutId = await LocalWorkoutStorageService.saveGPSWorkout({
        type: 'cycling',
        distance: session.distance,
        duration: elapsedTime,
        calories,
        elevation: session.elevationGain,
        speed: avgSpeed,
      });

      console.log(`✅ Cycling workout saved locally: ${workoutId}`);

      setWorkoutData({
        type: 'cycling',
        distance: session.distance,
        duration: elapsedTime,
        calories,
        elevation: session.elevationGain,
        speed: avgSpeed,
        localWorkoutId: workoutId,
        gpsCoordinates, // Pass GPS data for route saving
      });
      setSummaryModalVisible(true);
    } catch (error) {
      console.error('❌ Failed to save cycling workout locally:', error);
      // Still show modal even if save failed
      setWorkoutData({
        type: 'cycling',
        distance: session.distance,
        duration: elapsedTime,
        calories,
        elevation: session.elevationGain,
        speed: avgSpeed,
        gpsCoordinates, // Pass GPS data even if local save failed
      });
      setSummaryModalVisible(true);
    }

    resetMetrics();
  };

  const resetMetrics = () => {
    setMetrics({
      distance: '0.00 km',
      duration: '0:00',
      speed: '0.0 km/h',
      elevation: '0 m',
    });
    setElapsedTime(0);
    setCurrentSpeed(0);
  };

  useEffect(() => {
    if (isTracking && !isPaused) {
      updateMetrics();
    }
  }, [elapsedTime]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'bottom']}
    >
      <View style={styles.container}>
        {/* Metrics Display */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons
                name="navigate"
                size={20}
                color={theme.colors.textMuted}
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>{metrics.distance}</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons
                name="time"
                size={20}
                color={theme.colors.textMuted}
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>{metrics.duration}</Text>
              <Text style={styles.metricLabel}>Duration</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Ionicons
                name="speedometer"
                size={20}
                color={theme.colors.textMuted}
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>{metrics.speed}</Text>
              <Text style={styles.metricLabel}>Speed</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons
                name="trending-up"
                size={20}
                color={theme.colors.textMuted}
                style={styles.metricIcon}
              />
              <Text style={styles.metricValue}>{metrics.elevation}</Text>
              <Text style={styles.metricLabel}>Elevation</Text>
            </View>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isTracking ? (
            <>
              {/* Routes Button */}
              <TouchableOpacity
                style={styles.routesButton}
                onPress={() => setRouteSelectionVisible(true)}
              >
                <Ionicons
                  name="map-outline"
                  size={20}
                  color={theme.colors.text}
                />
                <Text style={styles.routesButtonText}>
                  {selectedRoute ? selectedRoute.name : 'Routes'}
                </Text>
              </TouchableOpacity>

              {/* Hold to Start Button */}
              <HoldToStartButton
                label="Start Ride"
                onHoldComplete={handleHoldComplete}
                disabled={countdown !== null}
                holdDuration={2000}
              />
            </>
          ) : (
            <>
              {!isPaused ? (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseTracking}
                >
                  <Ionicons name="pause" size={30} color={theme.colors.text} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={resumeTracking}
                >
                  <Ionicons
                    name="play"
                    size={30}
                    color={theme.colors.background}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopTracking}
              >
                <Ionicons name="stop" size={30} color={theme.colors.text} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Countdown Overlay */}
      {countdown && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Workout Summary Modal */}
      {workoutData && (
        <WorkoutSummaryModal
          visible={summaryModalVisible}
          onClose={() => {
            setSummaryModalVisible(false);
            setWorkoutData(null);
          }}
          workout={workoutData}
        />
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      {/* Route Selection Modal */}
      <RouteSelectionModal
        visible={routeSelectionVisible}
        activityType="cycling"
        onSelectRoute={(route) => {
          setSelectedRoute(route);
          setRouteSelectionVisible(false);
        }}
        onTrackFreely={() => {
          setSelectedRoute(null);
          setRouteSelectionVisible(false);
        }}
        onClose={() => setRouteSelectionVisible(false)}
      />

      {/* Permission Request Modal */}
      <PermissionRequestModal
        visible={showPermissionModal}
        onComplete={() => {
          setShowPermissionModal(false);
          // Permissions granted - proceed directly with tracking (no re-check)
          proceedWithTracking();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  metricsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
    marginTop: 40,
    gap: 20,
  },
  routesButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 200,
  },
  routesButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  pauseButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  resumeButton: {
    backgroundColor: theme.colors.text,
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 35,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
});
