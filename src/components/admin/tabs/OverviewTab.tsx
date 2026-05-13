import { CARD } from '../admin-dashboard-constants';

interface OverviewTabProps {
  pageLoading: boolean;
  stats: {
    coaches: number;
    students: number;
    pendingPayments: number;
    pendingCoachProfiles: number;
  };
}

export function OverviewTab({ pageLoading, stats }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {pageLoading ? (
        <>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${CARD} p-6 h-32 animate-pulse bg-gray-100`} />
          ))}
        </>
      ) : (
        <>
          <div className={`${CARD} p-6`}>
            <p className="text-sm font-bold text-gray-500 uppercase">Koçlar</p>
            <p className="text-4xl font-black mt-2">{stats.coaches}</p>
          </div>
          <div className={`${CARD} p-6`}>
            <p className="text-sm font-bold text-gray-500 uppercase">Öğrenciler</p>
            <p className="text-4xl font-black mt-2">{stats.students}</p>
          </div>
          <div className={`${CARD} p-6 bg-yellow-100`}>
            <p className="text-sm font-bold text-gray-700 uppercase">Bekleyen ödeme</p>
            <p className="text-4xl font-black mt-2">{stats.pendingPayments}</p>
          </div>
          <div className={`${CARD} p-6 bg-cyan-100`}>
            <p className="text-sm font-bold text-gray-700 uppercase">Onay bekleyen koç</p>
            <p className="text-4xl font-black mt-2">{stats.pendingCoachProfiles}</p>
          </div>
        </>
      )}
    </div>
  );
}
