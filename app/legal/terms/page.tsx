import type { Metadata } from 'next';
import { PageShell } from '@/src/components/page-shell';
import { TermsContent } from '@/src/components/legal/TermsContent';
import { BRAND_NAME } from '@/src/config/brand';

export const metadata: Metadata = {
  title: `Kullanım Şartları | ${BRAND_NAME}`,
  description: `${BRAND_NAME} hizmet kullanım şartları ve koşulları.`,
};

export default function TermsOfServicePage() {
  return (
    <PageShell wide>
      <TermsContent />
    </PageShell>
  );
}
