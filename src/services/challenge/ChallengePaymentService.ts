/**
 * ChallengePaymentService
 * Handles Bitcoin payments for 1v1 challenges using Lightning addresses + LNURL
 * Replaces ChallengeEscrowService with non-custodial direct payment approach
 *
 * Payment Flow:
 * 1. Creator provides Lightning address when creating challenge
 * 2. Accepter provides Lightning address when accepting challenge
 * 3. Accepter pays creator's Lightning address (wager amount)
 * 4. Creator pays accepter's Lightning address (wager amount)
 * 5. Challenge becomes active after both confirm payment
 * 6. Winner determined from workout data
 * 7. Loser pays winner's Lightning address (2x wager amount)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInvoiceFromLightningAddress } from '../../utils/lnurl';

export interface ChallengePaymentRecord {
  challengeId: string;
  wagerAmount: number;
  creatorPubkey: string;
  accepterPubkey: string;
  creatorLightningAddress?: string;
  accepterLightningAddress?: string;
  creatorPaymentIntent: boolean; // Creator clicked "I Paid"
  accepterPaymentIntent: boolean; // Accepter clicked "I Paid"
  creatorPaymentProof?: string; // Invoice paid by creator
  accepterPaymentProof?: string; // Invoice paid by accepter
  status: 'awaiting_accepter_address' | 'awaiting_accepter_payment' | 'awaiting_creator_payment' | 'both_paid' | 'completed' | 'cancelled';
  winnerId?: string;
  payoutInvoice?: string; // Invoice for winner payout
  payoutConfirmed: boolean; // Loser clicked "I Paid" for payout
  createdAt: number;
  expiresAt?: number; // Payment window expiry
}

export interface InvoiceGenerationResult {
  success: boolean;
  invoice?: string;
  error?: string;
}

export interface PaymentConfirmationResult {
  success: boolean;
  message: string;
}

export class ChallengePaymentService {
  private static instance: ChallengePaymentService;
  private readonly STORAGE_KEY_PREFIX = '@runstr:challenge_payment_v2:';
  private readonly PAYMENT_TIMEOUT_HOURS = 72; // 72 hours to complete payment

  private constructor() {}

  static getInstance(): ChallengePaymentService {
    if (!ChallengePaymentService.instance) {
      ChallengePaymentService.instance = new ChallengePaymentService();
    }
    return ChallengePaymentService.instance;
  }

  /**
   * Initialize payment record for new challenge
   * Creator provides their Lightning address at creation
   */
  async initializePaymentRecord(
    challengeId: string,
    wagerAmount: number,
    creatorPubkey: string,
    creatorLightningAddress: string,
    accepterPubkey: string
  ): Promise<ChallengePaymentRecord> {
    const now = Date.now();
    const expiresAt = now + (this.PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000);

    const record: ChallengePaymentRecord = {
      challengeId,
      wagerAmount,
      creatorPubkey,
      accepterPubkey,
      creatorLightningAddress,
      creatorPaymentIntent: false,
      accepterPaymentIntent: false,
      status: 'awaiting_accepter_address',
      payoutConfirmed: false,
      createdAt: now,
      expiresAt,
    };

    await this.savePaymentRecord(record);
    console.log(`💰 Initialized payment record for challenge: ${challengeId}`);
    return record;
  }

  /**
   * Add accepter's Lightning address after they accept challenge
   */
  async setAccepterLightningAddress(
    challengeId: string,
    accepterLightningAddress: string
  ): Promise<boolean> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      record.accepterLightningAddress = accepterLightningAddress;
      record.status = 'awaiting_accepter_payment';

      await this.savePaymentRecord(record);
      console.log(`✅ Accepter Lightning address added: ${accepterLightningAddress}`);
      return true;
    } catch (error) {
      console.error('Failed to set accepter Lightning address:', error);
      return false;
    }
  }

  /**
   * Generate Lightning invoice for wager payment
   * Uses LNURL protocol to request invoice from recipient's Lightning address
   *
   * @param lightningAddress - Recipient's Lightning address
   * @param wagerAmount - Amount in satoshis
   * @param challengeId - Challenge identifier for description
   * @param role - Who is receiving the payment (creator or accepter)
   */
  async generateWagerInvoice(
    lightningAddress: string,
    wagerAmount: number,
    challengeId: string,
    role: 'creator' | 'accepter'
  ): Promise<InvoiceGenerationResult> {
    try {
      console.log(`⚡ Generating ${wagerAmount} sats invoice from ${lightningAddress}...`);

      const result = await getInvoiceFromLightningAddress(
        lightningAddress,
        wagerAmount,
        `Challenge wager: ${challengeId.slice(0, 16)}`
      );

      console.log(`✅ Invoice generated successfully`);

      return {
        success: true,
        invoice: result.invoice,
      };
    } catch (error) {
      console.error('Failed to generate wager invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record payment intent (user clicked "I Paid")
   * Note: This is honor system - no automatic verification
   */
  async recordPaymentIntent(
    challengeId: string,
    userPubkey: string,
    role: 'creator' | 'accepter',
    invoice: string
  ): Promise<PaymentConfirmationResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      if (role === 'creator') {
        record.creatorPaymentIntent = true;
        record.creatorPaymentProof = invoice;
      } else {
        record.accepterPaymentIntent = true;
        record.accepterPaymentProof = invoice;
      }

      // Update status
      if (record.creatorPaymentIntent && record.accepterPaymentIntent) {
        record.status = 'both_paid';
      } else if (role === 'accepter') {
        record.status = 'awaiting_creator_payment';
      }

      await this.savePaymentRecord(record);
      console.log(`✅ Payment intent recorded for ${role}`);

      return {
        success: true,
        message: record.status === 'both_paid'
          ? 'Challenge is now active! Both participants confirmed payment.'
          : 'Payment confirmed. Waiting for other participant.',
      };
    } catch (error) {
      console.error('Failed to record payment intent:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if both participants confirmed payment
   */
  async checkBothPaid(challengeId: string): Promise<boolean> {
    const record = await this.getPaymentRecord(challengeId);
    if (!record) return false;

    return record.creatorPaymentIntent && record.accepterPaymentIntent;
  }

  /**
   * Generate payout invoice for winner (2x wager amount)
   * Called after challenge completes
   */
  async generatePayoutInvoice(
    challengeId: string,
    winnerLightningAddress: string,
    winnerId: string
  ): Promise<InvoiceGenerationResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      const payoutAmount = record.wagerAmount * 2;

      console.log(`💸 Generating payout invoice for ${payoutAmount} sats...`);

      const result = await getInvoiceFromLightningAddress(
        winnerLightningAddress,
        payoutAmount,
        `Challenge winnings: ${challengeId.slice(0, 16)}`
      );

      // Store payout invoice
      record.payoutInvoice = result.invoice;
      record.winnerId = winnerId;
      await this.savePaymentRecord(record);

      console.log(`✅ Payout invoice generated`);

      return {
        success: true,
        invoice: result.invoice,
      };
    } catch (error) {
      console.error('Failed to generate payout invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record payout confirmation (loser clicked "I Paid")
   */
  async recordPayoutConfirmation(challengeId: string): Promise<PaymentConfirmationResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      record.payoutConfirmed = true;
      record.status = 'completed';
      await this.savePaymentRecord(record);

      console.log(`✅ Payout confirmed for challenge: ${challengeId}`);

      return {
        success: true,
        message: 'Payout confirmed! Challenge complete.',
      };
    } catch (error) {
      console.error('Failed to record payout confirmation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel challenge and clean up payment record
   */
  async cancelChallenge(challengeId: string): Promise<boolean> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        return false;
      }

      record.status = 'cancelled';
      await this.savePaymentRecord(record);
      console.log(`❌ Challenge cancelled: ${challengeId}`);
      return true;
    } catch (error) {
      console.error('Failed to cancel challenge:', error);
      return false;
    }
  }

  /**
   * Get payment status for challenge
   */
  async getPaymentStatus(challengeId: string): Promise<ChallengePaymentRecord | null> {
    return this.getPaymentRecord(challengeId);
  }

  /**
   * Storage helpers
   */
  private async savePaymentRecord(record: ChallengePaymentRecord): Promise<void> {
    const key = `${this.STORAGE_KEY_PREFIX}${record.challengeId}`;
    await AsyncStorage.setItem(key, JSON.stringify(record));
  }

  private async getPaymentRecord(challengeId: string): Promise<ChallengePaymentRecord | null> {
    try {
      const key = `${this.STORAGE_KEY_PREFIX}${challengeId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get payment record:', error);
      return null;
    }
  }

  /**
   * Get all payment records (for debugging)
   */
  async getAllPaymentRecords(): Promise<ChallengePaymentRecord[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter((key) => key.startsWith(this.STORAGE_KEY_PREFIX));

      const records = await Promise.all(
        paymentKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        })
      );

      return records.filter((r) => r !== null);
    } catch (error) {
      console.error('Failed to get all payment records:', error);
      return [];
    }
  }

  /**
   * Clean up old payment records (>30 days)
   */
  async cleanupOldRecords(): Promise<void> {
    try {
      const records = await this.getAllPaymentRecords();
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      let cleaned = 0;
      for (const record of records) {
        if (now - record.createdAt > thirtyDaysMs && record.status === 'completed') {
          const key = `${this.STORAGE_KEY_PREFIX}${record.challengeId}`;
          await AsyncStorage.removeItem(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} old payment records`);
      }
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }
}

export const challengePaymentService = ChallengePaymentService.getInstance();
