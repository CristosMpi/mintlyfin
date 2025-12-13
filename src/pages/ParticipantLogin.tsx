import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { getParticipantByJoinCode } from '@/lib/eventService';
import { toast } from 'sonner';

const ParticipantLogin = () => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      toast.error('Please enter your join code');
      return;
    }

    setLoading(true);
    try {
      const participant = await getParticipantByJoinCode(joinCode.toUpperCase().trim());
      
      if (!participant) {
        toast.error('Invalid join code');
        setLoading(false);
        return;
      }

      // Navigate to wallet
      navigate(`/wallet/${participant.event_id}/${participant.join_code}`);
    } catch (error) {
      toast.error('Failed to find wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Your Wallet</h1>
            <p className="text-muted-foreground">
              Enter your join code to access your event wallet
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                placeholder="e.g. A1B2C3D4E5F6G7H8"
                className="mt-2 text-center text-lg tracking-wider uppercase font-mono"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={16}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Enter your 16-character code you received when joining an event
              </p>
            </div>

            <Button 
              type="submit" 
              variant="gradient" 
              className="w-full" 
              size="lg"
              disabled={loading || !joinCode.trim()}
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Access Wallet
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Are you an event host?
            </p>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In as Host
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ParticipantLogin;
