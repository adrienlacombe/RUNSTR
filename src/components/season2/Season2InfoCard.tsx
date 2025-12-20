/**
 * Season2InfoCard - Simple info card with title and dates
 * Tappable to open explainer modal
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useSeason2Status } from '../../hooks/useSeason2';

interface Season2InfoCardProps {
  onPress: () => void;
}

export const Season2InfoCard: React.FC<Season2InfoCardProps> = ({ onPress }) => {
  const { dateRange, status } = useSeason2Status();

  const getStatusBadge = () => {
    switch (status) {
      case 'upcoming':
        return { label: 'UPCOMING', color: theme.colors.textMuted };
      case 'active':
        return { label: 'LIVE', color: theme.colors.success };
      case 'ended':
        return { label: 'ENDED', color: theme.colors.textDark };
    }
  };

  const badge = getStatusBadge();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Title */}
      <Text style={styles.title}>RUNSTR SEASON II</Text>

      {/* Date and status row */}
      <View style={styles.topRow}>
        <View style={styles.dateSection}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.textMuted}
          />
          <Text style={styles.dateText}>{dateRange}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.color }]}>
          <Text style={styles.statusText}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.infoHint}>
        <Text style={styles.infoHintText}>Tap for details</Text>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={theme.colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    color: theme.colors.orangeBright,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.small,
  },
  statusText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  infoHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  infoHintText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});

export default Season2InfoCard;
