/**
 * Season2Screen - RUNSTR Season 2 Competition Screen
 *
 * Main screen for Season 2 with:
 * - Info card (dates, prizes)
 * - 3 tabs (Running, Walking, Cycling)
 * - User leaderboard
 * - Charity rankings (collapsible)
 * - Signup section
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import {
  Season2InfoCard,
  Season2Leaderboard,
  CharityRankings,
  Season2ExplainerModal,
  Season2SignupSection,
} from '../../components/season2';
import { ToggleButtons } from '../../components/ui/ToggleButtons';
import { EventsContent, LeaderboardsContent } from '../../components/compete';
import { RunstrEventCreationModal } from '../../components/events/RunstrEventCreationModal';
import { useSeason2Leaderboard, useSeason2Registration } from '../../hooks/useSeason2';
import { Season2PayoutService } from '../../services/season/Season2PayoutService';
import { getSeason2Status } from '../../constants/season2';
import type { Season2ActivityType } from '../../types/season2';
import type { SatlantisEvent } from '../../types/satlantis';

type CompeteTab = 'season2' | 'events' | 'leaderboards';

const COMPETE_TABS = [
  { key: 'season2', label: 'Season II' },
  { key: 'events', label: 'Events' },
  { key: 'leaderboards', label: 'Leaderboards' },
];

const TABS = [
  { key: 'running', label: 'Running' },
  { key: 'walking', label: 'Walking' },
  { key: 'cycling', label: 'Cycling' },
];

interface Season2ScreenProps {
  navigation?: any;
}

export const Season2Screen: React.FC<Season2ScreenProps> = ({ navigation: propNavigation }) => {
  const hookNavigation = useNavigation<any>();
  const navigation = propNavigation || hookNavigation;

  // Top-level tab state (Season II / Events / Leaderboards)
  const [activeCompeteTab, setActiveCompeteTab] = useState<CompeteTab>('season2');

  // Season II activity tab state (Running / Walking / Cycling)
  const [activeTab, setActiveTab] = useState<Season2ActivityType>('running');
  const [showExplainer, setShowExplainer] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);

  // Lazy loading flags
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [leaderboardsLoaded, setLeaderboardsLoaded] = useState(false);

  const { leaderboard, isLoading, refresh } = useSeason2Leaderboard(activeTab);
  const { isRegistered } = useSeason2Registration();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger automatic payouts when season ends
  useEffect(() => {
    const checkAndExecutePayouts = async () => {
      const status = getSeason2Status();
      if (status === 'ended') {
        console.log('[Season2Screen] Season ended, checking payouts...');
        const results = await Season2PayoutService.executePayouts();
        if (results) {
          console.log('[Season2Screen] Payout results:', {
            bonusSuccess: results.bonusWinner?.success,
            charitySuccessCount: results.charityPayouts.filter(p => p.success).length,
            totalSuccess: results.totalSuccess,
          });
        }
      }
    };

    checkAndExecutePayouts();
  }, []);

  // Lazy loading - mark tabs as loaded when first selected
  useEffect(() => {
    if (activeCompeteTab === 'events' && !eventsLoaded) {
      setEventsLoaded(true);
    }
    if (activeCompeteTab === 'leaderboards' && !leaderboardsLoaded) {
      setLeaderboardsLoaded(true);
    }
  }, [activeCompeteTab, eventsLoaded, leaderboardsLoaded]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const handleTabChange = (tab: Season2ActivityType) => {
    setActiveTab(tab);
  };

  // Handle event press - navigate to event detail
  const handleEventPress = useCallback((event: SatlantisEvent) => {
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('SatlantisEventDetail', {
        eventId: event.id,
        eventPubkey: event.pubkey,
      });
    } else {
      navigation.navigate('SatlantisEventDetail', {
        eventId: event.id,
        eventPubkey: event.pubkey,
      });
    }
  }, [navigation]);

  // Handle event creation complete
  const handleEventCreated = useCallback((eventId: string) => {
    console.log('[Season2Screen] Event created:', eventId);
    setShowCreationModal(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top-Level Competition Toggle */}
      <View style={styles.topToggleContainer}>
        <ToggleButtons
          options={COMPETE_TABS}
          activeKey={activeCompeteTab}
          onSelect={(key) => setActiveCompeteTab(key as CompeteTab)}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.orangeBright}
          />
        }
      >
        {/* Season II Tab Content */}
        {activeCompeteTab === 'season2' && (
          <>
            {/* Info Card */}
            <Season2InfoCard onPress={() => setShowExplainer(true)} />

            {/* Activity Tab Bar */}
            <View style={styles.tabBarContainer}>
              <ToggleButtons
                options={TABS}
                activeKey={activeTab}
                onSelect={(key) => handleTabChange(key as Season2ActivityType)}
              />
            </View>

            {/* Leaderboard */}
            <Season2Leaderboard
              participants={leaderboard?.participants || []}
              isLoading={isLoading}
              emptyMessage={`No ${activeTab} workouts yet`}
            />

            {/* Charity Rankings */}
            <CharityRankings
              rankings={leaderboard?.charityRankings || []}
              isLoading={isLoading}
            />

            {/* Signup Section */}
            {!isRegistered && <Season2SignupSection />}

            {/* Registered Status */}
            {isRegistered && (
              <View style={styles.registeredInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.registeredText}>
                  You're competing in SEASON II
                </Text>
              </View>
            )}
          </>
        )}

        {/* Events Tab Content */}
        {activeCompeteTab === 'events' && eventsLoaded && (
          <EventsContent
            onEventPress={handleEventPress}
            onCreateEvent={() => setShowCreationModal(true)}
          />
        )}

        {/* Leaderboards Tab Content */}
        {activeCompeteTab === 'leaderboards' && leaderboardsLoaded && (
          <LeaderboardsContent />
        )}
      </ScrollView>

      {/* Explainer Modal */}
      <Season2ExplainerModal
        visible={showExplainer}
        onClose={() => setShowExplainer(false)}
      />

      {/* Event Creation Modal */}
      <RunstrEventCreationModal
        visible={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onEventCreated={handleEventCreated}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabBarContainer: {
    marginBottom: 16,
  },
  registeredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  registeredText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  topToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default Season2Screen;
