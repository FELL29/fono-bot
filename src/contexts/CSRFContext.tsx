/**
 * Contexto para gerenciar proteção CSRF na aplicação
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useCSRFProtection } from '@/lib/csrf';
import { useAuth } from '@/contexts/AuthContext';

interface CSRFContextType {
  generateToken: () => string;
  validateToken: (token: string) => boolean;
  currentToken: string | null;
  refreshToken: () => string;
  isProtected: boolean;
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (context === undefined) {
    throw new Error('useCSRF deve ser usado dentro de um CSRFProvider');
  }
  return context;
};

interface CSRFProviderProps {
  children: ReactNode;
}

export const CSRFProvider = ({ children }: CSRFProviderProps) => {
  const { user } = useAuth();
  const { generateToken, validateToken: validateCSRFToken, invalidateAllTokens } = useCSRFProtection();
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState(false);

  // Gerar token inicial
  useEffect(() => {
    if (user) {
      const token = generateToken();
      setCurrentToken(token);
      setIsProtected(true);
    } else {
      setCurrentToken(null);
      setIsProtected(false);
      invalidateAllTokens();
    }
  }, [user, generateToken, invalidateAllTokens]);

  // Invalidar tokens quando usuário sair
  useEffect(() => {
    if (!user) {
      invalidateAllTokens();
    }
  }, [user, invalidateAllTokens]);

  const validateToken = useCallback((token: string): boolean => {
    return validateCSRFToken(token, user?.id);
  }, [validateCSRFToken, user?.id]);

  const refreshToken = useCallback((): string => {
    const newToken = generateToken();
    setCurrentToken(newToken);
    return newToken;
  }, [generateToken]);

  // Atualizar token periodicamente (a cada 15 minutos)
  useEffect(() => {
    if (!isProtected) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, [isProtected, refreshToken]);

  const value = {
    generateToken,
    validateToken,
    currentToken,
    refreshToken,
    isProtected
  };

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  );
};