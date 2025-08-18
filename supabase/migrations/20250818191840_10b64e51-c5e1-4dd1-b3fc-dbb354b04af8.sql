-- CRITICAL SECURITY FIXES
-- 1) Tighten RLS on subscribers (remove permissive policies and add service role policies)

-- Drop dangerous permissive policies if they exist
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Add explicit service role policies for payment system integrations
CREATE POLICY IF NOT EXISTS "service_role_select_subscribers"
ON public.subscribers
FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "service_role_insert_subscribers"
ON public.subscribers
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "service_role_update_subscribers"
ON public.subscribers
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Keep existing user-scoped policies (insert_own_subscriber, update_own_subscriber, select_own_subscription) as-is
-- No changes needed here


-- 2) Restrict audit_logs INSERT to service_role only
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY IF NOT EXISTS "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Keep existing select policies for admin and own logs


-- 3) Add maintenance triggers for cleanup
-- Cleanup trigger for rate_limit_attempts (probabilistic via maybe_cleanup_rate_limits)
DROP TRIGGER IF EXISTS rate_limit_cleanup_trigger ON public.rate_limit_attempts;
CREATE TRIGGER rate_limit_cleanup_trigger
AFTER INSERT ON public.rate_limit_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.maybe_cleanup_rate_limits();

-- Cleanup trigger for audit_logs (daily, guarded by should_cleanup_logs())
DROP TRIGGER IF EXISTS audit_logs_cleanup_trigger ON public.audit_logs;
CREATE TRIGGER audit_logs_cleanup_trigger
AFTER INSERT ON public.audit_logs
FOR EACH STATEMENT
WHEN (public.should_cleanup_logs())
EXECUTE FUNCTION public.cleanup_old_audit_logs();