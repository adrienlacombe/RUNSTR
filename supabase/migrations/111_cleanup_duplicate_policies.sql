-- Migration: Cleanup duplicate policies and indexes
-- Purpose: Remove duplicate RLS policies and indexes flagged by Supabase security advisor
-- Date: 2026-01-13

-- ============================================================================
-- FIX: Multiple Permissive Policies on teams table
-- The same policies were created in both 001 and 102 migrations
-- ============================================================================

-- Drop all existing policies on teams and recreate cleanly
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON teams;
DROP POLICY IF EXISTS "Team captains can manage their teams" ON teams;

-- Recreate single clean policies
CREATE POLICY "Public read access" ON teams
    FOR SELECT
    USING (true);

CREATE POLICY "Service role full access" ON teams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- FIX: Duplicate Index on competition_participants
-- Check for and remove duplicate indexes
-- ============================================================================

-- Find and drop duplicate indexes (keeping the primary/unique constraint index)
DO $$
DECLARE
    idx_record RECORD;
    idx_count INTEGER := 0;
BEGIN
    -- Get all indexes on competition_participants except primary key
    FOR idx_record IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'competition_participants'
        AND indexname NOT LIKE '%pkey%'
        AND indexname NOT LIKE '%unique%'
    LOOP
        idx_count := idx_count + 1;
        -- Keep first non-pk index, drop others
        IF idx_count > 1 THEN
            EXECUTE format('DROP INDEX IF EXISTS %I', idx_record.indexname);
            RAISE NOTICE 'Dropped duplicate index: %', idx_record.indexname;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON POLICY "Public read access" ON teams IS 'Anyone can view teams/charities';
COMMENT ON POLICY "Service role full access" ON teams IS 'Edge Functions can manage teams';
