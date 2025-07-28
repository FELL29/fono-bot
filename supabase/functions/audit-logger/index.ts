import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditRequest {
  event_type: string;
  details?: Record<string, any>;
  success?: boolean;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  session_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Obter dados da requisição
    const requestData: AuditRequest = await req.json();
    
    // Validar dados obrigatórios
    if (!requestData.event_type) {
      throw new Error('event_type is required');
    }

    // Obter informações da requisição
    const forwarded = req.headers.get('x-forwarded-for');
    let clientIP = 'unknown';
    
    if (forwarded) {
      // Pegar apenas o primeiro IP da lista e validar se é um IP válido
      const firstIp = forwarded.split(',')[0].trim();
      // Validação básica de IP (IPv4)
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (ipRegex.test(firstIp)) {
        clientIP = firstIp;
      }
    } else {
      const realIp = req.headers.get('x-real-ip');
      if (realIp && /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(realIp)) {
        clientIP = realIp;
      }
    }
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Sanitizar dados sensíveis
    const sanitizedDetails = sanitizeForLogging(requestData.details || {});

    // Inserir log de auditoria usando a função do banco
    const { data: logId, error: insertError } = await supabase
      .rpc('insert_audit_log', {
        p_user_id: user.id,
        p_event_type: requestData.event_type,
        p_details: sanitizedDetails,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_session_id: requestData.session_id || null,
        p_success: requestData.success ?? true,
        p_risk_level: requestData.risk_level || 'low'
      });

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    // Detectar atividade suspeita
    const { data: isSuspicious, error: suspiciousError } = await supabase
      .rpc('detect_suspicious_activity', { p_user_id: user.id });

    if (suspiciousError) {
      console.warn('Error detecting suspicious activity:', suspiciousError);
    }

    // Resposta de sucesso
    const response = {
      success: true,
      log_id: logId,
      suspicious_activity_detected: isSuspicious || false,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Audit log error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: error.message.includes('authentication') ? 401 : 500,
      }
    );
  }
});

/**
 * Sanitiza dados sensíveis para logging
 */
function sanitizeForLogging(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'ssn', 'cpf', 'credit_card', 'bank_account', 'api_key'
  ];

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}