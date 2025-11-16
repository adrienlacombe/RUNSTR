/**
 * CompetitionsListScreen - Transformed to Daily Leaderboards View
 * Shows user's competition team's daily leaderboards (5K, 10K, Half, Marathon)
 * Replaces old events/challenges tabs with simple leaderboard display
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SimpleLeaderboardService } from '../services/competition/SimpleLeaderboardService';
import { DailyLeaderboardCard } from '../components/team/DailyLeaderboardCard';
import { LocalTeamMembershipService } from '../services/team/LocalTeamMembershipService';
import { theme } from '../styles/theme';

export const CompetitionsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [competitionTeamId, setCompetitionTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [userNpub, setUserNpub] = useState<string | null>(null);
  const [leaderboards, setLeaderboards] = useState<{
    leaderboard5k: any[];
    leaderboard10k: any[];
    leaderboardHalf: any[];
    leaderboardMarathon: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailyLeaderboards();
  }, []);

  const loadDailyLeaderboards = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get user's npub for filtering leaderboards
      const npub = await AsyncStorage.getItem('@runstr:npub');
      setUserNpub(npub);

      // Get user's competition team using LocalTeamMembershipService
      const teamId = await LocalTeamMembershipService.getCompetitionTeam();

      if (!teamId) {
        setCompetitionTeamId(null);
        setLeaderboards(null);
        return;
      }

      setCompetitionTeamId(teamId);

      // Load daily leaderboards for this team
      const leaderboardService = SimpleLeaderboardService.getInstance();
      const data = await leaderboardService.getTeamDailyLeaderboards(teamId);

      setLeaderboards(data);

      // Get team name from cache or default
      const cachedTeams = await AsyncStorage.getItem('@runstr:joined_teams');
      if (cachedTeams) {
        const teams = JSON.parse(cachedTeams);
        const team = teams.find((t: any) => t.id === teamId);
        if (team) {
          setTeamName(team.name);
        }
      }
    } catch (error: any) {
      console.error('[CompetitionsListScreen] Error loading leaderboards:', error);
      setError(error.message || 'Failed to load daily leaderboards');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDailyLeaderboards(true);
  };

  const handleSelectTeam = () => {
    // Navigate to Settings where user can select competition team
    navigation.navigate('Settings');
  };

  // No competition team selected
  if (!loading && !competitionTeamId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyStateTitle}>No Competition Team Selected</Text>
          <Text style={styles.emptyStateDescription}>
            Select a competition team in Settings to see daily leaderboards
          </Text>
          <TouchableOpacity
            style={styles.selectTeamButton}
            onPress={handleSelectTeam}
            activeOpacity={0.7}
          >
            <Text style={styles.selectTeamButtonText}>Select Team</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>

        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <Text style={styles.loadingText}>Loading daily leaderboards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
        </View>

        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Error Loading Leaderboards</Text>
          <Text style={styles.errorDescription}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadDailyLeaderboards()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content - show leaderboards
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.text}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Events</Text>
            <View style={styles.headerSpacer} />
          </View>
          {teamName && (
            <Text style={styles.subtitle}>{teamName}</Text>
          )}
        </View>

        {/* Daily Leaderboard Cards - Only show if user qualifies */}
        {leaderboards && (() => {
          // Check which leaderboards the user appears on
          const userOn5K = userNpub && leaderboards.leaderboard5k.some((entry: any) => entry.pubkey === userNpub);
          const userOn10K = userNpub && leaderboards.leaderboard10k.some((entry: any) => entry.pubkey === userNpub);
          const userOnHalf = userNpub && leaderboards.leaderboardHalf.some((entry: any) => entry.pubkey === userNpub);
          const userOnMarathon = userNpub && leaderboards.leaderboardMarathon.some((entry: any) => entry.pubkey === userNpub);

          const hasAnyWorkouts = userOn5K || userOn10K || userOnHalf || userOnMarathon;

          // If user has no qualifying workouts, show empty state
          if (!hasAnyWorkouts) {
            return (
              <View style={styles.noDataState}>
                <Ionicons name="fitness-outline" size={64} color={theme.colors.textMuted} />
                <Text style={styles.noDataTitle}>No Workouts Today</Text>
                <Text style={styles.noDataDescription}>
                  Be the first to complete a workout and appear on the leaderboard!
                </Text>
              </View>
            );
          }

          // Show only leaderboards where user appears
          return (
            <View style={styles.leaderboardsContainer}>
              {userOn5K && (
                <DailyLeaderboardCard
                  distance="5K"
                  leaderboard={leaderboards.leaderboard5k}
                  style={styles.leaderboardCard}
                />
              )}

              {userOn10K && (
                <DailyLeaderboardCard
                  distance="10K"
                  leaderboard={leaderboards.leaderboard10k}
                  style={styles.leaderboardCard}
                />
              )}

              {userOnHalf && (
                <DailyLeaderboardCard
                  distance="Half Marathon"
                  leaderboard={leaderboards.leaderboardHalf}
                  style={styles.leaderboardCard}
                />
              )}

              {userOnMarathon && (
                <DailyLeaderboardCard
                  distance="Marathon"
                  leaderboard={leaderboards.leaderboardMarathon}
                  style={styles.leaderboardCard}
                />
              )}
            </View>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    paddingBottom: 32,
  },

  header: {
    padding: 20,
    paddingBottom: 16,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerSpacer: {
    width: 40, // Match back button width for centered title
  },

  title: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },

  leaderboardsContainer: {
    paddingHorizontal: 20,
  },

  leaderboardCard: {
    marginBottom: 20,
  },

  // Loading State
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },

  // Empty State (No Team Selected)
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },

  emptyStateDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  selectTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  selectTeamButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },

  errorDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  retryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },

  retryButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  // No Data State (No Workouts Today)
  noDataState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  noDataTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },

  noDataDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
