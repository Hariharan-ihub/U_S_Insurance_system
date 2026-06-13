import { Calendar, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { PolicySummary } from '@/types/dashboard.types';

interface PolicyCardProps {
  policy?: PolicySummary;
  className?: string;
}

export function PolicyCard({ policy, className }: PolicyCardProps) {
  // Safe defaults
  const planName = policy?.plan_name || 'FlexChoice PPO Silver';
  const planType = policy?.plan_type || 'PPO';
  const metalTier = policy?.metal_tier || 'Silver';
  const status = policy?.policy_status || 'active';
  const premium = policy?.premium || 440.11;
  const renewalDate = policy?.renewal_date || '2026-10-02';

  const isActive = status === 'active';

  return (
    <Card className={cn('overflow-hidden relative', className)}>
      {/* Visual Accent Bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', isActive ? 'bg-primary-600' : 'bg-amber-500')} />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pl-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Coverage</span>
          <CardTitle className="text-xl font-bold mt-1 text-slate-900 dark:text-slate-100">{planName}</CardTitle>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border',
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
          )}
        >
          {isActive ? <UserCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
          <span>{status}</span>
        </span>
      </CardHeader>

      <CardContent className="pl-8 space-y-4">
        {/* Core parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plan Category</p>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{planType} / {metalTier}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Premium</p>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{formatCurrency(premium)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Renewal Date</p>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-primary-500" />
              <span>{formatDate(renewalDate)}</span>
            </div>
          </div>
        </div>

        {/* Benefits notice */}
        <div className="flex gap-2.5 items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-400">
          <Sparkles className="h-4 w-4 text-accent-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-left leading-relaxed">
            Your plan covers <strong className="text-slate-800 dark:text-slate-200">100% of preventive services</strong> when visiting in-network providers. Specialist visits require a flat copay of $30.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
