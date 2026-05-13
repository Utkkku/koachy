'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import Toast from '@/src/components/Toast';
import { BackToHomeLink } from '@/src/components/auth/BackToHomeLink';
import { auth } from '@/src/lib/firebase';

type Step = 'form' | 'done' | 'invalid';

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const isValidLink = useMemo(() => mode === 'resetPassword' && !!oobCode, [mode, oobCode]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(isValidLink ? 'form' : 'invalid');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !oobCode) {
      setStep('invalid');
      return;
    }

    if (password.length < 6) {
      showToast('Şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Şifreler birbiriyle eşleşmiyor.', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setStep('done');
      showToast('Şifren başarıyla güncellendi. Giriş yapabilirsin.', 'success');
      window.setTimeout(() => router.push('/login'), 1400);
    } catch (error) {
      console.error('[auth] confirmPasswordReset failed:', error);
      setStep('invalid');
      showToast('Bağlantı geçersiz veya süresi dolmuş. Yeni bir sıfırlama e-postası isteyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="fixed top-3 right-3 z-30 sm:top-5 sm:right-5 md:top-6 md:right-8">
        <BackToHomeLink />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-3 tracking-tight">Şifre Sıfırla</h1>
            <p className="text-base font-medium text-gray-700">Hesabın için yeni bir şifre belirle</p>
          </div>

          {step === 'form' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Yeni Şifre
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
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-black mb-2 uppercase tracking-wide"
                >
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-indigo-50 focus:ring-0 focus:outline-none transition font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center">
              <p className="text-green-700 font-bold mb-4">Şifren güncellendi, giriş sayfasına yönlendiriliyorsun.</p>
              <Link href="/login" className="text-indigo-600 font-black underline">
                Giriş sayfasına git
              </Link>
            </div>
          )}

          {step === 'invalid' && (
            <div className="text-center">
              <p className="text-red-700 font-bold mb-4">
                Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar “Şifremi unuttum” isteği gönder.
              </p>
              <Link href="/login" className="text-indigo-600 font-black underline">
                Giriş sayfasına dön
              </Link>
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-lg font-bold text-gray-600">Yükleniyor...</div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

