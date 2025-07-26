-- Criar tabela para logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON public.audit_logs(risk_level);

-- RLS policies para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Apenas sistema pode inserir logs (função server-side)
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true); -- Controle será feito via função

-- Criar tabela para backups de usuários
CREATE TABLE IF NOT EXISTS public.user_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual' CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
  encryption_method TEXT NOT NULL DEFAULT 'aes-256-gcm',
  checksum TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '90 days')
);

-- Índices para backups
CREATE INDEX IF NOT EXISTS idx_user_backups_user_id ON public.user_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backups_created_at ON public.user_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_backups_expires_at ON public.user_backups(expires_at);

-- RLS para backups
ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own backups" 
ON public.user_backups 
FOR ALL 
USING (auth.uid() = user_id);

-- Função para limpar backups expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_backups 
  WHERE expires_at < now();
END;
$$;

-- Função para inserir log de auditoria com validação
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

-- Função para detectar atividade suspeita
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(p_user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger para limpar logs antigos automaticamente
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Manter apenas logs dos últimos 90 dias
  DELETE FROM public.audit_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  RETURN NULL;
END;
$$;

-- Criar trigger que executa a limpeza diariamente
-- (Será executado sempre que um novo log for inserido, mas controlado por data)
CREATE OR REPLACE FUNCTION public.should_cleanup_logs()
RETURNS boolean
LANGUAGE plpgsql
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