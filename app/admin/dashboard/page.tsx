'use client';

import { AdminDashboardView } from '@/src/components/admin/AdminDashboardView';
import { useAdminDashboard } from '@/src/hooks/useAdminDashboard';

const ADMIN_ROLE = 'Admin' as const;

export default function AdminDashboardPage() {
  const state = useAdminDashboard();

  if (state.authLoading || !state.user || state.userRole?.role !== ADMIN_ROLE) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-black">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <AdminDashboardView {...state} />;
}
