/**
 * Hook para migração segura do localStorage
 * Remove dados sensíveis e migra para formato seguro
 */

import { useEffect } from 'react';
import { auditLogger } from '@/lib/audit';
import { useAuth } from '@/contexts/AuthContext';

interface MigrationRule {
  key: string;
  action: 'remove' | 'encrypt' | 'sanitize';
  reason: string;
}

const MIGRATION_RULES: MigrationRule[] = [
  {
    key: 'sb-odqusjfkoysubywazqnq-auth-token',
    action: 'remove',
    reason: 'Token de autenticação deve ser gerenciado pelo Supabase'
  },
  {
    key: 'password',
    action: 'remove',
    reason: 'Senhas não devem ser armazenadas no localStorage'
  },
  {
    key: 'auth_token',
    action: 'remove',
    reason: 'Tokens de autenticação são sensíveis'
  },
  {
    key: 'user_credentials',
    action: 'remove',
    reason: 'Credenciais do usuário são sensíveis'
  },
  {
    key: 'api_key',
    action: 'remove',
    reason: 'Chaves de API são sensíveis'
  }
];

export const useLocalStorageMigration = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Executar migração apenas uma vez por sessão
    const migrationKey = 'fonobot_localStorage_migration_v1';
    const migrationCompleted = sessionStorage.getItem(migrationKey);

    if (migrationCompleted) return;

    performMigration();
    sessionStorage.setItem(migrationKey, 'completed');
  }, []);

  const performMigration = () => {
    let migratedCount = 0;
    let removedKeys: string[] = [];

    try {
      // Verificar todas as chaves do localStorage
      const allKeys = Object.keys(localStorage);

      for (const storageKey of allKeys) {
        // Aplicar regras de migração
        for (const rule of MIGRATION_RULES) {
          if (storageKey.includes(rule.key) || storageKey === rule.key) {
            switch (rule.action) {
              case 'remove':
                localStorage.removeItem(storageKey);
                removedKeys.push(storageKey);
                migratedCount++;
                break;
              
              case 'sanitize':
                try {
                  const value = localStorage.getItem(storageKey);
                  if (value) {
                    const sanitized = sanitizeData(value);
                    localStorage.setItem(storageKey, sanitized);
                    migratedCount++;
                  }
                } catch (error) {
                  console.warn(`Erro ao sanitizar ${storageKey}:`, error);
                }
                break;
            }
            break; // Parar após aplicar a primeira regra correspondente
          }
        }
      }

      // Migrar dados específicos da aplicação
      migrateAppSpecificData();

      // Log da migração
      if (user && migratedCount > 0) {
        auditLogger.dataAccess(user.id, 'localStorage_migration_completed', 
          `${migratedCount} itens migrados, ${removedKeys.length} chaves removidas`
        );
      }

    } catch (error) {
      
      if (user) {
        auditLogger.dataAccess(user.id, 'localStorage_migration_failed', 
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
      }
    }
  };

  const migrateAppSpecificData = () => {
    // Migrar dados específicos do FonoBot
    const oldUserData = localStorage.getItem('user_data');
    if (oldUserData) {
      try {
        const userData = JSON.parse(oldUserData);
        
        // Remover campos sensíveis
        const { password, token, apiKey, ...safeData } = userData;
        
        // Salvar dados seguros
        if (Object.keys(safeData).length > 0) {
          localStorage.setItem('fonobot_user_preferences', JSON.stringify(safeData));
        }
        
        // Remover dados antigos
        localStorage.removeItem('user_data');
      } catch (error) {
        console.warn('Erro ao migrar user_data:', error);
        localStorage.removeItem('user_data');
      }
    }

    // Migrar configurações de consentimento
    const oldConsent = localStorage.getItem('consent');
    if (oldConsent) {
      const newKey = 'fonobot_user_consent';
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldConsent);
      }
      localStorage.removeItem('consent');
    }

    // Migrar preferências de tema
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme) {
      const newKey = 'fonobot_theme_preference';
      if (!localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldTheme);
      }
      localStorage.removeItem('theme');
    }
  };

  const sanitizeData = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      
      // Remover campos sensíveis de objetos
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'key', 'auth'];
      
      const sanitized = { ...parsed };
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          delete sanitized[field];
        }
      });
      
      return JSON.stringify(sanitized);
    } catch {
      // Se não for JSON, retornar como está (pode ser string simples)
      return data;
    }
  };

  return {
    performMigration
  };
};