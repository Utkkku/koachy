'use client';

import { formatTelHref, formatWhatsAppLink } from '@/src/utils/phone';
import type { ConversationStatus } from '@/src/types';

interface ChatHeaderCoachProps {
  studentName: string;
  studentPhotoURL?: string;
  /** Öğrenci profilindeki telefon; yalnızca bu koçu seçtiğinde erişilebilir */
  studentPhone?: string;
  conversationStatus?: ConversationStatus;
  onEndConversation?: () => void;
  endingConversation?: boolean;
  onOpenSidebar: () => void;
}

export default function ChatHeaderCoach({
  studentName,
  studentPhotoURL,
  studentPhone,
  conversationStatus = 'open',
  onEndConversation,
  endingConversation = false,
  onOpenSidebar,
}: ChatHeaderCoachProps) {
  const phoneTrim = studentPhone?.trim();
  const hasPhone = !!phoneTrim;
  const canEnd = conversationStatus !== 'closed_by_coach' && typeof onEndConversation === 'function';

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b-4 border-black">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100 flex-shrink-0"
        aria-label="Konuşma listesini aç"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {studentPhotoURL ? (
        <img
          src={studentPhotoURL}
          alt={studentName}
          className="w-11 h-11 rounded-full object-cover border-2 border-black flex-shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-cyan-100 border-2 border-black flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-black text-cyan-800">
            {studentName?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-black truncate">{studentName || 'Öğrenci'}</h3>
        <p className="text-xs font-medium text-gray-500">Öğrenci</p>
        {hasPhone && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <a
              href={formatTelHref(phoneTrim!)}
              className="text-xs font-bold text-indigo-600 hover:underline truncate"
            >
              {phoneTrim}
            </a>
            <a
              href={formatWhatsAppLink(phoneTrim!)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-wide px-2 py-0.5 bg-green-400 border-2 border-black rounded-md hover:bg-green-300"
            >
              WhatsApp
            </a>
          </div>
        )}
        {!hasPhone && (
          <p className="text-[10px] font-medium text-amber-700 mt-1">
            Öğrenci profilinde telefon yok
          </p>
        )}
        {conversationStatus === 'closed_by_coach' && (
          <p className="text-[10px] font-black text-gray-600 mt-1">Bu görüşme sonlandırıldı (öğrenci yazamaz).</p>
        )}
      </div>

      {canEnd && (
        <button
          type="button"
          onClick={onEndConversation}
          disabled={endingConversation}
          className="flex-shrink-0 px-3 py-2 text-xs font-black text-white bg-gray-800 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          {endingConversation ? '…' : 'Konuşmayı bitir'}
        </button>
      )}
    </div>
  );
}
