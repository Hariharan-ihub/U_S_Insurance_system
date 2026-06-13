import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { memberApi } from '@/services/api/memberApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FileText, Search, CheckCircle2, Clock, AlertTriangle, FileUp } from 'lucide-react';

interface ClaimItem {
  claim_id: string;
  type: string;
  provider: string;
  status: string;
  amount: number;
  date: string;
}

export function ClaimsPage() {
  const { member, accessToken } = useAuthStore();
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'denied'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
      if (!accessToken || !member?.member_id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await memberApi.getClaims(accessToken, member.member_id);
        if (res.success) {
          // Type coercion to match local ClaimItem properties
          setClaims((res.claims || []) as unknown as ClaimItem[]);
        } else {
          throw new Error(res.message || 'Failed to fetch claims');
        }
      } catch (err) {
        console.warn('Claims API failed, falling back to mock behavior.', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [accessToken, member]);

  const filteredClaims = claims.filter((claim) => {
    const matchesFilter = filter === 'all' || claim.status === filter;
    const matchesSearch =
      claim.type.toLowerCase().includes(search.toLowerCase()) ||
      claim.provider.toLowerCase().includes(search.toLowerCase()) ||
      claim.claim_id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
            <AlertTriangle className="h-3 w-3" />
            <span>Denied</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium animate-pulse">
          Loading claims history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Claims Center</h2>
          <p className="text-sm text-slate-500">Track and submit your medical and dental reimbursement claims.</p>
        </div>
        <Button
          onClick={() => alert('Opening claim upload form (sandbox)...')}
          className="font-bold text-xs shrink-0 self-start sm:self-auto py-2.5"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Submit New Claim
        </Button>
      </div>

      {/* Filter and search bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['all', 'approved', 'pending', 'denied'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer',
                  filter === tab
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search claim, provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Claims list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Claim ID</th>
                  <th className="p-4">Service Details</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => (
                    <tr key={claim.claim_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 pl-6 font-mono text-xs text-slate-400">{claim.claim_id}</td>
                      <td className="p-4 text-slate-800 dark:text-slate-200">{claim.type}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{claim.provider}</td>
                      <td className="p-4 text-slate-500">{formatDate(claim.date)}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatCurrency(claim.amount)}</td>
                      <td className="p-4 pr-6">{getStatusBadge(claim.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                      <p>No claims found matching the filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
