'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import Toast from '@/src/components/Toast';
import { BackToHomeLink } from '@/src/components/auth/BackToHomeLink';
import { getFirebaseRegisterErrorMessage } from '@/src/utils/firebase-auth-errors';
import { BRAND_NAME } from '@/src/config/brand';
import { LegalModal } from '@/src/components/legal/LegalModal';
import { PrivacyPolicyContent } from '@/src/components/legal/PrivacyPolicyContent';
import { TermsContent } from '@/src/components/legal/TermsContent';
import { getSafeRedirectPath } from '@/src/lib/auth-utils';

function RegisterPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [legalOpen, setLegalOpen] = useState<null | 'privacy' | 'terms'>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const { signUp, user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = getSafeRedirectPath(searchParams.get('redirect'));
  const loginHref = redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : '/login';

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  useEffect(() => {
    // Eğer kullanıcı giriş yapmışsa, rolüne göre yönlendir
    if (!authLoading && user && userRole?.role) {
      const fromQuery = getSafeRedirectPath(searchParams.get('redirect'));
      if (fromQuery) {
        router.replace(fromQuery);
        return;
      }
      const redirectMap: Record<string, string> = {
        Student: '/student/dashboard',
        Coach: '/coach/dashboard',
        Admin: '/admin/dashboard',
      };
      const target = redirectMap[userRole.role];
      if (target) {
        router.replace(target);
      }
    }
  }, [user, userRole, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (!name.trim()) {
      showToast('Lütfen adınızı ve soyadınızı girin.', 'error');
      return;
    }

    if (!acceptedLegal) {
      showToast('Kayıt olmak için Gizlilik Politikası ve Kullanım Şartları’nı kabul etmelisin.', 'error');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, 'Student', name);
      showToast('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...', 'success');
    } catch (err: unknown) {
      showToast(getFirebaseRegisterErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="fixed top-3 right-3 z-30 sm:top-5 sm:right-5 md:top-6 md:right-8">
        <BackToHomeLink />
      </div>
      <div className="w-full max-w-md">
        {/* Neo-Brutalist Card */}
        <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-3 tracking-tight">
              Aramıza Katıl! 🚀
            </h1>
            <p className="text-base font-medium text-gray-700">
              Öğrenci hesabını oluştur ve {BRAND_NAME} ile çalışmaya başla
            </p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-indigo-50 focus:ring-0 focus:outline-none transition font-medium"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-indigo-50 focus:ring-0 focus:outline-none transition font-medium"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-indigo-50 focus:ring-0 focus:outline-none transition font-medium"
                placeholder="En az 6 karakter"
              />
              <p className="mt-2 text-xs font-medium text-gray-600">Şifre en az 6 karakter olmalıdır</p>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="legal"
                type="checkbox"
                checked={acceptedLegal}
                onChange={(e) => setAcceptedLegal(e.target.checked)}
                className="mt-1 h-5 w-5 border-2 border-black rounded accent-indigo-600"
              />
              <label htmlFor="legal" className="text-sm font-medium text-gray-700 leading-relaxed">
                <span>Gizlilik Politikası</span>{' '}
                <button
                  type="button"
                  onClick={() => setLegalOpen('privacy')}
                  className="font-black text-indigo-600 underline hover:text-indigo-700"
                >
                  okudum
                </button>{' '}
                <span>ve</span>{' '}
                <button
                  type="button"
                  onClick={() => setLegalOpen('terms')}
                  className="font-black text-indigo-600 underline hover:text-indigo-700"
                >
                  Kullanım Şartları
                </button>
                <span>&apos;nı kabul ediyorum.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedLegal}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              Zaten hesabın var mı?{' '}
              <Link href={loginHref} className="text-indigo-600 font-black hover:text-indigo-700 underline">
                Giriş yap
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <LegalModal
        isOpen={legalOpen === 'privacy'}
        title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
        onClose={() => setLegalOpen(null)}
      >
        <PrivacyPolicyContent variant="modal" />
      </LegalModal>

      <LegalModal
        isOpen={legalOpen === 'terms'}
        title="Kullanım Şartları"
        onClose={() => setLegalOpen(null)}
      >
        <TermsContent variant="modal" />
      </LegalModal>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-lg font-bold text-gray-600">Yükleniyor...</div>
        </div>
      }
    >
      <RegisterPageInner />
    </Suspense>
  );
}
