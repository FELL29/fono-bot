import { auditLogger } from '@/lib/audit';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    // Development: log to console
    if (this.isDevelopment) {
      const logMethod = level === LogLevel.ERROR ? console.error : 
                       level === LogLevel.WARN ? console.warn : console.log;
      logMethod(`[${level.toUpperCase()}] ${message}`, context, error);
    }

    // Production: send to audit system for errors and warnings
    if (!this.isDevelopment && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      if (context?.userId) {
        auditLogger.securityViolation(
          context.userId,
          `${level}: ${message}`,
          { ...context, error: error?.message }
        );
      }
    }
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Método específico para tracking de dados
  trackData(action: string, userId?: string, metadata?: Record<string, any>) {
    if (userId && !this.isDevelopment) {
      auditLogger.dataAccess(userId, action, JSON.stringify(metadata || {}));
    }
    this.debug(`Data tracking: ${action}`, { userId, metadata });
  }

  // Método específico para performance
  performance(operation: string, duration: number, context?: LogContext) {
    const message = `Performance: ${operation} took ${duration}ms`;
    if (duration > 1000) {
      this.warn(message, context);
    } else {
      this.debug(message, context);
    }
  }
}

export const logger = new Logger();