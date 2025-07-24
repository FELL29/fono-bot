import { useMemo } from 'react';
import { z } from 'zod';
import { sanitizeObject } from '@/lib/sanitize';
import { checkFormSubmissionRate } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: T | null;
}

export const useSecureValidation = <T>(schema: z.ZodSchema<T>) => {
  const { toast } = useToast();

  const validate = useMemo(() => {
    return (data: unknown, formType?: string): ValidationResult<T> => {
      try {
        // Check rate limiting if form type provided
        if (formType && !checkFormSubmissionRate(formType)) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive",
          });
          return {
            isValid: false,
            errors: { _general: 'Rate limit exceeded' },
            sanitizedData: null
          };
        }

        // Sanitize input data first
        const sanitizedInput = sanitizeObject(data as Record<string, any>);
        
        // Validate with Zod
        const result = schema.safeParse(sanitizedInput);
        
        if (result.success) {
          return {
            isValid: true,
            errors: {},
            sanitizedData: result.data
          };
        } else {
          // Transform Zod errors to friendly format
          const errors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
          });
          
          return {
            isValid: false,
            errors,
            sanitizedData: null
          };
        }
      } catch (error) {
        console.error('Validation error:', error);
        return {
          isValid: false,
          errors: { _general: 'Erro interno de validação' },
          sanitizedData: null
        };
      }
    };
  }, [schema, toast]);

  const validateField = useMemo(() => {
    return (fieldName: string, value: unknown): { isValid: boolean; error?: string } => {
      try {
        // Simple field validation using the full schema
        const result = schema.safeParse({ [fieldName]: value });
        
        if (result.success) {
          return { isValid: true };
        } else {
          const fieldError = result.error.issues.find(issue => 
            issue.path.includes(fieldName)
          );
          return { 
            isValid: false, 
            error: fieldError?.message || 'Campo inválido' 
          };
        }
      } catch (error) {
        return { 
          isValid: false, 
          error: 'Erro de validação' 
        };
      }
    };
  }, [schema]);

  return {
    validate,
    validateField
  };
};