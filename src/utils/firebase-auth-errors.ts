/**
 * Firebase Auth hataları — unknown güvenli çözümleme (any kullanılmaz).
 */

function errorCode(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const c = (err as { code?: unknown }).code;
    return typeof c === 'string' ? c : '';
  }
  return '';
}

function errorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    return typeof m === 'string' ? m : '';
  }
  return '';
}

const COMMON: Record<string, string> = {
  'auth/invalid-email': 'Geçersiz e-posta adresi girdiniz.',
  'auth/too-many-requests': 'Çok fazla deneme yaptınız. Lütfen biraz bekleyip tekrar deneyin.',
  'auth/network-request-failed': 'İnternet bağlantınızı kontrol edin.',
  'auth/popup-closed-by-user': 'Google giriş penceresi kapatıldı.',
  'auth/popup-blocked': 'Tarayıcınız pop-up penceresini engelledi. Lütfen izin verin.',
  'auth/account-exists-with-different-credential':
    'Bu e-posta adresi farklı bir giriş yöntemiyle kayıtlı.',
  'auth/cancelled-popup-request': 'Giriş işlemi iptal edildi.',
};

const LOGIN_CODES: Record<string, string> = {
  ...COMMON,
  'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
  'auth/user-not-found': 'Bu e-posta adresine ait bir hesap bulunamadı.',
  'auth/wrong-password': 'Şifre hatalı. Lütfen tekrar deneyin.',
  'auth/invalid-credential': 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.',
};

const REGISTER_CODES: Record<string, string> = {
  ...COMMON,
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor. Giriş yapmayı deneyin.',
  'auth/weak-password': 'Şifre çok zayıf. En az 6 karakter olmalıdır.',
  'auth/operation-not-allowed': 'E-posta/şifre ile kayıt şu an devre dışı.',
  'auth/cancelled-popup-request': 'Kayıt işlemi iptal edildi.',
};

const LOGIN_DEFAULT = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
const REGISTER_DEFAULT = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
const RESET_DEFAULT = 'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.';

export function getFirebaseLoginErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && LOGIN_CODES[code]) return LOGIN_CODES[code];
  const msg = errorMessage(error);
  return msg || LOGIN_DEFAULT;
}

export function getFirebaseRegisterErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && REGISTER_CODES[code]) return REGISTER_CODES[code];
  const msg = errorMessage(error);
  return msg || REGISTER_DEFAULT;
}

const RESET_CODES: Record<string, string> = {
  ...COMMON,
  // Kullanıcı var/yok bilgisini ifşa etmemek için nötr mesaj döndürülür.
  'auth/user-not-found': 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.',
  'auth/unauthorized-continue-uri':
    'Şifre sıfırlama yönlendirme adresi yetkili değil. Firebase Console → Authentication → Settings → Authorized domains içine bu alan adını ekleyin ve NEXT_PUBLIC_FIREBASE_PASSWORD_RESET_CONTINUE_URL değerini kontrol edin.',
  'auth/invalid-continue-uri': 'Şifre sıfırlama yönlendirme adresi geçersiz. Ortam değişkenindeki URL’yi kontrol edin.',
};

export function getFirebaseResetPasswordErrorMessage(error: unknown): string {
  const code = errorCode(error);
  if (code && RESET_CODES[code]) return RESET_CODES[code];
  const msg = errorMessage(error);
  return msg || RESET_DEFAULT;
}
