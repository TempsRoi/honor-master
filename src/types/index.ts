import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balance: number; // User's current balance
  totalPaid: number; // User's total lifetime payment
}

export interface RankingItem {
  rank: number;
  user: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL'>;
  totalPaid: number;
}


export interface PaymentHistory {
  id: string;
  amount: number;
  timestamp: Date;
  type: 'charge' | 'payment';
}
