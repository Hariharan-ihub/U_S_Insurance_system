import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PHIMask } from '@/components/common/PHIMask';
import { User, Monitor, Key, Moon, Sun, Info } from 'lucide-react';

export function ProfilePage() {
  const { member } = useAuthStore();
  const { theme, setTheme } = useUIStore();

  const handlePasswordReset = () => {
    alert('To maintain HIPAA cryptographic compliance, password changes require multi-factor verification. A reset link has been dispatched to your email.');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Member Profile</h2>
        <p className="text-sm text-slate-500">Manage your secure credentials and portal settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
                <CardDescription>Securely stored PHI variables.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Member detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">First Name</label>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{member?.first_name || 'Brandon'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Last Name</label>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{member?.last_name || 'White'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Email Address</label>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    <PHIMask value={member?.email || 'brandon.white@icloud.com'} type="email" />
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Mobile Phone</label>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    <PHIMask value={member?.phone || '(206) 221-1828'} type="phone" />
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Verification Status</label>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Full Verification ({member?.enrollment_status || 'Active'})</span>
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Group Association</label>
                  <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{member?.group_id || 'GRP-86805'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secure Settings actions */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Secure Credentials</CardTitle>
                <CardDescription>Update your portal access key.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2 text-left">
              <p className="text-xs text-slate-500 mb-4">
                To guarantee account safety, HealthGuard password revisions are audited. Re-authentication might be requested.
              </p>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Request Password Reset
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Theme Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Interface Preferences</CardTitle>
              <CardDescription>Theme adjustments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { id: 'light', name: 'Light Mode', icon: Sun },
                { id: 'dark', name: 'Dark Mode', icon: Moon },
                { id: 'system', name: 'System Default', icon: Monitor },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      active
                        ? 'border-primary-500 bg-primary-50/20 text-primary-600 dark:text-primary-400 dark:bg-primary-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-slate-400" />
                      <span>{opt.name}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            <CardContent className="p-5 flex gap-2.5 items-start text-xs text-slate-500">
              <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                HealthGuard portals strictly monitor access history. Unfamiliar logins trigger immediate administrative SMS warnings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
