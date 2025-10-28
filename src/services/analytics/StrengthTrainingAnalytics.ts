/**
 * Strength Training Analytics Service
 * Analyzes strength workout data for volume, exercise balance, density, and rest optimization
 * All calculations happen locally on-device
 */

import type { LocalWorkout } from '../fitness/LocalWorkoutStorageService';
import type {
  StrengthTrainingMetrics,
  VolumeProgression,
  ExerciseBalance,
  WorkoutDensity,
  RestTimeData,
} from '../../types/analytics';

export class StrengthTrainingAnalytics {
  /**
   * Calculate all strength training metrics from workout data
   */
  static calculateMetrics(
    workouts: LocalWorkout[]
  ): StrengthTrainingMetrics | null {
    const strengthWorkouts = this.filterStrengthWorkouts(workouts);

    if (strengthWorkouts.length === 0) {
      return null;
    }

    const allWorkouts = workouts; // Include cardio for balance calculation

    return {
      volumeProgression: this.calculateVolumeProgression(strengthWorkouts),
      exerciseBalance: this.calculateExerciseBalance(strengthWorkouts),
      workoutDensity: this.calculateWorkoutDensity(strengthWorkouts),
      strengthCardioBalance: this.calculateStrengthCardioBalance(allWorkouts),
      restTimeOptimization:
        this.calculateRestTimeOptimization(strengthWorkouts),
    };
  }

