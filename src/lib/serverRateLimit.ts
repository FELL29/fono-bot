/**
 * Rate limiting integrado com o servidor
 */

import { supabase } from '@/integrations/supabase/client';
import { auditLogger } from './audit';

interface RateLimitResponse {
  allowed: boolean;
  blocked?: boolean;
  remaining?: number;
  resetTime?: string;
  unblockTime?: string;
  reason?: string;
}

interface RateLimitRequest {
  key: string;
  type: 'auth' | 'form' | 'api' | 'general';
  userId?: string;
  ip?: string;
}

/**
 * Verifica rate limiting usando o servidor
 */
export const checkServerRateLimit = async (
  key: string,
  type: 'auth' | 'form' | 'api' | 'general',
  userId?: string
): Promise<RateLimitResponse> => {
  try {
    // Obter IP do usuário (aproximado)
    const ip = await getClientIP();
    
    const requestData: RateLimitRequest = {
      key,
      type,
      userId,
      ip
    };

    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      body: requestData
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Em caso de erro, permitir por segurança (fail-open)
      return { allowed: true };
    }

    return data as RateLimitResponse;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Em caso de erro, permitir por segurança
    return { allowed: true };
  }
};

/**
 * Rate limiting para autenticação
 */
export const checkAuthServerRate = async (
  action: 'login' | 'signup' | 'reset',
  userId?: string
): Promise<RateLimitResponse> => {
  const key = `auth-${action}`;
  const result = await checkServerRateLimit(key, 'auth', userId);
  
  if (!result.allowed) {
    // Log da violação de rate limit
    if (userId) {
      auditLogger.securityViolation(userId, 'server_rate_limit_exceeded', {
        action,
        key,
        blocked: result.blocked
      });
    }
  }
  
  return result;
};

/**
 * Rate limiting para formulários
 */
export const checkFormServerRate = async (
  formType: string,
  userId?: string
): Promise<RateLimitResponse> => {
  const key = `form-${formType}`;
  const result = await checkServerRateLimit(key, 'form', userId);
  
  if (!result.allowed && userId) {
    auditLogger.securityViolation(userId, 'form_rate_limit_exceeded', {
      formType,
      key
    });
  }
  
  return result;
};

/**
 * Rate limiting para APIs
 */
export const checkApiServerRate = async (
  endpoint: string,
  userId?: string
): Promise<RateLimitResponse> => {
  const key = `api-${endpoint}`;
  const result = await checkServerRateLimit(key, 'api', userId);
  
  if (!result.allowed && userId) {
    auditLogger.securityViolation(userId, 'api_rate_limit_exceeded', {
      endpoint,
      key
    });
  }
  
  return result;
};

/**
 * Hook para usar rate limiting com React
 */
export const useServerRateLimit = () => {
  const checkRate = async (
    key: string,
    type: 'auth' | 'form' | 'api' | 'general',
    userId?: string
  ) => {
    return await checkServerRateLimit(key, type, userId);
  };

  return {
    checkAuth: (action: 'login' | 'signup' | 'reset', userId?: string) =>
      checkAuthServerRate(action, userId),
    checkForm: (formType: string, userId?: string) =>
      checkFormServerRate(formType, userId),
    checkApi: (endpoint: string, userId?: string) =>
      checkApiServerRate(endpoint, userId),
    checkGeneral: checkRate
  };
};

/**
 * Obtém o IP do cliente (aproximado)
 */
async function getClientIP(): Promise<string> {
  try {
    // Tentar obter IP via serviço externo como fallback
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Mensagens de erro amigáveis para rate limiting
 */
export const getRateLimitMessage = (response: RateLimitResponse): string => {
  if (response.blocked && response.unblockTime) {
    const unblockDate = new Date(response.unblockTime);
    const timeUntilUnblock = Math.ceil((unblockDate.getTime() - Date.now()) / (1000 * 60));
    
    if (timeUntilUnblock > 60) {
      const hours = Math.ceil(timeUntilUnblock / 60);
      return `Muitas tentativas. Tente novamente em ${hours} hora(s).`;
    } else {
      return `Muitas tentativas. Tente novamente em ${timeUntilUnblock} minuto(s).`;
    }
  }
  
  if (!response.allowed) {
    return response.reason || 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
  }
  
  return '';
};

/**
 * Validação se usuário pode realizar ação
 */
export const validateRateLimit = async (
  key: string,
  type: 'auth' | 'form' | 'api' | 'general',
  userId?: string
): Promise<{ allowed: boolean; message: string }> => {
  const result = await checkServerRateLimit(key, type, userId);
  
  return {
    allowed: result.allowed,
    message: result.allowed ? '' : getRateLimitMessage(result)
  };
};