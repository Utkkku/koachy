import { getAdminAuth, getAdminFirestore } from '@/src/lib/firebase-admin';

export type VerifyAdminResult =
  | { ok: true; adminUid: string }
  | { ok: false; status: number; error: string };

/**
 * Authorization: Bearer <Firebase ID token>
 * Firestore users/{uid}.role === Admin (veya admin) doğrulanır.
 * Sadece sunucu (Route Handler) tarafında kullanın.
 */
export async function verifyAdminBearer(request: Request): Promise<VerifyAdminResult> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Oturum gerekli. Lütfen tekrar giriş yapın.' };
  }
  const idToken = header.slice(7).trim();
  if (!idToken) {
    return { ok: false, status: 401, error: 'Oturum gerekli.' };
  }

  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    // checkRevoked: şifre değişikliği / zorla çıkış sonrası tokenları geçersiz kılar
    const decoded = await auth.verifyIdToken(idToken);
    const snap = await db.collection('users').doc(decoded.uid).get();
    const role = snap.data()?.role;
    if (!snap.exists || (role !== 'Admin' && role !== 'admin')) {
      return { ok: false, status: 403, error: 'Bu işlem için admin yetkisi gerekir.' };
    }
    return { ok: true, adminUid: decoded.uid };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'MISSING_SERVICE_ACCOUNT') {
        return {
          ok: false,
          status: 503,
          error:
            'Sunucu yapılandırması eksik: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY veya FIREBASE_SERVICE_ACCOUNT_BASE64 / JSON (docs/ADMIN_KOÇ_API_KURULUM.md).',
        };
      }
      if (e.message === 'INVALID_SERVICE_ACCOUNT_JSON') {
        return { ok: false, status: 503, error: 'Hizmet hesabı JSON’u geçersiz.' };
      }
    }
    // #region agent log
    const errMsg = e instanceof Error ? e.message : String(e);
    const errCode = (e as {code?: string})?.code ?? 'no-code';
    console.error('[DEBUG-ADMIN-AUTH] caught:', errMsg, 'code:', errCode);
    // #endregion
    return { ok: false, status: 401, error: `Hata: ${e instanceof Error ? e.message.slice(0, 80) : String(e).slice(0, 80)}` };
  }
}
