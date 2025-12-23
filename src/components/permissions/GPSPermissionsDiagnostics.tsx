/**
 * GPSPermissionsDiagnostics - Shows GPS permission status with fix buttons
 * Helps users diagnose and fix GPS tracking issues on Android
 *
 * Displays:
 * 1. Location Services (system-wide toggle)
 * 2. Background Location (always vs while using)
 * 3. Precise Location (Android 12+)
 * 4. Battery Optimization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Application from 'expo-application';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { BatteryOptimizationService } from '../../services/activity/BatteryOptimizationService';

// Android API level constants
const ANDROID_10 = 29;
const ANDROID_12 = 31;
const ANDROID_16 = 36;

interface DiagnosticStatus {
  // Location Services
  locationServicesEnabled: boolean;
  gpsAvailable: boolean;

  // Permissions
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  backgroundStatus: 'always' | 'while_using' | 'denied' | 'unknown';

  // Precise Location (Android 12+)
  preciseGranted: boolean;
  preciseStatus: 'granted' | 'denied' | 'unknown';
  showPreciseOption: boolean;

  // Battery
  batteryExempted: boolean;

  // Device Info
  androidVersion: number;
  isLoading: boolean;
}

const getAndroidVersion = (): number => {
  return Platform.OS === 'android' ? (Platform.Version as number) : 0;
};

export const GPSPermissionsDiagnostics: React.FC = () => {
  const [status, setStatus] = useState<DiagnosticStatus>({
    locationServicesEnabled: true,
    gpsAvailable: true,
    foregroundGranted: false,
    backgroundGranted: false,
    backgroundStatus: 'unknown',
    preciseGranted: true,
    preciseStatus: 'granted',
    showPreciseOption: false,
    batteryExempted: false,
    androidVersion: 0,
    isLoading: true,
  });

  const checkStatus = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));

    try {
      const androidVersion = getAndroidVersion();

      // 1. Check Location Services (system-wide)
      const providerStatus = await Location.getProviderStatusAsync();
      const locationServicesEnabled =
        providerStatus.locationServicesEnabled ?? true;
      const gpsAvailable = providerStatus.gpsAvailable ?? true;

      // 2. Check Foreground Permission
      const fgPerm = await Location.getForegroundPermissionsAsync();
      const foregroundGranted = fgPerm.status === 'granted';

      // 3. Check Background Permission
      const bgPerm = await Location.getBackgroundPermissionsAsync();
      const backgroundGranted = bgPerm.status === 'granted';

      // Determine background status
      let backgroundStatus: 'always' | 'while_using' | 'denied' | 'unknown' =
        'unknown';
      if (backgroundGranted) {
        backgroundStatus = 'always';
      } else if (foregroundGranted) {
        backgroundStatus = 'while_using';
      } else {
        backgroundStatus = 'denied';
      }

      // 4. Check Precise Location (Android 12+)
      const showPreciseOption = androidVersion >= ANDROID_12;
      let preciseGranted = true;
      let preciseStatus: 'granted' | 'denied' | 'unknown' = 'granted';

      if (showPreciseOption && foregroundGranted) {
        // Android 16+ (API 36): Precision detection is unreliable
        if (androidVersion >= ANDROID_16) {
          preciseStatus = 'unknown';
          preciseGranted = true; // Assume granted, let user verify manually
        } else {
          const accuracy = (fgPerm as any).accuracy;
          preciseGranted = accuracy === 'full' || accuracy === undefined;
          preciseStatus = preciseGranted ? 'granted' : 'denied';
        }
      }

      // 5. Check Battery Optimization
      const batteryService = BatteryOptimizationService.getInstance();
      const batteryStatus =
        await batteryService.checkBatteryOptimizationStatus();
      const batteryExempted = batteryStatus.exempted;

      setStatus({
        locationServicesEnabled,
        gpsAvailable,
        foregroundGranted,
        backgroundGranted,
        backgroundStatus,
        preciseGranted,
        preciseStatus,
        showPreciseOption,
        batteryExempted,
        androidVersion,
        isLoading: false,
      });
    } catch (error) {
      console.error('[GPSPermissionsDiagnostics] Error checking status:', error);
      setStatus((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Fix handlers
  const handleFixLocationServices = async () => {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS
      );
    } catch {
      await Linking.openSettings();
    }
  };

  const handleFixBackgroundLocation = async () => {
    const androidVersion = getAndroidVersion();

    // Android 10: Can try dialog first
    if (androidVersion === ANDROID_10) {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status === 'granted') {
        checkStatus();
        return;
      }
    }

    // Android 11+: Must use Settings
    Alert.alert(
      'Background Location Required',
      'To track workouts when your phone is in your pocket:\n\n' +
        '1. Tap "Open Settings"\n' +
        '2. Tap "Permissions"\n' +
        '3. Tap "Location"\n' +
        '4. Select "Allow all the time"',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };

  const handleFixPreciseLocation = () => {
    Alert.alert(
      'Precise Location Required',
      'GPS tracking requires precise location for accurate distance:\n\n' +
        '1. Tap "Open Settings"\n' +
        '2. Tap "Permissions"\n' +
        '3. Tap "Location"\n' +
        '4. Enable "Use precise location"',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };

  const handleFixBatteryOptimization = async () => {
    const packageName =
      Application.applicationId || 'com.anonymous.runstr.project';

    try {
      // Try direct battery optimization dialog
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        { data: `package:${packageName}` }
      );
    } catch {
      // Fallback: Open app's settings
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: `package:${packageName}` }
        );
      } catch {
        // Last fallback
        await Linking.openSettings();
      }
    }
  };

  // Don't render on iOS
  if (Platform.OS !== 'android') {
    return null;
  }

  // Calculate overall status
  const allGood =
    status.locationServicesEnabled &&
    status.backgroundGranted &&
    status.preciseGranted &&
    status.batteryExempted;

  const hasIssues =
    !status.locationServicesEnabled ||
    !status.backgroundGranted ||
    !status.preciseGranted ||
    !status.batteryExempted;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="navigate"
            size={18}
            color={theme.colors.accent}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>GPS & Location Permissions</Text>
        </View>
        {allGood && (
          <View style={styles.allGoodBadge}>
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.accent} />
            <Text style={styles.allGoodText}>All Set</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        {hasIssues
          ? 'Fix issues below for reliable workout tracking'
          : 'Your device is configured for reliable GPS tracking'}
      </Text>

      {status.isLoading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.accent}
          style={styles.loader}
        />
      ) : (
        <>
          {/* Location Services */}
          <StatusRow
            label="Location Services"
            isGood={status.locationServicesEnabled}
            goodText="Enabled"
            badText="Disabled"
            badDescription="GPS is completely unavailable"
            onFix={handleFixLocationServices}
          />

          {/* Background Location - MOST IMPORTANT */}
          <StatusRow
            label="Background Location"
            isGood={status.backgroundGranted}
            goodText="Always allowed"
            badText={
              status.backgroundStatus === 'while_using'
                ? 'Only while using'
                : 'Not granted'
            }
            badDescription="GPS stops when phone is in pocket!"
            onFix={handleFixBackgroundLocation}
            isImportant
          />

          {/* Precise Location (Android 12+) */}
          {status.showPreciseOption && (
            <StatusRow
              label="Location Accuracy"
              isGood={status.preciseStatus !== 'denied'}
              goodText={status.preciseStatus === 'unknown' ? 'Check in Settings' : 'Precise'}
              badText="Approximate"
              badDescription="~2km accuracy - useless for tracking"
              onFix={handleFixPreciseLocation}
            />
          )}

          {/* Battery Optimization */}
          <StatusRow
            label="Battery Optimization"
            isGood={status.batteryExempted}
            goodText="Unrestricted"
            badText="Optimized"
            badDescription="Android may kill GPS after 30 seconds"
            onFix={handleFixBatteryOptimization}
          />

          {/* Device Info & Refresh */}
          <View style={styles.footer}>
            <Text style={styles.deviceInfo}>
              Android {status.androidVersion}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={checkStatus}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={theme.colors.textMuted}
              />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// Status Row Component
