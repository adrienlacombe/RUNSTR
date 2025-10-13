/**
 * CharitySection - Display team's supported charity with zap button
 * Shows charity info below team bio on team detail screens
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { getCharityById } from '../../constants/charities';
import { NWCStorageService } from '../../services/wallet/NWCStorageService';

interface CharitySectionProps {
  charityId?: string;
  onZapCharity: (charityId: string, charityName: string) => void;
}

export const CharitySection: React.FC<CharitySectionProps> = ({
  charityId,
  onZapCharity,
}) => {
  const [hasWallet, setHasWallet] = React.useState(false);

  // Check wallet status on mount
  React.useEffect(() => {
    const checkWallet = async () => {
      const walletConfigured = await NWCStorageService.hasNWC();
      setHasWallet(walletConfigured);
    };
    checkWallet();
  }, []);

  // If no charity selected, don't render anything
  if (!charityId) {
    return null;
  }

  const charity = getCharityById(charityId);

  // If charity ID is invalid, don't render
  if (!charity) {
    return null;
  }

  const handleZapPress = () => {
    if (!hasWallet) {
      Alert.alert(
        'Wallet Required',
        'Please connect your wallet in your profile to send zaps.',
        [{ text: 'OK' }]
      );
      return;
    }

    onZapCharity(charity.id, charity.name);
  };

  const handleLearnMore = () => {
    if (charity.website) {
      Linking.openURL(charity.website);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Label */}
      <Text style={styles.sectionLabel}>Team Charity</Text>

      {/* Charity Card */}
      <View style={styles.charityCard}>
        {/* Charity Icon */}
        <View style={styles.charityIconContainer}>
          <Ionicons name="heart" size={24} color="#FF9D42" />
        </View>

        {/* Charity Info */}
        <View style={styles.charityInfo}>
          <Text style={styles.charityName}>{charity.name}</Text>
          <Text style={styles.charityDescription}>{charity.description}</Text>

          {/* Learn More Link */}
          {charity.website && (
            <TouchableOpacity onPress={handleLearnMore} style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn more</Text>
              <Ionicons name="open-outline" size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Zap Button */}
        <TouchableOpacity
          onPress={handleZapPress}
          style={[styles.zapButton, !hasWallet && styles.zapButtonDisabled]}
          disabled={!hasWallet}
          activeOpacity={0.7}
        >
          <Ionicons name="flash" size={20} color={hasWallet ? '#000000' : theme.colors.textMuted} />
          <Text style={[styles.zapButtonText, !hasWallet && styles.zapButtonTextDisabled]}>
            Zap
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Required Message */}
      {!hasWallet && (
        <Text style={styles.walletRequiredText}>
          Connect wallet in your profile to support {charity.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  charityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
  },

  charityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 157, 66, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  charityInfo: {
    flex: 1,
  },

  charityName: {
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },

  charityDescription: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },

  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  learnMoreText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textDecorationLine: 'underline',
  },

  zapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF9D42',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },

  zapButtonDisabled: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  zapButtonText: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semiBold,
    color: '#000000',
  },

  zapButtonTextDisabled: {
    color: theme.colors.textMuted,
  },

  walletRequiredText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
