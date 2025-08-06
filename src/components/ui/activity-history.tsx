import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, CheckCircle, Clock, Activity, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityCompletion {
  id: string;
  activity_id: string;
  completed_at: string;
  activity: {
    title: string;
    day_index: number;
    instructions: string;
  };
}

interface ActivityHistoryProps {
  childId: string;
  childName: string;
  className?: string;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'completed', label: 'Concluídas' }
] as const;

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  childId,
  childName,
  className
}) => {
  const [completions, setCompletions] = useState<ActivityCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'completed'>('all');

  useEffect(() => {
    fetchActivityHistory();
  }, [childId]);

  const fetchActivityHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('completions')
        .select(`
          id,
          activity_id,
          completed_at,
          activities:activity_id (
            title,
            day_index,
            instructions
          )
        `)
        .eq('child_id', childId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedData = (data || []).map(completion => ({
        id: completion.id,
        activity_id: completion.activity_id,
        completed_at: completion.completed_at,
        activity: completion.activities as any
      }));

      setCompletions(transformedData);
    } catch (error) {
      console.error('Error fetching activity history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompletions = useMemo(() => {
    const now = new Date();
    
    return completions.filter(completion => {
      const completedAt = parseISO(completion.completed_at);
      
      switch (filter) {
        case 'week':
          return completedAt >= startOfWeek(now, { locale: ptBR }) && 
                 completedAt <= endOfWeek(now, { locale: ptBR });
        case 'month':
          return completedAt.getMonth() === now.getMonth() && 
                 completedAt.getFullYear() === now.getFullYear();
        case 'completed':
          return true; // All are completed by definition
        default:
          return true;
      }
    });
  }, [completions, filter]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, ActivityCompletion[]> = {};
    
    filteredCompletions.forEach(completion => {
      const date = format(parseISO(completion.completed_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(completion);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredCompletions]);

  const stats = useMemo(() => {
    const total = completions.length;
    const thisWeek = completions.filter(c => {
      const completedAt = parseISO(c.completed_at);
      const now = new Date();
      return completedAt >= startOfWeek(now, { locale: ptBR }) && 
             completedAt <= endOfWeek(now, { locale: ptBR });
    }).length;
    
    const uniqueDays = new Set(
      completions.map(c => format(parseISO(c.completed_at), 'yyyy-MM-dd'))
    ).size;

    return { total, thisWeek, uniqueDays };
  }, [completions]);

  const exportHistory = () => {
    const csv = [
      ['Data', 'Atividade', 'Dia', 'Descrição'],
      ...completions.map(completion => [
        format(parseISO(completion.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        completion.activity.title,
        `Dia ${completion.activity.day_index}`,
        completion.activity.instructions
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-${childName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Carregando histórico...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Histórico de Atividades - {childName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              disabled={completions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.total}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.thisWeek}
            </div>
            <div className="text-xs text-muted-foreground">Esta Semana</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {stats.uniqueDays}
            </div>
            <div className="text-xs text-muted-foreground">Dias Ativos</div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(option => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              <Filter className="w-3 h-3 mr-1" />
              {option.label}
            </Button>
          ))}
        </div>

        {/* Activity History */}
        <ScrollArea className="h-96">
          {groupedByDate.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma atividade encontrada</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Ainda não há atividades concluídas para esta criança.'
                  : 'Nenhuma atividade encontrada para o filtro selecionado.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDate.map(([date, dayCompletions]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">
                      {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {dayCompletions.length} atividade{dayCompletions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 ml-6">
                    {dayCompletions.map((completion) => (
                      <div
                        key={completion.id}
                        className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <h5 className="font-medium text-sm">
                                {completion.activity.title}
                              </h5>
                              <Badge variant="outline" className="text-xs">
                                Dia {completion.activity.day_index}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {completion.activity.instructions}
                            </p>
                            <div className="text-xs text-green-600">
                              Concluída às {format(parseISO(completion.completed_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {groupedByDate[groupedByDate.length - 1][0] !== date && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};