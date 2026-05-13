'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseAuthUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type ActionCodeSettings,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import type { AuthContextType, AuthUserRole } from '@/src/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUserDocToAuthRole(firebaseUser: FirebaseAuthUser, userData: DocumentData): AuthUserRole {
  const r = userData.role;
  const role: AuthUserRole['role'] =
    r === 'Student' || r === 'Coach' || r === 'Admin' ? r : null;
  return {
    role,
    email: firebaseUser.email,
    name: typeof userData.name === 'string' ? userData.name : firebaseUser.displayName || undefined,
    selectedCoachId:
      typeof userData.selectedCoachId === 'string' ? userData.selectedCoachId : null,
    purchasedPackage:
      typeof userData.purchasedPackage === 'string' ? userData.purchasedPackage : null,
    coachChangeUsed: userData.coachChangeUsed === true,
    introMeetingAvailable: userData.introMeetingAvailable === true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const [userRole, setUserRole] = useState<AuthUserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth is initialized (useEffect yalnızca istemcide çalışır; setState döngüsünü önlemek için gecikmeli)
    if (!auth) {
      console.warn('Firebase Auth is not initialized. Please check your Firebase configuration.');
      const id = window.setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(id);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        // Kullanıcının rolünü Firestore'dan çek
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserRole(mapUserDocToAuthRole(firebaseUser, userDoc.data()));
          } else {
            const empty: AuthUserRole = {
              role: null,
              email: firebaseUser.email,
            };
            setUserRole(empty);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          const fallback: AuthUserRole = {
            role: null,
            email: firebaseUser.email,
          };
          setUserRole(fallback);
        }

        // Sunucu tarafı route koruması için HttpOnly session cookie oluştur
        try {
          const idToken = await firebaseUser.getIdToken();
          fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }).catch(() => {});
        } catch {
          // Session cookie oluşturulamazsa client-side auth devam eder
        }
      } else {
        setUserRole(null);
        // Session cookie'yi temizle
        fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Auth is not initialized');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string, 
    password: string, 
    role: 'Student' | 'Coach' = 'Student', // Varsayılan olarak Student
    name?: string
  ) => {
    if (!auth || !db) throw new Error('Firebase is not initialized');
    
    // Sadece öğrenci kaydı yapılabilir, koçlar admin tarafından oluşturulur
    if (role !== 'Student') {
      throw new Error('Sadece öğrenci kaydı yapılabilir. Koçlar admin tarafından oluşturulur.');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Firestore'a kullanıcı bilgilerini kaydet (sadece Student)
    await setDoc(doc(db, 'users', newUser.uid), {
      email: newUser.email,
      role: 'Student',
      name: name || newUser.displayName || '',
      createdAt: serverTimestamp(),
      introMeetingAvailable: true,
    });
  };

  const signOut = async () => {
    if (!auth) throw new Error('Auth is not initialized');
    await firebaseSignOut(auth);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Auth is not initialized');
    const normalized = email.trim();
    if (!normalized) {
      throw new Error('Geçersiz e-posta adresi girdiniz.');
    }

    const continueUrl = process.env.NEXT_PUBLIC_FIREBASE_PASSWORD_RESET_CONTINUE_URL?.trim();
    const action: ActionCodeSettings | undefined =
      continueUrl && continueUrl.length > 0
        ? { url: continueUrl, handleCodeInApp: false }
        : undefined;

    try {
      if (action) {
        await sendPasswordResetEmail(auth, normalized, action);
      } else {
        await sendPasswordResetEmail(auth, normalized);
      }
      if (process.env.NODE_ENV === 'development') {
        console.info(
          '[auth] Şifre sıfırlama isteği Firebase tarafından kabul edildi. Mail gelmezse spam, SMTP veya konsoldaki kullanıcı listesini kontrol edin.'
        );
      }
    } catch (error) {
      console.error('[auth] sendPasswordResetEmail failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
