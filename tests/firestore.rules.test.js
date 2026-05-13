/**
 * Firestore Security Rules Test Suite
 *
 * Bu test dosyası Firebase Emulators üzerinde çalışır.
 * Testleri çalıştırmak için:
 * 1. Firebase Emulators'ı başlatın: npm run emulators:start
 * 2. Başka bir terminalde: npm run test:rules
 *
 * VEYA tek komutla: npm run emulators:exec
 *
 * Jest ortamı CommonJS; @firebase/rules-unit-testing require ile yüklenir.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Jest + rules-unit-testing CJS */
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const fs = require('fs');

// Test ortamı değişkenleri
let testEnv;
let adminDb;
let studentDb;
let coachDb;
let unauthenticatedDb;

// Test kullanıcı ID'leri
const ADMIN_UID = 'admin-user-id';
const STUDENT_UID = 'student-user-id';
const COACH_UID = 'coach-user-id';
const OTHER_STUDENT_UID = 'other-student-id';
const OTHER_COACH_UID = 'other-coach-id';

beforeAll(async () => {
  // Test ortamını başlat
  // Emulator host ve port'u environment variable'dan veya varsayılan değerlerden al
  const host = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[0] || 'localhost';
  const port = process.env.FIRESTORE_EMULATOR_HOST?.split(':')[1] || 8082;
  
  testEnv = await initializeTestEnvironment({
    projectId: 'koachy-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: host,
      port: parseInt(port),
    },
  });

  // Farklı roller için veritabanı bağlantıları oluştur
  adminDb = testEnv.authenticatedContext(ADMIN_UID, {
    email: 'admin@koachy.com',
  }).firestore();

  studentDb = testEnv.authenticatedContext(STUDENT_UID, {
    email: 'student@koachy.com',
  }).firestore();

  coachDb = testEnv.authenticatedContext(COACH_UID, {
    email: 'coach@koachy.com',
  }).firestore();

  unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// Helper function: Kullanıcı rollerini ayarla
async function setupUserRoles() {
  // Güvenlik kurallarını devre dışı bırakarak admin kullanıcısını oluştur
  // (Çünkü admin kullanıcısını oluşturmak için admin olması gerekiyor - yumurta-tavuk problemi)
  // Admin kullanıcı oluştur (güvenlik kuralları devre dışı)
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.collection('users').doc(ADMIN_UID).set({
      role: 'Admin',
      email: 'admin@koachy.com',
      name: 'Admin User',
    });

    // Diğer kullanıcıları admin olarak oluştur
    await db.collection('users').doc(STUDENT_UID).set({
      role: 'Student',
      email: 'student@koachy.com',
      name: 'Student User',
    });

    await db.collection('users').doc(COACH_UID).set({
      role: 'Coach',
      email: 'coach@koachy.com',
      name: 'Coach User',
      isApproved: true,
    });

    await db.collection('users').doc(OTHER_STUDENT_UID).set({
      role: 'Student',
      email: 'other-student@koachy.com',
      name: 'Other Student',
    });

    await db.collection('users').doc(OTHER_COACH_UID).set({
      role: 'Coach',
      email: 'other-coach@koachy.com',
      name: 'Other Coach',
      isApproved: false,
    });
  });
}

