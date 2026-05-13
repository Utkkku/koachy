export function TermsContent({ variant = 'page' }: { variant?: 'page' | 'modal' }) {
  return (
    <>
      {variant === 'page' && (
        <header className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">Kullanım Şartları</h1>
          <p className="text-lg font-medium text-gray-600 leading-relaxed">Son güncelleme tarihi: 7 Nisan 2026</p>
        </header>
      )}

      <article
        className={
          variant === 'page'
            ? 'bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 space-y-10'
            : 'space-y-10'
        }
      >
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">1. Taraflar ve Sözleşmenin Konusu</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Bu Kullanım Koşulları sözleşmesi ile noktAtışı platformuna üye olan Öğrenci veya Koç arasında, platformun kullanım
            şartlarını ve dijital hizmet satışına ilişkin kuralları belirlemek amacıyla akdedilmiştir. Kullanıcı, platforma
            üye olarak bu Sözleşme&apos;nin tamamını okuduğunu ve kabul ettiğini beyan eder.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            2. Hizmetin Kapsamı ve Platformun Rolü (Aracı Hizmet Sağlayıcı)
          </h2>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">2.1.</span> noktAtışı; eğitim, sınav hazırlığı veya kişisel gelişim
              alanlarında destek almak isteyen &quot;Öğrenciler&quot; ile bu hizmeti sunan &quot;Koçları&quot; buluşturan bir
              dijital pazar yeri ve mesajlaşma altyapısıdır.
            </p>
            <p>
              <span className="font-black text-black">2.2.</span> noktAtışı&apos;nın temel görevi teknik altyapıyı sağlamak,
              paket satışlarını organize etmek ve tarafları eşleştirmektir. noktAtışı, platformdaki Koçların işvereni veya
              yöneticisi değildir. Koçlar tarafından verilecek danışmanlık hizmetinin niteliği, başarısı veya sonuçları
              hakkında noktAtışı herhangi bir garanti vermez.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">3. Üyelik, Paketler ve Ödeme Koşulları</h2>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">3.1.</span> Kullanıcılar, kayıt olurken doğru ve güncel bilgi vermekle
              yükümlüdür. Hesap güvenliği Kullanıcının sorumluluğundadır.
            </p>
            <p>
              <span className="font-black text-black">3.2.</span> Öğrenciler, platformda sunulan &quot;Koçluk Paketlerini&quot;
              sistemin yönlendireceği güvenli ödeme bağlantıları aracılığıyla satın alırlar.
            </p>
            <p>
              <span className="font-black text-black">3.3.</span> Ödeme işleminin tamamlanmasının ardından, noktAtışı yöneticileri
              tarafından sistem üzerinden manuel onay verilerek Kullanıcının hesabına paket kullanım hakkı (kredi/hak)
              tanımlanır.
            </p>
            <p>
              <span className="font-black text-black">3.4.</span> noktAtışı, paket fiyatlarında önceden haber vermeksizin
              değişiklik yapma hakkını saklı tutar.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            4. İletişim, Koç Seçimi ve WhatsApp&apos;a Geçiş
          </h2>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">4.1.</span> Hesabına paket tanımlanan Öğrenci, platformdaki Koçlara mesaj
              atabilir ve ön görüşme yapabilir.
            </p>
            <p>
              <span className="font-black text-black">4.2.</span> Öğrenci, &quot;Bu Koçla Çalış&quot; onayını verdiğinde eşleşme
              tamamlanır ve Koçun sisteme kayıtlı cep telefonu numarası Öğrenciye görünür hale gelir.
            </p>
            <p>
              <span className="font-black text-black">4.3. Platform Dışı İletişim Sorumluluk Reddi:</span> Eşleşme sağlandıktan
              ve iletişim WhatsApp (veya benzeri üçüncü taraf uygulamalar) platformuna taşındıktan sonra; taraflar arasında
              yaşanabilecek iletişim kopuklukları, hakaret, kişisel veri ihlali, hizmetin eksik ifası veya uyuşmazlıklardan
              noktAtışı hiçbir şekilde hukuki veya cezai olarak sorumlu tutulamaz. Platform dışı iletişim tamamen Kullanıcıların
              kendi sorumluluğundadır.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">5. Cayma Hakkı İptal ve İade Koşulları</h2>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">5.1.</span> 27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği&apos;nin
              15. maddesinin (ğ) bendi (&quot;Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim
              edilen gayrimaddi mallara ilişkin sözleşmeler&quot;) uyarınca, satın alınan paketler cayma hakkının istisnası
              kapsamındadır.
            </p>
            <p>
              <span className="font-black text-black">5.2.</span> Paket ücreti ödenip Admin onayı verildikten ve Kullanıcı
              platform üzerinden bir Koç ile iletişime geçip eşleşme (&quot;Bu Koçla Çalış&quot; aksiyonu) sağladıktan sonra,
              kesinlikle ücret iadesi yapılmaz.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">6. Hizmetin Kötüye Kullanımı ve Hesap Feshi</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Aşağıdaki durumlarda noktAtışı, Kullanıcının hesabını önceden haber vermeksizin askıya alabilir veya kalıcı olarak
            silebilir (Varsa satın alınmış paketler iade edilmez):
          </p>
          <ul className="space-y-3 text-lg text-gray-800 leading-relaxed font-medium list-disc pl-6">
            <li>Ödeme yapılmadığı halde sahte/yanıltıcı bildirimlerle sistemi manipüle etmeye çalışmak,</li>
            <li>Platform içi mesajlaşmalarda küfür, hakaret veya yasa dışı içerik paylaşmak,</li>
            <li>Koçların veya Öğrencilerin kişisel verilerini platform amacı dışında kullanmak veya dağıtmak,</li>
            <li>Sistemin (API, veritabanı, frontend) teknik işleyişine zarar verecek siber girişimlerde bulunmak.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">7. Fikri Mülkiyet Hakları</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            noktAtışı platformunun tüm kod yapısı, veritabanı tasarımı, arayüzü ve logoları noktAtışı&apos;ya aittir. Kullanıcılar
            bunları kopyalayamaz, tersine mühendislik yapamaz veya ticari amaçla çoğaltamaz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">8. Uyuşmazlıkların Çözümü</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Bu Sözleşme&apos;nin uygulanmasından doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti kanunları
            uygulanacak olup, İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
          </p>
        </section>
      </article>
    </>
  );
}

