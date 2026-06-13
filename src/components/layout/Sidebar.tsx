import { NavLink, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  CreditCard,
  User,
  LogOut,
  Sun,
  Moon,
  Laptop,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const { member, sessionId, accessToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (sessionId && accessToken) {
      try {
        await authApi.logout(sessionId, accessToken);
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Policy & Coverage', path: '/policy', icon: ShieldCheck },
    { name: 'Claims Center', path: '/claims', icon: FileText },
    { name: 'Billing & Payments', path: '/billing', icon: CreditCard },
    { name: 'Member Profile', path: '/profile', icon: User },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-all duration-300 z-30',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent truncate">
              HealthGuard
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen ? (
                <span>{item.name}</span>
              ) : (
                <span className="absolute left-16 bg-slate-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme and Account Action Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        {/* Theme Toggles */}
        <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-900 rounded-lg p-1">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-slate-700 transition-all cursor-pointer',
              theme === 'light' && 'bg-white text-primary-600 shadow-sm'
            )}
            title="Light Mode"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-slate-300 transition-all cursor-pointer',
              theme === 'dark' && 'bg-slate-800 text-primary-400 shadow-sm'
            )}
            title="Dark Mode"
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer',
              theme === 'system' && 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
            )}
            title="System Theme"
          >
            <Laptop className="h-4 w-4" />
          </button>
        </div>

        {/* Member Profile Quick View / Logout */}
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg',
            sidebarOpen && 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
            {member?.first_name?.[0] || 'U'}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-none">
                {member?.first_name} {member?.last_name}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {member?.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
