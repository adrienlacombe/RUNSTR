#!/usr/bin/env node
/**
 * Test Donation Split Logic
 *
 * Simulates reward payments with various donation percentages
 * to identify edge cases and minimum amount issues.
 *
 * Usage: node scripts/test-rewards/test-donation-split.cjs
 */

// Test configuration
const DAILY_REWARD = 50;  // sats
const STEP_REWARD = 5;    // sats
const MIN_LNURL_AMOUNT = 10; // Most wallets require at least 10 sats

const CHARITIES = [
  { id: 'bitcoin-bay', name: 'Bitcoin Bay', address: 'sats@donate.bitcoinbay.foundation' },
  { id: 'human-rights-foundation', name: 'HRF', address: 'nostr@btcpay.hrf.org' },
  { id: 'als-foundation', name: 'ALS Network', address: 'RunningBTC@primal.net' },
];

console.log('🧮 Donation Split Analysis\n');
console.log('='.repeat(60));
console.log(`Daily Reward: ${DAILY_REWARD} sats | Step Reward: ${STEP_REWARD} sats`);
console.log(`Min LNURL Amount: ${MIN_LNURL_AMOUNT} sats`);
console.log('='.repeat(60));

// Test donation percentages
const percentages = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

console.log('\n📊 DAILY REWARD SPLITS (50 sats)\n');
console.log('Pct  | User  | Charity | User OK? | Charity OK?');
console.log('-'.repeat(55));

let dailyIssues = [];

for (const pct of percentages) {
  const charityAmount = Math.floor(DAILY_REWARD * (pct / 100));
  const userAmount = DAILY_REWARD - charityAmount;

  const userOk = userAmount === 0 || userAmount >= MIN_LNURL_AMOUNT;
  const charityOk = charityAmount === 0 || charityAmount >= MIN_LNURL_AMOUNT;

  const userStatus = userOk ? '✅' : '❌';
  const charityStatus = charityOk ? '✅' : '❌';

  console.log(`${pct.toString().padStart(3)}% | ${userAmount.toString().padStart(5)} | ${charityAmount.toString().padStart(7)} |    ${userStatus}     |     ${charityStatus}`);

  if (!userOk || !charityOk) {
    dailyIssues.push({ pct, userAmount, charityAmount, userOk, charityOk });
  }
}

console.log('\n📊 STEP REWARD SPLITS (5 sats)\n');
console.log('Pct  | User  | Charity | User OK? | Charity OK?');
console.log('-'.repeat(55));

let stepIssues = [];

for (const pct of percentages) {
  const charityAmount = Math.floor(STEP_REWARD * (pct / 100));
  const userAmount = STEP_REWARD - charityAmount;

  const userOk = userAmount === 0 || userAmount >= MIN_LNURL_AMOUNT;
  const charityOk = charityAmount === 0 || charityAmount >= MIN_LNURL_AMOUNT;

  const userStatus = userOk ? '✅' : '❌';
  const charityStatus = charityOk ? '✅' : '❌';

  console.log(`${pct.toString().padStart(3)}% | ${userAmount.toString().padStart(5)} | ${charityAmount.toString().padStart(7)} |    ${userStatus}     |     ${charityStatus}`);

  if (!userOk || !charityOk) {
    stepIssues.push({ pct, userAmount, charityAmount, userOk, charityOk });
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n🚨 ISSUES FOUND\n');

if (dailyIssues.length > 0) {
  console.log('Daily Rewards (50 sats):');
  dailyIssues.forEach(issue => {
    const problems = [];
    if (!issue.userOk) problems.push(`user=${issue.userAmount}`);
    if (!issue.charityOk) problems.push(`charity=${issue.charityAmount}`);
    console.log(`  ${issue.pct}%: ${problems.join(', ')} (below ${MIN_LNURL_AMOUNT} sat minimum)`);
  });
} else {
  console.log('Daily Rewards (50 sats): ✅ No issues');
}

console.log('');

if (stepIssues.length > 0) {
  console.log('Step Rewards (5 sats):');
  stepIssues.forEach(issue => {
    const problems = [];
    if (!issue.userOk) problems.push(`user=${issue.userAmount}`);
    if (!issue.charityOk) problems.push(`charity=${issue.charityAmount}`);
    console.log(`  ${issue.pct}%: ${problems.join(', ')} (below ${MIN_LNURL_AMOUNT} sat minimum)`);
  });
} else {
  console.log('Step Rewards (5 sats): ✅ No issues');
}

// Recommendations
console.log('\n' + '='.repeat(60));
console.log('\n💡 RECOMMENDATIONS\n');

if (stepIssues.length > 0) {
  console.log('1. Step rewards (5 sats) are too small for donation splits.');
  console.log('   Options:');
  console.log('   a) Increase step reward to 10+ sats');
  console.log('   b) Disable donation splits for step rewards');
  console.log('   c) Batch step rewards (pay every 2k steps = 10 sats)');
  console.log('   d) Skip split if amounts would be below minimum');
}

if (dailyIssues.length > 0) {
  console.log('\n2. Daily rewards have split issues at certain percentages.');
  console.log('   Options:');
  console.log('   a) Round to nearest valid split');
  console.log('   b) Only allow 0%, 50%, or 100% donation');
  console.log('   c) Skip charity payment if below minimum');
}

console.log('\n3. Add logging when payments fail due to minimum amount.');
console.log('   This helps diagnose "rewards not working" reports.');

console.log('\n' + '='.repeat(60));
