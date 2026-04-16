import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Eye, RefreshCw, FileText } from 'lucide-react';
alert('🔥 FILE IS LOADING - CHECKING IF THIS ALERT APPEARS 🔥');

export function QuotationsModule() {
  const { 
    quotations, 
    addQuotation, 
    updateQuotation, 
    deleteQuotation, 
    fetchQuotations, 
    fetchSubcontractors, 
    fetchProjects,
    fetchExpenses 
  } = useAppStore();
  
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Form state
  const [subcontractorId, setSubcontractorId] = useState('');
  const [subcontractorName, setSubcontractorName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  
  // Get data from store
  const subcontractors = useAppStore((state) => state.subcontractors);
  const projects = useAppStore((state) => state.projects);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchQuotations(),
        fetchSubcontractors(),
        fetchProjects(),
        fetchExpenses()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = (quotations || []).filter(q => {
    if (selectedStatus === 'all') return true;
    return q.status === selectedStatus;
  });

  const totalAmount = filteredQuotations.reduce((sum, q) => sum + (q.amount || 0), 0);
  const pendingAmount = filteredQuotations.filter(q => q.status === 'Pending').reduce((sum, q) => sum + (q.amount || 0), 0);
  const approvedAmount = filteredQuotations.filter(q => q.status === 'Approved').reduce((sum, q) => sum + (q.amount || 0), 0);
  const paidAmount = filteredQuotations.filter(q => q.status === 'Paid').reduce((sum, q) => sum + (q.amount || 0), 0);

  const resetForm = () => {
    setSubcontractorId('');
    setSubcontractorName('');
    setProjectId('');
    setProjectName('');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Pending');
    setNotes('');
    setEditing(null);
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (quotation: any) => {
    setEditing(quotation);
    setSubcontractorId(quotation.subcontractor_id?.toString() || '');
    setSubcontractorName(quotation.subcontractor_name || '');
    setProjectId(quotation.project_id?.toString() || '');
    setProjectName(quotation.project_name || '');
    setDescription(quotation.description || '');
    setAmount(quotation.amount?.toString() || '');
    setDate(quotation.date);
    setStatus(quotation.status);
    setNotes(quotation.notes || '');
    setOpen(true);
  };

  const openView = (quotation: any) => {
    setViewing(quotation);
    setViewOpen(true);
  };

  const handleSave = async () => {
    console.log('=== HANDLE SAVE CALLED ===');
    console.log('Subcontractor ID:', subcontractorId);
    console.log('Project ID:', projectId);
    console.log('Amount:', amount);
    
    if (!subcontractorId) {
      alert('Please select a subcontractor');
      return;
    }
    if (!projectId) {
      alert('Please select a project');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const data = {
      subcontractor_id: Number(subcontractorId),
      subcontractor_name: subcontractorName,
      project_id: Number(projectId),
      project_name: projectName,
      description: description,
      amount: Number(amount),
      date: date,
      status: status,
      notes: notes
    };
    
    console.log('Data to save:', data);
    setLoading(true);
    
    try {
      let result;
      if (editing) {
        result = await updateQuotation(editing.id, data);
      } else {
        result = await addQuotation(data);
      }
      
      // Refresh all data
      await Promise.all([
        fetchQuotations(),
        fetchExpenses(),
        fetchSubcontractors()
      ]);
      
      setOpen(false);
      resetForm();
      alert(editing ? 'Quotation updated!' : 'Quotation added!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save quotation: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this quotation?')) {
      try {
        await deleteQuotation(id);
        await Promise.all([
          fetchQuotations(),
          fetchExpenses()
        ]);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'Approved': return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'Rejected': return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'Paid': return <Badge className="bg-blue-500 text-white">Paid</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const renderSubcontractorSelect = () => (
    <select 
      className="w-full border rounded-md px-3 py-2 text-sm"
      value={subcontractorId}
      onChange={(e) => {
        const id = e.target.value;
        const sub = subcontractors?.find(s => s.id === Number(id));
        setSubcontractorId(id);
        setSubcontractorName(sub?.name || '');
      }}
    >
      <option value="">Select subcontractor...</option>
      {subcontractors?.map(sub => (
        <option key={sub.id} value={sub.id}>
          {sub.name}
        </option>
      ))}
    </select>
  );

  const renderProjectSelect = () => (
    <select 
      className="w-full border rounded-md px-3 py-2 text-sm"
      value={projectId}
      onChange={(e) => {
        const id = e.target.value;
        const proj = projects?.find(p => p.id === Number(id));
        setProjectId(id);
        setProjectName(proj?.name || '');
      }}
    >
      <option value="">Select project...</option>
      {projects?.filter(p => p.status === 'Active').map(proj => (
        <option key={proj.id} value={proj.id}>
          {proj.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - 🔥🔥🔥 TEST - SUBCONTRACTOR QUOTATIONS 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥 🔥🔥🔥</h1>
          <p className="text-sm text-muted-foreground">Manage subcontractor quotes and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button onClick={openNew} size="sm">
            <Plus size={16} className="mr-1" /> New Quotation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{filteredQuotations.length}</p><p className="text-xs">{formatCurrency(totalAmount)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-yellow-600">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(approvedAmount)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-600">Paid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-blue-600">{formatCurrency(paidAmount)}</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quotations" className="w-full">
        <TabsList>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="payments">Payments & Balances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quotations" className="space-y-4">
          {/* Filter Tabs */}
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Approved">Approved</TabsTrigger>
              <TabsTrigger value="Paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quotations List */}
          <div className="space-y-3">
            {filteredQuotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No quotations found</div>
            ) : (
              filteredQuotations.map(q => (
                <Card key={q.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <FileText size={16} />
                          <span className="font-semibold">{q.subcontractor_name}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm">{q.project_name}</span>
                          {getStatusBadge(q.status)}
                        </div>
                        <p className="text-sm mb-2">{q.description || 'No description'}</p>
                        <div className="flex gap-4">
                          <span className="font-bold">{formatCurrency(q.amount)}</span>
                          <span className="text-sm text-muted-foreground">{formatDate(q.date)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openView(q)}><Eye size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(q)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="text-red-600"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentsTab />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Quotation' : 'New Quotation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Subcontractor *</Label>
              {renderSubcontractorSelect()}
            </div>
            
            <div>
              <Label className="text-sm">Project *</Label>
              {renderProjectSelect()}
            </div>
            
            <div>
              <Label className="text-sm">Amount (KES) *</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
              />
            </div>
            
            <div>
              <Label className="text-sm">Date</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
            </div>
            
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Work description"
                rows={2}
              />
            </div>
            
            <div>
              <Label className="text-sm">Status</Label>
              <select 
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            
            <div>
              <Label className="text-sm">Notes</Label>
              <Input 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Additional notes..." 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : (editing ? 'Update' : 'Save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Quotation Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2">
              <p><strong>Subcontractor:</strong> {viewing.subcontractor_name}</p>
              <p><strong>Project:</strong> {viewing.project_name}</p>
              <p><strong>Amount:</strong> {formatCurrency(viewing.amount)}</p>
              <p><strong>Date:</strong> {formatDate(viewing.date)}</p>
              <p><strong>Status:</strong> {getStatusBadge(viewing.status)}</p>
              {viewing.description && <p><strong>Description:</strong> {viewing.description}</p>}
              {viewing.notes && <p><strong>Notes:</strong> {viewing.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





function PaymentsTab() {
  // Temporary test - show red box
  return (
    <div className="bg-red-500 text-white p-8 text-center rounded-lg font-bold text-xl">
      🔥 PAYMENTS TAB IS WORKING! 🔥
      <p className="text-sm mt-2 text-white">If you see this, the component is loading correctly.</p>
    </div>
  );
} 
// ============================================ 
// ?????? THIS IS THE CORRECT FILE - TEST MARKER ?????? 
// ============================================ 
