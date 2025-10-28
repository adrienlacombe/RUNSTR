/**
 * Body Composition Analytics Service
 * Calculates BMI, VO2 Max, Fitness Age, and healthy weight ranges
 * All calculations happen locally using health profile data
 */

import type { LocalWorkout } from '../fitness/LocalWorkoutStorageService';
import type {
  BodyCompositionMetrics,
  VO2MaxData,
  HealthProfile,
} from '../../types/analytics';

export class BodyCompositionAnalytics {
  /**
   * Calculate all body composition metrics
   */
  static calculateMetrics(
    healthProfile: HealthProfile,
    workouts: LocalWorkout[]
  ): BodyCompositionMetrics | null {
    // Require weight and height for BMI
    if (!healthProfile.weight || !healthProfile.height) {
      console.log(
        'ℹ️ No weight/height data - body composition metrics unavailable'
      );
      return null;
    }

    const bmi = this.calculateBMI(
      healthProfile.weight,
      healthProfile.height
    );
    const healthyWeightRange = this.getHealthyWeightRange(
      healthProfile.height
    );

    // VO2 Max requires cardio workouts
    const vo2MaxData = this.estimateVO2Max(workouts, healthProfile);

    return {
      currentBMI: bmi.value,
      bmiCategory: bmi.category,
      healthyWeightRange,
      weightTrend: [], // TODO: Implement weight tracking over time
    };
  }

  /**
   * Calculate BMI (Body Mass Index)
   * Formula: weight (kg) / height (m)²
   */
  static calculateBMI(
    weightKg: number,
    heightCm: number
  ): {
    value: number;
    category: 'underweight' | 'normal' | 'overweight' | 'obese';
  } {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    let category: 'underweight' | 'normal' | 'overweight' | 'obese';
    if (bmi < 18.5) category = 'underweight';
    else if (bmi < 25) category = 'normal';
    else if (bmi < 30) category = 'overweight';
    else category = 'obese';

    return {
      value: Math.round(bmi * 10) / 10,
      category,
    };
  }

