/**
 * Nutrition Analytics Service
 * Analyzes diet and meal timing data for patterns, fasting trends, and correlations
 * All calculations happen locally on-device
 */

import type { LocalWorkout } from '../fitness/LocalWorkoutStorageService';
import type {
  NutritionMetrics,
  MealTimingData,
  FastingData,
  MealFrequencyData,
  CorrelationData,
} from '../../types/analytics';

interface MealEntry {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: Date;
  notes: string;
}

export class NutritionAnalytics {
  /**
   * Calculate all nutrition metrics from workout data
   */
  static calculateMetrics(workouts: LocalWorkout[]): NutritionMetrics | null {
    const mealEntries = this.extractMealEntries(workouts);

    if (mealEntries.length === 0) {
      return null;
    }

    return {
      mealTimingPatterns: this.calculateMealTiming(mealEntries),
      fastingTrends: this.calculateFastingTrends(mealEntries),
      mealFrequency: this.calculateMealFrequency(mealEntries),
      dietPerformanceCorrelation: this.calculateDietPerformanceCorrelation(
        workouts,
        mealEntries
      ),
      consistencyScore: this.calculateConsistencyScore(mealEntries),
    };
  }

  /**
   * Extract meal entries from workouts (diet tracking)
   */
  private static extractMealEntries(workouts: LocalWorkout[]): MealEntry[] {
    const entries: MealEntry[] = [];

    workouts.forEach((w) => {
      // Look for diet/meal tracking workouts
      if (w.type === 'other' || w.type === 'wellness') {
        const notes = (w.notes || '').toLowerCase();

        // Parse meal type from notes
        let mealType: MealEntry['type'] | null = null;

        if (notes.includes('breakfast')) {
          mealType = 'breakfast';
        } else if (notes.includes('lunch')) {
          mealType = 'lunch';
        } else if (notes.includes('dinner')) {
          mealType = 'dinner';
        } else if (notes.includes('snack')) {
          mealType = 'snack';
        }

        if (mealType) {
          entries.push({
            type: mealType,
            time: new Date(w.startTime),
            notes: w.notes || '',
          });
        }
      }
    });

    return entries.sort((a, b) => a.time.getTime() - b.time.getTime());
  }

  /**
   * Calculate meal timing patterns
   */
  private static calculateMealTiming(entries: MealEntry[]): MealTimingData {
    const breakfastTimes: number[] = [];
    const lunchTimes: number[] = [];
    const dinnerTimes: number[] = [];

    entries.forEach((entry) => {
      const hour = entry.time.getHours();
      const minutes = entry.time.getMinutes();
      const timeInMinutes = hour * 60 + minutes; // Minutes since midnight

      switch (entry.type) {
        case 'breakfast':
          breakfastTimes.push(timeInMinutes);
          break;
        case 'lunch':
          lunchTimes.push(timeInMinutes);
          break;
        case 'dinner':
          dinnerTimes.push(timeInMinutes);
          break;
      }
    });

    const avgBreakfastTime = this.formatTimeFromMinutes(
      this.calculateAverage(breakfastTimes)
    );
    const avgLunchTime = this.formatTimeFromMinutes(
      this.calculateAverage(lunchTimes)
    );
    const avgDinnerTime = this.formatTimeFromMinutes(
      this.calculateAverage(dinnerTimes)
    );

    // Calculate consistency (standard deviation of meal times)
    const breakfastConsistency = this.calculateTimeConsistency(breakfastTimes);
    const lunchConsistency = this.calculateTimeConsistency(lunchTimes);
    const dinnerConsistency = this.calculateTimeConsistency(dinnerTimes);

    const avgConsistency =
      (breakfastConsistency + lunchConsistency + dinnerConsistency) / 3;

    // Group entries by meal and time range
    const patterns = this.groupMealsByTimeRange(entries);

    return {
      avgBreakfastTime,
      avgLunchTime,
      avgDinnerTime,
      consistency: Math.round(avgConsistency),
      patterns,
    };
  }

