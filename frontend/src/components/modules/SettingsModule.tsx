import { SubscriptionPlansTable } from '@/components/SubscriptionPlansTable';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { CompanySettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { storage } from '@/lib/storage';
import { Building, Download, Upload, RotateCcw, Database, Save, ImageIcon, Trash2, Users, CreditCard, Shield, Phone, Mail, Globe, Landmark, Smartphone, Link as LinkIcon, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { BillingModule } from './BillingModule';
import { UsersModule } from './UsersModule';

export function SettingsModule() {
  const { companySettings, updateCompanySettings, loadSampleData, resetAllData, fetchCompanySettings } = useAppStore();

  const [form, setForm] = useState<CompanySettings>({
    name: companySettings?.name || 'Finite Element Designs Limited',
    address: companySettings?.address || '197-00618 Ruaraka, Nairobi, Kenya',
    phone: companySettings?.phone || '+254 722 886 353',
    email: companySettings?.email || 'info@bochi.ke',
    website: companySettings?.website || 'https://bochi.ke',
    kraPin: companySettings?.kraPin || 'P051927399I',
    vatRegistrationNumber: companySettings?.vatRegistrationNumber || 'P051927399I',
    currency: companySettings?.currency || 'KES',
    currencySymbol: companySettings?.currencySymbol || 'KSh',
    logoUrl: companySettings?.logoUrl || '',
    decimal_places: companySettings?.decimal_places || 2,
    thousand_separator: companySettings?.thousand_separator || ',',
    decimal_separator: companySettings?.decimal_separator || '.',
    bank_name: companySettings?.bank_name || 'Equity Bank Kenya Limited',
    bank_account_number: companySettings?.bank_account_number || '1234567890',
    bank_branch: companySettings?.bank_branch || 'Ruaraka, Nairobi',
    bank_swift_code: companySettings?.bank_swift_code || 'EQBLKENA',
    mpesa_paybill: companySettings?.mpesa_paybill || '123456',
    mpesa_account_number: companySettings?.mpesa_account_number || 'INV',
    vat_rate: companySettings?.vat_rate || 16,
    fiscal_year_start: companySettings?.fiscal_year_start || 'January',
    facebook: companySettings?.facebook || 'https://facebook.com/bochi',
    twitter: companySettings?.twitter || 'https://twitter.com/bochi',
    linkedin: companySettings?.linkedin || 'https://linkedin.com/company/bochi',
    instagram: companySettings?.instagram || 'https://instagram.com/bochi',
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  // Refresh company settings when component mounts
  useEffect(() => {
    if (fetchCompanySettings) {
      fetchCompanySettings();
    }
  }, [fetchCompanySettings]);

  useEffect(() => {
    const savedTab = localStorage.getItem('settingsTab');
    if (savedTab === 'billing') {
      setActiveTab('billing');
      localStorage.removeItem('settingsTab');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'billing' && localStorage.getItem('openPaymentSection') === 'true') {
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      localStorage.removeItem('openPaymentSection');
    }
  }, [activeTab]);

  const handleSave = async () => {
    console.log('=== SAVING COMPANY SETTINGS ===');
    console.log('Banking fields being saved:', {
      bank_name: form.bank_name,
      bank_account_number: form.bank_account_number,
      bank_branch: form.bank_branch,
      bank_swift_code: form.bank_swift_code,
      mpesa_paybill: form.mpesa_paybill,
      mpesa_account_number: form.mpesa_account_number
    });
    console.log('Full form data:', form);
    
    await updateCompanySettings(form);
    
    // Refresh settings to ensure UI is updated
    if (fetchCompanySettings) {
      await fetchCompanySettings();
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { 
      alert('Logo must be under 500KB'); 
      return; 
    }
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
    link.download = `bochi_backup_${new Date().toISOString().split('T')[0]}.json`;
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
      } catch { 
        alert('Invalid backup file'); 
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm('⚠️ This will DELETE ALL DATA from the database. Are you sure?')) {
      if (confirm('This action cannot be undone. Proceed?')) {
        try {
          await resetAllData();
        } catch (error) {
          console.error('Reset failed:', error);
          alert('Failed to reset data. Please try again.');
        }
      }
    }
  };

  const handleLoadSample = async () => {
    if (confirm('This will replace current data with sample data. Continue?')) {
      try {
        await loadSampleData();
      } catch (error) {
        console.error('Load sample failed:', error);
        alert('Failed to load sample data. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="general" className="text-xs py-1">
            <Building size={14} className="mr-1" />
            General
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs py-1">
            <CreditCard size={14} className="mr-1" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs py-1">
            <Users size={14} className="mr-1" />
            Users
          </TabsTrigger>
          <TabsTrigger value="backup" className="text-xs py-1">
            <Database size={14} className="mr-1" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="danger" className="text-xs py-1 text-destructive">
            <Shield size={14} className="mr-1" />
            Danger
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Settings Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Logo */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={20} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Company Logo</h3>
                </div>
                <div className="flex items-center gap-4">
                  {form.logoUrl ? (
                    <div className="relative">
                      <img 
                        src={form.logoUrl} 
                        alt="Logo" 
                        className="h-16 max-w-[200px] object-contain rounded-lg border border-border p-1" 
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 text-destructive bg-card rounded-full border border-border" 
                        onClick={() => setForm({ ...form, logoUrl: undefined })}
                      >
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
                      <Upload size={14} className="mr-1" />
                      {form.logoUrl ? 'Change' : 'Upload'} Logo
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG. Max 500KB. Appears on invoices & POs.</p>
                  </div>
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>

              {/* Company Information */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building size={20} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Company Information</h3>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label className="text-xs">Company Name</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>

                  {/* Phone, Email, Website, VAT Registration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs flex items-center gap-1"><Phone size={12} /> Phone Number</Label>
                      <Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1"><Mail size={12} /> Email Address</Label>
                      <Input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1"><Globe size={12} /> Website</Label>
                      <Input value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://bochi.ke" />
                    </div>
                    <div>
                      <Label className="text-xs">VAT Registration Number</Label>
                      <Input value={form.vatRegistrationNumber || ''} onChange={e => setForm({ ...form, vatRegistrationNumber: e.target.value })} />
                    </div>
                  </div>

                  {/* KRA PIN and Currency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">KRA PIN</Label>
                      <Input value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <div className="border border-border rounded-lg p-4 mt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-semibold">Currency Settings</h3>
                            <p className="text-sm text-muted-foreground">Choose your preferred currency for all financial transactions</p>
                            <p className="text-xs text-muted-foreground mt-1">Affects Income, Expenses, Invoices, Purchase Orders, and Reports</p>
                          </div>
                          <CurrencySelector />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking & Payment Information */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark size={20} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Banking & Payment Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Bank Name</Label>
                    <Input 
                      value={form.bank_name || ''} 
                      onChange={e => setForm({ ...form, bank_name: e.target.value })}
                      placeholder="e.g., Equity Bank Kenya Limited"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bank Account Number</Label>
                    <Input 
                      value={form.bank_account_number || ''} 
                      onChange={e => setForm({ ...form, bank_account_number: e.target.value })}
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Bank Branch</Label>
                    <Input 
                      value={form.bank_branch || ''} 
                      onChange={e => setForm({ ...form, bank_branch: e.target.value })}
                      placeholder="e.g., Ruaraka, Nairobi"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Swift/BIC Code</Label>
                    <Input 
                      value={form.bank_swift_code || ''} 
                      onChange={e => setForm({ ...form, bank_swift_code: e.target.value })}
                      placeholder="e.g., EQBLKENA"
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Smartphone size={12} /> M-Pesa Paybill</Label>
                    <Input 
                      value={form.mpesa_paybill || ''} 
                      onChange={e => setForm({ ...form, mpesa_paybill: e.target.value })}
                      placeholder="e.g., 123456"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">M-Pesa Account Number</Label>
                    <Input 
                      value={form.mpesa_account_number || ''} 
                      onChange={e => setForm({ ...form, mpesa_account_number: e.target.value })}
                      placeholder="Reference for payments"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  These details will appear on your invoices for client payment reference.
                </p>
              </div>

              {/* Social Media Links */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon size={20} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Social Media (Optional)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Facebook size={12} /> Facebook</Label>
                    <Input 
                      value={form.facebook || ''} 
                      onChange={e => setForm({ ...form, facebook: e.target.value })} 
                      placeholder="https://facebook.com/yourcompany" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Twitter size={12} /> Twitter/X</Label>
                    <Input 
                      value={form.twitter || ''} 
                      onChange={e => setForm({ ...form, twitter: e.target.value })} 
                      placeholder="https://twitter.com/yourcompany" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Linkedin size={12} /> LinkedIn</Label>
                    <Input 
                      value={form.linkedin || ''} 
                      onChange={e => setForm({ ...form, linkedin: e.target.value })} 
                      placeholder="https://linkedin.com/company/yourcompany" 
                    />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Instagram size={12} /> Instagram</Label>
                    <Input 
                      value={form.instagram || ''} 
                      onChange={e => setForm({ ...form, instagram: e.target.value })} 
                      placeholder="https://instagram.com/yourcompany" 
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} className="w-fit">
                  <Save size={16} className="mr-1" />
                  {saved ? 'Saved ✓' : 'Save All Settings'}
                </Button>
              </div>
            </div>

            {/* Right Column - Tips */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span> Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Upload your company logo to brand invoices and purchase orders</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Set your preferred currency - all financial reports will update automatically</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Add banking details for automatic inclusion on invoices</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">•</span> M-Pesa Paybill makes mobile payments easier for clients</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Regular backups are recommended - export your data weekly</li>
                </ul>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">🆘</span> Need Help?
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>📧 <strong>Email Support:</strong> <a href="mailto:support@bochi.ke" className="text-accent hover:underline ml-1">support@bochi.ke</a></p>
                  <p>📖 <strong>Documentation:</strong> <a href="#" className="text-accent hover:underline ml-1">docs.bochi.ke</a></p>
                  <p>💬 <strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">📊</span> System Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Database:</span>
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span> Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Storage Used:</span>
                    <span className="font-mono">{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-mono">2.1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-3">
          <BillingModule />
          <SubscriptionPlansTable />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-3">
          <UsersModule />
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4 mt-3">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database size={20} className="text-accent" />
              <h3 className="font-semibold text-card-foreground">Data Management</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleBackup}>
                <Download size={16} className="mr-2" />
                Backup Data
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Restore Data
              </Button>
              <Button variant="outline" onClick={handleLoadSample}>
                <Database size={16} className="mr-2" />
                Load Sample Data
              </Button>
            </div>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
            <p className="text-xs text-muted-foreground mt-3">Backup creates a JSON file with all your data. Restore replaces current data with the backup.</p>
          </div>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger" className="space-y-4 mt-3">
          <div className="bg-card rounded-xl border border-destructive/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-destructive" />
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These actions are irreversible. Please be careful.
            </p>
            <Button 
              variant="outline" 
              className="text-destructive border-destructive/30 hover:bg-destructive/10" 
              onClick={handleReset}
            >
              <RotateCcw size={16} className="mr-2" />
              Reset All Data
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}