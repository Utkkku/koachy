/**
 * Firestore'a sahte koç verileri ekleyen seed scripti.
 * 
 * KURULUM (tek seferlik):
 *   1. Firebase Console > Proje Ayarları > Hizmet Hesapları (Service Accounts)
 *      https://console.firebase.google.com/project/kocluk-488b0/settings/serviceaccounts/adminsdk
 *   2. "Yeni Özel Anahtar Oluştur" (Generate New Private Key) butonuna tıkla
 *   3. İndirilen JSON dosyasını proje kök dizinine "serviceAccountKey.json" olarak kaydet
 * 
 * ÇALIŞTIRMAK İÇİN:
 *   npm run seed:coaches
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ==========================================
// Firebase Admin SDK - Service Account ile
// ==========================================
const keyPath = resolve(process.cwd(), 'serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error('❌ serviceAccountKey.json bulunamadı!\n');
  console.error('Aşağıdaki adımları takip edin:');
  console.error('  1. Firebase Console\'a gidin:');
  console.error('     https://console.firebase.google.com/project/kocluk-488b0/settings/serviceaccounts/adminsdk');
  console.error('  2. "Yeni Özel Anahtar Oluştur" butonuna tıklayın');
  console.error('  3. İndirilen dosyayı proje kök dizinine "serviceAccountKey.json" olarak kaydedin');
  console.error('  4. Bu scripti tekrar çalıştırın: npm run seed:coaches\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// ==========================================
// SAHTE KOÇ VERİLERİ
// ==========================================
const dummyCoaches = [
  {
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    role: 'Coach',
    title: 'Matematik Uzmanı & Sınav Koçu',
    bio: 'İstanbul Üniversitesi Matematik bölümü mezunuyum. 8 yıllık öğretmenlik deneyimim ile YKS ve LGS\'ye hazırlanan yüzlerce öğrenciye koçluk yaptım. Motivasyon ve planlama konusunda uzmanım.',
    photoURL: '',
    hourlyRate: 500,
    phone: '0532 111 22 33',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Elif Kaya',
    email: 'elif.kaya@example.com',
    role: 'Coach',
    title: 'Rehberlik Uzmanı & Eğitim Danışmanı',
    bio: 'Marmara Üniversitesi PDR mezunuyum. Öğrencilerin hem akademik hem de duygusal gelişimlerine odaklanıyorum. Sınav kaygısı, zaman yönetimi ve verimli ders çalışma teknikleri konusunda destek veriyorum.',
    photoURL: '',
    hourlyRate: 450,
    phone: '0533 222 33 44',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Mehmet Demir',
    email: 'mehmet.demir@example.com',
    role: 'Coach',
    title: 'Fen Bilimleri Koçu',
    bio: 'ODTÜ Fizik mezunuyum. Fizik, kimya ve biyoloji alanlarında 10+ yıl deneyime sahibim. Karmaşık konuları basit ve anlaşılır hale getirme konusunda uzmanım. LGS ve YKS Fen tam puan stratejileri.',
    photoURL: '',
    hourlyRate: 600,
    phone: '0535 333 44 55',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Zeynep Arslan',
    email: 'zeynep.arslan@example.com',
    role: 'Coach',
    title: 'Türkçe & Edebiyat Koçu',
    bio: 'Ankara Üniversitesi Türk Dili ve Edebiyatı mezunuyum. Paragraf çözme teknikleri, dil bilgisi ve edebiyat konularında öğrencilere rehberlik ediyorum. YKS Türkçe-Sosyal netlerini garantiye alın!',
    photoURL: '',
    hourlyRate: 400,
    phone: '0536 444 55 66',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Can Öztürk',
    email: 'can.ozturk@example.com',
    role: 'Coach',
    title: 'KPSS & Kariyer Koçu',
    bio: 'Hacettepe Üniversitesi İşletme mezunuyum. KPSS\'de derece yaparak atandım. Şimdi KPSS\'ye hazırlanan adaylara koçluk yapıyorum. Çalışma planı, motivasyon ve strateji konularında uzmanım.',
    photoURL: '',
    hourlyRate: 550,
    phone: '0537 555 66 77',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ==========================================
// SEED FONKSİYONU
// ==========================================
async function seedCoaches() {
  console.log('🚀 Koç verileri Firestore\'a ekleniyor...\n');

  let success = 0;
  let failed = 0;

  for (const coach of dummyCoaches) {
    try {
      const docRef = await db.collection('users').add(coach);
      console.log(`  ✅ ${coach.name} eklendi (ID: ${docRef.id})`);
      success++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ ${coach.name} eklenirken hata: ${msg}`);
      failed++;
    }
  }

  console.log(`\n📊 Sonuç: ${success} başarılı, ${failed} başarısız`);
  
  if (success > 0) {
    console.log('🎉 Koçlar başarıyla eklendi!');
    console.log('📌 Firestore Console: https://console.firebase.google.com/project/kocluk-488b0/firestore');
    console.log('🌐 Koçlar Sayfası: http://localhost:3000/coaches');
  }

  if (failed > 0) {
    console.log('\n⚠️  Bazı koçlar eklenemedi. Hata detaylarını yukarıda kontrol edin.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

seedCoaches();