  /**
   * Group meals by time ranges for pattern analysis
   */
  private static groupMealsByTimeRange(
    entries: MealEntry[]
  ): Array<{ meal: string; timeRange: string; count: number }> {
    const patterns: Record<string, number> = {};

    entries.forEach((entry) => {
      const hour = entry.time.getHours();
      let timeRange: string;

      if (hour >= 5 && hour < 10) {
        timeRange = '5am-10am';
      } else if (hour >= 10 && hour < 14) {
        timeRange = '10am-2pm';
      } else if (hour >= 14 && hour < 18) {
        timeRange = '2pm-6pm';
      } else if (hour >= 18 && hour < 22) {
        timeRange = '6pm-10pm';
      } else {
        timeRange = '10pm-5am';
      }

      const key = `${entry.type}-${timeRange}`;
      patterns[key] = (patterns[key] || 0) + 1;
    });

    return Object.entries(patterns)
      .map(([key, count]) => {
        const [meal, timeRange] = key.split('-');
        return { meal, timeRange, count };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate fasting trends
   */
  private static calculateFastingTrends(entries: MealEntry[]): FastingData {
    if (entries.length < 2) {
      return {
        avgFastingDuration: 0,
        mostCommonPattern: 'unknown',
        trend: 'stable',
        weeklyAvgs: [],
      };
    }

    // Calculate fasting windows (time between last meal and first meal next day)
    const fastingDurations: number[] = [];
    const groupedByDay = this.groupEntriesByDay(entries);

    const days = Object.keys(groupedByDay).sort();
    for (let i = 0; i < days.length - 1; i++) {
      const todayMeals = groupedByDay[days[i]];
      const tomorrowMeals = groupedByDay[days[i + 1]];

      if (todayMeals.length > 0 && tomorrowMeals.length > 0) {
        const lastMealToday = todayMeals[todayMeals.length - 1].time;
        const firstMealTomorrow = tomorrowMeals[0].time;

        const fastingHours =
          (firstMealTomorrow.getTime() - lastMealToday.getTime()) /
          (1000 * 60 * 60);

        if (fastingHours > 0 && fastingHours < 24) {
          fastingDurations.push(fastingHours);
        }
      }
    }

    if (fastingDurations.length === 0) {
      return {
        avgFastingDuration: 0,
        mostCommonPattern: 'unknown',
        trend: 'stable',
        weeklyAvgs: [],
      };
    }

    const avgFastingDuration = this.calculateAverage(fastingDurations);

    // Determine most common fasting pattern
    const mostCommonPattern = this.determineFastingPattern(avgFastingDuration);

    // Calculate weekly averages
    const weeklyAvgs = this.calculateWeeklyFastingAverages(entries, 8);

    // Calculate trend
    const recentAvg =
      weeklyAvgs.slice(-4).reduce((sum, w) => sum + w.avgHours, 0) / 4;
    const previousAvg =
      weeklyAvgs.slice(-8, -4).reduce((sum, w) => sum + w.avgHours, 0) / 4;

    const change =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    const trend: FastingData['trend'] =
      change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable';

    return {
      avgFastingDuration: Math.round(avgFastingDuration * 10) / 10,
      mostCommonPattern,
      trend,
      weeklyAvgs,
    };
  }

  /**
   * Group meal entries by day
   */
  private static groupEntriesByDay(
    entries: MealEntry[]
  ): Record<string, MealEntry[]> {
    const grouped: Record<string, MealEntry[]> = {};

    entries.forEach((entry) => {
      const dayKey = entry.time.toISOString().split('T')[0];
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(entry);
    });

    // Sort each day's entries by time
    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => a.time.getTime() - b.time.getTime());
    });

    return grouped;
  }

  /**
   * Determine fasting pattern from average hours
   */
  private static determineFastingPattern(avgHours: number): string {
    if (avgHours < 12) {
      return '12:12 or less';
    } else if (avgHours >= 12 && avgHours < 14) {
      return '12:12';
    } else if (avgHours >= 14 && avgHours < 17) {
      return '16:8';
    } else if (avgHours >= 17 && avgHours < 20) {
      return '18:6';
    } else {
      return '20:4 or more';
    }
  }

  /**
   * Calculate weekly fasting averages
   */
  private static calculateWeeklyFastingAverages(
    entries: MealEntry[],
    weeks: number
  ): Array<{ week: string; avgHours: number }> {
    const result: Array<{ week: string; avgHours: number }> = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekEntries = entries.filter(
        (e) => e.time >= weekStart && e.time < weekEnd
      );

      // Calculate fasting durations for this week
      const groupedByDay = this.groupEntriesByDay(weekEntries);
      const days = Object.keys(groupedByDay).sort();
      const weekFastingDurations: number[] = [];

      for (let j = 0; j < days.length - 1; j++) {
        const todayMeals = groupedByDay[days[j]];
        const tomorrowMeals = groupedByDay[days[j + 1]];

        if (todayMeals.length > 0 && tomorrowMeals.length > 0) {
          const lastMealToday = todayMeals[todayMeals.length - 1].time;
          const firstMealTomorrow = tomorrowMeals[0].time;

          const fastingHours =
            (firstMealTomorrow.getTime() - lastMealToday.getTime()) /
            (1000 * 60 * 60);

          if (fastingHours > 0 && fastingHours < 24) {
            weekFastingDurations.push(fastingHours);
          }
        }
      }

      const avgHours =
        weekFastingDurations.length > 0
          ? this.calculateAverage(weekFastingDurations)
          : 0;

      result.push({
        week: this.formatWeek(weekStart),
        avgHours: Math.round(avgHours * 10) / 10,
      });
    }

