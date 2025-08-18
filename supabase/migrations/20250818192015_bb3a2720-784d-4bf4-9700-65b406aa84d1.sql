-- Retry migration without IF NOT EXISTS (Postgres doesn't support it for policies)

-- 1) Tighten RLS on subscribers
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Recreate service role policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "service_role_select_subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_insert_subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_update_subscribers" ON public.subscribers;

CREATE POLICY "service_role_select_subscribers"
ON public.subscribers
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "service_role_insert_subscribers"
ON public.subscribers
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_role_update_subscribers"
ON public.subscribers
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 2) Restrict audit_logs INSERT to service_role only
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 3) Maintenance triggers (idempotent)
DROP TRIGGER IF EXISTS rate_limit_cleanup_trigger ON public.rate_limit_attempts;
CREATE TRIGGER rate_limit_cleanup_trigger
AFTER INSERT ON public.rate_limit_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.maybe_cleanup_rate_limits();

DROP TRIGGER IF EXISTS audit_logs_cleanup_trigger ON public.audit_logs;
CREATE TRIGGER audit_logs_cleanup_trigger
AFTER INSERT ON public.audit_logs
FOR EACH STATEMENT
WHEN (public.should_cleanup_logs())
EXECUTE FUNCTION public.cleanup_old_audit_logs();