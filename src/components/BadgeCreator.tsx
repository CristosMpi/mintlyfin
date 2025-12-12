import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BadgeCreatorProps {
  eventId: string;
  onBadgeCreated: () => void;
}

const defaultIcons = ['🏆', '⭐', '🎖️', '🥇', '🥈', '🥉', '💎', '🎯', '🚀', '🔥', '💪', '👑', '🎪', '🎭', '🎨', '🎵'];

const BadgeCreator = ({ eventId, onBadgeCreated }: BadgeCreatorProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    criteria: '',
    icon: '🏆',
    customImage: null as string | null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setForm(prev => ({ ...prev, customImage: e.target?.result as string, icon: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Badge name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('badges').insert({
        event_id: eventId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        criteria: form.criteria.trim() || null,
        icon: form.customImage || form.icon,
      });

      if (error) throw error;

      toast.success('Badge created successfully!');
      setOpen(false);
      setForm({ name: '', description: '', criteria: '', icon: '🏆', customImage: null });
      onBadgeCreated();
    } catch (error) {
      toast.error('Failed to create badge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Badge
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Create Badge
            </DialogTitle>
            <DialogDescription>
              Design a custom badge to reward your participants
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Badge Preview */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 flex items-center justify-center"
              >
                {form.customImage ? (
                  <img src={form.customImage} alt="Badge" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <span className="text-4xl">{form.icon}</span>
                )}
              </motion.div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Badge Icon</Label>
              <div className="flex flex-wrap gap-2">
                {defaultIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm(prev => ({ ...prev, icon, customImage: null }))}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      form.icon === icon && !form.customImage
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted hover:bg-muted/80 border border-border'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-2">
              <Label>Or Upload Custom Image</Label>
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {form.customImage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm(prev => ({ ...prev, customImage: null, icon: '🏆' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Badge Name */}
            <div className="space-y-2">
              <Label htmlFor="badge-name">Badge Name *</Label>
              <Input
                id="badge-name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Super Spender"
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="badge-desc">Description</Label>
              <Textarea
                id="badge-desc"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this badge represent?"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Criteria */}
            <div className="space-y-2">
              <Label htmlFor="badge-criteria">Award Criteria</Label>
              <Input
                id="badge-criteria"
                value={form.criteria}
                onChange={(e) => setForm(prev => ({ ...prev, criteria: e.target.value }))}
                placeholder="e.g., Spend 100+ coins"
                maxLength={100}
              />
            </div>

            <Button
              onClick={handleCreate}
              disabled={loading || !form.name.trim()}
              className="w-full"
              variant="gradient"
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Badge
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BadgeCreator;
