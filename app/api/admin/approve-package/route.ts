import { FieldValue } from 'firebase-admin/firestore';
import { jsonError, jsonOk } from '@/src/server/api-response';
import { getAdminFirestore } from '@/src/lib/firebase-admin';
import { verifyAdminBearer } from '@/src/server/admin-api-auth';
import { checkRateLimit, getClientIp } from '@/src/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PackagePayload = {
  purchasedPackage?: string;
  hasPackage?: boolean;
  credits?: number;
};

/**
 * POST /api/admin/approve-package
 * Authorization: Bearer <Firebase ID token>
 * Body: { studentId, purchaseRequestId, packageData: { purchasedPackage, hasPackage?, credits? } }
 */
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit('admin-approve-package', ip, 20, 60_000);
    if (!rl.ok) {
      return jsonError(429, 'Çok fazla istek gönderildi. Lütfen bir dakika bekleyin.');
    }

    const verify = await verifyAdminBearer(request);
    if (!verify.ok) {
      return jsonError(verify.status, verify.error);
    }

    let body: {
      studentId?: string;
      purchaseRequestId?: string;
      packageData?: PackagePayload;
    };

    try {
      body = (await request.json()) as typeof body;
    } catch {
      return jsonError(400, 'Geçersiz JSON gövdesi.');
    }

    const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
    const purchaseRequestId =
      typeof body.purchaseRequestId === 'string' ? body.purchaseRequestId.trim() : '';
    const pkg = body.packageData;
    const purchasedPackage =
      typeof pkg?.purchasedPackage === 'string' ? pkg.purchasedPackage.trim() : '';

    if (!studentId || !purchaseRequestId || !purchasedPackage) {
      return jsonError(
        400,
        'studentId, purchaseRequestId ve packageData.purchasedPackage zorunludur.'
      );
    }

    if (purchasedPackage.length > 100) {
      return jsonError(400, 'Paket adı en fazla 100 karakter olabilir.');
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(studentId);
    const reqRef = db.collection('purchaseRequests').doc(purchaseRequestId);

    const [userSnap, prSnap] = await Promise.all([userRef.get(), reqRef.get()]);

    if (!userSnap.exists) {
      return jsonError(404, 'Öğrenci bulunamadı.');
    }
    if (userSnap.data()?.role !== 'Student') {
      return jsonError(400, 'Bu kayıt bir öğrenci profili değil.');
    }

    if (!prSnap.exists) {
      return jsonError(404, 'Satın alma talebi bulunamadı.');
    }
    const prData = prSnap.data();
    if (prData?.userId !== studentId) {
      return jsonError(400, 'Talep bu öğrenciye ait değil.');
    }
    if (prData?.status === 'approved') {
      return jsonError(409, 'Bu talep zaten onaylanmış.');
    }

    const hasPackage = pkg?.hasPackage !== false;
    const rawCredits =
      typeof pkg?.credits === 'number' && !Number.isNaN(pkg.credits) ? pkg.credits : 1;
    // Sınırlar: 1 ile 500 arasında tam sayı
    const credits = Math.min(Math.max(Math.floor(rawCredits), 1), 500);

    const batch = db.batch();
    batch.update(userRef, {
      purchasedPackage,
      packagePurchasedAt: FieldValue.serverTimestamp(),
      hasPackage,
      credits,
      updatedAt: FieldValue.serverTimestamp(),
    });
    batch.update(reqRef, {
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: verify.adminUid,
    });

    try {
      await batch.commit();
    } catch (e) {
      console.error('[approve-package] batch commit', e);
      return jsonError(500, 'Paket onayı kaydedilemedi.');
    }

    return jsonOk({ ok: true });
  } catch (e) {
    console.error('[approve-package]', e);
    return jsonError(500, 'Sunucu hatası.');
  }
}
