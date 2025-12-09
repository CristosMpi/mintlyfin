import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, QrCode, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { demoEvent, demoParticipant } from '@/data/demo';
import { toast } from 'sonner';

type PaymentStep = 'amount' | 'scan' | 'confirm' | 'success';

const VendorMode = () => {
  const [event] = useState(demoEvent);
  const [step, setStep] = useState<PaymentStep>('amount');
  const [amount, setAmount] = useState('');
  const [customer] = useState(demoParticipant);

  const handleAmountSubmit = () => {
    if (parseFloat(amount) > 0) {
      setStep('scan');
    }
  };

  const handleScanComplete = () => {
    setStep('confirm');
  };

  const handleConfirmPayment = () => {
    setStep('success');
    toast.success('Payment received!', {
      description: `${event.currencySymbol} ${amount} from ${customer.name}`,
    });
  };

  const handleNewPayment = () => {
    setAmount('');
    setStep('amount');
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/demo/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Vendor Mode</h1>
            <p className="text-muted-foreground text-sm">{event.currencyName} Payments</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            {event.currencySymbol}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-6">Enter Amount</h2>
                
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl">
                    {event.currencySymbol}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center text-4xl font-bold h-20 pl-14"
                  />
                </div>

                <p className="text-muted-foreground mb-6">
                  ≈ €{(parseFloat(amount || '0') * event.exchangeRate).toFixed(2)}
                </p>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[5, 10, 15, 25].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(val.toString())}
                    >
                      {val}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  onClick={handleAmountSubmit}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Scan Customer
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Scan Customer QR</h2>
                <p className="text-muted-foreground mb-6">
                  Charging {event.currencySymbol} {parseFloat(amount).toFixed(2)}
                </p>

                {/* Simulated scanner area */}
                <div 
                  className="aspect-square max-w-xs mx-auto mb-6 rounded-2xl border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={handleScanComplete}
                >
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Tap to simulate scan
                    </p>
                  </div>
                </div>

                <Button variant="outline" onClick={() => setStep('amount')}>
                  Cancel
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-6">Confirm Payment</h2>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {event.currencySymbol} {customer.balance.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted mb-6">
                  <p className="text-muted-foreground text-sm">Amount to charge</p>
                  <p className="text-3xl font-bold">
                    {event.currencySymbol} {parseFloat(amount).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('amount')}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    className="flex-1"
                    onClick={handleConfirmPayment}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Confirm
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  Received {event.currencySymbol} {parseFloat(amount).toFixed(2)} from {customer.name}
                </p>

                <Button
                  variant="gradient"
                  size="xl"
                  className="w-full"
                  onClick={handleNewPayment}
                >
                  New Payment
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's earnings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                <p className="text-2xl font-bold">{event.currencySymbol} 342.50</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorMode;
