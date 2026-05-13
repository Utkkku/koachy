import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/src/components/page-shell';
import { BRAND_NAME } from '@/src/config/brand';
import { BookOpen, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: `Yardım Merkezi | ${BRAND_NAME}`,
  description: `${BRAND_NAME} platformunda sık kullanılan konular ve hızlı bağlantılar.`,
};

const topics = [
  {
    title: 'Hesap ve giriş',
    description: 'Kayıt, şifre sıfırlama ve profil ayarları hakkında temel bilgiler.',
    href: '/sss',
    icon: HelpCircle,
  },
  {
    title: 'Koç seçimi ve paketler',
    description: 'Koçları keşfetme, paket seçimi ve mesajlaşmaya başlama.',
    href: '/pricing',
    icon: BookOpen,
  },
  {
    title: 'Bize yazın',
    description: 'Teknik sorun veya önerileriniz için doğrudan iletişim formu.',
    href: '/iletisim',
    icon: MessageCircle,
  },
];

export default function YardimMerkeziPage() {
  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Destek</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">Yardım Merkezi</h1>
        <p className="text-lg font-medium text-gray-600 leading-relaxed">
          Aradığın cevabı bulmana yardımcı olacak başlıklar ve bağlantılar. Daha fazlası için SSS veya iletişim
          sayfamıza göz atabilirsin.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {topics.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex items-start gap-4 p-6 bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-yellow-300 border-2 border-black">
              <t.icon className="w-6 h-6 text-black" strokeWidth={2.5} />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-black mb-1 group-hover:text-indigo-600 transition-colors">{t.title}</h2>
              <p className="text-sm font-medium text-gray-600 leading-relaxed">{t.description}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-black shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="border-4 border-black rounded-xl p-6 md:p-8 bg-gray-50">
        <h3 className="font-black text-black mb-2">Hâlâ yardıma mı ihtiyacın var?</h3>
        <p className="text-sm font-medium text-gray-600 mb-4">
          Destek ekibimiz mesajlarına en kısa sürede dönüş yapmaya çalışır. Hafta içi yanıt süreleri genelde 1–2 iş
          günüdür.
        </p>
        <Link
          href="/iletisim"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-black text-sm border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          İletişim formu
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </PageShell>
  );
}
