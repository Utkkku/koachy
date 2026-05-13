import type { Timestamp } from 'firebase/firestore';

export function formatFirestoreDate(ts: Timestamp | null | undefined): string {
  if (!ts?.toDate) return '—';
  try {
    return ts.toDate().toLocaleString('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}
