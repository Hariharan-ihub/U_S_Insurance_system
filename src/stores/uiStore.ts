import { create } from 'zustand';
import type { UINotification } from '@/types/api.types';
import { STORAGE_KEYS } from '@/lib/constants';

// ============================================
// UI Store — Theme, Sidebar, Modals
// ============================================

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  showSessionExpiredModal: boolean;
  notifications: UINotification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
  addNotification: (notification: UINotification) => void;
  dismissNotification: (id: string) => void;
  initTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  showSessionExpiredModal: false,
  notifications: [],

  toggleSidebar: () => set((state) => {
    const newState = !state.sidebarOpen;
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_STATE, String(newState));
    return { sidebarOpen: newState };
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    set({ theme });
  },

  showSessionExpired: () => set({ showSessionExpiredModal: true }),
  hideSessionExpired: () => set({ showSessionExpiredModal: false }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  initTheme: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    const theme = stored || 'system';

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    set({ theme });

    // Restore sidebar state
    const sidebarStr = localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE);
    if (sidebarStr !== null) {
      set({ sidebarOpen: sidebarStr === 'true' });
    }
  },
}));
