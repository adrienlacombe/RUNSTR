/**
 * FilterChips - Horizontal scrollable filter chips for multi-option filtering
 * Used for activity type filters (All, Running, Cycling, Walking, etc.)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../../styles/theme';

export interface FilterOption {
  key: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  activeKey,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.chip,
              activeKey === option.key && styles.chipActive,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                activeKey === option.key && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.cardBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.text, // #FFB366
    borderColor: theme.colors.text,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.background,
    fontWeight: theme.typography.weights.semiBold,
  },
});

export default FilterChips;
