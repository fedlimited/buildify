import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const categories: Expense['category'][] = ['Subcontractor', 'Supplier', 'Payroll', 'Equipment', 'Transport', 'Other'];

const emptyExpense: Omit<Expense, 'id' | 'createdAt'> = {
  date: new Date().toISOString().split('T')[0], 
  projectId: 0, 
  projectName: '', 
  category: 'Other', 
  description: '', 
  amount: 0, 
  vat: 0, 
  paymentMethod: '', 
  status: 'Paid', 
  reference: ''
};

export function ExpensesModule() {
  const { expenses, projects, subcontractors, selectedProjectId, addExpense, updateExpense, deleteExpense, fetchExpenses } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyExpense);
  const [isLoading, setIsLoading] = useState(false);  // ADD THIS LINE

  const filtered = selectedProjectId ? expenses.filter(e => e.projectId === selectedProjectId) : expenses;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const openNew = () => { 
    setEditing(null); 
    setForm({ ...emptyExpense, projectId: selectedProjectId || 0 }); 
    setOpen(true); 
  };
  
  const openEdit = (e: Expense) => { 
    setEditing(e); 
    setForm({ 
      ...e,
      projectId: e.projectId,
      projectName: e.projectName
    }); 
    setOpen(true); 
  };

  const handleSave = async () => {
    if (!form.projectId || !form.description || !form.amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      if (editing) {
        await updateExpense({ ...editing, ...form });
      } else {
        await addExpense(form);
      }
      await fetchExpenses();
      setOpen(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this expense? This action cannot be undone.')) {
      try {
        await deleteExpense(id);
        await fetchExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filtered.length} expense{filtered.length !== 1 ? 's' : ''} · Total: <span className="font-semibold text-card-foreground">{formatCurrency(total)}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchExpenses()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={openNew} size="sm"><Plus size={16} className="mr-1" />Add Expense</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['Date', 'Project', 'Category', 'Description', 'Amount', 'VAT', 'Total', 'Method', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2.5">{formatDate(e.date)}</td>
                <td className="px-4 py-2.5 text-card-foreground">{e.projectName || '-'}</td>
                <td className="px-4 py-2.5"><span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">{e.category}</span></td>
                <td className="px-4 py-2.5 text-card-foreground max-w-[200px] truncate">{e.description}</td>
                <td className="px-4 py-2.5 font-mono text-right">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-2.5 font-mono text-right text-muted-foreground">{formatCurrency(e.vat)}</td>
                <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(e.amount + e.vat)}</td>
                <td className="px-4 py-2.5 text-xs">{e.paymentMethod || '-'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    e.status === 'Paid' ? 'bg-success/10 text-success' :
                    e.status === 'Pending' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>{e.status}</span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(e.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No expenses found</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Expense' : 'New Expense'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => {
                  const selectedProject = projects.find(p => p.id === Number(v));
                  setForm({ 
                    ...form, 
                    projectId: Number(v),
                    projectName: selectedProject?.name || ''
                  });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as Expense['category'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {form.category === 'Subcontractor' && subcontractors.length > 0 && (
              <div>
                <Label className="text-xs">Subcontractor</Label>
                <Select value={form.subcontractorId?.toString() || ''} onValueChange={v => setForm({ ...form, subcontractorId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select subcontractor" /></SelectTrigger>
                  <SelectContent>{subcontractors.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><Label className="text-xs">Description *</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Amount (KES) *</Label><Input type="number" value={form.amount || ''} onChange={e => { const a = Number(e.target.value); setForm({ ...form, amount: a, vat: a * 0.16 }); }} /></div>
              <div><Label className="text-xs">VAT</Label><Input type="number" value={form.vat || ''} onChange={e => setForm({ ...form, vat: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Payment Method</Label><Input value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} placeholder="Bank Transfer, M-Pesa, etc." /></div>
              <div><Label className="text-xs">Reference</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Invoice/receipt no." /></div>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Expense['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Pending', 'Paid', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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