/**
 * Merkezi tip tanımları — sayfalar ve servisler buradan import eder.
 */
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

// --- Auth (AuthContext) ---
export interface AuthUserRole {
  role: 'Student' | 'Coach' | 'Admin' | null;
  email: string | null;
  name?: string;
  selectedCoachId?: string | null;
  purchasedPackage?: string | null;
  /** true ise tek seferlik koç değişimi kullanıldı */
  coachChangeUsed?: boolean;
  /** Hesap açılışında true; ilk tanışma sohbeti kullanılınca false olur */
  introMeetingAvailable?: boolean;
}

/** useAuth state: oturum + rol özeti */
export interface AuthContextState {
  user: FirebaseAuthUser | null;
  userRole: AuthUserRole | null;
  loading: boolean;
}

export interface AuthContextType extends AuthContextState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'Student' | 'Coach', name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// --- Öğrenci dashboard / users koleksiyonu ---
export interface StudentDashboardProfile {
  name: string;
  phone: string;
  photoURL: string;
  targetExam: string;
  grade: string;
  selectedCoachId: string | null;
  purchasedPackage: string | null;
  coachChangeUsed: boolean;
}

// --- Koç listesi (coaches sayfası) ---
export interface CoachListItem {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  photoURL?: string;
}

// --- Profil formu (profile sayfası) ---
export interface ProfileFormData {
  name: string;
  phone: string;
  photoURL: string;
  title?: string;
  bio?: string;
  targetExam?: string;
  grade?: string;
}

// --- Roller ---
export type UserRole = 'Student' | 'Coach' | 'Admin';

// --- Eski / genel modeller (şema ile uyumlu) ---
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
  photoURL?: string;
  phoneNumber?: string;
}

export interface CoachProfile {
  id: string;
  userId: string;
  title?: string;
  rating: number;
  totalRatings: number;
  bio?: string;
  experience?: number;
  education?: string[];
  certifications?: string[];
  hourlyRate?: number;
  availability?: {
    days: string[];
    timeSlots: string[];
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  studentId: string;
  coachId: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  subject?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- Admin paneli ---
export type AdminDashboardTab = 'overview' | 'payments' | 'coaches' | 'users';

export interface PurchaseRequestRow {
  id: string;
  userId: string;
  studentName: string;
  packageId: string;
  requestedAt: Timestamp | null;
  status: 'pending' | 'approved';
}

export interface PendingCoachRow {
  id: string;
  name: string;
  email: string;
  title?: string;
  createdAt: Timestamp | null;
}

export interface AssignmentRow {
  studentId: string;
  studentName: string;
  selectedCoachId: string | null;
  coachName: string;
}

export interface CoachOption {
  id: string;
  name: string;
}

export interface AdminLogEntry {
  id: string;
  at: Date;
  line: string;
}

export interface AdminDashboardStats {
  coaches: number;
  students: number;
  pendingPayments: number;
  pendingCoachProfiles: number;
}

export interface AdminDashboardData {
  purchaseRequests: PurchaseRequestRow[];
  pendingCoaches: PendingCoachRow[];
  assignments: AssignmentRow[];
  coachOptions: CoachOption[];
  logs: AdminLogEntry[];
  stats: AdminDashboardStats;
  localCoachSelection: Record<string, string>;
}

// --- Sohbet ---
export type ConversationStatus = 'open' | 'closed_by_coach';

export interface Conversation {
  id: string;
  participants: string[];
  studentId: string;
  coachId: string;
  coachName: string;
  coachPhotoURL: string;
  studentName: string;
  studentPhotoURL?: string;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  /** Paket öncesi tek seferlik tanışma sohbeti */
  isIntroSession?: boolean;
  conversationStatus?: ConversationStatus;
  closedByCoachAt?: Timestamp | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
  read: boolean;
}
