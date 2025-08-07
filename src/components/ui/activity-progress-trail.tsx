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
        <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl border border-primary/20 shadow-lg">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <div className="text-2xl font-bold text-white">
                {completionStats.totalCompleted}
              </div>
            </div>
            <div className="text-sm font-bold text-green-600">🎉 Concluídas</div>
            <div className="text-xs text-muted-foreground">Atividades realizadas</div>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 animate-pulse">
              <div className="text-2xl font-bold text-white">
                {currentDay}
              </div>
            </div>
            <div className="text-sm font-bold text-blue-600">🚀 Dia Atual</div>
            <div className="text-xs text-muted-foreground">Onde você está</div>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
              <div className="text-2xl font-bold text-white">
                {completionStats.totalActivities}
              </div>
            </div>
            <div className="text-sm font-bold text-purple-600">⭐ Total</div>
            <div className="text-xs text-muted-foreground">Meta completa</div>
          </div>
        </div>

        {/* Progress Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Calendar className="w-5 h-5" />
              🗺️ Jornada de Aventuras
            </div>
            <div className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              {Math.round((completionStats.totalCompleted / Math.max(currentDay, 1)) * 100)}% progresso
            </div>
          </div>
          
          <ProgressTrail 
            steps={trailSteps}
            orientation="horizontal"
            showDayNumbers={true}
            className="shadow-lg"
          />
        </div>

        {/* Enhanced Legend */}
        <div className="flex flex-wrap justify-center gap-6 p-4 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-lg border border-secondary/20">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 shadow-md"></div>
            <span className="text-green-600">🎉 Concluído</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-md animate-pulse"></div>
            <span className="text-blue-600">🚀 Atual</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 shadow-md"></div>
            <span className="text-gray-600">🔒 Bloqueado</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-md"></div>
            <span className="text-orange-600">⭐ Disponível</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};