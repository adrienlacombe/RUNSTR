/**
 * CalorieBalanceCard - Today's calorie intake vs burn with visual bars
 * Shows net balance (surplus/deficit)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import type { DailyCalorieBalance } from '../../services/analytics/CaloricAnalyticsService';

interface CalorieBalanceCardProps {
  dailyBalance: DailyCalorieBalance;
}

export const CalorieBalanceCard: React.FC<CalorieBalanceCardProps> = ({
  dailyBalance,
}) => {
  const maxCalories = Math.max(
    dailyBalance.caloriesIn,
    dailyBalance.caloriesOut,
    1000
  ); // Min 1000 for scale

  const inPercentage = (dailyBalance.caloriesIn / maxCalories) * 100;
  const outPercentage = (dailyBalance.caloriesOut / maxCalories) * 100;

  const isSurplus = dailyBalance.netBalance > 0;
  const balanceLabel = isSurplus ? 'Surplus' : 'Deficit';
  const balanceColor = isSurplus ? '#FF9D42' : '#4CAF50';

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Today</Text>

      {/* Calories In */}
      <View style={styles.row}>
        <Text style={styles.label}>In:</Text>
        <View style={styles.barContainer}>
          <View
            style={[styles.barFill, styles.barIn, { width: `${inPercentage}%` }]}
          />
        </View>
        <Text style={styles.value}>{dailyBalance.caloriesIn} kcal</Text>
      </View>

      {/* Calories Out */}
      <View style={styles.row}>
        <Text style={styles.label}>Out:</Text>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.barFill,
              styles.barOut,
              { width: `${outPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.value}>{dailyBalance.caloriesOut} kcal</Text>
      </View>

      {/* Net Balance */}
      <View style={styles.netContainer}>
        <Text style={styles.netLabel}>Net:</Text>
        <Text style={[styles.netValue, { color: balanceColor }]}>
          {isSurplus ? '+' : ''}
          {dailyBalance.netBalance.toLocaleString()} kcal
        </Text>
        <Text style={styles.balanceLabel}>({balanceLabel})</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FFB366',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  label: {
    width: 40,
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },

  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },

  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  barIn: {
    backgroundColor: '#FF9D42',
  },

  barOut: {
    backgroundColor: '#4CAF50',
  },

  value: {
    width: 90,
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    textAlign: 'right',
  },

  netContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },

  netLabel: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginRight: 12,
  },

  netValue: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
  },

  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
});
