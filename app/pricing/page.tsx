'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/src/lib/firebase';
import { createPurchaseRequest, hasPendingPurchaseRequest } from '@/src/services/pricing.service';
import { useAuth } from '@/src/context/AuthContext';
import { Navbar } from '@/src/components/navbar';
import Toast from '@/src/components/Toast';
import { PACKAGE_LABELS } from '@/src/config/packages';

/** Tam Dönem: liste fiyatı = kalan ay × bu birim (örnek hesap için) */
const SEASON_LIST_PER_MONTH = 2799;
/** Örnek kalan ay — gerçek tutar sipariş/kayıtta netleşir */
const SEASON_EXAMPLE_MONTHS = 3;

// ==========================================
// PAKET VERİLERİ
// ==========================================
const packages = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    subtitle: 'Aylık Koçluk',
    price: 1799,
    originalPrice: 2099,
    period: 'ay',
    color: 'bg-white',
    borderColor: 'border-black',
    shadowColor: 'rgba(0,0,0,1)',
    buttonColor: 'bg-indigo-600 text-white',
    popular: false,
    features: [
      { text: 'Haftada 1 Birebir Görüşme', included: true },
      { text: 'Koçla Mesajlaşma', included: true },
      { text: 'Kişiye Özel Çalışma Programı', included: true },
      { text: 'Konu Takip Modülü', included: true },
      { text: 'Deneme Sınavı Analizi', included: false },
      { text: '7/24 Destek Hattı', included: false },
      { text: 'Sınırsız Görüşme', included: false },
    ],
  },
  {
    id: 'turbo',
    name: 'Turbo Paket',
    subtitle: 'Sınav Özel',
    price: 2299,
    originalPrice: 2699,
    period: 'ay',
    color: 'bg-yellow-300',
    borderColor: 'border-black',
    shadowColor: 'rgba(0,0,0,1)',
    buttonColor: 'bg-black text-white',
    popular: true,
    features: [
      { text: 'Haftada 2 Birebir Görüşme', included: true },
      { text: 'Koçla Mesajlaşma', included: true },
      { text: 'Kişiye Özel Çalışma Planı', included: true },
      { text: 'Konu Takip Modülü', included: true },
      { text: 'Yapamadığın Soruları Derece Öğrencilerine Gönderme İmkanı', included: true },
      { text: 'Deneme Sınavı Analizi', included: true },
      { text: '7/24 Destek Hattı', included: true },
      { text: 'Sınırsız Görüşme', included: false },
    ],
  },
  {
    id: 'season',
    name: 'Tam Dönem',
    subtitle: 'Sezonluk',
    price: 3300,
    originalPrice: SEASON_LIST_PER_MONTH * SEASON_EXAMPLE_MONTHS,
    period: 'sezon',
    priceHint:
      `Liste: sınava kalan ay × ${SEASON_LIST_PER_MONTH.toLocaleString('tr-TR')} ₺ (örnek ${SEASON_EXAMPLE_MONTHS} ay)`,
    color: 'bg-white',
    borderColor: 'border-black',
    shadowColor: 'rgba(0,0,0,1)',
    buttonColor: 'bg-indigo-600 text-white',
    popular: false,
    features: [
      { text: 'Sınırsız Birebir Görüşme', included: true },
      { text: 'Koçla Mesajlaşma', included: true },
      { text: 'Kişiye Özel Çalışma Planı', included: true },
      { text: 'Konu Takip Modülü', included: true },
      { text: 'Deneme Sınavı Analizi', included: true },
      { text: '7/24 Destek Hattı', included: true },
      { text: 'Veli Bilgilendirme Raporları', included: true },
    ],
  },
];


