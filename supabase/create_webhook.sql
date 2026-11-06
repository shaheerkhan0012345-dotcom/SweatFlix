-- =============================================================================
-- FIX SUPABASE WEBHOOKS & ATTACH SEND-PUSH TRIGGER
-- =============================================================================
-- Solves: "schema supabase_functions does not exist"
-- Enables pg_net and creates the webhook trigger directly in PostgreSQL.

-- 1. Enable pg_net extension for asynchronous HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the supabase_functions schema used by Supabase webhooks
CREATE SCHEMA IF NOT EXISTS supabase_functions;

-- 3. Create the http_request helper function with standard webhook arguments
CREATE OR REPLACE FUNCTION supabase_functions.http_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text := TG_ARGV[0];
  v_method text := TG_ARGV[1];
  v_headers jsonb := COALESCE(TG_ARGV[2]::jsonb, '{"Content-Type":"application/json"}'::jsonb);
  v_timeout integer := COALESCE(TG_ARGV[4]::integer, 5000);
  v_payload jsonb;
BEGIN
  v_payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE row_to_json(OLD) END
  );

  PERFORM net.http_post(
    url := v_url,
    headers := v_headers,
    body := v_payload,
    timeout_milliseconds := v_timeout
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Prevent webhook network failures from rolling back the user's notification
    RAISE WARNING 'send-push webhook error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Create the webhook trigger on public.notifications
DROP TRIGGER IF EXISTS "send-push-notification" ON public.notifications;
CREATE TRIGGER "send-push-notification"
AFTER INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
  'https://ylkfddrtocsbnfvwewei.supabase.co/functions/v1/send-push',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);