    return result;
  }

  /**
   * Calculate meal frequency patterns
   */
  private static calculateMealFrequency(
    entries: MealEntry[]
  ): MealFrequencyData {
    const groupedByDay = this.groupEntriesByDay(entries);
    const days = Object.keys(groupedByDay);

    if (days.length === 0) {
      return {
        avgMealsPerDay: 0,
        pattern: 'unknown',
        trend: 'stable',
      };
    }

    // Calculate average meals per day
    const mealsPerDay = days.map((day) => groupedByDay[day].length);
    const avgMealsPerDay = this.calculateAverage(mealsPerDay);

    // Determine pattern (count snacks separately)
    const avgMainMeals = days.map(
      (day) => groupedByDay[day].filter((e) => e.type !== 'snack').length
    );
    const avgSnacks = days.map(
      (day) => groupedByDay[day].filter((e) => e.type === 'snack').length
    );

    const avgMain = Math.round(this.calculateAverage(avgMainMeals));
    const avgSnack = Math.round(this.calculateAverage(avgSnacks));

    const pattern =
      avgSnack > 0
        ? `${avgMain} meals + ${avgSnack} snack${avgSnack !== 1 ? 's' : ''}`
        : `${avgMain} meal${avgMain !== 1 ? 's' : ''}`;

    // Calculate trend (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentEntries = entries.filter((e) => e.time >= thirtyDaysAgo);
    const previousEntries = entries.filter(
      (e) => e.time >= sixtyDaysAgo && e.time < thirtyDaysAgo
    );

    const recentGrouped = this.groupEntriesByDay(recentEntries);
    const previousGrouped = this.groupEntriesByDay(previousEntries);

    const recentAvg =
      Object.keys(recentGrouped).length > 0
        ? Object.values(recentGrouped).reduce(
            (sum, meals) => sum + meals.length,
            0
          ) / Object.keys(recentGrouped).length
        : 0;

    const previousAvg =
      Object.keys(previousGrouped).length > 0
        ? Object.values(previousGrouped).reduce(
            (sum, meals) => sum + meals.length,
            0
          ) / Object.keys(previousGrouped).length
        : 0;

    const change =
      previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    const trend: MealFrequencyData['trend'] =
      change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable';

    return {
      avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
      pattern,
      trend,
    };
  }

  /**
   * Calculate correlation between diet consistency and workout performance
   */
  private static calculateDietPerformanceCorrelation(
    allWorkouts: LocalWorkout[],
    mealEntries: MealEntry[]
  ): CorrelationData | undefined {
    // Need sufficient data for meaningful correlation
    const cardioWorkouts = allWorkouts.filter((w) =>
      ['running', 'cycling', 'walking', 'hiking'].includes(w.type)
    );

    if (mealEntries.length < 20 || cardioWorkouts.length < 10) {
      return undefined;
    }

    // For each workout, check meal timing consistency in previous 24 hours
    const workoutsWithDietData: Array<{
      hadConsistentMeals: boolean;
      performance: number;
    }> = [];

    cardioWorkouts.forEach((workout) => {
      const workoutTime = workout.startTime;
      const workoutDate = new Date(workoutTime);
      const twentyFourHoursBefore = new Date(
        workoutDate.getTime() - 24 * 60 * 60 * 1000
      );

      // Find meals in 24h before workout
      const recentMeals = mealEntries.filter(
        (meal) => meal.time >= twentyFourHoursBefore && meal.time < workoutDate
      );

      // Consider diet "consistent" if 2-3 main meals logged
      const mainMeals = recentMeals.filter((m) => m.type !== 'snack');
      const hadConsistentMeals = mainMeals.length >= 2 && mainMeals.length <= 4;

      // Use pace as performance metric
      const pace =
        workout.distance && workout.duration > 0
          ? workout.duration / 60 / workout.distance
          : 0;

      if (pace > 0) {
        workoutsWithDietData.push({
          hadConsistentMeals,
          performance: 1 / pace, // Invert so higher is better
        });
      }
    });

    if (workoutsWithDietData.length < 10) {
      return undefined;
    }

    // Calculate average performance with and without consistent diet
    const withConsistent = workoutsWithDietData.filter(
      (w) => w.hadConsistentMeals
    );
    const withoutConsistent = workoutsWithDietData.filter(
      (w) => !w.hadConsistentMeals
    );

    if (withConsistent.length < 3 || withoutConsistent.length < 3) {
      return undefined;
    }

    const avgWithConsistent =
      withConsistent.reduce((sum, w) => sum + w.performance, 0) /
      withConsistent.length;
    const avgWithoutConsistent =
      withoutConsistent.reduce((sum, w) => sum + w.performance, 0) /
      withoutConsistent.length;

    const percentDiff =
      ((avgWithConsistent - avgWithoutConsistent) / avgWithoutConsistent) * 100;

    let coefficient: number;
    let strength: CorrelationData['strength'];
    let direction: CorrelationData['direction'];
    let insight: string;

    if (Math.abs(percentDiff) < 2) {
      coefficient = 0;
      strength = 'none';
      direction = 'none';
      insight =
        'No significant correlation between meal consistency and workout performance';
    } else if (Math.abs(percentDiff) < 5) {
      coefficient = percentDiff > 0 ? 0.3 : -0.3;
      strength = 'weak';
      direction = percentDiff > 0 ? 'positive' : 'negative';
      insight =
        percentDiff > 0
          ? 'Slight improvement in performance with consistent meal timing'
          : 'Slight decrease in performance with consistent meal timing';
    } else if (Math.abs(percentDiff) < 10) {
      coefficient = percentDiff > 0 ? 0.6 : -0.6;
      strength = 'moderate';
      direction = percentDiff > 0 ? 'positive' : 'negative';
      insight =
        percentDiff > 0
          ? 'Moderate correlation: Consistent meal timing improves workout performance'
          : 'Moderate correlation: Consistent meal timing decreases workout performance';
    } else {
      coefficient = percentDiff > 0 ? 0.8 : -0.8;
      strength = 'strong';
      direction = percentDiff > 0 ? 'positive' : 'negative';
      insight =
        percentDiff > 0
          ? 'Strong correlation: Regular meal patterns significantly improve performance'
          : 'Strong correlation: Regular meal patterns significantly decrease performance';
    }

    return {
      coefficient,
      strength,
      direction,
      insight,
    };
  }

  /**
   * Calculate diet consistency score (0-100)
   */
  private static calculateConsistencyScore(entries: MealEntry[]): number {
    if (entries.length === 0) return 0;

    const groupedByDay = this.groupEntriesByDay(entries);
    const days = Object.keys(groupedByDay);

    if (days.length < 7) return 0; // Need at least a week of data

    // Factor 1: Meal timing consistency (40 points)
    const breakfastTimes = entries
      .filter((e) => e.type === 'breakfast')
      .map((e) => {
        const hour = e.time.getHours();
        const minutes = e.time.getMinutes();
        return hour * 60 + minutes;
      });

    const lunchTimes = entries
      .filter((e) => e.type === 'lunch')
      .map((e) => {
        const hour = e.time.getHours();
        const minutes = e.time.getMinutes();
        return hour * 60 + minutes;
      });

    const dinnerTimes = entries
      .filter((e) => e.type === 'dinner')
      .map((e) => {
        const hour = e.time.getHours();
        const minutes = e.time.getMinutes();
        return hour * 60 + minutes;
      });

    const timingScore =
      (this.calculateTimeConsistency(breakfastTimes) +
        this.calculateTimeConsistency(lunchTimes) +
        this.calculateTimeConsistency(dinnerTimes)) /
      3;

    // Factor 2: Tracking frequency (30 points)
    const trackingFrequency = (days.length / 30) * 100; // Percentage of days tracked in last 30 days
    const frequencyScore = Math.min(trackingFrequency, 100) * 0.3;

    // Factor 3: Meal count consistency (30 points)
    const mealsPerDay = days.map((day) => groupedByDay[day].length);
    const avgMeals = this.calculateAverage(mealsPerDay);
    const mealCountVariance =
      mealsPerDay.reduce(
        (sum, count) => sum + Math.pow(count - avgMeals, 2),
        0
      ) / mealsPerDay.length;
    const mealCountScore = Math.max(0, 100 - mealCountVariance * 20);

    const totalScore =
      timingScore * 0.4 + frequencyScore + mealCountScore * 0.3;

    return Math.round(Math.min(100, Math.max(0, totalScore)));
  }

  /**
   * Calculate time consistency score (0-100)
   */
  private static calculateTimeConsistency(times: number[]): number {
    if (times.length < 2) return 0;

    const avg = this.calculateAverage(times);
    const variance =
      times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
      times.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    // 60 minutes stdDev = 0 score, 0 minutes stdDev = 100 score
    const score = Math.max(0, 100 - (stdDev / 60) * 100);

    return score;
  }

  /**
   * Calculate average of number array
   */
  private static calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  }

  /**
   * Format time from minutes since midnight to HH:mm
   */
  private static formatTimeFromMinutes(minutes: number): string {
    if (minutes === 0 || isNaN(minutes)) return '--:--';

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Format week for display
   */
  private static formatWeek(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}
