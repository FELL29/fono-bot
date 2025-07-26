/**
 * Sistema de backup automático integrado
 */

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataBackup } from '@/hooks/useDataBackup';
import { auditLogger } from '@/lib/audit';

export const BackupService = () => {
  const { user } = useAuth();
  const { scheduleAutoBackup } = useDataBackup();

  useEffect(() => {
    if (!user) return;

    // Agendar backup automático na primeira vez que o usuário entra
    const lastAutoBackup = localStorage.getItem('fonobot_last_auto_backup');
    const now = new Date();

    if (!lastAutoBackup) {
      // Primeira vez - agendar backup em 5 minutos
      const timer = setTimeout(() => {
        scheduleAutoBackup();
        localStorage.setItem('fonobot_last_auto_backup', now.toISOString());
        auditLogger.dataAccess(user.id, 'auto_backup_created');
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearTimeout(timer);
    } else {
      // Verificar se precisa fazer backup (a cada 7 dias)
      const lastBackupDate = new Date(lastAutoBackup);
      const daysSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceBackup >= 7) {
        scheduleAutoBackup();
        localStorage.setItem('fonobot_last_auto_backup', now.toISOString());
        auditLogger.dataAccess(user.id, 'auto_backup_created');
      }
    }
  }, [user, scheduleAutoBackup]);

  // Componente não renderiza nada - apenas gerencia backups
  return null;
};