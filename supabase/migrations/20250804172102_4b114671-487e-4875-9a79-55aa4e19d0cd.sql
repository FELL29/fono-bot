-- Fix search_path security issue for existing functions
ALTER FUNCTION public.cleanup_expired_backups() SET search_path = 'public';
ALTER FUNCTION public.cleanup_rate_limit_attempts() SET search_path = 'public';
ALTER FUNCTION public.maybe_cleanup_rate_limits() SET search_path = 'public';
ALTER FUNCTION public.insert_audit_log(uuid, text, jsonb, inet, text, text, boolean, text) SET search_path = 'public';
ALTER FUNCTION public.detect_suspicious_activity(uuid) SET search_path = 'public';
ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = 'public';
ALTER FUNCTION public.should_cleanup_logs() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';