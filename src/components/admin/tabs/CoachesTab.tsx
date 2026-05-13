import type { AssignmentRow, CoachOption, PendingCoachRow } from '@/src/types';
import { TABLE_WRAP, TH, TD } from '../admin-dashboard-constants';
import { AdminTableSkeleton } from '../AdminTableSkeleton';
import { formatFirestoreDate } from '../format-firestore-date';

interface CoachesTabProps {
  pageLoading: boolean;
  pendingCoaches: PendingCoachRow[];
  publishingId: string | null;
  handlePublishCoach: (coachId: string) => void;
  assignments: AssignmentRow[];
  coachOptions: CoachOption[];
  savingAssignment: string | null;
  localCoachSelection: Record<string, string>;
  setLocalCoachSelection: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAssignmentChange: (studentId: string) => void;
}

export function CoachesTab({
  pageLoading,
  pendingCoaches,
  publishingId,
  handlePublishCoach,
  assignments,
  coachOptions,
  savingAssignment,
  localCoachSelection,
  setLocalCoachSelection,
  handleAssignmentChange,
}: CoachesTabProps) {
  return (
    <div className="space-y-8">
      <div className={TABLE_WRAP}>
        <div className="p-4 border-b-4 border-black">
          <h2 className="text-xl font-black text-black">Koç onayı (yeni kayıtlar)</h2>
          <p className="text-sm font-medium text-gray-600 mt-1">
            <code className="font-mono text-xs">isApproved: false</code> olan koçlar vitrine çıkmaz.
          </p>
        </div>
        {pageLoading ? (
          <div className="p-4">
            <AdminTableSkeleton rows={4} cols={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="bg-cyan-300">
                  <th className={TH}>Ad</th>
                  <th className={TH}>E-posta</th>
                  <th className={TH}>Unvan</th>
                  <th className={TH}>Kayıt</th>
                  <th className={`${TH} text-right`}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {pendingCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`${TD} text-center text-gray-500 py-10`}>
                      Onay bekleyen koç yok.
                    </td>
                  </tr>
                ) : (
                  pendingCoaches.map((c) => (
                    <tr key={c.id} className="bg-white">
                      <td className={TD}>{c.name}</td>
                      <td className={TD}>{c.email}</td>
                      <td className={TD}>{c.title || '—'}</td>
                      <td className={TD}>{formatFirestoreDate(c.createdAt)}</td>
                      <td className={`${TD} text-right`}>
                        <button
                          type="button"
                          disabled={publishingId === c.id}
                          onClick={() => handlePublishCoach(c.id)}
                          className="px-4 py-2 bg-indigo-500 text-white font-black text-xs border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                        >
                          {publishingId === c.id ? '…' : 'Profili Yayınla'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={TABLE_WRAP}>
        <div className="p-4 border-b-4 border-black">
          <h2 className="text-xl font-black text-black">Manuel koç ataması</h2>
          <p className="text-sm font-medium text-gray-600 mt-1">
            Öğrencinin seçtiği koçu listeden değiştirebilirsiniz.
          </p>
        </div>
        {pageLoading ? (
          <div className="p-4">
            <AdminTableSkeleton rows={5} cols={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="bg-pink-300">
                  <th className={TH}>Öğrenci</th>
                  <th className={TH}>Mevcut koç</th>
                  <th className={TH}>Yeni koç</th>
                  <th className={`${TH} text-right`}>Kaydet</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={`${TD} text-center text-gray-500 py-10`}>
                      Koç seçmiş öğrenci yok.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.studentId} className="bg-white">
                      <td className={TD}>{a.studentName}</td>
                      <td className={TD}>{a.coachName}</td>
                      <td className={TD}>
                        <select
                          className="w-full max-w-xs border-4 border-black rounded-lg px-3 py-2 font-bold text-sm bg-white"
                          value={localCoachSelection[a.studentId] ?? a.selectedCoachId ?? ''}
                          onChange={(e) =>
                            setLocalCoachSelection((prev) => ({
                              ...prev,
                              [a.studentId]: e.target.value,
                            }))
                          }
                        >
                          {coachOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${TD} text-right`}>
                        <button
                          type="button"
                          disabled={
                            savingAssignment === a.studentId ||
                            (localCoachSelection[a.studentId] ?? a.selectedCoachId) === a.selectedCoachId
                          }
                          onClick={() => handleAssignmentChange(a.studentId)}
                          className="px-4 py-2 bg-black text-white font-black text-xs border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-40"
                        >
                          {savingAssignment === a.studentId ? '…' : 'Güncelle'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
