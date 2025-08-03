import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context } = this.props;
    
    // Log estruturado do erro
    logger.error(
      `React Error Boundary caught error${context ? ` in ${context}` : ''}`,
      {
        component: context || 'Unknown Component',
        action: 'component_error',
        metadata: {
          errorStack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId
        }
      },
      error
    );

    // Callback personalizado se fornecido
    onError?.(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleReset = () => {
    logger.info('Error boundary reset triggered', {
      component: this.props.context || 'Unknown Component',
      action: 'error_boundary_reset',
      metadata: { errorId: this.state.errorId }
    });
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: undefined 
    });
  };

  handleReload = () => {
    logger.info('Page reload triggered from error boundary', {
      component: this.props.context || 'Unknown Component',
      action: 'page_reload',
      metadata: { errorId: this.state.errorId }
    });
    
    window.location.reload();
  };

  handleGoHome = () => {
    logger.info('Navigate to home triggered from error boundary', {
      component: this.props.context || 'Unknown Component',
      action: 'navigate_home',
      metadata: { errorId: this.state.errorId }
    });
    
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;
      const showDetails = this.props.showErrorDetails ?? isDevelopment;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Ops! Algo deu errado</CardTitle>
              <CardDescription>
                {this.props.context 
                  ? `Ocorreu um erro no componente ${this.props.context}.`
                  : 'Ocorreu um erro inesperado na aplicação.'
                }
                {this.state.errorId && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    ID do erro: {this.state.errorId}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {showDetails && this.state.error && (
                <div className="rounded-md bg-muted p-3 max-h-32 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="h-4 w-4" />
                    <span className="text-sm font-medium">Detalhes técnicos:</span>
                  </div>
                  <code className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.message}
                    {showDetails && this.state.error.stack && (
                      <>
                        {'\n\nStack trace:\n'}
                        {this.state.error.stack.slice(0, 500)}
                        {this.state.error.stack.length > 500 && '...'}
                      </>
                    )}
                  </code>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleReset}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                  <Button 
                    onClick={this.handleReload}
                    className="flex-1"
                  >
                    Recarregar Página
                  </Button>
                </div>
                <Button 
                  onClick={this.handleGoHome}
                  variant="secondary"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;

// Hook para capturar erros em componentes funcionais com logging aprimorado
export const useErrorHandler = (context?: string) => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    logger.error(
      `Error caught by useErrorHandler${context ? ` in ${context}` : ''}`,
      {
        component: context || 'Functional Component',
        action: 'component_error',
        metadata: {
          errorStack: error.stack,
          componentStack: errorInfo?.componentStack
        }
      },
      error
    );
  };
};