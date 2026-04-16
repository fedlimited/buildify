import { CurrencySelector } from '@/components/CurrencySelector';
import { useState, useRef } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { CompanySettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { Building, Download, Upload, RotateCcw, Database, Save, ImageIcon, Trash2 } from 'lucide-react';

export function SettingsModule() {
  const { companySettings, updateCompanySettings, loadSampleData, resetAllData } = useAppStore();
  const [form, setForm] = useState<CompanySettings>(companySettings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateCompanySettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('Logo must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm({ ...form, logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleBackup = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bochaberi_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        storage.importAll(ev.target?.result as string);
        window.location.reload();
      } catch { alert('Invalid backup file'); }
    };
    reader.readAsText(file);
  };




const handleReset = async () => {
  if (confirm('⚠️ This will DELETE ALL DATA from the database. Are you sure?')) {
    if (confirm('This action cannot be undone. Proceed?')) {
      await resetAllData();
      // Note: resetAllData already reloads the page, so no need to do it again
    }
  }
};





const handleLoadSample = async () => {
  if (confirm('This will replace current data with sample data. Continue?')) {
    await loadSampleData();
    // Note: loadSampleData already refreshes the data and shows an alert
  }
};




  return (
    <div className="space-y-6 fade-in max-w-2xl">
      {/* Company Logo */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4"><ImageIcon size={20} className="text-accent" /><h3 className="font-semibold text-card-foreground">Company Logo</h3></div>
        <div className="flex items-center gap-4">
          {form.logoUrl ? (
            <div className="relative">
              <img src={form.logoUrl} alt="Logo" className="h-16 max-w-[200px] object-contain rounded-lg border border-border p-1" />
              <Button variant="ghost" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 text-destructive bg-card rounded-full border border-border" onClick={() => setForm({ ...form, logoUrl: undefined })}>
                <Trash2 size={12} />
              </Button>
            </div>
          ) : (
            <div className="h-16 w-[200px] rounded-lg border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
              No logo uploaded
            </div>
          )}
          <div>
            <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
              <Upload size={14} className="mr-1" />{form.logoUrl ? 'Change' : 'Upload'} Logo
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG. Max 500KB. Appears on invoices & POs.</p>
          </div>
        </div>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </div>

      {/* Company Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4"><Building size={20} className="text-accent" /><h3 className="font-semibold text-card-foreground">Company Information</h3></div>
        <div className="grid gap-3">
          <div><Label className="text-xs">Company Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>



<div className="grid grid-cols-2 gap-3">
  <div><Label className="text-xs">KRA PIN</Label><Input value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} /></div>
  <div className="col-span-2">
    {/* Currency Settings Section */}
    <div className="border border-border rounded-lg p-4 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Currency Settings</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred currency for all financial transactions
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Affects Income, Expenses, Invoices, Purchase Orders, and Reports
          </p>
        </div>
        <CurrencySelector />
      </div>
    </div>
  </div>
</div>








          <Button onClick={handleSave} className="w-fit"><Save size={16} className="mr-1" />{saved ? 'Saved ✓' : 'Save Settings'}</Button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4"><Database size={20} className="text-accent" /><h3 className="font-semibold text-card-foreground">Data Management</h3></div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={handleBackup}><Download size={16} className="mr-2" />Backup Data</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload size={16} className="mr-2" />Restore Data</Button>
          <Button variant="outline" onClick={handleLoadSample}><Database size={16} className="mr-2" />Load Sample Data</Button>
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleReset}><RotateCcw size={16} className="mr-2" />Reset All Data</Button>
        </div>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
        <p className="text-xs text-muted-foreground mt-3">Backup creates a JSON file with all your data. Restore replaces current data with the backup.</p>
      </div>

      {/* System Info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-3">System Information</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Version: 2.1.0</p>
          <p>Storage: localStorage ({(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB used)</p>
        </div>
      </div>
    </div>
  );
}