  /**
   * Filter workouts to only strength training activities
   * Note: Includes 'strength' type for imported Nostr workouts
   */
  private static filterStrengthWorkouts(
    workouts: LocalWorkout[]
  ): LocalWorkout[] {
    return workouts
      .filter(
        (w) =>
          w.type === 'strength_training' ||
          w.type === 'gym' ||
          w.type === 'strength'
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }

  /**
   * Calculate volume progression (total reps over time)
   */
  private static calculateVolumeProgression(
    workouts: LocalWorkout[]
  ): VolumeProgression {
    if (workouts.length === 0) {
      return {
        currentMonthlyVolume: 0,
        previousMonthlyVolume: 0,
        percentChange: 0,
        trend: 'stable',
        weeklyVolumes: [],
      };
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month workouts
    const currentMonthWorkouts = workouts.filter(
      (w) => new Date(w.startTime) >= currentMonthStart
    );

    // Previous month workouts
    const previousMonthWorkouts = workouts.filter((w) => {
      const date = new Date(w.startTime);
      return date >= previousMonthStart && date <= previousMonthEnd;
    });

    const currentMonthlyVolume = this.calculateTotalReps(currentMonthWorkouts);
    const previousMonthlyVolume = this.calculateTotalReps(
      previousMonthWorkouts
    );

    const percentChange =
      previousMonthlyVolume > 0
        ? ((currentMonthlyVolume - previousMonthlyVolume) /
            previousMonthlyVolume) *
          100
        : 0;

    const trend: VolumeProgression['trend'] =
      percentChange > 5
        ? 'increasing'
        : percentChange < -5
        ? 'decreasing'
        : 'stable';

    const weeklyVolumes = this.calculateWeeklyVolumes(workouts, 8);

    return {
      currentMonthlyVolume,
      previousMonthlyVolume,
      percentChange,
      trend,
      weeklyVolumes,
    };
  }

  /**
   * Calculate total reps from workouts
   */
  private static calculateTotalReps(workouts: LocalWorkout[]): number {
    return workouts.reduce((sum, w) => sum + (w.reps || 0), 0);
  }

  /**
   * Calculate weekly volume totals
   */
  private static calculateWeeklyVolumes(
    workouts: LocalWorkout[],
    weeks: number
  ): Array<{ week: string; totalReps: number }> {
    const result: Array<{ week: string; totalReps: number }> = [];
    const now = new Date();

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekWorkouts = workouts.filter((w) => {
        const date = new Date(w.startTime);
        return date >= weekStart && date < weekEnd;
      });

      const totalReps = this.calculateTotalReps(weekWorkouts);

      result.push({
        week: this.formatWeek(weekStart),
        totalReps,
      });
    }

    return result;
  }

  /**
   * Calculate exercise balance (distribution across exercise types)
   */
  private static calculateExerciseBalance(
    workouts: LocalWorkout[]
  ): ExerciseBalance {
    // Count reps by exercise type from notes/metadata
    const exerciseCounts: Record<string, number> = {
      pushups: 0,
      pullups: 0,
      situps: 0,
      squats: 0,
      planks: 0,
      burpees: 0,
    };

    workouts.forEach((w) => {
      const notes = (w.notes || '').toLowerCase();
      const reps = w.reps || 0;

      // Parse exercise type from notes
      if (notes.includes('pushup') || notes.includes('push-up')) {
        exerciseCounts.pushups += reps;
      } else if (notes.includes('pullup') || notes.includes('pull-up')) {
        exerciseCounts.pullups += reps;
      } else if (
        notes.includes('situp') ||
        notes.includes('sit-up') ||
        notes.includes('crunch')
      ) {
        exerciseCounts.situps += reps;
      } else if (notes.includes('squat')) {
        exerciseCounts.squats += reps;
      } else if (notes.includes('plank')) {
        exerciseCounts.planks += reps;
      } else if (notes.includes('burpee')) {
        exerciseCounts.burpees += reps;
      }
    });

    const totalReps = Object.values(exerciseCounts).reduce(
      (sum, val) => sum + val,
      0
    );

    if (totalReps === 0) {
      return {
        pushups: 0,
        pullups: 0,
        situps: 0,
        squats: 0,
        planks: 0,
        burpees: 0,
        recommendations: [
          'Start tracking specific exercises for better insights',
        ],
      };
    }

    // Calculate percentages
    const balance: ExerciseBalance = {
      pushups: (exerciseCounts.pushups / totalReps) * 100,
      pullups: (exerciseCounts.pullups / totalReps) * 100,
      situps: (exerciseCounts.situps / totalReps) * 100,
      squats: (exerciseCounts.squats / totalReps) * 100,
      planks: (exerciseCounts.planks / totalReps) * 100,
      burpees: (exerciseCounts.burpees / totalReps) * 100,
      recommendations: [],
    };

    // Generate recommendations based on imbalances
    const pushPullRatio =
      exerciseCounts.pushups / Math.max(1, exerciseCounts.pullups);
    if (pushPullRatio > 2) {
      balance.recommendations.push(
        'Increase pullups for better push/pull balance'
      );
    } else if (pushPullRatio < 0.5) {
      balance.recommendations.push(
        'Increase pushups for better push/pull balance'
      );
    }

    if (exerciseCounts.situps < totalReps * 0.1) {
      balance.recommendations.push('Add more core work (situps/planks)');
    }

    if (exerciseCounts.squats < totalReps * 0.15) {
      balance.recommendations.push(
        'Include more lower body exercises (squats)'
      );
    }

    if (balance.recommendations.length === 0) {
      balance.recommendations.push('Great exercise balance! Keep it up.');
    }

    return balance;
  }

  /**
   * Calculate workout density (reps per minute)
   * Validates to avoid unrealistic values from short-duration workouts
   */
  private static calculateWorkoutDensity(
    workouts: LocalWorkout[]
  ): WorkoutDensity {
    if (workouts.length === 0) {
      return {
        avgRepsPerMinute: 0,
        trend: 'stable',
      };
    }

    const MAX_REALISTIC_REPS_PER_MIN = 50; // Cap at 50 reps/min (very fast pace)
    const MIN_WORKOUT_DURATION = 60; // Require at least 60 seconds for valid calculation

    // Calculate density for recent workouts
    const recentWorkouts = workouts.slice(-10); // Last 10 workouts
    const densities = recentWorkouts
      .filter((w) => w.duration >= MIN_WORKOUT_DURATION && w.reps)
      .map((w) => {
        const density = w.reps! / (w.duration / 60); // reps per minute
        // Filter out unrealistic values (likely data entry errors)
        return density <= MAX_REALISTIC_REPS_PER_MIN ? density : null;
      })
      .filter((d) => d !== null) as number[];

    if (densities.length === 0) {
      return {
        avgRepsPerMinute: 0,
        trend: 'stable',
      };
    }

    const avgRepsPerMinute =
      densities.reduce((sum, val) => sum + val, 0) / densities.length;

    // Compare with older workouts for trend
    const olderWorkouts = workouts.slice(-20, -10);
    const olderDensities = olderWorkouts
      .filter((w) => w.duration >= MIN_WORKOUT_DURATION && w.reps)
      .map((w) => {
        const density = w.reps! / (w.duration / 60);
        return density <= MAX_REALISTIC_REPS_PER_MIN ? density : null;
      })
      .filter((d) => d !== null) as number[];

    if (olderDensities.length === 0) {
      return {
        avgRepsPerMinute: Math.round(avgRepsPerMinute * 10) / 10,
        trend: 'stable',
      };
    }

    const olderAvg =
      olderDensities.reduce((sum, val) => sum + val, 0) / olderDensities.length;
    const change = ((avgRepsPerMinute - olderAvg) / olderAvg) * 100;

    const trend: WorkoutDensity['trend'] =
      change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';

    return {
      avgRepsPerMinute: Math.round(avgRepsPerMinute * 10) / 10,
      trend,
    };
  }

  /**
   * Calculate strength vs cardio balance
   */
  private static calculateStrengthCardioBalance(
    workouts: LocalWorkout[]
  ): number {
    const strengthWorkouts = workouts.filter(
      (w) => w.type === 'strength_training' || w.type === 'gym'
    );
    const cardioWorkouts = workouts.filter((w) =>
      ['running', 'cycling', 'walking', 'hiking'].includes(w.type)
    );

    const totalWorkouts = strengthWorkouts.length + cardioWorkouts.length;

    if (totalWorkouts === 0) return 0.5; // Default balanced

    return strengthWorkouts.length / totalWorkouts; // 0 = all cardio, 1 = all strength
  }

  /**
   * Calculate optimal rest time between sets
   */
  private static calculateRestTimeOptimization(
    workouts: LocalWorkout[]
  ): RestTimeData {
    // This is simplified - in reality, we'd need rest time data from workouts
    // For now, provide general recommendations

    const workoutsWithRestData = workouts.filter((w) => {
      // Check if notes contain rest time information
      const notes = (w.notes || '').toLowerCase();
      return (
        notes.includes('rest') || notes.includes('sec') || notes.includes('min')
      );
    });

    if (workoutsWithRestData.length === 0) {
      return {
        avgRestTime: 60, // Default 60 seconds
        optimalRestTime: 60,
        recommendation: 'Track rest times for personalized recommendations',
      };
    }

    // Parse rest times from notes (simplified)
    const restTimes = workoutsWithRestData
      .map((w) => this.parseRestTime(w.notes || ''))
      .filter((time) => time > 0);

    if (restTimes.length === 0) {
      return {
        avgRestTime: 60,
        optimalRestTime: 60,
        recommendation: 'Continue tracking rest times',
      };
    }

    const avgRestTime =
      restTimes.reduce((sum, val) => sum + val, 0) / restTimes.length;

    // Optimal rest time based on average (simplified recommendation)
    let optimalRestTime = 60;
    let recommendation = '';

    if (avgRestTime < 30) {
      optimalRestTime = 45;
      recommendation = 'Consider longer rest (45-60s) for better recovery';
    } else if (avgRestTime > 90) {
      optimalRestTime = 75;
      recommendation = 'Try shorter rest (60-75s) to increase workout density';
    } else {
      optimalRestTime = avgRestTime;
      recommendation = 'Current rest time is optimal for your training';
    }

    return {
      avgRestTime: Math.round(avgRestTime),
      optimalRestTime: Math.round(optimalRestTime),
      recommendation,
    };
  }

  /**
   * Parse rest time from workout notes (simplified)
   */
  private static parseRestTime(notes: string): number {
    // Look for patterns like "60s rest", "1min rest", "90 seconds"
    const secondsMatch = notes.match(/(\d+)\s*(?:s|sec|seconds?)\s*rest/i);
    if (secondsMatch) {
      return parseInt(secondsMatch[1]);
    }

    const minutesMatch = notes.match(/(\d+)\s*(?:m|min|minutes?)\s*rest/i);
    if (minutesMatch) {
      return parseInt(minutesMatch[1]) * 60;
    }

    return 0;
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