interface StatusRowProps {
  label: string;
  isGood: boolean;
  goodText: string;
  badText: string;
  badDescription: string;
  onFix: () => void;
  isImportant?: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({
  label,
  isGood,
  goodText,
  badText,
  badDescription,
  onFix,
  isImportant,
}) => {
  // Orange theme only - accent for good, muted for issues
  const iconColor = isGood ? theme.colors.accent : theme.colors.textMuted;
  const iconName = isGood ? 'checkmark-circle' : 'alert-circle';

  return (
    <View style={styles.statusRow}>
      <View style={styles.statusLeft}>
        <View style={styles.labelRow}>
          <Text style={styles.statusLabel}>{label}</Text>
          {isImportant && !isGood && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>CRITICAL</Text>
            </View>
          )}
        </View>
        <View style={styles.statusValueRow}>
          <Ionicons
            name={iconName as any}
            size={16}
            color={iconColor}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusValue, { color: iconColor }]}>
            {isGood ? goodText : badText}
          </Text>
        </View>
        {!isGood && (
          <Text style={styles.statusDescription}>{badDescription}</Text>
        )}
      </View>
      {!isGood && (
        <TouchableOpacity
          style={styles.fixButton}
          onPress={onFix}
          activeOpacity={0.7}
        >
          <Text style={styles.fixButtonText}>Fix</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  allGoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 123, 28, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allGoodText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusLeft: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  importantBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  importantText: {
    fontSize: 9,
    color: theme.colors.background,
    fontWeight: '700',
  },
  statusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  fixButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
  },
  deviceInfo: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
});
