/**
 * Basit in-memory sliding-window rate limiter.
 * Next.js Node.js runtime'da çalışır; production ortamında Redis tercih edilebilir.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// storeId → (key → entry)
const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(storeId: string): Map<string, RateLimitEntry> {
  let store = stores.get(storeId);
  if (!store) {
    store = new Map();
    stores.set(storeId, store);
  }
  return store;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * İstek sayısını kontrol eder.
 * @param storeId  - Endpoint adı (farklı sınır setleri için ayrı store)
 * @param key      - İstemci anahtarı (genellikle IP)
 * @param max      - windowMs içinde izin verilen max istek sayısı
 * @param windowMs - Zaman penceresi (ms)
 */
export function checkRateLimit(
  storeId: string,
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(storeId);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { ok: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

/** Request headers'dan istemci IP'sini çıkarır (proxy desteği dahil) */
export function getClientIp(request: Request): string {
  const headers = request.headers as Headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
