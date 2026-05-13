import { ModuleId } from '@/lib/types';
import { Construction } from 'lucide-react';

export function ComingSoon({ module }: { module: ModuleId }) {
  const titles: Partial<Record<ModuleId, string>> = {
    payroll: 'Payroll Management',
    procurement: 'Procurement & Orders',
    stores: 'Inventory & Stores',
    sitediary: 'Site Diary',
    vat: 'VAT Compliance',
    reports: 'Reports & Analytics',
    settings: 'System Settings',
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 fade-in">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Construction size={32} className="text-accent" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{titles[module] || module}</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        This module is coming in the next iteration. The foundation is ready — ask me to build it!
      </p>
    </div>
  );
}
