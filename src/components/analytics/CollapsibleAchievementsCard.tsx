/**
 * CollapsibleAchievementsCard - Single dropdown for all personal records
 * Click to expand and show Cardio, Strength, Wellness, and Nutrition achievements
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import type {
  AllPersonalRecords,
  CardioPR,
  StrengthPR,
  WellnessPR,
  DietPR,
} from '../../services/analytics/PersonalRecordsService';
import { PersonalRecordsService } from '../../services/analytics/PersonalRecordsService';

interface CollapsibleAchievementsCardProps {
  personalRecords: AllPersonalRecords;
}

export const CollapsibleAchievementsCard: React.FC<
  CollapsibleAchievementsCardProps
> = ({ personalRecords }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count total PRs
  const getTotalPRCount = (): number => {
    let count = 0;
    const c = personalRecords.cardio;
    const s = personalRecords.strength;
    const w = personalRecords.wellness;
    const d = personalRecords.diet;

    if (c.fastest5K) count++;
    if (c.fastest10K) count++;
    if (c.fastestHalfMarathon) count++;
    if (c.fastestMarathon) count++;
    if (c.longestStreak > 0) count++;
    if (s.maxWeight) count++;
    if (s.bestWeightRepCombo) count++;
    if (s.longestStreak > 0) count++;
    if (w.longestStreak > 0) count++;
    if (d.maxFastingHours) count++;
    if (d.longestMealStreak > 0) count++;

    return count;
  };

  const totalPRs = getTotalPRCount();

  // Empty state
  if (totalPRs === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons
          name="medal-outline"
          size={32}
          color={theme.colors.textMuted}
        />
        <Text style={styles.emptyText}>
          Start working out to unlock achievements!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Single Header - tap to expand */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="medal-outline" size={18} color="#FF9D42" />
          <Text style={styles.headerTitle}>Achievements</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalPRs}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>

      {/* Expanded Content - all categories */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Cardio */}
          {hasCardioPRs(personalRecords.cardio) && (
            <CategorySection
              title="Cardio"
              icon="walk-outline"
              content={renderCardioPRs(personalRecords.cardio)}
            />
          )}

          {/* Strength */}
          {hasStrengthPRs(personalRecords.strength) && (
            <CategorySection
              title="Strength"
              icon="barbell-outline"
              content={renderStrengthPRs(personalRecords.strength)}
            />
          )}

          {/* Wellness */}
          {personalRecords.wellness.longestStreak > 0 && (
            <CategorySection
              title="Wellness"
              icon="flower-outline"
              content={renderWellnessPRs(personalRecords.wellness)}
            />
          )}

          {/* Diet */}
          {hasDietPRs(personalRecords.diet) && (
            <CategorySection
              title="Diet"
              icon="restaurant-outline"
              content={renderDietPRs(personalRecords.diet)}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Helper functions
function hasCardioPRs(c: CardioPR): boolean {
  return !!(c.fastest5K || c.fastest10K || c.fastestHalfMarathon || c.fastestMarathon || c.longestStreak > 0);
}

function hasStrengthPRs(s: StrengthPR): boolean {
  return !!(s.maxWeight || s.bestWeightRepCombo || s.longestStreak > 0);
}

function hasDietPRs(d: DietPR): boolean {
  return !!(d.maxFastingHours || d.longestMealStreak > 0);
}

// Category Section component
interface CategorySectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  content: React.ReactNode;
}

function CategorySection({ title, icon, content }: CategorySectionProps): React.ReactElement {
  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Ionicons name={icon} size={14} color={theme.colors.textMuted} />
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>
      {content}
    </View>
  );
}

function renderCardioPRs(cardio: CardioPR): React.ReactNode {
  return (
    <>
      {cardio.fastest5K && (
        <PRRow
          label="Fastest 5K"
          value={PersonalRecordsService.formatDuration(cardio.fastest5K.time)}
        />
      )}
      {cardio.fastest10K && (
        <PRRow
          label="Fastest 10K"
          value={PersonalRecordsService.formatDuration(cardio.fastest10K.time)}
        />
      )}
      {cardio.fastestHalfMarathon && (
        <PRRow
          label="Half Marathon"
          value={PersonalRecordsService.formatDuration(cardio.fastestHalfMarathon.time)}
        />
      )}
      {cardio.fastestMarathon && (
        <PRRow
          label="Marathon"
          value={PersonalRecordsService.formatDuration(cardio.fastestMarathon.time)}
        />
      )}
      {cardio.longestStreak > 0 && (
        <PRRow label="Longest Streak" value={`${cardio.longestStreak} days`} />
      )}
    </>
  );
}

function renderStrengthPRs(strength: StrengthPR): React.ReactNode {
  return (
    <>
      {strength.maxWeight && (
        <PRRow label="Max Weight" value={`${strength.maxWeight.weight} lbs`} />
      )}
      {strength.bestWeightRepCombo && (
        <PRRow
          label="Best Combo"
          value={`${strength.bestWeightRepCombo.weight}×${strength.bestWeightRepCombo.reps}`}
        />
      )}
      {strength.longestStreak > 0 && (
        <PRRow label="Longest Streak" value={`${strength.longestStreak} days`} />
      )}
    </>
  );
}

function renderWellnessPRs(wellness: WellnessPR): React.ReactNode {
  return (
    <PRRow label="Longest Streak" value={`${wellness.longestStreak} days`} />
  );
}

function renderDietPRs(diet: DietPR): React.ReactNode {
  return (
    <>
      {diet.longestMealStreak > 0 && (
        <PRRow label="Meal Streak" value={`${diet.longestMealStreak} days`} />
      )}
      {diet.maxFastingHours && (
        <PRRow label="Longest Fast" value={`${diet.maxFastingHours.hours.toFixed(1)} hrs`} />
      )}
    </>
  );
}

// Simple PR Row
interface PRRowProps {
  label: string;
  value: string;
}

function PRRow({ label, value }: PRRowProps): React.ReactElement {
  return (
    <View style={styles.prRow}>
      <Text style={styles.prLabel}>{label}</Text>
      <Text style={styles.prValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },

  countBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },

  countText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
  },

  content: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },

  categorySection: {
    paddingTop: 10,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  categoryTitle: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingLeft: 20,
  },

  prLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  prValue: {
    fontSize: 12,
    fontWeight: theme.typography.weights.semiBold,
    color: '#FF9D42',
  },
});
