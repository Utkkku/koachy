import type { PurchaseRequestRow } from '@/src/types';
import { PACKAGE_LABELS } from '@/src/config/packages';
import { TABLE_WRAP, TH, TD } from '../admin-dashboard-constants';
import { AdminTableSkeleton } from '../AdminTableSkeleton';
import { formatFirestoreDate } from '../format-firestore-date';

interface PaymentsTabProps {
  pageLoading: boolean;
  purchaseRequests: PurchaseRequestRow[];
  approvingId: string | null;
  handleApprovePayment: (row: PurchaseRequestRow) => void;
}

export function PaymentsTab({ pageLoading, purchaseRequests, approvingId, handleApprovePayment }: PaymentsTabProps) {
  return (
    <div className={TABLE_WRAP}>
      <div className="p-4 border-b-4 border-black bg-white">
        <h2 className="text-xl font-black text-black">Ödemeler ve onay</h2>
        <p className="text-sm font-medium text-gray-600 mt-1">
          Öğrenci paket talepleri — ödeme linki sonrası manuel onay.
        </p>
      </div>
      {pageLoading ? (
        <div className="p-4">
          <AdminTableSkeleton rows={6} cols={5} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-yellow-300">
                <th className={TH}>Öğrenci</th>
                <th className={TH}>Paket</th>
                <th className={TH}>Tarih</th>
                <th className={TH}>Durum</th>
                <th className={`${TH} text-right`}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`${TD} text-center text-gray-500 py-10`}>
                    Henüz satın alma talebi yok.
                  </td>
                </tr>
              ) : (
                purchaseRequests.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className={TD}>{row.studentName || '—'}</td>
                    <td className={TD}>{PACKAGE_LABELS[row.packageId] || row.packageId}</td>
                    <td className={TD}>{formatFirestoreDate(row.requestedAt)}</td>
                    <td className={TD}>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-black border-2 border-black rounded ${
                          row.status === 'approved' ? 'bg-green-300' : 'bg-orange-200'
                        }`}
                      >
                        {row.status === 'approved' ? 'Onaylandı' : 'Bekliyor'}
                      </span>
                    </td>
                    <td className={`${TD} text-right`}>
                      {row.status === 'pending' ? (
                        <button
                          type="button"
                          disabled={approvingId === row.id}
                          onClick={() => handleApprovePayment(row)}
                          className="px-4 py-2 bg-green-500 text-black font-black text-xs border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                        >
                          {approvingId === row.id ? '…' : 'Ödemeyi Onayla'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
