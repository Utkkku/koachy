'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('Student' | 'Coach' | 'Admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!userRole?.role || !allowedRoles.includes(userRole.role)) {
        // Rol uyumsuzsa ana sayfaya yönlendir
        router.push('/');
        return;
      }
    }
  }, [user, userRole, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!user || !userRole?.role || !allowedRoles.includes(userRole.role)) {
    return null;
  }

  return <>{children}</>;
}
