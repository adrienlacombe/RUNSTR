# Reward System Test Scripts

Scripts for verifying the RUNSTR reward system is working correctly.

## Scripts

### 1. `verify-reward-wallet.cjs`
Verifies the RUNSTR reward wallet configuration and health.

```bash
node scripts/test-rewards/verify-reward-wallet.cjs
```

**Checks:**
- NWC configuration (encrypted or plaintext)
- Relay connection
- Wallet balance
- Payment capability (pay_invoice method)

**Expected Output:**
```
✅ Encrypted NWC configured
✅ Decryption successful
✅ Connected to wallet
💰 Balance: 4,067 sats
✅ Balance healthy
```

### 2. `test-donation-split.cjs`
Analyzes donation split calculations for edge cases.

```bash
node scripts/test-rewards/test-donation-split.cjs
```

**Identifies:**
- Donation percentages that produce amounts below LNURL minimum (10 sats)
- Problematic splits for step rewards (5 sats total)
- Recommendations for fixing

### 3. `simulate-step-foreground.cjs`
Simulates the step reward catch-up flow when app comes to foreground.

```bash
node scripts/test-rewards/simulate-step-foreground.cjs
```

**Simulates:**
- User walks 6,000 steps with app in background
- App comes to foreground
- Immediate milestone check and payment

### 4. `test-reward-flow.ts` (TypeScript)
Full integration test for reward flows.

```bash
npx ts-node scripts/test-rewards/test-reward-flow.ts
```

**Tests:**
- Lightning address validation
- LNURL endpoint reachability
- Minimum amount acceptance
- Charity address verification

---

## Known Issues

### Critical: Step Reward Split Amounts Too Small

**Problem:** 5 sats per step milestone split with 50% donation = 2 sats user, 3 sats charity. Most LNURL endpoints reject amounts below 10 sats.

**Affected Scenarios:**
- Any donation percentage between 1-99% on step rewards
- Only 0% or 100% donation work reliably

**Recommended Fix:**
1. **Disable splits for step rewards** - User gets full 5 sats, charity gets nothing
2. **Or increase step reward to 21 sats** - 50% split = 10/11 sats (both payable)
3. **Or skip charity payment if below minimum** - User gets their portion, charity skipped

### Medium: Streak Lock on Payment Failure

**Problem:** Daily reward streak is marked BEFORE payment. If payment fails, user can't retry that day.

**Impact:** Users with wallet issues miss their daily reward window.

**Recommended Fix:**
- Only mark streak after successful payment
- Or add retry mechanism with exponential backoff

### Low: Impact XP Cache Staleness

**Problem:** ImpactLevelService caches stats for 5 minutes. After donation, user might see stale XP.

**Recommended Fix:**
- Clear cache when donation is recorded
- Or reduce cache TTL to 1 minute

---

## Running All Tests

```bash
# Quick validation
node scripts/test-rewards/verify-reward-wallet.cjs

# Split analysis
node scripts/test-rewards/test-donation-split.cjs

# Foreground simulation
node scripts/test-rewards/simulate-step-foreground.cjs
```

## Before Production Deployment

1. Run `verify-reward-wallet.cjs` to ensure wallet has sufficient balance
2. Review `test-donation-split.cjs` output for edge cases
3. Test actual payment flow in staging environment
4. Monitor wallet balance and set up low-balance alerts
