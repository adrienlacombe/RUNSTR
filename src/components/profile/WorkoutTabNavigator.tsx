/**
 * WorkoutTabNavigator - Simple tab switcher between Public, Local, and Apple workouts
 * Public: 1301 notes from Nostr (cache-first instant display)
 * Local: Local Activity Tracker workouts (zero loading time)
 * Apple: HealthKit workouts with post buttons
 */

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { theme } from '../../styles/theme';
import { PublicWorkoutsTab } from './tabs/PublicWorkoutsTab';
import { PrivateWorkoutsTab } from './tabs/PrivateWorkoutsTab';
import { AppleHealthTab } from './tabs/AppleHealthTab';
import { HealthConnectTab } from './tabs/HealthConnectTab';
import { GarminHealthTab } from './tabs/GarminHealthTab';
import { ToggleButtons } from '../ui/ToggleButtons';
import type { LocalWorkout } from '../../services/fitness/LocalWorkoutStorageService';

// GARMIN: Removed 'garmin' from WorkoutTabType until security issues fixed
// PUBLIC TAB: Hidden from UI (local-first architecture), but code kept for potential future use
export type WorkoutTabType = 'public' | 'private' | 'apple' | 'healthconnect'; // | 'garmin';

interface WorkoutTabNavigatorProps {
  userId: string;
  pubkey?: string;
  initialTab?: WorkoutTabType;
  onRefresh?: () => void;
  onPostToNostr?: (workout: LocalWorkout) => Promise<void>;
  onPostToSocial?: (workout: LocalWorkout) => Promise<void>;
  onCompeteHealthKit?: (workout: any) => Promise<void>;
  onSocialShareHealthKit?: (workout: any) => Promise<void>;
  onCompeteGarmin?: (workout: any) => Promise<void>;
  onSocialShareGarmin?: (workout: any) => Promise<void>;
  onCompeteHealthConnect?: (workout: any) => Promise<void>;
  onSocialShareHealthConnect?: (workout: any) => Promise<void>;
  onNavigateToAnalytics?: () => void;
}

export const WorkoutTabNavigator: React.FC<WorkoutTabNavigatorProps> = ({
  userId,
  pubkey,
  initialTab = 'private',
  onRefresh,
  onPostToNostr,
  onPostToSocial,
  onCompeteHealthKit,
  onSocialShareHealthKit,
  onCompeteGarmin,
  onSocialShareGarmin,
  onCompeteHealthConnect,
  onSocialShareHealthConnect,
  onNavigateToAnalytics,
}) => {
  const [activeTab, setActiveTab] = useState<WorkoutTabType>(initialTab);

  // Build tab options based on platform
  const tabOptions = [
    { key: 'private', label: 'Phone' },
    ...(Platform.OS === 'ios' ? [{ key: 'apple', label: 'Watch' }] : []),
    ...(Platform.OS === 'android' ? [{ key: 'healthconnect', label: 'Health' }] : []),
  ];

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <ToggleButtons
          options={tabOptions}
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key as WorkoutTabType)}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {/* Only mount the active tab to prevent unnecessary component initialization */}
        {activeTab === 'public' && (
          <PublicWorkoutsTab
            userId={userId}
            pubkey={pubkey}
            onRefresh={onRefresh}
          />
        )}
        {activeTab === 'private' && (
          <PrivateWorkoutsTab
            userId={userId}
            pubkey={pubkey}
            onRefresh={onRefresh}
            onPostToNostr={onPostToNostr}
            onPostToSocial={onPostToSocial}
            onNavigateToAnalytics={onNavigateToAnalytics}
          />
        )}
        {activeTab === 'apple' && (
          <AppleHealthTab
            userId={userId}
            onCompete={onCompeteHealthKit}
            onSocialShare={onSocialShareHealthKit}
          />
        )}
        {activeTab === 'healthconnect' && (
          <HealthConnectTab
            userId={userId}
            onCompete={onCompeteHealthConnect}
            onSocialShare={onSocialShareHealthConnect}
          />
        )}
        {activeTab === 'garmin' && (
          <GarminHealthTab
            userId={userId}
            onCompete={onCompeteGarmin}
            onSocialShare={onSocialShareGarmin}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabContent: {
    flex: 1,
  },
});
