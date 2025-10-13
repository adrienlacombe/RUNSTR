/**
 * CharityZapService - Handle zapping team charities
 * Generates Lightning invoices and processes payments to charity Lightning addresses
 */

import { Alert } from 'react-native';
import { getCharityById } from '../../constants/charities';
import { NWCWalletService } from '../wallet/NWCWalletService';
import { NWCStorageService } from '../wallet/NWCStorageService';

export interface CharityZapResult {
  success: boolean;
  amount?: number;
  error?: string;
}

class CharityZapServiceClass {
  /**
   * Prompt user for zap amount and send to charity
   */
  async zapCharity(
    charityId: string,
    charityName: string
  ): Promise<CharityZapResult> {
    try {
      // Check if user has wallet configured
      const hasWallet = await NWCStorageService.hasNWC();
      if (!hasWallet) {
        Alert.alert(
          'Wallet Required',
          'Please connect your wallet to send zaps.',
          [{ text: 'OK' }]
        );
        return { success: false, error: 'No wallet configured' };
      }

      // Get charity info
      const charity = getCharityById(charityId);
      if (!charity) {
        return { success: false, error: 'Charity not found' };
      }

      // Show amount input modal (using Alert.prompt for simplicity)
      return new Promise((resolve) => {
        Alert.prompt(
          `⚡ Zap ${charityName}`,
          'Enter amount in sats',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({ success: false, error: 'Cancelled' }),
            },
            {
              text: 'Send',
              onPress: async (amountStr) => {
                const result = await this.sendZapToCharity(
                  charity.lightningAddress,
                  charityName,
                  amountStr || '0'
                );
                resolve(result);
              },
            },
          ],
          'plain-text',
          '',
          'numeric'
        );
      });
    } catch (error) {
      console.error('[CharityZap] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send zap to charity Lightning address
   */
  private async sendZapToCharity(
    lightningAddress: string,
    charityName: string,
    amountStr: string
  ): Promise<CharityZapResult> {
    try {
      const amount = parseInt(amountStr);

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount in sats.');
        return { success: false, error: 'Invalid amount' };
      }

      // Request invoice from Lightning address
      const invoice = await this.requestInvoiceFromLightningAddress(
        lightningAddress,
        amount,
        `Donation to ${charityName} via RUNSTR`
      );

      if (!invoice) {
        Alert.alert('Error', 'Failed to generate invoice from charity.');
        return { success: false, error: 'Invoice generation failed' };
      }

      // Pay invoice using NWC
      const paymentResult = await NWCWalletService.sendPayment(invoice);

      if (paymentResult.success) {
        Alert.alert(
          '⚡ Zap Sent!',
          `${amount} sats sent to ${charityName}`,
          [{ text: 'OK' }]
        );
        return { success: true, amount };
      } else {
        Alert.alert(
          'Payment Failed',
          paymentResult.error || 'Could not send zap. Please try again.',
          [{ text: 'OK' }]
        );
        return { success: false, error: paymentResult.error };
      }
    } catch (error) {
      console.error('[CharityZap] Send error:', error);
      Alert.alert('Error', 'Failed to send zap. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Request invoice from Lightning address (LNURL)
   * Implements LNURL-pay protocol
   */
  private async requestInvoiceFromLightningAddress(
    lightningAddress: string,
    amountSats: number,
    description: string
  ): Promise<string | null> {
    try {
      console.log('[CharityZap] Requesting invoice from', lightningAddress);

      // Parse Lightning address (user@domain.com format)
      const [username, domain] = lightningAddress.split('@');
      if (!username || !domain) {
        console.error('[CharityZap] Invalid Lightning address format');
        return null;
      }

      // Step 1: Get LNURL-pay endpoint
      const lnurlUrl = `https://${domain}/.well-known/lnurlp/${username}`;
      console.log('[CharityZap] Fetching LNURL endpoint:', lnurlUrl);

      const lnurlResponse = await fetch(lnurlUrl);
      if (!lnurlResponse.ok) {
        console.error('[CharityZap] LNURL fetch failed:', lnurlResponse.status);
        return null;
      }

      const lnurlData = await lnurlResponse.json();

      // Check for error in response
      if (lnurlData.status === 'ERROR') {
        console.error('[CharityZap] LNURL error:', lnurlData.reason);
        return null;
      }

      // Step 2: Request invoice with amount
      const amountMsats = amountSats * 1000;
      const callbackUrl = `${lnurlData.callback}?amount=${amountMsats}`;

      console.log('[CharityZap] Requesting invoice:', callbackUrl);

      const invoiceResponse = await fetch(callbackUrl);
      if (!invoiceResponse.ok) {
        console.error('[CharityZap] Invoice request failed:', invoiceResponse.status);
        return null;
      }

      const invoiceData = await invoiceResponse.json();

      // Check for error
      if (invoiceData.status === 'ERROR') {
        console.error('[CharityZap] Invoice error:', invoiceData.reason);
        return null;
      }

      // Return the invoice
      if (invoiceData.pr) {
        console.log('[CharityZap] Invoice generated successfully');
        return invoiceData.pr;
      }

      console.error('[CharityZap] No invoice in response');
      return null;
    } catch (error) {
      console.error('[CharityZap] Request invoice error:', error);
      return null;
    }
  }

  /**
   * Preset zap amounts for quick donations
   */
  async zapCharityWithPreset(
    charityId: string,
    charityName: string,
    amount: number
  ): Promise<CharityZapResult> {
    try {
      const charity = getCharityById(charityId);
      if (!charity) {
        return { success: false, error: 'Charity not found' };
      }

      return await this.sendZapToCharity(
        charity.lightningAddress,
        charityName,
        amount.toString()
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const CharityZapService = new CharityZapServiceClass();
export default CharityZapService;
