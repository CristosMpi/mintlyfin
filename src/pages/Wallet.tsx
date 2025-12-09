import { useState } from 'react';
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
import { Link } from 'react-router-dom';
import { demoEvent, demoParticipant, demoTransactions } from '@/data/demo';

const Wallet = () => {
  const [event] = useState(demoEvent);
  const [participant] = useState(demoParticipant);
  const [transactions] = useState(demoTransactions);
  const [activeTab, setActiveTab] = useState<'history' | 'badges'>('history');

  const formatTime = (date: Date) => {
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
              <span className="text-4xl">{event.currencySymbol}</span>
              <span className="text-5xl font-bold">{participant.balance.toFixed(2)}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              ≈ €{(participant.balance * event.exchangeRate).toFixed(2)}
            </p>
            <p className="text-sm font-medium mt-4 text-primary">
              {event.currencyName}
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
            {transactions.map((tx, i) => (
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
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'reward' ? '+' : tx.type === 'payment' ? '-' : ''}{event.currencySymbol} {tx.amount.toFixed(2)}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {participant.badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4 text-center">
                  <span className="text-4xl mb-2 block">{badge.icon}</span>
                  <h4 className="font-semibold text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </Card>
              </motion.div>
            ))}
            {/* Locked badges placeholder */}
            {[1, 2].map((_, i) => (
              <Card key={`locked-${i}`} className="p-4 text-center opacity-50">
                <span className="text-4xl mb-2 block">🔒</span>
                <h4 className="font-semibold text-sm">???</h4>
                <p className="text-xs text-muted-foreground">Keep participating!</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
