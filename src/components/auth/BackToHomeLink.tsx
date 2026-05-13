'use client';

import Link from 'next/link';

/**
 * Auth sayfalarında (login / register) sağ üstte sabit, renkli ana sayfa dönüşü.
 */
export function BackToHomeLink() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border-[3px] border-black font-black text-xs sm:text-sm text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] bg-gradient-to-r from-fuchsia-400 via-amber-300 to-cyan-400 hover:from-fuchsia-300 hover:via-amber-200 hover:to-cyan-300"
    >
      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white border-2 border-black text-black group-hover:bg-yellow-100 transition-colors">
        <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </span>
      <span className="pr-1">Ana sayfa</span>
    </Link>
  );
}
