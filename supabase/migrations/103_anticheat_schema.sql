-- Migration: Anti-Cheat Schema
-- Creates workout_submissions table, adds verification columns, and creates flagged_workouts table

-- First, create the workout_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS workout_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npub TEXT NOT NULL,                              -- Nostr public key
  event_id TEXT UNIQUE,                            -- Nostr event ID (for deduplication)
  activity_type TEXT NOT NULL,                     -- Exercise type (running, walking, cycling, etc.)
  distance_meters NUMERIC,                         -- Distance in meters
  duration_seconds NUMERIC,                        -- Duration in seconds
  calories INTEGER,                                -- Calories burned
  raw_event JSONB,                                 -- Full Nostr event for reference
  created_at TIMESTAMPTZ DEFAULT NOW(),            -- When workout was recorded

  CONSTRAINT workout_submissions_npub_not_empty CHECK (npub <> '')
);

-- Performance indexes for workout_submissions
CREATE INDEX IF NOT EXISTS idx_workout_submissions_npub ON workout_submissions(npub);
CREATE INDEX IF NOT EXISTS idx_workout_submissions_activity_type ON workout_submissions(activity_type);
CREATE INDEX IF NOT EXISTS idx_workout_submissions_created_at ON workout_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_submissions_event_id ON workout_submissions(event_id);

-- Row Level Security for workout_submissions
ALTER TABLE workout_submissions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (Edge Functions)
CREATE POLICY "Service role can do everything on workout_submissions"
ON workout_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anon can read for leaderboards
CREATE POLICY "Anon can read workout_submissions"
ON workout_submissions
FOR SELECT
TO anon
USING (true);

-- Anon can insert (for submit-workout Edge Function)
CREATE POLICY "Anon can insert workout_submissions"
ON workout_submissions
FOR INSERT
TO anon
WITH CHECK (true);

COMMENT ON TABLE workout_submissions IS 'Workout data from Nostr events for competition leaderboards and verification';
COMMENT ON COLUMN workout_submissions.event_id IS 'Nostr event ID for deduplication';
COMMENT ON COLUMN workout_submissions.raw_event IS 'Full Nostr event JSON for audit and verification';

-- Add verification columns to workout_submissions
ALTER TABLE workout_submissions
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

ALTER TABLE workout_submissions
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'app';

-- Add comment explaining source values
COMMENT ON COLUMN workout_submissions.source IS 'Source of submission: app (direct from RUNSTR app), nostr_scan (periodic script), baseline_migration (initial migration)';
COMMENT ON COLUMN workout_submissions.verified IS 'Whether workout passed anti-cheat validation';

-- Create flagged_workouts table for admin review
CREATE TABLE IF NOT EXISTS flagged_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npub TEXT NOT NULL,
  event_id TEXT,
  activity_type TEXT,
  distance_meters NUMERIC,
  duration_seconds NUMERIC,
  created_at TIMESTAMPTZ,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT NOT NULL,
  raw_event JSONB,
  reviewed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,

  -- Indexes for common queries
  CONSTRAINT flagged_workouts_event_id_unique UNIQUE (event_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_flagged_workouts_npub ON flagged_workouts(npub);
CREATE INDEX IF NOT EXISTS idx_flagged_workouts_reviewed ON flagged_workouts(reviewed);
CREATE INDEX IF NOT EXISTS idx_flagged_workouts_flagged_at ON flagged_workouts(flagged_at DESC);

-- Add index on workout_submissions for verified column
CREATE INDEX IF NOT EXISTS idx_workout_submissions_verified ON workout_submissions(verified);
CREATE INDEX IF NOT EXISTS idx_workout_submissions_source ON workout_submissions(source);

-- Grant access to the anon role for the Edge Function
ALTER TABLE flagged_workouts ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/select (Edge Function uses service role)
CREATE POLICY "Service role can do everything on flagged_workouts"
ON flagged_workouts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon to read flagged_workouts (for admin dashboard if needed)
CREATE POLICY "Anon can read flagged_workouts"
ON flagged_workouts
FOR SELECT
TO anon
USING (true);
