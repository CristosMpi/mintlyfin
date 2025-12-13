import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { z } from 'zod';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type Participant = Database['public']['Tables']['participants']['Row'];
type Wallet = Database['public']['Tables']['wallets']['Row'];
type Vendor = Database['public']['Tables']['vendors']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];

// Input validation schemas
const nameSchema = z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less');
const eventNameSchema = z.string().trim().min(3, 'Event name must be at least 3 characters').max(100, 'Event name must be 100 characters or less');
const currencyNameSchema = z.string().trim().min(2, 'Currency name must be at least 2 characters').max(30, 'Currency name must be 30 characters or less');
const amountSchema = z.number().positive('Amount must be positive').max(1000000, 'Amount too large');

// Generate a unique join code (16 chars for security)
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 16; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
};

// Events
export const createEvent = async (eventData: {
  name: string;
  currencyName: string;
  currencySymbol: string;
  exchangeRate: number;
  startingBalance: number;
  durationHours: number;
}) => {
  // Validate inputs
  const nameResult = eventNameSchema.safeParse(eventData.name);
  if (!nameResult.success) throw new Error(nameResult.error.issues[0].message);
  
  const currencyResult = currencyNameSchema.safeParse(eventData.currencyName);
  if (!currencyResult.success) throw new Error(currencyResult.error.issues[0].message);
  
  if (eventData.exchangeRate <= 0 || eventData.exchangeRate > 10000) {
    throw new Error('Exchange rate must be between 0 and 10000');
  }
  if (eventData.startingBalance < 0 || eventData.startingBalance > 1000000) {
    throw new Error('Starting balance must be between 0 and 1000000');
  }
  if (eventData.durationHours < 1 || eventData.durationHours > 168) {
    throw new Error('Duration must be between 1 and 168 hours');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + eventData.durationHours);

  const { data, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      name: nameResult.data,
      currency_name: currencyResult.data,
      currency_symbol: eventData.currencySymbol.substring(0, 5),
      exchange_rate: eventData.exchangeRate,
      starting_balance: eventData.startingBalance,
      duration_hours: eventData.durationHours,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Create default badges for the event
  await createDefaultBadges(data.id);

  return data;
};

export const getMyEvents = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getEvent = async (eventId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getEventStats = async (eventId: string) => {
  const { data: participants } = await supabase
    .from('participants')
    .select('id')
    .eq('event_id', eventId);

  const { data: wallets } = await supabase
    .from('wallets')
    .select('balance')
    .eq('event_id', eventId);

  const { data: vendors } = await supabase
    .from('vendors')
    .select('total_earnings')
    .eq('event_id', eventId);

  const totalParticipants = participants?.length || 0;
  const totalCirculating = wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;
  const totalVendorEarnings = vendors?.reduce((sum, v) => sum + Number(v.total_earnings), 0) || 0;

  return {
    totalParticipants,
    totalCirculating,
    totalVendorEarnings,
  };
};

// Type for secure RPC response
interface JoinEventResponse {
  participant_id: string;
  wallet_id: string;
  join_code: string;
  balance: number;
}

// Participants - Uses secure RPC function
export const joinEvent = async (eventId: string, participantName: string, userId?: string) => {
  // Validate input
  const nameResult = nameSchema.safeParse(participantName);
  if (!nameResult.success) throw new Error(nameResult.error.issues[0].message);

  const joinCode = generateCode();

  // Use secure RPC function for atomic participant + wallet creation
  const { data, error } = await supabase.rpc('join_event_secure', {
    p_event_id: eventId,
    p_participant_name: nameResult.data,
    p_join_code: joinCode,
  });

  if (error) throw error;

  const response = data as unknown as JoinEventResponse;

  return { 
    participant: { id: response.participant_id, name: nameResult.data }, 
    wallet: { id: response.wallet_id, balance: response.balance }, 
    joinCode: response.join_code 
  };
};

export const getEventParticipants = async (eventId: string) => {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      wallets (balance)
    `)
    .eq('event_id', eventId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getParticipantByJoinCode = async (joinCode: string) => {
  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      wallets (id, balance)
    `)
    .eq('join_code', joinCode)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Vendors
export const createVendor = async (eventId: string, vendorName: string, userId?: string) => {
  const vendorCode = generateCode();

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      event_id: eventId,
      user_id: userId || null,
      name: vendorName,
      vendor_code: vendorCode,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, vendorCode };
};

export const getEventVendors = async (eventId: string) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('event_id', eventId)
    .order('total_earnings', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateVendor = async (vendorId: string, updates: { name?: string }) => {
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', vendorId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteVendor = async (vendorId: string) => {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', vendorId);

  if (error) throw error;
};

export const getVendorByCode = async (vendorCode: string) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('vendor_code', vendorCode)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Transactions - Uses secure RPC function
export const processPayment = async (
  walletId: string,
  vendorId: string,
  amount: number,
  description?: string
) => {
  // Validate amount
  const amountResult = amountSchema.safeParse(amount);
  if (!amountResult.success) throw new Error(amountResult.error.issues[0].message);

  // Validate description length if provided
  if (description && description.length > 200) {
    throw new Error('Description must be 200 characters or less');
  }

  // Use secure RPC function
  const { data: txId, error } = await supabase.rpc('process_payment_secure', {
    p_wallet_id: walletId,
    p_vendor_id: vendorId,
    p_amount: amountResult.data,
    p_description: description?.substring(0, 200) || null,
  });

  if (error) throw error;
  return { id: txId };
};

// Transfer funds - Uses secure RPC function
export const transferFunds = async (
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description?: string
) => {
  // Validate amount
  const amountResult = amountSchema.safeParse(amount);
  if (!amountResult.success) throw new Error(amountResult.error.issues[0].message);

  // Validate description length if provided
  if (description && description.length > 200) {
    throw new Error('Description must be 200 characters or less');
  }

  // Use secure RPC function
  const { data: txId, error } = await supabase.rpc('transfer_funds_secure', {
    p_from_wallet_id: fromWalletId,
    p_to_wallet_id: toWalletId,
    p_amount: amountResult.data,
    p_description: description?.substring(0, 200) || null,
  });

  if (error) throw error;
  return { id: txId };
};

export const getWalletTransactions = async (walletId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      vendor:vendors(name)
    `)
    .or(`from_wallet_id.eq.${walletId},to_wallet_id.eq.${walletId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Badges
const createDefaultBadges = async (eventId: string) => {
  const defaultBadges = [
    { name: 'Early Bird', icon: 'EB', description: 'Joined in the first hour', criteria: 'first_hour' },
    { name: 'Big Spender', icon: 'BS', description: 'Spent over 50 coins', criteria: 'spend_50' },
    { name: 'Supporter', icon: 'SP', description: 'Made 5+ transactions', criteria: 'transactions_5' },
    { name: 'VIP', icon: 'VP', description: 'Top 10% spender', criteria: 'top_10_percent' },
  ];

  await supabase
    .from('badges')
    .insert(defaultBadges.map(badge => ({ ...badge, event_id: eventId })));
};

export const getEventBadges = async (eventId: string) => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('event_id', eventId);

  if (error) throw error;
  return data;
};

export const getParticipantBadges = async (participantId: string) => {
  const { data, error } = await supabase
    .from('participant_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('participant_id', participantId);

  if (error) throw error;
  return data;
};

// Send reward to participant - Uses secure RPC function (organizers only)
export const sendReward = async (
  eventId: string,
  participantId: string,
  amount: number,
  description?: string
) => {
  // Validate amount
  const amountResult = amountSchema.safeParse(amount);
  if (!amountResult.success) throw new Error(amountResult.error.issues[0].message);

  // Validate description length if provided
  if (description && description.length > 200) {
    throw new Error('Description must be 200 characters or less');
  }

  // Use secure RPC function
  const { data: txId, error } = await supabase.rpc('send_reward_secure', {
    p_event_id: eventId,
    p_participant_id: participantId,
    p_amount: amountResult.data,
    p_description: description?.substring(0, 200) || 'Reward from organizer',
  });

  if (error) throw error;
  return { id: txId };
};

// Update event settings
export const updateEvent = async (
  eventId: string,
  updates: {
    name?: string;
    currency_name?: string;
    currency_symbol?: string;
    exchange_rate?: number;
    starting_balance?: number;
    is_active?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete event
export const deleteEvent = async (eventId: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};

// Get event transactions for export
export const getEventTransactions = async (eventId: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      from_wallet:wallets!transactions_from_wallet_id_fkey(participant:participants(name)),
      to_wallet:wallets!transactions_to_wallet_id_fkey(participant:participants(name)),
      vendor:vendors(name)
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
