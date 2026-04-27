import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SubscriptionPlansTable } from './SubscriptionPlansTable';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  limitType?: 'projects' | 'workers' | 'users' | 'income';
  currentCount?: number;
  maxLimit?: number;
}

export function UpgradeModal({ open, onClose, limitType, currentCount, maxLimit }: UpgradeModalProps) {
  const getLimitMessage = () => {
    if (!limitType) return null;
    
    const messages = {
      projects: `You've reached your limit of ${maxLimit} project${maxLimit !== 1 ? 's' : ''}. You currently have ${currentCount} project${currentCount !== 1 ? 's' : ''}.`,
      workers: `You've reached your limit of ${maxLimit} worker${maxLimit !== 1 ? 's' : ''}. You currently have ${currentCount} worker${currentCount !== 1 ? 's' : ''}.`,
      users: `You've reached your limit of ${maxLimit} user${maxLimit !== 1 ? 's' : ''}. You currently have ${currentCount} user${currentCount !== 1 ? 's' : ''}.`,
      income: `You've reached your monthly limit of ${maxLimit} income records. You've recorded ${currentCount} this month.`,
    };
    
    return messages[limitType];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">Upgrade Your Plan</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X size={18} />
            </Button>
          </div>
          {limitType && (
            <DialogDescription className="text-base mt-2">
              {getLimitMessage()}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">



<SubscriptionPlansTable compact={false} onUpgrade={() => {
  // Close modal
  onClose();
  // Set flag to auto-open payment section
  localStorage.setItem('openPaymentSection', 'true');
  // Switch to billing tab
  const billingTab = document.querySelector('[value="billing"]') as HTMLElement;
  if (billingTab) {
    billingTab.click();
  }
}} />

        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t">
          <p>💡 <strong>Tip:</strong> Upgrade anytime to unlock unlimited features. No contracts, cancel anytime.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}