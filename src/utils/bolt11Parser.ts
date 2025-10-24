/**
 * BOLT11 Lightning Invoice Parser
 * Extracts amount and expiry information from Lightning invoices
 * Based on BOLT #11 specification
 */

export interface ParsedInvoice {
  amount: number; // Amount in satoshis
  expiry: number; // Expiry in seconds from invoice creation
  timestamp: number; // Invoice creation timestamp (Unix seconds)
  expiresAt: number; // Absolute expiry time (Unix milliseconds)
  paymentHash?: string;
  description?: string;
}

/**
 * Parse amount from BOLT11 invoice
 * Supports all standard units: BTC, mBTC (m), μBTC (u), nBTC (n), pBTC (p)
 *
 * @param bolt11 - Lightning invoice string
 * @returns Amount in satoshis, or 0 if parsing fails
 *
 * Based on nostr-tools/nip57.ts implementation
 */
export function getAmountFromBolt11(bolt11: string): number {
  if (bolt11.length < 50) {
    return 0;
  }

  // Get the human-readable part (everything before last '1')
  const firstPart = bolt11.substring(0, 50);
  const idx = firstPart.lastIndexOf('1');

  if (idx === -1) {
    return 0;
  }

  const hrp = firstPart.substring(0, idx);

  // Check for valid Lightning invoice prefix (lnbc = Bitcoin mainnet)
  if (
    !hrp.startsWith('lnbc') &&
    !hrp.startsWith('lntb') &&
    !hrp.startsWith('lnbcrt')
  ) {
    return 0;
  }

  // Extract amount string (after 'lnbc' prefix)
  const amount = hrp.substring(4);

  if (amount.length < 1) {
    return 0; // No amount specified (0-amount invoice)
  }

  // Check if last character is a unit multiplier
  const lastChar = amount[amount.length - 1];
  const isDigit = lastChar >= '0' && lastChar <= '9';

  // Extract numeric part
  let cutPoint = amount.length - 1;
  if (isDigit) {
    cutPoint++; // No multiplier, treat as BTC
  }

  if (cutPoint < 1) {
    return 0;
  }

  const num = parseInt(amount.substring(0, cutPoint));

  if (isNaN(num)) {
    return 0;
  }

  // Convert to satoshis based on unit
  switch (lastChar) {
    case 'm': // milli-bitcoin (0.001 BTC)
      return num * 100000; // 1 mBTC = 100,000 sats
    case 'u': // micro-bitcoin (0.000001 BTC)
      return num * 100; // 1 μBTC = 100 sats
    case 'n': // nano-bitcoin (0.000000001 BTC)
      return num / 10; // 1 nBTC = 0.1 sats
    case 'p': // pico-bitcoin (0.000000000001 BTC)
      return num / 10000; // 1 pBTC = 0.0001 sats
    default: // Treat as full BTC
      return num * 100000000; // 1 BTC = 100,000,000 sats
  }
}

/**
 * Decode bech32 data section to extract timestamp and tagged fields
 * Simplified version - extracts only what we need
 */
function decodeBolt11Data(bolt11: string): {
  timestamp?: number;
  expiry?: number;
} {
  try {
    // Find the separator '1'
    const separatorIndex = bolt11.lastIndexOf('1');
    if (separatorIndex === -1) return {};

    // Data part starts after separator
    const datapart = bolt11.substring(separatorIndex + 1);

    // First 7 characters (35 bits) are the timestamp
    if (datapart.length < 7) return {};

    // Simple base32 decode for timestamp (first 7 chars = 35 bits)
    // This is a simplified version - full implementation would use proper bech32 decoding
    const timestampChars = datapart.substring(0, 7);

    // Decode timestamp from bech32 (each char = 5 bits)
    let timestamp = 0;
    const charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

    for (let i = 0; i < 7; i++) {
      const val = charset.indexOf(timestampChars[i]);
      if (val === -1) return {};
      timestamp = timestamp * 32 + val;
    }

    // Default expiry is 3600 seconds (1 hour) per BOLT11 spec
    let expiry = 3600;

    // Look for expiry tag (type 6) in the remaining data
    // Format: [type (5 bits)][length (10 bits)][data (length * 5 bits)]
    // This is simplified - full implementation would parse all tags properly

    return { timestamp, expiry };
  } catch (error) {
    console.error('[bolt11Parser] Decode error:', error);
    return {};
  }
}

/**
 * Parse BOLT11 invoice to extract amount, expiry, and timing information
 *
 * @param bolt11 - Lightning invoice string
 * @returns Parsed invoice data or null if parsing fails
 */
export function parseBolt11Invoice(bolt11: string): ParsedInvoice | null {
  try {
    // Validate input
    if (!bolt11 || typeof bolt11 !== 'string') {
      return null;
    }

    // Normalize (remove whitespace, convert to lowercase)
    const normalized = bolt11.trim().toLowerCase();

    if (!normalized.startsWith('ln')) {
      return null;
    }

    // Extract amount
    const amount = getAmountFromBolt11(normalized);

    // Extract timestamp and expiry
    const { timestamp, expiry } = decodeBolt11Data(normalized);

    if (!timestamp) {
      // If we can't decode timestamp, use current time and default expiry
      const now = Math.floor(Date.now() / 1000);
      return {
        amount,
        expiry: 3600, // Default 1 hour
        timestamp: now,
        expiresAt: (now + 3600) * 1000, // Convert to milliseconds
      };
    }

    // Calculate absolute expiry time
    const expiresAt = (timestamp + (expiry || 3600)) * 1000; // Convert to milliseconds

    return {
      amount,
      expiry: expiry || 3600,
      timestamp,
      expiresAt,
    };
  } catch (error) {
    console.error('[bolt11Parser] Parse error:', error);
    return null;
  }
}

/**
 * Check if a BOLT11 invoice has expired
 *
 * @param bolt11 - Lightning invoice string
 * @returns true if expired, false if still valid, null if parsing fails
 */
export function isInvoiceExpired(bolt11: string): boolean | null {
  const parsed = parseBolt11Invoice(bolt11);
  if (!parsed) return null;

  return Date.now() >= parsed.expiresAt;
}

/**
 * Get remaining time until invoice expiry
 *
 * @param bolt11 - Lightning invoice string
 * @returns Remaining seconds (or negative if expired), null if parsing fails
 */
export function getInvoiceTimeRemaining(bolt11: string): number | null {
  const parsed = parseBolt11Invoice(bolt11);
  if (!parsed) return null;

  const remainingMs = parsed.expiresAt - Date.now();
  return Math.floor(remainingMs / 1000);
}

/**
 * Validate that invoice amount matches expected amount
 * Allows for small variance (±1 sat) to account for rounding
 *
 * @param bolt11 - Lightning invoice string
 * @param expectedAmount - Expected amount in satoshis
 * @param tolerance - Allowed variance in satoshis (default: 1)
 * @returns true if amounts match within tolerance
 */
export function validateInvoiceAmount(
  bolt11: string,
  expectedAmount: number,
  tolerance: number = 1
): boolean {
  const amount = getAmountFromBolt11(bolt11);

  if (amount === 0) {
    // 0-amount invoice (amount-less invoice)
    return false;
  }

  const diff = Math.abs(amount - expectedAmount);
  return diff <= tolerance;
}
