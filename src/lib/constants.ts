// ============================================
// Application Constants
// ============================================

// --- Auth Workflow URLs ---
export const AUTH_URLS = {
  LOGIN: import.meta.env.VITE_AUTH_LOGIN_URL as string,
  REFRESH: import.meta.env.VITE_AUTH_REFRESH_URL as string,
  LOGOUT: import.meta.env.VITE_AUTH_LOGOUT_URL as string,
  VERIFY: import.meta.env.VITE_AUTH_VERIFY_URL as string,
} as const;

// --- Data Workflow URLs ---
export const API_URLS = {
  DASHBOARD: import.meta.env.VITE_DASHBOARD_URL as string,
  SESSION: import.meta.env.VITE_SESSION_URL as string,
  POLICY: import.meta.env.VITE_POLICY_URL as string,
  CLAIMS: import.meta.env.VITE_CLAIMS_URL as string,
  BILLING: import.meta.env.VITE_BILLING_URL as string,
} as const;

// --- App Config ---
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'HealthGuard Insurance Portal',
  IDLE_TIMEOUT_MS: 30 * 60 * 1000,       // 30 minutes
  IDLE_WARNING_MS: 2 * 60 * 1000,         // 2 minutes before timeout
  TOKEN_REFRESH_BUFFER_MS: 60 * 1000,     // Refresh 60s before expiry
  NOTIFICATION_POLL_INTERVAL_MS: 60 * 1000, // 1 minute
} as const;

// --- Storage Keys ---
export const STORAGE_KEYS = {
  REFRESH_TOKEN: 'hg_refresh_token',
  SESSION_ID: 'hg_session_id',
  MEMBER_PROFILE: 'hg_member_profile',
  USER_TOKEN: 'hg_user_token',
  THEME: 'hg_theme',
  SIDEBAR_STATE: 'hg_sidebar',
} as const;

// --- Navigation Routes ---
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CHAT: '/chat',
  CLAIMS: '/claims',
  BILLING: '/billing',
  POLICY: '/policy',
  PROVIDERS: '/providers',
  SUPPORT: '/support',
  PROFILE: '/profile',
} as const;
