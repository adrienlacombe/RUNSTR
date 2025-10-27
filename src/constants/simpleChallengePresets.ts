/**
 * Simple Challenge Presets
 * 4 challenge types for trust-based 1v1 competitions
 * No payment processing - winner displays wager amount with zap button
 */

export type SimpleChallengeType =
  | 'pushups'
  | 'distance'
  | 'carnivore'
  | 'meditation';

export interface SimpleChallengePreset {
  id: SimpleChallengeType;
  name: string;
  metric: string;
  unit: string;
  description: string;
  activityFilter: string | string[]; // For kind 1301 queries
}

export const SIMPLE_CHALLENGE_TYPES: SimpleChallengePreset[] = [
  {
    id: 'pushups',
    name: 'Push-ups',
    metric: 'reps',
    unit: 'reps',
    description: 'Total push-up reps',
    activityFilter: 'strength',
  },
  {
    id: 'distance',
    name: 'Distance',
    metric: 'distance',
    unit: 'km',
    description: 'Total running/walking distance',
    activityFilter: ['running', 'walking'],
  },
  {
    id: 'carnivore',
    name: 'Carnivore',
    metric: 'days',
    unit: 'days',
    description: 'Carnivore days completed',
    activityFilter: 'diet',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    metric: 'duration',
    unit: 'minutes',
    description: 'Total meditation time',
    activityFilter: 'meditation',
  },
];

export interface DurationOption {
  value: 1 | 7 | 30;
  label: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { value: 1, label: '1 Day' },
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
];

/**
 * Get challenge preset by ID
 */
export function getChallengePreset(
  id: SimpleChallengeType
): SimpleChallengePreset | undefined {
  return SIMPLE_CHALLENGE_TYPES.find((preset) => preset.id === id);
}

/**
 * Get display name for challenge type
 */
export function getChallengeName(type: SimpleChallengeType): string {
  const preset = getChallengePreset(type);
  return preset?.name || type;
}

/**
 * Get metric unit for challenge type
 */
export function getChallengeUnit(type: SimpleChallengeType): string {
  const preset = getChallengePreset(type);
  return preset?.unit || '';
}
