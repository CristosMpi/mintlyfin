import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type Participant = Database['public']['Tables']['participants']['Row'];
type Wallet = Database['public']['Tables']['wallets']['Row'];
type Vendor = Database['public']['Tables']['vendors']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];

// Generate a unique join code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + eventData.durationHours);

  const { data, error } = await supabase
    .from('events')
    .insert({
      organizer_id: user.id,
      name: eventData.name,
      currency_name: eventData.currencyName,
      currency_symbol: eventData.currencySymbol,
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

// Participants
export const joinEvent = async (eventId: string, participantName: string, userId?: string) => {
  const joinCode = generateCode();

  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({
      event_id: eventId,
      user_id: userId || null,
      name: participantName,
      join_code: joinCode,
    })
    .select()
    .single();

  if (participantError) throw participantError;

  // Get event starting balance
  const { data: event } = await supabase
    .from('events')
    .select('starting_balance')
    .eq('id', eventId)
    .single();

  // Create wallet with starting balance
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .insert({
      participant_id: participant.id,
      event_id: eventId,
      balance: event?.starting_balance || 0,
    })
    .select()
    .single();

  if (walletError) throw walletError;

  return { participant, wallet, joinCode };
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

// Transactions
export const processPayment = async (
  walletId: string,
  vendorId: string,
  amount: number,
  description?: string
) => {
  // Get wallet and event info
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance, event_id')
    .eq('id', walletId)
    .single();

  if (!wallet) throw new Error('Wallet not found');
  if (Number(wallet.balance) < amount) throw new Error('Insufficient balance');

  // Deduct from wallet
  const { error: walletError } = await supabase
    .from('wallets')
    .update({ balance: Number(wallet.balance) - amount })
    .eq('id', walletId);

  if (walletError) throw walletError;

  // Add to vendor earnings
  const { data: vendor } = await supabase
    .from('vendors')
    .select('total_earnings')
    .eq('id', vendorId)
    .single();

  await supabase
    .from('vendors')
    .update({ total_earnings: Number(vendor?.total_earnings || 0) + amount })
    .eq('id', vendorId);

  // Record transaction
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      event_id: wallet.event_id,
      from_wallet_id: walletId,
      vendor_id: vendorId,
      amount,
      type: 'payment',
      description,
    })
    .select()
    .single();

  if (txError) throw txError;
  return transaction;
};

export const transferFunds = async (
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description?: string
) => {
  // Get from wallet
  const { data: fromWallet } = await supabase
    .from('wallets')
    .select('balance, event_id')
    .eq('id', fromWalletId)
    .single();

  if (!fromWallet) throw new Error('From wallet not found');
  if (Number(fromWallet.balance) < amount) throw new Error('Insufficient balance');

  // Get to wallet
  const { data: toWallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', toWalletId)
    .single();

  if (!toWallet) throw new Error('To wallet not found');

  // Update balances
  await supabase
    .from('wallets')
    .update({ balance: Number(fromWallet.balance) - amount })
    .eq('id', fromWalletId);

  await supabase
    .from('wallets')
    .update({ balance: Number(toWallet.balance) + amount })
    .eq('id', toWalletId);

  // Record transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      event_id: fromWallet.event_id,
      from_wallet_id: fromWalletId,
      to_wallet_id: toWalletId,
      amount,
      type: 'transfer',
      description,
    })
    .select()
    .single();

  if (error) throw error;
  return transaction;
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

// Send reward to participant
export const sendReward = async (
  eventId: string,
  participantId: string,
  amount: number,
  description?: string
) => {
  // Get wallet for participant
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('participant_id', participantId)
    .eq('event_id', eventId)
    .single();

  if (walletError || !wallet) throw new Error('Wallet not found');

  // Update wallet balance
  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: Number(wallet.balance) + amount })
    .eq('id', wallet.id);

  if (updateError) throw updateError;

  // Record transaction
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      event_id: eventId,
      to_wallet_id: wallet.id,
      amount,
      type: 'reward',
      description: description || 'Reward from organizer',
    })
    .select()
    .single();

  if (txError) throw txError;
  return transaction;
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
