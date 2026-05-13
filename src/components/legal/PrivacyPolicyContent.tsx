import { BRAND_EMAIL, BRAND_NAME } from '@/src/config/brand';

export function PrivacyPolicyContent({ variant = 'page' }: { variant?: 'page' | 'modal' }) {
  return (
    <>
      {variant === 'page' && (
        <header className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 mb-2">Yasal</p>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
            {BRAND_NAME} Gizlilik Politikası ve Aydınlatma Metni
          </h1>
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
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">1. Veri Sorumlusu</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, kişisel verileriniz veri sorumlusu
            sıfatıyla {BRAND_NAME} tarafından aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">2. Hangi Kişisel Verilerinizi İşliyoruz?</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            {BRAND_NAME} platformunu kullanımınız kapsamında aşağıdaki verileriniz toplanmakta ve işlenmektedir:
          </p>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">Kimlik Bilgileri:</span> Ad, soyad, profil fotoğrafı.
            </p>
            <p>
              <span className="font-black text-black">İletişim Bilgileri:</span> E-posta adresi, telefon numarası (Sadece
              onaylanan koç profillerinde ve eşleşme sağlandığında işlenir/aktarılır).
            </p>
            <p>
              <span className="font-black text-black">Kullanıcı İşlem Bilgileri:</span> Platform içi mesajlaşma (chat)
              kayıtları, seçilen koç tercihleri, satın alınan paket/kredi bilgileri, ödeme onay logları.
            </p>
            <p>
              <span className="font-black text-black">İşlem Güvenliği Bilgileri:</span> Şifre (kriptografik olarak
              şifrelenmiş halde tutulur), IP adresi, sisteme giriş-çıkış tarih/saat logları.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">3. Kişisel Verilerinizin İşlenme Amaçları</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen şartlara uygun olarak aşağıdaki amaçlarla
            işlenmektedir:
          </p>
          <ul className="space-y-3 text-lg text-gray-800 leading-relaxed font-medium list-disc pl-6">
            <li>Platform hesabı oluşturulması ve yetkilendirme (login/register) işlemlerinin yürütülmesi,</li>
            <li>Satın alınan eğitim/koçluk paketlerinin kullanıcı hesabına tanımlanması,</li>
            <li>Öğrenciler ile Koçlar arasında platform içi iletişimin sağlanması,</li>
            <li>
              Eşleşme kararı verildiğinde (&quot;Bu Koçla Çalış&quot; onayı), hizmetin WhatsApp gibi üçüncü taraf
              uygulamalar üzerinden sürdürülebilmesi için Koç&apos;un telefon numarasının ilgili Öğrenci ile paylaşılması,
            </li>
            <li>
              Sistem güvenliğinin sağlanması, sahtecilik ve dolandırıcılığın (örneğin sahte ödeme bildirimleri)
              önlenmesi,
            </li>
            <li>Yasal otoritelerden gelecek bilgi taleplerinin karşılanması.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">Verileriniz;</p>
          <ul className="space-y-3 text-lg text-gray-800 leading-relaxed font-medium list-disc pl-6">
            <li>
              KVKK Madde 5/2-c uyarınca bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (Kullanım
              Koşulları sözleşmesi),
            </li>
            <li>KVKK Madde 5/2-ç uyarınca veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,</li>
            <li>
              KVKK Madde 5/2-f uyarınca ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri
              sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması
            </li>
          </ul>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            hukuki sebeplerine dayanılarak otomatik yollarla (Firebase veritabanı aracılığıyla) toplanmaktadır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">5. Kişisel Verilerin Aktarılması</h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Kişisel verileriniz, yasal düzenlemelerin izin verdiği sınırlar dahilinde ve yukarıda sayılan amaçlarla;
          </p>
          <div className="space-y-4 text-lg text-gray-800 leading-relaxed font-medium">
            <p>
              <span className="font-black text-black">Hizmet Sağlayıcılar (Yurt Dışı Aktarımı):</span> Platformumuzun
              veritabanı, sunucu ve kimlik doğrulama altyapısı Google LLC (Firebase) tarafından sağlanmaktadır. Bu nedenle
              verileriniz, yüksek güvenlik standartlarına sahip yurt dışı merkezli sunucularda saklanmaktadır. (KVKK Madde
              9 kapsamında açık rıza/yeterli koruma şartlarına istinaden).
            </p>
            <p>
              <span className="font-black text-black">Kullanıcılar Arası Aktarım:</span> Platform iş modeli gereği, bir
              Öğrenci bir Koç ile çalışmayı seçtiğinde, Koç&apos;un kayıtlı telefon numarası iletişim amacıyla yalnızca o
              Öğrenciye gösterilir.
            </p>
            <p>
              <span className="font-black text-black">Yetkili Kurumlar:</span> Kanunen yetkili kamu kurumları ve adli
              makamlarla hukuki yükümlülüklerimiz çerçevesinde paylaşılabilir.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">
            6. KVKK Madde 11 Kapsamında İlgili Kişi Olarak Haklarınız
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp
            kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış
            işlenmişse düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz.
          </p>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            Taleplerinizi{' '}
            <span className="font-black text-black">{BRAND_EMAIL}</span> adresine e-posta yoluyla
            iletebilirsiniz. Talepleriniz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
          </p>
        </section>
      </article>
    </>
  );
}

