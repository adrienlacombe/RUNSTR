/**
 * ZappableUserRow Component
 * Reusable component for displaying users with profile resolution and charity zapping
 * Used across league rankings, team member lists, and competition displays
 *
 * Updated: Lightning button now zaps charity, charity name is non-interactive display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import { Avatar } from './Avatar';
import { NWCLightningButton } from '../lightning/NWCLightningButton';
import { useNostrProfile } from '../../hooks/useCachedData';
import type { WorkoutCharity } from '../../types/nostrWorkout';

interface ZappableUserRowProps {
  npub: string;
  fallbackName?: string;
  additionalContent?: React.ReactNode;
  showQuickZap?: boolean;
  showChallengeButton?: boolean; // Now controls charity name display
  zapAmount?: number;
  onZapSuccess?: () => void;
  style?: any;
  disabled?: boolean;
  hideActionsForCurrentUser?: boolean; // Hide challenge/zap for current user
  charity?: WorkoutCharity; // Charity info from workout event
}

export const ZappableUserRow: React.FC<ZappableUserRowProps> = ({
  npub,
  fallbackName,
  additionalContent,
  showQuickZap = true,
  showChallengeButton = true,
  zapAmount = 21,
  onZapSuccess,
  style,
  disabled = false,
  hideActionsForCurrentUser = false,
  charity,
}) => {
  const { profile } = useNostrProfile(npub);

  // Resolve display name with fallback chain (treat empty strings as falsy)
  // Priority: profile name → profile display_name → fallbackName → Anonymous (if no profile) → truncated npub
  const displayName =
    profile?.name ||
    profile?.display_name ||
    (fallbackName && fallbackName.trim() !== '' ? fallbackName : null) ||
    (!profile
      ? 'Anonymous'
      : npub?.startsWith('npub1')
      ? `${npub.slice(0, 12)}...`
      : 'Anonymous');

  const avatarUrl = profile?.picture;

  // Default charity when no charity tag in 1301 event
  const DEFAULT_CHARITY = {
    id: 'opensats',
    name: 'OpenSats',
    lightningAddress: 'opensats@vlt.ge',
  };

  // Get charity info (from prop or default to OpenSats)
  const charityDisplayName = charity?.name || DEFAULT_CHARITY.name;
  const charityLightningAddress =
    charity?.lightningAddress || DEFAULT_CHARITY.lightningAddress;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.userSection}>
        {/* Avatar with profile picture or fallback */}
        <Avatar
          name={displayName}
          size={36}
          imageUrl={avatarUrl}
          style={styles.avatar}
        />

        {/* User name with action buttons */}
        <View style={styles.contentSection}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>

            {/* Lightning button now zaps charity */}
            {!hideActionsForCurrentUser && showQuickZap && (
              <View style={styles.actionButtons}>
                <NWCLightningButton
                  recipientNpub={npub}
                  recipientName={charityDisplayName}
                  recipientLightningAddress={charityLightningAddress}
                  size="small"
                  disabled={disabled}
                  onZapSuccess={onZapSuccess}
                  style={styles.zapButton}
                />
              </View>
            )}
          </View>

          {/* Charity name display (non-interactive) */}
          {!hideActionsForCurrentUser &&
            showChallengeButton &&
            charityDisplayName && (
              <View style={styles.charityDisplay}>
                <Text style={styles.charityDisplayText} numberOfLines={1}>
                  {charityDisplayName}
                </Text>
              </View>
            )}
        </View>
      </View>

      {/* Additional content (stats, etc) on the right */}
      {additionalContent && (
        <View style={styles.additionalContent}>{additionalContent}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 52,
  },

  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    marginRight: 8,
  },

  contentSection: {
    flex: 1,
    justifyContent: 'center',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  userName: {
    fontSize: 15,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  additionalContent: {
    marginTop: 2,
    flex: 0,
    minWidth: 90,
    paddingRight: 12,
  },

  zapButton: {
    // Gap handled by actionButtons
  },

  charityDisplay: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 140, 0, 0.1)', // Subtle orange background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)', // Subtle orange border
    alignSelf: 'flex-start', // Shrink to content width
    flexShrink: 0, // Prevent squishing
    minWidth: 80, // Ensure minimum readable width
    maxWidth: 150, // Adjusted for charity name only
  },

  charityDisplayText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.orangeBright || '#FF8C00',
  },
});
