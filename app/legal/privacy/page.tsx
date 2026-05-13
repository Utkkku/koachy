import type { Metadata } from 'next';
import { PageShell } from '@/src/components/page-shell';
import { PrivacyPolicyContent } from '@/src/components/legal/PrivacyPolicyContent';
import { BRAND_NAME } from '@/src/config/brand';

export const metadata: Metadata = {
  title: `Gizlilik Politikası | ${BRAND_NAME}`,
  description: `${BRAND_NAME} gizlilik politikası ve kişisel verilerin korunması.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PageShell wide>
      <PrivacyPolicyContent />
    </PageShell>
  );
}
