/**
 * Öğrenci paneli verileri — istemci Firestore.
 */
import { doc, getDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { StudentDashboardProfile } from '@/src/types';

export interface StudentDashboardData {
  profile: StudentDashboardProfile;
  coachName: string | null;
}

function mapUserDocToStudentProfile(data: Record<string, unknown>): StudentDashboardProfile {
  return {
    name: typeof data.name === 'string' ? data.name : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    targetExam: typeof data.targetExam === 'string' ? data.targetExam : '',
    grade: typeof data.grade === 'string' ? data.grade : '',
    selectedCoachId: typeof data.selectedCoachId === 'string' ? data.selectedCoachId : null,
    purchasedPackage: typeof data.purchasedPackage === 'string' ? data.purchasedPackage : null,
    coachChangeUsed: data.coachChangeUsed === true,
  };
}

/**
 * Öğrenci dashboard için kullanıcı dokümanı + seçili koç adı.
 * Doküman yoksa null döner.
 */
export async function fetchStudentDashboardData(
  db: Firestore,
  uid: string
): Promise<StudentDashboardData | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, unknown>;
  const profile = mapUserDocToStudentProfile(data);

  let coachName: string | null = null;
  if (profile.selectedCoachId) {
    try {
      const coachSnap = await getDoc(doc(db, 'users', profile.selectedCoachId));
      if (coachSnap.exists()) {
        const c = coachSnap.data();
        coachName = typeof c.name === 'string' && c.name ? c.name : 'Koç';
      }
    } catch {
      // ignore
    }
  }

  return { profile, coachName };
}
