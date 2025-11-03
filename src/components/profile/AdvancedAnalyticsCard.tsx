/**
 * AdvancedAnalyticsCard Component
 * Touchable card linking to Advanced Analytics screen
 * Styled to match WorkoutLevelRing with RUNSTR orange/gold theme
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface AdvancedAnalyticsCardProps {
  onPress: () => void;
}

export const AdvancedAnalyticsCard: React.FC<AdvancedAnalyticsCardProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon Section */}
      <View style={styles.iconContainer}>
        <Ionicons name="stats-chart" size={48} color="#FF9D42" />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Stats</Text>
        <Text style={styles.subtitle}>View workout stats & insights</Text>
      </View>

      {/* Privacy Badge */}
      <View style={styles.privacyBadge}>
        <Ionicons name="lock-closed" size={12} color="#CC7A33" />
        <Text style={styles.privacyText}>Local only</Text>
      </View>

      {/* Arrow Indicator */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={24} color="#FF9D42" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a', // Match WorkoutLevelRing dark background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a', // Match WorkoutLevelRing border
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF7B1C', // Orange accent border
  },

  contentContainer: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: '#FFB366', // Light orange - matches level number
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    fontWeight: theme.typography.weights.medium,
    color: '#CC7A33', // Muted orange - matches stat labels
  },

  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    position: 'absolute',
    top: 12,
    right: 12,
  },

  privacyText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semiBold,
    color: '#CC7A33',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  arrowContainer: {
    marginLeft: 'auto',
  },
});
