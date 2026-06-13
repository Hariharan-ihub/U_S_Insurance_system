import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Hook that detects user inactivity and triggers logout after IDLE_TIMEOUT_MS.
 * Shows a warning modal IDLE_WARNING_MS before logout.
 */
export function useIdleTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated, clearAuth } = useAuthStore();

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setShowWarning(false);

    // Set warning timer (fires 2 minutes before logout)
    const warningDelay = APP_CONFIG.IDLE_TIMEOUT_MS - APP_CONFIG.IDLE_WARNING_MS;
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, warningDelay);

    // Set logout timer
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      clearAuth();
    }, APP_CONFIG.IDLE_TIMEOUT_MS);
  }, [isAuthenticated, clearAuth]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    const handleActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [isAuthenticated, resetTimers, showWarning]);

  return { showWarning, dismissWarning };
}
