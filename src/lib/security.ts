/**
 * Funções de segurança e rate limiting
 */

// Rate limiting simples no client-side
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if under limit
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  clear(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limiting para formulários
 */
export const checkFormSubmissionRate = (formType: string): boolean => {
  const key = `form-${formType}`;
  // Permite 3 submissões por minuto
  return rateLimiter.isAllowed(key, 3, 60 * 1000);
};

/**
 * Rate limiting para autenticação
 */
export const checkAuthRate = (action: 'login' | 'signup' | 'reset'): boolean => {
  const key = `auth-${action}`;
  // Permite 5 tentativas por 5 minutos
  return rateLimiter.isAllowed(key, 5, 5 * 60 * 1000);
};

/**
 * Rate limiting para busca de dados
 */
export const checkDataFetchRate = (endpoint: string): boolean => {
  const key = `fetch-${endpoint}`;
  // Permite 30 requests por minuto
  return rateLimiter.isAllowed(key, 30, 60 * 1000);
};

/**
 * Valida se uma string é um UUID válido
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Valida se um email tem formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Gera um ID único para sessão
 */
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida força da senha
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  suggestions: string[];
} => {
  const suggestions: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else suggestions.push('Use pelo menos 8 caracteres');
  
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Inclua letras minúsculas');
  
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Inclua letras maiúsculas');
  
  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Inclua números');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else suggestions.push('Inclua símbolos especiais');
  
  return {
    isValid: score >= 3,
    score,
    suggestions
  };
};

/**
 * Remove dados sensíveis de objetos para logging
 */
export const sanitizeForLogging = (obj: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  });
  
  return sanitized;
};