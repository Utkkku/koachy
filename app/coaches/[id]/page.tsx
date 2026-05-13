'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Navbar } from '@/src/components/navbar';
import { CoachSelectConfirmModal } from '@/src/components/coaches/CoachSelectConfirmModal';
import { useAuth } from '@/src/context/AuthContext';

interface CoachDetail {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photoURL?: string;
}

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [coach, setCoach] = useState<CoachDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelectModal, setShowSelectModal] = useState(false);

  useEffect(() => {
    if (authLoading || !id) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/coaches/${id}`)}`);
    }
  }, [authLoading, user, id, router]);

  useEffect(() => {
    if (!id || !db) {
      setLoading(false);
      if (!id) setError('Geçersiz adres.');
      return;
    }
    if (authLoading || !user) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db!, 'users', id));
        if (!snap.exists()) {
          setError('Bu koç bulunamadı.');
          setCoach(null);
          return;
        }
        const data = snap.data();
        if (data.role !== 'Coach') {
          setError('Bu profil bir koç profili değil.');
          setCoach(null);
          return;
        }
        if (data.isApproved === false) {
          setError('Bu koç profili henüz yayında değil.');
          setCoach(null);
          return;
        }
        setCoach({
          id: snap.id,
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          photoURL: data.photoURL || '',
        });
      } catch (e) {
        console.error('[CoachDetail] yükleme hatası:', e);
        setError('Koç bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-black text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="font-bold text-gray-700">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-black text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <p className="font-bold text-gray-700 mb-6">{error || 'Koç bulunamadı.'}</p>
            <Link
              href="/coaches"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Koçlara Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmSelect = () => {
    if (!coach) return;
    router.push(`/messages?coachId=${coach.id}`);
    setShowSelectModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Navbar />

      <CoachSelectConfirmModal
        isOpen={showSelectModal}
        coachName={coach.name}
        onCancel={() => setShowSelectModal(false)}
        onConfirm={handleConfirmSelect}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={() => router.push('/coaches')}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 bg-white text-black font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Koçlara Dön
        </button>

        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start gap-8 mb-8">
              {coach.photoURL ? (
                <img
                  src={coach.photoURL}
                  alt={coach.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-black flex-shrink-0 mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-black flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <span className="text-4xl font-black text-indigo-600">
                    {coach.name?.charAt(0)?.toUpperCase() || 'K'}
                  </span>
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-black mb-2">{coach.name}</h1>
                {coach.title && (
                  <p className="text-lg font-bold text-indigo-700 mb-4">{coach.title}</p>
                )}
                <Link
                  href={`/coaches`}
                  className="text-sm font-bold text-gray-500 hover:text-black"
                >
                  ← Tüm koçlar
                </Link>
              </div>
            </div>

            <div className="border-t-4 border-black pt-8">
              <h2 className="text-sm font-black text-black uppercase tracking-wide mb-3">Hakkında</h2>
              {coach.bio ? (
                <p className="text-base font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{coach.bio}</p>
              ) : (
                <p className="text-gray-500 italic">Bu koç henüz detaylı bir açıklama eklememiş.</p>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-4 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setShowSelectModal(true)}
                className="px-6 py-3 bg-yellow-400 text-black font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Koç Seç
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
