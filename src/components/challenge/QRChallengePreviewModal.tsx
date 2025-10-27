/**
 * QR Challenge Preview Modal
 * Shows scanned QR challenge details with accept/decline options
 * Similar to ChallengeRequestModal but for QR-based challenges
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import type { QRChallengeData } from '../../services/challenge/QRChallengeService';
import { challengeRequestService } from '../../services/challenge/ChallengeRequestService';
import { challengeEscrowService } from '../../services/challenge/ChallengeEscrowService';
import { challengeNotificationHandler } from '../../services/notifications/ChallengeNotificationHandler';
import { getUserNostrIdentifiers } from '../../utils/nostr';
import UnifiedSigningService from '../../services/auth/UnifiedSigningService';
import type { ActivityType } from '../../types/challenge';
import { ChallengePaymentModal } from './ChallengePaymentModal';

// Activity icons mapping (using Ionicons)
const ACTIVITY_ICONS: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  running: 'walk',
  walking: 'walk',
  cycling: 'bicycle',
  hiking: 'trail-sign',
  swimming: 'water',
  rowing: 'boat',
  strength: 'barbell',
  treadmill: 'walk',
  meditation: 'flower',
  yoga: 'flower',
  pushups: 'barbell',
  pullups: 'barbell',
  situps: 'barbell',
  weights: 'barbell',
  workout: 'barbell',
};

export interface QRChallengePreviewModalProps {
  visible: boolean;
  challengeData: QRChallengeData | null;
  onAccept?: () => void;
  onClose: () => void;
}

export const QRChallengePreviewModal: React.FC<
  QRChallengePreviewModalProps
> = ({ visible, challengeData, onAccept, onClose }) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState('');
  const [challengeName, setChallengeName] = useState('');

  if (!challengeData) {
    return null;
  }

  /**
   * Handle accept - first show payment modal (scanner pays)
   */
  const handleAccept = async () => {
    try {
      setIsAccepting(true);

      // Get user identifiers
      const userIdentifiers = await getUserNostrIdentifiers();
      if (!userIdentifiers?.hexPubkey) {
        throw new Error('User not authenticated');
      }

      // Initialize payment record for QR challenge
      await challengeEscrowService.initializePaymentRecord(
        challengeData.challenge_id,
        challengeData.wager,
        challengeData.creator_pubkey,
        userIdentifiers.hexPubkey
      );

      // Generate Lightning invoice for scanner (accepter role)
      const invoiceResult =
        await challengeEscrowService.generateChallengeInvoice(
          challengeData.challenge_id,
          challengeData.wager,
          userIdentifiers.hexPubkey,
          'accepter'
        );

      if (!invoiceResult.success || !invoiceResult.invoice) {
        throw new Error(invoiceResult.error || 'Failed to generate invoice');
      }

      // Show payment modal
      setPaymentInvoice(invoiceResult.invoice);
      setChallengeName(`${challengeData.activity_type} challenge`);
      setShowPaymentModal(true);

      console.log('⚡ Payment modal shown for QR challenge scanner...');
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
   * Handle payment confirmed - now actually accept QR challenge
   */
  const handlePaymentConfirmed = async () => {
    try {
      console.log('✅ Payment confirmed, accepting QR challenge...');
      setShowPaymentModal(false);

      // Get signer from UnifiedSigningService (works for both nsec and Amber)
      const signer = await UnifiedSigningService.getInstance().getSigner();
      if (!signer) {
        throw new Error(
          'Cannot access signing capability. Please ensure you are logged in.'
        );
      }

      // Accept QR challenge (signs and publishes kind 1106 + kind 30000)
      const result = await challengeRequestService.acceptQRChallenge(
        challengeData,
        signer
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to accept challenge');
      }

      // Create payment required notification for creator
      const userIdentifiers = await getUserNostrIdentifiers();
      if (userIdentifiers?.hexPubkey) {
        await challengeNotificationHandler.createPaymentRequiredNotification(
          challengeData.challenge_id,
          userIdentifiers.hexPubkey,
          {
            activityType: challengeData.activity,
            metric: challengeData.metric,
            duration: challengeData.duration,
            wagerAmount: challengeData.wager,
          }
        );
      }

      // Show success with creator payment reminder
      Alert.alert(
        'Challenge Accepted!',
        `You've paid your ${challengeData.wager} sats wager. The creator has been notified to pay their wager to activate the challenge.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onAccept) onAccept();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to accept QR challenge:', error);
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

  const handleDecline = () => {
    // For QR challenges, declining just closes the modal
    // No need to publish decline event since there was no kind 1105 request
    setIsDeclining(true);
    setTimeout(() => {
      setIsDeclining(false);
      onClose();
    }, 300);
  };

  const activityIconName = ACTIVITY_ICONS[challengeData.activity] || 'walk';
  const challengerName = challengeData.creator_name || 'Someone';
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
            <Text style={styles.headerTitle}>
              Challenge from {challengerName}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={isAccepting || isDeclining}
            >
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Challenger Info */}
          <View style={styles.challengerSection}>
            <View style={styles.challengerAvatar}>
              <Text style={styles.challengerInitial}>{challengerInitial}</Text>
            </View>
            <Text style={styles.challengerName}>{challengerName}</Text>
            <Text style={styles.challengerSubtitle}>is challenging you!</Text>
          </View>

          {/* Challenge Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name={activityIconName} size={20} color={theme.colors.accent} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {challengeData.activity.charAt(0).toUpperCase() +
                  challengeData.activity.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="stats-chart" size={20} color={theme.colors.textSecondary} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {challengeData.metric.charAt(0).toUpperCase() +
                  challengeData.metric.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {challengeData.duration} days
              </Text>
            </View>

            {challengeData.wager > 0 && (
              <View style={styles.wagerRow}>
                <Ionicons name="flash" size={20} color={theme.colors.accent} style={styles.detailIcon} />
                <View>
                  <Text style={styles.wagerAmount}>
                    {challengeData.wager.toLocaleString()} sats
                  </Text>
                  <Text style={styles.wagerLabel}>wager</Text>
                </View>
              </View>
            )}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              First to complete the most {challengeData.metric} in{' '}
              {challengeData.duration} days wins!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.declineButton,
                isDeclining && styles.buttonDisabled,
              ]}
              onPress={handleDecline}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textMuted}
                />
              ) : (
                <Text style={styles.declineButtonText}>Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                isAccepting && styles.buttonDisabled,
              ]}
              onPress={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.accentText}
                />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Payment Modal */}
      {showPaymentModal && paymentInvoice && (
        <ChallengePaymentModal
          visible={showPaymentModal}
          challengeId={challengeData.challenge_id}
          challengeName={challengeName}
          wagerAmount={challengeData.wager}
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
    flex: 1,
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIcon: {
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
  infoSection: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
});
