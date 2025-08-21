-- 1) Tabela para registrar eventos de uso por janela
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket TEXT NOT NULL,        -- exemplo: 'audit-logger' (nome lógico do recurso)
  identifier TEXT NOT NULL,    -- IP (ou user_id)
  ts TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Índice para consultas rápidas por bucket/identifier e ordenação por tempo
CREATE INDEX IF NOT EXISTS idx_rate_limits_bucket_identifier_ts
  ON rate_limits (bucket, identifier, ts DESC);

-- 3) RPC para contar eventos dentro da janela (segundos)
CREATE OR REPLACE FUNCTION count_rate(
  p_bucket text,
  p_identifier text,
  p_window_seconds int
) RETURNS int
LANGUAGE sql
AS $$
  SELECT COUNT(*)::int
  FROM rate_limits
  WHERE bucket = p_bucket
    AND identifier = p_identifier
    AND ts >= now() - make_interval(secs => p_window_seconds);
$$;

-- 4) (Opcional) limpeza de eventos antigos (24h)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE ts < now() - INTERVAL '24 hours';
END;
$$;

-- Se usar pg_cron, você pode agendar (execute manualmente no Studio):
-- SELECT cron.schedule('cleanup_rate_limits_job', '0 * * * *', $$SELECT cleanup_rate_limits();$$);
