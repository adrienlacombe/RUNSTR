/**
 * CharitySection - Display team's supported charity with zap button
 * Shows charity info below team bio on team detail screens
 * Works with ANY Lightning wallet - no NWC required
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
import { CharityZapService } from '../../services/charity/CharityZapService';
import { CharityPaymentModal } from '../charity/CharityPaymentModal';

interface CharitySectionProps {
  charityId?: string;
}

export const CharitySection: React.FC<CharitySectionProps> = ({
  charityId,
}) => {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentInvoice, setPaymentInvoice] = React.useState('');
  const [paymentAmount, setPaymentAmount] = React.useState(0);
  const [charityName, setCharityName] = React.useState('');

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
    // Prompt user for donation amount
    Alert.prompt(
      `Donate to ${charity.name}`,
      'Enter amount in sats:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async (amountText) => {
            if (!amountText) return;

            const amount = parseInt(amountText, 10);
            if (isNaN(amount) || amount <= 0) {
              Alert.alert('Invalid Amount', 'Please enter a valid number of sats.');
              return;
            }

            try {
              // Generate Lightning invoice
              const result = await CharityZapService.generateCharityInvoice(
                charity.id,
                amount
              );

              if (!result.success || !result.invoice) {
                Alert.alert(
                  'Invoice Generation Failed',
                  result.error || 'Unable to generate invoice. Please try again.'
                );
                return;
              }

              // Show payment modal
              setPaymentInvoice(result.invoice);
              setPaymentAmount(amount);
              setCharityName(charity.name);
              setShowPaymentModal(true);
            } catch (error) {
              console.error('[CharitySection] Error generating invoice:', error);
              Alert.alert(
                'Error',
                'Failed to generate invoice. Please try again.'
              );
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleLearnMore = () => {
    if (charity.website) {
      Linking.openURL(charity.website);
    }
  };

  const handlePaymentConfirmed = () => {
    setShowPaymentModal(false);
    Alert.alert(
      'Thank You!',
      `Your donation to ${charityName} has been sent. Thank you for making a difference!`,
      [{ text: 'OK' }]
    );
  };

  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
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
          style={styles.zapButton}
          activeOpacity={0.7}
        >
          <Ionicons name="flash" size={20} color="#000000" />
          <Text style={styles.zapButtonText}>
            Zap
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      {showPaymentModal && paymentInvoice && (
        <CharityPaymentModal
          visible={showPaymentModal}
          charityName={charityName}
          amount={paymentAmount}
          invoice={paymentInvoice}
          onPaymentConfirmed={handlePaymentConfirmed}
          onCancel={handlePaymentCancelled}
        />
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

  zapButtonText: {
    fontSize: 15,
    fontWeight: theme.typography.weights.semiBold,
    color: '#000000',
  },
});
