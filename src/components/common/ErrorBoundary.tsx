import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <Card className="w-full max-w-md border-red-200 dark:border-red-900/50">
            <CardHeader className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mb-4 animate-bounce">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-red-600">Something went wrong</CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-500">
                An unexpected error has occurred. Our security systems have captured the error event.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <div className="w-full text-xs font-mono bg-slate-100 dark:bg-slate-900 p-3.5 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-left overflow-auto max-h-40 mb-6">
                {this.state.error?.toString() || 'Unknown Error'}
              </div>
              <Button onClick={this.handleReset} className="w-full">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
