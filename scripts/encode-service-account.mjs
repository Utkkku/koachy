/**
 * Kullanım: npm run encode:service-account -- path/to/serviceAccount.json
 * Çıktıyı .env.local içine FIREBASE_SERVICE_ACCOUNT_BASE64=... olarak yapıştır.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { argv, cwd, exit } from 'node:process';

const filePath = argv[2];
if (!filePath) {
  console.error('Kullanım: npm run encode:service-account -- ./indirilen-firebase-adminsdk.json');
  exit(1);
}
const resolved = resolve(cwd(), filePath);
if (!existsSync(resolved)) {
  console.error('Dosya bulunamadı:', resolved);
  exit(1);
}
const b64 = readFileSync(resolved).toString('base64');
console.log('\nAşağıdaki satırı .env.local dosyana ekle (tırnak kullanma):\n');
console.log('FIREBASE_SERVICE_ACCOUNT_BASE64=' + b64);
console.log('\n');
