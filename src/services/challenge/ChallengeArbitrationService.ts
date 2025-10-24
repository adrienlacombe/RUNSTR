/**
 * ChallengeArbitrationService
 * Manages team captain-based arbitration for 1v1 challenges
 * Handles dual payment tracking, automatic payouts, and manual fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ArbitrationRecord {
  challengeId: string;
  arbitratorTeamId: string;
  arbitratorCaptainPubkey: string;
  arbitratorLightningAddress: string;
  wagerAmount: number; // Per participant (half of total pot)
  creatorPubkey: string;
  accepterPubkey: string;
  creatorPayment: {
    paid: boolean;
    paymentHash?: string;
    invoice?: string;
    paidAt?: number;
  };
  accepterPayment: {
    paid: boolean;
    paymentHash?: string;
    invoice?: string;
    paidAt?: number;
  };
  status: 'awaiting_payments' | 'fully_funded' | 'completed' | 'failed';
  winnerPubkey?: string;
  payoutStatus?: 'pending' | 'auto_completed' | 'manual_required' | 'completed';
  payoutHash?: string;
  payoutAmount?: number;
  arbitrationFee?: number;
  arbitrationFeePercent: number; // Default 5%
  completedAt?: number;
  payoutFailureReason?: string;
  createdAt: number;
}

export interface ArbitrationStats {
  totalEarned: number;
  activeChallenges: number;
  completedChallenges: number;
  pendingManual: number;
}

export class ChallengeArbitrationService {
  private static instance: ChallengeArbitrationService;
  private readonly STORAGE_KEY_PREFIX = '@runstr:challenge_arbitration:';
  private readonly STORAGE_KEY_CAPTAIN_INDEX =
    '@runstr:captain_arbitration_index:';

  private constructor() {}

  static getInstance(): ChallengeArbitrationService {
    if (!ChallengeArbitrationService.instance) {
      ChallengeArbitrationService.instance = new ChallengeArbitrationService();
    }
    return ChallengeArbitrationService.instance;
  }

  /**
   * Initialize arbitration record when challenge is created
   */
  async initializeArbitration(
    challengeId: string,
    wagerAmount: number,
    creatorPubkey: string,
    accepterPubkey: string,
    arbitratorTeamId: string,
    arbitratorCaptainPubkey: string,
    arbitratorLightningAddress: string,
    arbitrationFeePercent: number = 5
  ): Promise<ArbitrationRecord> {
    const now = Date.now();

    const record: ArbitrationRecord = {
      challengeId,
      arbitratorTeamId,
      arbitratorCaptainPubkey,
      arbitratorLightningAddress,
      wagerAmount,
      creatorPubkey,
      accepterPubkey,
      creatorPayment: {
        paid: false,
      },
      accepterPayment: {
        paid: false,
      },
      status: 'awaiting_payments',
      arbitrationFeePercent,
      createdAt: now,
    };

    await this.saveArbitrationRecord(record);
    await this.addToCaptainIndex(arbitratorCaptainPubkey, challengeId);

    console.log(`💰 Initialized arbitration for challenge: ${challengeId}`);
    console.log(`   Arbitrator: ${arbitratorCaptainPubkey.slice(0, 16)}...`);
    console.log(`   Wager: ${wagerAmount} sats per participant`);
    console.log(`   Fee: ${arbitrationFeePercent}%`);

    return record;
  }

  /**
   * Record payment from participant (creator or accepter)
   */
  async recordParticipantPayment(
    challengeId: string,
    participantPubkey: string,
    paymentProof: string
  ): Promise<boolean> {
    try {
      const record = await this.getArbitrationRecord(challengeId);
      if (!record) {
        throw new Error('Arbitration record not found');
      }

      const now = Date.now();
      const isCreator = participantPubkey === record.creatorPubkey;
      const isAccepter = participantPubkey === record.accepterPubkey;

      if (!isCreator && !isAccepter) {
        throw new Error('Participant not part of this challenge');
      }

      // Update payment record
      if (isCreator) {
        record.creatorPayment = {
          paid: true,
          invoice: paymentProof,
          paidAt: now,
        };
        console.log(`✅ Creator payment recorded: ${challengeId}`);
      } else {
        record.accepterPayment = {
          paid: true,
          invoice: paymentProof,
          paidAt: now,
        };
        console.log(`✅ Accepter payment recorded: ${challengeId}`);
      }

      // Check if both paid → update status to fully_funded
      if (record.creatorPayment.paid && record.accepterPayment.paid) {
        record.status = 'fully_funded';
        console.log(`💰 Challenge fully funded: ${challengeId}`);
      }

      await this.saveArbitrationRecord(record);
      return true;
    } catch (error) {
      console.error('Failed to record participant payment:', error);
      return false;
    }
  }

  /**
   * Check if both participants have paid
   */
  async checkFullyFunded(challengeId: string): Promise<boolean> {
    const record = await this.getArbitrationRecord(challengeId);
    if (!record) return false;

    return (
      record.creatorPayment.paid &&
      record.accepterPayment.paid &&
      record.status === 'fully_funded'
    );
  }

  /**
   * Update arbitration record with winner and payout details
   */
  async updateArbitration(
    challengeId: string,
    updates: Partial<ArbitrationRecord>
  ): Promise<void> {
    const record = await this.getArbitrationRecord(challengeId);
    if (!record) {
      throw new Error('Arbitration record not found');
    }

    Object.assign(record, updates);
    await this.saveArbitrationRecord(record);

    console.log(`📝 Updated arbitration: ${challengeId}`, updates);
  }

  /**
   * Mark arbitration as completed with auto-payout
   */
  async markAutoPayoutComplete(
    challengeId: string,
    winnerPubkey: string,
    payoutHash: string,
    winnerPayout: number,
    arbitrationFee: number
  ): Promise<void> {
    await this.updateArbitration(challengeId, {
      status: 'completed',
      winnerPubkey,
      payoutStatus: 'auto_completed',
      payoutHash,
      payoutAmount: winnerPayout,
      arbitrationFee,
      completedAt: Date.now(),
    });

    console.log(`✅ Auto-payout complete: ${challengeId}`);
    console.log(`   Winner: ${winnerPubkey.slice(0, 16)}...`);
    console.log(`   Payout: ${winnerPayout} sats`);
    console.log(`   Fee: ${arbitrationFee} sats`);
  }

  /**
   * Mark arbitration as requiring manual payout
   */
  async markManualRequired(
    challengeId: string,
    winnerPubkey: string,
    winnerPayout: number,
    arbitrationFee: number,
    reason: string
  ): Promise<void> {
    await this.updateArbitration(challengeId, {
      status: 'completed',
      winnerPubkey,
      payoutStatus: 'manual_required',
      payoutAmount: winnerPayout,
      arbitrationFee,
      payoutFailureReason: reason,
      completedAt: Date.now(),
    });

    console.log(`⚠️ Manual payout required: ${challengeId}`);
    console.log(`   Reason: ${reason}`);
  }

  /**
   * Mark manual payout as completed
   */
  async markManualPayoutComplete(challengeId: string): Promise<void> {
    await this.updateArbitration(challengeId, {
      payoutStatus: 'completed',
    });

    console.log(`✅ Manual payout marked complete: ${challengeId}`);
  }

  /**
   * Get arbitration status for a challenge
   */
  async getArbitrationStatus(
    challengeId: string
  ): Promise<ArbitrationRecord | null> {
    return this.getArbitrationRecord(challengeId);
  }

  /**
   * Get all arbitrations for a specific captain
   */
  async getCaptainArbitrations(
    captainPubkey: string
  ): Promise<ArbitrationRecord[]> {
    try {
      const indexKey = `${this.STORAGE_KEY_CAPTAIN_INDEX}${captainPubkey}`;
      const indexData = await AsyncStorage.getItem(indexKey);

      if (!indexData) {
        return [];
      }

      const challengeIds: string[] = JSON.parse(indexData);

      const records = await Promise.all(
        challengeIds.map((id) => this.getArbitrationRecord(id))
      );

      return records.filter((r): r is ArbitrationRecord => r !== null);
    } catch (error) {
      console.error('Failed to get captain arbitrations:', error);
      return [];
    }
  }

  /**
   * Get arbitration statistics for captain
   */
  async getCaptainStats(captainPubkey: string): Promise<ArbitrationStats> {
    const arbitrations = await this.getCaptainArbitrations(captainPubkey);

    const stats: ArbitrationStats = {
      totalEarned: 0,
      activeChallenges: 0,
      completedChallenges: 0,
      pendingManual: 0,
    };

    for (const arb of arbitrations) {
      if (arb.status === 'completed') {
        stats.completedChallenges++;
        if (arb.arbitrationFee) {
          stats.totalEarned += arb.arbitrationFee;
        }
      } else if (arb.status === 'fully_funded') {
        stats.activeChallenges++;
      }

      if (arb.payoutStatus === 'manual_required') {
        stats.pendingManual++;
      }
    }

    return stats;
  }

  /**
   * Storage helpers
   */
  private async saveArbitrationRecord(
    record: ArbitrationRecord
  ): Promise<void> {
    const key = `${this.STORAGE_KEY_PREFIX}${record.challengeId}`;
    await AsyncStorage.setItem(key, JSON.stringify(record));
  }

  private async getArbitrationRecord(
    challengeId: string
  ): Promise<ArbitrationRecord | null> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${challengeId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get arbitration record:', error);
      return null;
    }
  }

  private async addToCaptainIndex(
    captainPubkey: string,
    challengeId: string
  ): Promise<void> {
    try {
      const indexKey = `${this.STORAGE_KEY_CAPTAIN_INDEX}${captainPubkey}`;
      const indexData = await AsyncStorage.getItem(indexKey);

      let challengeIds: string[] = [];
      if (indexData) {
        challengeIds = JSON.parse(indexData);
      }

      if (!challengeIds.includes(challengeId)) {
        challengeIds.push(challengeId);
        await AsyncStorage.setItem(indexKey, JSON.stringify(challengeIds));
      }
    } catch (error) {
      console.error('Failed to add to captain index:', error);
    }
  }

  /**
   * Clean up old completed arbitrations (>30 days)
   */
  async cleanupOldRecords(captainPubkey: string): Promise<void> {
    try {
      const arbitrations = await this.getCaptainArbitrations(captainPubkey);
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      let cleaned = 0;
      for (const arb of arbitrations) {
        if (
          arb.status === 'completed' &&
          arb.completedAt &&
          now - arb.completedAt > thirtyDaysMs
        ) {
          const key = `${this.STORAGE_KEY_PREFIX}${arb.challengeId}`;
          await AsyncStorage.removeItem(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} old arbitration records`);
      }
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }
}

export const challengeArbitrationService =
  ChallengeArbitrationService.getInstance();
