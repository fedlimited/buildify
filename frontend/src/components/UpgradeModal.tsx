import React from 'react';
import { X, Shield, ArrowUpRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  currentPlan?: string;
}

export function UpgradeModal({ isOpen, onClose, message, currentPlan }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Upgrade Required</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-amber-500/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {message || 'You have reached the limit of your current plan.'}
          </p>
          {currentPlan && (
            <p className="text-xs text-muted-foreground mt-1">Current plan: <strong>{currentPlan}</strong></p>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Upgrade to a higher plan to unlock more features and capacity.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              localStorage.setItem('settingsTab', 'billing');
              window.location.href = '/dashboard';
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
          >
            Upgrade Now
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}