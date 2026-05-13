/** Sadece uygulama içi yollar; açık yönlendirme / XSS riski yok */
export function getSafeRedirectPath(raw: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  if (t.includes('://')) return null;
  return t;
}
