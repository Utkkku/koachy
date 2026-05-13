/**
 * Admin paneli — istemci Firestore okuma/yazma (yalnızca yetkili kullanıcı + kurallar).
 */
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import type { AdminDashboardData } from '@/src/types';

export async function fetchAdminDashboardData(db: Firestore): Promise<AdminDashboardData> {
  const [usersSnap, purchaseSnap, conversationsSnap, coachCountSnap, studentCountSnap] =
    await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'purchaseRequests')),
      getDocs(collection(db, 'conversations')),
      getDocs(query(collection(db, 'users'), where('role', '==', 'Coach'))),
      getDocs(query(collection(db, 'users'), where('role', '==', 'Student'))),
    ]);

  const usersById = new Map<string, { name?: string; email?: string; role?: string }>();
  usersSnap.docs.forEach((d) => {
    const data = d.data();
    usersById.set(d.id, {
      name: data.name,
      email: data.email,
      role: data.role,
    });
  });

  const purchaseRequests = purchaseSnap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: String(data.userId ?? ''),
        studentName: String(data.studentName ?? ''),
        packageId: String(data.packageId ?? ''),
        requestedAt: (data.requestedAt as Timestamp) ?? null,
        status: (data.status === 'approved' ? 'approved' : 'pending') as 'pending' | 'approved',
      };
    })
    .sort((a, b) => {
      const ta = a.requestedAt?.toMillis?.() ?? 0;
      const tb = b.requestedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });

  const coachDocs = usersSnap.docs.filter((d) => d.data().role === 'Coach');
  const pendingCoaches: AdminDashboardData['pendingCoaches'] = [];
  const coachOptions: AdminDashboardData['coachOptions'] = [];

  coachDocs.forEach((d) => {
    const data = d.data();
    const isApproved = data.isApproved !== false;
    if (data.isApproved === false) {
      pendingCoaches.push({
        id: d.id,
        name: data.name || '',
        email: data.email || '',
        title: data.title,
        createdAt: (data.createdAt as Timestamp) ?? null,
      });
    }
    if (isApproved) {
      coachOptions.push({ id: d.id, name: data.name || data.email || d.id });
    }
  });
  coachOptions.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  const assignments: AdminDashboardData['assignments'] = [];
  usersSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.role !== 'Student' || !data.selectedCoachId) return;
    const coachId = String(data.selectedCoachId);
    const coach = usersById.get(coachId);
    assignments.push({
      studentId: d.id,
      studentName: data.name || data.email || d.id,
      selectedCoachId: coachId,
      coachName: coach?.name || coach?.email || coachId,
    });
  });
  assignments.sort((a, b) => a.studentName.localeCompare(b.studentName, 'tr'));

  const localCoachSelection: Record<string, string> = {};
  assignments.forEach((r) => {
    localCoachSelection[r.studentId] = r.selectedCoachId || '';
  });

  const logs: AdminDashboardData['logs'] = [];
  usersSnap.docs.forEach((d) => {
    const data = d.data();
    const created = data.createdAt as Timestamp | undefined;
    if (created?.toDate) {
      logs.push({
        id: `u-${d.id}`,
        at: created.toDate(),
        line: `${data.name || data.email || d.id} (${data.role || '?'}) platforma katıldı`,
      });
    }
  });

  conversationsSnap.docs.forEach((d) => {
    const data = d.data();
    const at = data.lastMessageAt as Timestamp | undefined;
    if (at?.toDate) {
      const sn = data.studentName || 'Öğrenci';
      const cn = data.coachName || 'Koç';
      const lm = data.lastMessage ? `"${String(data.lastMessage).slice(0, 80)}..."` : 'mesaj';
      logs.push({
        id: `c-${d.id}`,
        at: at.toDate(),
        line: `${sn} ↔ ${cn}: ${lm}`,
      });
    }
  });

  logs.sort((a, b) => b.at.getTime() - a.at.getTime());

  const stats = {
    coaches: coachCountSnap.size,
    students: studentCountSnap.size,
    pendingPayments: purchaseRequests.filter((r) => r.status === 'pending').length,
    pendingCoachProfiles: pendingCoaches.length,
  };

  return {
    purchaseRequests,
    pendingCoaches,
    assignments,
    coachOptions,
    logs: logs.slice(0, 80),
    stats,
    localCoachSelection,
  };
}

export async function publishCoachProfile(db: Firestore, coachId: string): Promise<void> {
  await updateDoc(doc(db, 'users', coachId), {
    isApproved: true,
    updatedAt: serverTimestamp(),
  });
}

export async function updateStudentCoachAssignment(
  db: Firestore,
  studentId: string,
  coachId: string
): Promise<void> {
  await updateDoc(doc(db, 'users', studentId), {
    selectedCoachId: coachId,
    updatedAt: serverTimestamp(),
  });
}
