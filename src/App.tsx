import { useEffect } from 'react';
import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { useUIStore } from '@/stores/uiStore';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function App() {
  const { initTheme } = useUIStore();

  useEffect(() => {
    // Resolve light/dark theme preferences and sidebar states on startup
    initTheme();
  }, [initTheme]);

  return (
    <ErrorBoundary>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  );
}
