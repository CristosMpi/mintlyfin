-- Enable real-time for wallets table
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;

-- Enable real-time for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;