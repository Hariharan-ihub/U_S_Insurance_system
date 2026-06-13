import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/formatters';

interface DeductibleGaugeProps {
  deductibleUsed?: number;
  deductibleTotal?: number;
  oopUsed?: number;
  oopTotal?: number;
  className?: string;
}

export function DeductibleGauge({
  deductibleUsed = 607.61,
  deductibleTotal = 2552.00,
  oopUsed = 683.82,
  oopTotal = 6500.00,
  className,
}: DeductibleGaugeProps) {
  // Percent calculations
  const deductiblePct = Math.min(Math.round((deductibleUsed / deductibleTotal) * 100), 100);
  const oopPct = Math.min(Math.round((oopUsed / oopTotal) * 100), 100);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Deductible Progress Bar */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between text-sm">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Annual Deductible</h4>
            <p className="text-xs text-slate-400">Amount you pay before coinsurance kicks in</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(deductibleUsed)}
            </span>
            <span className="text-slate-400"> / {formatCurrency(deductibleTotal)}</span>
          </div>
        </div>

        {/* Progress bar tracks */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${deductiblePct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{deductiblePct}% met</span>
          <span>{formatCurrency(deductibleTotal - deductibleUsed)} remaining</span>
        </div>
      </div>

      {/* OOP Maximum Progress Bar */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between text-sm">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Out-of-Pocket Maximum</h4>
            <p className="text-xs text-slate-400">The absolute limit of what you will pay this year</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(oopUsed)}
            </span>
            <span className="text-slate-400"> / {formatCurrency(oopTotal)}</span>
          </div>
        </div>

        {/* Progress bar tracks */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${oopPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>{oopPct}% met</span>
          <span>{formatCurrency(oopTotal - oopUsed)} remaining</span>
        </div>
      </div>
    </div>
  );
}
