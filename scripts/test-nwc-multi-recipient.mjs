/**
 * NWC Multi-Recipient Test
 * Tests payments to different Lightning addresses to find what works
 * Run: node scripts/test-nwc-multi-recipient.mjs
 */

import { NWCClient } from '@getalby/sdk';

const NWC_URL = 'nostr+walletconnect://72bdbc57bdd6dfc4e62685051de8041d148c3c68fe42bf301f71aa6cf53e52fb?relay=wss%3A%2F%2Frelay.coinos.io&secret=a50e5e32b590939a3cea777ab87cf3591f9dbde3841395900c5d723e64f1934f&lud16=RUNSTR@coinos.io';

const TEST_RECIPIENTS = [
  { name: 'Coinos (same provider)', address: 'RUNSTR@coinos.io' },
  { name: 'Alby hustle', address: 'hustle@getalby.com' },
  { name: 'Alby hello', address: 'hello@getalby.com' },
  { name: 'Stacker News', address: 'sn@stacker.news' },
  { name: 'Wallet of Satoshi', address: 'test@walletofsatoshi.com' },
];

const AMOUNT_SATS = 21;

async function requestInvoice(lightningAddress, amountSats) {
  try {
    const [user, domain] = lightningAddress.split('@');
    const lnurlUrl = `https://${domain}/.well-known/lnurlp/${user}`;

    const metaResponse = await fetch(lnurlUrl);
    if (!metaResponse.ok) return null;

    const metadata = await metaResponse.json();
    if (metadata.tag !== 'payRequest') return null;

    const amountMsats = amountSats * 1000;
    if (amountMsats < metadata.minSendable || amountMsats > metadata.maxSendable) return null;

    const callbackUrl = new URL(metadata.callback);
    callbackUrl.searchParams.set('amount', amountMsats.toString());

    const invoiceResponse = await fetch(callbackUrl.toString());
    if (!invoiceResponse.ok) return null;

    const invoiceData = await invoiceResponse.json();
    return invoiceData.pr || null;
  } catch (error) {
    return null;
  }
}

async function testPayment(client, recipient) {
  console.log(`\nTesting: ${recipient.name} (${recipient.address})`);
  console.log('-'.repeat(50));

  try {
    // Get invoice
    console.log('  Requesting invoice...');
    const invoice = await requestInvoice(recipient.address, AMOUNT_SATS);

    if (!invoice) {
      console.log('  ❌ Failed to get invoice');
      return { success: false, error: 'Invoice request failed' };
    }
    console.log(`  ✅ Got invoice`);

    // Pay invoice
    console.log('  Paying...');
    const response = await client.payInvoice({ invoice });

    if (response.preimage) {
      console.log(`  ✅ PAYMENT SUCCESS! Preimage: ${response.preimage.slice(0, 16)}...`);
      return { success: true, preimage: response.preimage };
    }

    console.log('  ❌ No preimage returned');
    return { success: false, error: 'No preimage' };
  } catch (error) {
    const msg = error.message || 'Unknown error';
    // Truncate long error messages
    const shortMsg = msg.length > 80 ? msg.slice(0, 80) + '...' : msg;
    console.log(`  ❌ Error: ${shortMsg}`);
    return { success: false, error: msg };
  }
}

async function main() {
  console.log('🚀 NWC Multi-Recipient Payment Test');
  console.log(`Amount: ${AMOUNT_SATS} sats per test`);
  console.log('');

  // Initialize client once
  console.log('Initializing NWC client...');
  const client = new NWCClient({ nostrWalletConnectUrl: NWC_URL });

  const info = await client.getInfo();
  console.log(`Connected to: ${info.alias || 'Unknown'}`);

  const balance = await client.getBalance();
  console.log(`Balance: ${Math.floor(balance.balance/1000)} sats\n`);

  // Test each recipient
  const results = [];

  for (const recipient of TEST_RECIPIENTS) {
    const result = await testPayment(client, recipient);
    results.push({ ...recipient, ...result });

    // Wait between payments to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  // Close client
  try { client.close(); } catch (e) {}

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ SUCCESSFUL (${successful.length}):`);
  for (const r of successful) {
    console.log(`   ${r.address}`);
  }

  console.log(`\n❌ FAILED (${failed.length}):`);
  for (const r of failed) {
    const shortError = r.error.length > 60 ? r.error.slice(0, 60) + '...' : r.error;
    console.log(`   ${r.address}: ${shortError}`);
  }

  console.log('\n' + '='.repeat(60));
  if (successful.length > 0) {
    console.log('RECOMMENDATION: Use a Lightning address from a working provider');
    console.log('Working providers:', successful.map(r => r.address.split('@')[1]).join(', '));
  } else {
    console.log('All payments failed - check Coinos wallet channel connectivity');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
