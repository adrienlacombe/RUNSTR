/**
 * Holistic Health Analytics Service
 * Combines all fitness metrics into overall health scores and body composition analysis
 * All calculations happen locally on-device
 */

import type { LocalWorkout } from '../fitness/LocalWorkoutStorageService';
import type {
  HolisticHealthScore,
  BodyCompositionMetrics,
  HealthProfile,
  CorrelationData,
  CardioPerformanceMetrics,
  StrengthTrainingMetrics,
  WellnessMetrics,
  NutritionMetrics,
  CrossActivityCorrelations,
} from '../../types/analytics';
import { CardioPerformanceAnalytics } from './CardioPerformanceAnalytics';
import { StrengthTrainingAnalytics } from './StrengthTrainingAnalytics';
import { WellnessAnalytics } from './WellnessAnalytics';
import { NutritionAnalytics } from './NutritionAnalytics';

export class HolisticHealthAnalytics {
  /**
   * Calculate holistic health score from all fitness data
   */
  static calculateHolisticScore(
    workouts: LocalWorkout[],
    cardioMetrics?: CardioPerformanceMetrics,
    strengthMetrics?: StrengthTrainingMetrics,
    wellnessMetrics?: WellnessMetrics,
    nutritionMetrics?: NutritionMetrics
  ): HolisticHealthScore {
    // Calculate individual category scores (0-100)
    const cardioScore = this.calculateCardioScore(cardioMetrics);
    const strengthScore = this.calculateStrengthScore(strengthMetrics);
    const wellnessScore = this.calculateWellnessScore(wellnessMetrics);
    const nutritionScore = this.calculateNutritionScore(nutritionMetrics);

    // Calculate balance score (how evenly distributed across categories)
    const balance = this.calculateBalanceScore([
      cardioScore,
      strengthScore,
      wellnessScore,
      nutritionScore,
    ]);

    // Calculate weighted overall score
    const weights = {
      cardio: 0.35,
      strength: 0.25,
      wellness: 0.2,
      nutrition: 0.2,
    };

    const overall = Math.round(
      cardioScore * weights.cardio +
        strengthScore * weights.strength +
        wellnessScore * weights.wellness +
        nutritionScore * weights.nutrition
    );

    // Determine category
    const category = this.determineHealthCategory(overall);

    // Calculate trend (last 30 days vs previous 30 days)
    const trend = this.calculateHealthTrend(workouts);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      cardioScore,
      strengthScore,
      wellnessScore,
      nutritionScore,
      balance
    );

