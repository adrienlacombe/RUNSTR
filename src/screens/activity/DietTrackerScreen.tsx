/**
 * DietTrackerScreen - Meal logger and fasting tracker
 * Logs meals with timestamps and calculates fasting duration from last meal
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../styles/theme';
import LocalWorkoutStorageService from '../../services/fitness/LocalWorkoutStorageService';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_TYPES: { value: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: 'sunny' },
  { value: 'lunch', label: 'Lunch', icon: 'partly-sunny' },
  { value: 'dinner', label: 'Dinner', icon: 'moon' },
  { value: 'snack', label: 'Snack', icon: 'nutrition' },
];

const LAST_MEAL_KEY = '@runstr:last_meal_timestamp';

export const DietTrackerScreen: React.FC = () => {
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [mealNotes, setMealNotes] = useState('');
  const [mealTime, setMealTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [lastMealTime, setLastMealTime] = useState<Date | null>(null);
  const [fastingDuration, setFastingDuration] = useState<number>(0); // seconds

  // Load last meal time on mount
  useEffect(() => {
    loadLastMealTime();
  }, []);

  // Calculate fasting duration in real-time
  useEffect(() => {
    if (!lastMealTime) return;

    const interval = setInterval(() => {
      const duration = Math.floor((mealTime.getTime() - lastMealTime.getTime()) / 1000);
      setFastingDuration(Math.max(0, duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastMealTime, mealTime]);

  const loadLastMealTime = async () => {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_MEAL_KEY);
      if (timestamp) {
        setLastMealTime(new Date(parseInt(timestamp)));
      }
    } catch (error) {
      console.error('Failed to load last meal time:', error);
    }
  };

  const saveLastMealTime = async (time: Date) => {
    try {
      await AsyncStorage.setItem(LAST_MEAL_KEY, time.getTime().toString());
      setLastMealTime(time);
    } catch (error) {
      console.error('Failed to save last meal time:', error);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMealTime(selectedDate);
    }
  };

  const saveMeal = async () => {
    try {
      const mealTypeLabel = MEAL_TYPES.find(m => m.value === selectedMealType)?.label || 'Meal';
      const timeString = mealTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      await LocalWorkoutStorageService.saveManualWorkout({
        type: 'other', // Will be handled as 'diet' in kind 1301
        duration: 0, // Meals don't have duration
        notes: mealNotes || `${mealTypeLabel} at ${timeString}`,
        // @ts-ignore - We'll add these fields to LocalWorkout interface in Phase 5
        mealType: selectedMealType,
        mealTime: mealTime.toISOString(),
      });

      console.log(`✅ Meal logged: ${selectedMealType} at ${timeString}`);

      // Update last meal time
      await saveLastMealTime(mealTime);

      // Reset form
      setMealNotes('');
      setMealTime(new Date());
    } catch (error) {
      console.error('❌ Failed to save meal:', error);
    }
  };

  const saveFast = async () => {
    if (!lastMealTime) {
      console.warn('No last meal recorded, cannot save fast');
      return;
    }

    try {
      const hours = Math.floor(fastingDuration / 3600);
      const minutes = Math.floor((fastingDuration % 3600) / 60);

      await LocalWorkoutStorageService.saveManualWorkout({
        type: 'other', // Will be handled as 'fasting' in kind 1301
        duration: fastingDuration / 60, // Convert to minutes for storage
        notes: mealNotes || `Completed ${hours}h ${minutes}m fast`,
        // @ts-ignore - We'll add these fields to LocalWorkout interface in Phase 5
        fastingDuration,
      });

      console.log(`✅ Fast logged: ${formatDuration(fastingDuration)}`);

      // Update last meal time to now (breaking the fast)
      await saveLastMealTime(mealTime);

      // Reset form
      setMealNotes('');
      setMealTime(new Date());
    } catch (error) {
      console.error('❌ Failed to save fast:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant" size={64} color={theme.colors.text} />
      </View>

      <Text style={styles.title}>Diet Tracker</Text>
      <Text style={styles.subtitle}>Log your meals and track fasting</Text>

      {/* Fasting Duration Display */}
      {lastMealTime && (
        <View style={styles.fastingCard}>
          <View style={styles.fastingHeader}>
            <Ionicons name="time" size={24} color={theme.colors.orangeBright} />
            <Text style={styles.fastingTitle}>Time Since Last Meal</Text>
          </View>
          <Text style={styles.fastingDuration}>{formatDuration(fastingDuration)}</Text>
          <Text style={styles.fastingSubtitle}>
            Last meal: {lastMealTime.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {/* Meal Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Meal Type</Text>
        <View style={styles.mealTypeGrid}>
          {MEAL_TYPES.map((mealType) => (
            <TouchableOpacity
              key={mealType.value}
              style={[
                styles.mealTypeOption,
                selectedMealType === mealType.value && styles.mealTypeOptionActive,
              ]}
              onPress={() => setSelectedMealType(mealType.value)}
            >
              <Ionicons
                name={mealType.icon}
                size={24}
                color={selectedMealType === mealType.value ? theme.colors.text : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.mealTypeLabel,
                  selectedMealType === mealType.value && styles.mealTypeLabelActive,
                ]}
              >
                {mealType.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Time Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Time</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color={theme.colors.text} />
          <Text style={styles.timeButtonText}>
            {mealTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={mealTime}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Meal Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What did you eat? (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="E.g., Oatmeal with berries"
          placeholderTextColor={theme.colors.textMuted}
          value={mealNotes}
          onChangeText={setMealNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.saveMealButton} onPress={saveMeal}>
          <Ionicons name="restaurant" size={20} color={theme.colors.background} />
          <Text style={styles.saveMealButtonText}>Log Meal</Text>
        </TouchableOpacity>

        {lastMealTime && fastingDuration > 0 && (
          <TouchableOpacity style={styles.saveFastButton} onPress={saveFast}>
            <Ionicons name="timer" size={20} color={theme.colors.background} />
            <Text style={styles.saveFastButtonText}>Log as Fast</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.hintBox}>
        <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
        <Text style={styles.hintText}>
          "Log Meal" records what you ate. "Log as Fast" records the time since your last meal.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 20,
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
  fastingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: theme.colors.orangeDeep,
  },
  fastingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  fastingTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fastingDuration: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.orangeBright,
    marginBottom: 4,
  },
  fastingSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  mealTypeOptionActive: {
    borderColor: theme.colors.text,
    backgroundColor: theme.colors.border,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  mealTypeLabelActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.weights.semiBold,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  notesInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 20,
  },
  saveMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.text,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveMealButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
  },
  saveFastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.orangeBright,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveFastButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: theme.typography.weights.bold,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
});
