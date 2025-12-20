/**
 * WorkoutsTab Component - Public/All Tab Workout Display
 * Shows Public (Nostr) and All (merged sources) tabs with sync dropdown
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import { SyncSource, Workout } from '../../types';
import { PublicWorkoutsTab } from './tabs/PublicWorkoutsTab';
import { AllWorkoutsTab } from './tabs/AllWorkoutsTab';
import { SyncDropdown } from './shared/SyncDropdown';
import { ToggleButtons } from '../ui/ToggleButtons';

interface WorkoutsTabProps {
  syncSources: SyncSource[];
  recentWorkouts: Workout[]; // Legacy prop - ignored in new architecture
  currentUserId: string;
  currentUserPubkey?: string;
  currentUserTeamId?: string;
  onSyncSourcePress: (provider: string) => void;
  onWorkoutsSynced?: () => void;
}

type TabType = 'public' | 'all';

export const WorkoutsTab: React.FC<WorkoutsTabProps> = ({
  syncSources,
  recentWorkouts, // Ignored in new architecture
  currentUserId,
  currentUserPubkey,
  currentUserTeamId,
  onSyncSourcePress,
  onWorkoutsSynced,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'public':
        return (
          <PublicWorkoutsTab
            userId={currentUserId}
            pubkey={currentUserPubkey}
            onRefresh={onWorkoutsSynced}
          />
        );
      case 'all':
        return (
          <AllWorkoutsTab
            userId={currentUserId}
            pubkey={currentUserPubkey}
            onRefresh={onWorkoutsSynced}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Import Workouts Button */}
      <View style={styles.importSection}>
        <SyncDropdown
          userId={currentUserId}
          onSyncComplete={onWorkoutsSynced}
        />
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabToggleContainer}>
        <ToggleButtons
          options={[
            { key: 'public', label: 'Public' },
            { key: 'all', label: 'All' },
          ]}
          activeKey={activeTab}
          onSelect={(key) => setActiveTab(key as TabType)}
        />
      </View>

      {/* Active Tab Content */}
      <View style={styles.tabContent}>{renderActiveTab()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  importSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabContent: {
    flex: 1,
  },
});
