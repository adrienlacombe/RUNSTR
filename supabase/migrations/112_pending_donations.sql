-- Migration: Create pending_donations table for server-side donation forwarding
-- This table tracks donations that need to be forwarded to charities

CREATE TABLE IF NOT EXISTS pending_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_hash TEXT NOT NULL UNIQUE,
  charity_id TEXT NOT NULL,
  charity_lightning_address TEXT NOT NULL,
  amount_sats INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  forwarded_at TIMESTAMPTZ,
  forward_preimage TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'settled', 'forwarded', 'failed', 'expired')),
  CONSTRAINT valid_amount CHECK (amount_sats > 0),
  CONSTRAINT valid_retry_count CHECK (retry_count >= 0)
);

-- Index for efficient status-based queries (used by cron job)
CREATE INDEX IF NOT EXISTS idx_pending_donations_status
  ON pending_donations(status)
  WHERE status IN ('pending', 'settled');

-- Index for looking up by payment hash
CREATE INDEX IF NOT EXISTS idx_pending_donations_payment_hash
  ON pending_donations(payment_hash);

-- Index for cleanup queries (find old records)
CREATE INDEX IF NOT EXISTS idx_pending_donations_created_at
  ON pending_donations(created_at);

-- Comments for documentation
COMMENT ON TABLE pending_donations IS 'Tracks donations that need to be forwarded to charities via Lightning';
COMMENT ON COLUMN pending_donations.payment_hash IS 'Lightning payment hash from the incoming invoice';
COMMENT ON COLUMN pending_donations.charity_id IS 'ID of the charity from src/constants/charities.ts';
COMMENT ON COLUMN pending_donations.status IS 'pending=waiting for payment, settled=paid but not forwarded, forwarded=complete, failed=max retries, expired=invoice expired';
COMMENT ON COLUMN pending_donations.forward_preimage IS 'Preimage from successful payment to charity';
