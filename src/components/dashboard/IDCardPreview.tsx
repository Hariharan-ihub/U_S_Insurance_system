import { Shield, Radio } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { IDCardData } from '@/types/dashboard.types';

interface IDCardPreviewProps {
  cardInfo?: IDCardData;
  className?: string;
}

export function IDCardPreview({ cardInfo, className }: IDCardPreviewProps) {
  // Safe defaults
  const name = cardInfo?.member_name || 'Brandon White';
  const policyNum = cardInfo?.policy_number || 'POL-579692622';
  const groupNum = cardInfo?.group_number || 'GRP-86805';
  const planName = cardInfo?.plan_name || 'FlexChoice PPO Silver';

  return (
    <div className={cn('relative w-full max-w-sm h-52 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-800 text-white p-5 shadow-lg overflow-hidden border border-white/10 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1', className)}>
      {/* Decorative glass overlay */}
      <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay pointer-events-none" />
      
      {/* Wave details */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-accent-400/10 blur-2xl group-hover:bg-accent-400/20 transition-all" />
      <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl" />

      {/* Top section: Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <Shield className="h-5 w-5 text-accent-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 leading-none">HealthGuard</p>
            <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">Insurance System</p>
          </div>
        </div>
        <Radio className="h-4 w-4 text-white/50 animate-pulse" />
      </div>

      {/* Middle section: Plan Badge */}
      <div className="my-2 relative z-10">
        <span className="inline-block px-2.5 py-1 rounded bg-white/15 text-white text-[11px] font-bold tracking-wide backdrop-blur-sm">
          {planName}
        </span>
      </div>

      {/* Bottom section: Metadata */}
      <div className="space-y-3 relative z-10">
        {/* Member name */}
        <div>
          <p className="text-[9px] text-slate-300 uppercase font-semibold leading-none">Member Name</p>
          <p className="text-base font-bold truncate mt-0.5">{name}</p>
        </div>

        {/* Policy & Group */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[9px] text-slate-300 uppercase font-semibold leading-none">Policy Number</p>
            <p className="text-xs font-mono font-bold mt-0.5">{policyNum}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-300 uppercase font-semibold leading-none">Group Number</p>
            <p className="text-xs font-mono font-bold mt-0.5">{groupNum}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
