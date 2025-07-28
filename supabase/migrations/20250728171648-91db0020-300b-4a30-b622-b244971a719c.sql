-- Criar tabela para controle de rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  type TEXT NOT NULL,
  blocked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_key_created ON public.rate_limit_attempts(key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_created ON public.rate_limit_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_type_created ON public.rate_limit_attempts(type, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Política para permitir apenas inserção (service role irá gerenciar)
CREATE POLICY "Allow service role full access" ON public.rate_limit_attempts
FOR ALL USING (auth.role() = 'service_role');

-- Função para limpeza automática de registros antigos (mantém últimos 7 dias)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limit_attempts 
  WHERE created_at < now() - INTERVAL '7 days';
END;
$$;

-- Trigger para limpeza automática (executa a cada inserção, mas só limpa se necessário)
CREATE OR REPLACE FUNCTION public.maybe_cleanup_rate_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  should_cleanup BOOLEAN;
BEGIN
  -- Verificar se precisa limpar (aleatoriamente, 1% de chance)
  SELECT random() < 0.01 INTO should_cleanup;
  
  IF should_cleanup THEN
    PERFORM public.cleanup_rate_limit_attempts();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_cleanup_rate_limits
  AFTER INSERT ON public.rate_limit_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.maybe_cleanup_rate_limits();