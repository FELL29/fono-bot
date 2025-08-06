import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressTrail } from './progress-trail';
import { Calendar, Target, TrendingUp } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  day_index: number;
  isCompleted?: boolean;
}

interface ActivityProgressTrailProps {
  activities: Activity[];
  completedActivities: string[];
  currentDay: number;
  childName: string;
  className?: string;
}

export const ActivityProgressTrail: React.FC<ActivityProgressTrailProps> = ({
  activities,
  completedActivities,
  currentDay,
  childName,
  className
}) => {
  const trailSteps = useMemo(() => {
    // Group activities by day and create trail steps
    const activitiesGroupedByDay = activities.reduce((acc, activity) => {
      const day = activity.day_index || 1;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(activity);
      return acc;
    }, {} as Record<number, Activity[]>);

    // Create steps for the trail (showing next 10 days from current)
    const steps = [];
    const maxDay = Math.max(...Object.keys(activitiesGroupedByDay).map(Number));
    const startDay = Math.max(1, currentDay - 2);
    const endDay = Math.min(maxDay, startDay + 9);

    for (let day = startDay; day <= endDay; day++) {
      const dayActivities = activitiesGroupedByDay[day] || [];
      const completedCount = dayActivities.filter(activity => 
        completedActivities.includes(activity.id)
      ).length;
      
      const isCompleted = dayActivities.length > 0 && completedCount === dayActivities.length;
      const isCurrent = day === currentDay;
      const isLocked = day > currentDay;
      
      steps.push({
        id: `day-${day}`,
        title: dayActivities.length > 0 ? dayActivities[0].title : `Dia ${day}`,
        day,
        isCompleted,
        isCurrent,
        isLocked
      });
    }

    return steps;
  }, [activities, completedActivities, currentDay]);

  const completionStats = useMemo(() => {
    const totalCompleted = completedActivities.length;
    const totalActivities = activities.length;
    const percentage = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
    
    return { totalCompleted, totalActivities, percentage };
  }, [activities, completedActivities]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Trilha de Progresso - {childName}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {completionStats.percentage}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {completionStats.totalCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Concluídas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {currentDay}
            </div>
            <div className="text-xs text-muted-foreground">Dia Atual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {completionStats.totalActivities}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Progress Trail */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Progresso dos Próximos Dias
          </div>
          
          <ProgressTrail 
            steps={trailSteps}
            orientation="horizontal"
            showDayNumbers={true}
            className="p-4 bg-gradient-to-r from-background to-muted/20 rounded-lg border"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            Concluído
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            Atual
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted"></div>
            Bloqueado
          </div>
        </div>
      </CardContent>
    </Card>
  );
};