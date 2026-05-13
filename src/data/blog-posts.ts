export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'yks-2026-calisma-plani',
    title: 'YKS 2026 için verimli çalışma planı nasıl kurulur?',
    excerpt: 'TYT ve AYT dengesini kurmak, tekrar ritmini oturtmak ve tükenmişliği önlemek için pratik öneriler.',
    date: '2026-03-18',
    readTime: '5 dk',
    content: `Sınav hazırlığında tutarlı bir plan, motivasyonu ve netleri birlikte taşır. İşte öne çıkan başlıklar:

**Haftalık bloklar:** Her hafta TYT ve AYT için ayrılmış net süreler belirle; sadece “bugün çok çalıştım” hissi yerine konu bazlı ilerleme takip et.

**Tekrar döngüsü:** Yeni konuyu bitirdikten sonra 1., 7. ve 21. günlerde kısa tekrarlar planla. Uzun metinli notlar yerine kartlar ve formül sayfaları kullan.

**Dinlenme:** Yoğun dönemlerde bile haftada en az bir tam gün nefes payı bırak; uyku düzenini bozma.

noktAtışı’da koçunla birlikte planını haftalık olarak gözden geçirmek, bu yapıyı sürdürülebilir kılar.`,
  },
  {
    slug: 'motivasyonu-yuksek-tutmak',
    title: 'Motivasyonu uzun maratonda yüksek tutmanın 4 yolu',
    excerpt: 'Küçük hedefler, sosyal destek ve ölçülebilir kazanımlarla sıkılmadan ilerlemek.',
    date: '2026-02-22',
    readTime: '4 dk',
    content: `Motivasyon dalgalanır; önemli olan sistemi korumaktır.

1. **Mikro hedefler:** Günlük 3 görev; hepsi bitince günü kapat. Büyük hedefi parçala.
2. **Görünür ilerleme:** Takvimde işaretleme veya basit bir tablo ile haftalık net artışını gör.
3. **Destek ağı:** Ailen, arkadaşların ve varsa koçunla düzenli check-in yap.
4. **Telafi değil devam:** Kötü bir gün tüm planı çöp etmez; ertesi gün kaldığın yerden devam et.

Koç desteği, bu alışkanlıkları birlikte netleştirmek için güçlü bir araçtır.`,
  },
  {
    slug: 'deneme-sonrasi-analiz',
    title: 'Deneme sonrası analiz: hatayı azaltmanın en hızlı yolu',
    excerpt: 'Her denemeden sonra yapılacak 15 dakikalık kontrol listesi.',
    date: '2026-01-10',
    readTime: '6 dk',
    content: `Deneme çözmek kadar, sonrasını doğru okumak da performansı belirler.

- Yanlışları “dikkatsizlik / bilgi eksikliği / zaman yetmedi” diye ayır.
- Bilgi eksikliği varsa ilgili konuya aynı hafta mini tekrar ekle.
- Zaman baskısı varsa bölüm bazlı süre hedefi koy; her denemede 5 dakika iyileştir.

Koçunla paylaştığın deneme analizi, bir sonraki haftanın çalışma planını doğrudan şekillendirir.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
