import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Hook that automatically refreshes the access token
 * TOKEN_REFRESH_BUFFER_MS before it expires.
 */
export function useTokenRefresh() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { accessToken, refreshToken, tokenExpiresAt, isAuthenticated, setTokens, clearAuth } =
    useAuthStore();

  const scheduleRefresh = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!tokenExpiresAt || !refreshToken || !isAuthenticated) return;

    const msUntilExpiry = tokenExpiresAt - Date.now();
    const refreshAt = msUntilExpiry - APP_CONFIG.TOKEN_REFRESH_BUFFER_MS;

    if (refreshAt <= 0) {
      // Token already expired or about to — refresh immediately
      performRefresh();
      return;
    }

    timerRef.current = setTimeout(performRefresh, refreshAt);
  }, [tokenExpiresAt, refreshToken, isAuthenticated]);

  const performRefresh = useCallback(async () => {
    if (!refreshToken) return;

    try {
      const result = await authApi.refresh(refreshToken);
      if (result.success && 'access_token' in result && result.access_token) {
        setTokens(result.access_token, result.expires_in);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    }
  }, [refreshToken, setTokens, clearAuth]);

  useEffect(() => {
    scheduleRefresh();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [accessToken, tokenExpiresAt, scheduleRefresh]);
}
