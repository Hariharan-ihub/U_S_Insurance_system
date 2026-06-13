import { create } from 'zustand';
import type { MemberProfile, LoginResponse } from '@/types/auth.types';
import { STORAGE_KEYS } from '@/lib/constants';
import { cookieHelper } from '@/lib/cookies';
import { authApi } from '@/services/api/authApi';

// ============================================
// Auth Store — JWT Token + Session Management
// ============================================

interface AuthState {
  // State
  member: MemberProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  userToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenExpiresAt: number | null;

  // Actions
  setAuthenticated: (data: LoginResponse) => void;
  setTokens: (accessToken: string, expiresIn: number, sessionId?: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  member: null,
  accessToken: null,
  refreshToken: null,
  userToken: null,
  sessionId: null,
  isAuthenticated: false,
  isLoading: true, // True initially while checking stored session
  tokenExpiresAt: null,

  /**
   * Set full auth state after successful login (WF-1 response).
   */
  setAuthenticated: (data: LoginResponse) => {
    const expiresAt = Date.now() + data.expires_in * 1000;

    // Persist refresh token to browser cookie (expires in 7 days)
    cookieHelper.set(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token, 7);
    sessionStorage.setItem(STORAGE_KEYS.MEMBER_PROFILE, JSON.stringify(data.member));

    // Persist user_token for iframe chat authentication
    if (data.user_token) {
      sessionStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.user_token);
    }

    set({
      member: data.member,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userToken: data.user_token || null,
      sessionId: data.session_id,
      isAuthenticated: true,
      isLoading: false,
      tokenExpiresAt: expiresAt,
    });
  },

  /**
   * Update tokens after a successful refresh (WF-2 response).
   */
  setTokens: (accessToken: string, expiresIn: number, sessionId?: string) => {
    const expiresAt = Date.now() + expiresIn * 1000;

    set(() => ({
      accessToken,
      tokenExpiresAt: expiresAt,
      ...(sessionId ? { sessionId } : {}),
    }));
  },

  /**
   * Clear all auth state (logout or session expired).
   */
  clearAuth: () => {
    cookieHelper.remove(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.MEMBER_PROFILE);
    sessionStorage.removeItem(STORAGE_KEYS.USER_TOKEN);

    set({
      member: null,
      accessToken: null,
      refreshToken: null,
      userToken: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false,
      tokenExpiresAt: null,
    });
  },

  /**
   * Hydrate auth state from persisted storage on app load.
   * If refresh token exists, the app will attempt a token refresh.
   */
  hydrate: async () => {
    // If already authenticated, do nothing
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      set({ isLoading: false });
      return;
    }

    const refreshToken = cookieHelper.get(STORAGE_KEYS.REFRESH_TOKEN);
    const memberStr = sessionStorage.getItem(STORAGE_KEYS.MEMBER_PROFILE);
    const userToken = sessionStorage.getItem(STORAGE_KEYS.USER_TOKEN);

    if (refreshToken) {
      set({ isLoading: true });
      try {
        const result = await authApi.refresh(refreshToken);
        if (result.success && 'access_token' in result && result.access_token) {
          let member: MemberProfile | null = null;
          if (memberStr) {
            try {
              member = JSON.parse(memberStr) as MemberProfile;
            } catch {
              member = null;
            }
          }

          const expiresAt = Date.now() + result.expires_in * 1000;
          set({
            member,
            accessToken: result.access_token,
            refreshToken,
            userToken: userToken || null,
            sessionId: result.session_id || null, // returned dynamically on refresh
            isAuthenticated: true,
            isLoading: false,
            tokenExpiresAt: expiresAt,
          });
        } else {
          useAuthStore.getState().clearAuth();
        }
      } catch (err) {
        useAuthStore.getState().clearAuth();
      }
    } else {
      set({ isLoading: false });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
