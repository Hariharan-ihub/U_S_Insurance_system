import { authClient } from './client';
import { AUTH_URLS } from '@/lib/constants';
import { hashPassword } from '@/lib/crypto';
import type {
  LoginResult,
  RefreshResult,
  VerifyResult,
} from '@/types/auth.types';

// ============================================
// Helper to extract data from n8n items wrapper
// ============================================
const handleResponse = <T>(response: any): T => {
  const rawData = response.data;
  if (rawData?.items?.[0]?.json) {
    return rawData.items[0].json as T;
  }
  return rawData as T;
};

// ============================================
// Auth API — Calls WF-1 to WF-4
// ============================================

export const authApi = {
  /**
   * WF-1: Login — email + hashed password → opaque tokens + member profile
   * Password is hashed on the client using PBKDF2-SHA512 (same method as
   * the members.password_hash field in the database) before being sent to
   * the /webhook/auth/opaque/login endpoint.
   * Payload format:  { email, password: "salt_hex:hash_hex" }
   */
  login: async (email: string, password: string): Promise<LoginResult> => {
    const hashedPassword = await hashPassword(password, email);
    const response = await authClient.post(AUTH_URLS.LOGIN, {
      email,
      password: hashedPassword,
    });
    return handleResponse<LoginResult>(response);
  },

  /**
   * WF-2: Token Refresh — refresh token → new access token
   */
  refresh: async (refreshToken: string): Promise<RefreshResult> => {
    const response = await authClient.post(AUTH_URLS.REFRESH, {
      refresh_token: refreshToken,
    });
    return handleResponse<RefreshResult>(response);
  },

  /**
   * WF-3: Logout — invalidate session
   */
  logout: async (sessionId: string, accessToken: string): Promise<any> => {
    const response = await authClient.post(AUTH_URLS.LOGOUT, {
      session_id: sessionId,
      access_token: accessToken,
    });
    return handleResponse<any>(response);
  },

  /**
   * WF-4: Verify — validate access token + return fresh member profile
   */
  verify: async (accessToken: string): Promise<VerifyResult> => {
    const response = await authClient.post(AUTH_URLS.VERIFY, {
      access_token: accessToken,
    });
    return handleResponse<VerifyResult>(response);
  },
};
