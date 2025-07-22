import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const fetchChildren = async () => {
    if (!user) return;

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
  };

  const deleteChild = async (childId: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);

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
  };

  const calculateProgress = async (child: Child): Promise<number> => {
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
      console.error('Erro ao calcular progresso:', error);
      return 0;
    }
  };

  const getTodayActivities = async (child: Child): Promise<Activity[]> => {
    try {
      const daysSinceStart = Math.floor(
        (Date.now() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('track_id', child.track_id)
        .eq('day_index', daysSinceStart)
        .order('created_at');

      if (error) throw error;
      return activities || [];
    } catch (error) {
      console.error('Erro ao buscar atividades do dia:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

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