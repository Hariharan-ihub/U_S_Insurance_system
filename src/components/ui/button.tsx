import React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-md',
          // Variants
          {
            'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-sm focus-visible:ring-primary-500':
              variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-[0.98] focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700':
              variant === 'secondary',
            'bg-accent-500 text-accent-950 hover:bg-accent-600 active:scale-[0.98] shadow-sm focus-visible:ring-accent-500':
              variant === 'accent',
            'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-sm focus-visible:ring-red-500':
              variant === 'destructive',
            'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200':
              variant === 'ghost',
            'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200':
              variant === 'outline',
          },
          // Sizes
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
