import type { AdminLogEntry } from '@/src/types';
import { TABLE_WRAP, TD } from '../admin-dashboard-constants';

interface UsersTabProps {
  pageLoading: boolean;
  logs: AdminLogEntry[];
}

export function UsersTab({ pageLoading, logs }: UsersTabProps) {
  return (
    <div className={TABLE_WRAP}>
      <div className="p-4 border-b-4 border-black">
        <h2 className="text-xl font-black text-black">Sistem günlüğü</h2>
        <p className="text-sm font-medium text-gray-600 mt-1">
          Üyelikler ve son mesaj aktivitesi (özet).
        </p>
      </div>
      {pageLoading ? (
        <div className="p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-100 border-2 border-gray-200 rounded" />
          ))}
        </div>
      ) : (
        <ul className="divide-y-2 divide-black">
          {logs.length === 0 ? (
            <li className={`${TD} border-0 text-center text-gray-500 py-12`}>
              Henüz kayıt yok.
            </li>
          ) : (
            logs.map((log) => (
              <li
                key={log.id}
                className="px-4 py-3 text-sm font-medium text-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white"
              >
                <span>{log.line}</span>
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                  {log.at.toLocaleString('tr-TR')}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
