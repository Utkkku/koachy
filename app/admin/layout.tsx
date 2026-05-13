'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { BRAND_NAME } from '@/src/config/brand';

const sidebarLinks = [
  { label: 'Genel Bakış', href: '/admin/dashboard', icon: 'home' },
  { label: 'Koç Yönetimi', href: '/admin/coaches', icon: 'users' },
];

function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case 'home':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole?.role !== 'Admin') {
        router.push('/login');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-black">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole?.role !== 'Admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
        {/* Brand */}
        <div className="p-6 border-b-4 border-black">
          <Link href="/admin/dashboard" className="block">
            <span className="text-2xl font-black text-black tracking-tight">{BRAND_NAME}</span>
            <span className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-black hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <SidebarIcon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t-4 border-black">
          <div className="mb-3">
            <p className="text-sm font-black text-black truncate">{userRole?.name || 'Admin'}</p>
            <p className="text-xs font-medium text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="w-full px-4 py-2.5 text-sm font-bold text-black bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
