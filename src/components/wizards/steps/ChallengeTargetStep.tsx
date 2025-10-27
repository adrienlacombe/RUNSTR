/**
 * ChallengeTargetStep - Choose between Direct challenge or QR sharing
 * Step 2 of the simplified challenge wizard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../../../styles/theme';

export type ChallengeTarget = 'direct' | 'qr';

interface ChallengeTargetStepProps {
  selectedTarget?: ChallengeTarget;
  onSelectTarget: (target: ChallengeTarget) => void;
}

export const ChallengeTargetStep: React.FC<ChallengeTargetStepProps> = ({
  selectedTarget,
  onSelectTarget,
}) => {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        style={[
          styles.targetOption,
          selectedTarget === 'direct' && styles.targetOptionSelected,
        ]}
        onPress={() => onSelectTarget('direct')}
        activeOpacity={0.7}
      >
        <View style={styles.targetHeader}>
          <Text
            style={[
              styles.targetTitle,
              selectedTarget === 'direct' && styles.targetTitleSelected,
            ]}
          >
            Challenge Specific Person
          </Text>
        </View>
        <Text style={styles.targetDescription}>
          Pick a teammate to challenge directly
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.targetOption,
          selectedTarget === 'qr' && styles.targetOptionSelected,
        ]}
        onPress={() => onSelectTarget('qr')}
        activeOpacity={0.7}
      >
        <View style={styles.targetHeader}>
          <Text
            style={[
              styles.targetTitle,
              selectedTarget === 'qr' && styles.targetTitleSelected,
            ]}
          >
            Share QR Code
          </Text>
        </View>
        <Text style={styles.targetDescription}>
          Generate QR code - anyone can scan and join
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 20,
    gap: 16,
  },
  targetOption: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 20,
  },
  targetOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },
  targetHeader: {
    marginBottom: 8,
  },
  targetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  targetTitleSelected: {
    color: theme.colors.accent,
  },
  targetDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
