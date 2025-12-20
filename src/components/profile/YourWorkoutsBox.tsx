/**
 * YourWorkoutsBox Component (renamed to Teams)
 * Simple navigation box for Profile screen - shows "TEAMS"
 * Navigates to TeamsScreen for hardcoded teams + charities selection
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export const YourWorkoutsBox: React.FC = () => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Navigate to Teams screen (hardcoded teams + charities)
    // Use parent navigator since Teams is in the stack, not the tab navigator
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('Teams');
    } else {
      navigation.navigate('Teams');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="people-outline" size={24} color={theme.colors.text} />
      <Text style={styles.title}>TEAMS</Text>
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
