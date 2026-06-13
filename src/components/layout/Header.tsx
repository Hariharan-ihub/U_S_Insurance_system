import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Menu, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { member } = useAuthStore();
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/chat':
        return 'AI Chat Assistant';
      case '/policy':
        return 'My Policy';
      case '/claims':
        return 'Claims Center';
      case '/billing':
        return 'Billing & Payments';
      case '/profile':
        return 'Profile Settings';
      case '/providers':
        return 'Find Care & Providers';
      case '/support':
        return 'Help & Support';
      default:
        return 'HealthGuard Portal';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6 z-20 w-full">
      {/* Left side: Mobile Toggle + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:ml-0">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Connection Status & Quick Profile */}
      <div className="flex items-center gap-4">
        {/* HIPAA Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/30">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>HIPAA Secure Connection</span>
        </div>

        {/* Hello Greeting */}
        <span className="hidden md:inline text-sm text-slate-500">
          Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{member?.first_name || 'Member'}</span>
        </span>
      </div>
    </header>
  );
}
