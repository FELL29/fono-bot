import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Award, 
  Calendar,
  TrendingUp,
  Zap,
  Crown,
  Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfWeek, isToday, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GamificationData {
  totalPoints: number;
  level: number;
  streak: number;
  achievements: Achievement[];
  weeklyProgress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'streak' | 'total' | 'weekly' | 'milestone';
  requirement: number;
  points: number;
  achieved: boolean;
  achievedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationSystemProps {
  childId: string;
  childName: string;
  className?: string;
}

const ACHIEVEMENTS_CONFIG: Omit<Achievement, 'achieved' | 'achievedAt'>[] = [
  {
    id: 'first_activity',
    title: 'Primeiro Passo',
    description: 'Complete sua primeira atividade',
    icon: <Star className="w-4 h-4" />,
    type: 'milestone',
    requirement: 1,
    points: 10,
    rarity: 'common'
  },
  {
    id: 'streak_3',
    title: 'Perseverança',
    description: 'Complete atividades por 3 dias consecutivos',
    icon: <Flame className="w-4 h-4" />,
    type: 'streak',
    requirement: 3,
    points: 25,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    title: 'Dedicação',
    description: 'Complete atividades por 7 dias consecutivos',
    icon: <Flame className="w-4 h-4" />,
    type: 'streak',
    requirement: 7,
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'total_10',
    title: 'Explorador',
    description: 'Complete 10 atividades',
    icon: <Target className="w-4 h-4" />,
    type: 'total',
    requirement: 10,
    points: 30,
    rarity: 'common'
  },
  {
    id: 'total_25',
    title: 'Aventureiro',
    description: 'Complete 25 atividades',
    icon: <Trophy className="w-4 h-4" />,
    type: 'total',
    requirement: 25,
    points: 75,
    rarity: 'rare'
  },
  {
    id: 'total_50',
    title: 'Campeão',
    description: 'Complete 50 atividades',
    icon: <Crown className="w-4 h-4" />,
    type: 'total',
    requirement: 50,
    points: 150,
    rarity: 'epic'
  },
  {
    id: 'total_100',
    title: 'Lenda',
    description: 'Complete 100 atividades',
    icon: <Award className="w-4 h-4" />,
    type: 'total',
    requirement: 100,
    points: 300,
    rarity: 'legendary'
  },
  {
    id: 'weekly_perfect',
    title: 'Semana Perfeita',
    description: 'Complete todas as atividades da semana',
    icon: <Calendar className="w-4 h-4" />,
    type: 'weekly',
    requirement: 21, // 3 atividades x 7 dias
    points: 100,
    rarity: 'epic'
  }
];

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800 border-gray-200',
  rare: 'bg-blue-100 text-blue-800 border-blue-200',
  epic: 'bg-purple-100 text-purple-800 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const RARITY_LABELS = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário'
};

