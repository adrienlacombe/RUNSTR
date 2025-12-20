/**
 * ToggleButtons - Shared toggle/tab component for consistent UI
 * Matches the WorkoutsTab pattern: orange active bg, black text
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../styles/theme';

export interface ToggleOption {
  key: string;
  label: string;
}

interface ToggleButtonsProps {
  options: ToggleOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const ToggleButtons: React.FC<ToggleButtonsProps> = ({
  options,
  activeKey,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.button,
            activeKey === option.key && styles.buttonActive,
          ]}
          onPress={() => onSelect(option.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              activeKey === option.key && styles.buttonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});

export default ToggleButtons;
