/**
 * Sistema de proteção CSRF (Cross-Site Request Forgery)
 */

import { auditLogger } from '@/lib/audit';

interface CSRFToken {
  token: string;
  timestamp: number;
  used: boolean;
}

class CSRFProtection {
  private tokens: Map<string, CSRFToken> = new Map();
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutos
  private readonly MAX_TOKENS = 10; // Máximo de tokens por sessão

  /**
   * Gera um novo token CSRF
   */
  generateToken(): string {
    const token = this.createSecureToken();
    const timestamp = Date.now();

    // Limpar tokens expirados
    this.cleanExpiredTokens();

    // Limitar número de tokens por sessão
    if (this.tokens.size >= this.MAX_TOKENS) {
      const oldestKey = Array.from(this.tokens.keys())[0];
      this.tokens.delete(oldestKey);
    }

    this.tokens.set(token, {
      token,
      timestamp,
      used: false
    });

    return token;
  }

  /**
   * Valida um token CSRF
   */
  validateToken(token: string, userId?: string): boolean {
    if (!token || typeof token !== 'string') {
      if (userId) {
        auditLogger.securityViolation(userId, 'csrf_invalid_token', 'Token CSRF inválido ou ausente');
      }
      return false;
    }

    const csrfToken = this.tokens.get(token);

    if (!csrfToken) {
      if (userId) {
        auditLogger.securityViolation(userId, 'csrf_token_not_found', 'Token CSRF não encontrado');
      }
      return false;
    }

    // Verificar se o token expirou
    const now = Date.now();
    if (now - csrfToken.timestamp > this.TOKEN_EXPIRY) {
      this.tokens.delete(token);
      if (userId) {
        auditLogger.securityViolation(userId, 'csrf_token_expired', 'Token CSRF expirado');
      }
      return false;
    }

    // Verificar se o token já foi usado (one-time use)
    if (csrfToken.used) {
      if (userId) {
        auditLogger.securityViolation(userId, 'csrf_token_reuse', 'Tentativa de reutilização de token CSRF');
      }
      return false;
    }

    // Marcar token como usado
    csrfToken.used = true;
    
    // Remover token após uso
    setTimeout(() => {
      this.tokens.delete(token);
    }, 1000);

    return true;
  }

  /**
   * Invalida todos os tokens de uma sessão
   */
  invalidateAllTokens(): void {
    this.tokens.clear();
  }

  /**
   * Remove tokens expirados
   */
  private cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [token, csrfToken] of this.tokens.entries()) {
      if (now - csrfToken.timestamp > this.TOKEN_EXPIRY) {
        this.tokens.delete(token);
      }
    }
  }

  /**
   * Cria um token seguro usando crypto API
   */
  private createSecureToken(): string {
    // Usar crypto API se disponível
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback para Math.random
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Obtém estatísticas dos tokens
   */
  getStats(): { total: number; expired: number; used: number } {
    const now = Date.now();
    let expired = 0;
    let used = 0;

    for (const csrfToken of this.tokens.values()) {
      if (now - csrfToken.timestamp > this.TOKEN_EXPIRY) {
        expired++;
      }
      if (csrfToken.used) {
        used++;
      }
    }

    return {
      total: this.tokens.size,
      expired,
      used
    };
  }
}

// Instância singleton
export const csrfProtection = new CSRFProtection();

/**
 * Hook para usar proteção CSRF em componentes
 */
export const useCSRFProtection = () => {
  const generateToken = () => csrfProtection.generateToken();
  const validateToken = (token: string, userId?: string) => 
    csrfProtection.validateToken(token, userId);

  return {
    generateToken,
    validateToken,
    invalidateAllTokens: () => csrfProtection.invalidateAllTokens(),
    getStats: () => csrfProtection.getStats()
  };
};

/**
 * Middleware para validação CSRF em requests
 */
export const validateCSRFMiddleware = (
  token: string, 
  userId?: string
): { isValid: boolean; error?: string } => {
  if (!token) {
    return {
      isValid: false,
      error: 'Token CSRF ausente'
    };
  }

  const isValid = csrfProtection.validateToken(token, userId);
  
  if (!isValid) {
    return {
      isValid: false,
      error: 'Token CSRF inválido ou expirado'
    };
  }

  return { isValid: true };
};

/**
 * Função para adicionar token CSRF aos headers de requisição
 */
export const addCSRFHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  const token = csrfProtection.generateToken();
  return {
    ...headers,
    'X-CSRF-Token': token
  };
};

/**
 * Função para extrair token CSRF de headers
 */
export const extractCSRFToken = (headers: Headers | Record<string, string>): string | null => {
  if (headers instanceof Headers) {
    return headers.get('X-CSRF-Token');
  }
  return headers['X-CSRF-Token'] || headers['x-csrf-token'] || null;
};