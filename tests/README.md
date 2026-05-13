# Firestore Security Rules Test Kılavuzu

Bu klasör, noktAtışı projesi için Firestore güvenlik kurallarını test eden unit testleri içerir.

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

## Testleri Çalıştırma

### Yöntem 1: Emulator'ı manuel başlatma

1. İlk terminalde emulator'ı başlatın:
```bash
npm run emulators:start
```

2. İkinci terminalde testleri çalıştırın:
```bash
npm run test:rules
```

### Yöntem 2: Tek komutla (Önerilen)

Emulator'ı otomatik başlatıp testleri çalıştırır:
```bash
npm run emulators:exec
```

## Test Senaryoları

Test dosyası (`firestore.rules.test.js`) şu senaryoları kapsar:

### Users Collection
- ✅ Kullanıcı kendi profilini okuyabilir
- ✅ Kullanıcı başkasının profilini okuyamaz
- ✅ Admin tüm kullanıcıları okuyabilir
- ✅ Kullanıcı kendi profilini güncelleyebilir (role hariç)
- ✅ Kullanıcı kendi rolünü değiştiremez
- ✅ Sadece admin kullanıcı oluşturabilir

### Coaches Collection
- ✅ Herkes coach profillerini okuyabilir (public)
- ✅ Coach kendi profilini güncelleyebilir
- ✅ Student coach profilini güncelleyemez
- ✅ Coach kendi profilini oluşturabilir

### Appointments Collection
- ✅ Student kendi randevusunu okuyabilir
- ✅ Coach kendi randevusunu okuyabilir
- ✅ Başka student/coach randevuyu okuyamaz
- ✅ Admin tüm randevuları okuyabilir
- ✅ Student kendi randevusunu oluşturabilir
- ✅ Student başkası adına randevu oluşturamaz
- ✅ Coach randevu oluşturamaz
- ✅ İlgili taraflar randevuyu güncelleyebilir

## Sorun Giderme

### Port çakışması
Eğer 8080 portu kullanılıyorsa, `firebase.json` dosyasında port numarasını değiştirebilirsiniz.

### Test başarısız oluyor
- Emulator'ın çalıştığından emin olun
- `firestore.rules` dosyasının doğru konumda olduğunu kontrol edin
- Test dosyasındaki kullanıcı ID'lerinin doğru olduğundan emin olun
