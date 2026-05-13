/**
 * Edge-compatible (Web Crypto API) HMAC session token utility.
 * SESSION_SECRET ortam değişkeni ile imzalanır.
 * Middleware ve Node.js runtime ikisinde de çalışır.
 */

export const SESSION_COOKIE = '__session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 gün (saniye)

export interface SessionPayload {
  uid: string;
  role: string;
  exp: number; // ms cinsinden unix timestamp
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET eksik veya çok kısa (min 32 karakter).');
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return new Uint8Array(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer as ArrayBuffer);
}

/** Payload'ı HMAC-SHA256 ile imzalayan token oluşturur: base64url(payload).base64url(sig) */
export async function createSessionToken(uid: string, role: string): Promise<string> {
  const payload: SessionPayload = {
    uid,
    role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(sig)}`;
}

/** Token'ı doğrular, geçerliyse payload döner; aksi halde null. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx < 1) return null;
    const payloadB64 = token.slice(0, dotIdx);
    const sigB64 = token.slice(dotIdx + 1);
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64))
    ) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
