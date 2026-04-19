import { useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log('=== IncomeModule Debug ===');
    console.log('Projects count:', projects.length);
  }, [projects]);

  const openNew = () => {
    setEditing(null);
    const defaultProject = projects.find(p => p.status === 'Active');
    setForm({ ...emptyIncome, projectId: defaultProject?.id || 0 });
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

    await fetchIncome();
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
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Project</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Cert No</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Gross</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">VAT</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Retention</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Net</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Received</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Balance</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground"></th>
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
                <tr key={i.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2">{proj?.name || '-'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{i.certificateNo}</td>
                  <td className="px-4 py-2">{formatDate(i.date)}</td>
                  <td className="px-4 py-2 text-right font-mono">{formatCurrency(i.grossAmount)}</td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground">{formatCurrency(vat)}</td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground">{formatCurrency(ret)}</td>
                  <td className="px-4 py-2 text-right font-mono font-medium">{formatCurrency(net)}</td>
                  <td className="px-4 py-2 text-right font-mono text-success">{formatCurrency(i.amountReceived)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${bal > 0 ? 'text-warning' : 'text-success'}`}>{formatCurrency(bal)}</td>
                  <td className="px-4 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-muted">{i.status}</span></td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteIncome(i.id); }}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </table>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Certificate' : 'New Certificate'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Project</Label>
              <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.status === 'Active').map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate No</Label><Input value={form.certificateNo} onChange={e => setForm({ ...form, certificateNo: e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Gross Amount</Label><Input type="number" value={form.grossAmount || ''} onChange={e => setForm({ ...form, grossAmount: Number(e.target.value) })} /></div>
              <div><Label>Retention %</Label><Input type="number" value={form.retentionPercent} onChange={e => setForm({ ...form, retentionPercent: Number(e.target.value) })} /></div>
            </div>
            {form.grossAmount > 0 && (
              <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between"><span>Gross Amount</span><span>{formatCurrency(form.grossAmount)}</span></div>
                <div className="flex justify-between"><span>+ VAT (16%)</span><span>{formatCurrency(calculateVAT(form.grossAmount))}</span></div>
                <div className="flex justify-between"><span>= Gross + VAT</span><span>{formatCurrency(form.grossAmount + calculateVAT(form.grossAmount))}</span></div>
                <div className="flex justify-between"><span>- Retention ({form.retentionPercent}%)</span><span>{formatCurrency(calculateRetention(form.grossAmount, form.retentionPercent))}</span></div>
                <div className="flex justify-between font-bold pt-1 border-t"><span>Net Payable</span><span>{formatCurrency(calculateNetPayable(form.grossAmount, form.retentionPercent))}</span></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount Received</Label><Input type="number" value={form.amountReceived || ''} onChange={e => setForm({ ...form, amountReceived: Number(e.target.value) })} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} /></div>
            </div>
            <div><Label>Payment Method</Label><Input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Bank Transfer, Cheque, etc." /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
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