-- Migration: Security RLS Hardening
-- Purpose: Enable RLS on sensitive tables and restrict to service_role only
-- Date: 2026-01-13

-- ============================================================================
-- CRITICAL: Enable RLS on tables that contain sensitive/internal data
-- These tables are accessed ONLY via Edge Functions (which use service_role)
-- ============================================================================

-- daily_reward_claims: Contains Lightning address hashes - internal only
ALTER TABLE daily_reward_claims ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Service role only" ON daily_reward_claims;

-- Only service_role can access (Edge Functions)
CREATE POLICY "Service role full access" ON daily_reward_claims
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- workout_verification_codes: Contains anti-cheat codes - internal only
ALTER TABLE workout_verification_codes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Service role only" ON workout_verification_codes;

-- Only service_role can access (Edge Functions)
CREATE POLICY "Service role full access" ON workout_verification_codes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- Fix function search path mutability (security best practice)
-- ============================================================================

-- Set search_path to empty for all functions to prevent search path attacks
ALTER FUNCTION cleanup_expired_verification_codes() SET search_path = '';
ALTER FUNCTION cleanup_old_leaderboard_cache() SET search_path = '';
ALTER FUNCTION cleanup_old_reward_claims() SET search_path = '';
ALTER FUNCTION update_daily_reward_claims_updated_at() SET search_path = '';
ALTER FUNCTION update_updated_at_column() SET search_path = '';

-- trigger_nostr_sync may not exist in all environments, handle gracefully
DO $$
BEGIN
    ALTER FUNCTION trigger_nostr_sync() SET search_path = '';
EXCEPTION
    WHEN undefined_function THEN
        -- Function doesn't exist, skip
        NULL;
END $$;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON POLICY "Service role full access" ON daily_reward_claims IS
    'Restricts access to Edge Functions only (service_role). Anon users cannot read/write.';

COMMENT ON POLICY "Service role full access" ON workout_verification_codes IS
    'Restricts access to Edge Functions only (service_role). Contains sensitive anti-cheat data.';
