import DOMPurify from 'dompurify';

/**
 * Sanitiza strings para prevenir XSS e outros ataques
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove tags HTML e scripts maliciosos
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Remove caracteres perigosos adicionais
  return sanitized
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitiza objeto com múltiplas strings
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj } as any;
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    }
  });
  
  return sanitized;
};

/**
 * Sanitiza nome (permite apenas letras, espaços e acentos)
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, '') // Permite apenas letras e espaços
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim()
    .slice(0, 100); // Limita tamanho
};

/**
 * Sanitiza email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '') // Permite apenas caracteres válidos de email
    .slice(0, 255); // Limita tamanho
};

/**
 * Sanitiza número de telefone
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^0-9+]/g, '') // Permite apenas números e +
    .slice(0, 20); // Limita tamanho
};

/**
 * Sanitiza idade (garante que seja um número válido)
 */
export const sanitizeAge = (age: string | number): number => {
  const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
  
  if (isNaN(numAge) || numAge < 1 || numAge > 150) {
    throw new Error('Idade inválida');
  }
  
  return numAge;
};

/**
 * Sanitiza texto longo (descrições, comentários)
 */
export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (!text || typeof text !== 'string') return '';
  
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
};