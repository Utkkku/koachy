# Admin koç API kurulumu (Firebase hizmet hesabı)

Koç **ekleme / silme** işlemleri sunucuda çalışır. Bunun için bir kez **hizmet hesabı anahtarı** tanımlaman gerekir.

## 1. Firebase’den JSON anahtarı indir

1. [Firebase Console](https://console.firebase.google.com) → projeni seç.
2. Sol altta **dişli (⚙) → Proje ayarları**.
3. **Hizmet hesapları** sekmesi.
4. **Yeni özel anahtar oluştur** → **Anahtar oluştur** → `.json` dosyası inecek.

Bu dosyayı güvenli bir yerde sakla; **paylaşma**, **Git’e koyma**.

## 2. Projeye ortam değişkeni ekle

Proje kökünde `.env.local` dosyası var (yoksa oluştur). İçinde zaten `NEXT_PUBLIC_FIREBASE_*` satırların olmalı.

### Yöntem A — Base64 (Windows’ta en kolay)

PowerShell’i aç, indirdiğin JSON’un **tam yolunu** yaz:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\KULLANICI\Downloads\proje-adı-firebase-adminsdk-xxxxx.json"))
```

Çıkan **uzun metni** kopyala. `.env.local` içine **tek satır** ekle:

```env
FIREBASE_SERVICE_ACCOUNT_BASE64=buraya_yapıştırılan_base64_metni
```

- Satırın etrafına tırnak koyma.
- Sonunda boşluk/satır sonu karışıklığı olmasın.

### Yöntem B — Ham JSON (tek satır)

JSON dosyasını bir “minify” aracıyla tek satıra indir veya elle satır sonlarını kaldır. `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...", ... }
```

Windows’ta içerideki `"` karakterleri sorun çıkarırsa **Yöntem A** kullan.

## 3. Geliştirme sunucusunu yeniden başlat

```bash
npm run dev
```

Ortam değişkenleri sadece process başlarken okunur; `.env.local` değişince mutlaka yeniden başlat.

## 4. Doğrula

1. **Admin** hesabıyla giriş yap (`users/{uid}` içinde `role: "Admin"`).
2. `/admin/coaches` → **Yeni Koç Ekle** → formu doldur → kaydet.
3. Hata alırsan:
   - **503 / yapılandırma eksik** → `FIREBASE_SERVICE_ACCOUNT_BASE64` veya `FIREBASE_SERVICE_ACCOUNT_JSON` tanımlı mı, sunucu yeniden başladı mı kontrol et.
   - **Geçersiz JSON** → Base64’ü yeniden üret; kopyalarken satır kırılması olmasın.

## 5. Canlı ortam (Vercel vb.)

Hosting panelinde **Environment Variables** bölümüne aynı isimle ekle:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` = yerelde kullandığın Base64 string (veya güvenli şekilde yeniden üret).

Deploy sonrası yeniden build / redeploy gerekir.

## Güvenlik özeti

| Yapılması gereken | Yapılmaması gereken |
|-------------------|---------------------|
| `.env.local` ve Vercel secret’larında tut | Repoya commit etme |
| Sadece güvendiğin kişilere admin rolü ver | JSON’u e-posta / chat ile gönderme |

Firebase’de bu hizmet hesabı için varsayılan roller genelde Authentication + Firestore için yeterlidir; ek kısıtlama ileride IAM ile yapılabilir.
