/**
 * HealthSnapshotCard - 3-column display of BMI, VO2 Max, and Fitness Age
 * Privacy-preserving health metrics calculated locally
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import type { BodyCompositionMetrics, VO2MaxData } from '../../types/analytics';

interface HealthSnapshotCardProps {
  bodyComposition?: BodyCompositionMetrics;
  vo2MaxData?: VO2MaxData;
}

export const HealthSnapshotCard: React.FC<HealthSnapshotCardProps> = ({
  bodyComposition,
  vo2MaxData,
}) => {
  // If no data, show prompt
  if (!bodyComposition && !vo2MaxData) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Add weight & height in Health Profile for BMI and fitness age estimates
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BMI Column */}
      <View style={styles.column}>
        <Text style={styles.label}>BMI</Text>
        {bodyComposition ? (
          <>
            <Text style={styles.value}>{bodyComposition.currentBMI}</Text>
            <Text style={styles.category}>
              {bodyComposition.bmiCategory.charAt(0).toUpperCase() +
                bodyComposition.bmiCategory.slice(1)}
            </Text>
          </>
        ) : (
          <Text style={styles.noData}>-</Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* VO2 Max Column */}
      <View style={styles.column}>
        <Text style={styles.label}>VO₂ Max</Text>
        {vo2MaxData ? (
          <>
            <Text style={styles.value}>{vo2MaxData.estimate}</Text>
            <Text style={styles.category}>
              {vo2MaxData.category.charAt(0).toUpperCase() +
                vo2MaxData.category.slice(1)}
            </Text>
          </>
        ) : (
          <Text style={styles.noData}>-</Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Fitness Age Column */}
      <View style={styles.column}>
        <Text style={styles.label}>Fitness Age</Text>
        {vo2MaxData ? (
          <>
            <Text style={styles.value}>{vo2MaxData.fitnessAge}</Text>
            <Text style={styles.category}>years</Text>
          </>
        ) : (
          <Text style={styles.noData}>-</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 20,
    marginBottom: 16,
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  divider: {
    width: 1,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: '#CC7A33',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  value: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: '#FF9D42',
    marginBottom: 4,
  },

  category: {
    fontSize: 13,
    fontWeight: theme.typography.weights.medium,
    color: '#FFB366',
  },

  noData: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
