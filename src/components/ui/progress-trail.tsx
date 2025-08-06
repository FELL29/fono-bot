import React from 'react';
import { Check, Play, Lock } from 'lucide-react';
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

  return (
    <div className={cn(
      "relative",
      isHorizontal ? "flex items-center space-x-4 overflow-x-auto pb-2" : "space-y-4",
      className
    )}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "relative flex items-center",
            isHorizontal ? "flex-col" : "flex-row"
          )}
        >
          {/* Connection Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute bg-border",
                isHorizontal 
                  ? "top-4 left-8 w-12 h-0.5" 
                  : "left-4 top-8 w-0.5 h-8"
              )}
            />
          )}

          {/* Step Circle */}
          <div
            className={cn(
              "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
              step.isCompleted && "bg-primary border-primary text-primary-foreground animate-scale-in",
              step.isCurrent && !step.isCompleted && "bg-accent border-accent text-accent-foreground animate-pulse",
              step.isLocked && "bg-muted border-muted-foreground/30 text-muted-foreground",
              !step.isCompleted && !step.isCurrent && !step.isLocked && "bg-background border-border hover:border-primary/50"
            )}
          >
            {step.isCompleted && <Check className="w-4 h-4" />}
            {step.isCurrent && !step.isCompleted && <Play className="w-3 h-3" />}
            {step.isLocked && <Lock className="w-3 h-3" />}
            {!step.isCompleted && !step.isCurrent && !step.isLocked && (
              <span className="text-xs font-medium">{index + 1}</span>
            )}
          </div>

          {/* Step Info */}
          <div className={cn(
            "text-center",
            isHorizontal ? "mt-2 max-w-20" : "ml-3 flex-1"
          )}>
            {showDayNumbers && (
              <div className="text-xs text-muted-foreground mb-1">
                Dia {step.day}
              </div>
            )}
            <div className={cn(
              "text-sm font-medium",
              isHorizontal ? "truncate" : "",
              step.isCompleted && "text-primary",
              step.isCurrent && "text-accent",
              step.isLocked && "text-muted-foreground"
            )}>
              {step.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};