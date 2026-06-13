import { CreditCard, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { BillingSummary } from '@/types/dashboard.types';

interface BillingWidgetProps {
  billing?: BillingSummary;
  className?: string;
}

export function BillingWidget({ billing, className }: BillingWidgetProps) {
  // Safe defaults
  const premium = billing?.premium_amount || 440.11;
  const dueDate = billing?.due_date || '2026-07-01';
  const status = billing?.payment_status || 'pending';

  const isPaid = status === 'paid';

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Billing & Premium</CardTitle>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border',
            isPaid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
          )}
        >
          {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          <span>{status}</span>
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium and Due Date Display */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between text-left">
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Premium Cost</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency(premium)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-slate-500">Due Date</p>
            <div className="flex items-center justify-end gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-sm">
              <Calendar className="h-4 w-4 text-primary-500" />
              <span>{formatDate(dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Action button triggers */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant={isPaid ? 'outline' : 'primary'}
            disabled={isPaid}
            onClick={() => alert('Secure credit card processor overlay is opening (sandbox)...')}
            className="w-full text-xs font-semibold py-2"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Premium
          </Button>
          <Button
            variant="outline"
            onClick={() => alert('Setting up ACH Auto-Pay is active (sandbox)...')}
            className="w-full text-xs font-semibold py-2"
          >
            Set Auto-Pay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
