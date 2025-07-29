/**
 * Componente para executar migração do localStorage automaticamente
 */

import { useLocalStorageMigration } from '@/hooks/useLocalStorageMigration';

export const LocalStorageMigration = () => {
  useLocalStorageMigration();
  
  // Componente não renderiza nada - apenas executa a migração
  return null;
};