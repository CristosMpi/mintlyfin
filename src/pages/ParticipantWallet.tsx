import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  QrCode, 
  History, 
  Trophy,
  ArrowUpRight,
  ArrowDownLeft,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { getEvent } from '@/lib/eventService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ParticipantWallet = () => {
  const { eventId, joinCode } = useParams<{ eventId: string; joinCode: string }>();
  const [event, setEvent] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'badges'>('history');

  useEffect(() => {
    const loadData = async () => {
      if (!eventId || !joinCode) return;

      try {
        // Load event
        const eventData = await getEvent(eventId);
        setEvent(eventData);

        // Load participant by join code
        const { data: participantData } = await supabase
          .from('participants')
          .select('*')
          .eq('join_code', joinCode)
          .maybeSingle();

        if (!participantData) {
          toast.error('Participant not found');
          return;
        }
        setParticipant(participantData);

        // Load wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('participant_id', participantData.id)
          .maybeSingle();

        setWallet(walletData);

        // Load transactions
        if (walletData) {
          const { data: txData } = await supabase
            .from('transactions')
            .select('*, vendor:vendors(name)')
            .or(`from_wallet_id.eq.${walletData.id},to_wallet_id.eq.${walletData.id}`)
            .order('created_at', { ascending: false });

          setTransactions(txData || []);
        }

        // Load badges
        const { data: badgeData } = await supabase
          .from('participant_badges')
          .select('*, badge:badges(*)')
          .eq('participant_id', participantData.id);

        setBadges(badgeData || []);
      } catch (error) {
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, joinCode]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'reward':
        return <Gift className="w-4 h-4" />;
      default:
        return <ArrowDownLeft className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-destructive';
      case 'reward':
        return 'text-green-500';
      default:
        return 'text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <div className="w-6 h-6 rounded-md bg-primary" />
          </div>
          <p className="text-muted-foreground mt-4">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!event || !participant || !wallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <span className="text-5xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold mb-2">Wallet Not Found</h1>
          <p className="text-muted-foreground mb-6">Invalid join code or event.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background px-4 pt-8 pb-16">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="glass" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{event.name}</h1>
              <p className="text-muted-foreground text-sm">{participant.name}</p>
            </div>
          </div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-elevated p-6 text-center"
          >
            <p className="text-muted-foreground mb-2">Your Balance</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl">{event.currency_symbol}</span>
              <span className="text-5xl font-bold">{Number(wallet.balance).toFixed(2)}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              ≈ €{(Number(wallet.balance) * Number(event.exchange_rate)).toFixed(2)}
            </p>
            <p className="text-sm font-medium mt-4 text-primary">
              {event.currency_name}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button variant="gradient" className="h-auto py-4 flex-col gap-2">
            <QrCode className="w-6 h-6" />
            <span className="text-sm">Pay</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Send className="w-6 h-6" />
            <span className="text-sm">Send</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <QrCode className="w-6 h-6" />
            <span className="text-sm">Receive</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'badges'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Badges
          </button>
        </div>

        {/* Content */}
        {activeTab === 'history' ? (
          <div className="space-y-3 pb-8">
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No transactions yet</p>
              </Card>
            ) : (
              transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description || tx.vendor?.name || 'Transaction'}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(tx.created_at)}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'reward' ? '+' : tx.from_wallet_id === wallet.id ? '-' : '+'}{event.currency_symbol} {Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {badges.length === 0 ? (
              <Card className="col-span-2 p-8 text-center">
                <p className="text-muted-foreground">No badges earned yet</p>
              </Card>
            ) : (
              badges.map((pb, i) => (
                <motion.div
                  key={pb.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4 text-center">
                    <span className="text-4xl mb-2 block">{pb.badge?.icon}</span>
                    <h4 className="font-semibold text-sm">{pb.badge?.name}</h4>
                    <p className="text-xs text-muted-foreground">{pb.badge?.description}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantWallet;
