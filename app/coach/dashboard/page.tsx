'use client';

/**
 * Koç paneli: tek onSnapshot ile atanmış öğrenciler, tek onSnapshot ile konuşma listesi,
 * açık sohbette tek onSnapshot ile mesajlar. onSnapshot içinde yazma yok → ücret döngüsü riski yok.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/context/AuthContext';
import { getConversationId } from '@/src/services/chat.service';
import { formatTelHref, formatWhatsAppLink } from '@/src/utils/phone';
import ConversationList, { Conversation } from '@/src/components/chat/ConversationList';
import ChatHeaderCoach from '@/src/components/chat/ChatHeaderCoach';
import ChatWindow from '@/src/components/chat/ChatWindow';
import Toast from '@/src/components/Toast';

interface AssignedStudent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  purchasedPackage?: string | null;
}

export default function CoachDashboard() {
  const { user, userRole, loading, signOut } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'messages' | 'students'>('messages');
  const [openingChat, setOpeningChat] = useState(false);
  const [endingConversation, setEndingConversation] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (userRole?.role !== 'Coach') router.push('/');
    }
  }, [user, userRole, loading, router]);

  // Atanmış öğrenciler: tek sorgu, tek dinleyici (değişiklikte yalnızca ilgili doküman okumaları)
  useEffect(() => {
    if (!db || !user || userRole?.role !== 'Coach') return;

    const q = query(
      collection(db, 'users'),
      where('role', '==', 'Student'),
      where('selectedCoachId', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: AssignedStudent[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || 'Öğrenci',
            email: data.email,
            phone: typeof data.phone === 'string' ? data.phone : undefined,
            photoURL: data.photoURL,
            purchasedPackage: data.purchasedPackage ?? null,
          };
        });
        setStudents(list);
        setStudentsLoading(false);
      },
      (err) => {
        console.error('Öğrenci listesi:', err);
        setStudentsLoading(false);
      }
    );

    return () => unsub();
  }, [user, userRole?.role]);

  const openOrCreateConversation = useCallback(
    async (studentId: string) => {
      if (!db || !user) return;
      setOpeningChat(true);
      try {
        const convId = getConversationId(user.uid, studentId);
        const convRef = doc(db, 'conversations', convId);
        const existing = await getDoc(convRef);

        if (existing.exists()) {
          const data = existing.data();
          setActiveConversation({
            id: convId,
            participants: data.participants,
            studentId: data.studentId,
            coachId: data.coachId,
            coachName: data.coachName,
            coachPhotoURL: data.coachPhotoURL || '',
            studentName: data.studentName,
            studentPhotoURL: data.studentPhotoURL,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt || null,
            isIntroSession: data.isIntroSession === true,
            conversationStatus: data.conversationStatus === 'closed_by_coach' ? 'closed_by_coach' : 'open',
            closedByCoachAt: data.closedByCoachAt ?? null,
          });
          setMobileTab('messages');
          return;
        }

        const studentRef = doc(db, 'users', studentId);
        const [studentSnap, coachSnap] = await Promise.all([
          getDoc(studentRef),
          getDoc(doc(db, 'users', user.uid)),
        ]);
        const sData = studentSnap.exists() ? studentSnap.data() : {};
        const cData = coachSnap.exists() ? coachSnap.data() : {};
        const hasPackage =
          typeof sData.purchasedPackage === 'string' && (sData.purchasedPackage as string).length > 0;
        const introAvailable = sData.introMeetingAvailable === true;

        const newConv: Record<string, unknown> = {
          participants: [user.uid, studentId],
          studentId,
          coachId: user.uid,
          coachName: cData.name || 'Koç',
          coachPhotoURL: cData.photoURL || '',
          studentName: sData.name || 'Öğrenci',
          studentPhotoURL: sData.photoURL || '',
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          conversationStatus: 'open',
        };

        const batch = writeBatch(db);
        if (!hasPackage && introAvailable) {
          newConv.isIntroSession = true;
          batch.update(studentRef, { introMeetingAvailable: false, updatedAt: serverTimestamp() });
        }
        batch.set(convRef, newConv);
        await batch.commit();

        setActiveConversation({
          id: convId,
          participants: newConv.participants as string[],
          studentId: newConv.studentId as string,
          coachId: newConv.coachId as string,
          coachName: newConv.coachName as string,
          coachPhotoURL: (newConv.coachPhotoURL as string) || '',
          studentName: newConv.studentName as string,
          studentPhotoURL: newConv.studentPhotoURL as string | undefined,
          lastMessage: '',
          lastMessageAt: null,
          isIntroSession: newConv.isIntroSession === true,
          conversationStatus: 'open',
        });
        setMobileTab('messages');
      } catch (e) {
        console.error('Sohbet açılamadı:', e);
        setToastMsg('Sohbet açılamadı. Lütfen tekrar deneyin.');
      } finally {
        setOpeningChat(false);
      }
    },
    [user]
  );

  const endActiveConversation = useCallback(async () => {
    if (!db || !user || !activeConversation?.id) return;
    setEndingConversation(true);
    try {
      await updateDoc(doc(db, 'conversations', activeConversation.id), {
        conversationStatus: 'closed_by_coach',
        closedByCoachAt: serverTimestamp(),
      });
      setActiveConversation((prev) =>
        prev ? { ...prev, conversationStatus: 'closed_by_coach' } : null
      );
    } catch (e) {
      console.error('Konuşma sonlandırılamadı:', e);
    } finally {
      setEndingConversation(false);
    }
  }, [activeConversation?.id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf7]">
        <div className="text-lg font-black text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!user || userRole?.role !== 'Coach') return null;

  return (
    <div className="min-h-screen bg-[#fffdf7] flex flex-col">
      <Toast
        message={toastMsg ?? ''}
        type="error"
        isVisible={!!toastMsg}
        onClose={() => setToastMsg(null)}
      />
      <header className="bg-white border-b-4 border-black sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">Koç Paneli</h1>
            <p className="text-xs font-medium text-gray-500 truncate max-w-[200px] sm:max-w-md">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/profile"
              className="px-4 py-2 text-sm font-black text-black bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
            >
              Profil
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-black text-white bg-gray-800 border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Çıkış
            </button>
          </div>
        </div>

        <div className="flex md:hidden border-t-2 border-black">
          <button
            type="button"
            onClick={() => setMobileTab('messages')}
            className={`flex-1 py-3 text-sm font-black ${
              mobileTab === 'messages' ? 'bg-indigo-600 text-white' : 'bg-white text-black'
            }`}
          >
            Mesajlar
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('students')}
            className={`flex-1 py-3 text-sm font-black border-l-2 border-black ${
              mobileTab === 'students' ? 'bg-indigo-600 text-white' : 'bg-white text-black'
            }`}
          >
            Öğrencilerim ({students.length})
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
          {/* Öğrenciler — masaüstü sol */}
          <aside
            className={`md:w-64 lg:w-72 shrink-0 flex flex-col border-4 border-black rounded-2xl bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${
              mobileTab === 'students' ? 'flex' : 'hidden'
            } md:flex`}
          >
            <div className="p-4 border-b-4 border-black bg-yellow-300">
              <h2 className="text-lg font-black text-black">Öğrencilerim</h2>
              <p className="text-xs font-medium text-black/70 mt-1">Seni seçen öğrenciler</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {studentsLoading ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-100 border-2 border-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <p className="p-4 text-sm font-medium text-gray-500 text-center">
                  Henüz seni seçen öğrenci yok.
                </p>
              ) : (
                <ul className="space-y-2">
                  {students.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        disabled={openingChat}
                        onClick={() => openOrCreateConversation(s.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-black text-left hover:bg-indigo-50 transition-colors disabled:opacity-50"
                      >
                        {s.photoURL ? (
                          <img
                            src={s.photoURL}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-black shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-cyan-100 border-2 border-black flex items-center justify-center shrink-0">
                            <span className="font-black text-cyan-800">{s.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-black text-sm truncate">{s.name}</p>
                          {s.phone ? (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <a
                                href={formatTelHref(s.phone)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] font-bold text-indigo-600 truncate hover:underline"
                              >
                                {s.phone}
                              </a>
                              <a
                                href={formatWhatsAppLink(s.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-green-400 border border-black rounded"
                              >
                                WA
                              </a>
                            </div>
                          ) : (
                            <p className="text-[10px] font-medium text-amber-700 truncate">Telefon yok</p>
                          )}
                          {s.purchasedPackage && (
                            <p className="text-[10px] font-bold text-indigo-600 truncate">Paketli</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Mesaj alanı */}
          <div
            className={`flex-1 flex flex-col min-w-0 min-h-0 border-4 border-black rounded-2xl bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${
              mobileTab === 'messages' ? 'flex' : 'hidden'
            } md:flex`}
          >
            <div className="flex flex-1 min-h-0">
              <ConversationList
                userId={user.uid}
                activeConversationId={activeConversation?.id || null}
                onSelectConversation={setActiveConversation}
                mobileOpen={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                sidebarTitle="Konuşmalar"
                emptyTitle="Henüz konuşma yok"
                emptySubtitle="Soldan öğrenci seçerek sohbet başlatın"
              />
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                {activeConversation ? (
                  <>
                    <ChatHeaderCoach
                      studentName={activeConversation.studentName}
                      studentPhotoURL={activeConversation.studentPhotoURL}
                      studentPhone={students.find((st) => st.id === activeConversation.studentId)?.phone}
                      conversationStatus={activeConversation.conversationStatus ?? 'open'}
                      onEndConversation={endActiveConversation}
                      endingConversation={endingConversation}
                      onOpenSidebar={() => setMobileSidebarOpen(true)}
                    />
                    <div className="flex-1 min-h-0">
                      <ChatWindow conversationId={activeConversation.id} currentUserId={user.uid} />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
                    <div className="text-center max-w-sm">
                      <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg font-black text-black mb-2">Sohbet seçin</h2>
                      <p className="text-sm text-gray-600 mb-4">
                        Soldaki listeden konuşma açın veya öğrenci listesinden yazışmaya başlayın.
                      </p>
                      <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="md:hidden inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Konuşmalar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-gray-400 font-medium text-center max-w-2xl mx-auto">
          Mesajlar gerçek zamanlıdır; her sekme için yalnızca bir canlı dinleyici kullanılır (konuşma listesi, mesajlar,
          öğrenci listesi). Sohbet değişince önceki mesaj dinleyicisi kapanır.
        </p>
      </div>
    </div>
  );
}
