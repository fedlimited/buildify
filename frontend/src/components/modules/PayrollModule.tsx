import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { WorkerCategory, Worker, PayrollRecord, PayrollEntry, PayrollAttendance } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Check, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { exportToCSV, flattenForExport } from '@/lib/export';





const DAYS: (keyof PayrollAttendance)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORY_COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#6b7280','#ef4444','#ec4899','#14b8a6','#f97316','#84cc16','#06b6d4','#a855f7','#e11d48','#0ea5e9','#22c55e','#eab308','#64748b'];

export function PayrollModule() {
  return (
    <div className="fade-in">
      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="payroll"><PayrollProcessing /></TabsContent>
        <TabsContent value="workers"><WorkerManagement /></TabsContent>
        <TabsContent value="categories"><CategoryManagement /></TabsContent>
        <TabsContent value="ledger"><PayrollLedger /></TabsContent>
      </Tabs>
    </div>
  );
}

function CategoryManagement() {
  const { workerCategories, addWorkerCategory, updateWorkerCategory, deleteWorkerCategory } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkerCategory | null>(null);
  const [form, setForm] = useState({ name: '', dayRate: 0, color: '#3b82f6', isActive: true });

  const openNew = () => { setEditing(null); setForm({ name: '', dayRate: 0, color: '#3b82f6', isActive: true }); setOpen(true); };
  const openEdit = (c: WorkerCategory) => { setEditing(c); setForm(c); setOpen(true); };
  const handleSave = () => {
    if (!form.name || !form.dayRate) return;
    if (editing) updateWorkerCategory({ ...editing, ...form });
    else addWorkerCategory(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{workerCategories.length} categories</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Category</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {workerCategories.map(c => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: c.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-card-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(c.dayRate)}/day</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteWorkerCategory(c.id); }}><Trash2 size={14} /></Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Category</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Day Rate (KES) *</Label><Input type="number" value={form.dayRate || ''} onChange={e => setForm({ ...form, dayRate: Number(e.target.value) })} /></div>
            <div>
              <Label className="text-xs">Color</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {CATEGORY_COLORS.map(c => (
                  <button key={c} className={`w-7 h-7 rounded-md border-2 transition-all ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} onClick={() => setForm({ ...form, color: c })} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkerManagement() {
  const { workers, workerCategories, projects, addWorker, updateWorker, deleteWorker } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', categoryId: 0, projectId: 0, dayRate: 0, isActive: true });

  const openNew = () => { setEditing(null); setForm({ name: '', phone: '', categoryId: 0, projectId: 0, dayRate: 0, isActive: true }); setOpen(true); };
  const openEdit = (w: Worker) => { setEditing(w); setForm(w); setOpen(true); };
  const handleCategoryChange = (catId: string) => {
    const cat = workerCategories.find(c => c.id === Number(catId));
    setForm({ ...form, categoryId: Number(catId), dayRate: cat?.dayRate || form.dayRate });
  };
  const handleSave = () => {
    if (!form.name || !form.phone || !form.categoryId || !form.projectId) return;
    if (editing) updateWorker({ ...editing, ...form });
    else addWorker(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{workers.filter(w => w.isActive).length} active workers</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Worker</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Name', 'Phone', 'Category', 'Project', 'Day Rate', ''].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {workers.filter(w => w.isActive).map(w => {
              const cat = workerCategories.find(c => c.id === w.categoryId);
              const proj = projects.find(p => p.id === w.projectId);
              return (
                <tr key={w.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 text-card-foreground font-medium">{w.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{w.phone}</td>
                  <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color }} />{cat?.name || '-'}</span></td>
                  <td className="px-4 py-2.5 text-xs">{proj?.name || '-'}</td>
                  <td className="px-4 py-2.5 font-mono">{formatCurrency(w.dayRate)}</td>
                  <td className="px-4 py-2.5"><div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(w)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteWorker(w.id); }}><Trash2 size={14} /></Button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Worker</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label className="text-xs">Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0712345678" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category *</Label>
                <Select value={form.categoryId?.toString() || ''} onValueChange={handleCategoryChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{workerCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{projects.filter(p => p.status === 'Active').map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Day Rate</Label><Input type="number" value={form.dayRate || ''} onChange={e => setForm({ ...form, dayRate: Number(e.target.value) })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PayrollProcessing() {
const { workers, workerCategories, projects, payrollRecords, selectedProjectId, addPayrollRecord, updatePayrollRecord, addExpense, fetchPayrollRecords } = useAppStore();


  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDates = (offset: number) => {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const weekNum = Math.ceil((((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
    return { start, end, weekNum, year: start.getFullYear() };
  };

  const { start: weekStart, end: weekEnd, weekNum, year } = getWeekDates(weekOffset);
  const projectId = selectedProjectId || projects[0]?.id || 0;
  const projectWorkers = workers.filter(w => w.isActive && w.projectId === projectId);

  const existingRecord = payrollRecords.find(r => r.weekNumber === weekNum && r.year === year && r.projectId === projectId);
  const [entries, setEntries] = useState<PayrollEntry[]>(() => {
    if (existingRecord) return existingRecord.entries;
    return projectWorkers.map(w => ({
      workerId: w.id, workerName: w.name, categoryId: w.categoryId, dayRate: w.dayRate,
      attendance: { sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false },
      daysWorked: 0, grossPay: 0
    }));
  });

  const toggleDay = (wi: number, day: keyof PayrollAttendance) => {
    if (existingRecord?.status !== 'Draft' && existingRecord) return;
    setEntries(prev => prev.map((e, i) => {
      if (i !== wi) return e;
      const att = { ...e.attendance, [day]: !e.attendance[day] };
      const dw = Object.values(att).filter(Boolean).length;
      return { ...e, attendance: att, daysWorked: dw, grossPay: dw * e.dayRate };
    }));
  };

  const totalGross = entries.reduce((s, e) => s + e.grossPay, 0);
  const totalDays = entries.reduce((s, e) => s + e.daysWorked, 0);

 



const handleSave = async () => {
  const proj = projects.find(p => p.id === projectId);
  const data = { weekNumber: weekNum, year, weekStart: weekStart.toISOString().split('T')[0], weekEnd: weekEnd.toISOString().split('T')[0], projectId, projectName: proj?.name || '', status: 'Draft' as const, entries, totalGrossPay: totalGross };
  
  try {
    if (existingRecord) {
      await updatePayrollRecord({ ...existingRecord, entries, totalGrossPay: totalGross });
    } else {
      await addPayrollRecord(data);
    }
    // Refresh payroll records after save
    await fetchPayrollRecords();
    alert('Payroll saved successfully');
  } catch (error) {
    console.error('Failed to save payroll:', error);
    alert('Error saving payroll. Please try again.');
  }
};





const handleApprove = async () => {
  if (!existingRecord) return;
  try {
    await updatePayrollRecord({ ...existingRecord, status: 'Approved', approvedAt: new Date().toISOString() });
    // Refresh payroll records to show updated status
    await fetchPayrollRecords();
    alert('Payroll approved successfully');
  } catch (error) {
    console.error('Failed to approve payroll:', error);
    alert('Error approving payroll. Please try again.');
  }
};

const handlePay = async () => {
  if (!existingRecord || existingRecord.status !== 'Approved') {
    alert('Cannot pay: Payroll record must be approved first');
    return;
  }
  
  const proj = projects.find(p => p.id === projectId);
  
  try {
    // Add expense for this payroll
    await addExpense({ 
      date: new Date().toISOString().split('T')[0], 
      projectId, 
      projectName: proj?.name || '', 
      category: 'Payroll', 
      description: `Week ${weekNum} payroll - ${proj?.name}`, 
      amount: existingRecord.totalGrossPay, 
      vat: 0, 
      paymentMethod: 'Bank Transfer', 
      status: 'Paid', 
      reference: `PR-W${weekNum}-${year}` 
    });
    
    // Mark payroll as paid
    await updatePayrollRecord({ ...existingRecord, status: 'Paid', paidAt: new Date().toISOString() });
    
    // Refresh payroll records to show updated status
    await fetchPayrollRecords();
    
    alert('Payroll marked as paid and expense created successfully');
  } catch (error) {
    console.error('Failed to process payroll payment:', error);
    alert('Error processing payment. Please try again.');
  }
};











  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={16} /></Button>
          <div className="text-sm font-medium text-card-foreground">
            Week {weekNum}, {year} <span className="text-muted-foreground font-normal">({weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {weekEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })})</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={16} /></Button>
        </div>
        {existingRecord && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${existingRecord.status === 'Paid' ? 'bg-success/10 text-success' : existingRecord.status === 'Approved' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>{existingRecord.status}</span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No workers assigned to this project. Add workers in the Workers tab.</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left">
              <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs">Worker</th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs">Category</th>
              {DAY_LABELS.map(d => <th key={d} className="px-2 py-2.5 font-medium text-muted-foreground text-xs text-center w-10">{d}</th>)}
              <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs text-center">Days</th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs text-right">Rate</th>
              <th className="px-3 py-2.5 font-medium text-muted-foreground text-xs text-right">Gross Pay</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry, i) => {
                const cat = workerCategories.find(c => c.id === entry.categoryId);
                return (
                  <tr key={entry.workerId} className="hover:bg-muted/50">
                    <td className="px-3 py-2 text-card-foreground font-medium text-xs">{entry.workerName}</td>
                    <td className="px-3 py-2"><span className="inline-flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color }} />{cat?.name}</span></td>
                    {DAYS.map(day => (
                      <td key={day} className="px-2 py-2 text-center">
                        <Checkbox checked={entry.attendance[day]} onCheckedChange={() => toggleDay(i, day)} disabled={existingRecord ? existingRecord.status !== 'Draft' : false} />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-mono text-xs">{entry.daysWorked}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(entry.dayRate)}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold">{formatCurrency(entry.grossPay)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={2} className="px-3 py-2.5 font-semibold text-xs">TOTALS</td>
                <td colSpan={7} />
                <td className="px-3 py-2.5 text-center font-mono font-semibold text-xs">{totalDays}</td>
                <td />
                <td className="px-3 py-2.5 text-right font-mono font-bold text-sm">{formatCurrency(totalGross)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {(!existingRecord || existingRecord.status === 'Draft') && entries.length > 0 && (
          <>
            <Button variant="outline" onClick={handleSave}>Save Draft</Button>
            {existingRecord && <Button onClick={handleApprove}><Check size={16} className="mr-1" />Approve</Button>}
          </>
        )}
        {existingRecord?.status === 'Approved' && (
          <Button onClick={handlePay}><DollarSign size={16} className="mr-1" />Mark as Paid</Button>
        )}
      </div>
    </div>
  );
}







function PayrollLedger() {
  const { payrollRecords, selectedProjectId, authUser, clearWorkersLedger } = useAppStore();
  const filtered = selectedProjectId ? payrollRecords.filter(r => r.projectId === selectedProjectId) : payrollRecords;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filtered.length} payroll records</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(flattenForExport(filtered as unknown as Record<string, unknown>[], ['entries']), 'payroll_ledger')}>Export CSV</Button>
          {authUser?.role === 'admin' && (



<Button
  variant="destructive"
  size="sm"
  onClick={() => {
    if (confirm('WARNING: This will permanently delete ALL PAYROLL RECORDS (Ledger). Workers will NOT be deleted. This action cannot be undone. Continue?')) {
      clearWorkersLedger();
    }
  }}
>
  Clear Payroll Ledger
</Button>








          )}
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Week', 'Period', 'Project', 'Workers', 'Total Days', 'Gross Pay', 'Status'].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
           </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.sort((a, b) => b.year - a.year || b.weekNumber - a.weekNumber).map(r => {
              // Safe calculation with fallbacks
              const totalDays = r.entries?.reduce((sum, e) => sum + (e.daysWorked || e.days_worked || 0), 0) || 0;
              const totalGrossPay = r.totalGrossPay || 0;
              
              return (
                <tr key={r.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 font-mono text-xs">W{r.weekNumber}/{r.year}</td>
                  <td className="px-4 py-2.5 text-xs">{formatDate(r.weekStart)} - {formatDate(r.weekEnd)}</td>
                  <td className="px-4 py-2.5 text-card-foreground">{r.projectName}</td>
                  <td className="px-4 py-2.5 text-center">{r.entries?.length || 0}</td>
                  <td className="px-4 py-2.5 text-center font-mono">{totalDays}</td>
                  <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(totalGrossPay)}</td>
                  <td className="px-4 py-2.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'Paid' ? 'bg-success/10 text-success' : r.status === 'Approved' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'}`}>{r.status}</span></td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payroll records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}