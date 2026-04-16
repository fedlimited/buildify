import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, formatDate, calculateVAT } from '@/lib/formatters';
import { exportToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';

export function VATModule() {
  const { income, expenses, selectedProjectId } = useAppStore();

  const filteredIncome = selectedProjectId ? income.filter(i => i.projectId === selectedProjectId) : income;
  const filteredExpenses = selectedProjectId ? expenses.filter(e => e.projectId === selectedProjectId) : expenses;

  const outputVAT = filteredIncome.reduce((s, i) => s + calculateVAT(i.grossAmount), 0);
  const inputVAT = filteredExpenses.reduce((s, e) => s + e.vat, 0);
  const netVAT = outputVAT - inputVAT;

  const vatTransactions = [
    ...filteredIncome.map(i => ({ date: i.date, type: 'Output' as const, ref: i.certificateNo, description: `Payment Certificate ${i.certificateNo}`, amount: calculateVAT(i.grossAmount) })),
    ...filteredExpenses.filter(e => e.vat > 0).map(e => ({ date: e.date, type: 'Input' as const, ref: e.reference, description: e.description, amount: e.vat })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Output VAT</span><ArrowUpRight size={20} className="text-success" /></div>
          <p className="text-xl font-bold text-success">{formatCurrency(outputVAT)}</p>
          <p className="text-xs text-muted-foreground mt-1">From {filteredIncome.length} certificates</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Input VAT</span><ArrowDownLeft size={20} className="text-destructive" /></div>
          <p className="text-xl font-bold text-destructive">{formatCurrency(inputVAT)}</p>
          <p className="text-xs text-muted-foreground mt-1">From {filteredExpenses.filter(e => e.vat > 0).length} expenses</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Net VAT Position</span><TrendingUp size={20} className={netVAT >= 0 ? 'text-warning' : 'text-success'} /></div>
          <p className={`text-xl font-bold ${netVAT >= 0 ? 'text-warning' : 'text-success'}`}>{formatCurrency(Math.abs(netVAT))}</p>
          <p className="text-xs text-muted-foreground mt-1">{netVAT >= 0 ? 'Payable to KRA' : 'Refundable from KRA'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-foreground">VAT Transactions</h3>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(vatTransactions.map(t => ({ date: t.date, type: t.type, ref: t.ref, description: t.description, amount: t.amount })), 'vat_transactions')}>Export</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Date', 'Type', 'Reference', 'Description', 'VAT Amount'].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {vatTransactions.map((t, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-xs">{formatDate(t.date)}</td>
                <td className="px-4 py-2.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.type === 'Output' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{t.type}</span></td>
                <td className="px-4 py-2.5 font-mono text-xs">{t.ref || '-'}</td>
                <td className="px-4 py-2.5 text-card-foreground">{t.description}</td>
                <td className={`px-4 py-2.5 font-mono text-right font-medium ${t.type === 'Output' ? 'text-success' : 'text-destructive'}`}>{formatCurrency(t.amount)}</td>
              </tr>
            ))}
            {!vatTransactions.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No VAT transactions</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
