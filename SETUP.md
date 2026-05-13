# Firestore Test Kurulum Kılavuzu

## Gereksinimler

Firestore güvenlik kurallarını test etmek için Firebase Emulator Suite gereklidir. Emulator Suite, Java gerektirir.

## Java Kurulumu

### Windows için:

1. **Java JDK İndirme:**
   - [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) veya
   - [OpenJDK](https://adoptium.net/) (önerilen - ücretsiz)

2. **Kurulum:**
   - İndirdiğiniz installer'ı çalıştırın
   - Kurulum sırasında "Add to PATH" seçeneğini işaretleyin

3. **Kurulumu Doğrulama:**
   ```bash
   java -version
   ```
   Bu komut Java versiyonunu göstermelidir.

### Alternatif: Chocolatey ile Kurulum (Windows)

Eğer Chocolatey yüklüyse:
```bash
choco install openjdk
```

## Testleri Çalıştırma

Java yüklendikten sonra:

### Yöntem 1: Otomatik (Önerilen)
```bash
npm run emulators:exec
```
Bu komut emulator'ı otomatik başlatır, testleri çalıştırır ve emulator'ı kapatır.

### Yöntem 2: Manuel
1. İlk terminalde emulator'ı başlatın:
```bash
npm run emulators:start
```

2. İkinci terminalde testleri çalıştırın:
```bash
npm run test:rules
```

## Sorun Giderme

### "Java is not recognized" hatası
- Java'nın PATH'e eklendiğinden emin olun
- Terminal'i yeniden başlatın
- `java -version` komutuyla doğrulayın

### Port çakışması
- `firebase.json` dosyasında port numarasını değiştirebilirsiniz
- Veya çakışan uygulamayı kapatın

### Emulator başlamıyor
- Java'nın doğru yüklendiğinden emin olun
- Firebase CLI'nin güncel olduğundan emin olun: `npm install -g firebase-tools`
