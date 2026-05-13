import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Rocket, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  limitType: string;
  current: number;
  max: number;
}

export function UpgradePrompt({ open, onClose, limitType, current, max }: UpgradePromptProps) {
  const { setActiveModule } = useAppStore();



const handleUpgrade = () => {
  // Switch to settings module
  setActiveModule('settings');
  // Store that we want to open billing tab
  localStorage.setItem('settingsTab', 'billing');
  onClose();
};


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown size={20} className="text-amber-500" />
            Limit Reached
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-amber-500 font-medium">You've reached your {limitType} limit</p>
            <p className="text-sm text-muted-foreground mt-1">
              Current: {current} / Maximum: {max} {limitType}s
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Upgrade to a higher plan to add more {limitType}s and unlock additional features.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600">
              <Rocket size={14} className="mr-1" />
              Upgrade Now
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}