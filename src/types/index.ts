export interface Event {
  id: string;
  name: string;
  currencyName: string;
  currencySymbol: string;
  exchangeRate: number;
  duration: number; // in hours
  startingBalance: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface Participant {
  id: string;
  name: string;
  balance: number;
  eventId: string;
  joinedAt: Date;
  badges: Badge[];
}

export interface Vendor {
  id: string;
  name: string;
  eventId: string;
  totalEarnings: number;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  type: 'payment' | 'transfer' | 'reward';
  timestamp: Date;
  description?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: Date;
}

export interface EventStats {
  totalParticipants: number;
  totalCirculating: number;
  totalVendorEarnings: number;
  remainingAllocation: number;
  timeRemaining: number; // in milliseconds
}
