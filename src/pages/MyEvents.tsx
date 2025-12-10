import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getMyEvents } from '@/lib/eventService';
import { useAuth } from '@/contexts/AuthContext';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getMyEvents();
        setEvents(data || []);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadEvents();
    }
  }, [user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <div className="w-6 h-6 rounded-md bg-primary" />
          </div>
          <p className="text-muted-foreground mt-4">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground">Manage your event currencies</p>
          </div>
          <Link to="/create">
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Events Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first event currency and start running a cashless economy for your next gathering!
              </p>
              <Link to="/create">
                <Button variant="gradient" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((event, i) => {
              const expired = isExpired(event.expires_at);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/event/${event.id}/dashboard`}>
                    <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{event.currency_symbol}</span>
                          <div>
                            <h3 className="font-bold text-lg">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.currency_name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expired 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {expired ? 'Ended' : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>€{event.exchange_rate}/coin</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event.duration_hours}h</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
