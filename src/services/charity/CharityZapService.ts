/**
 * CharityZapService - Handle zapping team charities
 * Generates Lightning invoices from charity Lightning addresses
 * No NWC wallet required - works with any Lightning wallet
 */

import { getCharityById } from '../../constants/charities';

export interface CharityZapResult {
  success: boolean;
  amount?: number;
  error?: string;
}

export interface CharityInvoiceResult {
  success: boolean;
  invoice?: string;
  amount?: number;
  charityName?: string;
  error?: string;
}

class CharityZapServiceClass {
  /**
   * Generate Lightning invoice for charity donation
   * Returns invoice for user to pay with any Lightning wallet
   */
  async generateCharityInvoice(
    charityId: string,
    amountSats: number
  ): Promise<CharityInvoiceResult> {
    try {
      // Validate amount
      if (!amountSats || amountSats <= 0) {
        return {
          success: false,
          error: 'Invalid amount. Please enter a positive number.',
        };
      }

      // Get charity info
      const charity = getCharityById(charityId);
      if (!charity) {
        return { success: false, error: 'Charity not found' };
      }

      // Request invoice from charity's Lightning address
      const invoice = await this.requestInvoiceFromLightningAddress(
        charity.lightningAddress,
        amountSats,
        `Donation to ${charity.name} via RUNSTR`
      );

      if (!invoice) {
        return {
          success: false,
          error: 'Failed to generate invoice from charity. Please try again.'
        };
      }

      return {
        success: true,
        invoice,
        amount: amountSats,
        charityName: charity.name,
      };
    } catch (error) {
      console.error('[CharityZap] Error generating invoice:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get charity information by ID
   * Useful for UI to display charity details before generating invoice
   */
  getCharityInfo(charityId: string) {
    return getCharityById(charityId);
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

}

export const CharityZapService = new CharityZapServiceClass();
export default CharityZapService;
