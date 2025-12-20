/**
 * LeaderboardsContent - Embeddable leaderboards for Compete screen toggle
 * Shows daily leaderboards from all teams user has joined
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { DailyLeaderboardCard } from '../team/DailyLeaderboardCard';
import SimpleLeaderboardService from '../../services/competition/SimpleLeaderboardService';
import { useNavigationData } from '../../contexts/NavigationDataContext';
import { npubToHex } from '../../utils/ndkConversion';
import { UnifiedCacheService } from '../../services/cache/UnifiedCacheService';

interface TeamLeaderboards {
  teamId: string;
  teamName: string;
  leaderboard5k: any[];
  leaderboard10k: any[];
  leaderboardHalf: any[];
  leaderboardMarathon: any[];
}

export const LeaderboardsContent: React.FC = () => {
  const [teamLeaderboards, setTeamLeaderboards] = useState<TeamLeaderboards[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get user's teams from navigation data
  const { profileData } = useNavigationData();
  const userTeams = profileData?.teams || [];
  const userNpub = profileData?.user?.npub;
  const userHexPubkey = userNpub ? npubToHex(userNpub) || undefined : undefined;

  // Load leaderboards for all user's teams
  const loadAllLeaderboards = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(`[LeaderboardsContent] Loading leaderboards for ${userTeams.length} teams`);

      const allTeamLeaderboards: TeamLeaderboards[] = [];

      for (const team of userTeams) {
        try {
          const dailyLeaderboards =
            await SimpleLeaderboardService.getTeamDailyLeaderboards(
              team.id,
              userHexPubkey
            );

          allTeamLeaderboards.push({
            teamId: team.id,
            teamName: team.name,
            leaderboard5k: dailyLeaderboards.leaderboard5k,
            leaderboard10k: dailyLeaderboards.leaderboard10k,
            leaderboardHalf: dailyLeaderboards.leaderboardHalf,
            leaderboardMarathon: dailyLeaderboards.leaderboardMarathon,
          });
        } catch (error) {
          console.error(`[LeaderboardsContent] Error loading for ${team.name}:`, error);
        }
      }

      setTeamLeaderboards(allTeamLeaderboards);
    } catch (error) {
      console.error('[LeaderboardsContent] Error loading leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userTeams, userHexPubkey]);

  // Load leaderboards on mount
  useEffect(() => {
    if (userTeams.length > 0) {
      loadAllLeaderboards();
    } else {
      setIsLoading(false);
    }
  }, [userTeams.length, loadAllLeaderboards]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await UnifiedCacheService.invalidate('team:*:daily:*');
    await loadAllLeaderboards();
    setRefreshing(false);
  };

  // Calculate if there are any active leaderboards
  const hasAnyLeaderboards = teamLeaderboards.some(
    (team) =>
      team.leaderboard5k.length > 0 ||
      team.leaderboard10k.length > 0 ||
      team.leaderboardHalf.length > 0 ||
      team.leaderboardMarathon.length > 0
  );

  // Loading state
  if (isLoading && teamLeaderboards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.loadingText}>Loading leaderboards...</Text>
      </View>
    );
  }

  // Empty state - No teams joined
  if (userTeams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={theme.colors.accent} />
        <Text style={styles.emptyTitle}>Join a Team</Text>
        <Text style={styles.emptyText}>
          Join a team to participate in competitions and see leaderboards
        </Text>
      </View>
    );
  }

  // Empty state - No workouts today
  if (!hasAnyLeaderboards) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyScrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color={theme.colors.accent} />
          <Text style={styles.emptyTitle}>No Workouts Today</Text>
          <Text style={styles.emptyText}>
            Be the first to complete a workout and appear on the leaderboard!
          </Text>
          <Text style={styles.emptyHint}>Pull down to refresh</Text>
        </View>
      </ScrollView>
    );
  }

  // Main content - Show leaderboards grouped by team
  return (
    <View style={styles.container}>
      {teamLeaderboards.map((team) => {
        // Check if team has any leaderboards
        const hasLeaderboards =
          team.leaderboard5k.length > 0 ||
          team.leaderboard10k.length > 0 ||
          team.leaderboardHalf.length > 0 ||
          team.leaderboardMarathon.length > 0;

        if (!hasLeaderboards) return null;

        return (
          <View key={team.teamId} style={styles.teamSection}>
            {/* Team name header */}
            <View style={styles.teamHeader}>
              <Ionicons
                name="people"
                size={20}
                color={theme.colors.accent}
                style={styles.teamIcon}
              />
              <Text style={styles.teamName}>{team.teamName}</Text>
            </View>

            {/* Daily leaderboard cards */}
            <View style={styles.leaderboardsContainer}>
              {team.leaderboard5k.length > 0 && (
                <DailyLeaderboardCard
                  title={`${team.teamName} 5K`}
                  distance="5km"
                  participants={team.leaderboard5k.length}
                  entries={team.leaderboard5k}
                  onPress={() => console.log('Navigate to 5K leaderboard')}
                />
              )}

              {team.leaderboard10k.length > 0 && (
                <DailyLeaderboardCard
                  title={`${team.teamName} 10K`}
                  distance="10km"
                  participants={team.leaderboard10k.length}
                  entries={team.leaderboard10k}
                  onPress={() => console.log('Navigate to 10K leaderboard')}
                />
              )}

              {team.leaderboardHalf.length > 0 && (
                <DailyLeaderboardCard
                  title={`${team.teamName} Half Marathon`}
                  distance="21.1km"
                  participants={team.leaderboardHalf.length}
                  entries={team.leaderboardHalf}
                  onPress={() => console.log('Navigate to Half Marathon leaderboard')}
                />
              )}

              {team.leaderboardMarathon.length > 0 && (
                <DailyLeaderboardCard
                  title={`${team.teamName} Marathon`}
                  distance="42.2km"
                  participants={team.leaderboardMarathon.length}
                  entries={team.leaderboardMarathon}
                  onPress={() => console.log('Navigate to Marathon leaderboard')}
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.accent,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 16,
    fontStyle: 'italic',
  },
  teamSection: {
    marginTop: 20,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamIcon: {
    marginRight: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  leaderboardsContainer: {
    gap: 12,
  },
});

export default LeaderboardsContent;
