import { AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LimitWarningProps {
  type: 'projects' | 'workers' | 'users';
  current: number;
  max: number;
  onUpgrade?: () => void;
}

export function LimitWarning({ type, current, max, onUpgrade }: LimitWarningProps) {
  const messages = {
    projects: {
      title: 'Project Limit Reached',
      message: `You have ${current} projects but your plan only allows ${max}. Some projects have been archived.`,
      action: 'Upgrade to Pro to manage all projects'
    },
    workers: {
      title: 'Worker Limit Reached',
      message: `You have ${current} workers but your plan only allows ${max}. Some workers are inactive.`,
      action: 'Upgrade to Pro to manage all workers'
    },
    users: {
      title: 'User Limit Reached',
      message: `You have ${current} users but your plan only allows ${max}.`,
      action: 'Upgrade to Pro to add more users'
    }
  };
  
  const msg = messages[type];
  
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 dark:text-amber-300">{msg.title}</h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{msg.message}</p>
          <Button 
            size="sm" 
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={onUpgrade}
          >
            <Crown size={14} className="mr-1" />
            {msg.action}
          </Button>
        </div>
      </div>
    </div>
  );
}