/**
 * ChallengeRequestModal - Display incoming challenge request with accept/decline
 * Shows challenge details and allows user to respond
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import type { PendingChallenge } from '../../services/challenge/ChallengeRequestService';
import { challengeRequestService } from '../../services/challenge/ChallengeRequestService';
import { challengePaymentService } from '../../services/challenge/ChallengePaymentService';
import { getUserNostrIdentifiers } from '../../utils/nostr';
import UnifiedSigningService from '../../services/auth/UnifiedSigningService';
import { ChallengePaymentModal } from './ChallengePaymentModal';

export interface ChallengeRequestModalProps {
  visible: boolean;
  challenge: PendingChallenge | null;
  onAccept?: () => void;
  onDecline?: () => void;
  onClose: () => void;
}

// Activity icons mapping
const ACTIVITY_ICONS: Record<string, string> = {
  running: '🏃',
  walking: '🚶',
  cycling: '🚴',
  hiking: '🥾',
  swimming: '🏊',
  rowing: '🚣',
  workout: '💪',
};

export const ChallengeRequestModal: React.FC<ChallengeRequestModalProps> = ({
  visible,
  challenge,
  onAccept,
  onDecline,
  onClose,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Lightning address collection state
  const [showLightningInput, setShowLightningInput] = useState(false);
  const [lightningAddress, setLightningAddress] = useState('');

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState('');
  const [challengeName, setChallengeName] = useState('');

  if (!challenge) {
    return null;
  }

  /**
   * Handle accept - first collect Lightning address
   */
  const handleAccept = () => {
    // For paid challenges, collect Lightning address first
    if (challenge.wagerAmount > 0) {
      setShowLightningInput(true);
    } else {
      // For free challenges, accept directly
      handleAcceptWithAddress('');
    }
  };

  /**
   * Handle accept after Lightning address is provided
   */
  const handleAcceptWithAddress = async (accepterAddress: string) => {
    try {
      setIsAccepting(true);
      setShowLightningInput(false);

      // Validate Lightning address for paid challenges
      if (challenge.wagerAmount > 0) {
        if (!accepterAddress || !accepterAddress.includes('@')) {
          throw new Error('Please provide a valid Lightning address (e.g., you@getalby.com)');
        }

        // Validate creator has Lightning address
        if (!challenge.creatorLightningAddress) {
          throw new Error('Challenge creator has not provided a Lightning address');
        }

        // Generate invoice from creator's Lightning address
        console.log(`⚡ Generating invoice from creator's address: ${challenge.creatorLightningAddress}`);
        const invoiceResult = await challengePaymentService.generateWagerInvoice(
          challenge.creatorLightningAddress,
          challenge.wagerAmount,
          challenge.challengeId,
          'accepter'
        );

        if (!invoiceResult.success || !invoiceResult.invoice) {
          throw new Error(invoiceResult.error || 'Failed to generate invoice');
        }

        // Store accepter's Lightning address for later
        setLightningAddress(accepterAddress);

        // Show payment modal
        setPaymentInvoice(invoiceResult.invoice);
        setChallengeName(`${challenge.activityType} challenge`);
        setShowPaymentModal(true);

        console.log('⚡ Payment modal shown for accepter...');
      } else {
        // Free challenge - accept directly
        await handlePaymentConfirmed();
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      Alert.alert(
        'Payment Setup Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
      setIsAccepting(false);
    }
  };

  /**
   * Handle payment confirmed - now actually accept challenge
   */
  const handlePaymentConfirmed = async () => {
    try {
      console.log('✅ Payment confirmed, accepting challenge...');
      setShowPaymentModal(false);

      // Get signer from UnifiedSigningService (works for both nsec and Amber)
      const signer = await UnifiedSigningService.getInstance().getSigner();
      if (!signer) {
        throw new Error('Cannot access signing capability. Please ensure you are logged in.');
      }

      // Accept challenge (signs and publishes kind 1106 + kind 30000)
      // Include accepter's Lightning address if this is a paid challenge
      const result = await challengeRequestService.acceptChallenge(
        challenge.challengeId,
        signer,
        lightningAddress || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to accept challenge');
      }

      // Show success
      Alert.alert('Challenge Accepted!', 'The challenge is now active', [
        {
          text: 'OK',
          onPress: () => {
            if (onAccept) onAccept();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to accept challenge:', error);
      Alert.alert(
        'Accept Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsAccepting(false);
    }
  };

  /**
   * Handle payment cancelled
   */
  const handlePaymentCancelled = () => {
    setShowPaymentModal(false);
    setIsAccepting(false);
    Alert.alert('Payment Cancelled', 'Challenge was not accepted.');
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);

      // Get signer from UnifiedSigningService (works for both nsec and Amber)
      const signer = await UnifiedSigningService.getInstance().getSigner();
      if (!signer) {
        throw new Error('Cannot access signing capability. Please ensure you are logged in.');
      }

      // Decline challenge (signs and publishes kind 1107)
      const result = await challengeRequestService.declineChallenge(
        challenge.challengeId,
        signer
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to decline challenge');
      }

      // Close modal
      if (onDecline) onDecline();
      onClose();
    } catch (error) {
      console.error('Failed to decline challenge:', error);
      Alert.alert(
        'Decline Failed',
        error instanceof Error ? error.message : 'An error occurred'
      );
    } finally {
      setIsDeclining(false);
    }
  };

  const activityIcon = ACTIVITY_ICONS[challenge.activityType] || '🏃';
  const challengerName = challenge.challengerName || 'Someone';
  const challengerInitial = challengerName.charAt(0).toUpperCase();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Challenge Request</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isAccepting || isDeclining}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Challenger Info */}
          <View style={styles.challengerSection}>
            <View style={styles.challengerAvatar}>
              <Text style={styles.challengerInitial}>{challengerInitial}</Text>
            </View>
            <Text style={styles.challengerName}>{challengerName}</Text>
            <Text style={styles.challengerSubtitle}>challenged you!</Text>
          </View>

          {/* Challenge Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>{activityIcon}</Text>
              <Text style={styles.detailText}>
                {challenge.activityType.charAt(0).toUpperCase() +
                  challenge.activityType.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailText}>
                {challenge.metric.charAt(0).toUpperCase() +
                  challenge.metric.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{challenge.duration} days</Text>
            </View>

            {challenge.wagerAmount > 0 && (
              <View style={styles.wagerRow}>
                <Text style={styles.detailIcon}>⚡</Text>
                <View>
                  <Text style={styles.wagerAmount}>
                    {challenge.wagerAmount.toLocaleString()} sats
                  </Text>
                  <Text style={styles.wagerLabel}>wager</Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.declineButton, isDeclining && styles.buttonDisabled]}
              onPress={handleDecline}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
              ) : (
                <Text style={styles.declineButtonText}>Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, isAccepting && styles.buttonDisabled]}
              onPress={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color={theme.colors.accentText} />
              ) : (
                <Text style={styles.acceptButtonText}>Accept ✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Lightning Address Input Modal */}
      <Modal
        visible={showLightningInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowLightningInput(false);
          setIsAccepting(false);
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Your Lightning Address</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowLightningInput(false);
                  setIsAccepting(false);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lightningInputSection}>
              <Text style={styles.lightningLabel}>
                If you win this challenge, you'll receive {(challenge.wagerAmount * 2).toLocaleString()} sats at this address:
              </Text>

              <View style={styles.lightningInputContainer}>
                <Ionicons name="flash" size={20} color={theme.colors.accent} style={styles.lightningIcon} />
                <TextInput
                  style={styles.lightningInput}
                  value={lightningAddress}
                  onChangeText={setLightningAddress}
                  placeholder="you@getalby.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />
              </View>

              <Text style={styles.lightningHelper}>
                💡 Get a free Lightning address at getalby.com
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                !lightningAddress.includes('@') && styles.buttonDisabled,
              ]}
              onPress={() => handleAcceptWithAddress(lightningAddress)}
              disabled={!lightningAddress.includes('@')}
            >
              <Text style={styles.continueButtonText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      {showPaymentModal && paymentInvoice && (
        <ChallengePaymentModal
          visible={showPaymentModal}
          challengeId={challenge.challengeId}
          challengeName={challengeName}
          wagerAmount={challenge.wagerAmount}
          invoice={paymentInvoice}
          role="accepter"
          onPaymentConfirmed={handlePaymentConfirmed}
          onCancel={handlePaymentCancelled}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  challengerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  challengerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.syncBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengerInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  challengerName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  challengerSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: theme.colors.prizeBackground,
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  wagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  wagerAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  wagerLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.buttonBorder,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accentText,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  lightningInputSection: {
    paddingVertical: 20,
  },
  lightningLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  lightningInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  lightningIcon: {
    marginRight: 8,
  },
  lightningInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    paddingVertical: 12,
  },
  lightningHelper: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.accentText,
  },
});
