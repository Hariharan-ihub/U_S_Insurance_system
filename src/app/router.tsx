import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ChatPage } from '@/pages/ChatPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { BillingPage } from '@/pages/BillingPage';
import { PolicyPage } from '@/pages/PolicyPage';
import { ProvidersPage } from '@/pages/ProvidersPage';
import { SupportPage } from '@/pages/SupportPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes (requires login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Redirect empty paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
