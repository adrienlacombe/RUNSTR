/**
 * ChallengeEscrowService
 * Handles all Bitcoin payment logic for 1v1 challenges
 * Two-payment escrow: Creator pays → Accepter pays → Winner receives 2x amount
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChallengePaymentRecord {
  challengeId: string;
  wagerAmount: number;
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
  status: 'awaiting_creator' | 'awaiting_accepter' | 'fully_funded' | 'completed' | 'refunded';
  winnerId?: string;
  payoutHash?: string;
  payoutAt?: number;
  createdAt: number;
  expiresAt?: number; // Payment window expiry (72 hours)
}

export interface InvoiceGenerationResult {
  success: boolean;
  invoice?: string;
  paymentHash?: string;
  error?: string;
}

export interface PaymentConfirmationResult {
  success: boolean;
  settled: boolean;
  error?: string;
}

export interface PayoutResult {
  success: boolean;
  payoutHash?: string;
  error?: string;
}

export class ChallengeEscrowService {
  private static instance: ChallengeEscrowService;
  private readonly STORAGE_KEY_PREFIX = '@runstr:challenge_payment:';
  private readonly PAYMENT_TIMEOUT_HOURS = 72; // 72 hours to complete payment
  private readonly POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

  private constructor() {}

  static getInstance(): ChallengeEscrowService {
    if (!ChallengeEscrowService.instance) {
      ChallengeEscrowService.instance = new ChallengeEscrowService();
    }
    return ChallengeEscrowService.instance;
  }

  /**
   * Initialize payment record for new challenge
   */
  async initializePaymentRecord(
    challengeId: string,
    wagerAmount: number,
    creatorPubkey: string,
    accepterPubkey: string
  ): Promise<ChallengePaymentRecord> {
    const now = Date.now();
    const expiresAt = now + (this.PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000);

    const record: ChallengePaymentRecord = {
      challengeId,
      wagerAmount,
      creatorPubkey,
      accepterPubkey,
      creatorPayment: {
        paid: false,
      },
      accepterPayment: {
        paid: false,
      },
      status: 'awaiting_creator',
      createdAt: now,
      expiresAt,
    };

    await this.savePaymentRecord(record);
    console.log(`💰 Initialized payment record for challenge: ${challengeId}`);
    return record;
  }

  /**
   * Generate Lightning invoice for challenge payment
   * Uses Alby MCP tools
   */
  async generateChallengeInvoice(
    challengeId: string,
    wagerAmount: number,
    userPubkey: string,
    role: 'creator' | 'accepter'
  ): Promise<InvoiceGenerationResult> {
    try {
      console.log(`⚡ Generating ${wagerAmount} sats invoice for ${role}...`);

      // Use Alby MCP to generate invoice
      const result = await global.mcp__alby__make_invoice({
        amount_in_sats: wagerAmount,
        description: `Challenge wager: ${challengeId.slice(0, 16)}`,
        metadata: {
          challengeId,
          userPubkey,
          role,
          type: 'challenge_escrow',
        },
      });

      if (!result || !result.payment_request) {
        throw new Error('Failed to generate invoice from Alby');
      }

      const invoice = result.payment_request;
      const paymentHash = result.payment_hash;

      console.log(`✅ Invoice generated: ${paymentHash}`);

      return {
        success: true,
        invoice,
        paymentHash,
      };
    } catch (error) {
      console.error('Failed to generate challenge invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if invoice has been paid
   * Uses Alby MCP lookup_invoice
   */
  async checkInvoicePayment(paymentHash: string): Promise<PaymentConfirmationResult> {
    try {
      const result = await global.mcp__alby__lookup_invoice({
        payment_hash: paymentHash,
      });

      if (!result) {
        throw new Error('Failed to lookup invoice');
      }

      return {
        success: true,
        settled: result.settled === true,
      };
    } catch (error) {
      console.error('Failed to check invoice payment:', error);
      return {
        success: false,
        settled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Poll for payment confirmation
   * Returns true when payment is confirmed, false on timeout
   */
  async pollForPayment(
    paymentHash: string,
    timeoutMinutes: number = 10
  ): Promise<boolean> {
    const startTime = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    console.log(`⏳ Polling for payment: ${paymentHash}`);

    while (Date.now() - startTime < timeoutMs) {
      const result = await this.checkInvoicePayment(paymentHash);

      if (result.success && result.settled) {
        console.log(`✅ Payment confirmed: ${paymentHash}`);
        return true;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, this.POLL_INTERVAL_MS));
    }

    console.log(`⏱️ Payment timeout: ${paymentHash}`);
    return false;
  }

  /**
   * Record successful payment
   */
  async recordPayment(
    challengeId: string,
    userPubkey: string,
    paymentHash: string,
    invoice: string
  ): Promise<boolean> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      const now = Date.now();

      // Update appropriate payment record
      if (userPubkey === record.creatorPubkey) {
        record.creatorPayment = {
          paid: true,
          paymentHash,
          invoice,
          paidAt: now,
        };
        record.status = 'awaiting_accepter';
      } else if (userPubkey === record.accepterPubkey) {
        record.accepterPayment = {
          paid: true,
          paymentHash,
          invoice,
          paidAt: now,
        };

        // Check if both paid
        if (record.creatorPayment.paid) {
          record.status = 'fully_funded';
        }
      } else {
        throw new Error('User not part of this challenge');
      }

      await this.savePaymentRecord(record);
      console.log(`💰 Recorded payment for ${userPubkey.slice(0, 8)}`);

      return true;
    } catch (error) {
      console.error('Failed to record payment:', error);
      return false;
    }
  }

  /**
   * Check if both participants have paid
   */
  async checkBothPaid(challengeId: string): Promise<boolean> {
    const record = await this.getPaymentRecord(challengeId);
    if (!record) return false;

    return record.creatorPayment.paid && record.accepterPayment.paid;
  }

  /**
   * Get payment status for challenge
   */
  async getPaymentStatus(challengeId: string): Promise<ChallengePaymentRecord | null> {
    return this.getPaymentRecord(challengeId);
  }

  /**
   * Execute winner payout
   * Sends 2x wager amount to winner
   */
  async payoutWinner(
    challengeId: string,
    winnerPubkey: string,
    winnerLightningAddress?: string
  ): Promise<PayoutResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      if (record.status !== 'fully_funded') {
        throw new Error('Challenge not fully funded');
      }

      if (!record.creatorPayment.paid || !record.accepterPayment.paid) {
        throw new Error('Both payments not confirmed');
      }

      const payoutAmount = record.wagerAmount * 2;

      console.log(`💸 Paying out ${payoutAmount} sats to winner...`);

      // If Lightning address provided, request invoice from it
      // Otherwise, we need the winner to provide an invoice (future enhancement)
      if (winnerLightningAddress) {
        // Request invoice from Lightning address
        const invoiceResult = await global.mcp__alby__request_invoice({
          lightning_address: winnerLightningAddress,
          amount_in_sats: payoutAmount,
          description: `Challenge winnings: ${challengeId.slice(0, 16)}`,
        });

        if (!invoiceResult || !invoiceResult.invoice) {
          throw new Error('Failed to request invoice from winner');
        }

        // Pay the invoice
        const paymentResult = await global.mcp__alby__pay_invoice({
          invoice: invoiceResult.invoice,
        });

        if (!paymentResult || !paymentResult.payment_hash) {
          throw new Error('Failed to send payment');
        }

        // Update record
        record.status = 'completed';
        record.winnerId = winnerPubkey;
        record.payoutHash = paymentResult.payment_hash;
        record.payoutAt = Date.now();

        await this.savePaymentRecord(record);

        console.log(`✅ Payout successful: ${paymentResult.payment_hash}`);

        return {
          success: true,
          payoutHash: paymentResult.payment_hash,
        };
      } else {
        // For now, mark as completed but payout pending
        // Future: Could store and wait for winner to provide invoice
        record.status = 'completed';
        record.winnerId = winnerPubkey;
        record.payoutAt = Date.now();
        await this.savePaymentRecord(record);

        return {
          success: false,
          error: 'Winner Lightning address required for automatic payout',
        };
      }
    } catch (error) {
      console.error('Failed to payout winner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund creator if accepter never pays
   * Only works within 72 hour window
   */
  async refundCreator(challengeId: string): Promise<PayoutResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      if (!record.creatorPayment.paid) {
        throw new Error('Creator never paid');
      }

      if (record.accepterPayment.paid) {
        throw new Error('Accepter already paid - cannot refund');
      }

      // Check if payment window expired
      const now = Date.now();
      if (record.expiresAt && now < record.expiresAt) {
        throw new Error('Payment window not expired yet');
      }

      console.log(`💸 Refunding ${record.wagerAmount} sats to creator...`);

      // Note: Alby doesn't have a refund method, so we need to pay an invoice
      // This requires the creator's Lightning address
      // For MVP, we'll just mark as refunded and handle manually

      record.status = 'refunded';
      await this.savePaymentRecord(record);

      console.log(`✅ Challenge marked for refund: ${challengeId}`);

      return {
        success: true,
        error: 'Manual refund required - contact support with challenge ID',
      };
    } catch (error) {
      console.error('Failed to refund creator:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle tie scenario - split pot 50/50
   */
  async handleTie(
    challengeId: string,
    participant1Pubkey: string,
    participant2Pubkey: string,
    participant1LightningAddress?: string,
    participant2LightningAddress?: string
  ): Promise<PayoutResult> {
    try {
      const record = await this.getPaymentRecord(challengeId);
      if (!record) {
        throw new Error('Payment record not found');
      }

      if (record.status !== 'fully_funded') {
        throw new Error('Challenge not fully funded');
      }

      const splitAmount = record.wagerAmount; // Each gets their money back

      console.log(`🤝 Tie detected - refunding ${splitAmount} sats to each participant`);

      // For MVP, mark as completed with tie
      // Manual payouts required until we have Lightning addresses
      record.status = 'completed';
      record.winnerId = 'tie';
      record.payoutAt = Date.now();
      await this.savePaymentRecord(record);

      return {
        success: true,
        error: 'Tie - manual split payout required',
      };
    } catch (error) {
      console.error('Failed to handle tie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
   * Get all payment records (for admin/debugging)
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

export const challengeEscrowService = ChallengeEscrowService.getInstance();
