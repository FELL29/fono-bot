import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Star, 
  Crown,
  Heart,
  TreePine,
  Gift,
  Wand2,
  Gem,
  MapPin,
  Castle,
  Flower2,
  Sun,
  Moon,
  Rabbit,
  Bird,
  Fish,
  Bug
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfWeek, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlayfulGamificationData {
  totalMagicCoins: number;
  level: number;
  streak: number;
  achievements: PlayfulAchievement[];
  weeklyProgress: number;
  characterTheme: CharacterTheme;
  treeProgress: number;
}

interface PlayfulAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'streak' | 'total' | 'weekly' | 'milestone' | 'special';
  requirement: number;
  magicCoins: number;
  achieved: boolean;
  achievedAt?: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond' | 'rainbow';
  category: 'comunicacao' | 'perseveranca' | 'descoberta' | 'amizade' | 'crescimento';
}

interface CharacterTheme {
  name: string;
  color: string;
  mascot: React.ReactNode;
  kingdom: string;
  specialPower: string;
}

interface PlayfulGamificationProps {
  childId: string;
  childName: string;
  childAge: number;
  className?: string;
}

// Temas baseados na idade e personalidade
const CHARACTER_THEMES: CharacterTheme[] = [
  {
    name: "Explorador das Palavras",
    color: "from-blue-400 to-cyan-400",
    mascot: <Rabbit className="w-6 h-6" />,
    kingdom: "Reino das Descobertas",
    specialPower: "Transformar sons em aventuras"
  },
  {
    name: "Guardião da Comunicação",
    color: "from-green-400 to-emerald-400", 
    mascot: <Bird className="w-6 h-6" />,
    kingdom: "Floresta dos Diálogos",
    specialPower: "Conectar corações através da fala"
  },
  {
    name: "Mago das Histórias",
    color: "from-purple-400 to-pink-400",
    mascot: <Bug className="w-6 h-6" />,
    kingdom: "Castelo Encantado",
    specialPower: "Criar mundos com cada palavra"
  },
  {
    name: "Navegador dos Sons",
    color: "from-orange-400 to-yellow-400",
    mascot: <Fish className="w-6 h-6" />,
    kingdom: "Oceano da Linguagem",
    specialPower: "Descobrir tesouros sonoros"
  }
];

// Conquistas completamente reimaginadas com foco lúdico
const PLAYFUL_ACHIEVEMENTS: Omit<PlayfulAchievement, 'achieved' | 'achievedAt'>[] = [
  {
    id: 'first_word_adventure',
    title: '🌟 Primeira Aventura',
    description: 'Você começou sua jornada mágica da comunicação!',
    icon: <Star className="w-4 h-4" />,
    type: 'milestone',
    requirement: 1,
    magicCoins: 10,
    rarity: 'bronze',
    category: 'descoberta'
  },
  {
    id: 'friendship_streak',
    title: '❤️ Amigo Fiel',
    description: 'Três dias seguidos praticando! Que dedicação!',
    icon: <Heart className="w-4 h-4" />,
    type: 'streak',
    requirement: 3,
    magicCoins: 25,
    rarity: 'silver',
    category: 'amizade'
  },
  {
    id: 'word_wizard',
    title: '🪄 Pequeno Mago',
    description: 'Uma semana inteira de magia das palavras!',
    icon: <Wand2 className="w-4 h-4" />,
    type: 'streak',
    requirement: 7,
    magicCoins: 50,
    rarity: 'gold',
    category: 'perseveranca'
  },
  {
    id: 'sound_explorer',
    title: '🗺️ Explorador de Sons',
    description: 'Dez aventuras completadas no mundo da fala!',
    icon: <MapPin className="w-4 h-4" />,
    type: 'total',
    requirement: 10,
    magicCoins: 30,
    rarity: 'bronze',
    category: 'descoberta'
  },
  {
    id: 'communication_hero',
    title: '🏰 Herói da Comunicação',
    description: 'Vinte e cinco missões concluídas! Você é incrível!',
    icon: <Castle className="w-4 h-4" />,
    type: 'total',
    requirement: 25,
    magicCoins: 75,
    rarity: 'gold',
    category: 'comunicacao'
  },
  {
    id: 'speech_master',
    title: '👑 Mestre da Fala',
    description: 'Cinquenta aventuras! Você domina a arte da comunicação!',
    icon: <Crown className="w-4 h-4" />,
    type: 'total',
    requirement: 50,
    magicCoins: 150,
    rarity: 'diamond',
    category: 'crescimento'
  },
  {
    id: 'rainbow_achievement',
    title: '🌈 Lenda Arco-Íris',
    description: 'Cem aventuras! Você é uma verdadeira lenda!',
    icon: <Sparkles className="w-4 h-4" />,
    type: 'total',
    requirement: 100,
    magicCoins: 300,
    rarity: 'rainbow',
    category: 'crescimento'
  },
  {
    id: 'perfect_garden',
    title: '🌸 Jardim Perfeito',
    description: 'Uma semana completa de cuidado com seu jardim de palavras!',
    icon: <Flower2 className="w-4 h-4" />,
    type: 'weekly',
    requirement: 21,
    magicCoins: 100,
    rarity: 'diamond',
    category: 'crescimento'
  },
  {
    id: 'morning_star',
    title: '☀️ Estrela da Manhã',
    description: 'Você praticou pela manhã 5 vezes! Que energia!',
    icon: <Sun className="w-4 h-4" />,
    type: 'special',
    requirement: 5,
    magicCoins: 40,
    rarity: 'silver',
    category: 'perseveranca'
  },
  {
    id: 'dream_keeper',
    title: '🌙 Guardião dos Sonhos',
    description: 'Praticou à noite 5 vezes! Que dedicação!',
    icon: <Moon className="w-4 h-4" />,
    type: 'special',
    requirement: 5,
    magicCoins: 40,
    rarity: 'silver',
    category: 'perseveranca'
  }
];

