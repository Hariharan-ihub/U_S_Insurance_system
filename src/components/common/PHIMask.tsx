import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PHIMaskProps {
  value: string;
  type: 'ssn' | 'dob' | 'phone' | 'email' | 'generic';
  className?: string;
  allowReveal?: boolean;
}

export function PHIMask({ value, type, className, allowReveal = true }: PHIMaskProps) {
  const [revealed, setRevealed] = useState(false);

  const maskValue = (val: string): string => {
    if (!val) return '';
    switch (type) {
      case 'ssn':
        // Expect last 4 only or full. If full, mask first 5.
        if (val.length === 4) return `***-**-${val}`;
        return `***-**-${val.slice(-4)}`;
      case 'dob':
        // Format: YYYY-MM-DD -> **/**/YYYY or similar
        const parts = val.split('-');
        if (parts.length === 3) {
          return `**/**/${parts[0]}`;
        }
        return '**/********/*****';
      case 'phone':
        // Format: (XXX) XXX-XXXX -> (***) ***-XXXX
        if (val.length >= 10) {
          return `(***) ***-${val.slice(-4)}`;
        }
        return val;
      case 'email':
        // Format: a***b@domain.com
        const [local, domain] = val.split('@');
        if (local && domain) {
          return `${local[0]}***${local[local.length - 1] || ''}@${domain}`;
        }
        return val;
      default:
        return '•'.repeat(Math.max(val.length, 6));
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium', className)}>
      <span className="font-mono">{revealed ? value : maskValue(value)}</span>
      {allowReveal && (
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={revealed ? 'Hide PHI' : 'Show PHI (HIPAA Audit Event)'}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      )}
    </span>
  );
}
