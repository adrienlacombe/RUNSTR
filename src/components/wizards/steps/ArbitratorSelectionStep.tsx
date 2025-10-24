/**
 * ArbitratorSelectionStep
 * Allows challenge creator to select a team captain as arbitrator
 * Validates captain has Lightning address configured
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import { Avatar } from '../../ui/Avatar';
import { getUserNostrIdentifiers } from '../../../utils/nostr';

interface Team {
  id: string;
  name: string;
  captainPubkey: string;
  captainName?: string;
  captainLightningAddress?: string;
  memberCount?: number;
}

interface ArbitratorSelectionStepProps {
  onSelect: (team: Team) => void;
  onBack?: () => void;
  selectedTeam?: Team | null;
}

export const ArbitratorSelectionStep: React.FC<
  ArbitratorSelectionStepProps
> = ({ onSelect, onBack, selectedTeam }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserTeams();
  }, []);

  const loadUserTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const userIdentifiers = await getUserNostrIdentifiers();
      if (!userIdentifiers?.hexPubkey) {
        throw new Error('User not authenticated');
      }

      // Fetch user's teams from Nostr
      // For now, we'll use a placeholder - you'll need to implement actual team fetching
      const { NdkTeamService } = await import(
        '../../../services/nostr/NdkTeamService'
      );
      const teamService = NdkTeamService.getInstance();

      const userTeams = await teamService.getUserTeams(
        userIdentifiers.hexPubkey
      );

      // Fetch captain details for each team
      const teamsWithCaptains = await Promise.all(
        userTeams.map(async (team) => {
          // Fetch captain's profile to get Lightning address
          const captainProfile = await fetchCaptainProfile(team.captainPubkey);

          return {
            id: team.id,
            name: team.name,
            captainPubkey: team.captainPubkey,
            captainName: captainProfile?.name || 'Team Captain',
            captainLightningAddress:
              captainProfile?.lud16 || captainProfile?.lud06,
            memberCount: team.memberCount,
          };
        })
      );

      setTeams(teamsWithCaptains);
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaptainProfile = async (captainPubkey: string) => {
    try {
      const { GlobalNDKService } = await import(
        '../../../services/nostr/GlobalNDKService'
      );
      const ndk = await GlobalNDKService.getInstance();
      const user = ndk.getUser({ pubkey: captainPubkey });
      await user.fetchProfile();
      return user.profile;
    } catch (error) {
      console.error('Failed to fetch captain profile:', error);
      return null;
    }
  };

  const handleTeamSelect = (team: Team) => {
    if (!team.captainLightningAddress) {
      // Show warning that captain needs Lightning address
      return;
    }
    onSelect(team);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading your teams...</Text>
        </View>
      </View>
    );
  }

  if (error || teams.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Select Arbitrator</Text>
        </View>

        <View style={styles.emptyState}>
          <Ionicons
            name="people-outline"
            size={64}
            color={theme.colors.textMuted}
          />
          <Text style={styles.emptyTitle}>No Teams Found</Text>
          <Text style={styles.emptyText}>
            You need to be a member of a team to use team arbitration. Join a
            team first, then create a challenge.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Select Arbitrator</Text>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons
          name="information-circle"
          size={20}
          color={theme.colors.orangeBright}
        />
        <Text style={styles.infoText}>
          The team captain will hold both wagers and pay the winner
          automatically
        </Text>
      </View>

      {/* Team List */}
      <ScrollView style={styles.teamList} showsVerticalScrollIndicator={false}>
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            selected={selectedTeam?.id === team.id}
            onSelect={handleTeamSelect}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface TeamCardProps {
  team: Team;
  selected: boolean;
  onSelect: (team: Team) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, selected, onSelect }) => {
  const hasLightningAddress = !!team.captainLightningAddress;

  return (
    <TouchableOpacity
      style={[
        styles.teamCard,
        selected && styles.teamCardSelected,
        !hasLightningAddress && styles.teamCardDisabled,
      ]}
      onPress={() => hasLightningAddress && onSelect(team)}
      disabled={!hasLightningAddress}
    >
      {/* Team Info */}
      <View style={styles.teamInfo}>
        <Avatar name={team.name} size={48} />
        <View style={styles.teamDetails}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.captainInfo}>
            <Ionicons name="shield" size={14} color={theme.colors.textMuted} />
            <Text style={styles.captainName}>{team.captainName}</Text>
          </View>
          {team.memberCount && (
            <Text style={styles.memberCount}>{team.memberCount} members</Text>
          )}
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        {hasLightningAddress ? (
          <>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={24}
              color={selected ? theme.colors.accent : theme.colors.textMuted}
            />
            <View style={styles.lightningBadge}>
              <Ionicons
                name="flash"
                size={12}
                color={theme.colors.orangeBright}
              />
              <Text style={styles.lightningBadgeText}>Ready</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons
              name="alert-circle"
              size={24}
              color={theme.colors.error}
            />
            <Text style={styles.noLightningText}>
              Captain needs Lightning address
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 157, 66, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.orangeBright,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  teamList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  teamCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(255, 157, 66, 0.1)',
  },
  teamCardDisabled: {
    opacity: 0.5,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  captainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  captainName: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  memberCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  lightningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 157, 66, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lightningBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.orangeBright,
  },
  noLightningText: {
    fontSize: 10,
    color: theme.colors.error,
    textAlign: 'right',
    maxWidth: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
