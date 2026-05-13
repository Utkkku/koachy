'use client';

import { Navbar } from '@/src/components/navbar';
import { Footer } from '@/src/components/footer';

interface PageShellProps {
  children: React.ReactNode;
  /** true → max-w-4xl (geniş, hukuki sayfalar için) — varsayılan false → max-w-3xl */
  wide?: boolean;
}

export function PageShell({ children, wide = false }: PageShellProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className={`flex-1 w-full ${wide ? 'max-w-4xl' : 'max-w-3xl'} mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
