import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { encryptSensitiveData, createDataChecksum } from '@/lib/encryption';
import { auditLogger } from '@/lib/audit';

interface BackupData {
  profile: any;
  children: any[];
  completions: any[];
  consents: any;
  created_at: string;
  checksum: string;
}

export const useDataBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Cria backup completo dos dados do usuário
   */
  const createBackup = useCallback(async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return null;
    }

    setIsBackingUp(true);
    
    try {
      // Busca todos os dados do usuário
      const [profileRes, childrenRes, completionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id),
        supabase
          .from('completions')
          .select('*')
          .in('child_id', 
            (await supabase.from('children').select('id').eq('user_id', user.id)).data?.map(c => c.id) || []
          ),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (childrenRes.error) throw childrenRes.error;
      if (completionsRes.error) throw completionsRes.error;

      // Busca consentimentos do localStorage
      const consents = localStorage.getItem('fonobot_consents');

      const backupData: BackupData = {
        profile: profileRes.data,
        children: childrenRes.data || [],
        completions: completionsRes.data || [],
        consents: consents ? JSON.parse(consents) : null,
        created_at: new Date().toISOString(),
        checksum: '', // Será calculado após stringificar
      };

      // Calcula checksum para integridade
      const dataString = JSON.stringify({
        profile: backupData.profile,
        children: backupData.children,
        completions: backupData.completions,
        consents: backupData.consents,
      });
      
      backupData.checksum = await createDataChecksum(dataString);

      // Criptografa o backup
      const encryptedBackup = await encryptSensitiveData(JSON.stringify(backupData));

      // Log de auditoria
      auditLogger.dataAccess(user.id, 'backup_created');

      toast({
        title: "Backup criado com sucesso",
        description: "Seus dados foram copiados com segurança",
      });

      return encryptedBackup;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      auditLogger.securityViolation(user.id, 'backup_failed', { error: errorMessage });
      
      toast({
        title: "Erro ao criar backup",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsBackingUp(false);
    }
  }, [user, toast]);

  /**
   * Faz download do backup como arquivo
   */
  const downloadBackup = useCallback(async () => {
    const backup = await createBackup();
    if (!backup) return;

    try {
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fonobot-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      auditLogger.dataAccess(user?.id || '', 'backup_downloaded');
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo de backup",
        variant: "destructive",
      });
    }
  }, [createBackup, user, toast]);

  /**
   * Valida se um backup é válido
   */
  const validateBackup = useCallback(async (backupString: string): Promise<BackupData | null> => {
    try {
      const backupData: BackupData = JSON.parse(backupString);
      
      // Verifica estrutura básica
      if (!backupData.profile || !Array.isArray(backupData.children) || !backupData.checksum) {
        throw new Error('Estrutura de backup inválida');
      }

      // Verifica integridade
      const dataString = JSON.stringify({
        profile: backupData.profile,
        children: backupData.children,
        completions: backupData.completions,
        consents: backupData.consents,
      });
      
      const calculatedChecksum = await createDataChecksum(dataString);
      
      if (calculatedChecksum !== backupData.checksum) {
        throw new Error('Backup corrompido - checksum inválido');
      }

      return backupData;
    } catch (error) {
      console.error('Erro na validação do backup:', error);
      return null;
    }
  }, []);

  /**
   * Exporta dados em formato CSV para relatórios
   */
  const exportToCSV = useCallback(async () => {
    if (!user) return;

    try {
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          *,
          completions(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      let csv = 'Nome da Criança,Idade,Trilha,Atividades Completadas,Data de Criação\n';
      
      children?.forEach(child => {
        const completedCount = child.completions?.length || 0;
        csv += `"${child.child_name}",${child.child_age},"${child.track_id}",${completedCount},"${new Date(child.created_at).toLocaleDateString('pt-BR')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `fonobot-relatorio-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      auditLogger.dataAccess(user.id, 'report_exported', { format: 'csv' });

      toast({
        title: "Relatório exportado",
        description: "Dados exportados em formato CSV",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  /**
   * Agenda backup automático
   */
  const scheduleAutoBackup = useCallback(() => {
    // Verifica se já existe um backup recente
    const lastBackup = localStorage.getItem('fonobot_last_backup');
    const now = new Date();
    
    if (lastBackup) {
      const lastBackupDate = new Date(lastBackup);
      const daysSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceBackup < 7) {
        // Backup muito recente, não precisa fazer outro
        return;
      }
    }

    // Agenda backup para executar em 30 segundos (não bloquear interface)
    setTimeout(async () => {
      const backup = await createBackup();
      if (backup) {
        localStorage.setItem('fonobot_last_backup', now.toISOString());
        localStorage.setItem('fonobot_auto_backup', backup);
      }
    }, 30000);
  }, [createBackup]);

  return {
    isBackingUp,
    isRestoring,
    createBackup,
    downloadBackup,
    validateBackup,
    exportToCSV,
    scheduleAutoBackup,
  };
};