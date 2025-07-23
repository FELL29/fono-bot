import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "primary" | "secondary";
}

export const LoadingSpinner = ({ size = "md", className, variant = "default" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const variantClasses = {
    default: "border-muted border-t-primary",
    primary: "border-primary/20 border-t-primary",
    secondary: "border-secondary/20 border-t-secondary"
  };

  return (
    <Loader2
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variant === "primary" ? "text-primary" : 
        variant === "secondary" ? "text-secondary" : 
        "text-muted-foreground",
        className
      )}
    />
  );
};

interface LoadingStateProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const LoadingState = ({ children, className, variant = "default", size = "lg" }: LoadingStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8 animate-fade-in", className)}>
      <LoadingSpinner size={size} variant={variant} />
      {children && (
        <p className="text-muted-foreground text-center animate-pulse">{children}</p>
      )}
    </div>
  );
};

interface StatusIndicatorProps {
  status: "loading" | "success" | "error" | "info";
  children?: React.ReactNode;
  className?: string;
}

export const StatusIndicator = ({ status, children, className }: StatusIndicatorProps) => {
  const getIcon = () => {
    switch (status) {
      case "loading":
        return <LoadingSpinner size="sm" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (status) {
      case "loading":
        return "text-muted-foreground";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "info":
        return "text-blue-600";
    }
  };

  return (
    <div className={cn("flex items-center gap-2 animate-fade-in", className)}>
      {getIcon()}
      {children && (
        <span className={cn("text-sm", getColors())}>{children}</span>
      )}
    </div>
  );
};

interface InlineLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const InlineLoading = ({ isLoading, children, loadingText = "Carregando...", className }: InlineLoadingProps) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <LoadingSpinner size="sm" />
        <span className="text-sm">{loadingText}</span>
      </div>
    );
  }
  
  return <>{children}</>;
};

export const LoadingCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="rounded-lg bg-muted p-6 space-y-3">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
      </div>
    </div>
  );
};

interface ProgressLoadingProps {
  progress: number;
  label?: string;
  className?: string;
}

export const ProgressLoading = ({ progress, label, className }: ProgressLoadingProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};