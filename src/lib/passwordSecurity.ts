/**
 * Validação de segurança de senhas e proteção contra senhas vazadas
 */
import { logAuditEvent } from './audit';

export interface PasswordStrengthResult {
  score: number;
  isStrong: boolean;
  feedback: string[];
  estimatedCrackTime: string;
}

/**
 * Lista de senhas comuns vazadas (exemplo reduzido)
 * Em produção, isso seria verificado via API ou banco de dados
 */
const COMMON_PASSWORDS = [
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', '1234567890', 'qwerty', 'abc123', 'million2',
  '000000', '1234', 'iloveyou', 'aaron431', 'password1',
  'qqww1122', '123', 'omgpop', '123321', '654321'
];

/**
 * Padrões comuns que reduzem a segurança
 */
const WEAK_PATTERNS = [
  /^(.)\1+$/, // Caracteres repetidos
  /1234|2345|3456|4567|5678|6789|7890/, // Sequências numéricas
  /abcd|bcde|cdef|defg|efgh|fghi|ghij/, // Sequências alfabéticas
  /qwer|wert|erty|rtyu|tyui|yuio|uiop/, // Padrões de teclado
  /asdf|sdfg|dfgh|fghj|ghjk|hjkl/, // Padrões de teclado
  /zxcv|xcvb|cvbn|vbnm/ // Padrões de teclado
];

/**
 * Palavras comuns em português que são fracas
 */
const COMMON_WORDS = [
  'senha', 'usuario', 'admin', 'administrador', 'brasil', 'amor',
  'casa', 'vida', 'deus', 'familia', 'trabalho', 'dinheiro',
  'feliz', 'sempre', 'obrigado', 'parabens', 'saudade'
];

/**
 * Verifica se a senha está na lista de senhas vazadas conhecidas
 */
export const checkBreachedPassword = async (password: string): Promise<boolean> => {
  try {
    // Primeiro verifica lista local de senhas comuns
    const lowercasePassword = password.toLowerCase();
    
    if (COMMON_PASSWORDS.includes(lowercasePassword)) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'breached_password_detected',
          type: 'common_password',
          passwordLength: password.length
        },
        success: false,
        risk_level: 'high'
      });
      return true;
    }

    // Verifica palavras comuns
    if (COMMON_WORDS.some(word => lowercasePassword.includes(word))) {
      await logAuditEvent({
        event_type: 'security_violation',
        details: { 
          action: 'weak_password_detected',
          type: 'common_word',
          passwordLength: password.length
        },
        success: false,
        risk_level: 'medium'
      });
      return true;
    }

    // Em produção, aqui você faria uma verificação via API como HaveIBeenPwned
    // usando hash SHA-1 da senha para não expor a senha em texto claro
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar senha vazada:', error);
    return false;
  }
};

/**
 * Calcula a força da senha com feedback detalhado
 */
export const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const feedback: string[] = [];
  
  // Critérios básicos
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use pelo menos 8 caracteres');
  }

  if (password.length >= 12) {
    score += 1;
  } else if (password.length >= 8) {
    feedback.push('Considere usar 12+ caracteres para maior segurança');
  }

  // Complexidade
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua letras minúsculas');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua letras maiúsculas');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua números');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Inclua símbolos especiais (!@#$%^&*)');
  }

  // Penaliza padrões fracos
  for (const pattern of WEAK_PATTERNS) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push('Evite padrões sequenciais ou repetitivos');
      break;
    }
  }

  // Bônus para senha muito longa
  if (password.length >= 16) {
    score += 1;
  }

  // Bônus para diversidade de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 1;
  }

  // Estimativa de tempo para quebrar
  let crackTime = '';
  if (score <= 2) {
    crackTime = 'Segundos a minutos';
  } else if (score <= 4) {
    crackTime = 'Horas a dias';
  } else if (score <= 6) {
    crackTime = 'Meses a anos';
  } else {
    crackTime = 'Séculos';
  }

  const isStrong = score >= 5 && feedback.length === 0;

  return {
    score: Math.min(8, score), // Máximo 8
    isStrong,
    feedback,
    estimatedCrackTime: crackTime
  };
};

/**
 * Valida senha completa (força + vazamentos)
 */
export const validatePasswordSecurity = async (password: string): Promise<{
  isValid: boolean;
  strength: PasswordStrengthResult;
  isBreached: boolean;
  errors: string[];
}> => {
  const strength = calculatePasswordStrength(password);
  const isBreached = await checkBreachedPassword(password);
  
  const errors: string[] = [];
  
  if (isBreached) {
    errors.push('Esta senha foi encontrada em vazamentos de dados. Por favor, escolha outra.');
  }
  
  if (!strength.isStrong) {
    errors.push(...strength.feedback);
  }

  const isValid = !isBreached && strength.isStrong;

  // Log da tentativa de validação
  await logAuditEvent({
    event_type: 'data_access',
    details: { 
      action: 'password_validation',
      score: strength.score,
      isBreached,
      isValid,
      passwordLength: password.length
    },
    success: isValid,
    risk_level: isValid ? 'low' : 'medium'
  });

  return {
    isValid,
    strength,
    isBreached,
    errors
  };
};

/**
 * Gera sugestão de senha forte
 */
export const generateStrongPassword = (length: number = 16): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Garante pelo menos um de cada tipo
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Completa o resto aleatoriamente
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralha a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};