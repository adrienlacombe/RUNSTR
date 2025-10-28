/**
 * EventCreationWizard - Preset-based event creation (2-step flow)
 * Step 1: Select Preset → Step 2: Date + Prize Pool + Entry Fee
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { theme } from '../../styles/theme';
import { WizardStepContainer, WizardStep } from './WizardStepContainer';
import { CustomAlert } from '../ui/CustomAlert';
import { NostrCompetitionService } from '../../services/nostr/NostrCompetitionService';
import { NostrListService } from '../../services/nostr/NostrListService';
import { useUserStore } from '../../store/userStore';
import { DirectNostrProfileService } from '../../services/user/directNostrProfileService';
import UnifiedSigningService from '../../services/auth/UnifiedSigningService';
import { GlobalNDKService } from '../../services/nostr/GlobalNDKService';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import type {
  NostrActivityType,
  NostrEventCompetitionType,
  EventScoringType,
  RecurrenceFrequency,
  RecurrenceDay,
} from '../../types/nostrCompetition';
import { getCharityById } from '../../constants/charities';
import nostrTeamService from '../../services/nostr/NostrTeamService';
import { ProfileService } from '../../services/user/profileService';
import unifiedCache from '../../services/cache/UnifiedNostrCache';
import { CacheKeys } from '../../constants/cacheTTL';
import {
  ALL_DURATION_OPTIONS,
  type DurationOption,
} from '../../constants/eventDurations';
import { EventAnnouncementPreview } from '../events/EventAnnouncementPreview';
import type { EventAnnouncementData } from '../../services/nostr/eventAnnouncementCardGenerator';

// Event Preset Interface
interface EventPreset {
  id: string;
  name: string;
  category: 'Running' | 'Strength' | 'Diet' | 'Meditation';
  activityType: NostrActivityType;
  scoringType: EventScoringType; // NEW: Simplified scoring
  competitionType: NostrEventCompetitionType; // Deprecated: keep for compat
  targetValue?: number;
  targetUnit?: string;
  description: string;
}

// 11 Event Presets
const EVENT_PRESETS: EventPreset[] = [
  // Running (4 presets) - Time-based races
  {
    id: '5k',
    name: '5K Race',
    category: 'Running',
    activityType: 'Running',
    scoringType: 'fastest_time', // ← NEW: Time-based ranking
    competitionType: '5K Race',
    targetValue: 5,
    targetUnit: 'km',
    description: '5 kilometers race - fastest time wins',
  },
  {
    id: '10k',
    name: '10K Race',
    category: 'Running',
    activityType: 'Running',
    scoringType: 'fastest_time', // ← NEW: Time-based ranking
    competitionType: '10K Race',
    targetValue: 10,
    targetUnit: 'km',
    description: '10 kilometers race - fastest time wins',
  },
  {
    id: 'half-marathon',
    name: 'Half Marathon',
    category: 'Running',
    activityType: 'Running',
    scoringType: 'fastest_time', // ← NEW: Time-based ranking
    competitionType: 'Half Marathon',
    targetValue: 21.1,
    targetUnit: 'km',
    description: '21.1 kilometers race - fastest time wins',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    category: 'Running',
    activityType: 'Running',
    scoringType: 'fastest_time', // ← NEW: Time-based ranking
    competitionType: 'Marathon',
    targetValue: 42.2,
    targetUnit: 'km',
    description: '42.2 kilometers race - fastest time wins',
  },

  // Strength (3 presets) - Completion challenges
  {
    id: 'pushups-100',
    name: '100 Push-ups',
    category: 'Strength',
    activityType: 'Strength Training',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Workout Count',
    targetValue: 100,
    targetUnit: 'reps',
    description: 'Complete 100 push-ups in one workout',
  },
  {
    id: 'pullups-50',
    name: '50 Pull-ups',
    category: 'Strength',
    activityType: 'Strength Training',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Workout Count',
    targetValue: 50,
    targetUnit: 'reps',
    description: 'Complete 50 pull-ups in one workout',
  },
  {
    id: 'situps-100',
    name: '100 Sit-ups',
    category: 'Strength',
    activityType: 'Strength Training',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Workout Count',
    targetValue: 100,
    targetUnit: 'reps',
    description: 'Complete 100 sit-ups in one workout',
  },

  // Diet (3 presets) - Completion challenges
  {
    id: 'carnivore-1d',
    name: 'Carnivore Challenge',
    category: 'Diet',
    activityType: 'Diet',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Meal Logging',
    targetValue: 1,
    targetUnit: 'day',
    description: '1 day carnivore diet',
  },
  {
    id: 'fast-24hr',
    name: '24hr Fast',
    category: 'Diet',
    activityType: 'Diet',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Nutrition Score',
    targetValue: 24,
    targetUnit: 'hours',
    description: '24 hour water fast',
  },
  {
    id: 'fast-12hr',
    name: '12hr Fast',
    category: 'Diet',
    activityType: 'Diet',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Nutrition Score',
    targetValue: 12,
    targetUnit: 'hours',
    description: '12 hour intermittent fast',
  },

  // Meditation (2 presets) - Completion challenges
  {
    id: 'meditation-30min',
    name: '30min Meditation',
    category: 'Meditation',
    activityType: 'Meditation',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Duration Challenge',
    targetValue: 30,
    targetUnit: 'minutes',
    description: '30 minute meditation session',
  },
  {
    id: 'meditation-1hr',
    name: '1hr Meditation',
    category: 'Meditation',
    activityType: 'Meditation',
    scoringType: 'completion', // ← NEW: Completion-based
    competitionType: 'Duration Challenge',
    targetValue: 60,
    targetUnit: 'minutes',
    description: '1 hour meditation session',
  },
];

type ActivityType = NostrActivityType;
type CompetitionType = NostrEventCompetitionType;

interface EventData {
  selectedPreset: EventPreset | null;
  activityType: ActivityType | null;
  scoringType: EventScoringType | null; // NEW: Simplified scoring
  competitionType: CompetitionType | null; // Deprecated: keep for compat
  eventDate: Date | null;
  durationMinutes?: number; // NEW: Duration for short events (10 min, 2 hours)
  entryFeesSats: number;
  maxParticipants: number;
  requireApproval: boolean;
  eventName: string;
  description: string;
  targetValue?: number;
  targetUnit?: string;
  prizePoolSats: number | undefined;
  lightningAddress?: string;
  paymentDestination: 'captain' | 'charity';
  scoringMode: 'individual' | 'team-total'; // NEW: Scoring mode
  teamGoal?: number; // NEW: Team goal for team-total mode
  recurrence: RecurrenceFrequency; // NEW: Recurrence frequency
  recurrenceDay?: RecurrenceDay; // NEW: Day of week for weekly recurrence
}

interface EventCreationWizardProps {
  visible: boolean;
  teamId: string;
  captainPubkey: string;
  onClose: () => void;
  onEventCreated: (eventData: EventData) => void;
}

export const EventCreationWizard: React.FC<EventCreationWizardProps> = ({
  visible,
  teamId,
  captainPubkey,
  onClose,
  onEventCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const user = useUserStore((state) => state.user);
  const [teamCharityId, setTeamCharityId] = useState<string | undefined>();
  const [captainLightningAddress, setCaptainLightningAddress] =
    useState<string>('');
  const [eventData, setEventData] = useState<EventData>({
    selectedPreset: null,
    activityType: null,
    scoringType: null,
    competitionType: null,
    eventDate: null,
    durationMinutes: undefined,
    entryFeesSats: 0,
    maxParticipants: 50,
    requireApproval: true,
    eventName: '',
    description: '',
    prizePoolSats: undefined,
    lightningAddress: '',
    paymentDestination: 'captain',
    scoringMode: 'individual',
    teamGoal: undefined,
    recurrence: 'none',
    recurrenceDay: undefined,
  });

  // Alert state for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<
    Array<{ text: string; onPress?: () => void }>
  >([]);

  // Announcement preview state
  const [showAnnouncementPreview, setShowAnnouncementPreview] = useState(false);
  const [createdEventData, setCreatedEventData] =
    useState<EventAnnouncementData | null>(null);

  // Reset wizard when opened and fetch team/captain data
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setEventData({
        selectedPreset: null,
        activityType: null,
        scoringType: null,
        competitionType: null,
        eventDate: null,
        durationMinutes: undefined,
        entryFeesSats: 0,
        maxParticipants: 50,
        requireApproval: true,
        eventName: '',
        description: '',
        prizePoolSats: undefined,
        lightningAddress: '',
        paymentDestination: 'captain',
        scoringMode: 'individual',
        teamGoal: undefined,
        recurrence: 'none',
        recurrenceDay: undefined,
      });

      // Fetch team charity info
      const team = nostrTeamService.getTeamById(teamId);
      if (team?.charityId) {
        setTeamCharityId(team.charityId);
      }

      // Fetch captain's Lightning address from their profile
      ProfileService.getUserProfile(captainPubkey).then((profile) => {
        if (profile?.lud16) {
          setCaptainLightningAddress(profile.lud16);
          setEventData((prev) => ({
            ...prev,
            lightningAddress: profile.lud16,
          }));
        }
      });
    }
  }, [visible, teamId, captainPubkey]);

  // Wizard steps configuration (3 steps: preset, settings, recurrence)
  const steps: WizardStep[] = [
    {
      id: 'preset',
      title: 'Choose Event Type',
      isValid: !!eventData.selectedPreset,
    },
    {
      id: 'settings',
      title: 'Event Details',
      isValid: eventData.eventName.length > 0 && !!eventData.eventDate,
    },
    {
      id: 'recurrence',
      title: 'Recurrence',
      isValid: true, // Always valid (recurrence is optional)
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Try to get user from store or DirectNostrProfileService
    let currentUser = user;
    if (!currentUser) {
      console.log(
        '⚠️ User not in store, fetching from DirectNostrProfileService...'
      );
      try {
        currentUser = await DirectNostrProfileService.getCurrentUserProfile();
        if (!currentUser) {
          setAlertTitle('Error');
          setAlertMessage('User not found. Please log in again.');
          setAlertButtons([{ text: 'OK' }]);
          setAlertVisible(true);
          return;
        }
      } catch (error) {
        console.error(
          'Failed to get user from DirectNostrProfileService:',
          error
        );
        setAlertTitle('Error');
        setAlertMessage('User not found. Please log in again.');
        setAlertButtons([{ text: 'OK' }]);
        setAlertVisible(true);
        return;
      }
    }

    setIsCreating(true);

    try {
      console.log('🎯 Creating preset event with Nostr Competition Service');

      // Check for existing active events before proceeding
      const activeCompetitions =
        await NostrCompetitionService.checkActiveCompetitions(teamId);

      if (activeCompetitions.activeEvents > 0) {
        setAlertTitle('Active Event Exists');
        setAlertMessage(
          `Your team already has an active event: "${activeCompetitions.activeEventDetails?.name}"\n\nIt is scheduled for ${activeCompetitions.activeEventDetails?.eventDate}.\n\nOnly one event can be active at a time.`
        );
        setAlertButtons([{ text: 'OK', onPress: () => setIsCreating(false) }]);
        setAlertVisible(true);
        return;
      }

      // Get signer using UnifiedSigningService (handles both nsec and Amber)
      const signingService = UnifiedSigningService.getInstance();
      const signer = await signingService.getSigner();

      if (!signer) {
        setAlertTitle('Authentication Required');
        setAlertMessage('Unable to sign event. Please ensure you are logged in.');
        setAlertButtons([{ text: 'OK' }]);
        setAlertVisible(true);
        setIsCreating(false);
        return;
      }

      console.log('✅ Signer ready for event creation');

      // Prepare event data for Nostr
      const eventCreationData = {
        teamId,
        name: eventData.eventName,
        description: eventData.description,
        activityType: eventData.activityType!,
        scoringType: eventData.scoringType!, // ← NEW: Pass scoring type
        competitionType: eventData.competitionType!, // Keep for backward compat
        eventDate: eventData.eventDate!.toISOString(),
        durationMinutes: eventData.durationMinutes, // ← NEW: Pass duration
        entryFeesSats: eventData.entryFeesSats,
        maxParticipants: eventData.maxParticipants,
        requireApproval: eventData.requireApproval,
        targetValue: eventData.targetValue,
        targetUnit: eventData.targetUnit,
        prizePoolSats: eventData.prizePoolSats,
        lightningAddress: eventData.lightningAddress,
        paymentDestination: eventData.paymentDestination,
        paymentRecipientName:
          eventData.paymentDestination === 'charity'
            ? getCharityById(teamCharityId)?.name
            : currentUser?.name || 'Team Captain',
        scoringMode: eventData.scoringMode, // ← NEW: Pass scoring mode
        teamGoal: eventData.teamGoal, // ← NEW: Pass team goal
        recurrence: eventData.recurrence, // ← NEW: Pass recurrence frequency
        recurrenceDay: eventData.recurrenceDay, // ← NEW: Pass recurrence day
        recurrenceStartDate: eventData.eventDate!.toISOString(), // ← NEW: First occurrence
      };

      console.log('🎯 Creating event:', eventCreationData);

      // Create event using Nostr Competition Service (works with both nsec and Amber)
      const result = await NostrCompetitionService.createEvent(
        eventCreationData,
        signer
      );

      if (result.success) {
        console.log('✅ Event created successfully:', result.competitionId);

        // Track participant list creation status
        let participantListCreated = false;
        let participantListError = '';

        // Create empty participant list for opt-in participation
        if (result.competitionId) {
          try {
            console.log(
              '📋 Creating empty participant list for event (opt-in)'
            );
            const listService = NostrListService.getInstance();

            // Get captain's hex pubkey from signer
            const captainHexPubkey = captainPubkey; // Already provided as prop

            // Prepare participant list with captain as first member (kind 30000)
            const participantListData = {
              name: `${eventData.eventName} Participants`,
              description: `Participants for ${eventData.eventName}`,
              members: [captainHexPubkey], // ✅ FIX: Captain auto-joins their own event
              dTag: `event-${result.competitionId}-participants`,
              listType: 'people' as const,
            };

            // Create the participant list event template
            const listEventTemplate = listService.prepareListCreation(
              participantListData,
              captainHexPubkey
            );

            console.log('🔐 Signing participant list...');

            // Get global NDK instance
            const ndk = await GlobalNDKService.getInstance();

            // Create NDK event and sign it
            const ndkEvent = new NDKEvent(ndk, listEventTemplate);
            await ndkEvent.sign(signer);

            console.log('📤 Publishing participant list to Nostr...');

            // Publish to relays
            await ndkEvent.publish();

            participantListCreated = true;
            console.log(
              '✅ Participant list created and published:',
              participantListData.dTag
            );
          } catch (listError) {
            console.error('⚠️ Failed to create participant list:', listError);
            participantListError =
              listError instanceof Error ? listError.message : 'Unknown error';
            // Don't block event creation, just log the error
          }
        }

        // ✅ FIX: Invalidate team events cache so new event appears immediately
        console.log('🗑️ Invalidating team events cache for team:', teamId);
        unifiedCache.delete(CacheKeys.TEAM_EVENTS(teamId));

        // Prepare announcement data for preview modal
        const team = nostrTeamService.getTeamById(teamId);
        const announcementData: EventAnnouncementData = {
          eventId: result.competitionId!,
          eventName: eventData.eventName,
          teamId,
          teamName: team?.name || 'Your Team',
          activityType: eventData.activityType!,
          eventDate: eventData.eventDate!.toISOString(),
          entryFee: eventData.entryFeesSats,
          prizePool: eventData.prizePoolSats,
          captainName: currentUser?.name,
          durationMinutes: eventData.durationMinutes,
        };

        // Show success alert first, then preview modal
        const successMessage = participantListCreated
          ? `Event "${eventData.eventName}" has been created and published to Nostr relays.\n\n✅ Participant list created successfully.`
          : participantListError
          ? `Event "${eventData.eventName}" has been created, but participant list creation failed.\n\n⚠️ ${participantListError}\n\nYou may need to create the participant list manually from the Captain Dashboard.`
          : `Event "${eventData.eventName}" has been created and published to Nostr relays.`;

        setAlertTitle('Success!');
        setAlertMessage(successMessage);
        setAlertButtons([
          {
            text: 'Continue',
            onPress: () => {
              setAlertVisible(false);
              // Show announcement preview modal
              setCreatedEventData(announcementData);
              setShowAnnouncementPreview(true);
              onEventCreated(eventData);
              onClose(); // Close wizard to show preview modal
            },
          },
        ]);
        setAlertVisible(true);
      } else {
        throw new Error(result.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('❌ Failed to create event:', error);
      setAlertTitle('Error');
      setAlertMessage(
        `Failed to create event: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      setAlertButtons([{ text: 'OK' }]);
      setAlertVisible(true);
    } finally {
      setIsCreating(false);
    }
  };

  const selectPreset = (preset: EventPreset) => {
    setEventData((prev) => ({
      ...prev,
      selectedPreset: preset,
      activityType: preset.activityType,
      scoringType: preset.scoringType, // ← NEW: Set scoring type
      competitionType: preset.competitionType,
      targetValue: preset.targetValue,
      targetUnit: preset.targetUnit,
      eventName: preset.name,
      description: preset.description,
    }));
  };

  const updateSettings = (field: keyof EventData, value: any) => {
    setEventData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate quick date options
  const getQuickDateOptions = () => {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const thisWeekend = new Date(today);
    const currentDay = today.getDay();
    if (currentDay === 0 || currentDay === 6) {
      // Today is weekend
    } else {
      const daysUntilSaturday = 6 - currentDay;
      thisWeekend.setDate(today.getDate() + daysUntilSaturday);
    }

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      {
        label:
          currentDay === 0 || currentDay === 6
            ? 'This Weekend (Today)'
            : 'This Weekend',
        date: thisWeekend,
      },
      { label: 'Next Week', date: nextWeek },
    ];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Preset Selection
        return (
          <ScrollView
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepDescription}>
              Choose a preset event to get started quickly
            </Text>

            {/* Running Category */}
            <Text style={styles.categoryTitle}>Running</Text>
            <View style={styles.presetsGrid}>
              {EVENT_PRESETS.filter((p) => p.category === 'Running').map(
                (preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      eventData.selectedPreset?.id === preset.id &&
                        styles.presetCardSelected,
                    ]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        eventData.selectedPreset?.id === preset.id &&
                          styles.presetNameSelected,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDescription}>
                      {preset.description}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Strength Category */}
            <Text style={styles.categoryTitle}>Strength</Text>
            <View style={styles.presetsGrid}>
              {EVENT_PRESETS.filter((p) => p.category === 'Strength').map(
                (preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      eventData.selectedPreset?.id === preset.id &&
                        styles.presetCardSelected,
                    ]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        eventData.selectedPreset?.id === preset.id &&
                          styles.presetNameSelected,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDescription}>
                      {preset.description}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Diet Category */}
            <Text style={styles.categoryTitle}>Diet</Text>
            <View style={styles.presetsGrid}>
              {EVENT_PRESETS.filter((p) => p.category === 'Diet').map(
                (preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      eventData.selectedPreset?.id === preset.id &&
                        styles.presetCardSelected,
                    ]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        eventData.selectedPreset?.id === preset.id &&
                          styles.presetNameSelected,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDescription}>
                      {preset.description}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Meditation Category */}
            <Text style={styles.categoryTitle}>Meditation</Text>
            <View style={styles.presetsGrid}>
              {EVENT_PRESETS.filter((p) => p.category === 'Meditation').map(
                (preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.presetCard,
                      eventData.selectedPreset?.id === preset.id &&
                        styles.presetCardSelected,
                    ]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        eventData.selectedPreset?.id === preset.id &&
                          styles.presetNameSelected,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDescription}>
                      {preset.description}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </ScrollView>
        );

      case 1: // Settings (Date + Prize Pool + Entry Fee)
        return (
          <ScrollView
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepDescription}>
              Configure your {eventData.selectedPreset?.name} event
            </Text>

            {/* Event Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Name</Text>
              <TextInput
                style={styles.textInput}
                value={eventData.eventName}
                onChangeText={(text) => updateSettings('eventName', text)}
                placeholder="Enter event name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Date Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Date</Text>
              <View style={styles.quickDateOptions}>
                {getQuickDateOptions().map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickDateOption,
                      eventData.eventDate?.toDateString() ===
                        option.date.toDateString() &&
                        styles.quickDateOptionSelected,
                    ]}
                    onPress={() =>
                      setEventData((prev) => ({ ...prev, eventDate: option.date }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickDateOptionText,
                        eventData.eventDate?.toDateString() ===
                          option.date.toDateString() &&
                          styles.quickDateOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.quickDateOptionDate}>
                      {option.date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration Selection (NEW) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Duration</Text>
              <View style={styles.durationOptions}>
                {ALL_DURATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.minutes}
                    style={[
                      styles.durationOption,
                      eventData.durationMinutes === option.minutes &&
                        styles.durationOptionSelected,
                    ]}
                    onPress={() =>
                      updateSettings('durationMinutes', option.minutes)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.durationOptionText,
                        eventData.durationMinutes === option.minutes &&
                          styles.durationOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Scoring Mode (NEW) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Leaderboard Type</Text>
              <View style={styles.scoringModeOptions}>
                <TouchableOpacity
                  style={[
                    styles.scoringModeOption,
                    eventData.scoringMode === 'individual' &&
                      styles.scoringModeOptionSelected,
                  ]}
                  onPress={() => updateSettings('scoringMode', 'individual')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.scoringModeOptionText,
                      eventData.scoringMode === 'individual' &&
                        styles.scoringModeOptionTextSelected,
                    ]}
                  >
                    Individual Rankings
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.scoringModeOption,
                    eventData.scoringMode === 'team-total' &&
                      styles.scoringModeOptionSelected,
                  ]}
                  onPress={() => updateSettings('scoringMode', 'team-total')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.scoringModeOptionText,
                      eventData.scoringMode === 'team-total' &&
                        styles.scoringModeOptionTextSelected,
                    ]}
                  >
                    Team Goal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Team Goal Input (only if team-total mode) */}
            {eventData.scoringMode === 'team-total' && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Team Goal ({eventData.targetUnit || 'km'})
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={eventData.teamGoal?.toString() || ''}
                  onChangeText={(text) =>
                    updateSettings('teamGoal', parseFloat(text) || 0)
                  }
                  placeholder={`e.g., 210 ${eventData.targetUnit || 'km'}`}
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="numeric"
                />
                <Text style={styles.formHelper}>
                  Combined team total needed to complete the goal
                </Text>
              </View>
            )}

            {/* Prize Pool */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Prize Pool (sats)</Text>
              <View style={styles.prizePoolOptions}>
                {[
                  { label: 'None', value: 0 },
                  { label: '10k', value: 10000 },
                  { label: '20k', value: 20000 },
                  { label: '30k', value: 30000 },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.prizeOption,
                      eventData.prizePoolSats === option.value &&
                        styles.prizeOptionSelected,
                    ]}
                    onPress={() =>
                      updateSettings('prizePoolSats', option.value)
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.prizeOptionText,
                        eventData.prizePoolSats === option.value &&
                          styles.prizeOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Entry Fee */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Entry Fee (sats)</Text>
              <TextInput
                style={styles.textInput}
                value={eventData.entryFeesSats.toString()}
                onChangeText={(text) =>
                  updateSettings('entryFeesSats', parseInt(text) || 0)
                }
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
              />
              {eventData.entryFeesSats > 0 && (
                <Text style={styles.formHelper}>
                  Participants will pay {eventData.entryFeesSats} sats to join
                </Text>
              )}
            </View>

            {/* Payment Destination (only if entry fee > 0) */}
            {eventData.entryFeesSats > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Entry Fees Go To:</Text>
                <View style={styles.destinationOptions}>
                  <TouchableOpacity
                    style={[
                      styles.destinationOption,
                      eventData.paymentDestination === 'captain' &&
                        styles.destinationOptionSelected,
                    ]}
                    onPress={() => {
                      updateSettings('paymentDestination', 'captain');
                      updateSettings(
                        'lightningAddress',
                        captainLightningAddress
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.destinationOptionText,
                        eventData.paymentDestination === 'captain' &&
                          styles.destinationOptionTextSelected,
                      ]}
                    >
                      Captain's Wallet
                    </Text>
                  </TouchableOpacity>

                  {teamCharityId && (
                    <TouchableOpacity
                      style={[
                        styles.destinationOption,
                        eventData.paymentDestination === 'charity' &&
                          styles.destinationOptionSelected,
                      ]}
                      onPress={() => {
                        const charity = getCharityById(teamCharityId);
                        if (charity) {
                          updateSettings('paymentDestination', 'charity');
                          updateSettings(
                            'lightningAddress',
                            charity.lightningAddress
                          );
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.destinationOptionText,
                          eventData.paymentDestination === 'charity' &&
                            styles.destinationOptionTextSelected,
                        ]}
                      >
                        Team Charity
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        );

      case 2: // Recurrence Settings
        return (
          <ScrollView
            style={styles.stepContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepDescription}>
              Make this event repeat automatically (optional)
            </Text>

            {/* Recurrence Toggle */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Type</Text>
              <View style={styles.recurrenceTypeOptions}>
                <TouchableOpacity
                  style={[
                    styles.recurrenceTypeOption,
                    eventData.recurrence === 'none' &&
                      styles.recurrenceTypeOptionSelected,
                  ]}
                  onPress={() => updateSettings('recurrence', 'none')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.recurrenceTypeOptionText,
                      eventData.recurrence === 'none' &&
                        styles.recurrenceTypeOptionTextSelected,
                    ]}
                  >
                    One-Time Event
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.recurrenceTypeOption,
                    eventData.recurrence !== 'none' &&
                      styles.recurrenceTypeOptionSelected,
                  ]}
                  onPress={() => updateSettings('recurrence', 'weekly')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.recurrenceTypeOptionText,
                      eventData.recurrence !== 'none' &&
                        styles.recurrenceTypeOptionTextSelected,
                    ]}
                  >
                    Recurring Event
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Frequency Selection (only if recurring) */}
            {eventData.recurrence !== 'none' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Frequency</Text>
                  <View style={styles.frequencyOptions}>
                    {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map(
                      (freq) => (
                        <TouchableOpacity
                          key={freq}
                          style={[
                            styles.frequencyOption,
                            eventData.recurrence === freq &&
                              styles.frequencyOptionSelected,
                          ]}
                          onPress={() => updateSettings('recurrence', freq)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.frequencyOptionText,
                              eventData.recurrence === freq &&
                                styles.frequencyOptionTextSelected,
                            ]}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Day Selection (only for weekly/biweekly) */}
                {(eventData.recurrence === 'weekly' ||
                  eventData.recurrence === 'biweekly') && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Reset Day</Text>
                    <View style={styles.dayOptions}>
                      {(
                        [
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                          'sunday',
                        ] as const
                      ).map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayOption,
                            eventData.recurrenceDay === day &&
                              styles.dayOptionSelected,
                          ]}
                          onPress={() => updateSettings('recurrenceDay', day)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.dayOptionText,
                              eventData.recurrenceDay === day &&
                                styles.dayOptionTextSelected,
                            ]}
                          >
                            {day.slice(0, 3).toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.formHelper}>
                      Leaderboard will reset every{' '}
                      {eventData.recurrence === 'biweekly' ? 'other ' : ''}
                      {eventData.recurrenceDay || 'selected day'} at midnight
                    </Text>
                  </View>
                )}

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Recurring events automatically reset the leaderboard on the
                    specified schedule. The same event will run indefinitely
                    until you manually end it.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <WizardStepContainer
        visible={visible}
        currentStep={currentStep}
        steps={steps}
        wizardTitle="Create Event"
        onClose={onClose}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        canGoNext={steps[currentStep]?.isValid}
        canGoPrevious={currentStep > 0}
        isLastStep={currentStep === steps.length - 1}
        isProcessing={isCreating}
        processingText="Creating Event..."
      >
        {renderStepContent()}
      </WizardStepContainer>

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />

      {/* Event Announcement Preview Modal */}
      {createdEventData && (
        <EventAnnouncementPreview
          visible={showAnnouncementPreview}
          eventData={createdEventData}
          onClose={() => {
            setShowAnnouncementPreview(false);
            setCreatedEventData(null);
          }}
          onPublished={() => {
            console.log('✅ Event announcement published successfully');
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
  },

  stepDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },

  // Category styles
  categoryTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 12,
  },

  // Preset grid styles
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },

  presetCard: {
    flexBasis: '47%',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 16,
  },

  presetCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  presetName: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 4,
  },

  presetNameSelected: {
    color: theme.colors.accent,
  },

  presetDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },

  // Form styles
  formGroup: {
    marginBottom: 20,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: 8,
  },

  textInput: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text,
  },

  formHelper: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },

  // Date selection styles
  quickDateOptions: {
    gap: 12,
  },

  quickDateOption: {
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  quickDateOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  quickDateOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  quickDateOptionTextSelected: {
    color: theme.colors.accent,
  },

  quickDateOptionDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  // Prize pool styles
  prizePoolOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  prizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
  },

  prizeOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  prizeOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  prizeOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Payment destination styles
  destinationOptions: {
    flexDirection: 'row',
    gap: 12,
  },

  destinationOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },

  destinationOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  destinationOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  destinationOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Duration selection styles (NEW)
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  durationOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
  },

  durationOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  durationOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  durationOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Scoring mode styles (NEW)
  scoringModeOptions: {
    flexDirection: 'row',
    gap: 12,
  },

  scoringModeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },

  scoringModeOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  scoringModeOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  scoringModeOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Recurrence type styles (NEW)
  recurrenceTypeOptions: {
    flexDirection: 'row',
    gap: 12,
  },

  recurrenceTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },

  recurrenceTypeOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  recurrenceTypeOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  recurrenceTypeOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Frequency options styles (NEW)
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
  },

  frequencyOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  frequencyOptionText: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  frequencyOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Day options styles (NEW)
  dayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  dayOption: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayOptionSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
  },

  dayOptionText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
  },

  dayOptionTextSelected: {
    color: theme.colors.accent,
  },

  // Info box styles (NEW)
  infoBox: {
    backgroundColor: theme.colors.cardBackground,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },

  infoText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
