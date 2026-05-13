'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { db } from '@/src/lib/firebase';
import { fetchStudentDashboardData } from '@/src/services/student.service';
import type { StudentDashboardProfile } from '@/src/types';
import { PACKAGE_LABELS } from '@/src/config/packages';

export default function StudentDashboard() {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentDashboardProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [coachName, setCoachName] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (userRole?.role !== 'Student') {
        router.push('/');
      }
    }
  }, [user, userRole, authLoading, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!db || !user) return;
      try {
        const result = await fetchStudentDashboardData(db, user.uid);
        if (result) {
          setProfile(result.profile);
          setCoachName(result.coachName);
        } else {
          setProfile(null);
          setCoachName(null);
        }
      } catch (err) {
        console.error('Profil yüklenirken hata:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf7]">
        <svg className="w-10 h-10 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user || userRole?.role !== 'Student') return null;

  const isProfileComplete = profile && profile.name && profile.phone && profile.targetExam;
  const hasPackage = !!profile?.purchasedPackage;
  const hasSelectedCoach = !!profile?.selectedCoachId;

  // Steps: 1. Profil → 2. Paket → 3. Koç Seç
  const steps = [
    {
      id: 1,
      label: 'Profilini Tamamla',
      description: 'Ad, telefon ve hedef sınavını belirle',
      done: !!isProfileComplete,
      href: '/profile',
    },
    {
      id: 2,
      label: 'Paketini Seç',
      description: 'Sana uygun paketi seç ve koçunu belirlemeye hak kazan',
      done: hasPackage,
      doneText: hasPackage ? `${PACKAGE_LABELS[profile?.purchasedPackage || ''] || profile?.purchasedPackage} aktif` : undefined,
      href: '/pricing',
    },
    {
      id: 3,
      label: 'Koçunu Seç',
      description: hasPackage
        ? 'Koçlar sayfasından koçunu seç ve çalışmaya başla'
        : 'Önce paketini seçmen gerekiyor',
      done: hasSelectedCoach,
      href: '/coaches',
    },
  ];

  const completedSteps = steps.filter((s) => s.done).length;

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="w-11 h-11 rounded-full object-cover border-3 border-black"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-indigo-100 border-3 border-black flex items-center justify-center">
                  <span className="text-lg font-black text-indigo-600">
                    {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-black">Öğrenci Paneli</h1>
                <p className="text-xs font-medium text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-5 py-2.5 bg-white text-black font-bold text-sm border-3 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-indigo-600 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">
                Merhaba, {profile?.name || 'Öğrenci'}! 👋
              </h2>
              <p className="text-indigo-100 font-medium mt-2 text-base">
                {isProfileComplete
                  ? 'Harika gidiyorsun! Aşağıdaki adımlarla yolculuğuna devam et.'
                  : 'Başlamak için profilini tamamla ve koçunu seç.'}
              </p>
            </div>
            {profile?.targetExam && (
              <div className="bg-white/20 border-2 border-white/40 rounded-xl px-5 py-3 text-center flex-shrink-0">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wide">Hedef Sınav</p>
                <p className="text-2xl font-black text-white">{profile.targetExam}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-black">Başlangıç Adımları</h3>
            <span className="px-4 py-1.5 bg-yellow-300 text-black font-black text-sm border-2 border-black rounded-full">
              {completedSteps}/{steps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4 mb-8 overflow-hidden">
            <div
              className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedSteps / steps.length) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isNext = !step.done && steps.slice(0, idx).every((s) => s.done);
              return (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`flex items-center gap-5 p-5 rounded-xl border-3 transition-all group ${
                    step.done
                      ? 'border-green-400 bg-green-50 hover:bg-green-100'
                      : isNext
                      ? 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100 opacity-60'
                  }`}
                >
                  {/* Step Number / Check */}
                  <div
                    className={`w-12 h-12 flex-shrink-0 rounded-xl border-3 flex items-center justify-center ${
                      step.done
                        ? 'bg-green-400 border-green-600 text-white'
                        : isNext
                        ? 'bg-indigo-600 border-black text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}
                  >
                    {step.done ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-lg font-black">{step.id}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-black ${step.done ? 'text-green-700' : 'text-black'}`}>
                      {step.label}
                    </p>
                    <p className={`text-sm font-medium ${step.done ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.done
                        ? ('doneText' in step && step.doneText ? `${step.doneText} ✓` : 'Tamamlandı ✓')
                        : step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                      step.done ? 'text-green-400' : isNext ? 'text-indigo-600' : 'text-gray-300'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Profile */}
          <Link
            href="/profile"
            className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 border-2 border-black rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="text-base font-black text-black">Profilimi Düzenle</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Bilgilerini güncelle</p>
          </Link>

          {/* Coaches */}
          <Link
            href="/coaches"
            className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
          >
            <div className="w-12 h-12 bg-yellow-100 border-2 border-black rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="text-base font-black text-black">Koçları Keşfet</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Sana uygun koçu bul</p>
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
          >
            <div className="w-12 h-12 bg-indigo-100 border-2 border-black rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-base font-black text-black">Mesajlarım</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Koçunla sohbet et</p>
          </Link>

          {/* Pricing */}
          <Link
            href="/pricing"
            className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 border-2 border-black rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-base font-black text-black">Paketler</h4>
            <p className="text-xs font-medium text-gray-500 mt-1">Fiyatları incele</p>
          </Link>
        </div>

        {/* Coach Status Card - if coach selected */}
        {hasSelectedCoach && coachName && (
          <div className="bg-green-50 border-4 border-green-400 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-400 border-2 border-black rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-black text-black">Koçun: {coachName}</p>
                  <p className="text-sm font-medium text-green-700">Koçunla mesajlaşmaya başlayabilirsin</p>
                  {profile?.coachChangeUsed ? (
                    <p className="text-xs font-bold text-gray-600 mt-2">Koç seçimin kalıcı; değişim hakkını kullandın.</p>
                  ) : (
                    <p className="text-xs font-bold text-amber-800 mt-2">
                      İstersen başka bir koçla sohbette bir kez değiştirebilirsin (mesajlar → ilgili koç).
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/messages?coachId=${profile?.selectedCoachId}`}
                className="px-5 py-2.5 bg-green-500 text-white font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Mesaj Gönder
              </Link>
            </div>
          </div>
        )}

        {/* Info cards row */}
        {profileLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-yellow-100 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Ad Soyad</p>
              <p className="text-xl font-black text-black">{profile.name || '—'}</p>
            </div>
            <div className="bg-cyan-100 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Sınıf / Seviye</p>
              <p className="text-xl font-black text-black">{profile.grade || '—'}</p>
            </div>
            <div className="bg-pink-100 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Hedef Sınav</p>
              <p className="text-xl font-black text-black">{profile.targetExam || '—'}</p>
            </div>
            <div className={`${hasPackage ? 'bg-green-100' : 'bg-gray-100'} border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6`}>
              <p className="text-xs font-bold text-black/60 uppercase tracking-wider mb-1">Paket</p>
              <p className="text-xl font-black text-black">
                {hasPackage
                  ? PACKAGE_LABELS[profile.purchasedPackage || ''] || profile.purchasedPackage
                  : '—'}
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