    return {
      overall,
      cardio: cardioScore,
      strength: strengthScore,
      wellness: wellnessScore,
      balance,
      trend,
      category,
      recommendations,
    };
  }

  /**
   * Calculate body composition metrics
   */
  static calculateBodyComposition(
    healthProfile: HealthProfile,
    workouts: LocalWorkout[]
  ): BodyCompositionMetrics | null {
    if (!healthProfile.weight || !healthProfile.height) {
      return null;
    }

    // Calculate BMI
    const heightInMeters = healthProfile.height / 100;
    const currentBMI = healthProfile.weight / (heightInMeters * heightInMeters);

    // Determine BMI category
    let bmiCategory: BodyCompositionMetrics['bmiCategory'];
    if (currentBMI < 18.5) {
      bmiCategory = 'underweight';
    } else if (currentBMI >= 18.5 && currentBMI < 25) {
      bmiCategory = 'normal';
    } else if (currentBMI >= 25 && currentBMI < 30) {
      bmiCategory = 'overweight';
    } else {
      bmiCategory = 'obese';
    }

    // Calculate healthy weight range for this height
    const minHealthyBMI = 18.5;
    const maxHealthyBMI = 24.9;
    const healthyWeightRange = {
      min:
        Math.round(minHealthyBMI * heightInMeters * heightInMeters * 10) / 10,
      max:
        Math.round(maxHealthyBMI * heightInMeters * heightInMeters * 10) / 10,
    };

    // For weight trend, we'd need historical weight data
    // For now, just current weight (could be enhanced with weight tracking workouts)
    const weightTrend = [
      {
        date: healthProfile.updatedAt,
        weight: healthProfile.weight,
      },
    ];

    // Calculate correlation between weight and pace
    const weightVsPaceCorrelation = this.calculateWeightPaceCorrelation(
      workouts,
      healthProfile.weight
    );

    return {
      currentBMI: Math.round(currentBMI * 10) / 10,
      bmiCategory,
      healthyWeightRange,
      weightTrend,
      weightVsPaceCorrelation,
    };
  }

  /**
   * Calculate cross-activity correlations
   */
  static calculateCrossActivityCorrelations(
    workouts: LocalWorkout[]
  ): CrossActivityCorrelations {
    // These correlations are already calculated by individual services
    // This method combines them into a single object

    const cardioMetrics = CardioPerformanceAnalytics.calculateMetrics(workouts);
    const strengthMetrics =
      StrengthTrainingAnalytics.calculateMetrics(workouts);
    const wellnessMetrics = WellnessAnalytics.calculateMetrics(workouts);
    const nutritionMetrics = NutritionAnalytics.calculateMetrics(workouts);

    return {
      meditationVsRecovery: wellnessMetrics?.recoveryCorrelation,
      mealTimingVsAdherence: nutritionMetrics?.dietPerformanceCorrelation,
      strengthVsCardio: this.calculateStrengthCardioCorrelation(
        strengthMetrics,
        cardioMetrics
      ),
      consistencyVsPerformance:
        this.calculateConsistencyPerformanceCorrelation(workouts),
    };
  }

  /**
   * Calculate cardio category score (0-100)
   */
  private static calculateCardioScore(
    metrics?: CardioPerformanceMetrics
  ): number {
    if (!metrics) return 0;

    let score = 50; // Base score

    // Factor 1: Pace improvement (+/- 20 points)
    if (metrics.paceImprovement.trend === 'improving') {
      score += Math.min(20, metrics.paceImprovement.percentChange);
    } else if (metrics.paceImprovement.trend === 'declining') {
      score -= Math.min(20, Math.abs(metrics.paceImprovement.percentChange));
    }

    // Factor 2: Distance progression (+/- 15 points)
    if (metrics.distanceProgression.trend === 'increasing') {
      score += Math.min(15, metrics.distanceProgression.percentChange / 2);
    } else if (metrics.distanceProgression.trend === 'decreasing') {
      score -= Math.min(
        15,
        Math.abs(metrics.distanceProgression.percentChange) / 2
      );
    }

    // Factor 3: Heart rate efficiency (+/- 15 points)
    if (metrics.heartRateEfficiency?.trend === 'improving') {
      score += 15;
    } else if (metrics.heartRateEfficiency?.trend === 'declining') {
      score -= 15;
    }

    // Factor 4: VO2 Max percentile (0-20 points)
    if (metrics.vo2MaxEstimate) {
      score += (metrics.vo2MaxEstimate.percentile / 100) * 20;
    }

    // Factor 5: Recovery risk (-10 if high risk)
    if (metrics.recoveryPatterns.overtrainingRisk === 'high') {
      score -= 10;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate strength category score (0-100)
   */
  private static calculateStrengthScore(
    metrics?: StrengthTrainingMetrics
  ): number {
    if (!metrics) return 0;

    let score = 50; // Base score

    // Factor 1: Volume progression (+/- 25 points)
    if (metrics.volumeProgression.trend === 'increasing') {
      score += Math.min(25, metrics.volumeProgression.percentChange / 2);
    } else if (metrics.volumeProgression.trend === 'decreasing') {
      score -= Math.min(
        25,
        Math.abs(metrics.volumeProgression.percentChange) / 2
      );
    }

    // Factor 2: Exercise balance (0-25 points)
    // Balanced workouts = higher score
    const balanceScore = this.calculateExerciseBalanceScore(
      metrics.exerciseBalance
    );
    score += balanceScore * 0.25;

    // Factor 3: Workout density (+/- 15 points)
    if (metrics.workoutDensity.trend === 'improving') {
      score += 15;
    } else if (metrics.workoutDensity.trend === 'declining') {
      score -= 15;
    }

    // Factor 4: Strength-cardio balance (0-10 points)
    // Ideal is 40-60% strength
    const balancePenalty = Math.abs(metrics.strengthCardioBalance - 0.5) * 20;
    score -= Math.min(10, balancePenalty);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate wellness category score (0-100)
   */
  private static calculateWellnessScore(metrics?: WellnessMetrics): number {
    if (!metrics) return 0;

    let score = 50; // Base score

    // Factor 1: Meditation frequency (0-30 points)
    score += (metrics.meditationConsistency.frequency / 100) * 30;

    // Factor 2: Streak bonus (0-20 points)
    if (metrics.meditationConsistency.streak >= 30) {
      score += 20;
    } else if (metrics.meditationConsistency.streak >= 14) {
      score += 15;
    } else if (metrics.meditationConsistency.streak >= 7) {
      score += 10;
    } else if (metrics.meditationConsistency.streak >= 3) {
      score += 5;
    }

    // Factor 3: Consistency trend (+/- 15 points)
    if (metrics.meditationConsistency.trend === 'improving') {
      score += 15;
    } else if (metrics.meditationConsistency.trend === 'declining') {
      score -= 15;
    }

    // Factor 4: Session duration adequacy (0-15 points)
    // Ideal: 15-30 minutes
    if (
      metrics.sessionDuration.avgDuration >= 900 &&
      metrics.sessionDuration.avgDuration <= 1800
    ) {
      score += 15;
    } else if (metrics.sessionDuration.avgDuration >= 600) {
      score += 10;
    } else if (metrics.sessionDuration.avgDuration >= 300) {
      score += 5;
    }

    // Factor 5: Recovery correlation bonus (0-10 points)
    if (
      metrics.recoveryCorrelation?.strength === 'strong' &&
      metrics.recoveryCorrelation.direction === 'positive'
    ) {
      score += 10;
    } else if (
      metrics.recoveryCorrelation?.strength === 'moderate' &&
      metrics.recoveryCorrelation.direction === 'positive'
    ) {
      score += 5;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate nutrition category score (0-100)
   */
  private static calculateNutritionScore(metrics?: NutritionMetrics): number {
    if (!metrics) return 0;

    let score = 50; // Base score

    // Factor 1: Consistency score (0-30 points)
    score += (metrics.consistencyScore / 100) * 30;

    // Factor 2: Meal timing consistency (0-20 points)
    score += (metrics.mealTimingPatterns.consistency / 100) * 20;

    // Factor 3: Fasting trend bonus (0-15 points)
    if (
      metrics.fastingTrends.avgFastingDuration >= 14 &&
      metrics.fastingTrends.avgFastingDuration <= 18
    ) {
      score += 15; // Ideal fasting window
    } else if (metrics.fastingTrends.avgFastingDuration >= 12) {
      score += 10;
    } else if (metrics.fastingTrends.avgFastingDuration >= 10) {
      score += 5;
    }

    // Factor 4: Meal frequency appropriateness (0-10 points)
    if (
      metrics.mealFrequency.avgMealsPerDay >= 2.5 &&
      metrics.mealFrequency.avgMealsPerDay <= 4
    ) {
      score += 10;
    } else if (metrics.mealFrequency.avgMealsPerDay >= 2) {
      score += 5;
    }

    // Factor 5: Diet-performance correlation (0-15 points)
    if (
      metrics.dietPerformanceCorrelation?.strength === 'strong' &&
      metrics.dietPerformanceCorrelation.direction === 'positive'
    ) {
      score += 15;
    } else if (
      metrics.dietPerformanceCorrelation?.strength === 'moderate' &&
      metrics.dietPerformanceCorrelation.direction === 'positive'
    ) {
      score += 10;
    } else if (
      metrics.dietPerformanceCorrelation?.strength === 'weak' &&
      metrics.dietPerformanceCorrelation.direction === 'positive'
    ) {
      score += 5;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate exercise balance score (0-100)
   */
  private static calculateExerciseBalanceScore(balance: any): number {
    // Ideal balance: all exercises represented reasonably
    const percentages = [
      balance.pushups,
      balance.pullups,
      balance.situps,
      balance.squats,
      balance.planks,
      balance.burpees,
    ];

    // Calculate standard deviation (lower = more balanced)
    const avg =
      percentages.reduce((sum, val) => sum + val, 0) / percentages.length;
    const variance =
      percentages.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      percentages.length;
    const stdDev = Math.sqrt(variance);

    // Convert to score (0 stdDev = 100, 50 stdDev = 0)
    const score = Math.max(0, 100 - stdDev * 2);

    return score;
  }

  /**
   * Calculate balance score across categories
   */
  private static calculateBalanceScore(scores: number[]): number {
    const activeScores = scores.filter((s) => s > 0);

    if (activeScores.length === 0) return 0;

    // Ideal: all 4 categories active and balanced
    const categoryBonus = (activeScores.length / 4) * 30;

    // Calculate variance (lower = more balanced)
    const avg =
      activeScores.reduce((sum, val) => sum + val, 0) / activeScores.length;
    const variance =
      activeScores.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
      activeScores.length;
    const stdDev = Math.sqrt(variance);

    // Convert to score (0 stdDev = 70 points, 50 stdDev = 0 points)
    const varianceScore = Math.max(0, 70 - stdDev * 1.4);

    return Math.round(categoryBonus + varianceScore);
  }

  /**
   * Calculate health trend
   */
  private static calculateHealthTrend(
    workouts: LocalWorkout[]
  ): HolisticHealthScore['trend'] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentWorkouts = workouts.filter(
      (w) => new Date(w.startTime) >= thirtyDaysAgo
    ).length;

    const previousWorkouts = workouts.filter((w) => {
      const date = new Date(w.startTime);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    const change =
      previousWorkouts > 0
        ? ((recentWorkouts - previousWorkouts) / previousWorkouts) * 100
        : 0;

    return change > 10 ? 'improving' : change < -10 ? 'declining' : 'stable';
  }

  /**
   * Determine health category from score
   */
  private static determineHealthCategory(
    score: number
  ): HolisticHealthScore['category'] {
    if (score >= 90) return 'elite';
    if (score >= 75) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    cardioScore: number,
    strengthScore: number,
    wellnessScore: number,
    nutritionScore: number,
    balance: number
  ): string[] {
    const recommendations: string[] = [];

    // Find weakest area
    const scores = [
      { name: 'cardio', score: cardioScore },
      { name: 'strength', score: strengthScore },
      { name: 'wellness', score: wellnessScore },
      { name: 'nutrition', score: nutritionScore },
    ].sort((a, b) => a.score - b.score);

    const weakest = scores[0];
    const strongest = scores[scores.length - 1];

    // Recommend improving weakest area
    if (weakest.score < 50) {
      switch (weakest.name) {
        case 'cardio':
          recommendations.push(
            'Increase cardio workouts to improve cardiovascular health'
          );
          break;
        case 'strength':
          recommendations.push(
            'Add more strength training sessions for balanced fitness'
          );
          break;
        case 'wellness':
          recommendations.push(
            'Start a daily meditation practice for recovery and mental health'
          );
          break;
        case 'nutrition':
          recommendations.push(
            'Track meal timing more consistently for better insights'
          );
          break;
      }
    }

    // Balance recommendation
    if (balance < 50) {
      recommendations.push(
        'Focus on balancing different fitness activities for holistic health'
      );
    }

    // Compliment on strongest area
    if (strongest.score >= 75) {
      switch (strongest.name) {
        case 'cardio':
          recommendations.push(
            'Great cardio performance! Maintain this level of aerobic fitness'
          );
          break;
        case 'strength':
          recommendations.push(
            'Excellent strength training consistency! Keep it up'
          );
          break;
        case 'wellness':
          recommendations.push(
            'Outstanding meditation practice! Your mental health routine is solid'
          );
          break;
        case 'nutrition':
          recommendations.push(
            'Excellent nutrition tracking! Your meal consistency is impressive'
          );
          break;
      }
    }

    // General recommendations based on overall
    const overall =
      (cardioScore + strengthScore + wellnessScore + nutritionScore) / 4;
    if (overall >= 75) {
      recommendations.push(
        "Maintain your current routine - you're in excellent shape!"
      );
    } else if (overall < 40) {
      recommendations.push(
        'Start with small, consistent habits across all fitness areas'
      );
    }

    return recommendations.slice(0, 4); // Max 4 recommendations
  }

  /**
   * Calculate correlation between weight and running pace
   */
  private static calculateWeightPaceCorrelation(
    workouts: LocalWorkout[],
    currentWeight: number
  ): CorrelationData | undefined {
    // For now, return undefined since we don't have historical weight data
    // This could be enhanced if we track weight over time
    return undefined;
  }

  /**
   * Calculate correlation between strength and cardio performance
   */
  private static calculateStrengthCardioCorrelation(
    strengthMetrics?: StrengthTrainingMetrics,
    cardioMetrics?: CardioPerformanceMetrics
  ): CorrelationData | undefined {
    if (!strengthMetrics || !cardioMetrics) return undefined;

    // Simple correlation: if both improving, positive correlation
    const strengthTrend = strengthMetrics.volumeProgression.trend;
    const cardioTrend = cardioMetrics.paceImprovement.trend;

    if (strengthTrend === 'increasing' && cardioTrend === 'improving') {
      return {
        coefficient: 0.6,
        strength: 'moderate',
        direction: 'positive',
        insight: 'Strength training appears to support your cardio performance',
      };
    }

    return undefined;
  }

  /**
   * Calculate correlation between workout consistency and performance
   */
  private static calculateConsistencyPerformanceCorrelation(
    workouts: LocalWorkout[]
  ): CorrelationData | undefined {
    // Group workouts by week
    const now = new Date();
    const weeks: Array<{ workoutCount: number; avgPace: number }> = [];

    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekWorkouts = workouts.filter((w) => {
        const date = new Date(w.startTime);
        return date >= weekStart && date < weekEnd;
      });

      const runningWorkouts = weekWorkouts.filter(
        (w) => w.type === 'running' && w.distance && w.duration > 0
      );

      if (runningWorkouts.length > 0) {
        const avgPace =
          runningWorkouts.reduce((sum, w) => {
            const pace = w.duration / 60 / w.distance!;
            return sum + pace;
          }, 0) / runningWorkouts.length;

        weeks.push({
          workoutCount: weekWorkouts.length,
          avgPace,
        });
      }
    }

    if (weeks.length < 4) return undefined;

    // Simple correlation: more workouts = better pace (lower number)
    const avgWorkoutCount =
      weeks.reduce((sum, w) => sum + w.workoutCount, 0) / weeks.length;
    const avgPace = weeks.reduce((sum, w) => sum + w.avgPace, 0) / weeks.length;

    const highWorkoutWeeks = weeks.filter(
      (w) => w.workoutCount > avgWorkoutCount
    );
    const lowWorkoutWeeks = weeks.filter(
      (w) => w.workoutCount <= avgWorkoutCount
    );

    if (highWorkoutWeeks.length < 2 || lowWorkoutWeeks.length < 2)
      return undefined;

    const highWorkoutPace =
      highWorkoutWeeks.reduce((sum, w) => sum + w.avgPace, 0) /
      highWorkoutWeeks.length;
    const lowWorkoutPace =
      lowWorkoutWeeks.reduce((sum, w) => sum + w.avgPace, 0) /
      lowWorkoutWeeks.length;

    const percentDiff =
      ((lowWorkoutPace - highWorkoutPace) / lowWorkoutPace) * 100;

    if (Math.abs(percentDiff) < 3) {
      return {
        coefficient: 0,
        strength: 'none',
        direction: 'none',
        insight:
          'No clear correlation between workout frequency and performance',
      };
    } else if (percentDiff > 0) {
      return {
        coefficient: 0.7,
        strength: 'strong',
        direction: 'positive',
        insight: 'Higher workout frequency correlates with better performance',
      };
    }

    return undefined;
  }
}
