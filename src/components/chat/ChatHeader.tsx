'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useRouter } from 'next/navigation';
import Toast from '@/src/components/Toast';
import { getConversationId } from '@/src/services/chat.service';

interface ChatHeaderProps {
  coachId: string;
  coachName: string;
  coachPhotoURL: string;
  studentUid: string;
  /** Already selected coach from AuthContext */
  initialSelectedCoachId: string | null;
  /** Student's purchased package (null = no package) */
  purchasedPackage: string | null;
  /** Tek seferlik değişim kullanıldı mı */
  initialCoachChangeUsed: boolean;
  /** Paket olmadan tanışma (tek seferlik) sohbeti — koç iletişim bilgisi gösterilmez */
  introMessagingActive?: boolean;
  /** Called after selecting coach so parent can update state */
  onCoachSelected: (coachId: string) => void;
  /** Show mobile sidebar toggle */
  onOpenSidebar: () => void;
}

export default function ChatHeader({
  coachId,
  coachName,
  coachPhotoURL,
  studentUid,
  initialSelectedCoachId,
  purchasedPackage,
  initialCoachChangeUsed,
  introMessagingActive = false,
  onCoachSelected,
  onOpenSidebar,
}: ChatHeaderProps) {
  const router = useRouter();
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(initialSelectedCoachId);
  const [coachChangeUsed, setCoachChangeUsed] = useState(initialCoachChangeUsed);
  const [selecting, setSelecting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'error',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const isSelected = selectedCoachId === coachId;
  const hasAnyCoach = !!selectedCoachId;
  const hasPackage = !!purchasedPackage;
  const hasOtherCoach = hasAnyCoach && !isSelected;
  const swapLocked = hasOtherCoach && coachChangeUsed;

  // Sohbet/koç veya profildeki seçim değişince senkron (profil yüklendiğinde koç seçimi gelir)
  useEffect(() => {
    setSelectedCoachId(initialSelectedCoachId);
    setCoachChangeUsed(initialCoachChangeUsed);
  }, [coachId, studentUid, initialSelectedCoachId, initialCoachChangeUsed]);

  const handleSelectCoach = async () => {
    if (!db || !studentUid || !coachId) return;
    const isFirstPick = !initialSelectedCoachId;
    const isSwap = !!initialSelectedCoachId && initialSelectedCoachId !== coachId && !initialCoachChangeUsed;

    if (!isFirstPick && !isSwap) {
      showToast('Koç seçimi bu sohbet için geçerli değil.', 'error');
      return;
    }

    setSelecting(true);
    try {
      if (isSwap) {
        await updateDoc(doc(db!, 'users', studentUid), {
          selectedCoachId: coachId,
          coachChangeUsed: true,
          updatedAt: serverTimestamp(),
        });
        setCoachChangeUsed(true);
      } else {
        await updateDoc(doc(db!, 'users', studentUid), {
          selectedCoachId: coachId,
          updatedAt: serverTimestamp(),
        });
      }
      setSelectedCoachId(coachId);
      onCoachSelected(coachId);

      // Koça bilgilendirme mesajı (sohbet içine)
      try {
        const convId = getConversationId(studentUid, coachId);
        const text = isSwap
          ? 'Öğrenci koç tercihini güncelledi ve sizi seçti.'
          : 'Öğrenci sizinle çalışmayı seçti.';
        await addDoc(collection(db!, 'conversations', convId, 'messages'), {
          senderId: studentUid,
          text,
          timestamp: serverTimestamp(),
          read: false,
        });
        await updateDoc(doc(db!, 'conversations', convId), {
          lastMessage: text,
          lastMessageAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('Koç bilgilendirme mesajı gönderilemedi:', e);
      }

      showToast(
        isSwap ? 'Koçunuz güncellendi. Tek değişim hakkınızı kullandınız.' : 'Koç seçiminiz kaydedildi.',
        'success'
      );
    } catch (err: unknown) {
      console.error('Koç seçilirken hata:', err);
      const msg =
        err instanceof Error ? err.message : 'Koç seçilirken bir hata oluştu. Lütfen tekrar deneyin.';
      showToast(msg, 'error');
    } finally {
      setSelecting(false);
    }
  };

  function renderRightContent() {
    if (isSelected) {
      return (
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-gray-600">Seçili koçunuz</span>
          {introMessagingActive && !hasPackage && (
            <span className="text-[10px] font-black uppercase tracking-wide text-emerald-800 bg-emerald-100 border-2 border-black px-2 py-0.5 rounded-lg">
              Tanışma sohbeti
            </span>
          )}
        </div>
      );
    }

    if (hasOtherCoach && swapLocked) {
      return (
        <div className="flex flex-col items-end gap-1 max-w-[200px] sm:max-w-none">
          <div className="px-3 py-2 bg-gray-200 text-gray-600 font-bold text-xs border-2 border-gray-400 rounded-xl text-center leading-snug">
            Koç seçiminiz kalıcı. Değişim hakkınızı kullandınız.
          </div>
        </div>
      );
    }

    if (hasOtherCoach && !swapLocked) {
      return (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleSelectCoach}
            disabled={selecting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-black font-black text-xs sm:text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            {selecting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Bu koça geç (1 hak)
          </button>
        </div>
      );
    }

    if (!hasPackage && !introMessagingActive) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-400 text-black font-black text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Önce Paket Seç
          </button>
        </div>
      );
    }

    if (!hasPackage && introMessagingActive) {
      return (
        <span className="text-[10px] font-black uppercase tracking-wide text-emerald-800 bg-emerald-100 border-2 border-black px-2 py-1 rounded-lg">
          Tanışma sohbeti
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSelectCoach}
          disabled={selecting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 text-black font-black text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selecting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          Bu Koçla Çalış
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-white border-b-4 border-black">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {coachPhotoURL ? (
          <img
            src={coachPhotoURL}
            alt={coachName}
            className="w-11 h-11 rounded-full object-cover border-2 border-black flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-indigo-100 border-2 border-black flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-black text-indigo-600">
              {coachName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-black truncate">{coachName}</h3>
          <p className="text-xs font-medium text-gray-500">Koç</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">{renderRightContent()}</div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((t) => ({ ...t, isVisible: false }))}
      />
    </>
  );
}
