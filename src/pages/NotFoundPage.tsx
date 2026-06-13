import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 animate-pulse">
            <Compass className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-500">
            The page you are trying to access doesn't exist or has been relocated for security.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-2">
          <Button onClick={() => navigate('/')} className="w-full">
            Back to Secure Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
