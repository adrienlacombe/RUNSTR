/**
 * RewardNotificationManager - Imperative API for reward notifications
 * Allows DailyRewardService to trigger the RewardEarnedModal without React context
 *
 * Usage:
 *   // From any service:
 *   RewardNotificationManager.showRewardEarned(21);
 */

export interface DonationSplit {
  userAmount: number;
  charityAmount: number;
  charityName?: string;
  // Note: Team donations disabled until teams have lightning addresses configured
}

export interface RewardNotificationState {
  visible: boolean;
  amount: number;
  donationSplit?: DonationSplit;
}

type NotificationCallback = (state: RewardNotificationState) => void;

class RewardNotificationManagerClass {
  private callback: NotificationCallback | null = null;

  /**
   * Register a callback from the RewardNotificationProvider
   * Called automatically when the provider mounts
   */
  register(callback: NotificationCallback): void {
    this.callback = callback;
  }

  /**
   * Unregister the callback when provider unmounts
   */
  unregister(): void {
    this.callback = null;
  }

  /**
   * Show the reward earned notification
   * Can be called from anywhere (services, components, etc.)
   *
   * @param amount - Amount of sats earned
   * @param donationSplit - Optional donation breakdown (user, team, charity)
   */
  showRewardEarned(amount: number, donationSplit?: DonationSplit): void {
    if (this.callback) {
      this.callback({ visible: true, amount, donationSplit });
    } else {
      console.warn('[RewardNotification] Provider not registered - notification not shown');
    }
  }

  /**
   * Hide the notification
   * Usually called by the modal's onClose
   */
  hide(): void {
    if (this.callback) {
      this.callback({ visible: false, amount: 0 });
    }
  }
}

// Export singleton instance
export const RewardNotificationManager = new RewardNotificationManagerClass();
export default RewardNotificationManager;
