export type Member = string;

export enum SplitMethod {
  EVENLY = 'EVENLY',
  MANUALLY = 'MANUALLY'
}

export interface Expense {
  id: string;
  payer: Member;
  payers?: { [member: string]: number };
  participants: Member[];
  amount: number;
  itemName: string;
  splitMethod: SplitMethod;
  manualSplits?: { [member: string]: number };
  createdAt: number;
  createdBy: string;
}

export interface Transaction {
  from: Member;
  to: Member;
  amount: number;
}

export interface SettledBill {
  id: string;
  date: string;
  expenses: Expense[];
  transactions: Transaction[];
  mainCreditor?: Member;
  settledBy?: string;
  totalAmount: number;
}

export interface TripPlan {
  id: string;
  title: string;
  note: string;
  time: string;
  votes?: { [uid: string]: boolean };
  createdBy: string;
  creatorUid: string;
}

export enum Screen {
  HOME,
  ADD_EXPENSE,
  SETTLE_UP,
  HISTORY,
  HISTORY_DETAIL,
  EXPENSES_LIST
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  bankId?: string;
  accountNumber?: string;
  bankName?: string;
  rooms?: { [roomId: string]: boolean };
}

export interface RoomDetails {
  metadata: {
    name: string;
    ownerId: string;
    createdAt: number;
  };
  members: {
    [uid: string]: {
      displayName: string;
      photoURL: string;
      email: string;
      joinedAt: number;
    }
  };
  customMembers: string[];
  nicknames?: {
    [uidOrName: string]: string;
  };
  expenses?: { [id: string]: Expense };
  settledBills?: { [id: string]: SettledBill };
  plans?: { [id: string]: TripPlan };
  requests?: {
    [uid: string]: {
      displayName: string;
      email: string;
      photoURL: string;
      requestedAt: number;
    }
  };
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  text: string;
  type: 'user' | 'system' | 'settlement';
  timestamp: number;
  payload?: any;
  isDeleted?: boolean;
  isEdited?: boolean;
  lastEditedAt?: number;
}
