/**
 * Koç listesi — istemci Firestore (onaylı koçlar).
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { CoachListItem } from '@/src/types';

export async function fetchApprovedCoaches(db: Firestore): Promise<CoachListItem[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'Coach'),
    where('isApproved', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const item: CoachListItem = {
        id: docSnap.id,
        name: data.name || '',
        title: data.title || '',
        bio: data.bio || '',
        photoURL: data.photoURL || '',
      };
      return item;
    });
}
