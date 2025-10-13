/**
 * Rewards Configuration
 * Settings for automated daily workout rewards
 */

export const REWARD_CONFIG = {
  /**
   * Sender NWC Connection String
   * This is the wallet that sends automated rewards to users
   * Replace with your actual NWC string
   */
  SENDER_NWC: process.env.REWARD_SENDER_NWC || 'nostr+walletconnect://YOUR_NWC_STRING_HERE',

  /**
   * Daily Workout Reward Amount
   * Amount in satoshis sent for first workout of the day
   */
  DAILY_WORKOUT_REWARD: 50,

  /**
   * Maximum Rewards Per Day
   * How many times a user can earn rewards in one day
   */
  MAX_REWARDS_PER_DAY: 1,

  /**
   * Reward Eligibility
   * Minimum workout duration to qualify for reward (in seconds)
   */
  MIN_WORKOUT_DURATION: 60, // 1 minute minimum

  /**
   * Retry Configuration
   * If reward payment fails, how many times to retry
   */
  MAX_RETRY_ATTEMPTS: 0, // 0 = no retries (silent failure)
  RETRY_DELAY_MS: 0,
} as const;

/**
 * Storage keys for reward tracking
 */
export const REWARD_STORAGE_KEYS = {
  LAST_REWARD_DATE: '@runstr:last_reward_date',
  REWARD_COUNT_TODAY: '@runstr:reward_count_today',
  TOTAL_REWARDS_EARNED: '@runstr:total_rewards_earned',
} as const;
