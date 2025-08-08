import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Clock, 
  Star, 
  Trophy, 
  Volume2, 
  Eye,
  CheckCircle,
  Zap,
  Target
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  instructions: string;
  day_index: number;
  video_url?: string;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  completed?: boolean;
}

interface ActivityCardsProps {
  activities: Activity[];
  onActivityComplete: (activityId: string) => void;
  isMarkingComplete?: string | null;
}

export const ActivityCards: React.FC<ActivityCardsProps> = ({
  activities,
  onActivityComplete,
  isMarkingComplete
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 3 }, (_, i) => (
      <Star 
        key={i}
        className={`h-3 w-3 ${i < count ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'respiração': return <Volume2 className="h-4 w-4" />;
      case 'coordenação': return <Target className="h-4 w-4" />;
      case 'memória': return <Zap className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <Card 
          key={activity.id}
          className={`
            group hover:shadow-lg transition-all duration-300 cursor-pointer
            ${activity.completed 
              ? 'border-green-200 bg-green-50/50' 
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(activity.category)}
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {activity.title}
                </CardTitle>
              </div>
              {activity.completed && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video Preview */}
            {activity.video_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group-hover:scale-[1.02] transition-transform">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img 
                  src="/placeholder.svg" 
                  alt="Prévia do vídeo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {activity.duration && (
                  <Badge className="absolute top-2 right-2 z-20 bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.duration}
                  </Badge>
                )}
              </div>
            )}

            <CardDescription className="text-xs line-clamp-2">
              {activity.instructions}
            </CardDescription>

            {/* Difficulty and Category */}
            <div className="flex items-center justify-between">
              {activity.difficulty && (
                <div className="flex items-center gap-1">
                  {getDifficultyStars(activity.difficulty)}
                </div>
              )}
              {activity.category && (
                <Badge variant="secondary" className="text-xs">
                  {activity.category}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getCategoryIcon(selectedActivity?.category)}
                      {selectedActivity?.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {selectedActivity?.video_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Button size="lg" className="rounded-full">
                            <Play className="h-6 w-6 mr-2" />
                            Reproduzir Vídeo
                          </Button>
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Instruções:</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedActivity?.instructions}
                      </p>
                    </div>
                    {selectedActivity?.difficulty && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Dificuldade:</span>
                        <div className="flex items-center gap-1">
                          {getDifficultyStars(selectedActivity.difficulty)}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {!activity.completed && (
                <Button 
                  size="sm"
                  onClick={() => onActivityComplete(activity.id)}
                  disabled={isMarkingComplete === activity.id}
                  className="flex-1"
                >
                  {isMarkingComplete === activity.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                      Concluindo...
                    </div>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-1" />
                      Concluir
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};