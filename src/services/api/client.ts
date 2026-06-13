import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { AUTH_URLS } from '@/lib/constants';

// ============================================
// Auth Client — No auth interceptors (for login/refresh)
// ============================================

export const authClient = axios.create({
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request Interceptor: Attach Integration Token ---
authClient.interceptors.request.use(
  (config) => {
    const integrationToken = import.meta.env.VITE_INTEGRATION_TOKEN;
    if (integrationToken) {
      config.headers['x-integration-token'] = integrationToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// API Client — Protected calls (dashboard)
// ============================================

export const apiClient = axios.create({
  timeout: 30_000, // 30s timeout for LLM-backed endpoints
  headers: { 'Content-Type': 'application/json' },
});

// --- Request Interceptor: Attach Access Token & Integration Token ---
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const integrationToken = import.meta.env.VITE_INTEGRATION_TOKEN;
    if (integrationToken) {
      config.headers['x-integration-token'] = integrationToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: 401 Handling with Token Refresh Queue ---
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function drainRefreshQueue(token: string | null, error: unknown = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) throw new Error('No refresh token');

      // Call WF-2: Token Refresh Workflow
      const response = await authClient.post(AUTH_URLS.REFRESH, {
        refresh_token: refreshToken,
      });

      let data = response.data;
      if (data?.items?.[0]?.json) {
        data = data.items[0].json;
      }

      if (data.success && data.access_token) {
        const newToken = data.access_token;
        useAuthStore.getState().setTokens(newToken, data.expires_in, data.session_id);

        // Replay all queued requests
        drainRefreshQueue(newToken);

        // Replay the original failed request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } else {
        throw new Error(data.error || 'Refresh failed (no access token)');
      }
    } catch (refreshError) {
      drainRefreshQueue(null, refreshError);

      // Refresh failed — force logout
      useAuthStore.getState().clearAuth();
      useUIStore.getState().showSessionExpired();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
