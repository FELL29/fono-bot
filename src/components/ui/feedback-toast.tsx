import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface FeedbackToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getToastVariant = (type: ToastType) => {
  switch (type) {
    case "error":
      return "destructive" as const;
    default:
      return "default" as const;
  }
};

export const showFeedbackToast = (type: ToastType, options: FeedbackToastOptions) => {
  const icon = getToastIcon(type);
  
  return toast({
    variant: getToastVariant(type),
    title: options.title,
    description: options.description ? (
      <div className="flex items-center gap-2">
        {icon}
        {options.description}
      </div>
    ) : undefined,
    duration: options.duration,
  });
};

// Convenience functions
export const showSuccessToast = (options: FeedbackToastOptions) => 
  showFeedbackToast("success", options);

export const showErrorToast = (options: FeedbackToastOptions) => 
  showFeedbackToast("error", options);

export const showWarningToast = (options: FeedbackToastOptions) => 
  showFeedbackToast("warning", options);

export const showInfoToast = (options: FeedbackToastOptions) => 
  showFeedbackToast("info", options);

// Operation status toasts
export const showOperationToast = {
  loading: (operation: string) => 
    showInfoToast({ 
      title: "Processando", 
      description: `${operation}...`,
      duration: 2000 
    }),
    
  success: (operation: string) => 
    showSuccessToast({ 
      title: "Sucesso!", 
      description: `${operation} realizada com sucesso.` 
    }),
    
  error: (operation: string, error?: string) => 
    showErrorToast({ 
      title: "Erro", 
      description: error || `Erro ao ${operation.toLowerCase()}.` 
    }),
};