  /**
   * Calculate healthy weight range for given height
   * Based on BMI range of 18.5-24.9 (normal)
   */
  static getHealthyWeightRange(heightCm: number): { min: number; max: number } {
    const heightM = heightCm / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;

    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
    };
  }

  /**
   * Estimate VO2 Max from running workouts
   * Uses Cooper 12-minute test method for estimation
   */
  static estimateVO2Max(
    workouts: LocalWorkout[],
    healthProfile: HealthProfile
  ): VO2MaxData | undefined {
    // Filter for running workouts with distance
    const runningWorkouts = workouts.filter(
      (w) =>
        (w.type === 'running' || w.type === 'walking') &&
        w.distance &&
        w.distance > 0 &&
        w.duration > 0
    );

    if (runningWorkouts.length === 0) {
      return undefined;
    }

    // Find best 5K time (4.9km - 5.1km range)
    const fiveKWorkouts = runningWorkouts.filter(
      (w) => w.distance && w.distance >= 4900 && w.distance <= 5100
    );

    if (fiveKWorkouts.length === 0) {
      // No 5K workouts, try to estimate from average pace
      return this.estimateVO2MaxFromAveragePace(
        runningWorkouts,
        healthProfile
      );
    }

    // Get fastest 5K
    const fastest5K = fiveKWorkouts.reduce((fastest, current) => {
      const currentPace = current.duration / (current.distance! / 1000);
      const fastestPace = fastest.duration / (fastest.distance! / 1000);
      return currentPace < fastestPace ? current : fastest;
    });

    // Calculate VO2 Max using Cooper formula
    // Convert to 12-minute equivalent distance
    const duration5KMinutes = fastest5K.duration / 60;
    const distance12Min = (fastest5K.distance! / duration5KMinutes) * 12;

    // Cooper formula: VO2max = (distance in meters - 504.9) / 44.73
    let vo2Max = (distance12Min - 504.9) / 44.73;

    // Age adjustment (optional, if age is available)
    if (healthProfile.age) {
      const ageFactor = 1 - (healthProfile.age - 25) * 0.01; // -1% per year after 25
      vo2Max = vo2Max * Math.max(0.8, Math.min(1.2, ageFactor)); // Cap adjustment
    }

    // Calculate percentile and fitness age
    const percentile = this.calculateVO2MaxPercentile(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );
    const fitnessAge = this.calculateFitnessAge(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );
    const category = this.categorizeVO2Max(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );

    return {
      estimate: Math.round(vo2Max * 10) / 10,
      percentile: Math.round(percentile),
      fitnessAge: Math.round(fitnessAge),
      category,
    };
  }

  /**
   * Estimate VO2 Max from average running pace (when no 5K data available)
   */
  private static estimateVO2MaxFromAveragePace(
    runningWorkouts: LocalWorkout[],
    healthProfile: HealthProfile
  ): VO2MaxData | undefined {
    if (runningWorkouts.length === 0) return undefined;

    // Calculate average pace (seconds per km)
    const totalDistance = runningWorkouts.reduce(
      (sum, w) => sum + (w.distance || 0),
      0
    );
    const totalTime = runningWorkouts.reduce((sum, w) => sum + w.duration, 0);

    if (totalDistance === 0) return undefined;

    const avgPaceSecondsPerKm = totalTime / (totalDistance / 1000);

    // Rough estimation: Convert average pace to VO2 Max
    // Faster pace = higher VO2 Max
    // Average pace 5:00/km ≈ VO2 Max 40-45
    // Average pace 6:00/km ≈ VO2 Max 35-40
    const baseVO2 = 80 - avgPaceSecondsPerKm / 10; // Very rough approximation

    // Age adjustment
    let vo2Max = baseVO2;
    if (healthProfile.age) {
      const ageFactor = 1 - (healthProfile.age - 25) * 0.01;
      vo2Max = vo2Max * Math.max(0.8, Math.min(1.2, ageFactor));
    }

    const percentile = this.calculateVO2MaxPercentile(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );
    const fitnessAge = this.calculateFitnessAge(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );
    const category = this.categorizeVO2Max(
      vo2Max,
      healthProfile.age || 30,
      healthProfile.biologicalSex
    );

    return {
      estimate: Math.round(vo2Max * 10) / 10,
      percentile: Math.round(percentile),
      fitnessAge: Math.round(fitnessAge),
      category,
    };
  }

  /**
   * Calculate VO2 Max percentile (age and gender adjusted)
   */
  private static calculateVO2MaxPercentile(
    vo2Max: number,
    age: number,
    sex?: 'male' | 'female'
  ): number {
    // Average VO2 Max by age and gender
    const avgVO2Max = sex === 'female' ? 35 : 42;

    // Adjust for age
    const ageAdjustedAvg = avgVO2Max * (1 - (age - 25) * 0.01);

    // Calculate deviation from average
    const deviation = vo2Max - ageAdjustedAvg;

    // Convert to percentile (simplified)
    // Each 1 unit deviation ≈ 5 percentile points
    const percentile = 50 + deviation * 5;

    return Math.max(0, Math.min(100, percentile));
  }

  /**
   * Calculate fitness age from VO2 Max
   * Higher VO2 Max = younger fitness age
   */
  static calculateFitnessAge(
    vo2Max: number,
    chronologicalAge: number,
    sex?: 'male' | 'female'
  ): number {
    // Average VO2 Max at age 25 (peak fitness)
    const avgVO2MaxAt25 = sex === 'female' ? 40 : 48;

    // Average decline per year
    const declinePerYear = sex === 'female' ? 0.4 : 0.5;

    // Calculate years difference from age 25 based on VO2 Max
    const yearsDiff = (avgVO2MaxAt25 - vo2Max) / declinePerYear;

    // Fitness age = 25 + years difference
    const fitnessAge = 25 + yearsDiff;

    // Cap fitness age to reasonable range (18-80)
    return Math.max(18, Math.min(80, fitnessAge));
  }

  /**
   * Categorize VO2 Max level
   */
  private static categorizeVO2Max(
    vo2Max: number,
    age: number,
    sex?: 'male' | 'female'
  ): VO2MaxData['category'] {
    // Categories based on age and gender
    // Simplified thresholds
    if (sex === 'female') {
      if (age < 30) {
        if (vo2Max >= 45) return 'superior';
        if (vo2Max >= 39) return 'excellent';
        if (vo2Max >= 33) return 'good';
        if (vo2Max >= 28) return 'fair';
        return 'poor';
      } else if (age < 50) {
        if (vo2Max >= 42) return 'superior';
        if (vo2Max >= 36) return 'excellent';
        if (vo2Max >= 30) return 'good';
        if (vo2Max >= 25) return 'fair';
        return 'poor';
      } else {
        if (vo2Max >= 38) return 'superior';
        if (vo2Max >= 32) return 'excellent';
        if (vo2Max >= 26) return 'good';
        if (vo2Max >= 22) return 'fair';
        return 'poor';
      }
    } else {
      // Male
      if (age < 30) {
        if (vo2Max >= 52) return 'superior';
        if (vo2Max >= 46) return 'excellent';
        if (vo2Max >= 40) return 'good';
        if (vo2Max >= 35) return 'fair';
        return 'poor';
      } else if (age < 50) {
        if (vo2Max >= 48) return 'superior';
        if (vo2Max >= 42) return 'excellent';
        if (vo2Max >= 36) return 'good';
        if (vo2Max >= 31) return 'fair';
        return 'poor';
      } else {
        if (vo2Max >= 44) return 'superior';
        if (vo2Max >= 38) return 'excellent';
        if (vo2Max >= 32) return 'good';
        if (vo2Max >= 27) return 'fair';
        return 'poor';
      }
    }
  }
}
