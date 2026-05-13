'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { db } from '@/src/lib/firebase';
import { fetchApprovedCoaches } from '@/src/services/coach.service';
import type { CoachListItem } from '@/src/types';
import Link from 'next/link';
import { Navbar } from '@/src/components/navbar';
import { CoachSelectConfirmModal } from '@/src/components/coaches/CoachSelectConfirmModal';
import { useAuth } from '@/src/context/AuthContext';

// ==========================================
// SKELETON CARD
// ==========================================
function SkeletonCard() {
  return (
    <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
      {/* Üst kısım: Avatar + İsim */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-black flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
        </div>
      </div>
      {/* Orta: Bio */}
      <div className="space-y-2 mb-6">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      {/* Alt: Fiyat + Buton */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
        <div className="h-6 bg-gray-200 rounded-lg w-24" />
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
      </div>
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
function EmptyState({ isSearch }: { isSearch: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 border-4 border-black rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-black mb-3">
          {isSearch ? 'Sonuç Bulunamadı' : 'Henüz Koç Yok'}
        </h3>
        <p className="text-base font-medium text-gray-600">
          {isSearch
            ? 'Arama kriterlerine uygun koç bulunamadı. Farklı bir anahtar kelime deneyin.'
            : 'Yakında harika koçlar burada listelenecek. Takipte kalın!'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// COACH CARD
// ==========================================
function CoachCard({
  coach,
  onSelectCoach,
  isGuest,
}: {
  coach: CoachListItem;
  onSelectCoach: (coach: CoachListItem) => void;
  isGuest: boolean;
}) {
  const detailLoginHref = `/login?redirect=${encodeURIComponent(`/coaches/${coach.id}`)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(`/coaches`)}`;

  return (
    <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
      {/* Üst Kısım: Profil Fotoğrafı + İsim + Unvan */}
      <div className="flex items-center gap-4 mb-4">
        {coach.photoURL ? (
          <img
            src={coach.photoURL}
            alt={coach.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-black flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-100 border-4 border-black flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-indigo-600">
              {coach.name?.charAt(0)?.toUpperCase() || 'K'}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-black text-black truncate">{coach.name || 'İsimsiz Koç'}</h3>
          {coach.title && (
            <p className="text-sm font-semibold text-gray-600 truncate">{coach.title}</p>
          )}
        </div>
      </div>

      {/* Orta Kısım: Hakkımda — misafire gösterilmez (tanıtım amaçlı liste) */}
      <div className="flex-1 mb-5">
        {isGuest ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Üyelere özel</p>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              Detaylı profil ve koç seçimi için giriş yapın veya ücretsiz kayıt olun.
            </p>
          </div>
        ) : coach.bio ? (
          <p className="text-sm font-medium text-gray-700 line-clamp-2 leading-relaxed">
            {coach.bio}
          </p>
        ) : (
          <p className="text-sm font-medium text-gray-400 italic">
            Henüz bir açıklama eklenmemiş.
          </p>
        )}
      </div>

      {/* Alt Kısım: Unvan Badge + Butonlar */}
      <div className="flex flex-col gap-4 pt-4 border-t-2 border-black">
        <div className="flex items-center justify-between gap-2 min-h-[2rem]">
          {coach.title ? (
            <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 font-bold text-xs border-2 border-indigo-300 rounded-lg uppercase tracking-wide truncate max-w-[160px]">
              {coach.title}
            </span>
          ) : (
            <span />
          )}
        </div>
        {isGuest ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-600 text-right">Koç seçmek ve mesajlaşmak için üye olun.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <Link
                href={detailLoginHref}
                className="px-4 py-2.5 bg-white text-black font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Giriş yap
              </Link>
              <Link
                href={registerHref}
                className="px-4 py-2.5 bg-indigo-600 text-white font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Kayıt ol
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-end">
            <Link
              href={`/coaches/${coach.id}`}
              className="px-4 py-2.5 bg-white text-black font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Bilgileri Gör
            </Link>
            <button
              type="button"
              onClick={() => onSelectCoach(coach)}
              className="px-4 py-2.5 bg-yellow-400 text-black font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Koç Seç
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function CoachesPage() {
  const router = useRouter();
  const { user } = useAuth();
  /** Auth çözülene kadar user null → misafir kartı (yanlışlıkla üye butonları gösterilmez) */
  const isGuest = !user;
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmCoach, setConfirmCoach] = useState<CoachListItem | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      if (!db) {
        setError('Veritabanı bağlantısı kurulamadı.');
        setLoading(false);
        return;
      }

      try {
        const coachList = await fetchApprovedCoaches(db);
        setCoaches(coachList);
      } catch (err: unknown) {
        console.error('Koçlar yüklenirken hata:', err);
        if (err instanceof FirebaseError && err.code === 'permission-denied') {
          setError('Koç verileri yüklenemedi. Firestore kuralları güncellenmiş olmalı. Lütfen "npm run deploy:rules" komutunu çalıştırın.');
        } else {
          setError('Koçlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  // Client-side filtreleme
  const filteredCoaches = useMemo(() => {
    if (!searchTerm.trim()) return coaches;

    const term = searchTerm.toLowerCase().trim();
    return coaches.filter(
      (coach) =>
        coach.name?.toLowerCase().includes(term) ||
        coach.title?.toLowerCase().includes(term)
    );
  }, [coaches, searchTerm]);

  const handleConfirmSelect = () => {
    if (!confirmCoach) return;
    router.push(`/messages?coachId=${confirmCoach.id}`);
    setConfirmCoach(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <CoachSelectConfirmModal
        isOpen={confirmCoach !== null}
        coachName={confirmCoach?.name || ''}
        onCancel={() => setConfirmCoach(null)}
        onConfirm={handleConfirmSelect}
      />

      {/* Hero / Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-6xl font-black text-black mb-4 tracking-tight text-center">
            Koçları Keşfet
          </h1>
          <p className="text-lg font-medium text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Sana en uygun koçu bul, profilini incele ve hemen çalışmaya başla.
          </p>

          {/* Arama Çubuğu */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Koç ismi veya unvan ara..."
                className="w-full pl-14 pr-6 py-4 text-lg font-medium border-4 border-black rounded-xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[3px] focus:translate-y-[3px] focus:bg-yellow-50 focus:ring-0 focus:outline-none transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center"
                >
                  <svg className="w-5 h-5 text-gray-500 hover:text-black transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Sonuç sayacı */}
            {!loading && coaches.length > 0 && (
              <p className="text-sm font-bold text-gray-500 mt-4 text-center uppercase tracking-wide">
                {searchTerm
                  ? `${filteredCoaches.length} koç bulundu`
                  : `Toplam ${coaches.length} koç`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Koç Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loading
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            // Error State
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-white border-4 border-red-500 rounded-xl shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-10 text-center max-w-md w-full">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 border-4 border-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-black mb-3">Bir Sorun Oluştu</h3>
                <p className="text-base font-medium text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-500 text-white font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : filteredCoaches.length === 0 ? (
            <EmptyState isSearch={searchTerm.trim().length > 0} />
          ) : (
            filteredCoaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
                onSelectCoach={setConfirmCoach}
                isGuest={isGuest}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
