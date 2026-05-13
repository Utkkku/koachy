import type { Metadata } from 'next';
import { BRAND_NAME } from '@/src/config/brand';

export const metadata: Metadata = {
  title: `İletişim | ${BRAND_NAME}`,
  description: `${BRAND_NAME} destek ve iletişim formu.`,
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
