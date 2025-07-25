/**
 * Biblioteca de criptografia para dados sensíveis
 * Usa AES-GCM para criptografia simétrica segura
 */

// Chave de criptografia base (em produção, deve vir de variável de ambiente)
const ENCRYPTION_KEY_BASE = 'fonobot-security-key-2024';

/**
 * Gera uma chave de criptografia a partir de uma string
 */
async function generateKey(keyMaterial: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyMaterial);
  
  // Hash da chave para ter tamanho consistente
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyBytes);
  
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Criptografa dados sensíveis
 */
export async function encryptSensitiveData(data: string, userKey?: string): Promise<string> {
  try {
    const key = await generateKey(userKey || ENCRYPTION_KEY_BASE);
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    
    // Gera IV aleatório
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Criptografa os dados
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    );
    
    // Combina IV + dados criptografados
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Converte para base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Erro na criptografia:', error);
    throw new Error('Falha na criptografia dos dados');
  }
}

/**
 * Descriptografa dados sensíveis
 */
export async function decryptSensitiveData(encryptedData: string, userKey?: string): Promise<string> {
  try {
    const key = await generateKey(userKey || ENCRYPTION_KEY_BASE);
    
    // Decodifica de base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    
    // Separa IV dos dados
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Descriptografa
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    throw new Error('Falha na descriptografia dos dados');
  }
}

/**
 * Hash seguro para senhas (usando PBKDF2)
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  // Gera salt se não fornecido
  const saltBytes = salt 
    ? encoder.encode(salt)
    : crypto.getRandomValues(new Uint8Array(16));
  
  // Importa a senha como chave
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Deriva a chave com PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000, // 100k iterações
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits
  );
  
  const hashArray = new Uint8Array(hashBuffer);
  const saltArray = new Uint8Array(saltBytes);
  
  return {
    hash: btoa(String.fromCharCode(...hashArray)),
    salt: btoa(String.fromCharCode(...saltArray))
  };
}

/**
 * Verifica senha contra hash
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const saltBytes = atob(salt);
    const { hash: newHash } = await hashPassword(password, saltBytes);
    return newHash === hash;
  } catch (error) {
    console.error('Erro na verificação de senha:', error);
    return false;
  }
}

/**
 * Gera token seguro para sessões
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/]/g, '')
    .substring(0, length);
}

/**
 * Mascarar dados sensíveis para logs
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const middle = '*'.repeat(data.length - (visibleChars * 2));
  
  return `${start}${middle}${end}`;
}

/**
 * Validar integridade de dados
 */
export async function createDataChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * Verificar integridade de dados
 */
export async function verifyDataChecksum(data: string, checksum: string): Promise<boolean> {
  try {
    const newChecksum = await createDataChecksum(data);
    return newChecksum === checksum;
  } catch (error) {
    console.error('Erro na verificação de integridade:', error);
    return false;
  }
}