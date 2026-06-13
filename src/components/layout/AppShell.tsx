import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SessionExpiredModal } from '@/components/auth/SessionExpiredModal';
import { ShieldAlert, MessageCircle } from 'lucide-react';

export function AppShell() {
  // Mount token refresh hook to auto-rotate JWT tokens in the background
  useTokenRefresh();

  // Mount idle timeout warning (30 mins inactivity)
  const { showWarning, dismissWarning } = useIdleTimeout();

  // Retrieve secure token for chat redirection
  const { userToken } = useAuthStore();

  const handleChatRedirect = () => {
    if (userToken) {
      window.location.href = `https://agents.snsihub.ai/chat/pc_b05828347f884696affc9ac0f18e955c?token=${userToken}`;
    } else {
      alert('Secure session token is still initializing, please try again in a moment.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
        {/* Header Bar */}
        <Header />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        {/* Floating Chat Icon (Bottom Left of the page/main panel) */}
        <button
          onClick={handleChatRedirect}
          className="absolute bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
          title="Secure AI Chat Assistant"
        >
          <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute left-16 bg-slate-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
            AI Chat Assistant
          </span>
        </button>
      </div>

      {/* Global Inactivity Warning Modal */}
      <Dialog isOpen={showWarning} onClose={dismissWarning}>
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-4 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold">Inactivity Warning</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-slate-500">
            For HIPAA protection, you will be logged out in 2 minutes due to inactivity. Do you want to continue your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={dismissWarning} className="w-full">
            Continue Session
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Global Session Expired Modal */}
      <SessionExpiredModal />
    </div>
  );
}
