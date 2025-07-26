-- Corrigir search_path nas funções existentes para segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, parent_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'parent_name',
    NEW.raw_user_meta_data->>'whatsapp'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Corrigir search_path nas novas funções de auditoria
CREATE OR REPLACE FUNCTION public.cleanup_expired_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_backups 
  WHERE expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_user_id UUID,
  p_event_type TEXT,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_risk_level TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Validar risk_level
  IF p_risk_level NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'Invalid risk_level: %', p_risk_level;
  END IF;
  
  -- Inserir log
  INSERT INTO public.audit_logs (
    user_id, event_type, details, ip_address, 
    user_agent, session_id, success, risk_level
  ) VALUES (
    p_user_id, p_event_type, p_details, p_ip_address,
    p_user_agent, p_session_id, p_success, p_risk_level
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_logins INTEGER;
  recent_events INTEGER;
  suspicious BOOLEAN := false;
BEGIN
  -- Contar logins falhados na última hora
  SELECT COUNT(*) INTO failed_logins
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type = 'login'
    AND success = false
    AND created_at > now() - INTERVAL '1 hour';
    
  -- Contar eventos recentes na última hora
  SELECT COUNT(*) INTO recent_events
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND created_at > now() - INTERVAL '1 hour';
  
  -- Detectar padrões suspeitos
  IF failed_logins > 5 THEN
    -- Registrar atividade suspeita
    PERFORM public.insert_audit_log(
      p_user_id,
      'suspicious_activity',
      json_build_object('type', 'multiple_failed_logins', 'count', failed_logins),
      NULL, NULL, NULL, false, 'high'
    );
    suspicious := true;
  END IF;
  
  IF recent_events > 100 THEN
    PERFORM public.insert_audit_log(
      p_user_id,
      'suspicious_activity', 
      json_build_object('type', 'excessive_activity', 'count', recent_events),
      NULL, NULL, NULL, false, 'medium'
    );
    suspicious := true;
  END IF;
  
  RETURN suspicious;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Manter apenas logs dos últimos 90 dias
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.should_cleanup_logs()
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  last_cleanup TIMESTAMP;
BEGIN
  -- Verifica se já foi feita limpeza hoje
  SELECT created_at INTO last_cleanup
  FROM public.audit_logs 
  WHERE details ? 'cleanup_executed'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  RETURN last_cleanup IS NULL OR last_cleanup < CURRENT_DATE;
END;
$$;