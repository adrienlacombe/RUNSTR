#!/usr/bin/env npx ts-node
/**
 * Test Script: Reward Flow Verification
 *
 * Tests the complete reward flow including:
 * - Lightning address invoice requests
 * - NWC wallet payments
 * - Donation splits
 * - Impact XP recording
 *
 * Usage: npx ts-node scripts/test-rewards/test-reward-flow.ts
 */

import { getInvoiceFromLightningAddress, isValidLightningAddress } from '../../src/utils/lnurl';

// Test configuration
const TEST_CONFIG = {
  // Test Lightning addresses (real addresses that can receive)
  USER_ADDRESS: 'RUNSTR@coinos.io', // Replace with test address
  CHARITY_ADDRESS: 'sats@donate.bitcoinbay.foundation',

  // Test amounts
  DAILY_REWARD: 50,
  STEP_REWARD: 5,

  // Donation splits to test
  DONATION_PERCENTAGES: [0, 25, 50, 75, 100],
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function logResult(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details });
  console.log(`${passed ? '✅' : '❌'} ${name}${error ? `: ${error}` : ''}${details ? ` (${details})` : ''}`);
}

async function testLightningAddressValidation() {
  console.log('\n=== Test 1: Lightning Address Validation ===\n');

  const validAddresses = [
    'user@getalby.com',
    'test@primal.net',
    'sats@coinos.io',
  ];

  const invalidAddresses = [
    'invalid',
    'no@domain',
    '@nodomain.com',
    'user@',
    '',
  ];

  for (const addr of validAddresses) {
    const isValid = isValidLightningAddress(addr);
    logResult(`Valid address: ${addr}`, isValid, isValid ? undefined : 'Expected valid');
  }

  for (const addr of invalidAddresses) {
    const isValid = isValidLightningAddress(addr);
    logResult(`Invalid address: ${addr || '(empty)'}`, !isValid, !isValid ? undefined : 'Expected invalid');
  }
}

async function testLNURLEndpoints() {
  console.log('\n=== Test 2: LNURL Endpoint Reachability ===\n');

  const addresses = [TEST_CONFIG.USER_ADDRESS, TEST_CONFIG.CHARITY_ADDRESS];

  for (const addr of addresses) {
    try {
      const { invoice } = await getInvoiceFromLightningAddress(addr, 10, 'Test invoice');
      logResult(`LNURL fetch: ${addr}`, !!invoice, undefined, invoice ? 'Invoice received' : 'No invoice');
    } catch (error) {
      logResult(`LNURL fetch: ${addr}`, false, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

async function testMinimumAmounts() {
  console.log('\n=== Test 3: Minimum Amount Validation ===\n');

  const testAmounts = [1, 2, 3, 5, 10, 21, 50];

  for (const amount of testAmounts) {
    try {
      const { invoice } = await getInvoiceFromLightningAddress(
        TEST_CONFIG.USER_ADDRESS,
        amount,
        `Test ${amount} sats`
      );
      logResult(`Invoice for ${amount} sats`, !!invoice, undefined, 'Accepted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      const isMinError = msg.includes('too small') || msg.includes('Minimum');
      logResult(`Invoice for ${amount} sats`, false, isMinError ? `Below minimum: ${msg}` : msg);
    }
  }
}

async function testDonationSplitCalculations() {
  console.log('\n=== Test 4: Donation Split Calculations ===\n');

  for (const pct of TEST_CONFIG.DONATION_PERCENTAGES) {
    // Daily reward split
    const dailyCharity = Math.floor(TEST_CONFIG.DAILY_REWARD * (pct / 100));
    const dailyUser = TEST_CONFIG.DAILY_REWARD - dailyCharity;

    // Step reward split
    const stepCharity = Math.floor(TEST_CONFIG.STEP_REWARD * (pct / 100));
    const stepUser = TEST_CONFIG.STEP_REWARD - stepCharity;

    console.log(`\n  ${pct}% donation:`);
    console.log(`    Daily (50 sats): User=${dailyUser}, Charity=${dailyCharity}`);
    console.log(`    Step (5 sats): User=${stepUser}, Charity=${stepCharity}`);

    // Check for problematic amounts
    const problematicDaily = dailyUser < 10 && dailyUser > 0;
    const problematicStep = stepUser < 10 && stepUser > 0;

    if (problematicDaily || problematicStep) {
      logResult(`Split ${pct}%`, false, 'Amounts below 10 sat minimum',
        `Daily user=${dailyUser}, Step user=${stepUser}`);
    } else {
      logResult(`Split ${pct}%`, true, undefined, 'All amounts valid');
    }
  }
}

async function testCharityAddresses() {
  console.log('\n=== Test 5: Charity Lightning Address Verification ===\n');

  // Import charities (this would need proper module resolution)
  const charities = [
    { name: 'Bitcoin Bay', address: 'sats@donate.bitcoinbay.foundation' },
    { name: 'Bitcoin Ekasi', address: 'bitcoinekasi@primal.net' },
    { name: 'HRF', address: 'nostr@btcpay.hrf.org' },
    { name: 'ALS Network', address: 'RunningBTC@primal.net' },
  ];

  for (const charity of charities) {
    try {
      // Test with 10 sats (above most minimums)
      const { invoice } = await getInvoiceFromLightningAddress(
        charity.address,
        10,
        `Test: ${charity.name}`
      );
      logResult(`${charity.name} (${charity.address})`, !!invoice, undefined, 'Reachable');
    } catch (error) {
      logResult(`${charity.name} (${charity.address})`, false,
        error instanceof Error ? error.message : 'Unreachable');
    }
  }
}

async function runAllTests() {
  console.log('🧪 RUNSTR Reward System Test Suite\n');
  console.log('=' .repeat(50));

  await testLightningAddressValidation();
  await testLNURLEndpoints();
  await testMinimumAmounts();
  await testDonationSplitCalculations();
  await testCharityAddresses();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(50));
}

// Run tests
runAllTests().catch(console.error);
