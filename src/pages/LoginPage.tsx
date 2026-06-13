import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from '@/components/auth/LoginForm';
import { Shield, Lock } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Perform session hydration check on mount
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Brand Left Panel (Rich design presentation) */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950 relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-500 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-accent-500 blur-3xl" />
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-md">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary-100 to-accent-200 bg-clip-text text-transparent">
            HealthGuard Portal
          </span>
        </div>

        {/* Dynamic Presentation Text */}
        <div className="space-y-6 relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl text-white">
            Smart Health Insurance Support
          </h2>
          <p className="text-base text-slate-400 font-normal leading-relaxed">
            Access secure personal health information (PHI), manage insurance policy details, submit claims, review payments, and interact with our automated virtual care assistant 24/7.
          </p>
        </div>

        {/* Footer Notes */}
        <div className="flex items-center gap-2 text-xs text-slate-500 relative z-10">
          <Lock className="h-4 w-4" />
          <span>Restricted to Authorized Members Only. HIPAA audits are continuously active.</span>
        </div>
      </div>

      {/* Login Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950 border-l border-slate-900 relative">
        {/* Background blobs for mobile/tablet */}
        <div className="absolute inset-0 md:hidden opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-primary-500 blur-3xl" />
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile brand header */}
          <div className="flex flex-col items-center text-center md:hidden space-y-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-md">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">HealthGuard</h2>
              <p className="text-xs text-slate-500 mt-1">Authorized Insurance Portal Access</p>
            </div>
          </div>

          {/* Intro Headers for Desktop */}
          <div className="hidden md:block text-left space-y-2.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Sign In</h2>
            <p className="text-sm text-slate-400">
              Please enter your credentials to verify your health account.
            </p>
          </div>

          {/* Glassmorphic Form Card Wrapper */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <LoginForm />
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Need assistance?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please call HealthGuard Support at 1-800-555-0199 for credential assistance.');
                }}
                className="font-semibold text-primary-400 hover:text-primary-300 transition-colors"
              >
                Contact Member Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
