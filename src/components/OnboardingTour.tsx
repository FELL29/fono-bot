import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  action?: string;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao FonoBot! 🎉',
    description: 'Sua jornada de desenvolvimento da fala começa aqui. Vamos te mostrar como aproveitar ao máximo nossa plataforma.',
    icon: <Heart className="h-8 w-8 text-primary" />,
  },
  {
    id: 'add-child',
    title: 'Adicione sua Primeira Criança',
    description: 'Comece criando o perfil da criança. Isso nos ajuda a personalizar as atividades para sua idade e necessidades específicas.',
    icon: <Users className="h-8 w-8 text-primary" />,
    target: 'add-child-button',
    action: 'Clique em "Adicionar Criança"'
  },
  {
    id: 'activities',
    title: 'Atividades Diárias Personalizadas',
    description: 'Cada dia traz novas atividades adaptadas ao progresso da criança. Vídeos interativos e exercícios divertidos.',
    icon: <Play className="h-8 w-8 text-primary" />,
    target: 'activities-section',
    action: 'Explore as atividades do dia'
  },
  {
    id: 'progress',
    title: 'Acompanhe o Progresso',
    description: 'Visualize o desenvolvimento através de gráficos coloridos e trilhas de progresso que mostram cada conquista.',
    icon: <Target className="h-8 w-8 text-primary" />,
    target: 'progress-section',
    action: 'Veja o progresso em tempo real'
  },
  {
    id: 'gamification',
    title: 'Sistema de Recompensas Lúdico',
    description: 'Conquistas, medalhas e moedas mágicas tornam o aprendizado divertido e motivador para as crianças.',
    icon: <Trophy className="h-8 w-8 text-primary" />,
    target: 'gamification-section',
    action: 'Descubra as recompensas'
  },
  {
    id: 'insights',
    title: 'Insights Inteligentes',
    description: 'Receba análises personalizadas sobre o desenvolvimento e sugestões para otimizar o progresso.',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    target: 'insights-section',
    action: 'Explore os insights'
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ 
  isOpen, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && onboardingSteps[currentStep]?.target) {
      setHighlightedElement(onboardingSteps[currentStep].target!);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const progressPercentage = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay with highlight */}
      {highlightedElement && (
        <div className="fixed inset-0 bg-black/60 z-40 pointer-events-none">
          <style>{`
            [data-onboarding-target="${highlightedElement}"] {
              position: relative;
              z-index: 50;
              box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 0 8px hsl(var(--primary) / 0.3);
              border-radius: 8px;
              pointer-events: auto;
            }
          `}</style>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg z-50 bg-gradient-to-br from-background to-muted/30 border-primary/20">
          <DialogHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              {currentStepData.icon}
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {currentStepData.title}
                </DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  {currentStep + 1} de {onboardingSteps.length}
                </Badge>
              </div>
            </div>

            <Progress value={progressPercentage} className="w-full h-2" />
          </DialogHeader>

          <CardContent className="space-y-6 p-0">
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>

            {currentStepData.action && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <ChevronRight className="h-4 w-4" />
                    {currentStepData.action}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={onSkip}>
                  Pular Tour
                </Button>
                <Button onClick={handleNext} className="flex items-center gap-2">
                  {currentStep === onboardingSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  {currentStep < onboardingSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>
    </>
  );
};