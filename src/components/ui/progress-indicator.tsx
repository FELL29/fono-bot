import { cn } from "@/lib/utils";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "current" | "completed" | "error";
}

interface ProgressIndicatorProps {
  steps: Step[];
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ProgressIndicator = ({ 
  steps, 
  className, 
  orientation = "horizontal" 
}: ProgressIndicatorProps) => {
  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "current":
        return (
          <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary animate-pulse" />
        );
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepClasses = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "current":
        return "text-primary font-medium";
      default:
        return "text-muted-foreground";
    }
  };

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              {getStepIcon(step.status)}
              {index < steps.length - 1 && (
                <div className="w-px h-8 bg-muted mt-2" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", getStepClasses(step.status))}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            {getStepIcon(step.status)}
            <p className={cn("text-xs mt-1 text-center", getStepClasses(step.status))}>
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-px bg-muted mx-2" />
          )}
        </div>
      ))}
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

export const CircularProgress = ({ 
  value, 
  size = 120, 
  strokeWidth = 8, 
  className,
  showValue = true 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground">
            {Math.round(value)}%
          </span>
        </div>
      )}
    </div>
  );
};