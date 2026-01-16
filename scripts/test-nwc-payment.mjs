/**
 * NWC Payment Test Script
 * Tests different patterns for sending payments via NWC to hustle@getalby.com
 * Run: node scripts/test-nwc-payment.mjs
 */

import { NWCClient } from '@getalby/sdk';

// SECURITY: NWC must be provided via environment variable
const NWC_URL = process.env.TEST_NWC_URL;
if (!NWC_URL) {
  console.error('Error: Set TEST_NWC_URL environment variable');
  console.error('Example: TEST_NWC_URL="nostr+walletconnect://..." node scripts/test-nwc-payment.mjs');
  process.exit(1);
}

// Test configurations - uses single NWC from env
const NWC_STRINGS = [
  {
    name: 'Test NWC from environment',
    url: NWC_URL,
  },
];

const RECIPIENT = process.env.TEST_RECIPIENT || 'hello@getalby.com';
const AMOUNT_SATS = 21;

// LNURL invoice request (same as working script)
async function requestInvoice(lightningAddress, amountSats, comment) {
  try {
    const [user, domain] = lightningAddress.split('@');
    if (!user || !domain) {
      console.error(`Invalid Lightning address format: ${lightningAddress}`);
      return null;
    }

    // Fetch LNURL metadata
    const lnurlUrl = `https://${domain}/.well-known/lnurlp/${user}`;
    console.log(`  Fetching LNURL: ${lnurlUrl}`);

    const metaResponse = await fetch(lnurlUrl);
    if (!metaResponse.ok) {
      console.error(`  Failed to fetch LNURL metadata: ${metaResponse.status}`);
      return null;
    }

    const metadata = await metaResponse.json();
    console.log(`  LNURL tag: ${metadata.tag}, min: ${metadata.minSendable/1000} sats, max: ${metadata.maxSendable/1000} sats`);

    if (metadata.tag !== 'payRequest') {
      console.error(`  Invalid LNURL tag: ${metadata.tag}`);
      return null;
    }

    // Check amount limits
    const amountMsats = amountSats * 1000;
    if (amountMsats < metadata.minSendable || amountMsats > metadata.maxSendable) {
      console.error(`  Amount ${amountSats} sats outside limits`);
      return null;
    }

    // Request invoice
    const callbackUrl = new URL(metadata.callback);
    callbackUrl.searchParams.set('amount', amountMsats.toString());
    if (comment) {
      callbackUrl.searchParams.set('comment', comment.slice(0, metadata.commentAllowed || 0));
    }

    console.log(`  Requesting invoice...`);
    const invoiceResponse = await fetch(callbackUrl.toString());
    if (!invoiceResponse.ok) {
      console.error(`  Failed to get invoice: ${invoiceResponse.status}`);
      return null;
    }

    const invoiceData = await invoiceResponse.json();
    if (!invoiceData.pr) {
      console.error(`  No invoice in response`);
      return null;
    }

    console.log(`  ✅ Got invoice: ${invoiceData.pr.slice(0, 50)}...`);
    return invoiceData.pr;
  } catch (error) {
    console.error(`  Failed to get invoice: ${error.message}`);
    return null;
  }
}

// Test a single NWC configuration
async function testNWCPayment(config, invoice) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${config.name}`);
  console.log('='.repeat(60));

  let client = null;

  try {
    // Initialize NWC client
    console.log('  Initializing NWC client...');
    client = new NWCClient({
      nostrWalletConnectUrl: config.url,
    });

    // Get wallet info
    console.log('  Getting wallet info...');
    const info = await client.getInfo();
    console.log(`  ✅ Connected to wallet: ${info.alias || 'Unknown'}`);
    console.log(`  Methods: ${info.methods?.slice(0, 5).join(', ')}...`);

    // Get balance
    console.log('  Getting balance...');
    const balance = await client.getBalance();
    console.log(`  ✅ Balance: ${balance.balance} msats (${Math.floor(balance.balance/1000)} sats)`);

    // Pay invoice
    console.log(`  Paying invoice (${AMOUNT_SATS} sats)...`);
    const paymentStart = Date.now();
    const response = await client.payInvoice({ invoice });
    const paymentTime = Date.now() - paymentStart;

    if (response.preimage) {
      console.log(`  ✅ PAYMENT SUCCESSFUL!`);
      console.log(`  Preimage: ${response.preimage}`);
      console.log(`  Time: ${paymentTime}ms`);
      return { success: true, preimage: response.preimage, time: paymentTime };
    } else {
      console.log(`  ❌ Payment failed - no preimage`);
      return { success: false, error: 'No preimage returned' };
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      try {
        client.close();
        console.log('  Client closed');
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

// Alternative: Try with nwc submodule import pattern
async function testNWCSubmodule(config, invoice) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing with dynamic import: ${config.name}`);
  console.log('='.repeat(60));

  try {
    // Try importing from /nwc subpath
    const { NWCClient: NWCClientSub } = await import('@getalby/sdk/nwc');
    console.log('  ✅ Imported from @getalby/sdk/nwc');

    const client = new NWCClientSub({
      nostrWalletConnectUrl: config.url,
    });

    const info = await client.getInfo();
    console.log(`  ✅ Connected: ${info.alias || 'Unknown'}`);

    const response = await client.payInvoice({ invoice });
    if (response.preimage) {
      console.log(`  ✅ PAYMENT SUCCESSFUL with /nwc import!`);
      return { success: true, preimage: response.preimage };
    }
    return { success: false, error: 'No preimage' };
  } catch (error) {
    console.log(`  ❌ Submodule test failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function main() {
  console.log('🚀 NWC Payment Test Script');
  console.log(`Recipient: ${RECIPIENT}`);
  console.log(`Amount: ${AMOUNT_SATS} sats`);
  console.log('');

  // Step 1: Get invoice from recipient
  console.log('Step 1: Requesting invoice from recipient...');
  const invoice = await requestInvoice(RECIPIENT, AMOUNT_SATS, 'RUNSTR Test');

  if (!invoice) {
    console.log('\n❌ Failed to get invoice. Aborting tests.');
    process.exit(1);
  }

  // Step 2: Test each NWC configuration
  const results = [];

  for (const config of NWC_STRINGS) {
    const result = await testNWCPayment(config, invoice);
    results.push({ config: config.name, ...result });

    if (result.success) {
      console.log(`\n🎉 SUCCESS with ${config.name}!`);
      break; // Stop on first success
    }

    // Wait a bit between attempts
    await new Promise(r => setTimeout(r, 2000));
  }

  // Step 3: If all failed, try submodule import
  if (!results.some(r => r.success)) {
    console.log('\n\nTrying alternative import pattern...');
    // Need fresh invoice since the old one was attempted
    const freshInvoice = await requestInvoice(RECIPIENT, AMOUNT_SATS, 'RUNSTR Test 2');
    if (freshInvoice) {
      const subResult = await testNWCSubmodule(NWC_STRINGS[0], freshInvoice);
      results.push({ config: 'Submodule import', ...subResult });
    }
  }

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  for (const r of results) {
    const status = r.success ? '✅ SUCCESS' : '❌ FAILED';
    console.log(`${status}: ${r.config}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.preimage) console.log(`   Preimage: ${r.preimage.slice(0, 20)}...`);
  }

  const anySuccess = results.some(r => r.success);
  process.exit(anySuccess ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
