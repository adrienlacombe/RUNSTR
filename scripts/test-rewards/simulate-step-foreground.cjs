#!/usr/bin/env node
/**
 * Simulate Step Reward Foreground Catch-up
 *
 * This script simulates what happens when:
 * 1. User walks with app in background
 * 2. Opens app with 6,000 steps
 * 3. App should immediately pay for milestones 1k, 2k, 3k, 4k, 5k, 6k
 *
 * Usage: node scripts/test-rewards/simulate-step-foreground.cjs
 */

console.log('🏃 Step Reward Foreground Catch-up Simulation\n');
console.log('='.repeat(60));

// Configuration
const STEP_CONFIG = {
  SATS_PER_MILESTONE: 5,
  MILESTONE_INCREMENT: 1000,
};

const DONATION_PERCENTAGE = 50; // User has 50% donation set

// Simulate current state
const currentSteps = 6000;
const alreadyRewardedMilestones = []; // None rewarded yet (app was in background)

console.log(`\n📊 Current State:`);
console.log(`   Steps: ${currentSteps.toLocaleString()}`);
console.log(`   Already Rewarded: ${alreadyRewardedMilestones.length === 0 ? 'None' : alreadyRewardedMilestones.join(', ')}`);
console.log(`   Donation %: ${DONATION_PERCENTAGE}%`);

// Calculate milestones reached
const reachedMilestones = [];
for (let m = STEP_CONFIG.MILESTONE_INCREMENT; m <= currentSteps; m += STEP_CONFIG.MILESTONE_INCREMENT) {
  reachedMilestones.push(m);
}

// Find new milestones to reward
const newMilestones = reachedMilestones.filter(m => !alreadyRewardedMilestones.includes(m));

console.log(`\n🎯 Milestones Reached: ${reachedMilestones.join(', ')}`);
console.log(`📤 New Milestones to Reward: ${newMilestones.join(', ')}`);

// Simulate payment flow
console.log('\n' + '='.repeat(60));
console.log('\n💸 Payment Simulation\n');

let totalUserSats = 0;
let totalCharitySats = 0;
let failedPayments = 0;

const MIN_AMOUNT = 10; // Typical LNURL minimum

for (const milestone of newMilestones) {
  const totalAmount = STEP_CONFIG.SATS_PER_MILESTONE;
  const charityAmount = Math.floor(totalAmount * (DONATION_PERCENTAGE / 100));
  const userAmount = totalAmount - charityAmount;

  const userPayable = userAmount === 0 || userAmount >= MIN_AMOUNT;
  const charityPayable = charityAmount === 0 || charityAmount >= MIN_AMOUNT;

  console.log(`\n📍 Milestone ${milestone.toLocaleString()} steps:`);
  console.log(`   Total: ${totalAmount} sats`);
  console.log(`   User: ${userAmount} sats ${userPayable ? '✅' : '❌ (below minimum)'}`);
  console.log(`   Charity: ${charityAmount} sats ${charityPayable ? '✅' : '❌ (below minimum)'}`);

  if (userPayable) {
    totalUserSats += userAmount;
  } else {
    failedPayments++;
  }

  if (charityPayable) {
    totalCharitySats += charityAmount;
  } else {
    failedPayments++;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📈 SUMMARY\n');

console.log(`Milestones Processed: ${newMilestones.length}`);
console.log(`Expected Total: ${newMilestones.length * STEP_CONFIG.SATS_PER_MILESTONE} sats`);
console.log(`\nActual Results:`);
console.log(`   User Received: ${totalUserSats} sats`);
console.log(`   Charity Received: ${totalCharitySats} sats`);
console.log(`   Failed Payments: ${failedPayments}`);

if (failedPayments > 0) {
  console.log(`\n⚠️  WARNING: ${failedPayments} payments failed due to minimum amount issues`);
  console.log('   With 5 sats/milestone and 50% split, each payment is only 2-3 sats');
  console.log('   Most LNURL endpoints require minimum 10 sats');
}

// Impact XP calculation
console.log('\n📊 Impact XP Earned:');
console.log(`   ${totalCharitySats} XP (1 sat donated = 1 XP)`);

console.log('\n' + '='.repeat(60));

// Recommended fix
console.log('\n💡 RECOMMENDED FIX\n');
console.log('Option A: Skip donation split for step rewards');
console.log('  - User gets full 5 sats per milestone');
console.log('  - Charity gets nothing from step rewards');
console.log('  - Daily workout rewards (50 sats) still split normally');
console.log('');
console.log('Option B: Increase step reward to 21 sats');
console.log('  - 21 * 50% = 10 sats user, 11 sats charity (both payable)');
console.log('  - More Bitcoin-y number');
console.log('');
console.log('Option C: Skip charity payment if below minimum');
console.log('  - User gets their portion');
console.log('  - Charity portion only sent if >= 10 sats');
console.log('  - Log when charity payment skipped');

console.log('\n' + '='.repeat(60));
