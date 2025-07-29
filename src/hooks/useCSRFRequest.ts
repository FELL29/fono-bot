/**
 * Hook para fazer requisições com proteção CSRF
 */

import { useCSRF } from '@/contexts/CSRFContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface RequestOptions extends RequestInit {
  skipCSRF?: boolean;
}

export const useCSRFRequest = () => {
  const { currentToken, refreshToken, isProtected } = useCSRF();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const makeRequest = useCallback(async (
    url: string, 
    options: RequestOptions = {}
  ): Promise<Response> => {
    const { skipCSRF = false, headers = {}, ...restOptions } = options;

    // Se a proteção CSRF estiver ativa e não for para pular
    if (isProtected && !skipCSRF && user) {
      if (!currentToken) {
        toast({
          variant: "destructive",
          title: "Erro de Segurança",
          description: "Token CSRF não disponível. Tentando gerar novo token..."
        });
        refreshToken();
        throw new Error('Token CSRF não disponível');
      }

      // Adicionar token CSRF aos headers
      headers['X-CSRF-Token'] = currentToken;
    }

    // Adicionar headers de autenticação se necessário
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      // Verificar se a resposta indica erro de CSRF
      if (response.status === 403) {
        const errorText = await response.text();
        if (errorText.includes('CSRF') || errorText.includes('csrf')) {
          toast({
            variant: "destructive",
            title: "Erro de Segurança",
            description: "Token CSRF inválido. Gerando novo token..."
          });
          refreshToken();
          throw new Error('Token CSRF inválido');
        }
      }

      return response;
    } catch (error) {
      console.error('Erro na requisição CSRF:', error);
      throw error;
    }
  }, [currentToken, refreshToken, isProtected, user, toast]);

  const get = useCallback((url: string, options: RequestOptions = {}) => {
    return makeRequest(url, { ...options, method: 'GET' });
  }, [makeRequest]);

  const post = useCallback((url: string, data?: any, options: RequestOptions = {}) => {
    return makeRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [makeRequest]);

  const put = useCallback((url: string, data?: any, options: RequestOptions = {}) => {
    return makeRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }, [makeRequest]);

  const del = useCallback((url: string, options: RequestOptions = {}) => {
    return makeRequest(url, { ...options, method: 'DELETE' });
  }, [makeRequest]);

  return {
    makeRequest,
    get,
    post,
    put,
    delete: del,
    currentToken,
    isProtected
  };
};