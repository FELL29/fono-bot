/**
 * Configurações de segurança para OTP e autenticação
 */
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from './audit';
import { rateLimiter } from './security';

export interface OTPConfig {
  expirySeconds: number;
  maxAttempts: number;
  rateLimitWindow: number;
  rateLimitAttempts: number;
}

/**
 * Configurações padrão de segurança para OTP
 */
export const DEFAULT_OTP_CONFIG: OTPConfig = {
  expirySeconds: 300, // 5 minutos
  maxAttempts: 3,
  rateLimitWindow: 60 * 1000, // 1 minuto
  rateLimitAttempts: 3
};

/**
 * Gera OTP com configurações de segurança
 */
export const generateSecureOTP = async (
  email: string,
  type: 'signup' | 'recovery' | 'email_change' = 'signup'
): Promise<{ success: boolean; error?: string; rateLimited?: boolean }> => {
  try {
    // Rate limiting
    const rateLimitKey = `otp_${type}_${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, DEFAULT_OTP_CONFIG.rateLimitAttempts, DEFAULT_OTP_CONFIG.rateLimitWindow)) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'otp_rate_limit_exceeded',
          email,
          type
        },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, rateLimited: true, error: 'Muitas tentativas. Tente novamente em 1 minuto.' };
    }

    let result;
    
    switch (type) {
      case 'signup':
        result = await supabase.auth.signUp({
          email,
          password: 'temp', // Senha temporária, será redefinida
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`
          }
        });
        break;
        
      case 'recovery':
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });
        break;
        
      case 'email_change':
        result = await supabase.auth.updateUser({ email });
        break;
        
      default:
        throw new Error('Tipo de OTP inválido');
    }

    if (result.error) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'otp_generation_failed',
          email,
          type,
          error: result.error.message
        },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, error: result.error.message };
    }

    await logAuditEvent({
      event_type: 'data_access',
      details: { 
        action: 'otp_generated',
        email,
        type
      },
      success: true,
      risk_level: 'low'
    });

    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { 
        action: 'otp_generation_error',
        email,
        type,
        error: errorMessage
      },
      success: false,
      risk_level: 'high'
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Verifica OTP com controle de tentativas
 */
export const verifyOTP = async (
  token: string,
  email: string,
  type: 'signup' | 'recovery' | 'email_change' = 'signup'
): Promise<{ success: boolean; error?: string; attemptsExceeded?: boolean }> => {
  try {
    // Rate limiting por IP/sessão
    const rateLimitKey = `otp_verify_${type}`;
    if (!rateLimiter.isAllowed(rateLimitKey, DEFAULT_OTP_CONFIG.maxAttempts, DEFAULT_OTP_CONFIG.rateLimitWindow)) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'otp_verification_rate_limit',
          type,
          token: token.substring(0, 4) + '***' // Log parcial do token
        },
        success: false,
        risk_level: 'high'
      });
      return { 
        success: false, 
        attemptsExceeded: true, 
        error: 'Muitas tentativas de verificação. Tente novamente em 1 minuto.' 
      };
    }

    let result;
    
    switch (type) {
      case 'signup':
        result = await supabase.auth.verifyOtp({
          token,
          type: 'email',
          email
        });
        break;
        
      case 'recovery':
        result = await supabase.auth.verifyOtp({
          token,
          type: 'recovery',
          email
        });
        break;
        
      case 'email_change':
        result = await supabase.auth.verifyOtp({
          token,
          type: 'email_change',
          email
        });
        break;
        
      default:
        throw new Error('Tipo de verificação inválido');
    }

    if (result.error) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'otp_verification_failed',
          type,
          error: result.error.message,
          token: token.substring(0, 4) + '***'
        },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, error: result.error.message };
    }

    // Limpa rate limit em caso de sucesso
    rateLimiter.clear(rateLimitKey);

    await logAuditEvent({
      event_type: 'login',
      details: { 
        action: 'otp_verified',
        type,
        userId: result.data.user?.id
      },
      success: true,
      risk_level: 'low'
    });

    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { 
        action: 'otp_verification_error',
        type,
        error: errorMessage,
        token: token.substring(0, 4) + '***'
      },
      success: false,
      risk_level: 'high'
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Configurações de sessão segura
 */
export const configureSecureSession = () => {
  // Configurações já estão no client do Supabase
  // Mas podemos adicionar validações extras
  
  // Verifica se a sessão está próxima do vencimento
  const checkSessionExpiry = () => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = expiresAt - now;
          
          // Se faltam menos de 5 minutos para expirar, renova automaticamente
          if (timeUntilExpiry < 300) {
            const { error } = await supabase.auth.refreshSession();
            
            if (error) {
              await logAuditEvent({
                event_type: 'security_violation',
                details: { 
                  action: 'session_refresh_failed',
                  error: error.message
                },
                success: false,
                risk_level: 'medium'
              });
            } else {
              await logAuditEvent({
                event_type: 'login',
                details: { 
                  action: 'session_refreshed',
                  userId: session.user.id
                },
                success: true,
                risk_level: 'low'
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar expiração da sessão:', error);
      }
    };

    // Verifica a cada 1 minuto
    setInterval(checkSession, 60 * 1000);
  };

  // Inicia verificação automática
  checkSessionExpiry();
};

/**
 * Detecta tentativas de força bruta em OTP
 */
export const detectOTPBruteForce = (email: string): boolean => {
  const key = `otp_attempts_${email}`;
  const attempts = parseInt(localStorage.getItem(key) || '0');
  
  if (attempts > 10) { // Mais de 10 tentativas na última hora
    logAuditEvent({
      event_type: 'suspicious_activity',
      details: { 
        action: 'otp_brute_force_detected',
        email,
        attempts
      },
      success: false,
      risk_level: 'critical'
    });
    return true;
  }
  
  return false;
};

/**
 * Registra tentativa de OTP
 */
export const recordOTPAttempt = (email: string) => {
  const key = `otp_attempts_${email}`;
  const attempts = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, attempts.toString());
  
  // Remove o contador após 1 hora
  setTimeout(() => {
    localStorage.removeItem(key);
  }, 60 * 60 * 1000);
};