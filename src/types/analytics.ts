/**
 * Analytics Types
 * TypeScript definitions for advanced analytics data structures
 */

import type { LocalWorkout } from '../services/fitness/LocalWorkoutStorageService';

// ============================================================================
// Health Profile
// ============================================================================

export interface HealthProfile {
  weight?: number; // kg
  height?: number; // cm
  age?: number; // years
  biologicalSex?: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Cardio Performance Analytics
// ============================================================================

export interface CardioPerformanceMetrics {
  paceImprovement: PaceTrend;
  distanceProgression: DistanceTrend;
  heartRateEfficiency: HeartRateTrend;
  vo2MaxEstimate?: VO2MaxData;
  personalRecords: PersonalRecords;
  recoveryPatterns: RecoveryPattern;
}

export interface PaceTrend {
  currentAvgPace: number; // seconds per km
  previousAvgPace: number; // seconds per km (30 days ago)
  percentChange: number; // positive = faster
  trend: 'improving' | 'stable' | 'declining';
  weeklyPaces: Array<{ week: string; avgPace: number }>;
}

export interface DistanceTrend {
  currentWeeklyAvg: number; // km
  previousWeeklyAvg: number; // km (4 weeks ago)
  percentChange: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  monthlyTotals: Array<{ month: string; totalKm: number }>;
}

export interface HeartRateTrend {
  currentAvgHR: number; // BPM
  previousAvgHR: number; // BPM (30 days ago)
  percentChange: number; // negative = better efficiency
  trend: 'improving' | 'stable' | 'declining';
  avgHRByPace: Array<{ pace: number; avgHR: number }>;
}

export interface VO2MaxData {
  estimate: number; // ml/kg/min
  percentile: number; // age/gender adjusted
  fitnessAge: number; // estimated cardiovascular age
  category: 'poor' | 'fair' | 'good' | 'excellent' | 'superior';
}

export interface PersonalRecords {
  fiveK?: { time: number; date: string; pace: number };
  tenK?: { time: number; date: string; pace: number };
  halfMarathon?: { time: number; date: string; pace: number };
  marathon?: { time: number; date: string; pace: number };
  longestRun?: { distance: number; date: string };
}

export interface RecoveryPattern {
  avgTimeBetweenWorkouts: number; // hours
  optimalRecoveryTime: number; // hours
  overtrainingRisk: 'low' | 'moderate' | 'high';
}

// ============================================================================
// Strength Training Analytics
// ============================================================================

export interface StrengthTrainingMetrics {
  volumeProgression: VolumeProgression;
  exerciseBalance: ExerciseBalance;
  workoutDensity: WorkoutDensity;
  strengthCardioBalance: number; // 0-1 (0 = all cardio, 1 = all strength)
  restTimeOptimization: RestTimeData;
}

export interface VolumeProgression {
  currentMonthlyVolume: number; // total reps
  previousMonthlyVolume: number; // total reps
  percentChange: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  weeklyVolumes: Array<{ week: string; totalReps: number }>;
}

export interface ExerciseBalance {
  pushups: number; // percentage of total
  pullups: number;
  situps: number;
  squats: number;
  planks: number;
  burpees: number;
  recommendations: string[]; // e.g., "Increase pullups for balance"
}

export interface WorkoutDensity {
  avgRepsPerMinute: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface RestTimeData {
  avgRestTime: number; // seconds
  optimalRestTime: number; // seconds (based on performance)
  recommendation: string;
}

// ============================================================================
// Wellness Analytics
// ============================================================================

export interface WellnessMetrics {
  meditationConsistency: ConsistencyData;
  sessionDuration: SessionDurationData;
  typePreferences: MeditationTypePreferences;
  timeOfDayPatterns: TimeOfDayPattern[];
  recoveryCorrelation?: CorrelationData;
}

export interface ConsistencyData {
  currentMonth: number; // number of sessions
  frequency: number; // percentage of days (0-100)
  streak: number; // current streak in days
  longestStreak: number; // all-time longest streak
  trend: 'improving' | 'stable' | 'declining';
}

export interface SessionDurationData {
  avgDuration: number; // seconds
  trend: 'increasing' | 'stable' | 'decreasing';
  weeklyAvgs: Array<{ week: string; avgDuration: number }>;
}

export interface MeditationTypePreferences {
  guided: number; // percentage
  unguided: number;
  breathwork: number;
  bodyScan: number;
  lovingKindness: number;
  favorite: string;
}

export interface TimeOfDayPattern {
  timeRange: string; // e.g., "6am-9am"
  count: number;
  avgDuration: number;
}

// ============================================================================
// Nutrition Analytics
// ============================================================================

export interface NutritionMetrics {
  mealTimingPatterns: MealTimingData;
  fastingTrends: FastingData;
  mealFrequency: MealFrequencyData;
  dietPerformanceCorrelation?: CorrelationData;
  consistencyScore: number; // 0-100
}

export interface MealTimingData {
  avgBreakfastTime: string; // HH:mm
  avgLunchTime: string;
  avgDinnerTime: string;
  consistency: number; // 0-100 (how consistent meal times are)
  patterns: Array<{ meal: string; timeRange: string; count: number }>;
}

export interface FastingData {
  avgFastingDuration: number; // hours
  mostCommonPattern: string; // e.g., "16:8"
  trend: 'increasing' | 'stable' | 'decreasing';
  weeklyAvgs: Array<{ week: string; avgHours: number }>;
}

export interface MealFrequencyData {
  avgMealsPerDay: number;
  pattern: string; // e.g., "3 meals + 1 snack"
  trend: 'increasing' | 'stable' | 'decreasing';
}

// ============================================================================
// Correlation Analytics
// ============================================================================

export interface CorrelationData {
  coefficient: number; // -1 to 1
  strength: 'none' | 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative' | 'none';
  insight: string; // Human-readable explanation
}

export interface CrossActivityCorrelations {
  fastingVsPace?: CorrelationData;
  meditationVsRecovery?: CorrelationData;
  strengthVsCardio?: CorrelationData;
  consistencyVsPerformance?: CorrelationData;
  mealTimingVsAdherence?: CorrelationData;
}

// ============================================================================
// Holistic Health Score
// ============================================================================

export interface HolisticHealthScore {
  overall: number; // 0-100
  cardio: number; // 0-100
  strength: number; // 0-100
  wellness: number; // 0-100
  balance: number; // 0-100 (how balanced across categories)
  trend: 'improving' | 'stable' | 'declining';
  category: 'poor' | 'fair' | 'good' | 'excellent' | 'elite';
  recommendations: string[];
}

export interface BodyCompositionMetrics {
  currentBMI: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  healthyWeightRange: { min: number; max: number }; // kg
  weightTrend: Array<{ date: string; weight: number }>;
  weightVsPaceCorrelation?: CorrelationData;
}

// ============================================================================
// Analytics Summary (All Data Combined)
// ============================================================================

export interface AnalyticsSummary {
  cardio?: CardioPerformanceMetrics;
  strength?: StrengthTrainingMetrics;
  wellness?: WellnessMetrics;
  nutrition?: NutritionMetrics;
  correlations?: CrossActivityCorrelations;
  holisticScore?: HolisticHealthScore;
  bodyComposition?: BodyCompositionMetrics;
  lastUpdated: string;
}

// ============================================================================
// Helper Types for Calculations
// ============================================================================

export interface WorkoutDataPoint {
  date: string;
  type: string;
  distance?: number;
  duration: number;
  calories?: number;
  pace?: number;
  heartRate?: { avg: number; max: number };
  sets?: number;
  reps?: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface TrendCalculation {
  current: number;
  previous: number;
  change: number;
  percentChange: number;
  trend: 'increasing' | 'stable' | 'decreasing' | 'improving' | 'declining';
}
