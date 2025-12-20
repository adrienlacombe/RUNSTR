/**
 * MyTeamsBox Component (renamed to Stats)
 * Simple navigation box for Profile screen - shows "STATS"
 * Navigates to WorkoutHistoryScreen (which has Advanced button at top for AdvancedAnalytics)
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export const MyTeamsBox: React.FC = () => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Navigate to WorkoutHistory screen (has Stats button at top for analytics)
    // Use parent navigator since WorkoutHistory is in the stack, not the tab navigator
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('WorkoutHistory');
    } else {
      navigation.navigate('WorkoutHistory');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="stats-chart-outline" size={24} color={theme.colors.text} />
      <Text style={styles.title}>STATS</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
});
