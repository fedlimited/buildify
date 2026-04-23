import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CompactUsageBarProps {
  used: number;
  limit: number;
  label: string;
  onUpgrade?: () => void;
}

export function CompactUsageBar({ used, limit, label, onUpgrade }: CompactUsageBarProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;
  const isUnlimited = limit >= 999999;
  
  if (isUnlimited) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-green-400">Unlimited</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-slate-300'}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-amber-500'}`}
        />
      </div>
      {isAtLimit && onUpgrade && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onUpgrade}
            className="h-5 text-xs text-amber-500 hover:text-amber-400 px-0"
          >
            Upgrade
          </Button>
        </div>
      )}
    </div>
  );
}