-- =============================================
-- Migration 113: Schedule process-donations function
-- =============================================
--
-- This migration sets up pg_cron to call the process-donations
-- edge function every 60 seconds, ensuring donations are
-- forwarded to charities even if the app closes.
--
-- Prerequisites:
-- 1. pg_cron extension enabled (Supabase Pro plan or higher)
-- 2. pg_net extension enabled (for HTTP requests)
-- 3. Edge function deployed: supabase functions deploy process-donations
-- 4. Vault secrets configured (project_url, service_role_key)
--
-- IMPORTANT: Run this AFTER deploying the edge function.
-- =============================================

-- Create the trigger function that pg_cron will call
CREATE OR REPLACE FUNCTION public.trigger_process_donations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url text;
  service_key text;
BEGIN
  -- Get secrets from vault
  SELECT decrypted_secret INTO project_url
  FROM vault.decrypted_secrets
  WHERE name = 'project_url';

  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  -- Make HTTP request to edge function
  IF project_url IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := project_url || '/functions/v1/process-donations',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'triggered_at', now(),
        'source', 'pg_cron'
      ),
      timeout_milliseconds := 30000
    );

    RAISE LOG 'Triggered process-donations at %', now();
  ELSE
    RAISE WARNING 'Missing vault secrets for process-donations';
  END IF;
END;
$$;

-- Schedule the job to run every 60 seconds
SELECT cron.schedule(
  'process-donations',              -- Job name
  '* * * * *',                      -- Every minute
  $$SELECT public.trigger_process_donations()$$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.trigger_process_donations() TO postgres;

-- =============================================
-- Verification queries (run after migration):
-- =============================================
--
-- Check if job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'process-donations';
--
-- Check recent job runs:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-donations') ORDER BY start_time DESC LIMIT 10;
--
-- Check pg_net HTTP responses:
-- SELECT id, status_code, created, error_msg FROM net._http_response ORDER BY created DESC LIMIT 10;
--
-- Manually trigger:
-- SELECT public.trigger_process_donations();
--
-- Remove the scheduled job:
-- SELECT cron.unschedule('process-donations');
-- =============================================
