-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency_name TEXT NOT NULL,
  currency_symbol TEXT NOT NULL DEFAULT '🪙',
  exchange_rate DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  starting_balance DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table (users who join events)
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL UNIQUE REFERENCES public.participants(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  vendor_code TEXT NOT NULL UNIQUE,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('payment', 'transfer', 'reward', 'refund');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  from_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  to_wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type public.transaction_type NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  description TEXT,
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participant_badges junction table
CREATE TABLE public.participant_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_badges ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Organizers can view their own events"
ON public.events FOR SELECT
USING (auth.uid() = organizer_id);

CREATE POLICY "Anyone can view active events"
ON public.events FOR SELECT
USING (is_active = true);

CREATE POLICY "Organizers can create events"
ON public.events FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
ON public.events FOR DELETE
USING (auth.uid() = organizer_id);

-- Participants policies
CREATE POLICY "Organizers can view event participants"
ON public.participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = participants.event_id 
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Participants can view themselves"
ON public.participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Anyone can join an active event"
ON public.participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_id 
    AND events.is_active = true
  )
);

-- Wallets policies
CREATE POLICY "Organizers can view event wallets"
ON public.wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = wallets.event_id 
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Participants can view their own wallet"
ON public.wallets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.participants 
    WHERE participants.id = wallets.participant_id 
    AND participants.user_id = auth.uid()
  )
);

CREATE POLICY "System can create wallets"
ON public.wallets FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update wallets"
ON public.wallets FOR UPDATE
USING (true);

-- Vendors policies
CREATE POLICY "Organizers can manage vendors"
ON public.vendors FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = vendors.event_id 
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Vendors can view themselves"
ON public.vendors FOR SELECT
USING (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Organizers can view event transactions"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = transactions.event_id 
    AND events.organizer_id = auth.uid()
  )
);

CREATE POLICY "Participants can view their transactions"
ON public.transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wallets w
    JOIN public.participants p ON p.id = w.participant_id
    WHERE (w.id = transactions.from_wallet_id OR w.id = transactions.to_wallet_id)
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "System can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (true);

-- Badges policies
CREATE POLICY "Anyone can view event badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage badges"
ON public.badges FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = badges.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Participant badges policies
CREATE POLICY "Anyone can view earned badges"
ON public.participant_badges FOR SELECT
USING (true);

CREATE POLICY "System can award badges"
ON public.participant_badges FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_active ON public.events(is_active);
CREATE INDEX idx_participants_event ON public.participants(event_id);
CREATE INDEX idx_participants_user ON public.participants(user_id);
CREATE INDEX idx_wallets_event ON public.wallets(event_id);
CREATE INDEX idx_wallets_participant ON public.wallets(participant_id);
CREATE INDEX idx_transactions_event ON public.transactions(event_id);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);
CREATE INDEX idx_vendors_event ON public.vendors(event_id);
CREATE INDEX idx_badges_event ON public.badges(event_id);