/**
 * EventAnnouncementPreview - Preview and optionally share event announcement
 * Similar to workout posting flow: show card preview, then let captain decide to share
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { WorkoutCardRenderer } from '../cards/WorkoutCardRenderer';
import { captureRef } from 'react-native-view-shot';
import EventAnnouncementCardGenerator from '../../services/nostr/eventAnnouncementCardGenerator';
import type { EventAnnouncementData } from '../../services/nostr/eventAnnouncementCardGenerator';
import UnifiedSigningService from '../../services/auth/UnifiedSigningService';
import { GlobalNDKService } from '../../services/nostr/GlobalNDKService';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import * as FileSystem from 'expo-file-system';

interface EventAnnouncementPreviewProps {
  visible: boolean;
  eventData: EventAnnouncementData;
  onClose: () => void;
  onPublished?: () => void;
}

export const EventAnnouncementPreview: React.FC<
  EventAnnouncementPreviewProps
> = ({ visible, eventData, onClose, onPublished }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<View>(null);

  // Generate card when modal becomes visible
  useEffect(() => {
    if (visible && eventData) {
      generateCard();
    }
  }, [visible, eventData]);

  const generateCard = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🎨 Generating event announcement card...');
      const generator = EventAnnouncementCardGenerator.getInstance();
      const cardData = await generator.generateAnnouncementCard(eventData);

      setSvgContent(cardData.svgContent);
      setDeepLink(cardData.deepLink);

      console.log('✅ Card generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate card:', error);
      setError('Failed to generate announcement card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsPublishing(true);
      setError(null);

      console.log('📤 Publishing event announcement to Nostr...');

      // Capture card as PNG
      if (!cardRef.current) {
        throw new Error('Card ref not available');
      }

      console.log('📸 Capturing card as image...');
      const imageUri = await captureRef(cardRef.current, {
        format: 'png',
        quality: 0.9,
      });

      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Get signer
      const signingService = UnifiedSigningService.getInstance();
      const signer = await signingService.getSigner();

      if (!signer) {
        throw new Error('No signer available. Please ensure you are logged in.');
      }

      const userPubkey = await signingService.getUserPubkey();
      if (!userPubkey) {
        throw new Error('Could not get user public key');
      }

      // Create kind 1 Nostr event with embedded image
      const eventContent = `🎯 New Event: ${eventData.eventName}

📅 ${new Date(eventData.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
${eventData.activityType ? `${this.getActivityEmoji(eventData.activityType)} ${eventData.activityType}` : ''}
${eventData.entryFee ? `💰 Entry: ${eventData.entryFee.toLocaleString()} sats` : '🆓 Free event'}
${eventData.prizePool ? `🏆 Prize: ${eventData.prizePool.toLocaleString()} sats` : ''}

Join here: ${deepLink}

#RUNSTR #Bitcoin #Fitness`;

      const ndk = await GlobalNDKService.getInstance();
      const nostrEvent = new NDKEvent(ndk);
      nostrEvent.kind = 1; // Text note
      nostrEvent.content = eventContent;
      nostrEvent.pubkey = userPubkey;
      nostrEvent.created_at = Math.floor(Date.now() / 1000);
      nostrEvent.tags = [
        ['t', 'RUNSTR'],
        ['t', 'Bitcoin'],
        ['t', 'Fitness'],
        ['e', eventData.eventId, '', 'mention'], // Reference to event
        ['image', `data:image/png;base64,${base64}`], // Embed image
      ];

      console.log('🔐 Signing event...');
      await nostrEvent.sign(signer);

      console.log('📡 Publishing to relays...');
      await nostrEvent.publish();

      console.log('✅ Event announcement published successfully!');

      Alert.alert(
        'Announcement Shared!',
        'Your event announcement has been published to Nostr.',
        [{ text: 'OK', onPress: () => {
          onPublished?.();
          onClose();
        }}]
      );
    } catch (error) {
      console.error('❌ Failed to publish announcement:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to publish announcement'
      );
      Alert.alert(
        'Error',
        `Failed to publish announcement: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ User skipped announcement sharing');
    onClose();
  };

  const getActivityEmoji = (activityType: string): string => {
    const emojiMap: Record<string, string> = {
      running: '🏃',
      cycling: '🚴',
      walking: '🚶',
      hiking: '🥾',
      'strength training': '💪',
      yoga: '🧘',
      meditation: '🧘',
      diet: '🥗',
      swimming: '🏊',
      rowing: '🚣',
    };
    return emojiMap[activityType.toLowerCase()] || '⚡';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Event Announcement</Text>
          <Text style={styles.headerSubtitle}>
            Optional: Share this event on Nostr to invite more participants
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Generating announcement...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={generateCard}
                activeOpacity={0.7}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Card Preview */}
              <View style={styles.cardContainer}>
                <WorkoutCardRenderer
                  ref={cardRef}
                  svgContent={svgContent}
                  width={800}
                  height={600}
                />
              </View>

              {/* Deep Link Display */}
              <View style={styles.deepLinkContainer}>
                <Text style={styles.deepLinkLabel}>Event Link:</Text>
                <Text style={styles.deepLinkText}>{deepLink}</Text>
                <Text style={styles.deepLinkInfo}>
                  This link will be included in your post. Anyone can tap it to
                  view event details in RUNSTR, Damus, or Primal.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {/* Action Buttons */}
        {!isGenerating && !error && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isPublishing}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, isPublishing && styles.buttonDisabled]}
              onPress={handleShare}
              disabled={isPublishing}
              activeOpacity={0.7}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text style={styles.shareButtonText}>Share to Nostr</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Close button if error */}
        {error && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },

  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: '#000000',
  },

  cardContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    // Scale down to fit screen
    transform: [{ scale: 0.45 }],
    height: 270, // 600 * 0.45
  },

  deepLinkContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  deepLinkLabel: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  deepLinkText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: theme.colors.accent,
    marginBottom: 12,
  },

  deepLinkInfo: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  skipButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  skipButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  shareButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    alignItems: 'center',
  },

  shareButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: '#000000',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  closeButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
});
