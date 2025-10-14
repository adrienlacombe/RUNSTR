/**
 * ChallengePaymentModal - Universal payment modal for challenge wagers
 * Shows Lightning invoice, polls for payment, handles success/timeout
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../styles/theme';
import { challengeEscrowService } from '../../services/challenge/ChallengeEscrowService';

export interface ChallengePaymentModalProps {
  visible: boolean;
  challengeId: string;
  wagerAmount: number;
  invoice: string;
  paymentHash: string;
  userPubkey: string;
  role: 'creator' | 'accepter';
  onPaymentConfirmed: () => void;
  onCancel: () => void;
  onTimeout: () => void;
}

export const ChallengePaymentModal: React.FC<ChallengePaymentModalProps> = ({
  visible,
  challengeId,
  wagerAmount,
  invoice,
  paymentHash,
  userPubkey,
  role,
  onPaymentConfirmed,
  onCancel,
  onTimeout,
}) => {
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [copied, setCopied] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Start polling when modal becomes visible
  useEffect(() => {
    if (visible && invoice && paymentHash) {
      startPolling();
      startCountdown();
    } else {
      stopPolling();
      stopCountdown();
    }

    return () => {
      stopPolling();
      stopCountdown();
    };
  }, [visible, invoice, paymentHash]);

  /**
   * Start polling for payment confirmation
   */
  const startPolling = () => {
    if (isPolling) return;

    console.log('⏳ Starting payment polling...');
    setIsPolling(true);

    // Poll immediately
    checkPayment();

    // Then poll every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      checkPayment();
    }, 5000);

    // Set timeout (10 minutes)
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, 10 * 60 * 1000);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  };

  /**
   * Start countdown timer
   */
  const startCountdown = () => {
    setTimeRemaining(600); // Reset to 10 minutes
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Stop countdown timer
   */
  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  /**
   * Check if payment has been confirmed
   */
  const checkPayment = async () => {
    try {
      const result = await challengeEscrowService.checkInvoicePayment(paymentHash);

      if (result.success && result.settled) {
        console.log('✅ Payment confirmed!');
        stopPolling();
        stopCountdown();

        // Record payment
        await challengeEscrowService.recordPayment(
          challengeId,
          userPubkey,
          paymentHash,
          invoice
        );

        // Notify parent
        onPaymentConfirmed();
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    }
  };

  /**
   * Handle payment timeout
   */
  const handleTimeout = () => {
    stopPolling();
    stopCountdown();
    Alert.alert(
      'Payment Timeout',
      'Payment was not received within 10 minutes. The challenge will be cancelled.',
      [
        {
          text: 'OK',
          onPress: onTimeout,
        },
      ]
    );
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel? The challenge will not be created.',
      [
        {
          text: 'Keep Waiting',
          style: 'cancel',
        },
        {
          text: 'Cancel Challenge',
          style: 'destructive',
          onPress: () => {
            stopPolling();
            stopCountdown();
            onCancel();
          },
        },
      ]
    );
  };

  /**
   * Copy invoice to clipboard
   */
  const handleCopyInvoice = () => {
    Clipboard.setString(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Format time remaining as MM:SS
   */
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const roleText = role === 'creator' ? 'Creating' : 'Accepting';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{roleText} Challenge</Text>
            <Text style={styles.wagerAmount}>{wagerAmount.toLocaleString()} sats</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={invoice}
              size={200}
              backgroundColor={theme.colors.cardBackground}
              color={theme.colors.text}
            />
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>
            Scan QR code or copy invoice below to pay with your Lightning wallet
          </Text>

          {/* Invoice Text (truncated) */}
          <View style={styles.invoiceContainer}>
            <Text style={styles.invoiceText} numberOfLines={2} ellipsizeMode="middle">
              {invoice}
            </Text>
          </View>

          {/* Copy Button */}
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyInvoice}>
            <Text style={styles.copyButtonText}>
              {copied ? '✓ Copied' : 'Copy Invoice'}
            </Text>
          </TouchableOpacity>

          {/* Status */}
          <View style={styles.statusContainer}>
            {isPolling && (
              <>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <Text style={styles.statusText}>Waiting for payment...</Text>
              </>
            )}
          </View>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>Time remaining: {formatTimeRemaining()}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <Text style={styles.warning}>
            Do not close this screen until payment is confirmed
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.large,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  wagerAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.accent,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  invoiceContainer: {
    backgroundColor: theme.colors.prizeBackground,
    borderRadius: theme.borderRadius.small,
    padding: 12,
    marginBottom: 12,
  },
  invoiceText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.accentText,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    minHeight: 30,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  actions: {
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.buttonBorder,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  warning: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
