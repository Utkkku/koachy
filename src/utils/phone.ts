/** TR cep için WhatsApp web ve tel: bağlantıları */
export function formatWhatsAppLink(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '90' + digits.substring(1);
  }
  if (!digits.startsWith('90')) {
    digits = '90' + digits;
  }
  return `https://wa.me/${digits}`;
}

export function formatTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '#';
  let n = digits;
  if (n.startsWith('0')) n = '90' + n.slice(1);
  if (!n.startsWith('90')) n = '90' + n;
  return `tel:+${n}`;
}
