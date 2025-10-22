/**
 * MeditationTrackerScreen - Simple meditation timer
 * Tracks meditation sessions with type selection and duration
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import LocalWorkoutStorageService from '../../services/fitness/LocalWorkoutStorageService';

type MeditationType = 'guided' | 'unguided' | 'breathwork' | 'body_scan' | 'loving_kindness';

const MEDITATION_TYPES: { value: MeditationType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'guided', label: 'Guided Meditation', icon: 'headset' },
  { value: 'unguided', label: 'Unguided Meditation', icon: 'infinite' },
  { value: 'breathwork', label: 'Breathwork', icon: 'pulse' },
  { value: 'body_scan', label: 'Body Scan', icon: 'body' },
  { value: 'loving_kindness', label: 'Loving-Kindness', icon: 'heart' },
];

export const MeditationTrackerScreen: React.FC = () => {
  // Session state
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState<MeditationType>('unguided');

  // Summary state
  const [showSummary, setShowSummary] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer refs
  const startTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic (reused from RunningTrackerScreen pattern)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const totalPausedTime = totalPausedTimeRef.current;
        const elapsed = Math.floor((now - startTimeRef.current - totalPausedTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const startMeditation = () => {
    setIsActive(true);
    setIsPaused(false);
    isPausedRef.current = false;
    startTimeRef.current = Date.now();
    pauseStartTimeRef.current = 0;
    totalPausedTimeRef.current = 0;
    setElapsedSeconds(0);
  };

  const pauseMeditation = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    pauseStartTimeRef.current = Date.now();
  };

  const resumeMeditation = () => {
    const pauseDuration = Date.now() - pauseStartTimeRef.current;
    totalPausedTimeRef.current += pauseDuration;
    setIsPaused(false);
    isPausedRef.current = false;
  };

  const endSession = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
    setShowSummary(true);
  };

  const saveSession = async () => {
    try {
      const meditationTypeLabel = MEDITATION_TYPES.find(t => t.value === selectedType)?.label || 'Meditation';

      await LocalWorkoutStorageService.saveManualWorkout({
        type: 'other', // Will be properly handled in kind 1301 as 'meditation'
        duration: elapsedSeconds * 60, // Convert to minutes for storage
        notes: sessionNotes || `${elapsedSeconds >= 60 ? Math.floor(elapsedSeconds / 60) + ' minute' : elapsedSeconds + ' second'} ${meditationTypeLabel.toLowerCase()} session`,
        // @ts-ignore - We'll add this field to LocalWorkout interface in Phase 5
        meditationType: selectedType,
      });

      console.log(`✅ Meditation session saved: ${selectedType} - ${formatTime(elapsedSeconds)}`);

      // Reset state
      setShowSummary(false);
      setSessionNotes('');
      setElapsedSeconds(0);
    } catch (error) {
      console.error('❌ Failed to save meditation session:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start screen (before session begins)
  if (!isActive && !showSummary) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.startContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="body" size={64} color={theme.colors.text} />
        </View>

        <Text style={styles.title}>Meditation Session</Text>
        <Text style={styles.subtitle}>Select your meditation type</Text>

        <View style={styles.typeGrid}>
          {MEDITATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeCard,
                selectedType === type.value && styles.typeCardActive,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Ionicons
                name={type.icon}
                size={32}
                color={selectedType === type.value ? theme.colors.text : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === type.value && styles.typeLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startMeditation}>
          <Text style={styles.startButtonText}>Begin Meditation</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Active meditation screen
  if (isActive) {
    return (
      <View style={styles.container}>
        <View style={styles.activeContainer}>
          <Text style={styles.meditationType}>
            {MEDITATION_TYPES.find(t => t.value === selectedType)?.label}
          </Text>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
            <Text style={styles.timerLabel}>
              {isPaused ? 'Paused' : 'Meditating'}
            </Text>
          </View>

          <View style={styles.controlButtons}>
            {!isPaused ? (
              <TouchableOpacity style={styles.pauseButton} onPress={pauseMeditation}>
                <Ionicons name="pause" size={32} color={theme.colors.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resumeButton} onPress={resumeMeditation}>
                <Ionicons name="play" size={32} color={theme.colors.background} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.stopButton} onPress={endSession}>
              <Ionicons name="stop" size={32} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Summary modal
  return (
    <Modal visible={showSummary} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Session Complete</Text>

          <View style={styles.summaryStats}>
            <Ionicons name="time" size={48} color={theme.colors.text} />
            <Text style={styles.summaryTime}>{formatTime(elapsedSeconds)}</Text>
            <Text style={styles.summaryType}>
              {MEDITATION_TYPES.find(t => t.value === selectedType)?.label}
            </Text>
          </View>

          <Text style={styles.notesLabel}>Session Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How was your session?"
            placeholderTextColor={theme.colors.textMuted}
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            numberOfLines={4}
          />

          <View style={styles.summaryButtons}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSession}
            >
              <Text style={styles.saveButtonText}>Save Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardButton}
              onPress={() => {
                setShowSummary(false);
                setSessionNotes('');
                setElapsedSeconds(0);
              }}
            >
              <Text style={styles.discardButtonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  startContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  typeGrid: {
    gap: 12,
    marginBottom: 32,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  typeCardActive: {
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.border,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    marginLeft: 16,
  },
  typeLabelActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semiBold,
  },
  startButton: {
    backgroundColor: theme.colors.text,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  meditationType: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timerText: {
    fontSize: 72,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  pauseButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  resumeButton: {
    backgroundColor: theme.colors.orangeBright,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  summaryContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryStats: {
    alignItems: 'center',
    marginBottom: 32,
  },
  summaryTime: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 16,
  },
  summaryType: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  summaryButtons: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: theme.colors.text,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
  },
  discardButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  discardButtonText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: theme.typography.weights.medium,
  },
});
