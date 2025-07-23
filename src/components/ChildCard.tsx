import { useState, memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, Edit3, Trash2, Calendar, Trophy } from 'lucide-react';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  created_at: string;
  user_id: string;
}

interface ChildCardProps {
  child: Child;
  progress?: number;
  onEdit: (childId: string, e: React.MouseEvent) => void;
  onDelete: (childId: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

export const ChildCard = memo(({ child, progress = 0, onEdit, onDelete, onClick }: ChildCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const daysSinceStart = useMemo(() => 
    Math.floor((Date.now() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    [child.created_at]
  );

  const progressColor = useMemo(() => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  }, [progress]);

  const statusText = useMemo(() => {
    if (progress >= 80) return "Excelente";
    if (progress >= 60) return "Muito Bom";
    if (progress >= 40) return "Bom";
    if (progress >= 20) return "Regular";
    return "Iniciando";
  }, [progress]);

  const handleCardClick = () => {
    setIsLoading(true);
    onClick();
    // Reset loading after a short delay (will be handled by parent component)
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-primary/20 hover:border-l-primary relative group animate-fade-in"
      onClick={handleCardClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg animate-fade-in">
          <LoadingSpinner size="md" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg font-semibold truncate">
                {child.child_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3" />
                {child.child_age} meses
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onEdit(child.id, e)}
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:scale-110 transition-all duration-200"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onDelete(child.id, e)}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:scale-110 transition-all duration-200"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <div className="flex items-center gap-1">
              <Trophy className={`h-3 w-3 ${progressColor}`} />
              <span className={`font-medium ${progressColor}`}>
                {progress}%
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-300" />
        </div>

        {/* Activity Days */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Dias de atividade</span>
          <Badge variant="outline" className="text-xs animate-fade-in">
            Dia {daysSinceStart + 1}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <Badge variant={progress > 50 ? "default" : "secondary"} className="text-xs animate-scale-in">
            {statusText}
          </Badge>
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Clique para ver atividades
          </span>
        </div>
      </CardContent>
    </Card>
  );
});