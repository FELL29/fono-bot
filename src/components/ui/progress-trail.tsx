import React from 'react';
import { Check, Play, Lock, Star, Sparkles, Crown, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrailStep {
  id: string;
  title: string;
  day: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

interface ProgressTrailProps {
  steps: TrailStep[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showDayNumbers?: boolean;
}

export const ProgressTrail: React.FC<ProgressTrailProps> = ({
  steps,
  className,
  orientation = 'horizontal',
  showDayNumbers = true
}) => {
  const isHorizontal = orientation === 'horizontal';

  const getStepIcon = (step: TrailStep, index: number) => {
    if (step.isCompleted) {
      // Ícones especiais para marcos importantes
      if (index === 0) return <Star className="w-4 h-4" />;
      if (index % 5 === 0) return <Crown className="w-4 h-4" />;
      if (index % 3 === 0) return <Heart className="w-4 h-4" />;
      return <Check className="w-4 h-4" />;
    }
    if (step.isCurrent && !step.isCompleted) return <Sparkles className="w-4 h-4 animate-pulse" />;
    if (step.isLocked) return <Lock className="w-3 h-3" />;
    return <span className="text-xs font-bold">{step.day}</span>;
  };

  const getConnectionLineStyle = (currentStep: TrailStep, nextStep: TrailStep) => {
    if (currentStep.isCompleted && nextStep.isCompleted) {
      return "bg-gradient-to-r from-primary to-secondary";
    }
    if (currentStep.isCompleted) {
      return "bg-gradient-to-r from-primary to-border";
    }
    return "bg-border";
  };

  return (
    <div className={cn(
      "relative p-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-xl border border-primary/10",
      isHorizontal ? "flex items-center space-x-6 overflow-x-auto pb-4" : "space-y-6",
      className
    )}>
      {/* Magical Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-60" />
        <div className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }} />
      </div>

      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "relative flex items-center group transition-all duration-300",
            isHorizontal ? "flex-col" : "flex-row",
            step.isCurrent && "transform scale-105"
          )}
        >
          {/* Enhanced Connection Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute transition-all duration-500 rounded-full",
                getConnectionLineStyle(step, steps[index + 1]),
                isHorizontal 
                  ? "top-6 left-12 w-14 h-1 shadow-sm" 
                  : "left-6 top-12 w-1 h-14 shadow-sm"
              )}
            />
          )}

          {/* Enhanced Step Circle */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center rounded-full border-3 transition-all duration-500 shadow-lg group-hover:shadow-xl",
              // Completed steps - different colors for variety
              step.isCompleted && index % 4 === 0 && "w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-300 text-white shadow-yellow-400/30",
              step.isCompleted && index % 4 === 1 && "w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 border-green-300 text-white shadow-green-400/30",
              step.isCompleted && index % 4 === 2 && "w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 border-purple-300 text-white shadow-purple-400/30",
              step.isCompleted && index % 4 === 3 && "w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 border-blue-300 text-white shadow-blue-400/30",
              // Current step
              step.isCurrent && !step.isCompleted && "w-14 h-14 bg-gradient-to-br from-accent to-accent/80 border-accent text-accent-foreground animate-pulse shadow-accent/50",
              // Locked steps
              step.isLocked && "w-10 h-10 bg-gradient-to-br from-muted to-muted/80 border-muted-foreground/30 text-muted-foreground",
              // Available steps
              !step.isCompleted && !step.isCurrent && !step.isLocked && "w-10 h-10 bg-gradient-to-br from-background to-secondary/20 border-border hover:border-primary/50 hover:shadow-primary/20 hover:scale-110"
            )}
          >
            {getStepIcon(step, index)}
            
            {/* Success sparkles */}
            {step.isCompleted && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75" />
            )}
          </div>

          {/* Enhanced Step Info */}
          <div className={cn(
            "text-center transition-all duration-300",
            isHorizontal ? "mt-3 max-w-24" : "ml-4 flex-1",
            step.isCurrent && "transform scale-105"
          )}>
            {showDayNumbers && (
              <div className={cn(
                "text-xs font-bold mb-1 px-2 py-1 rounded-full",
                step.isCompleted && "bg-primary/10 text-primary",
                step.isCurrent && "bg-accent/20 text-accent animate-pulse",
                step.isLocked && "text-muted-foreground",
                !step.isCompleted && !step.isCurrent && !step.isLocked && "text-muted-foreground"
              )}>
                {step.isCompleted ? "✨ Dia " : "📅 Dia "}{step.day}
              </div>
            )}
            <div className={cn(
              "text-sm font-bold transition-colors duration-300",
              isHorizontal ? "truncate" : "",
              step.isCompleted && "text-primary",
              step.isCurrent && "text-accent font-extrabold",
              step.isLocked && "text-muted-foreground",
              !step.isCompleted && !step.isCurrent && !step.isLocked && "text-foreground/80 group-hover:text-primary"
            )}>
              {step.title}
            </div>
            
            {/* Progress indicator for current step */}
            {step.isCurrent && (
              <div className="mt-2 text-xs text-accent font-medium animate-bounce">
                🚀 Em andamento!
              </div>
            )}
            
            {/* Celebration for completed steps */}
            {step.isCompleted && (
              <div className="mt-1 text-xs text-primary/80 font-medium">
                🎉 Concluído!
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Progress summary */}
      <div className="absolute top-2 right-4 text-xs font-bold text-primary/60">
        {steps.filter(s => s.isCompleted).length}/{steps.length} 🌟
      </div>
    </div>
  );
};