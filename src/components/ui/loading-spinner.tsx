import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingStateProps {
  children?: React.ReactNode;
  className?: string;
}

export const LoadingState = ({ children, className }: LoadingStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <LoadingSpinner size="lg" />
      {children && (
        <p className="text-muted-foreground text-center">{children}</p>
      )}
    </div>
  );
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