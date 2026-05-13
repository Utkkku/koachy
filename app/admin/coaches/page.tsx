'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import Toast from '@/src/components/Toast';

interface Coach {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  photoURL: string;
  phone: string;
}

const emptyForm = {
  name: '',
  email: '',
  title: '',
  bio: '',
  phone: '',
  password: '',
  passwordConfirm: '',
};

type CoachFormState = typeof emptyForm;

function coachFormInitialState(
  initialData: Omit<CoachFormState, 'password' | 'passwordConfirm'> | null
): CoachFormState {
  if (initialData) {
    return {
      ...initialData,
      password: '',
      passwordConfirm: '',
    };
  }
  return { ...emptyForm };
}

async function getAdminIdToken(): Promise<string | null> {
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ==========================================
// COACH FORM MODAL
// ==========================================
function CoachFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CoachFormState) => void | Promise<void>;
  initialData: Omit<CoachFormState, 'password' | 'passwordConfirm'> | null;
  saving: boolean;
}) {
  const [form, setForm] = useState<CoachFormState>(() => coachFormInitialState(initialData));
  const isEdit = initialData !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <h2 className="text-2xl font-black text-black">
            {isEdit ? 'Koçu Düzenle' : 'Yeni Koç Ekle'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="p-6 space-y-5"
        >
          {!isEdit && (
            <div className="p-4 bg-cyan-50 border-2 border-black rounded-xl text-sm font-medium text-gray-800">
              <p className="font-black text-black mb-1">Giriş hesabı oluşturulur</p>
              Koç, verdiğin e-posta ve şifre ile giriş yapıp koç panelini kullanabilir. Şifreyi güvenli tut ve koça
              güvenli kanaldan ilet.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Ad Soyad *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                placeholder="Koçun adı soyadı"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">E-posta *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={isEdit}
                className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="koc@email.com"
              />
              {isEdit && (
                <p className="text-xs font-medium text-gray-500 mt-1">Giriş e-postası değiştirilmez (güvenlik).</p>
              )}
            </div>
          </div>

          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Giriş şifresi *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!isEdit}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  placeholder="En az 8 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                  Şifre tekrar *
                </label>
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                  required={!isEdit}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
                  placeholder="Aynı şifre"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Unvan *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
              placeholder="Örn: Matematik Uzmanı"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium"
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">Hakkında (Bio) *</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white focus:bg-yellow-50 focus:ring-0 focus:outline-none transition font-medium resize-none"
              placeholder="Koçun deneyimleri, uzmanlık alanları..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white text-black font-bold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Koçu oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// DELETE CONFIRM MODAL
// ==========================================
function DeleteConfirmModal({
  isOpen,
  coachName,
  onConfirm,
  onCancel,
  deleting,
}: {
  isOpen: boolean;
  coachName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 border-4 border-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <h3 className="text-xl font-black text-black mb-2">Koçu kaldır</h3>
        <p className="text-sm font-medium text-gray-600 mb-4">
          <span className="font-black text-black">{coachName}</span> kaydı silinecek. Varsa{' '}
          <strong>Firebase giriş hesabı</strong> da kapatılır. Bu işlem geri alınamaz.
        </p>
        <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          Bu koça atanmış öğrenci varsa silme engellenir; önce öğrencilerin koç seçimini güncelleyin.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white text-black font-bold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-6 py-3 bg-red-500 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            {deleting ? 'Siliniyor...' : 'Evet, kaldır'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coach | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const fetchCoaches = useCallback(async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Coach'));
      const snapshot = await getDocs(q);
      const list: Coach[] = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name || '',
        email: d.data().email || '',
        title: d.data().title || '',
        bio: d.data().bio || '',
        photoURL: d.data().photoURL || '',
        phone: d.data().phone || '',
      }));
      setCoaches(list);
    } catch (error) {
      console.error('Koçlar yüklenirken hata:', error);
      showToast('Koçlar yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const handleAddCoach = async (formData: CoachFormState) => {
    if (formData.password.length < 8) {
      showToast('Şifre en az 8 karakter olmalıdır.', 'error');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      showToast('Şifreler eşleşmiyor.', 'error');
      return;
    }

    const token = await getAdminIdToken();
    if (!token) {
      showToast('Oturum bulunamadı. Tekrar giriş yapın.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/coaches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        showToast(data.error || 'Koç oluşturulamadı.', 'error');
        return;
      }

      showToast(data.message || `${formData.name} eklendi. Koç giriş bilgilerini güvenle iletin.`, 'success');
      setFormOpen(false);
      await fetchCoaches();
    } catch (e) {
      console.error(e);
      showToast('Ağ hatası. Tekrar deneyin.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCoach = async (formData: CoachFormState) => {
    if (!editingCoach) return;

    const token = await getAdminIdToken();
    if (!token) {
      showToast('Oturum bulunamadı. Tekrar giriş yapın.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/coaches', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: editingCoach.id,
          name: formData.name.trim(),
          title: formData.title.trim(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        showToast(data.error || 'Güncelleme başarısız.', 'error');
        return;
      }

      showToast(data.message || `${formData.name} güncellendi.`, 'success');
      setFormOpen(false);
      setEditingCoach(null);
      await fetchCoaches();
    } catch (e) {
      console.error('Koç güncellenirken hata:', e);
      showToast('Ağ hatası. Tekrar deneyin.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoach = async () => {
    if (!deleteTarget) return;
    const token = await getAdminIdToken();
    if (!token) {
      showToast('Oturum bulunamadı.', 'error');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/coaches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: deleteTarget.id }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        showToast(data.error || 'Silinemedi.', 'error');
        return;
      }

      showToast(data.message || `${deleteTarget.name} kaldırıldı.`, 'success');
      setDeleteTarget(null);
      await fetchCoaches();
    } catch (e) {
      console.error(e);
      showToast('Ağ hatası.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const openAddModal = () => {
    setEditingCoach(null);
    setFormOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setEditingCoach(coach);
    setFormOpen(true);
  };

  const initialFormData = editingCoach
    ? {
        name: editingCoach.name,
        email: editingCoach.email,
        title: editingCoach.title,
        bio: editingCoach.bio,
        phone: editingCoach.phone,
      }
    : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Koç Yönetimi</h1>
          <p className="text-base font-medium text-gray-600 mt-1">
            Koç için giriş hesabı + profil oluştur, düzenle veya tamamen kaldır.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Koç Ekle
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border-4 border-black rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200 border-4 border-black" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 border-4 border-black rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-black mb-2">Henüz Koç Yok</h3>
          <p className="text-base font-medium text-gray-600 mb-6">Yeni koç ekleyerek giriş hesabı ve profil oluştur.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            İlk Koçu Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex items-center gap-5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              {coach.photoURL ? (
                <img
                  src={coach.photoURL}
                  alt={coach.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-black flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 border-4 border-black flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-indigo-600">{coach.name?.charAt(0)?.toUpperCase() || 'K'}</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-black truncate">{coach.name}</h3>
                <p className="text-sm font-semibold text-gray-500 truncate">{coach.title || 'Unvan belirtilmemiş'}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-gray-400">{coach.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(coach)}
                  className="px-4 py-2 bg-yellow-400 text-black font-bold text-xs border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(coach)}
                  className="px-4 py-2 bg-red-500 text-white font-bold text-xs border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CoachFormModal
        key={formOpen ? `open-${editingCoach?.id ?? 'new'}` : 'closed'}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCoach(null);
        }}
        onSave={editingCoach ? handleEditCoach : handleAddCoach}
        initialData={initialFormData}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        coachName={deleteTarget?.name || ''}
        onConfirm={handleDeleteCoach}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
