import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { memberApi, type PolicyResponse } from '@/services/api/memberApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PolicyCard } from '@/components/dashboard/PolicyCard';
import { DeductibleGauge } from '@/components/dashboard/DeductibleGauge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

export function PolicyPage() {
  const { member, accessToken } = useAuthStore();
  const [data, setData] = useState<PolicyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPolicyData = async () => {
      if (!accessToken || !member?.member_id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await memberApi.getPolicy(accessToken, member.member_id);
        if (res.success) {
          setData(res);
        } else {
          throw new Error(res.message || 'Failed to fetch policy details');
        }
      } catch (err) {
        console.warn('Policy API failed, falling back to mock behavior.', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicyData();
  }, [accessToken, member]);

  const coverageRules = [
    { service: 'Primary Care Visit', coverage: 'Covered in-network, $30 copay', type: 'copay' },
    { service: 'Specialist Consultation', coverage: `Covered in-network, $${data?.policy?.copay_specialist || 60} copay`, type: 'copay' },
    { service: 'Preventive Care Screenings', coverage: 'Covered 100%, $0 copay', type: 'free' },
    { service: 'Emergency Room Services', coverage: `${(1 - (data?.policy?.coinsurance || 0.3)) * 100}% covered after deductible`, type: 'coinsurance' },
    { service: 'Inpatient Hospital Stay', coverage: `${(1 - (data?.policy?.coinsurance || 0.3)) * 100}% covered after deductible`, type: 'coinsurance' },
    { service: 'Diagnostic Lab Tests', coverage: '90% covered in-network', type: 'coinsurance' },
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">
          Loading policy information...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Coverage & Benefits</h2>
        <p className="text-sm text-slate-500">View your active insurance policy details, limits, and coverage rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Summary and Accumulators */}
        <div className="lg:col-span-2 space-y-6">
          <PolicyCard policy={data?.policy} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">In-Network Coverage Rules</CardTitle>
              <CardDescription>Standard health care service copayments and coinsurance rates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {coverageRules.map((rule) => (
                  <div key={rule.service} className="flex justify-between items-center py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{rule.service}</p>
                      <p className="text-xs text-slate-400">In-network providers</p>
                    </div>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {rule.coverage}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deductibles and exclusions sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-6">Benefit Accumulators</h3>
            <DeductibleGauge
              deductibleUsed={data?.billing?.deductible_used}
              deductibleTotal={data?.policy?.deductible}
              oopUsed={data?.billing?.oop_used}
              oopTotal={data?.billing?.oop_used && data?.billing?.oop_remaining ? data.billing.oop_used + data.billing.oop_remaining : 6500}
            />
          </Card>

          <Card className="border-amber-200 dark:border-amber-900/30">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-950/10 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Exclusions & Limitations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
              <p>• Cosmetic surgeries are not covered unless medically necessary.</p>
              <p>• Out-of-network specialist consultations require a prior HMO referral.</p>
              <p>• Plan covers a maximum of 20 visits per year for chiropractic adjustments.</p>
              <p>• Prior authorization is mandatory for non-emergency surgeries.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
