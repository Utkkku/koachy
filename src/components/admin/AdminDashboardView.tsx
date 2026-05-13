'use client';

import Toast from '@/src/components/Toast';
import { useAdminDashboard } from '@/src/hooks/useAdminDashboard';
import { ADMIN_TABS, CARD, NAV_BTN, NAV_BTN_ACTIVE } from './admin-dashboard-constants';
import { OverviewTab } from './tabs/OverviewTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { CoachesTab } from './tabs/CoachesTab';
import { UsersTab } from './tabs/UsersTab';

export type AdminDashboardViewProps = ReturnType<typeof useAdminDashboard>;

export function AdminDashboardView(props: AdminDashboardViewProps) {
  const {
    activeTab,
    setActiveTab,
    pageLoading,
    purchaseRequests,
    pendingCoaches,
    assignments,
    coachOptions,
    logs,
    stats,
    approvingId,
    publishingId,
    savingAssignment,
    localCoachSelection,
    setLocalCoachSelection,
    toast,
    setToast,
    handleApprovePayment,
    handlePublishCoach,
    handleAssignmentChange,
  } = props;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />

      <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className={`${CARD} p-4 space-y-2`}>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Menü</p>
            {ADMIN_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === t.id ? NAV_BTN_ACTIVE : NAV_BTN
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 space-y-8">
          <header className="border-b-4 border-black pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">Yönetim Paneli</h1>
            <p className="text-base font-medium text-gray-600 mt-1">
              Link ile ödeme talepleri, koç onayları ve sistem hareketleri.
            </p>
          </header>

          {activeTab === 'overview' && <OverviewTab pageLoading={pageLoading} stats={stats} />}

          {activeTab === 'payments' && (
            <PaymentsTab
              pageLoading={pageLoading}
              purchaseRequests={purchaseRequests}
              approvingId={approvingId}
              handleApprovePayment={handleApprovePayment}
            />
          )}

          {activeTab === 'coaches' && (
            <CoachesTab
              pageLoading={pageLoading}
              pendingCoaches={pendingCoaches}
              publishingId={publishingId}
              handlePublishCoach={handlePublishCoach}
              assignments={assignments}
              coachOptions={coachOptions}
              savingAssignment={savingAssignment}
              localCoachSelection={localCoachSelection}
              setLocalCoachSelection={setLocalCoachSelection}
              handleAssignmentChange={handleAssignmentChange}
            />
          )}

          {activeTab === 'users' && <UsersTab pageLoading={pageLoading} logs={logs} />}
        </div>
      </div>
    </div>
  );
}
