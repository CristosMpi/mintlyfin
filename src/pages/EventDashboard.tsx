import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Store, 
  ArrowLeft,
  QrCode,
  Download,
  Share2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getEvent, getEventStats, getEventVendors, createVendor } from '@/lib/eventService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const EventDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState({ totalParticipants: 0, totalCirculating: 0, totalVendorEarnings: 0 });
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVendorName, setNewVendorName] = useState('');
  const [addingVendor, setAddingVendor] = useState(false);

  const loadData = async () => {
    if (!eventId) return;
    try {
      const [eventData, statsData, vendorsData] = await Promise.all([
        getEvent(eventId),
        getEventStats(eventId),
        getEventVendors(eventId),
      ]);
      setEvent(eventData);
      setStats(statsData);
      setVendors(vendorsData || []);
    } catch (error) {
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleAddVendor = async () => {
    if (!eventId || !newVendorName.trim()) return;
    setAddingVendor(true);
    try {
      await createVendor(eventId, newVendorName.trim());
      toast.success('Vendor added!');
      setNewVendorName('');
      loadData();
    } catch (error) {
      toast.error('Failed to add vendor');
    } finally {
      setAddingVendor(false);
    }
  };

  const formatTimeRemaining = () => {
    if (!event?.expires_at) return 'N/A';
    const remaining = new Date(event.expires_at).getTime() - Date.now();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-pulse">🪙</span>
          <p className="text-muted-foreground mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Participants',
      value: stats.totalParticipants.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Circulating',
      value: `${event.currency_symbol} ${stats.totalCirculating.toLocaleString()}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Vendor Earnings',
      value: `${event.currency_symbol} ${stats.totalVendorEarnings.toLocaleString()}`,
      icon: <Store className="w-5 h-5" />,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Time Remaining',
      value: formatTimeRemaining(),
      icon: <Clock className="w-5 h-5" />,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  const vendorEmojis = ['🍔', '🎮', '👕', '🎨', '🍦', '🎪', '🎁', '☕'];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{event.currency_symbol}</span>
                <h1 className="text-2xl font-bold">{event.name}</h1>
              </div>
              <p className="text-muted-foreground">{event.currency_name} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.is_active 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              ● {event.is_active ? 'Live' : 'Ended'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Event QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-foreground rounded-2xl mb-4">
                    <QRCodeSVG
                      value={`${window.location.origin}/join/${eventId}`}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Participants scan to join and get their wallet
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vendors Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-accent" />
                    Vendors
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={loadData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3 mb-4">
                  {vendors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No vendors yet</p>
                  ) : (
                    vendors.map((vendor, i) => (
                      <div
                        key={vendor.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                            {vendorEmojis[i % vendorEmojis.length]}
                          </div>
                          <span className="font-medium">{vendor.name}</span>
                        </div>
                        <span className="font-bold text-accent">
                          {event.currency_symbol} {Number(vendor.total_earnings).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Vendor name..."
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddVendor()}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddVendor}
                    disabled={!newVendorName.trim() || addingVendor}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to={`/join/${eventId}`}>
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <span className="text-2xl">👤</span>
                  <span className="text-sm">Join as User</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">🎁</span>
                <span className="text-sm">Send Rewards</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm">Export Data</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">⚙️</span>
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDashboard;
