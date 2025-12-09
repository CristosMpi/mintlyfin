import { Event, Participant, Vendor, Transaction, Badge, EventStats } from '@/types';

// Demo event data
export const demoEvent: Event = {
  id: 'demo-event-001',
  name: 'Spring Festival 2025',
  currencyName: 'FestaCoin',
  currencySymbol: '🎪',
  exchangeRate: 1.25,
  duration: 48,
  startingBalance: 100,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
  isActive: true,
};

export const demoBadges: Badge[] = [
  { id: 'b1', name: 'Early Bird', icon: '🐦', description: 'Joined in the first hour' },
  { id: 'b2', name: 'Big Spender', icon: '💸', description: 'Spent over 50 coins' },
  { id: 'b3', name: 'Supporter', icon: '❤️', description: 'Made 5+ transactions' },
  { id: 'b4', name: 'VIP', icon: '⭐', description: 'Top 10% spender' },
];

export const demoParticipant: Participant = {
  id: 'user-001',
  name: 'Alex Johnson',
  balance: 75.50,
  eventId: 'demo-event-001',
  joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  badges: [demoBadges[0], demoBadges[2]],
};

export const demoVendors: Vendor[] = [
  { id: 'v1', name: 'Food Court', eventId: 'demo-event-001', totalEarnings: 1250 },
  { id: 'v2', name: 'Games Zone', eventId: 'demo-event-001', totalEarnings: 890 },
  { id: 'v3', name: 'Merchandise', eventId: 'demo-event-001', totalEarnings: 456 },
];

export const demoTransactions: Transaction[] = [
  { id: 't1', fromId: 'user-001', toId: 'v1', amount: 12.50, type: 'payment', timestamp: new Date(Date.now() - 30 * 60 * 1000), description: 'Food Court - Burger Combo' },
  { id: 't2', fromId: 'user-001', toId: 'v2', amount: 5.00, type: 'payment', timestamp: new Date(Date.now() - 60 * 60 * 1000), description: 'Games Zone - Ring Toss' },
  { id: 't3', fromId: 'system', toId: 'user-001', amount: 10.00, type: 'reward', timestamp: new Date(Date.now() - 90 * 60 * 1000), description: 'Early Bird Bonus!' },
  { id: 't4', fromId: 'user-001', toId: 'user-002', amount: 7.00, type: 'transfer', timestamp: new Date(Date.now() - 120 * 60 * 1000), description: 'Split bill with Maya' },
];

export const demoEventStats: EventStats = {
  totalParticipants: 247,
  totalCirculating: 18750,
  totalVendorEarnings: 8940,
  remainingAllocation: 9810,
  timeRemaining: 42 * 60 * 60 * 1000,
};

export const currencySymbols = ['🪙', '💎', '⭐', '🎪', '🎯', '🚀', '🌟', '💰', '🎫', '🏆', '🔥', '✨'];
