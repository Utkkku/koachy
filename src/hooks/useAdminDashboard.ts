'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import {
  fetchAdminDashboardData,
  publishCoachProfile,
  updateStudentCoachAssignment,
} from '@/src/services/admin.service';
import type {
  AdminDashboardTab,
  AdminLogEntry,
  AssignmentRow,
  CoachOption,
  PendingCoachRow,
  PurchaseRequestRow,
} from '@/src/types';

const ADMIN_ROLE = 'Admin' as const;

export function useAdminDashboard() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('overview');
  const [pageLoading, setPageLoading] = useState(true);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequestRow[]>([]);
  const [pendingCoaches, setPendingCoaches] = useState<PendingCoachRow[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [stats, setStats] = useState({
    coaches: 0,
    students: 0,
    pendingPayments: 0,
    pendingCoachProfiles: 0,
  });

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [savingAssignment, setSavingAssignment] = useState<string | null>(null);
  const [localCoachSelection, setLocalCoachSelection] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (userRole?.role !== ADMIN_ROLE) {
      router.replace('/login');
    }
  }, [authLoading, user, userRole, router]);

  const loadDashboardData = useCallback(async () => {
    if (!db || userRole?.role !== ADMIN_ROLE) return;

    setPageLoading(true);
    try {
      const data = await fetchAdminDashboardData(db);
      setPurchaseRequests(data.purchaseRequests);
      setPendingCoaches(data.pendingCoaches);
      setAssignments(data.assignments);
      setCoachOptions(data.coachOptions);
      setLogs(data.logs);
      setStats(data.stats);
      setLocalCoachSelection(data.localCoachSelection);
    } catch (e) {
      console.error('Admin dashboard veri yükleme:', e);
      showToast('Veriler yüklenirken hata oluştu.', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [userRole?.role, showToast]);

  useEffect(() => {
    if (authLoading || userRole?.role !== ADMIN_ROLE) return;
    loadDashboardData();
  }, [authLoading, userRole?.role, loadDashboardData]);

  const handleApprovePayment = async (row: PurchaseRequestRow) => {
    if (row.status !== 'pending') return;
    const token = await auth?.currentUser?.getIdToken();
    if (!token) {
      showToast('Oturum bulunamadı. Lütfen tekrar giriş yapın.', 'error');
      return;
    }
    setApprovingId(row.id);
    try {
      const res = await fetch('/api/admin/approve-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: row.userId,
          purchaseRequestId: row.id,
          packageData: {
            purchasedPackage: row.packageId,
            hasPackage: true,
            credits: 1,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(data.error || 'Onay kaydedilemedi.', 'error');
        return;
      }
      showToast('Ödeme onaylandı; öğrenci paketi aktifleştirildi.', 'success');
      await loadDashboardData();
    } catch (e) {
      console.error('Ödeme onayı:', e);
      showToast('Onay kaydedilemedi. Ağ hatası veya sunucu yapılandırması.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handlePublishCoach = async (coachId: string) => {
    if (!db) return;
    setPublishingId(coachId);
    try {
      await publishCoachProfile(db, coachId);
      showToast('Koç profili yayında.', 'success');
      await loadDashboardData();
    } catch (e) {
      console.error('Koç yayınlama:', e);
      showToast('Profil güncellenemedi.', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const handleAssignmentChange = async (studentId: string) => {
    if (!db) return;
    const newCoachId = localCoachSelection[studentId];
    if (!newCoachId) {
      showToast('Geçerli bir koç seçin.', 'error');
      return;
    }
    setSavingAssignment(studentId);
    try {
      await updateStudentCoachAssignment(db, studentId, newCoachId);
      showToast('Koç ataması güncellendi.', 'success');
      await loadDashboardData();
    } catch (e) {
      console.error('Koç ataması:', e);
      showToast('Atama kaydedilemedi.', 'error');
    } finally {
      setSavingAssignment(null);
    }
  };

  return {
    authLoading,
    user,
    userRole,
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
    showToast,
    loadDashboardData,
    handleApprovePayment,
    handlePublishCoach,
    handleAssignmentChange,
  };
}
