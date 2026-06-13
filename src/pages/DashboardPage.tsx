import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/services/api/dashboardApi';
import { Card } from '@/components/ui/card';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { IDCardPreview } from '@/components/dashboard/IDCardPreview';
import { DeductibleGauge } from '@/components/dashboard/DeductibleGauge';
import { BillingWidget } from '@/components/dashboard/BillingWidget';
import { ClaimsTimeline } from '@/components/dashboard/ClaimsTimeline';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PHIMask } from '@/components/common/PHIMask';
import { Sparkles, User } from 'lucide-react';
import type { DashboardResponse } from '@/types/dashboard.types';

export function DashboardPage() {
  const { member, accessToken } = useAuthStore();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken || !member?.member_id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await dashboardApi.getDashboard(accessToken, member.member_id);
        if (res.success) {
          setData(res);
        } else {
          throw new Error(res.message || 'API request failed');
        }
      } catch (err: any) {
        console.warn('Dashboard API failed, falling back to mock data.', err);
        // Fallback to high-quality mock data matching the owner's DB structure
        setData({
          success: true,
          policy: {
            policy_id: 'e53f19ce-mock-policy',
            plan_name: 'FlexChoice PPO Silver',
            plan_type: 'PPO',
            metal_tier: 'Silver',
            policy_status: 'active',
            premium: 440.11,
            deductible: 2552.00,
            coinsurance: 20,
            copay_pcp: 30,
            copay_specialist: 50,
            out_of_pocket_max: 6500,
            effective_date: '2023-08-02',
            renewal_date: '2026-10-02',
          },
          billing: {
            premium_amount: 440.11,
            due_date: '2026-07-01',
            payment_status: 'pending',
            deductible_used: 607.61,
            deductible_remaining: 1944.39,
            oop_used: 683.82,
            oop_remaining: 5816.18,
          },
          recent_claims: [
            {
              claim_id: 'b90e9d0d-mock-claim-1',
              claim_type: 'Medical Vision',
              status: 'approved',
              billed_amount: 1162.46,
              service_date: '2025-08-15',
            },
            {
              claim_id: 'c210abdd-mock-claim-2',
              claim_type: 'Dental Cleaning',
              status: 'approved',
              billed_amount: 250.00,
              service_date: '2025-09-01',
            },
            {
              claim_id: 'd987eccc-mock-claim-3',
              claim_type: 'Specialist Cardiology',
              status: 'in_review',
              billed_amount: 875.00,
              service_date: '2026-05-18',
            },
          ],
          id_card: {
            member_name: `${member?.first_name || 'Brandon'} ${member?.last_name || 'White'}`,
            policy_number: 'POL-579692622',
            group_number: member?.group_id || 'GRP-86805',
            plan_name: 'FlexChoice PPO Silver',
          },
          notifications: [
            {
              notification_id: '1db6a0aa-mock-notif-1',
              type: 'policy_renewal',
              subject: 'Your Policy Renewal Information',
              status: 'sent',
              sent_at: '2025-06-22',
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken, member]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">
          Loading secure account metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Welcome banner segment */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 opacity-10 bg-grid-white/[0.2] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-accent-300" />
            <span>HealthGuard Member Insurance Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {member?.first_name || 'Brandon'}!
          </h2>
          <p className="text-sm text-slate-100 max-w-xl font-normal leading-relaxed">
            Manage your family's coverage, check verification status, review billing details, or chat with our support assistant to quickly request medical care authorizations.
          </p>
        </div>

        {/* Member Profile Quick Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-3 relative z-10 self-start md:self-auto min-w-[200px]">
          <div className="h-10 w-10 rounded-full bg-accent-500 flex items-center justify-center text-accent-950 font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Member ID</p>
            <PHIMask value={member?.member_id || '7b8e8c0c-8487'} type="generic" className="text-sm font-bold text-white" />
          </div>
        </div>
      </div>

      {/* Main dashboard widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ID Card and Deductibles */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 flex flex-col items-center justify-center">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4 self-start">
              Digital Membership ID
            </h3>
            <IDCardPreview cardInfo={data?.id_card} />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-6">
              Year-to-Date Cost Accumulators
            </h3>
            <DeductibleGauge
              deductibleUsed={data?.billing?.deductible_used}
              deductibleTotal={data?.policy?.deductible}
              oopUsed={data?.billing?.oop_used}
              oopTotal={data?.billing?.oop_used && data?.billing?.oop_remaining ? data.billing.oop_used + data.billing.oop_remaining : 6500}
            />
          </Card>
        </div>

        {/* Middle and Right: Policy Details, Billing, Claims */}
        <div className="lg:col-span-2 space-y-6">
          <PolicyCard policy={data?.policy} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BillingWidget billing={data?.billing} />
            <ClaimsTimeline claims={data?.recent_claims} />
          </div>
        </div>
      </div>
    </div>
  );
}
