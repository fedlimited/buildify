import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Subcontractor, SubcontractorQuotation } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PaymentsTab } from './PaymentsTab';

export function SubcontractorsModule() {
  return (
    <div className="fade-in">
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Subcontractors</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="payments">Payments & Balances</TabsTrigger>
        </TabsList>
        <TabsContent value="list"><SubcontractorsList /></TabsContent>
        <TabsContent value="quotations"><QuotationsTab /></TabsContent>
        <TabsContent value="payments"><PaymentsTab /></TabsContent>
      </Tabs>
    </div>
  );
}





const emptySub = { name: '', phone: '', email: '', kraPin: '', specialization: '', address: '', contactPerson: '', isActive: true };

function SubcontractorsList() {
  const { subcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subcontractor | null>(null);
  const [form, setForm] = useState(emptySub);

  const openNew = () => { setEditing(null); setForm({ ...emptySub }); setOpen(true); };
  const openEdit = (s: Subcontractor) => { setEditing(s); setForm(s); setOpen(true); };
  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editing) updateSubcontractor({ ...editing, ...form });
    else addSubcontractor(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{subcontractors.length} subcontractors</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Subcontractor</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Name</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Specialization</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Phone</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Contact Person</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs">KRA PIN</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs"></th>
             </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subcontractors.map(s => (
              <tr key={s.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 font-medium">{s.name}</td>
                <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-muted">{s.specialization || '-'}</span></td>
                <td className="px-4 py-2.5 text-xs">{s.phone}</td>
                <td className="px-4 py-2.5 text-xs">{s.contactPerson || '-'}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{s.kraPin || '-'}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteSubcontractor(s.id); }}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {subcontractors.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No subcontractors</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Subcontractor</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Specialization</Label><Input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
              <div><Label className="text-xs">KRA PIN</Label><Input value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label className="text-xs">Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}















function QuotationsTab() {
  const { quotations, subcontractors, projects, selectedProjectId, addQuotation, updateQuotation, deleteQuotation, fetchQuotations } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<number>(0);
  const [selectedProjId, setSelectedProjId] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    console.log('Fetching quotations...');
    fetchQuotations();
  }, []);

  // Debug: Log projects when they change
  useEffect(() => {
    console.log('Projects in store:', projects);
    console.log('Subcontractors in store:', subcontractors);
  }, [projects, subcontractors]);

  const filtered = selectedProjectId ? quotations.filter(q => q.project_id === selectedProjectId) : quotations;

  const resetForm = () => {
    setSelectedSubId(0);
    setSelectedProjId(0);
    setDescription('');
    setAmount(0);
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Pending');
    setNotes('');
    setEditingId(null);
  };

  const openNew = () => {
    console.log('Opening new quotation form');
    resetForm();
    setOpen(true);
  };

  const openEdit = (q: any) => {
    console.log('Editing quotation:', q);
    setEditingId(q.id);
    setSelectedSubId(q.subcontractor_id);
    setSelectedProjId(q.project_id);
    setDescription(q.description || '');
    setAmount(q.amount);
    setDate(q.date);
    setStatus(q.status);
    setNotes(q.notes || '');
    setOpen(true);
  };

  const handleSubChange = (value: string) => {
    const id = Number(value);
    console.log('Subcontractor selected - raw value:', value, 'converted to ID:', id);
    setSelectedSubId(id);
  };

  const handleProjectChange = (value: string) => {
    const id = Number(value);
    console.log('Project selected - raw value:', value, 'converted to ID:', id);
    setSelectedProjId(id);
  };

  const handleSave = async () => {
    console.log('=== SAVING QUOTATION ===');
    console.log('selectedSubId:', selectedSubId);
    console.log('selectedProjId:', selectedProjId);
    console.log('amount:', amount);
    
    if (selectedSubId === 0) { 
      alert('Please select a subcontractor'); 
      return; 
    }
    if (selectedProjId === 0) { 
      alert('Please select a project'); 
      return; 
    }
    if (amount <= 0) { 
      alert('Please enter a valid amount'); 
      return; 
    }

    const sub = subcontractors?.find(s => s.id === selectedSubId);
    const proj = projects?.find(p => p.id === selectedProjId);
    
    console.log('Found subcontractor:', sub);
    console.log('Found project:', proj);

    const data = {
      subcontractor_id: selectedSubId,
      subcontractor_name: sub?.name || '',
      project_id: selectedProjId,
      project_name: proj?.name || '',
      description,
      amount,
      date,
      status,
      notes
    };

    console.log('Final data to save:', data);
    setLoading(true);
    
    try {
      let result;
      if (editingId) {
        console.log('Updating quotation ID:', editingId);
        result = await updateQuotation(editingId, data);
      } else {
        console.log('Creating new quotation');
        result = await addQuotation(data);
      }
      console.log('Save result:', result);
      await fetchQuotations();
      setOpen(false);
      resetForm();
      alert(editingId ? 'Quotation updated!' : 'Quotation added!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save quotation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this quotation?')) {
      try {
        await deleteQuotation(id);
        await fetchQuotations();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const getStatusBadge = (s: string) => {
    if (s === 'Accepted') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Accepted</span>;
    if (s === 'Rejected') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">Rejected</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filtered.length} quotations</p>
        <Button size="sm" onClick={openNew} disabled={loading}>
          <Plus size={16} className="mr-1" /> Add Quotation
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No quotations found</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Subcontractor</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Project</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Amount</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-xs"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(q => (
                <tr key={q.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 text-xs">{formatDate(q.date)}</td>
                  <td className="px-4 py-2.5 font-medium">{q.subcontractor_name}</td>
                  <td className="px-4 py-2.5">{q.project_name}</td>
                  <td className="px-4 py-2.5 truncate max-w-[200px]">{q.description || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(q.amount)}</td>
                  <td className="px-4 py-2.5">{getStatusBadge(q.status)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(q)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(q.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Subcontractor *</Label>
                <Select value={selectedSubId === 0 ? '' : selectedSubId.toString()} onValueChange={handleSubChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcontractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontractors?.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Project *</Label>
                <Select value={selectedProjId === 0 ? '' : selectedProjId.toString()} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.filter(p => p.status === 'Active').map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Work description" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount (KES) *</Label>
                <Input 
                  type="number" 
                  value={amount || ''} 
                  onChange={e => setAmount(Number(e.target.value))} 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Additional notes..." 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


