import { apiClient } from './client';
import { API_URLS } from '@/lib/constants';
import type { DashboardResponse } from '@/types/dashboard.types';

// ============================================
// Dashboard API — Calls WF-5
// ============================================

export const dashboardApi = {
  /**
   * WF-5: Fetch aggregated dashboard data for a member.
   */
  getDashboard: async (
    accessToken: string,
    memberId: string
  ): Promise<DashboardResponse> => {
    const response = await apiClient.post(API_URLS.DASHBOARD, {
      access_token: accessToken,
      member_id: memberId,
    });
    return response.data;
  },
};
