'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import type { Conversation } from '@/src/types';

export type { Conversation };

interface ConversationListProps {
  userId: string;
  activeConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Varsayılan: Mesajlar */
  sidebarTitle?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export default function ConversationList({
  userId,
  activeConversationId,
  onSelectConversation,
  mobileOpen,
  onCloseMobile,
  sidebarTitle = 'Mesajlar',
  emptyTitle = 'Henüz mesajınız yok',
  emptySubtitle = 'Koçlar sayfasından bir koçla sohbet başlatın',
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) return;

    const q = query(
      collection(db!, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Conversation[];
      setConversations(convs);
      setLoading(false);
    }, (error) => {
      console.error('Konuşmalar yüklenirken hata:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  function getDisplayName(conv: Conversation) {
    return conv.coachId === userId ? conv.studentName : conv.coachName;
  }

  function getDisplayPhoto(conv: Conversation) {
    return conv.coachId === userId ? conv.studentPhotoURL || '' : conv.coachPhotoURL || '';
  }

  function getInitial(conv: Conversation) {
    const name = getDisplayName(conv);
    return name?.charAt(0)?.toUpperCase() || '?';
  }

  function formatTime(ts: Timestamp | null) {
    if (!ts) return '';
    const date = ts.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Şimdi';
    if (diffMin < 60) return `${diffMin}dk`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}sa`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}g`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-5 border-b-4 border-black flex items-center justify-between">
        <h2 className="text-xl font-black text-black">{sidebarTitle}</h2>
        <button
          onClick={onCloseMobile}
          className="md:hidden w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-black flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 border-4 border-black rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-500">{emptyTitle}</p>
            <p className="text-xs text-gray-400 mt-1">{emptySubtitle}</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all border-b-2 border-gray-100 ${
                  isActive
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                {getDisplayPhoto(conv) ? (
                  <img
                    src={getDisplayPhoto(conv)}
                    alt={getDisplayName(conv)}
                    className="w-12 h-12 rounded-full object-cover border-2 border-black flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-black text-indigo-600">{getInitial(conv)}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-black truncate">{getDisplayName(conv)}</span>
                    <span className="text-xs font-medium text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                    {conv.lastMessage || 'Henüz mesaj yok'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-80 bg-white border-r-4 border-black h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onCloseMobile} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white border-r-4 border-black flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
