import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { currencySymbols } from '@/data/demo';
import { toast } from 'sonner';
import { createEvent } from '@/lib/eventService';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    currencyName: '',
    currencySymbol: '🪙',
    exchangeRate: '1.00',
    duration: '24',
    startingBalance: '50',
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const event = await createEvent({
        name: formData.eventName,
        currencyName: formData.currencyName,
        currencySymbol: formData.currencySymbol,
        exchangeRate: parseFloat(formData.exchangeRate),
        startingBalance: parseFloat(formData.startingBalance),
        durationHours: parseInt(formData.duration),
      });

      toast.success('Event created successfully!', {
        description: `${formData.eventName} is now live with ${formData.currencyName}`,
      });
      navigate(`/event/${event.id}/dashboard`);
    } catch (error) {
      toast.error('Failed to create event', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.eventName.length >= 3 && formData.currencyName.length >= 2;
      case 2:
        return parseFloat(formData.exchangeRate) > 0 && parseInt(formData.duration) > 0;
      case 3:
        return parseInt(formData.startingBalance) >= 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Event</h1>
            <p className="text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Event & Currency Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Name</label>
                  <Input
                    placeholder="e.g., Spring Festival 2025"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Currency Name</label>
                  <Input
                    placeholder="e.g., FestaCoin, RoboBucks"
                    value={formData.currencyName}
                    onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Currency Symbol</label>
                  <div className="flex flex-wrap gap-3">
                    {currencySymbols.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => setFormData({ ...formData, currencySymbol: symbol })}
                        className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                          formData.currencySymbol === symbol
                            ? 'border-primary bg-primary/10 scale-110'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Exchange Rate & Duration</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Exchange Rate (1 {formData.currencyName || 'Token'} = €?)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pl-8"
                      value={formData.exchangeRate}
                      onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    €10 = {(10 / parseFloat(formData.exchangeRate || '1')).toFixed(2)} {formData.currencySymbol}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Duration (hours)</label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Currency expires in {formData.duration} hours after launch
                  </p>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Starting Balance & Review</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Starting Balance per Participant
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                      {formData.currencySymbol}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      className="pl-12"
                      value={formData.startingBalance}
                      onChange={(e) => setFormData({ ...formData, startingBalance: e.target.value })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ €{(parseFloat(formData.startingBalance || '0') * parseFloat(formData.exchangeRate || '1')).toFixed(2)} value
                  </p>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Review Your Event</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event</span>
                      <span className="font-medium">{formData.eventName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency</span>
                      <span className="font-medium">{formData.currencySymbol} {formData.currencyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium">1 = €{formData.exchangeRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formData.duration} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starting Balance</span>
                      <span className="font-medium">{formData.currencySymbol} {formData.startingBalance}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              variant="gradient"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={!isStepValid() || loading}
              className="flex-1"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  Creating...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch Event
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
