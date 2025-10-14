/**
 * ChallengeCompletionService
 * Handles challenge expiration, winner determination, and automatic payouts
 * Monitors active challenges and executes completion flow
 */

import { challengeService } from '../competition/ChallengeService';
import { challengeEscrowService } from './ChallengeEscrowService';
import type { ChallengeMetadata } from '../../types/challenge';
import type { LeaderboardEntry } from '../competition/ChallengeService';

export interface CompletionResult {
  success: boolean;
  winnerId?: string;
  isTie?: boolean;
  payoutExecuted?: boolean;
  error?: string;
}

export class ChallengeCompletionService {
  private static instance: ChallengeCompletionService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

  private constructor() {}

  static getInstance(): ChallengeCompletionService {
    if (!ChallengeCompletionService.instance) {
      ChallengeCompletionService.instance = new ChallengeCompletionService();
    }
    return ChallengeCompletionService.instance;
  }

  /**
   * Start monitoring active challenges for expiration
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('⚠️ Challenge monitoring already running');
      return;
    }

    console.log('🔍 Starting challenge completion monitoring...');

    // Check immediately on start
    this.checkExpiredChallenges();

    // Then check every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.checkExpiredChallenges();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Stopped challenge completion monitoring');
    }
  }

  /**
   * Check all active challenges for expiration
   */
  private async checkExpiredChallenges(): Promise<void> {
    try {
      // Get all payment records that are fully funded but not completed
      const allPayments = await challengeEscrowService.getAllPaymentRecords();
      const activeChallenges = allPayments.filter(
        (p) => p.status === 'fully_funded'
      );

      if (activeChallenges.length === 0) {
        console.log('✅ No active challenges to check');
        return;
      }

      console.log(`🔍 Checking ${activeChallenges.length} active challenges...`);

      const now = Date.now();
      for (const payment of activeChallenges) {
        try {
          // Get challenge metadata
          const challenge = await challengeService.getChallenge(payment.challengeId);
          if (!challenge) {
            console.log(`⚠️ Challenge not found: ${payment.challengeId}`);
            continue;
          }

          // Check if expired
          const expiresAt = challenge.expiresAt * 1000; // Convert to milliseconds
          if (now >= expiresAt) {
            console.log(`⏰ Challenge expired: ${payment.challengeId}`);
            await this.completeChallenge(payment.challengeId);
          }
        } catch (error) {
          console.error(`Error checking challenge ${payment.challengeId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking expired challenges:', error);
    }
  }

  /**
   * Complete a challenge - determine winner and execute payout
   */
  async completeChallenge(challengeId: string): Promise<CompletionResult> {
    try {
      console.log(`🏁 Completing challenge: ${challengeId}`);

      // Get challenge metadata
      const challenge = await challengeService.getChallenge(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      // Get payment status
      const payment = await challengeEscrowService.getPaymentStatus(challengeId);
      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status !== 'fully_funded') {
        throw new Error('Challenge not fully funded');
      }

      // Determine winner from leaderboard
      const winner = await this.determineWinner(challengeId);

      if (!winner) {
        console.log('⚠️ No workouts found - refunding both participants');
        // TODO: Handle refund for no workouts
        return {
          success: true,
          error: 'No workouts found - manual refund required',
        };
      }

      if (winner === 'tie') {
        console.log('🤝 Tie detected - splitting pot');
        // Handle tie
        await challengeEscrowService.handleTie(
          challengeId,
          payment.creatorPubkey,
          payment.accepterPubkey
        );

        return {
          success: true,
          isTie: true,
        };
      }

      // We have a winner - execute payout
      console.log(`🏆 Winner: ${winner.slice(0, 8)}...`);

      // For now, we need Lightning address to auto-payout
      // TODO: Get winner's Lightning address from profile
      const payoutResult = await challengeEscrowService.payoutWinner(
        challengeId,
        winner
        // winnerLightningAddress // TODO: Pass when available
      );

      if (payoutResult.success) {
        console.log(`✅ Payout executed: ${payoutResult.payoutHash}`);
      } else {
        console.log(`⚠️ Payout pending: ${payoutResult.error}`);
      }

      // TODO: Send notifications to both participants (kind 1102)

      return {
        success: true,
        winnerId: winner,
        payoutExecuted: payoutResult.success,
        error: payoutResult.error,
      };
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Determine winner from leaderboard
   * Returns pubkey of winner, 'tie', or null if no workouts
   */
  private async determineWinner(challengeId: string): Promise<string | 'tie' | null> {
    try {
      // Get leaderboard
      const leaderboard = await challengeService.getChallengeLeaderboard(challengeId);

      if (!leaderboard || leaderboard.length === 0) {
        console.log('No workouts found for challenge');
        return null;
      }

      if (leaderboard.length === 1) {
        // Only one participant posted workouts
        return leaderboard[0].pubkey;
      }

      // Check for tie
      const firstPlace = leaderboard[0];
      const secondPlace = leaderboard[1];

      if (this.scoresAreEqual(firstPlace, secondPlace)) {
        console.log('Scores are tied');
        return 'tie';
      }

      // Clear winner
      return firstPlace.pubkey;
    } catch (error) {
      console.error('Failed to determine winner:', error);
      return null;
    }
  }

  /**
   * Check if two leaderboard entries have equal scores
   */
  private scoresAreEqual(entry1: LeaderboardEntry, entry2: LeaderboardEntry): boolean {
    // Compare based on progress percentage
    return Math.abs(entry1.progress - entry2.progress) < 0.01; // Within 0.01% is considered tie
  }

  /**
   * Manually trigger completion for a specific challenge
   * Useful for testing or admin purposes
   */
  async manuallyCompleteChallenge(challengeId: string): Promise<CompletionResult> {
    console.log(`🔧 Manually completing challenge: ${challengeId}`);
    return this.completeChallenge(challengeId);
  }

  /**
   * Get all challenges that are ready for completion
   * (expired and fully funded)
   */
  async getExpiredChallenges(): Promise<string[]> {
    try {
      const allPayments = await challengeEscrowService.getAllPaymentRecords();
      const activeChallenges = allPayments.filter(
        (p) => p.status === 'fully_funded'
      );

      const expiredIds: string[] = [];
      const now = Date.now();

      for (const payment of activeChallenges) {
        try {
          const challenge = await challengeService.getChallenge(payment.challengeId);
          if (challenge) {
            const expiresAt = challenge.expiresAt * 1000;
            if (now >= expiresAt) {
              expiredIds.push(payment.challengeId);
            }
          }
        } catch (error) {
          console.error(`Error checking challenge ${payment.challengeId}:`, error);
        }
      }

      return expiredIds;
    } catch (error) {
      console.error('Failed to get expired challenges:', error);
      return [];
    }
  }

  /**
   * Handle payment timeout refunds
   * Refund creator if accepter never pays within 72 hours
   */
  async checkPaymentTimeouts(): Promise<void> {
    try {
      const allPayments = await challengeEscrowService.getAllPaymentRecords();
      const pendingPayments = allPayments.filter(
        (p) => p.status === 'awaiting_accepter'
      );

      const now = Date.now();

      for (const payment of pendingPayments) {
        if (payment.expiresAt && now >= payment.expiresAt) {
          console.log(`⏰ Payment timeout for challenge: ${payment.challengeId}`);
          await challengeEscrowService.refundCreator(payment.challengeId);
        }
      }
    } catch (error) {
      console.error('Failed to check payment timeouts:', error);
    }
  }
}

export const challengeCompletionService = ChallengeCompletionService.getInstance();
