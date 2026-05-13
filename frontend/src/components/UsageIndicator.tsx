import { motion } from 'framer-motion';
import { AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UsageIndicatorProps {
  title: string;
  used: number;
  limit: number;
  unit: string;
  color?: string;
  onUpgrade?: () => void;
}

export function UsageIndicator({ title, used, limit, unit, color = 'amber', onUpgrade }: UsageIndicatorProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;
  const isUnlimited = limit >= 999999;
  
  if (isUnlimited) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="text-xs text-green-400">Unlimited</span>
        </div>
        <div className="text-xs text-slate-400">No limits on your current plan</div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-slate-800/50 rounded-lg border ${
        isAtLimit ? 'border-red-500/50 bg-red-500/5' : 
        isNearLimit ? 'border-amber-500/50 bg-amber-500/5' : 
        'border-slate-700'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white">{title}</span>
        <span className={`text-sm font-mono ${
          isAtLimit ? 'text-red-400' : 
          isNearLimit ? 'text-amber-400' : 
          'text-slate-400'
        }`}>
          {used} / {limit} {unit}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${
          isAtLimit ? 'bg-red-500/20' : 
          isNearLimit ? 'bg-amber-500/20' : 
          'bg-slate-700'
        }`}
        indicatorClassName={isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-amber-500'}
      />
      
      {isAtLimit && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={12} />
            <span>Limit reached</span>
          </div>
          {onUpgrade && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onUpgrade}
              className="h-7 text-xs border-amber-500 text-amber-500 hover:bg-amber-500/10"
            >
              <Crown size={12} className="mr-1" />
              Upgrade
            </Button>
          )}
        </motion.div>
      )}
      
      {isNearLimit && !isAtLimit && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle size={12} />
            <span>{limit - used} {unit} remaining</span>
          </div>
          {onUpgrade && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onUpgrade}
              className="h-7 text-xs text-amber-500 hover:text-amber-400"
            >
              Upgrade for more
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}