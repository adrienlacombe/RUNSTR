/**
 * WorkoutDetailModal - Detailed workout view with splits, weather, and activity-specific data
 * Shows comprehensive workout information in a modal dialog
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../styles/theme';
import type { LocalWorkout } from '../../../services/fitness/LocalWorkoutStorageService';
import type { Workout } from '../../../types/workout';
import type { Split } from '../../../services/activity/SplitTrackingService';

interface WorkoutDetailModalProps {
  visible: boolean;
  workout: LocalWorkout | Workout | null;
  onClose: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  visible,
  workout,
  onClose,
}) => {
  if (!workout) return null;

  // Format helpers
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return '--';
    return meters < 1000
      ? `${meters.toFixed(0)}m`
      : `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} /km`;
  };

  const formatSplitTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatElevation = (meters?: number): string => {
    if (!meters) return '--';
    return `${Math.round(meters)}m`;
  };

  const getWeatherEmoji = (icon: string): string => {
    const iconMap: Record<string, string> = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[icon] || '🌤️';
  };

  const getActivityTypeName = (): string => {
    const baseType = workout.type ? (workout.type as string) : 'Workout';
    const localWorkout = workout as LocalWorkout;

    // Check for meditation subtype
    if (baseType === 'meditation' && localWorkout.meditationType) {
      const typeMap: Record<string, string> = {
        guided: 'Guided Meditation',
        unguided: 'Unguided Meditation',
        breathwork: 'Breathwork',
        body_scan: 'Body Scan',
        loving_kindness: 'Loving-Kindness',
      };
      return typeMap[localWorkout.meditationType] || 'Meditation';
    }

    // Check for meal type
    if (baseType === 'diet' && localWorkout.mealType) {
      return (
        localWorkout.mealType.charAt(0).toUpperCase() +
        localWorkout.mealType.slice(1)
      );
    }

    // Check for exercise type
    if (
      (baseType === 'strength_training' || baseType === 'gym') &&
      localWorkout.exerciseType
    ) {
      return (
        localWorkout.exerciseType.charAt(0).toUpperCase() +
        localWorkout.exerciseType.slice(1)
      );
    }

    // Default capitalization
    return baseType.charAt(0).toUpperCase() + baseType.slice(1);
  };

  const isCardioWorkout = (): boolean => {
    const cardioTypes = ['running', 'cycling', 'walking', 'hiking'];
    return cardioTypes.includes(workout.type);
  };

  const isMeditationWorkout = (): boolean => {
    return workout.type === 'meditation';
  };

  const isStrengthWorkout = (): boolean => {
    return workout.type === 'strength_training' || workout.type === 'gym';
  };

  const isDietWorkout = (): boolean => {
    return workout.type === 'diet' || workout.type === 'fasting';
  };

  const renderCardioDetails = () => {
    const localWorkout = workout as LocalWorkout;
    const splits = localWorkout.splits;

    return (
      <>
        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {formatDistance(workout.distance)}
            </Text>
          </View>
          {workout.pace && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Pace</Text>
              <Text style={styles.statValue}>{formatPace(workout.pace)}</Text>
            </View>
          )}
          {localWorkout.elevation && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Elevation</Text>
              <Text style={styles.statValue}>
                {formatElevation(localWorkout.elevation)}
              </Text>
            </View>
          )}
        </View>

        {/* Splits Table */}
        {splits && splits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Splits</Text>
            <View style={styles.splitsTable}>
              {/* Table Header */}
              <View style={styles.splitsHeader}>
                <Text style={[styles.splitsHeaderText, styles.kmColumn]}>
                  Km
                </Text>
                <Text style={[styles.splitsHeaderText, styles.timeColumn]}>
                  Total
                </Text>
                <Text style={[styles.splitsHeaderText, styles.paceColumn]}>
                  Pace
                </Text>
                <Text style={[styles.splitsHeaderText, styles.splitColumn]}>
                  Split
                </Text>
              </View>

              {/* Table Rows */}
              {splits.map((split, index) => (
                <View
                  key={index}
                  style={[
                    styles.splitsRow,
                    index % 2 === 1 && styles.splitsRowAlt,
                  ]}
                >
                  <Text style={[styles.splitsRowText, styles.kmColumn]}>
                    {split.number || split.splitNumber || index + 1}
                  </Text>
                  <Text style={[styles.splitsRowText, styles.timeColumn]}>
                    {formatSplitTime(split.elapsedTime || split.duration || 0)}
                  </Text>
                  <Text style={[styles.splitsRowText, styles.paceColumn]}>
                    {formatPace(split.pace)}
                  </Text>
                  <Text style={[styles.splitsRowText, styles.splitColumn]}>
                    {formatSplitTime(split.splitTime || 0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  const renderMeditationDetails = () => {
    const localWorkout = workout as LocalWorkout;

    return (
      <View style={styles.section}>
        <View style={styles.meditationInfo}>
          <Ionicons name="body" size={48} color={theme.colors.text} />
          <Text style={styles.meditationDuration}>
            {formatDuration(workout.duration)}
          </Text>
          {localWorkout.meditationType && (
            <Text style={styles.meditationType}>{getActivityTypeName()}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderStrengthDetails = () => {
    const localWorkout = workout as LocalWorkout;
    const totalReps = workout.reps || 0;
    const totalSets = workout.sets || 0;

    return (
      <View style={styles.section}>
        <View style={styles.strengthSummary}>
          <View style={styles.strengthStat}>
            <Text style={styles.strengthStatValue}>{totalReps}</Text>
            <Text style={styles.strengthStatLabel}>Total Reps</Text>
          </View>
          <View style={styles.strengthStat}>
            <Text style={styles.strengthStatValue}>{totalSets}</Text>
            <Text style={styles.strengthStatLabel}>Sets</Text>
          </View>
          <View style={styles.strengthStat}>
            <Text style={styles.strengthStatValue}>
              {formatDuration(workout.duration)}
            </Text>
            <Text style={styles.strengthStatLabel}>Duration</Text>
          </View>
        </View>

        {/* Sets Breakdown */}
        {localWorkout.repsBreakdown &&
          localWorkout.repsBreakdown.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Sets Breakdown</Text>
              {localWorkout.repsBreakdown.map((reps, index) => (
                <View key={index} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {index + 1}</Text>
                  <Text style={styles.setReps}>{reps} reps</Text>
                </View>
              ))}
              {localWorkout.restTime && (
                <Text style={styles.restTimeText}>
                  Rest: {localWorkout.restTime} seconds between sets
                </Text>
              )}
            </View>
          )}
      </View>
    );
  };

  const renderDietDetails = () => {
    const localWorkout = workout as LocalWorkout;

    return (
      <View style={styles.section}>
        {workout.type === 'diet' && localWorkout.mealType && (
          <>
            <View style={styles.dietInfo}>
              <Ionicons name="restaurant" size={48} color={theme.colors.text} />
              <Text style={styles.dietType}>{getActivityTypeName()}</Text>
              {localWorkout.mealTime && (
                <Text style={styles.dietTime}>
                  {new Date(localWorkout.mealTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
          </>
        )}

        {workout.type === 'fasting' && (
          <View style={styles.dietInfo}>
            <Ionicons
              name="timer"
              size={48}
              color={theme.colors.orangeBright}
            />
            <Text style={styles.dietType}>Fasting</Text>
            <Text style={styles.dietDuration}>
              {formatDuration(workout.duration)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{getActivityTypeName()}</Text>
              <Text style={styles.subtitle}>
                {formatDuration(workout.duration)}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Weather Section */}
            {workout.weather && (
              <View style={styles.section}>
                <View style={styles.weatherCard}>
                  <Text style={styles.weatherEmoji}>
                    {getWeatherEmoji(workout.weather.icon)}
                  </Text>
                  <View style={styles.weatherInfo}>
                    <Text style={styles.weatherTemp}>
                      {workout.weather.temp}°C
                    </Text>
                    <Text style={styles.weatherDesc}>
                      {workout.weather.description}
                    </Text>
                    {workout.weather.humidity !== undefined && (
                      <Text style={styles.weatherDetail}>
                        Humidity: {workout.weather.humidity}%
                      </Text>
                    )}
                    {workout.weather.windSpeed !== undefined && (
                      <Text style={styles.weatherDetail}>
                        Wind: {workout.weather.windSpeed.toFixed(1)} m/s
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Activity-Specific Details */}
            {isCardioWorkout() && renderCardioDetails()}
            {isMeditationWorkout() && renderMeditationDetails()}
            {isStrengthWorkout() && renderStrengthDetails()}
            {isDietWorkout() && renderDietDetails()}

            {/* Notes Section */}
            {(workout as LocalWorkout).notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>
                  {(workout as LocalWorkout).notes}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  // Weather styles
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  weatherEmoji: {
    fontSize: 48,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  weatherDesc: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  weatherDetail: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  // Stats row styles
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  // Splits table styles
  splitsTable: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  splitsHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  splitsHeaderText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  splitsRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  splitsRowText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  kmColumn: {
    width: '15%',
    textAlign: 'center',
  },
  timeColumn: {
    width: '28%',
    textAlign: 'center',
  },
  paceColumn: {
    width: '30%',
    textAlign: 'center',
  },
  splitColumn: {
    width: '27%',
    textAlign: 'center',
  },
  // Meditation styles
  meditationInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  meditationDuration: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 16,
  },
  meditationType: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  // Strength styles
  strengthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  strengthStat: {
    alignItems: 'center',
  },
  strengthStatValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  strengthStatLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subsection: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  setNumber: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  setReps: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  restTimeText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Diet styles
  dietInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dietType: {
    fontSize: 24,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: 16,
  },
  dietTime: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  dietDuration: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.orangeBright,
    marginTop: 12,
  },
  // Notes styles
  notesText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
