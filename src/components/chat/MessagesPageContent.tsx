'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import ConversationList, { Conversation } from '@/src/components/chat/ConversationList';
import ChatHeader from '@/src/components/chat/ChatHeader';
import ChatWindow from '@/src/components/chat/ChatWindow';
import { getConversationId } from '@/src/services/chat.service';

export function MessagesPageContent() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachIdParam = searchParams.get('coachId');

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const initConversation = useCallback(
    async (coachId: string) => {
      if (!db || !user) return;
      setInitializing(true);
      setInitError(null);

      try {
        const convId = getConversationId(user.uid, coachId);
        const convRef = doc(db!, 'conversations', convId);

        let existingConv = false;
        try {
          const convSnap = await getDoc(convRef);
          if (convSnap.exists()) {
            existingConv = true;
            const data = convSnap.data();
            setActiveConversation({
              id: convId,
              participants: data.participants,
              studentId: data.studentId,
              coachId: data.coachId,
              coachName: data.coachName,
              coachPhotoURL: data.coachPhotoURL,
              studentName: data.studentName,
              studentPhotoURL: data.studentPhotoURL,
              lastMessage: data.lastMessage || '',
              lastMessageAt: data.lastMessageAt || null,
              isIntroSession: data.isIntroSession === true,
              conversationStatus: data.conversationStatus === 'closed_by_coach' ? 'closed_by_coach' : 'open',
              closedByCoachAt: data.closedByCoachAt ?? null,
            });
          }
        } catch {
          /* yoksa yeni konuşma oluşturulur */
        }

        if (!existingConv) {
          setInitError(null);
          const userRef = doc(db!, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const u = userSnap.exists() ? userSnap.data() : {};
          const hasPackage = typeof u.purchasedPackage === 'string' && u.purchasedPackage.length > 0;
          const introAvailable = u.introMeetingAvailable === true;

          if (!hasPackage && !introAvailable) {
            setInitError(
              'Bu koçla sohbet başlatmak için paket satın almalı veya hesap açılış tanışma hakkınızı kullanmalısınız.'
            );
            return;
          }

          const coachDoc = await getDoc(doc(db!, 'users', coachId));
          const coachData = coachDoc.exists() ? coachDoc.data() : {};
          const studentName = userRole?.name || user.displayName || 'Öğrenci';

          const newConv: Record<string, unknown> = {
            participants: [user.uid, coachId],
            studentId: user.uid,
            coachId: coachId,
            coachName: coachData.name || 'Koç',
            coachPhotoURL: coachData.photoURL || '',
            studentName: studentName,
            studentPhotoURL: user.photoURL || '',
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            conversationStatus: 'open',
          };

          const batch = writeBatch(db!);
          if (!hasPackage && introAvailable) {
            newConv.isIntroSession = true;
            batch.update(userRef, { introMeetingAvailable: false, updatedAt: serverTimestamp() });
          }

          batch.set(convRef, newConv);
          await batch.commit();

          setActiveConversation({
            id: convId,
            ...(newConv as Omit<Conversation, 'id' | 'lastMessageAt'>),
            lastMessageAt: null,
            isIntroSession: newConv.isIntroSession === true,
            conversationStatus: 'open',
          });
        }
      } catch (err) {
        console.error('Konuşma başlatılırken hata:', err);
      } finally {
        setInitializing(false);
      }
    },
    [user, userRole]
  );

  useEffect(() => {
    if (coachIdParam && user && !authLoading) {
      initConversation(coachIdParam);
    }
  }, [coachIdParam, user, authLoading, initConversation]);

  useEffect(() => {
    if (!db || !activeConversation?.id) return;
    const ref = doc(db, 'conversations', activeConversation.id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setActiveConversation((prev) =>
        prev && prev.id === snap.id
          ? {
              ...prev,
              lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : prev.lastMessage,
              lastMessageAt: data.lastMessageAt ?? prev.lastMessageAt,
              conversationStatus:
                data.conversationStatus === 'closed_by_coach' ? 'closed_by_coach' : 'open',
              isIntroSession: data.isIntroSession === true,
              closedByCoachAt: data.closedByCoachAt ?? null,
            }
          : prev
      );
    });
    return () => unsub();
  }, [activeConversation?.id]);

  const handleSelectConversation = (conv: Conversation) => {
    setInitError(null);
    setActiveConversation({
      ...conv,
      conversationStatus: conv.conversationStatus === 'closed_by_coach' ? 'closed_by_coach' : 'open',
    });
  };

  const handleCoachSelected = (coachId: string) => {
    setSelectedCoachId(coachId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf7]">
        <div className="text-center">
          <svg className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-black text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /** Profil + yerel seçim (Auth yüklenir yüklenmez geçerli) */
  const effectiveSelectedCoachId =
    selectedCoachId ?? userRole?.selectedCoachId ?? null;

  const hasPackage = userRole?.purchasedPackage != null;
  const closedByCoach = activeConversation?.conversationStatus === 'closed_by_coach';
  const introOpen =
    activeConversation?.isIntroSession === true && activeConversation?.conversationStatus !== 'closed_by_coach';

  /** Öğrenci: paket veya tanışma sohbeti; koç sonlandırdıysa yazılamaz */
  const canSendMessages =
    !activeConversation ||
    activeConversation.studentId !== user.uid ||
    (!closedByCoach && (hasPackage || activeConversation.isIntroSession === true));

  const sendBlockedHint = activeConversation?.studentId === user.uid && !canSendMessages
    ? closedByCoach
      ? 'Bu görüşmeyi koç sonlandırdı. Tekrar mesaj gönderemezsin.'
      : !hasPackage
        ? 'Mesaj göndermek için bir paket satın almalısın.'
        : undefined
    : undefined;

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-black text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Geri
          </button>
          <h1 className="text-lg font-black text-black">Mesajlar</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden h-[calc(100vh-160px)]">
          <div className="flex h-full">
            <ConversationList
              userId={user.uid}
              activeConversationId={activeConversation?.id || null}
              onSelectConversation={handleSelectConversation}
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
              {activeConversation ? (
                <>
                  <ChatHeader
                    coachId={activeConversation.coachId}
                    coachName={activeConversation.coachName}
                    coachPhotoURL={activeConversation.coachPhotoURL}
                    studentUid={user.uid}
                    initialSelectedCoachId={effectiveSelectedCoachId}
                    purchasedPackage={userRole?.purchasedPackage || null}
                    initialCoachChangeUsed={userRole?.coachChangeUsed === true}
                    introMessagingActive={introOpen}
                    onCoachSelected={handleCoachSelected}
                    onOpenSidebar={() => setMobileSidebarOpen(true)}
                  />
                  <ChatWindow
                    conversationId={activeConversation.id}
                    currentUserId={user.uid}
                    canSendMessages={canSendMessages}
                    sendBlockedHint={sendBlockedHint}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  {initializing ? (
                    <div className="text-center">
                      <svg className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-sm font-black text-gray-500">Sohbet hazırlanıyor...</p>
                    </div>
                  ) : initError ? (
                    <div className="text-center px-8 max-w-md mx-auto">
                      <p className="text-sm font-bold text-amber-900 bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3">
                        {initError}
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/pricing')}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Paketleri gör
                      </button>
                    </div>
                  ) : (
                    <div className="text-center px-8">
                      <div className="w-24 h-24 mx-auto mb-6 bg-indigo-50 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                        <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-black text-black mb-2">Sohbet Seçin</h2>
                      <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Sol menüden bir konuşma seçin veya{' '}
                        <button
                          type="button"
                          onClick={() => router.push('/coaches')}
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          koçlar sayfasından
                        </button>{' '}
                        yeni bir sohbet başlatın.
                      </p>

                      <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="md:hidden mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Konuşmalarım
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