const RARITY_STYLES = {
  bronze: 'from-amber-100 to-orange-100 border-amber-300 text-amber-800',
  silver: 'from-gray-100 to-slate-100 border-gray-300 text-gray-800',
  gold: 'from-yellow-100 to-amber-100 border-yellow-300 text-yellow-800',
  diamond: 'from-blue-100 to-indigo-100 border-blue-300 text-blue-800',
  rainbow: 'from-pink-100 via-purple-100 to-indigo-100 border-pink-300 text-purple-800 animate-pulse'
};

const RARITY_LABELS = {
  bronze: '🥉 Bronze',
  silver: '🥈 Prata', 
  gold: '🥇 Ouro',
  diamond: '💎 Diamante',
  rainbow: '🌈 Arco-íris'
};

const CATEGORY_EMOJIS = {
  comunicacao: '💬',
  perseveranca: '💪',
  descoberta: '🔍',
  amizade: '🤝',
  crescimento: '🌱'
};

export const PlayfulGamification: React.FC<PlayfulGamificationProps> = ({
  childId,
  childName,
  childAge,
  className
}) => {
  const [gamificationData, setGamificationData] = useState<PlayfulGamificationData>({
    totalMagicCoins: 0,
    level: 1,
    streak: 0,
    achievements: [],
    weeklyProgress: 0,
    characterTheme: CHARACTER_THEMES[0],
    treeProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    calculatePlayfulData();
  }, [childId]);

  const calculatePlayfulData = async () => {
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
      
      // Calculate total activities and magic coins
      const totalActivities = completions?.length || 0;
      const baseMagicCoins = totalActivities * 5; // 5 moedas por atividade
      
      // Calculate streak
      const streak = calculateStreak(completionDates);
      
      // Calculate level (every 50 magic coins = 1 level) - mais acessível para crianças
      const achievements = calculatePlayfulAchievements(totalActivities, streak, completionDates);
      const achievementCoins = achievements.filter(a => a.achieved).reduce((sum, a) => sum + a.magicCoins, 0);
      const totalMagicCoins = baseMagicCoins + achievementCoins;
      const level = Math.floor(totalMagicCoins / 50) + 1;
      
      // Calculate weekly progress
      const weekStart = startOfWeek(new Date(), { locale: ptBR });
      const weeklyCompletions = completionDates.filter(date => date >= weekStart);
      const weeklyProgress = Math.min((weeklyCompletions.length / 21) * 100, 100);
      
      // Select character theme based on age and progress
      const themeIndex = Math.min(Math.floor(childAge / 3), CHARACTER_THEMES.length - 1);
      const characterTheme = CHARACTER_THEMES[themeIndex];
      
      // Calculate tree progress (visual metaphor for growth)
      const treeProgress = Math.min((totalActivities / 100) * 100, 100);
      
      setGamificationData({
        totalMagicCoins,
        level,
        streak,
        achievements,
        weeklyProgress,
        characterTheme,
        treeProgress
      });
    } catch (error) {
      console.error('Error calculating playful gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completionDates: Date[]): number => {
    if (completionDates.length === 0) return 0;
    
    const uniqueDays = Array.from(
      new Set(completionDates.map(date => format(date, 'yyyy-MM-dd')))
    ).sort().reverse();
    
    if (uniqueDays.length === 0) return 0;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
      return 0;
    }
    
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

  const calculatePlayfulAchievements = (
    totalActivities: number, 
    streak: number, 
    completionDates: Date[]
  ): PlayfulAchievement[] => {
    const weekStart = startOfWeek(new Date(), { locale: ptBR });
    const weeklyCompletions = completionDates.filter(date => date >= weekStart).length;
    
    return PLAYFUL_ACHIEVEMENTS.map(config => {
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
        case 'special':
          // Para conquistas especiais, podemos implementar lógicas específicas
          achieved = totalActivities >= config.requirement;
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
    const currentLevelCoins = (gamificationData.level - 1) * 50;
    const nextLevelCoins = gamificationData.level * 50;
    const progressCoins = gamificationData.totalMagicCoins - currentLevelCoins;
    return (progressCoins / 50) * 100;
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
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Carregando sua aventura mágica...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gamificationData.characterTheme.color} flex items-center justify-center text-white shadow-lg`}>
            {gamificationData.characterTheme.mascot}
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {gamificationData.characterTheme.name}
            </div>
            <div className="text-sm text-muted-foreground font-normal">
              {childName} - {gamificationData.characterTheme.kingdom}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Character Level and Magic Coins */}
        <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-700">Nível {gamificationData.level}</div>
              <div className="flex items-center gap-2 text-amber-600">
                <Gem className="w-4 h-4" />
                <span className="font-medium">{gamificationData.totalMagicCoins} Moedas Mágicas</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-yellow-700">
              <span>🌟 Progresso para o próximo nível</span>
              <span>{Math.round(nextLevelProgress)}%</span>
            </div>
            <Progress value={nextLevelProgress} className="h-3 bg-yellow-100" />
          </div>
          
          <div className="mt-3 text-sm text-yellow-600 italic">
            💫 {gamificationData.characterTheme.specialPower}
          </div>
        </div>

        {/* Growth Tree and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tree of Speech Growth */}
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TreePine className="w-6 h-6 text-green-500" />
              <span className="text-lg font-bold text-green-700">{Math.round(gamificationData.treeProgress)}%</span>
            </div>
            <div className="text-xs text-green-600 mb-2">🌳 Árvore do Crescimento</div>
            <Progress value={gamificationData.treeProgress} className="h-2 bg-green-100" />
          </div>
          
          {/* Adventure Streak */}
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span className="text-lg font-bold text-red-700">{gamificationData.streak}</span>
            </div>
            <div className="text-xs text-red-600">❤️ Dias de Aventura</div>
          </div>
          
          {/* Weekly Garden Progress */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flower2 className="w-6 h-6 text-purple-500" />
              <span className="text-lg font-bold text-purple-700">{Math.round(gamificationData.weeklyProgress)}%</span>
            </div>
            <div className="text-xs text-purple-600">🌸 Jardim Semanal</div>
          </div>
        </div>

        {/* Recent Magical Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              🎉 Conquistas Recentes!
            </h4>
            {recentAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl bg-gradient-to-r ${RARITY_STYLES[achievement.rarity]} border-2 shadow-lg transform hover:scale-105 transition-all duration-200`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow-md">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-sm">{achievement.title}</h5>
                      <Badge className="text-xs bg-white/50">
                        {RARITY_LABELS[achievement.rarity]}
                      </Badge>
                      <Badge className="text-xs bg-white/50">
                        {CATEGORY_EMOJIS[achievement.category]}
                      </Badge>
                    </div>
                    <p className="text-xs mt-1 font-medium">{achievement.description}</p>
                    <div className="text-xs mt-2 flex items-center gap-1">
                      <Gem className="w-3 h-3" />
                      <span className="font-bold">+{achievement.magicCoins} moedas mágicas!</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Achievements Toggle */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 hover:scale-105 transition-all duration-200"
          >
            <Gift className="w-4 h-4 mr-2" />
            {showAllAchievements ? 'Esconder' : 'Ver Todas'} as Conquistas Mágicas
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* All Achievements Grid */}
        {showAllAchievements && (
          <div className="space-y-3">
            <h4 className="font-bold flex items-center gap-2 text-lg">
              <Crown className="w-5 h-5 text-purple-500" />
              🏆 Todas as Conquistas Mágicas
            </h4>
            <div className="grid gap-3">
              {gamificationData.achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    achievement.achieved
                      ? `bg-gradient-to-r ${RARITY_STYLES[achievement.rarity]} shadow-md transform hover:scale-102`
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      achievement.achieved
                        ? 'bg-white/80'
                        : 'bg-gray-200'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-medium text-sm">{achievement.title}</h5>
                        <Badge className="text-xs bg-white/50">
                          {RARITY_LABELS[achievement.rarity]}
                        </Badge>
                        <Badge className="text-xs bg-white/50">
                          {CATEGORY_EMOJIS[achievement.category]}
                        </Badge>
                        {achievement.achieved && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            ✨ Conquistado!
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      <div className="text-xs mt-1 flex items-center gap-1">
                        <Gem className="w-3 h-3" />
                        <span>{achievement.magicCoins} moedas mágicas</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};