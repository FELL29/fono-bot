/**
 * Multi-Factor Authentication utilities
 */
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from './audit';

export interface MFAEnrollResponse {
  success: boolean;
  qrCode?: string;
  secret?: string;
  error?: string;
}

export interface MFAVerifyResponse {
  success: boolean;
  error?: string;
}

/**
 * Inicia o processo de inscrição no MFA TOTP
 */
export const enrollMFA = async (): Promise<MFAEnrollResponse> => {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'FonoBot TOTP'
    });

    if (error) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { action: 'mfa_enroll_failed', error: error.message },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      event_type: 'data_update',
      details: { action: 'mfa_enroll_started', factorId: data.id },
      success: true,
      risk_level: 'low'
    });

    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { action: 'mfa_enroll_error', error: errorMessage },
      success: false,
      risk_level: 'high'
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Verifica o código TOTP para finalizar a inscrição
 */
export const verifyMFAEnrollment = async (
  factorId: string,
  code: string
): Promise<MFAVerifyResponse> => {
  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    });

    if (error) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { action: 'mfa_verify_failed', factorId, error: error.message },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      event_type: 'data_update',
      details: { action: 'mfa_enabled', factorId },
      success: true,
      risk_level: 'low'
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { action: 'mfa_verify_error', factorId, error: errorMessage },
      success: false,
      risk_level: 'high'
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Lista fatores MFA do usuário
 */
export const listMFAFactors = async () => {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();
    
    if (error) {
      await logAuditEvent({
        event_type: 'data_access',
        details: { action: 'mfa_list_failed', error: error.message },
        success: false,
        risk_level: 'low'
      });
      return { factors: [], error: error.message };
    }

    return { factors: data.totp || [], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { action: 'mfa_list_error', error: errorMessage },
      success: false,
      risk_level: 'medium'
    });
    return { factors: [], error: errorMessage };
  }
};

/**
 * Remove um fator MFA
 */
export const unenrollMFA = async (factorId: string): Promise<MFAVerifyResponse> => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { action: 'mfa_unenroll_failed', factorId, error: error.message },
        success: false,
        risk_level: 'medium'
      });
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      event_type: 'data_update',
      details: { action: 'mfa_disabled', factorId },
      success: true,
      risk_level: 'medium'
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    await logAuditEvent({
      event_type: 'security_violation',
      details: { action: 'mfa_unenroll_error', factorId, error: errorMessage },
      success: false,
      risk_level: 'high'
    });
    return { success: false, error: errorMessage };
  }
};

/**
 * Verifica se o usuário tem MFA habilitado
 */
export const checkMFAStatus = async () => {
  const { factors } = await listMFAFactors();
  return {
    enabled: factors.length > 0,
    factorCount: factors.length,
    factors
  };
};