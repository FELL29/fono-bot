import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitRequest {
  key: string;
  type: 'auth' | 'form' | 'api' | 'general';
  userId?: string;
  ip?: string;
}

// Configurações de rate limiting por tipo
const RATE_LIMITS: Record<string, RateLimitRule> = {
  'auth-login': { maxRequests: 5, windowMs: 5 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 }, // 5 tentativas em 5min, bloqueia por 15min
  'auth-signup': { maxRequests: 3, windowMs: 10 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 }, // 3 tentativas em 10min, bloqueia por 30min
  'auth-reset': { maxRequests: 3, windowMs: 15 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 }, // 3 tentativas em 15min, bloqueia por 1h
  'form-assessment': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 submissões por minuto
  'form-contact': { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 mensagens em 5min
  'api-general': { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests por minuto
  'api-data': { maxRequests: 50, windowMs: 60 * 1000 }, // 50 data requests por minuto
  'api-search': { maxRequests: 30, windowMs: 60 * 1000 }, // 30 pesquisas por minuto
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { key, type, userId, ip }: RateLimitRequest = await req.json();
    
    if (!key || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar a regra de rate limiting
    const ruleKey = `${type}-${key.split('-').pop()}` || 'api-general';
    const rule = RATE_LIMITS[ruleKey] || RATE_LIMITS['api-general'];

    console.log(`Rate limiting check for: ${key}, rule: ${ruleKey}`, rule);

    const now = new Date();
    const windowStart = new Date(now.getTime() - rule.windowMs);

    // Buscar tentativas recentes no banco
    const { data: recentAttempts, error: fetchError } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('key', key)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching rate limit attempts:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se está bloqueado
    if (rule.blockDurationMs) {
      const blockUntil = new Date(now.getTime() - rule.blockDurationMs);
      const recentBlocks = recentAttempts?.filter(attempt => 
        attempt.blocked && new Date(attempt.created_at) > blockUntil
      );

      if (recentBlocks && recentBlocks.length > 0) {
        const latestBlock = recentBlocks[0];
        const unblockTime = new Date(new Date(latestBlock.created_at).getTime() + rule.blockDurationMs);
        
        console.log(`Blocked until: ${unblockTime.toISOString()}`);
        
        return new Response(
          JSON.stringify({ 
            allowed: false, 
            blocked: true,
            unblockTime: unblockTime.toISOString(),
            reason: 'Temporarily blocked due to too many attempts'
          }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const attemptCount = recentAttempts?.length || 0;
    const isAllowed = attemptCount < rule.maxRequests;

    // Registrar a tentativa
    const shouldBlock = !isAllowed && rule.blockDurationMs;
    
    const { error: insertError } = await supabase
      .from('rate_limit_attempts')
      .insert({
        key,
        user_id: userId || null,
        ip_address: ip || null,
        type,
        blocked: shouldBlock,
        metadata: {
          rule: ruleKey,
          attemptCount: attemptCount + 1,
          maxRequests: rule.maxRequests,
          windowMs: rule.windowMs
        }
      });

    if (insertError) {
      console.error('Error inserting rate limit attempt:', insertError);
    }

    // Log para auditoria se não permitido
    if (!isAllowed) {
      console.log(`Rate limit exceeded for ${key}: ${attemptCount + 1}/${rule.maxRequests}`);
      
      // Registrar violação de segurança
      if (userId) {
        await supabase.rpc('insert_audit_log', {
          p_user_id: userId,
          p_event_type: 'security_violation',
          p_details: {
            type: 'rate_limit_exceeded',
            key,
            ruleKey,
            attempts: attemptCount + 1,
            limit: rule.maxRequests
          },
          p_ip_address: ip || null,
          p_risk_level: shouldBlock ? 'high' : 'medium'
        });
      }
    }

    const response = {
      allowed: isAllowed,
      blocked: shouldBlock,
      remaining: Math.max(0, rule.maxRequests - attemptCount - 1),
      resetTime: new Date(now.getTime() + rule.windowMs).toISOString(),
      ...(shouldBlock && rule.blockDurationMs && {
        unblockTime: new Date(now.getTime() + rule.blockDurationMs).toISOString()
      })
    };

    return new Response(
      JSON.stringify(response), 
      { 
        status: isAllowed ? 200 : 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rule.maxRequests.toString(),
          'X-RateLimit-Remaining': response.remaining.toString(),
          'X-RateLimit-Reset': response.resetTime
        } 
      }
    );

  } catch (error) {
    console.error('Rate limiter error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});