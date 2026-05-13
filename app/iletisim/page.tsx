'use client';

import { useState } from 'react';
import { PageShell } from '@/src/components/page-shell';
import { BRAND_EMAIL } from '@/src/config/brand';
import { Send } from 'lucide-react';

export default function IletisimPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // İleride e-posta API veya Firebase ile bağlanabilir
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <PageShell>
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Destek</p>
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">İletişim</h1>
        <p className="text-lg font-medium text-gray-600 leading-relaxed">
          Soruların, önerilerin veya teknik bildirimlerin için formu doldur. E-posta ile de bize ulaşabilirsin:{' '}
          <a href={`mailto:${BRAND_EMAIL}`} className="font-bold text-indigo-600 underline hover:text-indigo-800">
            {BRAND_EMAIL}
          </a>
        </p>
      </div>

      {sent ? (
        <div
          role="status"
          className="border-4 border-black rounded-xl p-8 md:p-10 bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h2 className="text-2xl font-black text-black mb-2">Mesajın alındı</h2>
          <p className="text-base font-medium text-gray-700">
            Teşekkürler. En kısa sürede seninle iletişime geçeceğiz.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-6 px-5 py-2.5 font-black text-sm border-2 border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Yeni mesaj gönder
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 border-4 border-black rounded-xl p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:bg-indigo-50"
              placeholder="Adın ve soyadın"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:bg-indigo-50"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
              Konu
            </label>
            <select
              id="subject"
              name="subject"
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:bg-indigo-50 bg-white"
              defaultValue="genel"
            >
              <option value="genel">Genel soru</option>
              <option value="teknik">Teknik destek</option>
              <option value="odeme">Ödeme / paket</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
              Mesaj
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full px-4 py-3 border-2 border-black rounded-lg font-medium focus:outline-none focus:bg-indigo-50 resize-y min-h-[120px]"
              placeholder="Mesajını buraya yaz..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-black text-base border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              'Gönderiliyor...'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gönder
              </>
            )}
          </button>
        </form>
      )}
    </PageShell>
  );
}
