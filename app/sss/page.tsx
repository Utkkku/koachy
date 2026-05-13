import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/src/components/page-shell';
import { faqItems } from '@/src/data/faq';
import { BRAND_NAME } from '@/src/config/brand';

export const metadata: Metadata = {
  title: `Sıkça Sorulan Sorular | ${BRAND_NAME}`,
  description: `${BRAND_NAME} hakkında merak edilen sorular ve cevapları.`,
};

export default function SssPage() {
  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Destek</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">Sıkça Sorulan Sorular</h1>
        <p className="text-lg font-medium text-gray-600 leading-relaxed">
          Aşağıda en çok sorulan konuları derledik. Aradığın cevap yoksa{' '}
          <Link href="/iletisim" className="font-bold text-indigo-600 underline hover:text-indigo-800">
            iletişim
          </Link>{' '}
          sayfamızdan yazabilirsin.
        </p>
      </div>

      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <details
            key={index}
            className="group border-4 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] open:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
          >
            <summary className="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 font-black text-black text-base md:text-lg flex items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-yellow-300 text-lg leading-none group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 border-t-2 border-black">
              <p className="text-sm md:text-base font-medium text-gray-700 leading-relaxed pt-4">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 p-6 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
        <p className="text-sm font-medium text-gray-600 mb-3">Daha fazla yardım için</p>
        <Link
          href="/yardim-merkezi"
          className="inline-flex font-black text-indigo-600 underline hover:text-indigo-800"
        >
          Yardım merkezine git
        </Link>
      </div>
    </PageShell>
  );
}
