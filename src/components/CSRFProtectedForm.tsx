/**
 * Componente wrapper para formulários com proteção CSRF
 */

import { useCSRF } from '@/contexts/CSRFContext';
import { FormEvent, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CSRFProtectedFormProps {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>, csrfToken: string) => void | Promise<void>;
  className?: string;
  validateOnSubmit?: boolean;
}

export const CSRFProtectedForm = ({ 
  children, 
  onSubmit, 
  className,
  validateOnSubmit = true 
}: CSRFProtectedFormProps) => {
  const { currentToken, refreshToken, validateToken, isProtected } = useCSRF();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isProtected) {
      toast({
        variant: "destructive",
        title: "Erro de Segurança",
        description: "Proteção CSRF não está ativa. Faça login novamente."
      });
      return;
    }

    if (!currentToken) {
      toast({
        variant: "destructive",
        title: "Erro de Segurança",
        description: "Token CSRF não encontrado. Atualizando..."
      });
      refreshToken();
      return;
    }

    // Validar token antes de enviar (opcional)
    if (validateOnSubmit && !validateToken(currentToken)) {
      toast({
        variant: "destructive",
        title: "Erro de Segurança",
        description: "Token CSRF inválido. Gerando novo token..."
      });
      refreshToken();
      return;
    }

    try {
      await onSubmit(event, currentToken);
      // Gerar novo token após envio bem-sucedido
      refreshToken();
    } catch (error) {
      console.error('Erro no envio do formulário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário."
      });
    }
  }, [currentToken, isProtected, validateOnSubmit, onSubmit, refreshToken, validateToken, toast]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Campo oculto com token CSRF */}
      {currentToken && (
        <input
          type="hidden"
          name="csrf_token"
          value={currentToken}
          readOnly
        />
      )}
      {children}
    </form>
  );
};