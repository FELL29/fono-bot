import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Heart, 
  Award,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Clock,
  Calendar
} from 'lucide-react';

interface Child {
  id: string;
  child_name: string;
  child_age: number;
  track_id: string;
  created_at: string;
}

interface DevelopmentInsightsProps {
  child: Child;
  progressData: number;
  className?: string;
}

export const DevelopmentInsights: React.FC<DevelopmentInsightsProps> = ({
  child,
  progressData,
  className = ""
}) => {
  const insights = useMemo(() => {
    // Mock insights based on progress and child data
    const daysSinceStart = Math.floor(
      (new Date().getTime() - new Date(child.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const avgDailyProgress = progressData / Math.max(daysSinceStart, 1);
    const expectedProgress = daysSinceStart * 2; // 2% per day expected
    const performanceRatio = progressData / Math.max(expectedProgress, 1);

    return {
      daysSinceStart,
      avgDailyProgress,
      performanceRatio,
      strengths: [
        'Excelente consistência nas atividades',
        'Progressão constante na articulação',
        'Boa resposta aos exercícios de respiração'
      ],
      areasForImprovement: [
        'Foco nas atividades de coordenação motora',
        'Prática adicional de vogais abertas'
      ],
      recommendations: [
        'Continue com as atividades diárias',
        'Adicione 5 minutos extras de exercícios de sopro',
        'Pratique leitura em voz alta 2x por semana'
      ],
      milestones: [
        { name: 'Primeiras palavras claras', achieved: true, date: '2024-01-15' },
        { name: 'Coordenação respiratória', achieved: true, date: '2024-01-22' },
        { name: 'Articulação de consoantes', achieved: false, estimated: '2024-02-15' },
        { name: 'Fluência em frases', achieved: false, estimated: '2024-03-01' }
      ]
    };
  }, [child, progressData]);

  const getPerformanceStatus = () => {
    if (insights.performanceRatio >= 1.2) return { color: 'text-green-600', label: 'Excelente', icon: CheckCircle };
    if (insights.performanceRatio >= 0.8) return { color: 'text-blue-600', label: 'Bom', icon: TrendingUp };
    return { color: 'text-orange-600', label: 'Precisa Atenção', icon: AlertCircle };
  };

  const performance = getPerformanceStatus();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Performance Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Análise de Desenvolvimento
          </CardTitle>
          <CardDescription>
            Insights personalizados para {child.child_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {insights.daysSinceStart}
              </div>
              <div className="text-xs text-muted-foreground">Dias de Prática</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(progressData)}%
              </div>
              <div className="text-xs text-muted-foreground">Progresso Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {insights.avgDailyProgress.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Progresso Diário</div>
            </div>
            <div className="text-center">
              <Badge variant={insights.performanceRatio >= 1 ? "default" : "secondary"} className="w-full justify-center">
                <performance.icon className="h-3 w-3 mr-1" />
                {performance.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-green-600" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-orange-600" />
              Áreas de Foco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Heart className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-blue-600" />
            Marcos de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${milestone.achieved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-muted/30 border-border'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {milestone.achieved ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{milestone.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.achieved 
                        ? `Alcançado em ${new Date(milestone.date!).toLocaleDateString('pt-BR')}`
                        : `Estimativa: ${new Date(milestone.estimated!).toLocaleDateString('pt-BR')}`
                      }
                    </div>
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Concluído
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};