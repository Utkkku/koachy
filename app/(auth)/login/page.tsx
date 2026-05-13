'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import Link from 'next/link';
import Toast from '@/src/components/Toast';
import { BackToHomeLink } from '@/src/components/auth/BackToHomeLink';
import {
  getFirebaseLoginErrorMessage,
  getFirebaseResetPasswordErrorMessage,
} from '@/src/utils/firebase-auth-errors';
import { getSafeRedirectPath } from '@/src/lib/auth-utils';

function LoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const { signIn, resetPassword, user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectQuery = getSafeRedirectPath(searchParams.get('redirect'));
  const registerHref = redirectQuery
    ? `/register?redirect=${encodeURIComponent(redirectQuery)}`
    : '/register';

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
    setLoading(true);

    try {
      await signIn(email, password);
      showToast('Başarıyla giriş yapıldı! Yönlendiriliyorsunuz...', 'success');
    } catch (err: unknown) {
      showToast(getFirebaseLoginErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      showToast('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.', 'success');
      setShowResetForm(false);
    } catch (err: unknown) {
      showToast(getFirebaseResetPasswordErrorMessage(err), 'error');
    } finally {
      setResetLoading(false);
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
              Tekrar Hoşgeldin! 👋
            </h1>
            <p className="text-base font-medium text-gray-700">Hesabına giriş yap ve devam et</p>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-indigo-50 focus:ring-0 focus:outline-none transition font-medium"
                placeholder="••••••••"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetForm((prev) => !prev);
                  }}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline"
                >
                  Şifremi unuttum
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {showResetForm && (
            <form onSubmit={handleResetPassword} className="mt-5 rounded-lg border-2 border-black p-4 bg-indigo-50/50">
              <label htmlFor="reset-email" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                Şifre Sıfırlama E-postası
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-white focus:ring-0 focus:outline-none transition font-medium"
                placeholder="ornek@email.com"
              />
              <button
                type="submit"
                disabled={resetLoading}
                className="mt-3 w-full bg-black text-white py-3 rounded-lg font-bold border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              Hesabın yok mu?{' '}
              <Link href={registerHref} className="text-indigo-600 font-black hover:text-indigo-700 underline">
                Kayıt ol
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-lg font-bold text-gray-600">Yükleniyor...</div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
