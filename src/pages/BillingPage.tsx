import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { memberApi, type BillingResponse } from '@/services/api/memberApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BillingWidget } from '@/components/dashboard/BillingWidget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { History, Shield, Check, Wallet, Landmark } from 'lucide-react';

export function BillingPage() {
  const { member, accessToken } = useAuthStore();
  const [data, setData] = useState<BillingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!accessToken || !member?.member_id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await memberApi.getBilling(accessToken, member.member_id);
        if (res.success) {
          setData(res);
        } else {
          throw new Error(res.message || 'Failed to fetch billing details');
        }
      } catch (err) {
        console.warn('Billing API failed, falling back to mock behavior.', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [accessToken, member]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">
          Loading billing information...
        </p>
      </div>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Billing & Payments</h2>
        <p className="text-sm text-slate-500">Manage premium invoices, automatic payments, and review payment history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area: Billing Status & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <BillingWidget billing={data?.billing} className="w-full" />

          {/* Transaction History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary-500" />
                  <span>Payment History</span>
                </CardTitle>
                <CardDescription>Statements for recent premium payments.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">Reference ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/15 transition-colors">
                          <td className="p-4 pl-6 font-mono text-xs text-slate-400">{t.id}</td>
                          <td className="p-4 text-slate-500">{formatDate(t.date)}</td>
                          <td className="p-4 text-slate-700 dark:text-slate-300">{t.method}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatCurrency(t.amount)}</td>
                          <td className="p-4 pr-6">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <Check className="h-4 w-4" />
                              <span>{t.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          <p>No premium transactions found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Payment Methods & AutoPay settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Payment Methods</CardTitle>
              <CardDescription>Manage your bank accounts and credit cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Method 1 */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-left">
                <Landmark className="h-6 w-6 text-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">Chase Bank Checking</p>
                  <p className="text-xs text-slate-400 font-mono">•••• 8294</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default</span>
              </div>

              {/* Add payment method */}
              <button
                type="button"
                onClick={() => alert('Add payment method form (sandbox)...')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-primary-600 hover:border-primary-300 dark:hover:text-primary-400 transition-colors cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>Add Payment Method</span>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-primary-50/10 dark:bg-primary-950/5 border-primary-100 dark:border-primary-900/30">
            <CardContent className="p-5 space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left">
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold mb-2">
                <Shield className="h-4 w-4" />
                <span>Premium Protection</span>
              </div>
              <p>
                In accordance with your health coverage plan rules, premium payments must clear by the 1st of each calendar month.
              </p>
              <p>
                Setting up checking account **ACH Auto-Pay** guarantees zero coverage lapse risks.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
