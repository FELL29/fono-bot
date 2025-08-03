import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { checkDataFetchRate } from '@/lib/security';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  user_id: string;
}

interface Activity {
  id: string;
  title: string;
  instructions: string;
  day_index: number;
}

export const useOptimizedChildren = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query otimizada para crianças
  const {
    data: children = [],
    isLoading,
    error,
    refetch: fetchChildren
  } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Rate limiting check
      if (!checkDataFetchRate('children')) {
        throw new Error('Too many requests. Please wait before trying again.');
      }

      const startTime = performance.now();

      const { data, error } = await supabase
        .from('children')
        .select('id, child_name, child_age, track_id, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const duration = performance.now() - startTime;
      logger.performance('fetch_children', duration, {
        userId: user.id,
        component: 'useOptimizedChildren'
      });

      if (error) {
        logger.error('Failed to fetch children', {
          userId: user.id,
          component: 'useOptimizedChildren',
          action: 'fetch_children'
        }, error);
        throw error;
      }

      logger.trackData('children_fetched', user.id, {
        count: data?.length || 0
      });

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Função otimizada para deletar criança
  const deleteChild = useCallback(async (childId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const startTime = performance.now();

      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('user_id', user.id);

      const duration = performance.now() - startTime;
      logger.performance('delete_child', duration, {
        userId: user.id,
        component: 'useOptimizedChildren'
      });

      if (error) {
        logger.error('Failed to delete child', {
          userId: user.id,
          component: 'useOptimizedChildren',
          action: 'delete_child',
          metadata: { childId }
        }, error);
        throw error;
      }

      // Invalidate and refetch children
      queryClient.invalidateQueries({ queryKey: ['children', user.id] });

      logger.trackData('child_deleted', user.id, { childId });

      toast({
        title: "Criança removida",
        description: "A criança foi removida com sucesso.",
      });
    } catch (error) {
      logger.error('Error deleting child', {
        userId: user.id,
        component: 'useOptimizedChildren',
        action: 'delete_child_error'
      }, error instanceof Error ? error : new Error('Unknown error'));

      toast({
        title: "Erro ao remover criança",
        description: "Ocorreu um erro ao tentar remover a criança. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user?.id, queryClient, toast]);

  // Cálculo de progresso memoizado
  const calculateProgress = useCallback(async (child: Child): Promise<number> => {
    try {
      if (!checkDataFetchRate(`progress-${child.id}`)) {
        return 0;
      }

      const startTime = performance.now();

      const [activitiesResponse, completionsResponse] = await Promise.all([
        supabase
          .from('activities')
          .select('id')
          .eq('track_id', child.track_id),
        supabase
          .from('completions')
          .select('id')
          .eq('child_id', child.id)
      ]);

      const duration = performance.now() - startTime;
      logger.performance('calculate_progress', duration, {
        userId: user?.id,
        component: 'useOptimizedChildren'
      });

      const totalActivities = activitiesResponse.data?.length || 0;
      const completedActivities = completionsResponse.data?.length || 0;

      return totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
    } catch (error) {
      logger.error('Error calculating progress', {
        userId: user?.id,
        component: 'useOptimizedChildren',
        action: 'calculate_progress',
        metadata: { childId: child.id }
      }, error instanceof Error ? error : new Error('Unknown error'));
      return 0;
    }
  }, [user?.id]);

  // Atividades do dia otimizadas
  const getTodayActivities = useCallback(async (child: Child): Promise<Activity[]> => {
    try {
      if (!checkDataFetchRate(`activities-${child.id}`)) {
        return [];
      }

      const startTime = performance.now();

      // Usar cache se disponível
      const cacheKey = ['todayActivities', child.id, new Date().toDateString()];
      const cached = queryClient.getQueryData(cacheKey);
      if (cached) {
        return cached as Activity[];
      }

      const createdAt = new Date(child.created_at || Date.now());
      const today = new Date();
      const timeDiff = today.getTime() - createdAt.getTime();
      const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));

      const { data: maxDayData } = await supabase
        .from('activities')
        .select('day_index')
        .eq('track_id', child.track_id)
        .order('day_index', { ascending: false })
        .limit(1);

      const maxDay = maxDayData?.[0]?.day_index ?? 5;
      const cyclicDay = (daysSinceStart % maxDay) + 1;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('id, title, instructions, day_index')
        .eq('track_id', child.track_id)
        .eq('day_index', cyclicDay)
        .order('created_at');

      const duration = performance.now() - startTime;
      logger.performance('get_today_activities', duration, {
        userId: user?.id,
        component: 'useOptimizedChildren'
      });

      if (error) {
        throw error;
      }

      const result = activities || [];
      
      // Cache result for today
      queryClient.setQueryData(cacheKey, result, {
        updatedAt: Date.now()
      });

      return result;
    } catch (error) {
      logger.error('Error fetching today activities', {
        userId: user?.id,
        component: 'useOptimizedChildren',
        action: 'get_today_activities',
        metadata: { childId: child.id }
      }, error instanceof Error ? error : new Error('Unknown error'));
      return [];
    }
  }, [user?.id, queryClient]);

  // Memoize values to prevent unnecessary re-renders
  const memoizedValues = useMemo(() => ({
    children,
    isLoading,
    error,
    fetchChildren,
    deleteChild,
    calculateProgress,
    getTodayActivities
  }), [children, isLoading, error, fetchChildren, deleteChild, calculateProgress, getTodayActivities]);

  return memoizedValues;
};