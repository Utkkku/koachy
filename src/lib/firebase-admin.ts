/**
 * Sadece sunucu tarafında (Route Handler, Server Actions) kullanın. İstemciye import etmeyin.
 *
 * Kimlik bilgisi (öncelik sırası):
 * 1) FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *    (PRIVATE_KEY içindeki \\n satır sonları replace ile düzeltilir)
 * 2) FIREBASE_SERVICE_ACCOUNT_BASE64 — JSON dosyasının Base64’ü
 * 3) FIREBASE_SERVICE_ACCOUNT_JSON — tek satır JSON
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App | null = null;

function normalizePrivateKey(key: string): string {
  return key.replace(/\\n/g, '\n');
}

function initFromServiceAccountEnv(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error('MISSING_SERVICE_ACCOUNT');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKeyRaw),
    }),
  });
}

function loadCredentialsObjectFromJson(): object {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    try {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(json) as object;
    } catch {
      throw new Error('INVALID_SERVICE_ACCOUNT_JSON');
    }
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error('MISSING_SERVICE_ACCOUNT');
  }
  try {
    return JSON.parse(raw) as object;
  } catch {
    throw new Error('INVALID_SERVICE_ACCOUNT_JSON');
  }
}

function initFromJsonCredentials(): App {
  const credentials = loadCredentialsObjectFromJson();
  return initializeApp({ credential: cert(credentials) });
}

export function getFirebaseAdminApp(): App {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApps()[0]!;
    return app;
  }

  const hasTriplet =
    !!process.env.FIREBASE_PROJECT_ID?.trim() &&
    !!process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
    !!process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (hasTriplet) {
    app = initFromServiceAccountEnv();
    return app;
  }

  app = initFromJsonCredentials();
  return app;
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}
