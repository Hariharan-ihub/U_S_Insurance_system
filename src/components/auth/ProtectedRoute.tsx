import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    // Hydrate session if it's there
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Verifying your secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
