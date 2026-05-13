'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import Toast from '@/src/components/Toast';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
  read: boolean;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  /** Mesaj yazma izni (varsayılan: true) */
  canSendMessages?: boolean;
  /** Engelliyse kullanıcıya gösterilen kısa açıklama */
  sendBlockedHint?: string;
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  canSendMessages = true,
  sendBlockedHint,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen to messages in real-time
  useEffect(() => {
    if (!db || !conversationId) return;
    setLoading(true);

    const q = query(
      collection(db!, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Mesajlar yüklenirken hata:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on conversation change
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !db || !conversationId || sending || !canSendMessages) return;

    setSending(true);
    setNewMessage('');

    try {
      // Add message to subcollection
      await addDoc(collection(db!, 'conversations', conversationId, 'messages'), {
        senderId: currentUserId,
        text,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update conversation lastMessage
      await updateDoc(doc(db!, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      setNewMessage(text);
      setSendError(true);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  function formatMessageTime(ts: Timestamp | null) {
    if (!ts) return '';
    return ts.toDate().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateSeparator(ts: Timestamp | null) {
    if (!ts) return '';
    const date = ts.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Bugün';
    if (date.toDateString() === yesterday.toDateString()) return 'Dün';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Group messages by date
  function getDateKey(ts: Timestamp | null) {
    if (!ts) return 'unknown';
    return ts.toDate().toDateString();
  }

  const groupedMessages: { date: string; label: string; messages: Message[] }[] = [];
  let currentDateKey = '';

  messages.forEach((msg) => {
    const dateKey = getDateKey(msg.timestamp);
    if (dateKey !== currentDateKey) {
      currentDateKey = dateKey;
      groupedMessages.push({
        date: dateKey,
        label: formatDateSeparator(msg.timestamp),
        messages: [msg],
      });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className="flex flex-col h-full">
      <Toast
        message="Mesaj gönderilemedi. Lütfen tekrar deneyin."
        type="error"
        isVisible={sendError}
        onClose={() => setSendError(false)}
      />
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm font-bold text-gray-400">Mesajlar yükleniyor...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-black text-gray-600">Sohbete başlayın!</p>
              <p className="text-xs text-gray-400 mt-1">İlk mesajınızı gönderin</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-bold text-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {group.label}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-gray-200 text-black rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          isMine ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t-4 border-black flex flex-col gap-2"
      >
        {!canSendMessages && sendBlockedHint && (
          <p className="text-xs font-bold text-amber-800 bg-amber-50 border-2 border-amber-300 rounded-lg px-3 py-2">
            {sendBlockedHint}
          </p>
        )}
        <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={
            canSendMessages ? 'Mesajınızı yazın...' : sendBlockedHint || 'Mesaj gönderilemiyor'
          }
          disabled={sending || !canSendMessages}
          className="flex-1 px-4 py-3 border-3 border-black rounded-xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:bg-yellow-50 focus:ring-0 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending || !canSendMessages}
          className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 flex-shrink-0"
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
        </div>
      </form>
    </div>
  );
}
