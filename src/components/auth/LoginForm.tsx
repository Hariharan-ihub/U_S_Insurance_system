import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';
import { loginSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setApiError(null);

    // Validate using Zod schema
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Execute workflow login (WF-1)
      const response = await authApi.login(email, password);

      if (response.success && 'access_token' in response) {
        // Update store with profile and token data
        setAuthenticated(response);
        // Redirect to dashboard page
        navigate('/', { replace: true });
      } else {
        const errorMsg = (response as any).message || (response as any).error || 'Authentication failed. Please verify credentials.';
        setApiError(errorMsg);
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      // Friendly message based on status code/network error
      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setApiError('Unable to connect to security gateway. Please verify your connection.');
      } else {
        setApiError('An unexpected gateway authentication error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Security alert notification if API failure */}
      {apiError && (
        <div className="flex gap-2.5 items-start p-3.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium text-left">{apiError}</p>
        </div>
      )}

      {/* Controlled Fields */}
      <Input
        type="email"
        label="Email Address"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={formErrors.email}
        disabled={isLoading}
        autoComplete="email"
        required
      />

      <Input
        type="password"
        label="Secure Password"
        placeholder="Enter your secure password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={formErrors.password}
        disabled={isLoading}
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 select-none cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
            disabled={isLoading}
          />
          <span>Remember email</span>
        </label>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert('To reset your credentials, please contact your insurance program administrator.');
          }}
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full py-2.5 font-semibold text-sm shadow-md" isLoading={isLoading}>
        Secure Sign In
      </Button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>End-to-End HIPAA Cryptographic Protection</span>
      </div>
    </form>
  );
}
