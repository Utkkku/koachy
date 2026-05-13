import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/src/lib/firebase-admin';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/src/lib/session';
import { checkRateLimit, getClientIp } from '@/src/server/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST — Firebase ID token'ı alır, doğrular, HttpOnly session cookie ayarlar */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit('auth-session', ip, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Çok fazla giriş denemesi. Bir dakika bekleyin.' }, { status: 429 });
  }

  try {
    let body: { idToken?: string };
    try {
      body = (await request.json()) as { idToken?: string };
    } catch {
      return NextResponse.json({ ok: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 });
    }

    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';
    if (!idToken) {
      return NextResponse.json({ ok: false, error: 'idToken gerekli.' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // Token doğrula (iptal edilmiş tokenları da yakala)
    const decoded = await auth.verifyIdToken(idToken, true);
    const snap = await db.collection('users').doc(decoded.uid).get();
    const role = (snap.data()?.role as string) ?? 'Student';

    const token = await createSessionToken(decoded.uid, role);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('[api/auth/session POST]', e);
    return NextResponse.json({ ok: false, error: 'Oturum oluşturulamadı.' }, { status: 401 });
  }
}

/** DELETE — Session cookie'yi siler (çıkış yapma) */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return res;
}
