-- ==============================================
-- SECURITY FIX: Replace overly permissive RLS policies
-- with SECURITY DEFINER functions for financial operations
-- ==============================================

-- 1. Create SECURITY DEFINER function for joining events with wallet creation
CREATE OR REPLACE FUNCTION public.join_event_secure(
  p_event_id uuid,
  p_participant_name text,
  p_join_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event events%ROWTYPE;
  v_participant participants%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_user_id uuid;
BEGIN
  -- Get current user (can be null for anonymous)
  v_user_id := auth.uid();
  
  -- Validate event exists and is active
  SELECT * INTO v_event FROM events WHERE id = p_event_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or not active';
  END IF;
  
  -- Validate participant name
  IF length(trim(p_participant_name)) < 1 OR length(trim(p_participant_name)) > 50 THEN
    RAISE EXCEPTION 'Participant name must be between 1 and 50 characters';
  END IF;
  
  -- Create participant
  INSERT INTO participants (event_id, user_id, name, join_code)
  VALUES (p_event_id, v_user_id, trim(p_participant_name), p_join_code)
  RETURNING * INTO v_participant;
  
  -- Create wallet with event's starting balance
  INSERT INTO wallets (participant_id, event_id, balance)
  VALUES (v_participant.id, p_event_id, v_event.starting_balance)
  RETURNING * INTO v_wallet;
  
  RETURN jsonb_build_object(
    'participant_id', v_participant.id,
    'wallet_id', v_wallet.id,
    'join_code', p_join_code,
    'balance', v_wallet.balance
  );
END;
$$;

-- 2. Create SECURITY DEFINER function for processing payments
CREATE OR REPLACE FUNCTION public.process_payment_secure(
  p_wallet_id uuid,
  p_vendor_id uuid,
  p_amount numeric,
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet wallets%ROWTYPE;
  v_vendor vendors%ROWTYPE;
  v_participant participants%ROWTYPE;
  v_tx_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get wallet and verify ownership
  SELECT w.* INTO v_wallet FROM wallets w
  JOIN participants p ON p.id = w.participant_id
  WHERE w.id = p_wallet_id
  AND (p.user_id = auth.uid() OR p.join_code IS NOT NULL);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found or access denied';
  END IF;
  
  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Validate vendor exists and belongs to same event
  SELECT * INTO v_vendor FROM vendors WHERE id = p_vendor_id AND event_id = v_wallet.event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vendor not found';
  END IF;
  
  -- Process payment atomically
  UPDATE wallets SET balance = balance - p_amount, updated_at = now() WHERE id = p_wallet_id;
  UPDATE vendors SET total_earnings = total_earnings + p_amount, updated_at = now() WHERE id = p_vendor_id;
  
  INSERT INTO transactions (event_id, from_wallet_id, vendor_id, amount, type, description)
  VALUES (v_wallet.event_id, p_wallet_id, p_vendor_id, p_amount, 'payment', p_description)
  RETURNING id INTO v_tx_id;
  
  RETURN v_tx_id;
END;
$$;

-- 3. Create SECURITY DEFINER function for transfers between wallets
CREATE OR REPLACE FUNCTION public.transfer_funds_secure(
  p_from_wallet_id uuid,
  p_to_wallet_id uuid,
  p_amount numeric,
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_wallet wallets%ROWTYPE;
  v_to_wallet wallets%ROWTYPE;
  v_tx_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get from wallet and verify ownership
  SELECT w.* INTO v_from_wallet FROM wallets w
  JOIN participants p ON p.id = w.participant_id
  WHERE w.id = p_from_wallet_id
  AND (p.user_id = auth.uid() OR p.join_code IS NOT NULL);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'From wallet not found or access denied';
  END IF;
  
  IF v_from_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Get to wallet (must be in same event)
  SELECT * INTO v_to_wallet FROM wallets WHERE id = p_to_wallet_id AND event_id = v_from_wallet.event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'To wallet not found';
  END IF;
  
  -- Prevent self-transfer
  IF p_from_wallet_id = p_to_wallet_id THEN
    RAISE EXCEPTION 'Cannot transfer to same wallet';
  END IF;
  
  -- Process transfer atomically
  UPDATE wallets SET balance = balance - p_amount, updated_at = now() WHERE id = p_from_wallet_id;
  UPDATE wallets SET balance = balance + p_amount, updated_at = now() WHERE id = p_to_wallet_id;
  
  INSERT INTO transactions (event_id, from_wallet_id, to_wallet_id, amount, type, description)
  VALUES (v_from_wallet.event_id, p_from_wallet_id, p_to_wallet_id, p_amount, 'transfer', p_description)
  RETURNING id INTO v_tx_id;
  
  RETURN v_tx_id;
END;
$$;

-- 4. Create SECURITY DEFINER function for sending rewards (organizers only)
CREATE OR REPLACE FUNCTION public.send_reward_secure(
  p_event_id uuid,
  p_participant_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Reward from organizer'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event events%ROWTYPE;
  v_wallet wallets%ROWTYPE;
  v_tx_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Verify organizer owns this event
  SELECT * INTO v_event FROM events WHERE id = p_event_id AND organizer_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found or access denied';
  END IF;
  
  -- Get participant's wallet
  SELECT * INTO v_wallet FROM wallets WHERE participant_id = p_participant_id AND event_id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  -- Add reward
  UPDATE wallets SET balance = balance + p_amount, updated_at = now() WHERE id = v_wallet.id;
  
  INSERT INTO transactions (event_id, to_wallet_id, amount, type, description)
  VALUES (p_event_id, v_wallet.id, p_amount, 'reward', p_description)
  RETURNING id INTO v_tx_id;
  
  RETURN v_tx_id;
END;
$$;

-- 5. Drop overly permissive policies
DROP POLICY IF EXISTS "System can create wallets" ON wallets;
DROP POLICY IF EXISTS "System can update wallets" ON wallets;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can join an active event" ON participants;
DROP POLICY IF EXISTS "System can award badges" ON participant_badges;

-- 6. Create restricted wallet policies (SELECT only for authenticated users)
CREATE POLICY "Wallet owners can view via participant link"
ON wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM participants p
    WHERE p.id = wallets.participant_id
    AND (p.user_id = auth.uid() OR p.join_code IS NOT NULL)
  )
);

-- 7. Create restricted participant policies (require authentication)
CREATE POLICY "Authenticated users can join active events via RPC"
ON participants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM events WHERE events.id = participants.event_id AND events.is_active = true)
  AND auth.uid() IS NOT NULL
);

-- 8. Create restricted transaction policy (view only, no direct inserts)
-- Transactions are created only through SECURITY DEFINER functions

-- 9. Create restricted badge policy (organizers only can award)
CREATE POLICY "Organizers can award badges"
ON participant_badges FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM participants p
    JOIN events e ON e.id = p.event_id
    WHERE p.id = participant_badges.participant_id
    AND e.organizer_id = auth.uid()
  )
);

-- Grant execute permissions on functions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.join_event_secure TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.process_payment_secure TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.transfer_funds_secure TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.send_reward_secure TO authenticated;