describe('Firestore Security Rules Tests', () => {
  beforeEach(async () => {
    // Her test öncesi veritabanını temizle ve kullanıcı rollerini ayarla
    await testEnv.clearFirestore();
    await setupUserRoles();
  });

  describe('Users Collection Rules', () => {
    test('Kullanıcı kendi profilini okuyabilir', async () => {
      await assertSucceeds(
        studentDb.collection('users').doc(STUDENT_UID).get()
      );
    });

    test('Öğrenci başka öğrenci veya admin profilini okuyamaz', async () => {
      await assertFails(studentDb.collection('users').doc(ADMIN_UID).get());
      await assertFails(studentDb.collection('users').doc(OTHER_STUDENT_UID).get());
    });

    test('Öğrenci onaylı koç vitrin profilini okuyabilir (herkese açık)', async () => {
      await assertSucceeds(studentDb.collection('users').doc(COACH_UID).get());
    });

    test('Öğrenci onaysız koç kullanıcı dokümanını okuyamaz', async () => {
      await assertFails(studentDb.collection('users').doc(OTHER_COACH_UID).get());
    });

    test('Admin tüm kullanıcıları okuyabilir', async () => {
      await assertSucceeds(
        adminDb.collection('users').doc(STUDENT_UID).get()
      );
      await assertSucceeds(
        adminDb.collection('users').doc(COACH_UID).get()
      );
    });

    test('Kullanıcı kendi profilini güncelleyebilir (role hariç)', async () => {
      await assertSucceeds(
        studentDb.collection('users').doc(STUDENT_UID).update({
          name: 'Updated Name',
        })
      );
    });

    test('Kullanıcı kendi rolünü değiştiremez', async () => {
      await assertFails(
        studentDb.collection('users').doc(STUDENT_UID).update({
          role: 'Admin',
        })
      );
    });

    test('Öğrenci hasPackage / credits / isApproved alanlarını güncelleyemez', async () => {
      await assertFails(
        studentDb.collection('users').doc(STUDENT_UID).update({ hasPackage: true })
      );
      await assertFails(
        studentDb.collection('users').doc(STUDENT_UID).update({ credits: 99 })
      );
      await assertFails(
        studentDb.collection('users').doc(STUDENT_UID).update({ isApproved: true })
      );
    });

    test('Sadece admin kullanıcı oluşturabilir', async () => {
      await assertSucceeds(
        adminDb.collection('users').doc('new-user').set({
          role: 'Student',
          email: 'new@koachy.com',
        })
      );
    });

    test('Student kullanıcı oluşturamaz', async () => {
      await assertFails(
        studentDb.collection('users').doc('new-user').set({
          role: 'Student',
          email: 'new@koachy.com',
        })
      );
    });
  });

  describe('Coaches Collection Rules', () => {
    beforeEach(async () => {
      // Test için coach profili oluştur
      await adminDb.collection('coaches').doc(COACH_UID).set({
        name: 'Test Coach',
        bio: 'Test bio',
        specialties: ['Fitness', 'Nutrition'],
      });
    });

    test('Herkes coach profillerini okuyabilir (public)', async () => {
      // Authenticated user
      await assertSucceeds(
        studentDb.collection('coaches').doc(COACH_UID).get()
      );

      // Unauthenticated user
      await assertSucceeds(
        unauthenticatedDb.collection('coaches').doc(COACH_UID).get()
      );
    });

    test('Coach kendi profilini güncelleyebilir', async () => {
      await assertSucceeds(
        coachDb.collection('coaches').doc(COACH_UID).update({
          bio: 'Updated bio',
        })
      );
    });

    test('Student coach profilini güncelleyemez', async () => {
      await assertFails(
        studentDb.collection('coaches').doc(COACH_UID).update({
          bio: 'Hacked bio',
        })
      );
    });

    test('Coach kendi profilini oluşturabilir', async () => {
      await assertSucceeds(
        coachDb.collection('coaches').doc(COACH_UID).set({
          name: 'New Coach',
          bio: 'New bio',
        })
      );
    });

    test('Student coach profili oluşturamaz', async () => {
      await assertFails(
        studentDb.collection('coaches').doc('new-coach').set({
          name: 'New Coach',
        })
      );
    });
  });

  describe('Appointments Collection Rules', () => {
    let appointmentId;

    beforeEach(async () => {
      // Test için randevu oluştur (student olarak, çünkü sadece student randevu oluşturabilir)
      const appointmentRef = await studentDb.collection('appointments').add({
        coachId: COACH_UID,
        studentId: STUDENT_UID,
        date: new Date(),
        status: 'scheduled',
        notes: 'Test appointment',
      });
      appointmentId = appointmentRef.id;
    });

    test('Student kendi randevusunu okuyabilir', async () => {
      await assertSucceeds(
        studentDb.collection('appointments').doc(appointmentId).get()
      );
    });

    test('Coach kendi randevusunu okuyabilir', async () => {
      await assertSucceeds(
        coachDb.collection('appointments').doc(appointmentId).get()
      );
    });

    test('Başka student randevuyu okuyamaz', async () => {
      const otherStudentDb = testEnv.authenticatedContext(OTHER_STUDENT_UID, {
        email: 'other-student@koachy.com',
      }).firestore();

      await assertFails(
        otherStudentDb.collection('appointments').doc(appointmentId).get()
      );
    });

    test('Başka coach randevuyu okuyamaz', async () => {
      const otherCoachDb = testEnv.authenticatedContext(OTHER_COACH_UID, {
        email: 'other-coach@koachy.com',
      }).firestore();

      await assertFails(
        otherCoachDb.collection('appointments').doc(appointmentId).get()
      );
    });

    test('Admin tüm randevuları okuyabilir', async () => {
      await assertSucceeds(
        adminDb.collection('appointments').doc(appointmentId).get()
      );
    });

    test('Student kendi randevusunu oluşturabilir', async () => {
      await assertSucceeds(
        studentDb.collection('appointments').add({
          coachId: COACH_UID,
          studentId: STUDENT_UID,
          date: new Date(),
          status: 'scheduled',
        })
      );
    });

    test('Student başkası adına randevu oluşturamaz', async () => {
      await assertFails(
        studentDb.collection('appointments').add({
          coachId: COACH_UID,
          studentId: OTHER_STUDENT_UID, // Başka bir student
          date: new Date(),
          status: 'scheduled',
        })
      );
    });

    test('Coach randevu oluşturamaz', async () => {
      await assertFails(
        coachDb.collection('appointments').add({
          coachId: COACH_UID,
          studentId: STUDENT_UID,
          date: new Date(),
          status: 'scheduled',
        })
      );
    });

    test('Student kendi randevusunu güncelleyebilir', async () => {
      await assertSucceeds(
        studentDb.collection('appointments').doc(appointmentId).update({
          notes: 'Updated notes',
        })
      );
    });

    test('Coach kendi randevusunu güncelleyebilir', async () => {
      await assertSucceeds(
        coachDb.collection('appointments').doc(appointmentId).update({
          status: 'completed',
        })
      );
    });

    test('Başka student randevuyu güncelleyemez', async () => {
      const otherStudentDb = testEnv.authenticatedContext(OTHER_STUDENT_UID, {
        email: 'other-student@koachy.com',
      }).firestore();

      await assertFails(
        otherStudentDb.collection('appointments').doc(appointmentId).update({
          notes: 'Hacked notes',
        })
      );
    });

    test('Unauthenticated kullanıcı randevu okuyamaz', async () => {
      await assertFails(
        unauthenticatedDb.collection('appointments').doc(appointmentId).get()
      );
    });
  });
});
