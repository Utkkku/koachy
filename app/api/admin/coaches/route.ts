import { FieldValue } from 'firebase-admin/firestore';
import { jsonError, jsonOk } from '@/src/server/api-response';
import { getAdminAuth, getAdminFirestore } from '@/src/lib/firebase-admin';
import { verifyAdminBearer } from '@/src/server/admin-api-auth';
import { checkRateLimit, getClientIp } from '@/src/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit('admin-coaches', ip, 20, 60_000);
  if (!rl.ok) {
    return jsonError(429, 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.');
  }

  const verify = await verifyAdminBearer(request);
  if (!verify.ok) {
    return jsonError(verify.status, verify.error);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const password = String(body.password ?? '');
    const name = String(body.name ?? '').trim();
    const title = String(body.title ?? '').trim();
    const bio = String(body.bio ?? '').trim();
    const phone = String(body.phone ?? '').trim();

    if (!EMAIL_RE.test(email)) {
      return jsonError(400, 'Geçerli bir e-posta girin.');
    }
    if (password.length < 8) {
      return jsonError(400, 'Şifre en az 8 karakter olmalıdır.');
    }
    if (password.length > 128) {
      return jsonError(400, 'Şifre en fazla 128 karakter olabilir.');
    }
    if (!name || !title || !bio) {
      return jsonError(400, 'Ad, unvan ve bio zorunludur.');
    }
    if (name.length > 100) {
      return jsonError(400, 'Ad en fazla 100 karakter olabilir.');
    }
    if (title.length > 200) {
      return jsonError(400, 'Unvan en fazla 200 karakter olabilir.');
    }
    if (bio.length > 1000) {
      return jsonError(400, 'Bio en fazla 1000 karakter olabilir.');
    }
    if (phone.length > 20) {
      return jsonError(400, 'Telefon numarası en fazla 20 karakter olabilir.');
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    let uid: string;
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      });
      uid = userRecord.uid;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        return jsonError(409, 'Bu e-posta ile zaten bir hesap var. Farklı bir e-posta deneyin.');
      }
      if (code === 'auth/invalid-email') {
        return jsonError(400, 'E-posta adresi geçersiz.');
      }
      if (code === 'auth/weak-password') {
        return jsonError(400, 'Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      }
      console.error('[admin/coaches POST] createUser', err);
      return jsonError(500, 'Hesap oluşturulamadı. Bir süre sonra tekrar deneyin.');
    }

    try {
      await db.collection('users').doc(uid).set({
        email,
        name,
        title,
        bio,
        phone,
        role: 'Coach',
        photoURL: '',
        isApproved: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (firestoreErr) {
      console.error('[admin/coaches POST] firestore set', firestoreErr);
      try {
        await auth.deleteUser(uid);
      } catch {
        /* rollback best-effort */
      }
      return jsonError(500, 'Profil kaydedilemedi. Hesap oluşturma iptal edildi.');
    }

    return jsonOk({
      ok: true,
      uid,
      message: 'Koç hesabı oluşturuldu. Koç, bu e-posta ve şifre ile giriş yapabilir.',
    });
  } catch (e) {
    console.error('[admin/coaches POST]', e);
    return jsonError(500, 'Beklenmeyen bir hata oluştu.');
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit('admin-coaches', ip, 20, 60_000);
  if (!rl.ok) {
    return jsonError(429, 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.');
  }

  const verify = await verifyAdminBearer(request);
  if (!verify.ok) {
    return jsonError(verify.status, verify.error);
  }

  try {
    const body = (await request.json()) as { uid?: string };
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
    if (!uid) {
      return jsonError(400, 'Geçersiz koç kimliği.');
    }

    const db = getAdminFirestore();
    const coachSnap = await db.collection('users').doc(uid).get();
    if (!coachSnap.exists || coachSnap.data()?.role !== 'Coach') {
      return jsonError(404, 'Koç bulunamadı veya bu kayıt koç değil.');
    }

    const assigned = await db
      .collection('users')
      .where('role', '==', 'Student')
      .where('selectedCoachId', '==', uid)
      .limit(1)
      .get();

    if (!assigned.empty) {
      return jsonError(
        409,
        'Bu koça atanmış öğrenciler var. Önce öğrencilerin başka koç seçmesini veya kayıtlarını yönetin.'
      );
    }

    const auth = getAdminAuth();
    try {
      await auth.deleteUser(uid);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: string }).code)
          : typeof err === 'object' && err !== null && 'errorInfo' in err
            ? String((err as { errorInfo?: { code?: string } }).errorInfo?.code || '')
            : '';
      if (code !== 'auth/user-not-found' && code !== 'auth/invalid-uid') {
        console.error('[admin/coaches DELETE] deleteUser', err);
        return jsonError(500, 'Giriş hesabı silinemedi.');
      }
    }

    await db.collection('users').doc(uid).delete();
    return jsonOk({ ok: true, message: 'Koç ve giriş hesabı kaldırıldı.' });
  } catch (e) {
    console.error('[admin/coaches DELETE]', e);
    return jsonError(500, 'Beklenmeyen bir hata oluştu.');
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit('admin-coaches', ip, 20, 60_000);
  if (!rl.ok) {
    return jsonError(429, 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.');
  }

  const verify = await verifyAdminBearer(request);
  if (!verify.ok) {
    return jsonError(verify.status, verify.error);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!uid) return jsonError(400, 'Geçersiz koç kimliği.');
    if (!name || !title || !bio) return jsonError(400, 'Ad, unvan ve bio zorunludur.');
    if (name.length > 100) return jsonError(400, 'Ad en fazla 100 karakter olabilir.');
    if (title.length > 200) return jsonError(400, 'Unvan en fazla 200 karakter olabilir.');
    if (bio.length > 1000) return jsonError(400, 'Bio en fazla 1000 karakter olabilir.');
    if (phone.length > 20) return jsonError(400, 'Telefon numarası en fazla 20 karakter olabilir.');

    const db = getAdminFirestore();
    const coachRef = db.collection('users').doc(uid);
    const snap = await coachRef.get();
    if (!snap.exists || snap.data()?.role !== 'Coach') {
      return jsonError(404, 'Koç bulunamadı.');
    }

    await coachRef.update({ name, title, bio, phone, updatedAt: FieldValue.serverTimestamp() });
    return jsonOk({ ok: true, message: 'Koç güncellendi.' });
  } catch (e) {
    console.error('[admin/coaches PATCH]', e);
    return jsonError(500, 'Beklenmeyen bir hata oluştu.');
  }
}
