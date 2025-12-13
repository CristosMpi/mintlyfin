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
  Gift,
  X,
  ScanLine,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { getEvent, processPayment, transferFunds, getVendorByCode, getParticipantByJoinCode, getEventVendors } from '@/lib/eventService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ParticipantWallet = () => {
  const { eventId, joinCode } = useParams<{ eventId: string; joinCode: string }>();
  const [event, setEvent] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'badges'>('history');

  // Dialog states
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showPayScanner, setShowPayScanner] = useState(false);
  const [showSendScanner, setShowSendScanner] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientCode, setRecipientCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    if (!eventId || !joinCode) return;

    try {
      // Load event
      const eventData = await getEvent(eventId);
      setEvent(eventData);

      // Load vendors
      const vendorsData = await getEventVendors(eventId);
      setVendors(vendorsData || []);

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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!wallet?.id || !eventId) return;

    // Subscribe to wallet balance changes
    const walletChannel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `id=eq.${wallet.id}`
        },
        (payload) => {
          console.log('Wallet updated:', payload);
          setWallet((prev: any) => ({ ...prev, ...payload.new }));
          toast.success('Balance updated!');
        }
      )
      .subscribe();

    // Subscribe to new transactions
    const transactionChannel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `event_id=eq.${eventId}`
        },
        async (payload) => {
          const newTx = payload.new as any;
          // Only add if relevant to this wallet
          if (newTx.from_wallet_id === wallet.id || newTx.to_wallet_id === wallet.id) {
            // Fetch vendor info if exists
            let txWithVendor = newTx;
            if (newTx.vendor_id) {
              const { data: vendor } = await supabase
                .from('vendors')
                .select('name')
                .eq('id', newTx.vendor_id)
                .single();
              txWithVendor = { ...newTx, vendor };
            }
            setTransactions((prev) => [txWithVendor, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, [wallet?.id, eventId]);

  useEffect(() => {
    loadData();
  }, [eventId, joinCode]);

  const handlePayScan = async (result: string) => {
    setShowPayScanner(false);
    // Try to find vendor by code
    const vendor = vendors.find(v => v.vendor_code === result.toUpperCase());
    if (vendor) {
      setSelectedVendor(vendor);
      toast.success(`Vendor: ${vendor.name}`);
    } else {
      toast.error('Vendor not found');
    }
  };

  const handleSendScan = (result: string) => {
    setShowSendScanner(false);
    setRecipientCode(result.toUpperCase());
    toast.success('Code scanned!');
  };

  const handlePay = async () => {
    if (!wallet || !selectedVendor || !payAmount) return;
    
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > Number(wallet.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      await processPayment(wallet.id, selectedVendor.id, amount, `Payment to ${selectedVendor.name}`);
      toast.success(`Paid ${event?.currency_symbol} ${amount} to ${selectedVendor.name}!`);
      setShowPayDialog(false);
      setPayAmount('');
      setSelectedVendor(null);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!wallet || !recipientCode || !sendAmount) return;
    
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (amount > Number(wallet.balance)) {
      toast.error('Insufficient balance');
      return;
    }

    if (recipientCode.toUpperCase() === joinCode?.toUpperCase()) {
      toast.error('Cannot send to yourself');
      return;
    }

    setProcessing(true);
    try {
      const recipient = await getParticipantByJoinCode(recipientCode.toUpperCase());
      if (!recipient || !recipient.wallets?.[0]) {
        toast.error('Recipient not found');
        setProcessing(false);
        return;
      }

      await transferFunds(wallet.id, recipient.wallets[0].id, amount, `Transfer to ${recipient.name}`);
      toast.success(`Sent ${event?.currency_symbol} ${amount} to ${recipient.name}!`);
      setShowSendDialog(false);
      setSendAmount('');
      setRecipientCode('');
    } catch (error: any) {
      toast.error(error.message || 'Transfer failed');
    } finally {
      setProcessing(false);
    }
  };

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
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-muted-foreground" />
          </div>
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
              <motion.span 
                key={wallet.balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold"
              >
                {Number(wallet.balance).toFixed(2)}
              </motion.span>
            </div>
            <p className="text-muted-foreground text-sm">
              ~ EUR {(Number(wallet.balance) * Number(event.exchange_rate)).toFixed(2)}
            </p>
            <p className="text-sm font-medium mt-4 text-primary">
              {event.currency_name}
            </p>
          </motion.div>

          {/* Join Code Display */}
          <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Join Code</span>
              <span className="font-mono font-semibold text-sm tracking-wider">{joinCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button 
            variant="gradient" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setShowPayDialog(true)}
          >
            <QrCode className="w-6 h-6" />
            <span className="text-sm">Pay</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setShowSendDialog(true)}
          >
            <Send className="w-6 h-6" />
            <span className="text-sm">Send</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setShowReceiveDialog(true)}
          >
            <ScanLine className="w-6 h-6" />
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
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary font-bold">
                      {pb.badge?.icon}
                    </div>
                    <h4 className="font-semibold text-sm">{pb.badge?.name}</h4>
                    <p className="text-xs text-muted-foreground">{pb.badge?.description}</p>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Pay Vendor
            </DialogTitle>
            <DialogDescription>
              Scan vendor QR code or select from the list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {showPayScanner ? (
              <div className="rounded-xl overflow-hidden">
                <Scanner
                  onScan={(result) => {
                    if (result?.[0]?.rawValue) {
                      handlePayScan(result[0].rawValue);
                    }
                  }}
                  onError={(error) => {
                    console.error(error);
                    toast.error('Camera error');
                  }}
                  styles={{
                    container: { borderRadius: '12px' }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setShowPayScanner(false)}
                >
                  Cancel Scan
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPayScanner(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Vendor QR Code
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or select vendor</span>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Select Vendor</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {vendors.length === 0 ? (
                      <p className="text-muted-foreground text-center py-2">No vendors available</p>
                    ) : (
                      vendors.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVendor(v)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                            selectedVendor?.id === v.id 
                              ? 'bg-primary/10 border border-primary' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <span className="font-medium">{v.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                {selectedVendor && (
                  <div>
                    <Label htmlFor="payAmount">Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {event?.currency_symbol}
                      </span>
                      <Input
                        id="payAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={wallet?.balance}
                        placeholder="0.00"
                        className="pl-10"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {event?.currency_symbol} {Number(wallet?.balance).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {!showPayScanner && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPayDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                onClick={handlePay}
                disabled={!selectedVendor || !payAmount || processing}
              >
                {processing ? 'Processing...' : 'Pay'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send to Participant
            </DialogTitle>
            <DialogDescription>
              Scan their QR code or enter join code manually.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {showSendScanner ? (
              <div className="rounded-xl overflow-hidden">
                <Scanner
                  onScan={(result) => {
                    if (result?.[0]?.rawValue) {
                      handleSendScan(result[0].rawValue);
                    }
                  }}
                  onError={(error) => {
                    console.error(error);
                    toast.error('Camera error');
                  }}
                  styles={{
                    container: { borderRadius: '12px' }
                  }}
                />
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setShowSendScanner(false)}
                >
                  Cancel Scan
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowSendScanner(true)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Recipient QR Code
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or enter code</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipientCode">Recipient Join Code</Label>
                  <Input
                    id="recipientCode"
                    placeholder="e.g. ABC123"
                    className="mt-1 text-center text-lg tracking-widest uppercase"
                    value={recipientCode}
                    onChange={(e) => setRecipientCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sendAmount">Amount</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {event?.currency_symbol}
                    </span>
                    <Input
                      id="sendAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={wallet?.balance}
                      placeholder="0.00"
                      className="pl-10"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {event?.currency_symbol} {Number(wallet?.balance).toFixed(2)}
                  </p>
                </div>
              </>
            )}
          </div>
          
          {!showSendScanner && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleSend}
                disabled={!recipientCode || !sendAmount || processing}
              >
                {processing ? 'Sending...' : 'Send'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Receive Payment
            </DialogTitle>
            <DialogDescription>
              Share your QR code to receive payments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            <div className="p-4 bg-foreground rounded-2xl mb-4">
              <QRCodeSVG
                value={joinCode || ''}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Join Code</p>
              <p className="text-3xl font-bold tracking-wider">{joinCode}</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantWallet;