// ==========================================
// PACKAGE CARD
// ==========================================
function PackageCard({
  pkg,
  currentPackage,
  onSelect,
  selecting,
  hasPendingPurchaseRequest,
}: {
  pkg: typeof packages[0];
  currentPackage: string | null;
  onSelect: (id: string) => void;
  selecting: string | null;
  hasPendingPurchaseRequest?: boolean;
}) {
  const isOwned = currentPackage === pkg.id;
  const hasAnyPackage = !!currentPackage;
  const blockSelect = hasAnyPackage || !!hasPendingPurchaseRequest;

  return (
    <div
      className={`relative h-full min-h-0 ${pkg.color} border-4 ${pkg.borderColor} rounded-xl shadow-[8px_8px_0px_0px_${pkg.shadowColor}] p-8 flex flex-col gap-6 ${pkg.popular ? 'pt-10' : ''}`}
    >
      {/* En Popüler Etiketi */}
      {pkg.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="px-5 py-1.5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full border-2 border-black">
            En Popüler
          </span>
        </div>
      )}

      {/* Header */}
      <div className="shrink-0">
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">{pkg.subtitle}</p>
        <h3 className="text-2xl font-black text-black">{pkg.name}</h3>
      </div>

      {/* Price — liste + kampanya */}
      <div className="shrink-0 space-y-2">
        <div className="inline-flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-red-500 text-white font-black text-[10px] uppercase tracking-wider rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            İndirimli
          </span>
        </div>
        {pkg.originalPrice != null && pkg.originalPrice > pkg.price && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-gray-400 line-through decoration-2 decoration-gray-500">
                {pkg.originalPrice.toLocaleString('tr-TR')}
              </span>
              <span className="text-lg font-bold text-gray-400 line-through">₺</span>
              {pkg.id === 'season' ? (
                <span className="text-xs font-bold text-gray-500">örnek liste toplamı</span>
              ) : (
                <span className="text-xs font-bold text-gray-500 uppercase">/ {pkg.period} liste</span>
              )}
            </div>
            {pkg.priceHint ? (
              <p className="text-[11px] font-medium text-gray-500 leading-snug max-w-[16rem]">{pkg.priceHint}</p>
            ) : null}
          </div>
        )}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-5xl font-black text-emerald-700">{pkg.price.toLocaleString('tr-TR')}</span>
          <span className="text-xl font-black text-black">₺</span>
          <span className="text-sm font-black text-gray-600">/ {pkg.period}</span>
        </div>
      </div>

      {/* Features — flex-1 ile kart yüksekliği doldurulur; CTA alta hizalanır */}
      <ul className="space-y-3 flex-1 min-h-0">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <span className={`text-sm font-semibold ${feature.included ? 'text-black' : 'text-gray-400 line-through'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA: kartın altına sabitlenir */}
      {isOwned ? (
        <div className="shrink-0 mt-auto flex flex-col items-center gap-3 pt-2">
          <span className="inline-block px-4 py-1.5 bg-green-400 text-black font-black text-xs uppercase tracking-widest rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Aktif Paketin
          </span>
          <div className="w-full py-4 rounded-lg font-black text-lg border-2 border-green-500 bg-green-100 text-green-700 text-center">
            Aktif Paket ✓
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(pkg.id)}
          disabled={!!selecting || blockSelect}
          className={`shrink-0 mt-auto w-full ${pkg.buttonColor} py-4 rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0`}
        >
          {selecting === pkg.id ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Kaydediliyor...
            </span>
          ) : hasAnyPackage ? (
            'Zaten Bir Paketin Var'
          ) : hasPendingPurchaseRequest ? (
            'Talebin Alındı'
          ) : (
            'Paketi Seç'
          )}
        </button>
      )}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function PricingPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [pendingPurchaseRequest, setPendingPurchaseRequest] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const effectivePackage = userRole?.purchasedPackage || null;

  useEffect(() => {
    if (!user || !db) return;
    (async () => {
      try {
        const pending = await hasPendingPurchaseRequest(db, user.uid);
        setPendingPurchaseRequest(pending);
      } catch (e) {
        console.error('Bekleyen talep kontrolü:', e);
      }
    })();
  }, [user, userRole?.purchasedPackage]);

  const handleSelectPackage = async (packageId: string) => {
    // Giriş yapmamış kullanıcıyı login'e yönlendir
    if (!user) {
      setToast({ message: 'Paket seçmek için giriş yapmalısınız.', type: 'info', isVisible: true });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    // Zaten paketi varsa engelle
    if (effectivePackage) {
      setToast({ message: 'Zaten bir paketiniz mevcut.', type: 'error', isVisible: true });
      return;
    }

    if (pendingPurchaseRequest) {
      setToast({
        message: 'Bekleyen bir satın alma talebiniz var. Onay sonrası paketiniz aktif olacak.',
        type: 'info',
        isVisible: true,
      });
      return;
    }

    if (!db) return;

    setSelecting(packageId);
    try {
      const studentName =
        userRole?.name?.trim() ||
        user.displayName?.trim() ||
        user.email?.split('@')[0] ||
        'Öğrenci';
      await createPurchaseRequest(db, {
        userId: user.uid,
        studentName,
        packageId,
      });
      setPendingPurchaseRequest(true);
      setToast({
        message:
          'Satın alma talebin alındı. Ödeme linkini tamamladıktan sonra yönetici onayıyla paketin aktifleşecek.',
        type: 'success',
        isVisible: true,
      });
    } catch (err) {
      console.error('Paket seçilirken hata:', err);
      setToast({ message: 'Paket seçilirken bir hata oluştu. Lütfen tekrar deneyin.', type: 'error', isVisible: true });
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tight mb-4">
            Sana Uygun Paketi Seç
          </h1>
          <p className="text-lg font-medium text-gray-600 max-w-2xl mx-auto">
            Paketini seç, koçunu belirle ve hedefe giden yolda ilk adımı at. Tüm paketlerde birebir koçluk desteği dahil.
          </p>

          {/* Aktif paket bilgisi */}
          {effectivePackage && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-green-100 border-2 border-green-400 rounded-xl">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-black text-green-700">
                Aktif Paketin: {PACKAGE_LABELS[effectivePackage] || effectivePackage}
              </span>
            </div>
          )}
          {!effectivePackage && pendingPurchaseRequest && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-100 border-2 border-black rounded-xl">
              <span className="text-sm font-black text-black">
                Satın alma talebin alındı — ödeme ve yönetici onayından sonra paketin aktif olacak.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              currentPackage={effectivePackage}
              onSelect={handleSelectPackage}
              selecting={selecting}
              hasPendingPurchaseRequest={pendingPurchaseRequest}
            />
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <div className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-black mb-3">Hangi paketi seçmeliyim?</h3>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              Sınava yeni hazırlanmaya başlıyorsan <span className="font-black text-black">Başlangıç Paketi</span> seninle iyi bir yol arkadaşı olacak.
              Sınavına az kaldıysa ve yoğun bir tempo istiyorsan <span className="font-black text-black">Turbo Paket</span> tam sana göre.
              Uzun soluklu, garantili bir hazırlık istiyorsan <span className="font-black text-black">Tam Dönem</span> ile her şey dahil.
            </p>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
