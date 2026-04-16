// Currency settings state
let currentCurrencySettings: any = null;

export function setCurrencySettings(settings: any) {
  currentCurrencySettings = settings;
  console.log('Currency settings updated:', settings);
}

// Main currency formatter - uses dynamic currency settings
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  
  if (!currentCurrencySettings) {
    return `KSh ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const { currency_symbol, decimal_places = 2, thousand_separator = ',', decimal_separator = '.' } = currentCurrencySettings;
  
  const fixedAmount = amount.toFixed(decimal_places);
  const [integerPart, decimalPart] = fixedAmount.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_separator);
  const formattedNumber = decimalPart ? `${formattedInteger}${decimal_separator}${decimalPart}` : formattedInteger;
  
  return `${currency_symbol} ${formattedNumber}`;
}

// Format number with thousand separators
export function formatNumber(n: number): string {
  const safeNumber = (n && !isNaN(n)) ? n : 0;
  return safeNumber.toLocaleString('en-KE');
}

// Format date consistently
export function formatDate(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Calculate VAT (16%)
export function calculateVAT(amount: number): number {
  const safeAmount = (amount && !isNaN(amount)) ? amount : 0;
  return safeAmount * 0.16;
}

// Calculate retention amount
export function calculateRetention(amount: number, percent: number): number {
  const safeAmount = (amount && !isNaN(amount)) ? amount : 0;
  const safePercent = (percent && !isNaN(percent)) ? percent : 0;
  return safeAmount * (safePercent / 100);
}

// Calculate net payable after VAT and retention
export function calculateNetPayable(gross: number, retentionPercent: number): number {
  return (calculateVAT(gross) + gross) - calculateRetention(gross, retentionPercent);
}