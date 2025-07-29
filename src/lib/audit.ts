/**
 * Sistema de auditoria e logs de segurança
 */

import { supabase } from '@/integrations/supabase/client';
import { sanitizeForLogging, generateSessionId } from './security';
import { addCSRFHeaders } from '@/lib/csrf';

export type AuditEventType = 
  | 'login'
  | 'logout'
  | 'signup'
  | 'password_reset'
  | 'data_access'
  | 'data_update'
  | 'data_delete'
  | 'assessment_complete'
  | 'subscription_change'
  | 'privacy_consent'
  | 'security_violation'
  | 'suspicious_activity';

export interface AuditEvent {
  id?: string;
  user_id?: string;
  event_type: AuditEventType;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  session_id?: string;
  success: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Registra evento de auditoria
 */
export async function logAuditEvent(event: Omit<AuditEvent, 'timestamp' | 'ip_address' | 'user_agent'>) {
  try {
    // Obtém informações do browser (sem bibliotecas externas)
    const userAgent = navigator.userAgent;
    
    // Sanitiza dados sensíveis antes de logar
    const sanitizedDetails = sanitizeForLogging(event.details);
    
    const auditData: AuditEvent = {
      ...event,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
      user_agent: userAgent,
      // IP será obtido no servidor
    };

    // Enviar para API de auditoria server-side com proteção CSRF
    try {
      const headers = addCSRFHeaders();
      
      await supabase.functions.invoke('audit-logger', {
        body: {
          event_type: event.event_type,
          details: sanitizedDetails,
          success: event.success,
          risk_level: event.risk_level,
          session_id: generateSessionId()
        },
        headers
      });
    } catch (apiError) {
      console.warn('Failed to send audit to server, saving locally:', apiError);
      
      // Fallback: salva no localStorage
      const existingLogs = JSON.parse(localStorage.getItem('fonobot_audit_logs') || '[]');
      existingLogs.push(auditData);
      
      // Mantém apenas os últimos 100 logs no localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('fonobot_audit_logs', JSON.stringify(existingLogs));
    }
    
    // Log crítico também no console para desenvolvimento
    if (event.risk_level === 'critical' || event.risk_level === 'high') {
      console.warn('🔒 Evento de Segurança:', {
        type: event.event_type,
        risk: event.risk_level,
        success: event.success,
        timestamp: auditData.timestamp
      });
    }
    
  } catch (error) {
    console.error('Erro ao registrar evento de auditoria:', error);
  }
}

/**
 * Logs específicos para diferentes tipos de eventos
 */
export const auditLogger = {
  // Autenticação
  login: (userId: string, success: boolean, details?: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'login',
      details: details || {},
      success,
      risk_level: success ? 'low' : 'medium'
    });
  },

  logout: (userId: string) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'logout',
      details: {},
      success: true,
      risk_level: 'low'
    });
  },

  signup: (userId: string, success: boolean, details?: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'signup',
      details: details || {},
      success,
      risk_level: 'low'
    });
  },

  // Acesso a dados
  dataAccess: (userId: string, resourceType: string, resourceId?: string) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'data_access',
      details: { resourceType, resourceId },
      success: true,
      risk_level: 'low'
    });
  },

  dataUpdate: (userId: string, resourceType: string, changes: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'data_update',
      details: { resourceType, changes },
      success: true,
      risk_level: 'medium'
    });
  },

  dataDelete: (userId: string, resourceType: string, resourceId: string) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'data_delete',
      details: { resourceType, resourceId },
      success: true,
      risk_level: 'high'
    });
  },

  // Eventos específicos da aplicação
  assessmentComplete: (userId: string, childId: string, trackId: string) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'assessment_complete',
      details: { childId, trackId },
      success: true,
      risk_level: 'low'
    });
  },

  privacyConsent: (userId: string, consents: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'privacy_consent',
      details: { consents },
      success: true,
      risk_level: 'medium'
    });
  },

  // Eventos de segurança
  securityViolation: (userId: string | undefined, violation: string, details: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'security_violation',
      details: { violation, ...details },
      success: false,
      risk_level: 'critical'
    });
  },

  suspiciousActivity: (userId: string | undefined, activity: string, details: any) => {
    logAuditEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      details: { activity, ...details },
      success: false,
      risk_level: 'high'
    });
  }
};

/**
 * Obtém logs de auditoria (para admins)
 */
export function getAuditLogs(filters?: {
  eventType?: AuditEventType;
  userId?: string;
  riskLevel?: AuditEvent['risk_level'];
  dateFrom?: string;
  dateTo?: string;
}): AuditEvent[] {
  try {
    const logs = JSON.parse(localStorage.getItem('fonobot_audit_logs') || '[]');
    
    if (!filters) return logs;
    
    return logs.filter((log: AuditEvent) => {
      if (filters.eventType && log.event_type !== filters.eventType) return false;
      if (filters.userId && log.user_id !== filters.userId) return false;
      if (filters.riskLevel && log.risk_level !== filters.riskLevel) return false;
      if (filters.dateFrom && log.timestamp && log.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && log.timestamp && log.timestamp > filters.dateTo) return false;
      return true;
    });
  } catch (error) {
    console.error('Erro ao obter logs de auditoria:', error);
    return [];
  }
}

/**
 * Limpa logs antigos (deve ser executado periodicamente)
 */
export function cleanupOldLogs(daysToKeep: number = 90) {
  try {
    const logs = JSON.parse(localStorage.getItem('fonobot_audit_logs') || '[]');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredLogs = logs.filter((log: AuditEvent) => {
      return !log.timestamp || new Date(log.timestamp) > cutoffDate;
    });
    
    localStorage.setItem('fonobot_audit_logs', JSON.stringify(filteredLogs));
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
  }
}

/**
 * Detecta atividades suspeitas
 */
export function detectSuspiciousActivity(userId: string): boolean {
  try {
    const logs = getAuditLogs({ userId });
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp || 0);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return logTime > oneHourAgo;
    });
    
    // Verifica múltiplas tentativas de login falhadas
    const failedLogins = recentLogs.filter(log => 
      log.event_type === 'login' && !log.success
    );
    
    if (failedLogins.length > 5) {
      auditLogger.suspiciousActivity(userId, 'multiple_failed_logins', {
        attempts: failedLogins.length,
        timeframe: '1_hour'
      });
      return true;
    }
    
    // Verifica acessos muito frequentes
    if (recentLogs.length > 100) {
      auditLogger.suspiciousActivity(userId, 'excessive_activity', {
        events: recentLogs.length,
        timeframe: '1_hour'
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro na detecção de atividade suspeita:', error);
    return false;
  }
}