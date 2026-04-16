import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Income as IncomeType } from '@/lib/types';
import { formatCurrency, formatDate, calculateVAT, calculateRetention, calculateNetPayable } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyIncome: Omit<IncomeType, 'id' | 'createdAt'> = {
  projectId: 0, certificateNo: '', date: new Date().toISOString().split('T')[0], grossAmount: 0, retentionPercent: 5, amountReceived: 0, paymentDate: '', paymentMethod: '', status: 'Pending', notes: ''
};

export function IncomeModule() {
const { income, projects, selectedProjectId, addIncome, updateIncome, deleteIncome, fetchIncome } = useAppStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeType | null>(null);
  const [form, setForm] = useState(emptyIncome);

  const filtered = selectedProjectId ? income.filter(i => i.projectId === selectedProjectId) : income;

  const openNew = () => { 
    setEditing(null); 
    setForm({ ...emptyIncome, projectId: selectedProjectId || 0 }); 
    setOpen(true); 
  };
  
  const openEdit = (i: IncomeType) => { 
    setEditing(i); 
    setForm({
      projectId: i.projectId,
      certificateNo: i.certificateNo || '',
      date: i.date || new Date().toISOString().split('T')[0],
      grossAmount: i.grossAmount || 0,
      retentionPercent: i.retentionPercent || 5,
      amountReceived: i.amountReceived || 0,
      paymentDate: i.paymentDate || '',
      paymentMethod: i.paymentMethod || '',
      status: i.status || 'Pending',
      notes: i.notes || ''
    });
    setOpen(true); 
  };






const handleSave = async () => {
  if (!form.projectId || !form.certificateNo || !form.grossAmount) return;
  const net = calculateNetPayable(form.grossAmount, form.retentionPercent);
  const status: IncomeType['status'] = form.amountReceived >= net ? 'Paid' : form.amountReceived > 0 ? 'Partial' : 'Pending';
  const data = { ...form, status };
  
  if (editing) {
    await updateIncome({ ...editing, ...data });
  } else {
    await addIncome(data);

  }
  
  // Force refresh the income list
  await fetchIncome(); // Make sure fetchIncome is available
  
  setOpen(false);
};






  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} certificate{filtered.length !== 1 ? 's' : ''}</p>
        <Button onClick={openNew} size="sm"><Plus size={16} className="mr-1" />Add Certificate</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['Project', 'Cert No', 'Date', 'Gross', 'VAT (16%)', 'Retention', 'Net Payable', 'Received', 'Balance', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(i => {
              const proj = projects.find(p => p.id === i.projectId);
              const vat = calculateVAT(i.grossAmount);
              const ret = calculateRetention(i.grossAmount, i.retentionPercent);
              const net = (i.grossAmount + vat) - ret;
              const bal = net - i.amountReceived;
              
              return (
                <tr key={i.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2.5 text-card-foreground">{proj?.name || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{i.certificateNo}</td>
                  <td className="px-4 py-2.5">{formatDate(i.date)}</td>
                  <td className="px-4 py-2.5 font-mono text-right">{formatCurrency(i.grossAmount)}</td>
                  <td className="px-4 py-2.5 font-mono text-right text-muted-foreground">{formatCurrency(vat)}</td>
                  <td className="px-4 py-2.5 font-mono text-right text-muted-foreground">{formatCurrency(ret)}</td>
                  <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(net)}</td>
                  <td className="px-4 py-2.5 font-mono text-right text-success">{formatCurrency(i.amountReceived)}</td>
                  <td className={`px-4 py-2.5 font-mono text-right ${bal > 0 ? 'text-warning' : 'text-success'}`}>{formatCurrency(bal)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      i.status === 'Paid' ? 'bg-success/10 text-success' :
                      i.status === 'Partial' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>{i.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteIncome(i.id); }}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">No income records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Certificate' : 'New Payment Certificate'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-xs">Project *</Label>
              <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Certificate No *</Label><Input value={form.certificateNo} onChange={e => setForm({ ...form, certificateNo: e.target.value })} /></div>
              <div><Label className="text-xs">Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Gross Amount *</Label><Input type="number" value={form.grossAmount || ''} onChange={e => setForm({ ...form, grossAmount: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Retention %</Label><Input type="number" value={form.retentionPercent} onChange={e => setForm({ ...form, retentionPercent: Number(e.target.value) })} /></div>
            </div>
            {form.grossAmount > 0 && (
              <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between"><span>Gross Amount</span><span className="font-mono">{formatCurrency(form.grossAmount)}</span></div>
                <div className="flex justify-between"><span>+ VAT (16%)</span><span className="font-mono">{formatCurrency(calculateVAT(form.grossAmount))}</span></div>
                <div className="flex justify-between"><span>= Gross + VAT</span><span className="font-mono font-medium">{formatCurrency(form.grossAmount + calculateVAT(form.grossAmount))}</span></div>
                <div className="flex justify-between"><span>- Retention ({form.retentionPercent}% of Gross)</span><span className="font-mono">{formatCurrency(calculateRetention(form.grossAmount, form.retentionPercent))}</span></div>
                <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Net Payable</span><span className="font-mono">{formatCurrency(calculateNetPayable(form.grossAmount, form.retentionPercent))}</span></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Amount Received</Label><Input type="number" value={form.amountReceived || ''} onChange={e => setForm({ ...form, amountReceived: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Payment Method</Label><Input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Bank Transfer, Cheque, etc." /></div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}