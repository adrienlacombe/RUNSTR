/**
 * YourCompetitionsBox Component (renamed to Rewards)
 * Simple navigation box for Profile screen - shows "REWARDS"
 * Navigates to RewardsScreen for wallet/earnings management
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export const YourCompetitionsBox: React.FC = () => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Navigate to Rewards screen (wallet/earnings)
    // Use parent navigator since Rewards is in the stack, not the tab navigator
    const parentNav = navigation.getParent();
    if (parentNav) {
      parentNav.navigate('Rewards');
    } else {
      navigation.navigate('Rewards');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="wallet-outline" size={24} color={theme.colors.text} />
      <Text style={styles.title}>REWARDS</Text>
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
