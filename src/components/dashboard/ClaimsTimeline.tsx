import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import type { ClaimSummary } from '@/types/dashboard.types';

interface ClaimsTimelineProps {
  claims?: ClaimSummary[];
  className?: string;
}

export function ClaimsTimeline({ claims = [], className }: ClaimsTimelineProps) {
  // Fallback default claims
  const activeClaims = claims.length > 0 ? claims : [
    { claim_id: 'b90e9d0d-1234', claim_type: 'Medical Vision', status: 'approved', billed_amount: 1162.46, service_date: '2025-08-15' },
    { claim_id: 'c210abdd-5678', claim_type: 'Dental Cleaning', status: 'approved', billed_amount: 250.00, service_date: '2025-09-01' },
    { claim_id: 'd987eccc-9012', claim_type: 'Specialist Cardiology', status: 'pending', billed_amount: 875.00, service_date: '2026-05-18' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'denied':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          <span>Recent Claims</span>
        </CardTitle>
        <Link
          to="/claims"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="relative border-l border-slate-100 dark:border-slate-800 ml-3.5 space-y-5 my-2">
          {activeClaims.map((claim) => {
            const isApproved = claim.status === 'approved';
            const isDenied = claim.status === 'denied';

            return (
              <div key={claim.claim_id} className="relative pl-6 text-left">
                {/* Timeline node icon */}
                <span className="absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm z-10">
                  {getStatusIcon(claim.status)}
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize">
                        {claim.claim_type}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {claim.claim_id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(claim.service_date)}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(claim.billed_amount)}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded uppercase border',
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : isDenied
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                      )}
                    >
                      {claim.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
