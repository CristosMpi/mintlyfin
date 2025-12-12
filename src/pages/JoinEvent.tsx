import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getEvent, joinEvent } from '@/lib/eventService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Sparkles, User } from 'lucide-react';
import { z } from 'zod';

// Input validation schema
const nameSchema = z.string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be 50 characters or less');

const JoinEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      try {
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (error) {
        toast.error('Event not found');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [eventId]);

  const validateName = (value: string) => {
    const result = nameSchema.safeParse(value);
    if (!result.success) {
      setNameError(result.error.issues[0].message);
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleJoin = async () => {
    if (!eventId) return;
    if (!validateName(name)) return;
    
    setJoining(true);
    try {
      const { joinCode } = await joinEvent(eventId, name.trim(), user?.id);
      toast.success('Welcome to the event!', {
        description: `Your join code: ${joinCode}`,
      });
      navigate(`/wallet/${eventId}/${joinCode}`);
    } catch (error) {
      toast.error('Failed to join event', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <div className="w-6 h-6 rounded-md bg-primary" />
          </div>
          <p className="text-muted-foreground mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <span className="text-5xl mb-4 block">😕</span>
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">This event may have ended or the link is invalid.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (!event.is_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <span className="text-5xl mb-4 block">⏰</span>
          <h1 className="text-2xl font-bold mb-2">Event Has Ended</h1>
          <p className="text-muted-foreground mb-6">
            {event.name} is no longer accepting participants.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <span className="text-5xl mb-4 block">{event.currency_symbol}</span>
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground mb-6">
            Join and receive <span className="font-bold text-primary">
              {event.currency_symbol} {event.starting_balance}
            </span> {event.currency_name}!
          </p>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) validateName(e.target.value);
                }}
                onBlur={() => name && validateName(name)}
                className={`pl-12 ${nameError ? 'border-destructive' : ''}`}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={50}
              />
              {nameError && (
                <p className="text-sm text-destructive mt-1 text-left">{nameError}</p>
              )}
            </div>

            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleJoin}
              disabled={!name.trim() || joining}
            >
              {joining ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  Joining...
                </span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join Event
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Exchange Rate: <span className="font-medium text-foreground">
                1 {event.currency_name} = €{event.exchange_rate}
              </span>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinEvent;
