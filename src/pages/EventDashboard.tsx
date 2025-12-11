import { useState, useEffect, useRef } from 'react';
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
  Plus,
  Gift,
  FileDown,
  Settings,
  User,
  X,
  Trash2,
  Pencil,
  Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getEvent, getEventStats, getEventVendors, createVendor, getEventParticipants, sendReward, updateEvent, getEventTransactions, updateVendor, deleteVendor } from '@/lib/eventService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EventDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [stats, setStats] = useState({ totalParticipants: 0, totalCirculating: 0, totalVendorEarnings: 0 });
  const [vendors, setVendors] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVendorName, setNewVendorName] = useState('');
  const [addingVendor, setAddingVendor] = useState(false);
  
  // Dialog states
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showVendorSettingsDialog, setShowVendorSettingsDialog] = useState(false);
  const [showDeleteVendorDialog, setShowDeleteVendorDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardMessage, setRewardMessage] = useState('');
  const [sendingReward, setSendingReward] = useState(false);
  const [vendorEditName, setVendorEditName] = useState('');
  const [savingVendor, setSavingVendor] = useState(false);
  
  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    currency_name: '',
    currency_symbol: '',
    exchange_rate: '',
    starting_balance: '',
    is_active: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!eventId) return;
    try {
      const [eventData, statsData, vendorsData, participantsData] = await Promise.all([
        getEvent(eventId),
        getEventStats(eventId),
        getEventVendors(eventId),
        getEventParticipants(eventId),
      ]);
      setEvent(eventData);
      setStats(statsData);
      setVendors(vendorsData || []);
      setParticipants(participantsData || []);
      
      if (eventData) {
        setSettingsForm({
          name: eventData.name,
          currency_name: eventData.currency_name,
          currency_symbol: eventData.currency_symbol,
          exchange_rate: String(eventData.exchange_rate),
          starting_balance: String(eventData.starting_balance),
          is_active: eventData.is_active,
        });
      }
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

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      
      const link = document.createElement('a');
      link.download = `${event?.name || 'event'}-qr-code.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareQR = async () => {
    const joinUrl = `${window.location.origin}/join/${eventId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${event?.name}`,
          text: `Join my event and get your ${event?.currency_name} wallet!`,
          url: joinUrl,
        });
      } catch (err) {
        // User cancelled or share failed, copy to clipboard instead
        await navigator.clipboard.writeText(joinUrl);
        toast.success('Link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(joinUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSendReward = async () => {
    if (!eventId || !selectedParticipant || !rewardAmount) return;
    
    const amount = parseFloat(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setSendingReward(true);
    try {
      await sendReward(eventId, selectedParticipant.id, amount, rewardMessage || undefined);
      toast.success(`Sent ${event?.currency_symbol} ${amount} to ${selectedParticipant.name}!`);
      setShowRewardDialog(false);
      setSelectedParticipant(null);
      setRewardAmount('');
      setRewardMessage('');
      loadData();
    } catch (error) {
      toast.error('Failed to send reward');
    } finally {
      setSendingReward(false);
    }
  };

  const handleExportData = async () => {
    if (!eventId) return;
    
    try {
      const transactions = await getEventTransactions(eventId);
      
      // Prepare CSV data
      const participantsCsv = [
        ['Name', 'Join Code', 'Balance', 'Joined At'].join(','),
        ...participants.map(p => [
          p.name,
          p.join_code,
          p.wallets?.[0]?.balance || 0,
          new Date(p.joined_at).toLocaleString()
        ].join(','))
      ].join('\n');
      
      const vendorsCsv = [
        ['Name', 'Vendor Code', 'Total Earnings'].join(','),
        ...vendors.map(v => [
          v.name,
          v.vendor_code,
          v.total_earnings
        ].join(','))
      ].join('\n');
      
      const transactionsCsv = [
        ['Type', 'Amount', 'From', 'To', 'Vendor', 'Description', 'Date'].join(','),
        ...transactions.map((t: any) => [
          t.type,
          t.amount,
          t.from_wallet?.participant?.name || '-',
          t.to_wallet?.participant?.name || '-',
          t.vendor?.name || '-',
          t.description || '-',
          new Date(t.created_at).toLocaleString()
        ].join(','))
      ].join('\n');
      
      // Create a combined export
      const fullExport = `# ${event?.name} - Event Export\n# Generated: ${new Date().toLocaleString()}\n\n## Participants\n${participantsCsv}\n\n## Vendors\n${vendorsCsv}\n\n## Transactions\n${transactionsCsv}`;
      
      const blob = new Blob([fullExport], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event?.name || 'event'}-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleSaveSettings = async () => {
    if (!eventId) return;
    
    setSavingSettings(true);
    try {
      await updateEvent(eventId, {
        name: settingsForm.name,
        currency_name: settingsForm.currency_name,
        currency_symbol: settingsForm.currency_symbol,
        exchange_rate: parseFloat(settingsForm.exchange_rate),
        starting_balance: parseFloat(settingsForm.starting_balance),
        is_active: settingsForm.is_active,
      });
      toast.success('Settings saved!');
      setShowSettingsDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVendorClick = (vendor: any) => {
    setSelectedVendor(vendor);
    setVendorEditName(vendor.name);
    setShowVendorSettingsDialog(true);
  };

  const handleUpdateVendor = async () => {
    if (!selectedVendor || !vendorEditName.trim()) return;
    
    setSavingVendor(true);
    try {
      await updateVendor(selectedVendor.id, { name: vendorEditName.trim() });
      toast.success('Vendor updated!');
      setShowVendorSettingsDialog(false);
      setSelectedVendor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update vendor');
    } finally {
      setSavingVendor(false);
    }
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await deleteVendor(selectedVendor.id);
      toast.success('Vendor deleted!');
      setShowDeleteVendorDialog(false);
      setShowVendorSettingsDialog(false);
      setSelectedVendor(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete vendor');
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

  const vendorColors = ['bg-orange-500', 'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/my-events">
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
              {event.is_active ? 'Live' : 'Ended'}
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
                  <div ref={qrRef} className="p-4 bg-foreground rounded-2xl mb-4">
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
                    <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShareQR}>
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
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {vendors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No vendors yet</p>
                  ) : (
                    vendors.map((vendor, i) => (
                      <button
                        key={vendor.id}
                        onClick={() => handleVendorClick(vendor)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${vendorColors[i % vendorColors.length]} flex items-center justify-center text-primary-foreground font-bold`}>
                            {vendor.name.charAt(0)}
                          </div>
                          <span className="font-medium">{vendor.name}</span>
                        </div>
                        <span className="font-bold text-accent">
                          {event.currency_symbol} {Number(vendor.total_earnings).toLocaleString()}
                        </span>
                      </button>
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
                  <User className="w-6 h-6" />
                  <span className="text-sm">Join as User</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setShowRewardDialog(true)}
              >
                <Gift className="w-6 h-6" />
                <span className="text-sm">Send Rewards</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={handleExportData}
              >
                <FileDown className="w-6 h-6" />
                <span className="text-sm">Export Data</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Send Rewards Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Send Rewards
            </DialogTitle>
            <DialogDescription>
              Send {event?.currency_name} to a participant as a reward.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Select Participant</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2">
                {participants.length === 0 ? (
                  <p className="text-muted-foreground text-center py-2">No participants yet</p>
                ) : (
                  participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedParticipant(p)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedParticipant?.id === p.id 
                          ? 'bg-primary/10 border border-primary' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {event?.currency_symbol} {p.wallets?.[0]?.balance || 0}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            {selectedParticipant && (
              <>
                <div>
                  <Label htmlFor="rewardAmount">Amount</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {event?.currency_symbol}
                    </span>
                    <Input
                      id="rewardAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rewardMessage">Message (optional)</Label>
                  <Input
                    id="rewardMessage"
                    placeholder="Great job at the raffle!"
                    className="mt-1"
                    value={rewardMessage}
                    onChange={(e) => setRewardMessage(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSendReward}
              disabled={!selectedParticipant || !rewardAmount || sendingReward}
            >
              {sendingReward ? 'Sending...' : 'Send Reward'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Event Settings
            </DialogTitle>
            <DialogDescription>
              Update your event configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="eventName">Event Name</Label>
              <Input
                id="eventName"
                className="mt-1"
                value={settingsForm.name}
                onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currencyName">Currency Name</Label>
                <Input
                  id="currencyName"
                  className="mt-1"
                  value={settingsForm.currency_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currencySymbol">Symbol</Label>
                <Input
                  id="currencySymbol"
                  className="mt-1"
                  value={settingsForm.currency_symbol}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currency_symbol: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="exchangeRate">Exchange Rate (€)</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  value={settingsForm.exchange_rate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, exchange_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startingBalance">Starting Balance</Label>
                <Input
                  id="startingBalance"
                  type="number"
                  step="1"
                  className="mt-1"
                  value={settingsForm.starting_balance}
                  onChange={(e) => setSettingsForm({ ...settingsForm, starting_balance: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Event Status</Label>
                <p className="text-sm text-muted-foreground">
                  {settingsForm.is_active ? 'Event is live' : 'Event is paused'}
                </p>
              </div>
              <Switch
                checked={settingsForm.is_active}
                onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, is_active: checked })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Settings Dialog */}
      <Dialog open={showVendorSettingsDialog} onOpenChange={setShowVendorSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Vendor Settings
            </DialogTitle>
            <DialogDescription>
              Manage vendor settings for {selectedVendor?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                className="mt-1"
                value={vendorEditName}
                onChange={(e) => setVendorEditName(e.target.value)}
              />
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">
                {event?.currency_symbol} {Number(selectedVendor?.total_earnings || 0).toLocaleString()}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Vendor Code</p>
              <p className="text-lg font-mono font-bold tracking-wider">
                {selectedVendor?.vendor_code}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteVendorDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowVendorSettingsDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="gradient" 
                onClick={handleUpdateVendor}
                disabled={!vendorEditName.trim() || savingVendor}
              >
                {savingVendor ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Vendor Confirmation */}
      <AlertDialog open={showDeleteVendorDialog} onOpenChange={setShowDeleteVendorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedVendor?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventDashboard;