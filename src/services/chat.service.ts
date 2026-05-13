/**
 * Sohbet / konuşma kimliği (istemci Firestore).
 */
export function getConversationId(uid1: string, uid2: string): string {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}
