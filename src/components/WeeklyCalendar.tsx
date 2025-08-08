import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, Star } from 'lucide-react';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyActivity {
  id: string;
  title: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'video' | 'exercise' | 'game';
}

interface DayData {
  date: Date;
  activities: WeeklyActivity[];
  completionRate: number;
}

interface WeeklyCalendarProps {
  childId?: string;
  className?: string;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  childId, 
  className = "" 
}) => {
  // Mock data - replace with real data fetching
  const weekData = useMemo((): DayData[] => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const activities: WeeklyActivity[] = [
        {
          id: `${index}-1`,
          title: 'Exercício de Respiração',
          completed: index < 3,
          difficulty: 'easy',
          type: 'exercise'
        },
        {
          id: `${index}-2`,
          title: 'Vídeo Interativo',
          completed: index < 2,
          difficulty: 'medium',
          type: 'video'
        },
        {
          id: `${index}-3`,
          title: 'Jogo da Memória Sonora',
          completed: index < 1,
          difficulty: 'hard',
          type: 'game'
        }
      ];
      
      const completedCount = activities.filter(a => a.completed).length;
      const completionRate = (completedCount / activities.length) * 100;
      
      return {
        date,
        activities,
        completionRate
      };
    });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'exercise': return '🏃';
      case 'game': return '🎮';
      default: return '📝';
    }
  };

  return (
    <Card className={`${className} bg-gradient-to-br from-background to-muted/30`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Agenda Semanal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => {
            const isCurrentDay = isToday(day.date);
            const dayName = format(day.date, 'E', { locale: ptBR });
            const dayNumber = format(day.date, 'd');
            
            return (
              <div
                key={index}
                className={`
                  p-3 rounded-lg border transition-all duration-200 hover:shadow-md
                  ${isCurrentDay 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-background hover:border-primary/50'
                  }
                `}
              >
                <div className="text-center mb-2">
                  <div className={`text-xs font-medium uppercase tracking-wide ${
                    isCurrentDay ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {dayName}
                  </div>
                  <div className={`text-lg font-bold ${
                    isCurrentDay ? 'text-primary' : 'text-foreground'
                  }`}>
                    {dayNumber}
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress 
                    value={day.completionRate} 
                    className="h-1.5"
                  />
                  
                  <div className="space-y-1">
                    {day.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`
                          flex items-center gap-1 p-1.5 rounded text-xs
                          ${activity.completed 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-muted border border-border'
                          }
                        `}
                      >
                        <span className="text-xs">
                          {getTypeIcon(activity.type)}
                        </span>
                        {activity.completed && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                        {!activity.completed && (
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>

                  {isCurrentDay && (
                    <Badge variant="default" className="w-full justify-center text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Hoje
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da Semana</span>
            <span className="font-medium">
              {Math.round(weekData.reduce((acc, day) => acc + day.completionRate, 0) / 7)}%
            </span>
          </div>
          <Progress 
            value={weekData.reduce((acc, day) => acc + day.completionRate, 0) / 7} 
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};