'use client';

import { Suspense } from 'react';
import { MessagesPageContent } from '@/src/components/chat/MessagesPageContent';

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffdf7]">
          <div className="text-center">
            <svg className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-black text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
