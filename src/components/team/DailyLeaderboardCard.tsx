/**
 * DailyLeaderboardCard - Preview card for daily leaderboards on team page
 * Orange/black theme matching RUNSTR design system
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import type { LeaderboardEntry } from '../../services/competition/SimpleLeaderboardService';

interface DailyLeaderboardCardProps {
  title: string; // "5K Today"
  distance: string; // "5km"
  participants: number; // 7
  topRunner: LeaderboardEntry | null; // { npub, name, time, rank }
  onPress: () => void;
}

export const DailyLeaderboardCard: React.FC<DailyLeaderboardCardProps> = ({
  title,
  distance,
  participants,
  topRunner,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.distance}>{distance}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textMuted}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons
            name="people"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text style={styles.statText}>{participants} runners</Text>
        </View>
      </View>

      {/* Top Runner Preview */}
      {topRunner && (
        <View style={styles.topRunnerRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>1</Text>
          </View>
          <Text style={styles.runnerName}>{topRunner.name}</Text>
          <Text style={styles.runnerTime}>{topRunner.formattedScore}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a', // Dark card background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 140, 0, 0.1)', // Orange tint
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF8C00', // Orange theme
    marginBottom: 2,
  },
  distance: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  topRunnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 140, 0, 0.05)', // Subtle orange background
    borderRadius: 8,
    padding: 10,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C00', // Orange
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000', // Black text on orange
  },
  runnerName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  runnerTime: {
    fontSize: 14,
    color: '#FF8C00', // Orange
    fontWeight: '600',
  },
});
