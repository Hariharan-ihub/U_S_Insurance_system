import { apiClient } from './client';
import { API_URLS } from '@/lib/constants';
import type { PolicySummary, BillingSummary, ClaimSummary } from '@/types/dashboard.types';

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

export interface PolicyResponse {
  success: boolean;
  message?: string;
  policy: PolicySummary;
  billing: {
    deductible_used: number;
    deductible_remaining: number;
    oop_used: number;
    oop_remaining: number;
  };
}

export interface ClaimsResponse {
  success: boolean;
  message?: string;
  claims: ClaimSummary[];
}

export interface BillingResponse {
  success: boolean;
  message?: string;
  billing: BillingSummary;
  transactions: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    status: string;
  }>;
}

export const memberApi = {
  /**
   * Fetch member policy and limit details.
   */
  getPolicy: async (accessToken: string, memberId: string): Promise<PolicyResponse> => {
    const response = await apiClient.post(API_URLS.POLICY, {
      access_token: accessToken,
      member_id: memberId,
    });
    return handleResponse<PolicyResponse>(response);
  },

  /**
   * Fetch all claims for a member.
   */
  getClaims: async (accessToken: string, memberId: string): Promise<ClaimsResponse> => {
    const response = await apiClient.post(API_URLS.CLAIMS, {
      access_token: accessToken,
      member_id: memberId,
    });
    return handleResponse<ClaimsResponse>(response);
  },

  /**
   * Fetch billing details and transaction history.
   */
  getBilling: async (accessToken: string, memberId: string): Promise<BillingResponse> => {
    const response = await apiClient.post(API_URLS.BILLING, {
      access_token: accessToken,
      member_id: memberId,
    });
    return handleResponse<BillingResponse>(response);
  },
};
