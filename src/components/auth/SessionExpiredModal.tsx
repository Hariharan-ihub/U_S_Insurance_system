import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function SessionExpiredModal() {
  const navigate = useNavigate();
  const { showSessionExpiredModal, hideSessionExpired } = useUIStore();
  const { clearAuth } = useAuthStore();

  const handleLoginRedirect = () => {
    hideSessionExpired();
    clearAuth();
    navigate('/login');
  };

  return (
    <Dialog isOpen={showSessionExpiredModal} onClose={handleLoginRedirect}>
      <DialogHeader className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <DialogTitle className="text-xl font-bold">Session Expired</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-slate-500">
          For your security and HIPAA compliance, sessions are automatically terminated after prolonged inactivity or token expiration.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button onClick={handleLoginRedirect} className="w-full">
          Return to Login
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
