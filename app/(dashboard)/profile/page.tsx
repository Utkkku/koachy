'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useStorage } from '@/src/hooks/useStorage';
import Toast from '@/src/components/Toast';
import type { ProfileFormData } from '@/src/types';

const EXAM_OPTIONS = ['LGS', 'YKS', 'KPSS', 'ALES', 'YDS', 'Diğer'];
const GRADE_OPTIONS = ['5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf', 'Mezun'];

export default function ProfilePage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const { uploadFile, uploading, uploadProgress } = useStorage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    photoURL: '',
    title: '',
    bio: '',
    targetExam: '',
    grade: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user || !db) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
          title: data.title || '',
          bio: data.bio || '',
          targetExam: data.targetExam || '',
          grade: data.grade || '',
        });
        if (data.photoURL) {
          setPreviewURL(data.photoURL);
        }
      } else {
        // Kullanıcı dokümanı yoksa, sadece mevcut bilgileri kullan
        setFormData((prev) => ({
          ...prev,
          name: user.displayName || '',
          photoURL: user.photoURL || '',
        }));
        if (user.photoURL) {
          setPreviewURL(user.photoURL);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Profil yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      void loadProfile();
    }
  }, [user, authLoading, router, loadProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Lütfen bir resim dosyası seçin', 'error');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      let photoURL = formData.photoURL;

      // Fotoğraf yükle (Firebase Storage → Firestore'da sadece HTTPS URL saklanır)
      if (selectedFile) {
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `profiles/${user.uid}/${Date.now()}_${safeName}.jpg`;
        photoURL = await uploadFile(selectedFile, filePath);
      }

      if (!db) throw new Error('Veritabanı bağlantısı kurulamadı');
      const userRef = doc(db, 'users', user.uid);
      const base = {
        name: formData.name,
        phone: formData.phone,
        photoURL,
        updatedAt: serverTimestamp(),
      };

      if (userRole?.role === 'Coach') {
        await updateDoc(userRef, {
          ...base,
          title: formData.title || '',
          bio: formData.bio || '',
        });
      } else if (userRole?.role === 'Student') {
        await updateDoc(userRef, {
          ...base,
          targetExam: formData.targetExam,
          grade: formData.grade,
        });
      } else {
        await updateDoc(userRef, base);
      }
      setFormData((prev) => ({ ...prev, photoURL }));
      setPreviewURL(photoURL || null);
      showToast('Profil başarıyla güncellendi', 'success');
      setSelectedFile(null);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const msg = error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleBack = () => {
    if (userRole?.role === 'Student') {
      router.push('/student/dashboard');
    } else if (userRole?.role === 'Coach') {
      router.push('/coach/dashboard');
    } else if (userRole?.role === 'Admin') {
      router.push('/admin/dashboard');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Neo-Brutalist Card */}
        <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2.5 bg-white text-black font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
              Profil Ayarları
            </h1>
            <p className="text-base font-medium text-gray-700">Bilgilerini güncelle ve profilin tamamla</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-bold text-black mb-4 uppercase tracking-wide">
                Profil Fotoğrafı
              </label>
              <div className="flex items-center gap-6">
                <label className="relative cursor-pointer group">
                  <div className="relative">
                    {previewURL ? (
                      <img
                        src={previewURL}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-black"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-black flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    {/* Camera Icon Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                        <div className="text-white text-sm font-bold text-center">
                          <div>{Math.round(uploadProgress.progress)}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Fotoğrafını yükle (JPG, PNG veya GIF - max. 5MB)
                  </p>
                  <p className="text-xs text-gray-500">Fotoğrafın üzerine gel ve tıkla</p>
                </div>
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Ad Soyad *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Telefon Numarası
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  placeholder="05XX XXX XX XX"
                />
              </div>
            </div>

            {/* Coach Specific Fields */}
            {userRole?.role === 'Coach' && (
              <div className="space-y-5 border-t-4 border-black pt-6">
                <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">Koç Bilgileri</h2>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Unvan
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                    placeholder="Örn: Profesyonel Öğrenci Koçu, Sınav Danışmanı"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Hakkımda
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium resize-none"
                    placeholder="Kendinizi detaylı bir şekilde tanıtın. Deneyimleriniz, başarılarınız ve öğrencilere nasıl yardımcı olabileceğiniz hakkında yazın..."
                  />
                  <p className="mt-2 text-xs font-medium text-gray-600">
                    Bu alan öğrenciler tarafından görülecek. Kendinizi en iyi şekilde tanıtın!
                  </p>
                </div>

              </div>
            )}

            {/* Student Specific Fields */}
            {userRole?.role === 'Student' && (
              <div className="space-y-5 border-t-4 border-black pt-6">
                <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-wide">Öğrenci Bilgileri</h2>
                
                <div>
                  <label htmlFor="targetExam" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Hedef
                  </label>
                  <select
                    id="targetExam"
                    value={formData.targetExam}
                    onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  >
                    <option value="">Seçiniz</option>
                    {EXAM_OPTIONS.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Sınıf/Seviye
                  </label>
                  <select
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  >
                    <option value="">Seçiniz</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t-4 border-black">
              <button
                type="submit"
                disabled={saving || uploading}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {saving || uploading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
