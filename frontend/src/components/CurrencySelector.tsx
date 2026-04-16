import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { useAppStore } from '@/hooks/useAppStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Globe, Save } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

export function CurrencySelector() {
  const { currencySettings, fetchCurrencySettings, updateCurrencySettings } = useAppStore();
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadCurrencies();
    fetchCurrencySettings();
  }, []);

  useEffect(() => {
    if (currencySettings) {
      setSelectedCurrency(currencySettings.currency_code);
    }
  }, [currencySettings]);

  const loadCurrencies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/currency/available`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAvailableCurrencies(data);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const handleSave = async () => {
    const currency = availableCurrencies.find(c => c.code === selectedCurrency);
    if (currency) {
      await updateCurrencySettings({
        currency_code: currency.code,
        currency_symbol: currency.symbol
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe size={14} />
          {currencySettings?.currency_symbol || 'KSh'} {currencySettings?.currency_code || 'KES'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Currency</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Currency</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {availableCurrencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm text-muted-foreground">{currency.symbol}</span>
                      <span className="text-xs text-muted-foreground">{currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Preview:</p>
            <p className="text-lg">
              {availableCurrencies.find(c => c.code === selectedCurrency)?.symbol || 'KSh'} 
              1,000.00 {selectedCurrency || 'KES'}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save size={14} /> Save Currency
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}