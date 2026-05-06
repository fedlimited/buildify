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
import { Building, Download, Upload, RotateCcw, Database, Save, ImageIcon, Trash2, Users, CreditCard, Shield, Phone, Mail, Globe, Landmark, Smartphone, Link as LinkIcon, Facebook, Twitter, Linkedin, Instagram, HelpCircle, Info, AlertCircle } from 'lucide-react';
import { BillingModule } from './BillingModule';
import { UsersModule } from './UsersModule';

export function SettingsModule() {
  const { companySettings, updateCompanySettings, loadSampleData, resetAllData, fetchCompanySettings } = useAppStore();

  const [form, setForm] = useState<CompanySettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    kraPin: '',
    vatRegistrationNumber: '',
    currency: 'KES',
    currencySymbol: 'KSh',
    logoUrl: '',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
    bank_name: '',
    bank_account_number: '',
    bank_branch: '',
    bank_swift_code: '',
    mpesa_paybill: '',
    mpesa_account_number: '',
    vat_rate: 16,
    fiscal_year_start: 'January',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  // Fetch settings when component mounts
  useEffect(() => {
    if (fetchCompanySettings) {
      fetchCompanySettings();
    }
  }, [fetchCompanySettings]);

  // Update form when companySettings changes
  useEffect(() => {
    if (companySettings) {
      console.log('Company settings loaded from store:', companySettings);
      setForm({
        name: companySettings.name || '',
        address: companySettings.address || '',
        phone: companySettings.phone || '',
        email: companySettings.email || '',
        website: companySettings.website || '',
        kraPin: companySettings.kraPin || '',
        vatRegistrationNumber: companySettings.vatRegistrationNumber || '',
        currency: companySettings.currency || 'KES',
        currencySymbol: companySettings.currencySymbol || 'KSh',
        logoUrl: companySettings.logoUrl || '',
        decimal_places: companySettings.decimal_places || 2,
        thousand_separator: companySettings.thousand_separator || ',',
        decimal_separator: companySettings.decimal_separator || '.',
        bank_name: companySettings.bank_name || '',
        bank_account_number: companySettings.bank_account_number || '',
        bank_branch: companySettings.bank_branch || '',
        bank_swift_code: companySettings.bank_swift_code || '',
        mpesa_paybill: companySettings.mpesa_paybill || '',
        mpesa_account_number: companySettings.mpesa_account_number || '',
        vat_rate: companySettings.vat_rate || 16,
        fiscal_year_start: companySettings.fiscal_year_start || 'January',
        facebook: companySettings.facebook || '',
        twitter: companySettings.twitter || '',
        linkedin: companySettings.linkedin || '',
        instagram: companySettings.instagram || '',
      });
    }
  }, [companySettings]);

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
    
    try {
      await updateCompanySettings(form);
      
      // Force refetch to ensure store is updated
      if (fetchCompanySettings) {
        await fetchCompanySettings();
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save settings. Please try again.');
    }
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

        {/* General Tab - Improved Layout */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Settings Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Company Logo */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={18} className="text-accent" />
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

              {/* Company Information - 2 Column Layout */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building size={18} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Company Information</h3>
                  <div className="ml-auto text-xs text-muted-foreground">
                    <Info size={12} className="inline mr-1" /> Required for legal documents
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-xs font-semibold">Company Name</Label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Appears on all invoices and official documents</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-semibold">Physical Address</Label>
                    <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
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
                    <Label className="text-xs">KRA PIN</Label>
                    <Input value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Your tax registration number</p>
                  </div>
                  <div>
                    <Label className="text-xs">VAT Registration Number</Label>
                    <Input value={form.vatRegistrationNumber || ''} onChange={e => setForm({ ...form, vatRegistrationNumber: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Default VAT Rate (%)</Label>
                    <Input 
                      type="number" 
                      value={form.vat_rate || 16} 
                      onChange={e => setForm({ ...form, vat_rate: Number(e.target.value) })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Standard rate is 16% for Kenya</p>
                  </div>
                </div>
              </div>

              {/* Currency & Financial Settings */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Financial Settings</h3>
                </div>
                <div className="border border-border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm font-semibold">Currency Settings</p>
                      <p className="text-xs text-muted-foreground">Affects all financial transactions: Income, Expenses, Invoices, Purchase Orders</p>
                      <p className="text-xs text-muted-foreground mt-1">⚠️ Changing currency will update all financial displays</p>
                    </div>
                    <CurrencySelector />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Fiscal Year Start</Label>
                    <select 
                      value={form.fiscal_year_start || 'January'}
                      onChange={e => setForm({ ...form, fiscal_year_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-background"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Number Format</Label>
                    <div className="text-sm text-muted-foreground mt-2">
                      {form.thousand_separator || ','}{form.decimal_separator || '.'}00
                      <span className="text-xs ml-2">(Thousands, Decimal)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking & Payment Information */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={18} className="text-accent" />
                  <h3 className="font-semibold text-card-foreground">Banking & Payment Information</h3>
                  <div className="ml-auto text-xs text-muted-foreground">
                    <HelpCircle size={12} className="inline mr-1" /> Appears on invoices
                  </div>
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
                      placeholder="Reference for payments (e.g., INV{{number}})"
                    />
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Info size={12} />
                    <span>These details will appear in the "Payment Instructions" section on your invoices.</span>
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon size={18} className="text-accent" />
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
              <div className="flex justify-end sticky bottom-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg border border-border">
                <Button onClick={handleSave} className="w-fit">
                  <Save size={16} className="mr-1" />
                  {saved ? 'Saved ✓' : 'Save All Settings'}
                </Button>
              </div>
            </div>

            {/* Right Column - Tips & Information */}
            <div className="space-y-6">
              {/* Getting Started Guide */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 p-5">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <HelpCircle size={16} />
                  Quick Setup Guide
                </h3>
                <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">1.</span>
                    <span>Upload your <strong>company logo</strong> for branding on invoices</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">2.</span>
                    <span>Set your <strong>currency</strong> (KES for Kenya)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">3.</span>
                    <span>Add <strong>banking details</strong> for automatic inclusion on invoices</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-green-600">4.</span>
                    <span>Enter <strong>KRA PIN & VAT</strong> for tax compliance</span>
                  </div>
                </div>
              </div>

              {/* Where Info Appears */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <Info size={16} />
                  Where This Info Appears
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground">Company Logo</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Invoices, POs</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground">Banking Details</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Invoice Payment Section</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground">KRA PIN / VAT</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">All Financial Documents</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">All Money Fields</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">M-Pesa Paybill</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Invoice Payment Section</span>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">🆘</span> Need Help?
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>📧 <strong>Email Support:</strong> <a href="mailto:support@bochi.ke" className="text-accent hover:underline">support@bochi.ke</a></p>
                  <p>📖 <strong>Documentation:</strong> <a href="#" className="text-accent hover:underline">docs.bochi.ke</a></p>
                  <p>💬 <strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </div>

              {/* System Status */}
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
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-mono">2.1.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Saved:</span>
                    <span className="text-xs">{new Date().toLocaleTimeString()}</span>
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