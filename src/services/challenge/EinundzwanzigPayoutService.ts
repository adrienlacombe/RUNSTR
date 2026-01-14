/**
 * EinundzwanzigPayoutService - Automatic end-of-event charity payments
 *
 * When the Einundzwanzig Fitness Challenge ends (Feb 21, 2026):
 * - Each charity receives 1,000 sats per km tagged to them
 * - Maximum total payout: 3,000,000 sats (scaled proportionally if exceeded)
 * - Payments made via NWCGatewayService
 *
 * Payment Flow:
 * 1. Check if event has ended and payouts not yet processed
 * 2. Get charity leaderboard with distance totals
 * 3. Calculate payout per charity (km * 1000 sats)
 * 4. Apply 3M cap if needed (scale proportionally)
 * 5. Request invoices via LNURL and pay with NWCGatewayService
 * 6. Record results for admin visibility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EinundzwanzigService } from './EinundzwanzigService';
import { NWCGatewayService } from '../rewards/NWCGatewayService';
import { getInvoiceFromLightningAddress } from '../../utils/lnurl';
import { getCharityById } from '../../constants/charities';
import {
  EINUNDZWANZIG_CONFIG,
  EINUNDZWANZIG_PAYOUT_KEY,
  EINUNDZWANZIG_PAYOUT_RESULTS_KEY,
  EINUNDZWANZIG_MAX_PAYOUT_SATS,
  getEinundzwanzigStatus,
} from '../../constants/einundzwanzig';

// ============================================================================
// Types
// ============================================================================

export interface CharityPayout {
  charityId: string;
  charityName: string;
  lightningAddress: string;
  totalDistanceKm: number;
  amount: number;
  success: boolean;
  error?: string;
  preimage?: string;
}

export interface PayoutResults {
  processedAt: string;
  charityPayouts: CharityPayout[];
  totalDistanceKm: number;
  totalSatsRequested: number;
  totalSatsPaid: number;
  wasScaled: boolean;
  scaleFactor?: number;
  totalSuccess: boolean;
  errors: string[];
}

// ============================================================================
// Service
// ============================================================================

class EinundzwanzigPayoutServiceClass {
  private isProcessing = false;

  /**
   * Check if payouts have already been processed
   */
  async hasPayoutsBeenProcessed(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(EINUNDZWANZIG_PAYOUT_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('[EinundzwanzigPayout] Error checking payout status:', error);
      return false;
    }
  }

  /**
   * Get stored payout results
   */
  async getPayoutResults(): Promise<PayoutResults | null> {
    try {
      const results = await AsyncStorage.getItem(EINUNDZWANZIG_PAYOUT_RESULTS_KEY);
      return results ? JSON.parse(results) : null;
    } catch (error) {
      console.error('[EinundzwanzigPayout] Error getting payout results:', error);
      return null;
    }
  }

  /**
   * Main payout execution - called when event ends
   * Returns early if event hasn't ended or payouts already processed
   */
  async executePayouts(): Promise<PayoutResults | null> {
    // Prevent concurrent execution
    if (this.isProcessing) {
      console.log('[EinundzwanzigPayout] Payout already in progress, skipping...');
      return null;
    }

    // Check if event has ended
    const status = getEinundzwanzigStatus();
    if (status !== 'ended') {
      console.log(`[EinundzwanzigPayout] Event status is '${status}', not 'ended'. Skipping payouts.`);
      return null;
    }

    // Check if already processed
    const alreadyProcessed = await this.hasPayoutsBeenProcessed();
    if (alreadyProcessed) {
      console.log('[EinundzwanzigPayout] Payouts already processed. Returning stored results.');
      return this.getPayoutResults();
    }

    this.isProcessing = true;
    console.log('[EinundzwanzigPayout] Starting Einundzwanzig payout execution...');

    const results: PayoutResults = {
      processedAt: new Date().toISOString(),
      charityPayouts: [],
      totalDistanceKm: 0,
      totalSatsRequested: 0,
      totalSatsPaid: 0,
      wasScaled: false,
      totalSuccess: false,
      errors: [],
    };

    try {
      // ========================================
      // 1. Get charity leaderboard
      // ========================================
      console.log('[EinundzwanzigPayout] Step 1: Getting charity leaderboard...');

      const leaderboard = await EinundzwanzigService.getLeaderboard();
      const charityTeams = leaderboard.charityTeams;

      if (charityTeams.length === 0) {
        results.errors.push('No charities found in leaderboard');
        console.error('[EinundzwanzigPayout] No charities found!');
        await this.recordPayoutResults(results);
        return results;
      }

      results.totalDistanceKm = leaderboard.totalDistanceKm;
      console.log(`[EinundzwanzigPayout] Found ${charityTeams.length} charities, total ${results.totalDistanceKm.toFixed(2)} km`);

      // ========================================
      // 2. Calculate payouts and check cap
      // ========================================
      console.log('[EinundzwanzigPayout] Step 2: Calculating payouts...');

      // Calculate raw amounts (1000 sats per km)
      const rawPayouts = charityTeams.map((team) => ({
        charityId: team.charityId,
        charityName: team.charityName,
        lightningAddress: team.lightningAddress,
        totalDistanceKm: team.totalDistanceKm,
        amount: Math.floor(team.totalDistanceKm * EINUNDZWANZIG_CONFIG.satsPerKm),
      }));

      const totalSatsRequested = rawPayouts.reduce((sum, p) => sum + p.amount, 0);
      results.totalSatsRequested = totalSatsRequested;

      // Apply cap if needed
      let scaleFactor = 1;
      if (totalSatsRequested > EINUNDZWANZIG_MAX_PAYOUT_SATS) {
        scaleFactor = EINUNDZWANZIG_MAX_PAYOUT_SATS / totalSatsRequested;
        results.wasScaled = true;
        results.scaleFactor = scaleFactor;
        console.log(`[EinundzwanzigPayout] Total ${totalSatsRequested} sats exceeds ${EINUNDZWANZIG_MAX_PAYOUT_SATS} cap. Scale factor: ${scaleFactor.toFixed(4)}`);
      }

      // ========================================
      // 3. Execute payments
      // ========================================
      console.log('[EinundzwanzigPayout] Step 3: Executing payments...');

      for (const payout of rawPayouts) {
        // Skip charities with 0 distance
        if (payout.amount === 0) {
          console.log(`[EinundzwanzigPayout] Skipping ${payout.charityName} (0 km)`);
          continue;
        }

        // Apply scale factor if needed
        const finalAmount = Math.floor(payout.amount * scaleFactor);

        // Get lightning address from constants (fallback to leaderboard)
        const charity = getCharityById(payout.charityId);
        const lightningAddress = charity?.lightningAddress || payout.lightningAddress;

        if (!lightningAddress) {
          console.warn(`[EinundzwanzigPayout] ${payout.charityName} has no lightning address`);
          results.errors.push(`${payout.charityName} has no lightning address`);
          results.charityPayouts.push({
            charityId: payout.charityId,
            charityName: payout.charityName,
            lightningAddress: '',
            totalDistanceKm: payout.totalDistanceKm,
            amount: finalAmount,
            success: false,
            error: 'No lightning address configured',
          });
          continue;
        }

        console.log(`[EinundzwanzigPayout] Paying ${payout.charityName}: ${finalAmount} sats (${payout.totalDistanceKm.toFixed(1)} km)`);

        // Send payment
        const paymentResult = await this.sendPayment(
          lightningAddress,
          finalAmount,
          `Einundzwanzig Fitness Challenge - ${payout.totalDistanceKm.toFixed(1)} km donated by RUNSTR community!`
        );

        results.charityPayouts.push({
          charityId: payout.charityId,
          charityName: payout.charityName,
          lightningAddress,
          totalDistanceKm: payout.totalDistanceKm,
          amount: finalAmount,
          success: paymentResult.success,
          error: paymentResult.error,
          preimage: paymentResult.preimage,
        });

        if (paymentResult.success) {
          results.totalSatsPaid += finalAmount;
          console.log(`[EinundzwanzigPayout] ✅ ${payout.charityName} paid: ${finalAmount} sats`);
        } else {
          results.errors.push(`${payout.charityName} payment failed: ${paymentResult.error}`);
          console.error(`[EinundzwanzigPayout] ❌ ${payout.charityName} failed: ${paymentResult.error}`);
        }
      }

      // ========================================
      // 4. Determine overall success
      // ========================================
      const successCount = results.charityPayouts.filter((p) => p.success).length;
      const totalCount = results.charityPayouts.length;
      results.totalSuccess = successCount === totalCount && totalCount > 0;

      console.log('[EinundzwanzigPayout] Payout execution complete:', {
        successCount,
        totalCount,
        totalSatsPaid: results.totalSatsPaid,
        wasScaled: results.wasScaled,
        totalSuccess: results.totalSuccess,
        errorCount: results.errors.length,
      });

      // ========================================
      // 5. Record results
      // ========================================
      await this.recordPayoutResults(results);

      return results;
    } catch (error) {
      console.error('[EinundzwanzigPayout] Critical error during payout execution:', error);
      results.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await this.recordPayoutResults(results);
      return results;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send payment to lightning address
   * Returns success status and optional preimage or error
   */
  private async sendPayment(
    lightningAddress: string,
    amountSats: number,
    description: string
  ): Promise<{ success: boolean; preimage?: string; error?: string }> {
    try {
      console.log(`[EinundzwanzigPayout] Requesting invoice from ${lightningAddress} for ${amountSats} sats...`);

      // Step 1: Request invoice from lightning address via LNURL
      const { invoice } = await getInvoiceFromLightningAddress(
        lightningAddress,
        amountSats,
        description
      );

      if (!invoice) {
        return { success: false, error: 'Failed to get invoice from lightning address' };
      }

      console.log(`[EinundzwanzigPayout] Invoice received, sending payment...`);

      // Step 2: Pay invoice using NWCGatewayService
      const paymentResult = await NWCGatewayService.payInvoice(invoice);

      if (paymentResult.success) {
        console.log(`[EinundzwanzigPayout] Payment successful!`);
        return { success: true, preimage: paymentResult.preimage };
      } else {
        console.error(`[EinundzwanzigPayout] Payment failed:`, paymentResult.error);
        return { success: false, error: paymentResult.error };
      }
    } catch (error) {
      console.error(`[EinundzwanzigPayout] Payment error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }

  /**
   * Record payout results to AsyncStorage
   * Marks payouts as completed even if some failed (to prevent re-runs)
   */
  private async recordPayoutResults(results: PayoutResults): Promise<void> {
    try {
      // Store detailed results
      await AsyncStorage.setItem(
        EINUNDZWANZIG_PAYOUT_RESULTS_KEY,
        JSON.stringify(results)
      );

      // Mark as completed
      await AsyncStorage.setItem(EINUNDZWANZIG_PAYOUT_KEY, 'true');

      console.log('[EinundzwanzigPayout] Results recorded to AsyncStorage');
    } catch (error) {
      console.error('[EinundzwanzigPayout] Error recording results:', error);
    }
  }
}

// Export singleton instance
export const EinundzwanzigPayoutService = new EinundzwanzigPayoutServiceClass();
