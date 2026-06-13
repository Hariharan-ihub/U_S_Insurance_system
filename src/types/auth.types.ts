// ============================================
// Auth & Session Types
// ============================================

export interface MemberProfile {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  enrollment_status: 'active' | 'inactive' | 'suspended';
  group_id: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  access_token: string;
  refresh_token: string;
  user_token: string;
  expires_in: number;
  session_id: string;
  member: MemberProfile;
}

export interface LoginErrorResponse {
  success: false;
  error: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'MEMBER_NOT_FOUND';
  message: string;
}

export type LoginResult = LoginResponse | LoginErrorResponse;

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  success: true;
  access_token: string;
  expires_in: number;
  session_id?: string;
}

export interface RefreshErrorResponse {
  success: false;
  error: 'TOKEN_EXPIRED' | 'SESSION_REVOKED';
  message: string;
}

export type RefreshResult = RefreshResponse | RefreshErrorResponse;

export interface LogoutRequest {
  session_id: string;
  access_token: string;
}

export interface VerifyRequest {
  access_token: string;
}

export interface VerifyResponse {
  success: true;
  member: MemberProfile;
  session_id: string;
}

export interface VerifyErrorResponse {
  success: false;
  error: 'SESSION_EXPIRED';
  message: string;
}

export type VerifyResult = VerifyResponse | VerifyErrorResponse;
