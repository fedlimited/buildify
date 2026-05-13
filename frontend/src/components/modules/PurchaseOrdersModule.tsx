import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { PurchaseOrder } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const emptyOrder: Omit<PurchaseOrder, 'id' | 'createdAt'> = {
  orderNumber: '',
  supplierId: 0,
  supplierName: '',
  projectId: 0,
  projectName: '',
  orderDate: new Date().toISOString().split('T')[0],
  expectedDate: '',
  items: [],
  subtotal: 0,
  vat: 0,
  total: 0,
  status: 'Ordered',
  paymentStatus: 'Unpaid',
  notes: ''
};

export function PurchaseOrdersModule() {
  const { purchaseOrders, projects, suppliers, selectedProjectId, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, fetchPurchaseOrders } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState(emptyOrder);
  const [items, setItems] = useState<{ description: string; quantity: number; unit: string; unitPrice: number; total: number }[]>([]);

  const filtered = selectedProjectId ? purchaseOrders.filter(po => po.projectId === selectedProjectId) : purchaseOrders;

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyOrder, projectId: selectedProjectId || 0 });
    setItems([]);
    setOpen(true);
  };

  const openEdit = (order: PurchaseOrder) => {
    setEditing(order);
    setForm(order);
    setItems(order.items || []);
    setOpen(true);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'pcs', unitPrice: 0, total: 0 }]);
  };

  const updateItem = (idx: number, field: string, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : item.quantity;
        const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
        updated.total = qty * price;
      }
      return updated;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vat = subtotal * 0.16;
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const handleSave = async () => {
    if (!form.supplierId || !form.projectId || items.length === 0) {
      alert('Please fill in all required fields and add at least one item');
      return;
    }

    const { subtotal, vat, total } = calculateTotals();
    const orderData = {
      ...form,
      items,
      subtotal,
      vat,
      total
    };

    try {
      if (editing) {
        await updatePurchaseOrder({ ...editing, ...orderData });
      } else {
        await addPurchaseOrder(orderData);
      }
      await fetchPurchaseOrders();
      setOpen(false);
      setEditing(null);
      setForm(emptyOrder);
      setItems([]);
    } catch (error) {
      console.error('Failed to save purchase order:', error);
      alert('Failed to save purchase order');
    }
  };

  const handleStatusUpdate = async (order: PurchaseOrder, newStatus: string, newPaymentStatus?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus || order.status,
          payment_status: newPaymentStatus || order.paymentStatus
        })
      });
      
      if (response.ok) {
        await fetchPurchaseOrders();
        alert(`Purchase order marked as ${newStatus || newPaymentStatus}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this purchase order? This action cannot be undone.')) {
      try {
        await deletePurchaseOrder(id);
        await fetchPurchaseOrders();
        alert('Purchase order deleted successfully');
      } catch (error) {
        console.error('Failed to delete purchase order:', error);
        alert('Failed to delete purchase order');
      }
    }
  };

  const handleClearAllOrders = async () => {
    if (confirm('WARNING: This will permanently delete ALL purchase orders. This action cannot be undone. Continue?')) {
      const token = localStorage.getItem('token');
      for (const order of purchaseOrders) {
        await fetch(`${API_BASE_URL}/purchase-orders/${order.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      await fetchPurchaseOrders();
      alert('All purchase orders cleared');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ordered': return 'bg-yellow-500/10 text-yellow-600';
      case 'Supplied': return 'bg-green-500/10 text-green-600';
      case 'Paid': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} purchase orders</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPurchaseOrders()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAllOrders}>
            Clear All Orders
          </Button>
          <Button onClick={openNew} size="sm"><Plus size={16} className="mr-1" />Add Purchase Order</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {['PO #', 'Supplier', 'Project', 'Order Date', 'Total', 'Status', 'Payment', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-2.5">{order.supplierName}</td>
                <td className="px-4 py-2.5 text-xs">{order.projectName}</td>
                <td className="px-4 py-2.5 text-xs">{formatDate(order.orderDate)}</td>
                <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(order.total)}</td>
                <td className="px-4 py-2.5">
                  <Select value={order.status} onValueChange={(v) => handleStatusUpdate(order, v, undefined)}>
                    <SelectTrigger className={`w-28 text-xs ${getStatusColor(order.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ordered">Ordered</SelectItem>
                      <SelectItem value="Supplied">Supplied</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2.5">
                  <Select value={order.paymentStatus} onValueChange={(v) => handleStatusUpdate(order, undefined, v)}>
                    <SelectTrigger className={`w-24 text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(order)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(order.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No purchase orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Purchase Order' : 'New Purchase Order'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Order Number *</Label><Input value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} /></div>
              <div><Label className="text-xs">Order Date *</Label><Input type="date" value={form.orderDate} onChange={e => setForm({ ...form, orderDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Supplier *</Label>
                <Select value={form.supplierId?.toString() || ''} onValueChange={v => {
                  const supplier = suppliers.find(s => s.id === Number(v));
                  setForm({ ...form, supplierId: Number(v), supplierName: supplier?.name || '' });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => {
                  const project = projects.find(p => p.id === Number(v));
                  setForm({ ...form, projectId: Number(v), projectName: project?.name || '' });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Expected Delivery Date</Label><Input type="date" value={form.expectedDate} onChange={e => setForm({ ...form, expectedDate: e.target.value })} /></div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold">Items</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus size={14} className="mr-1" />Add Item</Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-2 rounded-lg">
                  <div className="col-span-4"><Input placeholder="Description" className="text-xs" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" className="text-xs" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} /></div>
                  <div className="col-span-1"><Input placeholder="Unit" className="text-xs" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Unit Price" className="text-xs" value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} /></div>
                  <div className="col-span-2 text-xs font-mono text-right pt-2">{formatCurrency(item.total || 0)}</div>
                  <div className="col-span-1"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}><Trash2 size={14} /></Button></div>
                </div>
              ))}
              {items.length > 0 && (
                <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatCurrency(calculateTotals().subtotal)}</span></div>
                  <div className="flex justify-between"><span>VAT (16%)</span><span className="font-mono">{formatCurrency(calculateTotals().vat)}</span></div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Total</span><span className="font-mono">{formatCurrency(calculateTotals().total)}</span></div>
                </div>
              )}
            </div>
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