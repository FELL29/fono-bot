import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { checkDataFetchRate, isValidUUID } from '@/lib/security';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  created_at: string;
  user_id: string;
}

interface Activity {
  id: string;
  title: string;
  instructions: string;
  day_index: number;
}

export const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChildren = useCallback(async () => {
    if (!user) return;

    // Check rate limiting
    if (!checkDataFetchRate('children')) {
      toast({
        title: "Muitas solicitações",
        description: "Aguarde antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    // Validate user ID
    if (!isValidUUID(user.id)) {
      toast({
        title: "Erro de autenticação",
        description: "ID de usuário inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setChildren(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar crianças';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteChild = useCallback(async (childId: string) => {
    if (!user) return;

    // Validate IDs
    if (!isValidUUID(childId) || !isValidUUID(user.id)) {
      toast({
        title: "Erro",
        description: "IDs inválidos fornecidos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('user_id', user.id);

      if (error) throw error;

      setChildren(prev => prev.filter(child => child.id !== childId));
      
      toast({
        title: "Sucesso",
        description: "Criança removida com sucesso",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover criança';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const calculateProgress = useCallback(async (child: Child): Promise<number> => {
    try {
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', child.track_id);

      const { count: completedActivities } = await supabase
        .from('completions')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', child.id);

      if (!totalActivities) return 0;
      return Math.round((completedActivities || 0) / totalActivities * 100);
    } catch (error) {
      return 0;
    }
  }, []);

  const getTodayActivities = useCallback(async (child: Child): Promise<Activity[]> => {
    try {
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Primeiro, verificar o número máximo de dias disponíveis para este track
      const { data: maxDayData } = await supabase
        .from('activities')
        .select('day_index')
        .eq('track_id', child.track_id)
        .order('day_index', { ascending: false })
        .limit(1);

      const maxDay = maxDayData?.[0]?.day_index ?? 5; // Fallback para 5 se não encontrar
      
      // Implementar sistema cíclico: se passou do último dia, volta ao início
      // O day_index no banco vai de 1 a 5, então precisamos ajustar o cálculo
      const cyclicDay = (daysSinceStart % maxDay) + 1;

      console.log(`Child: ${child.child_name}, Days since start: ${daysSinceStart}, Max day: ${maxDay}, Cyclic day: ${cyclicDay}`);

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('track_id', child.track_id)
        .eq('day_index', cyclicDay)
        .order('created_at');

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      console.log(`Found ${activities?.length || 0} activities for day ${cyclicDay}`);
      return activities || [];
    } catch (error) {
      console.error('Error in getTodayActivities:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return {
    children,
    loading,
    error,
    fetchChildren,
    deleteChild,
    calculateProgress,
    getTodayActivities
  };
};