export const GamificationSystem: React.FC<GamificationSystemProps> = ({
  childId,
  childName,
  className
}) => {
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    totalPoints: 0,
    level: 1,
    streak: 0,
    achievements: [],
    weeklyProgress: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateGamificationData();
  }, [childId]);

  const calculateGamificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch all completions for this child
      const { data: completions, error } = await supabase
        .from('completions')
        .select('completed_at')
        .eq('child_id', childId)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      const completionDates = (completions || []).map(c => parseISO(c.completed_at));
      
      // Calculate total activities and points
      const totalActivities = completions?.length || 0;
      const basePoints = totalActivities * 5; // 5 points per activity
      
      // Calculate streak
      const streak = calculateStreak(completionDates);
      
      // Calculate level (every 100 points = 1 level)
      const achievements = calculateAchievements(totalActivities, streak, completionDates);
      const achievementPoints = achievements.filter(a => a.achieved).reduce((sum, a) => sum + a.points, 0);
      const totalPoints = basePoints + achievementPoints;
      const level = Math.floor(totalPoints / 100) + 1;
      
      // Calculate weekly progress
      const weekStart = startOfWeek(new Date(), { locale: ptBR });
      const weeklyCompletions = completionDates.filter(date => date >= weekStart);
      const weeklyProgress = Math.min((weeklyCompletions.length / 21) * 100, 100); // 21 = 3 activities x 7 days
      
      setGamificationData({
        totalPoints,
        level,
        streak,
        achievements,
        weeklyProgress
      });
    } catch (error) {
      console.error('Error calculating gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completionDates: Date[]): number => {
    if (completionDates.length === 0) return 0;
    
    // Group dates by day
    const uniqueDays = Array.from(
      new Set(completionDates.map(date => format(date, 'yyyy-MM-dd')))
    ).sort().reverse();
    
    if (uniqueDays.length === 0) return 0;
    
    // Check if today or yesterday has activity (streak continues)
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
      return 0; // Streak broken
    }
    
    // Count consecutive days
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < uniqueDays.length; i++) {
      const checkDate = format(currentDate, 'yyyy-MM-dd');
      if (uniqueDays.includes(checkDate)) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateAchievements = (
    totalActivities: number, 
    streak: number, 
    completionDates: Date[]
  ): Achievement[] => {
    const weekStart = startOfWeek(new Date(), { locale: ptBR });
    const weeklyCompletions = completionDates.filter(date => date >= weekStart).length;
    
    return ACHIEVEMENTS_CONFIG.map(config => {
      let achieved = false;
      let achievedAt: string | undefined;
      
      switch (config.type) {
        case 'total':
        case 'milestone':
          achieved = totalActivities >= config.requirement;
          if (achieved && completionDates.length >= config.requirement) {
            achievedAt = completionDates[config.requirement - 1]?.toISOString();
          }
          break;
        case 'streak':
          achieved = streak >= config.requirement;
          break;
        case 'weekly':
          achieved = weeklyCompletions >= config.requirement;
          break;
      }
      
      return {
        ...config,
        achieved,
        achievedAt
      };
    });
  };

  const nextLevelProgress = useMemo(() => {
    const currentLevelPoints = (gamificationData.level - 1) * 100;
    const nextLevelPoints = gamificationData.level * 100;
    const progressPoints = gamificationData.totalPoints - currentLevelPoints;
    return (progressPoints / 100) * 100;
  }, [gamificationData]);

  const recentAchievements = useMemo(() => {
    return gamificationData.achievements
      .filter(a => a.achieved)
      .sort((a, b) => {
        if (!a.achievedAt || !b.achievedAt) return 0;
        return parseISO(b.achievedAt).getTime() - parseISO(a.achievedAt).getTime();
      })
      .slice(0, 3);
  }, [gamificationData.achievements]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Carregando conquistas...
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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Sistema de Conquistas - {childName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level and Points */}
        <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <div className="text-3xl font-bold">Nível {gamificationData.level}</div>
              <div className="text-muted-foreground">{gamificationData.totalPoints} pontos</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{Math.round(nextLevelProgress)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{gamificationData.streak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Sequência Atual</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{Math.round(gamificationData.weeklyProgress)}%</span>
            </div>
            <div className="text-xs text-muted-foreground">Meta Semanal</div>
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Conquistas Recentes
            </h4>
            {recentAchievements.map(achievement => (
              <div
                key={achievement.id}
                className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 dark:from-yellow-950 dark:to-yellow-900 dark:border-yellow-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{achievement.title}</h5>
                      <Badge className={RARITY_COLORS[achievement.rarity]} variant="outline">
                        {RARITY_LABELS[achievement.rarity]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="text-xs text-yellow-600 mt-1">
                      +{achievement.points} pontos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Achievements */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            Todas as Conquistas
          </h4>
          <div className="grid gap-3">
            {gamificationData.achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border transition-all ${
                  achievement.achieved
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'bg-muted/30 border-muted opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.achieved
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{achievement.title}</h5>
                      <Badge 
                        className={RARITY_COLORS[achievement.rarity]} 
                        variant="outline"
                      >
                        {RARITY_LABELS[achievement.rarity]}
                      </Badge>
                      {achievement.achieved && (
                        <Badge variant="secondary" className="text-xs">
                          Conquistado
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {achievement.points} pontos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};