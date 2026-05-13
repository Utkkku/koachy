import type { AdminDashboardTab } from '@/src/types';

export { PACKAGE_LABELS } from '@/src/config/packages';

export const ADMIN_TABS: { id: AdminDashboardTab; label: string }[] = [
  { id: 'overview', label: 'Özet' },
  { id: 'payments', label: 'Ödemeler' },
  { id: 'coaches', label: 'Koç Atamaları' },
  { id: 'users', label: 'Kullanıcılar' },
];

export const CARD =
  'bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]';
export const TABLE_WRAP = `${CARD} overflow-hidden`;
export const TH =
  'px-4 py-3 text-left text-sm font-black uppercase tracking-wide border-b-4 border-black';
export const TD = 'px-4 py-3 text-sm font-medium text-black border-b-2 border-black';
export const NAV_BTN_ACTIVE =
  'bg-indigo-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
export const NAV_BTN =
  'text-black bg-white border-2 border-black hover:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
