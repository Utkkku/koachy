/**
 * Fiyatlandırma / satın alma talepleri — istemci Firestore.
 */
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export async function hasPendingPurchaseRequest(db: Firestore, userId: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(db, 'purchaseRequests'), where('userId', '==', userId))
  );
  return snap.docs.some((d) => d.data().status === 'pending');
}

export async function createPurchaseRequest(
  db: Firestore,
  params: { userId: string; studentName: string; packageId: string }
): Promise<void> {
  await addDoc(collection(db, 'purchaseRequests'), {
    userId: params.userId,
    studentName: params.studentName,
    packageId: params.packageId,
    requestedAt: serverTimestamp(),
    status: 'pending',
  });
}
