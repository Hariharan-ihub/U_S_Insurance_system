import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse',
        className
      )}
      {...props}
    />
  );
}
