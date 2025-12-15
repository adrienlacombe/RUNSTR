/**
 * EventJoinButton - Smart join/donate button for Satlantis events
 *
 * Shows different states based on event configuration and user status:
 * - "Join Event" for free events
 * - "Donate & Join (X sats)" for donation events (soft requirement)
 * - "Joined" if user already RSVPd
 * - Disabled for ended events
 *
 * Uses ExternalZapModal pattern for donations - any Lightning wallet can pay.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { SatlantisEventJoinService } from '../../services/satlantis/SatlantisEventJoinService';
import { ExternalZapModal } from '../nutzap/ExternalZapModal';
import { ProfileService } from '../../services/user/profileService';
import type { SatlantisEvent } from '../../types/satlantis';

interface EventJoinButtonProps {
  event: SatlantisEvent;
  onJoinSuccess?: () => void;
  onError?: (error: string) => void;
}

type ButtonState =
  | 'loading'
  | 'join_free'
  | 'join_donation' // Shows donation modal
  | 'joined'
  | 'ended'
  | 'error';

export const EventJoinButton: React.FC<EventJoinButtonProps> = ({
  event,
  onJoinSuccess,
  onError,
}) => {
  const [state, setState] = useState<ButtonState>('loading');
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimisticJoined, setOptimisticJoined] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [creatorLightningAddress, setCreatorLightningAddress] = useState<string>('');

  // Check initial state
  useEffect(() => {
    checkJoinStatus();
    resolveCreatorLightningAddress();
  }, [event.id]);

  // Resolve creator's lightning address for donations
  const resolveCreatorLightningAddress = useCallback(async () => {
    try {
      const profile = await ProfileService.getUserProfile(event.pubkey);
      if (profile?.lud16) {
        setCreatorLightningAddress(profile.lud16);
        console.log('[EventJoinButton] Creator lightning address:', profile.lud16);
      }
    } catch (error) {
      console.warn('[EventJoinButton] Could not resolve creator lightning address:', error);
    }
  }, [event.pubkey]);

  const checkJoinStatus = useCallback(async () => {
    try {
      // Check if event has ended
      const now = Math.floor(Date.now() / 1000);
      if (now > event.endTime) {
        setState('ended');
        return;
      }

      // Check if user already joined
      const hasJoined = await SatlantisEventJoinService.hasUserJoined(event);
      if (hasJoined) {
        setState('joined');
        setOptimisticJoined(false);
        return;
      }

      // Determine join type based on event configuration
      const requirements = SatlantisEventJoinService.getJoinRequirements(event);
      if (!requirements.canJoin) {
        setState('ended');
      } else if (requirements.hasDonation) {
        setState('join_donation');
      } else {
        setState('join_free');
      }
    } catch (error) {
      console.error('[EventJoinButton] Error checking status:', error);
      setState('error');
    }
  }, [event]);

  // Handle direct join (free events or after donation)
  const handleJoinEvent = useCallback(async (donationMade?: boolean) => {
    setIsProcessing(true);
    setOptimisticJoined(true);

    try {
      const result = await SatlantisEventJoinService.joinEvent(event, donationMade);

      if (result.success) {
        setState('joined');
        onJoinSuccess?.();
      } else {
        setOptimisticJoined(false);
        onError?.(result.error || 'Failed to join event');
      }
    } catch (error) {
      setOptimisticJoined(false);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  }, [event, onJoinSuccess, onError]);

  const handlePress = useCallback(async () => {
    if (isProcessing) return;

    if (state === 'join_free') {
      await handleJoinEvent();
    } else if (state === 'join_donation') {
      // Show donation modal
      if (creatorLightningAddress) {
        setShowDonationModal(true);
      } else {
        // No lightning address - just join without donation
        console.log('[EventJoinButton] No creator lightning address, joining without donation');
        await handleJoinEvent(false);
      }
    }
  }, [state, isProcessing, creatorLightningAddress, handleJoinEvent]);

  // Handle donation success - join event after donation
  const handleDonationSuccess = useCallback(async () => {
    setShowDonationModal(false);
    await handleJoinEvent(true);
  }, [handleJoinEvent]);

  // Handle donation modal close - ask if they want to join without donating
  const handleDonationClose = useCallback(() => {
    setShowDonationModal(false);
  }, []);

  // Handle "Join Without Donating" option
  const handleJoinWithoutDonation = useCallback(async () => {
    setShowDonationModal(false);
    await handleJoinEvent(false);
  }, [handleJoinEvent]);

  // Use optimistic state for display
  const isJoined = state === 'joined' || optimisticJoined;

  // Get suggested donation amount
  const donationAmount = event.suggestedDonationSats || event.entryFeeSats || 0;

  // Render based on state
  const renderContent = () => {
    if (state === 'loading' || (isProcessing && !optimisticJoined)) {
      return <ActivityIndicator size="small" color={theme.colors.background} />;
    }

    if (isJoined) {
      return (
        <View style={styles.joinedContent}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.success}
          />
          <Text style={styles.joinedText}>
            {optimisticJoined && state !== 'joined' ? 'Joining...' : 'Joined'}
          </Text>
        </View>
      );
    }

    switch (state) {
      case 'ended':
        return <Text style={styles.endedText}>Event Ended</Text>;

      case 'join_free':
        return <Text style={styles.buttonText}>Join Event</Text>;

      case 'join_donation':
        return (
          <View style={styles.donationContent}>
            <Ionicons name="flash" size={18} color={theme.colors.background} />
            <Text style={styles.buttonText}>
              {donationAmount > 0
                ? `Donate & Join (${donationAmount.toLocaleString()} sats)`
                : 'Donate & Join'}
            </Text>
          </View>
        );

      case 'error':
        return <Text style={styles.errorText}>Error</Text>;

      default:
        return <Text style={styles.buttonText}>Join</Text>;
    }
  };

  const isDisabled =
    state === 'loading' ||
    isJoined ||
    state === 'ended' ||
    state === 'error' ||
    isProcessing;

  const buttonStyle = [
    styles.button,
    isJoined && styles.buttonJoined,
    state === 'ended' && styles.buttonEnded,
    state === 'join_donation' && styles.buttonDonation,
    isDisabled && !isJoined && styles.buttonDisabled,
  ];

  return (
    <>
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>

      {/* Donation Modal - Uses ExternalZapModal pattern */}
      {showDonationModal && creatorLightningAddress && (
        <ExternalZapModal
          visible={showDonationModal}
          recipientNpub={creatorLightningAddress}
          recipientName={event.creatorProfile?.name || 'Event Creator'}
          amount={donationAmount > 0 ? donationAmount : undefined}
          memo={`Support: ${event.title}`}
          onClose={handleDonationClose}
          onSuccess={handleDonationSuccess}
        />
      )}

      {/* Join Without Donating Option - shown when modal is closed */}
      {state === 'join_donation' && !showDonationModal && !isJoined && (
        <TouchableOpacity
          style={styles.skipDonationButton}
          onPress={handleJoinWithoutDonation}
          disabled={isProcessing}
        >
          <Text style={styles.skipDonationText}>
            Join without donating
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

// Export refresh function type for parent components
export type EventJoinButtonRef = {
  refreshStatus: () => void;
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDonation: {
    backgroundColor: theme.colors.orangeBright,
  },
  buttonJoined: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  buttonEnded: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
  },
  joinedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinedText: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
  },
  endedText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: theme.typography.weights.medium,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: theme.typography.weights.medium,
  },
  donationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipDonationButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipDonationText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default EventJoinButton;
