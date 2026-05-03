import { API_BASE_URL } from '@/config/api';
import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { ApprovedItem, Supplier, PurchaseOrder, Supply, OrderItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Eye, Package, Truck, Printer } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

export function ProcurementModule() {
  return (
    <div className="fade-in">
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="supplies">Supplies</TabsTrigger>
          <TabsTrigger value="items">Approved Items</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        <TabsContent value="orders"><PurchaseOrdersTab /></TabsContent>
        <TabsContent value="supplies"><SuppliesTab /></TabsContent>
        <TabsContent value="items"><ApprovedItemsTab /></TabsContent>
        <TabsContent value="suppliers"><SuppliersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ApprovedItemsTab() {
  const { approvedItems, addApprovedItem, updateApprovedItem, deleteApprovedItem } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApprovedItem | null>(null);
  const [form, setForm] = useState({ name: '', category: '', unit: 'piece', defaultPrice: 0, description: '', isActive: true });
  const units = ['bag', 'piece', 'tonne', 'm', 'roll', 'bucket', 'litre', 'kg', 'set', 'trip'];

  const openNew = () => { setEditing(null); setForm({ name: '', category: '', unit: 'piece', defaultPrice: 0, description: '', isActive: true }); setOpen(true); };
  const openEdit = (i: ApprovedItem) => { setEditing(i); setForm(i); setOpen(true); };
  const handleSave = () => {
    if (!form.name || !form.category) return;
    if (editing) updateApprovedItem({ ...editing, ...form });
    else addApprovedItem(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{approvedItems.length} items</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Item</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Item Name', 'Category', 'Unit', 'Default Price', ''].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {approvedItems.map(i => (
              <tr key={i.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-card-foreground font-medium">{i.name}</td>
                <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-muted">{i.category}</span></td>
                <td className="px-4 py-2.5 text-xs">{i.unit}</td>
                <td className="px-4 py-2.5 font-mono text-right">{formatCurrency(i.defaultPrice)}</td>
                <td className="px-4 py-2.5"><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteApprovedItem(i.id); }}><Trash2 size={14} /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Approved Item</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Category *</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label className="text-xs">Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Default Price (KES)</Label><Input type="number" value={form.defaultPrice || ''} onChange={e => setForm({ ...form, defaultPrice: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SuppliersTab() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', kraPin: '', phone: '', email: '', address: '', contactPerson: '', paymentTerms: '30 days', isActive: true });

  const openNew = () => { setEditing(null); setForm({ name: '', kraPin: '', phone: '', email: '', address: '', contactPerson: '', paymentTerms: '30 days', isActive: true }); setOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setOpen(true); };
  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editing) updateSupplier({ ...editing, ...form });
    else addSupplier(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{suppliers.length} suppliers</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Supplier</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Name', 'KRA PIN', 'Phone', 'Contact Person', 'Terms', ''].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-card-foreground font-medium">{s.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{s.kraPin || '-'}</td>
                <td className="px-4 py-2.5 text-xs">{s.phone}</td>
                <td className="px-4 py-2.5 text-xs">{s.contactPerson || '-'}</td>
                <td className="px-4 py-2.5 text-xs">{s.paymentTerms}</td>
                <td className="px-4 py-2.5"><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteSupplier(s.id); }}><Trash2 size={14} /></Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Supplier</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">KRA PIN</Label><Input value={form.kraPin} onChange={e => setForm({ ...form, kraPin: e.target.value })} /></div>
              <div><Label className="text-xs">Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label className="text-xs">Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label className="text-xs">Payment Terms</Label><Input value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}









function PurchaseOrdersTab() {
  const { 
    purchaseOrders, suppliers, projects, approvedItems, selectedProjectId, 
    addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, 
    addSupply, addStoreTransaction, addExpense, 
    fetchPurchaseOrders, fetchSupplies, fetchStoreTransactions, fetchExpenses,
    authUser, clearPurchaseOrders, companySettings
  } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState({ supplierId: 0, projectId: 0, expectedDate: '', notes: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const filtered = selectedProjectId ? purchaseOrders.filter(o => o.projectId === selectedProjectId) : purchaseOrders;

  const addOrderItem = () => {
    setOrderItems([...orderItems, { itemId: 0, itemName: '', unit: '', quantity: 0, unitPrice: 0, amount: 0, receivedQuantity: 0 }]);
  };

  const updateOrderItem = (index: number, field: string, value: unknown) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'itemId') {
        const ai = approvedItems.find(a => a.id === Number(value));
        if (ai) {
          updated.itemName = ai.name;
          updated.unit = ai.unit;
          updated.unitPrice = ai.defaultPrice;
          updated.amount = (updated.quantity || 0) * ai.defaultPrice;
        }
      }
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : updated.quantity;
        const price = field === 'unitPrice' ? Number(value) : updated.unitPrice;
        updated.amount = qty * price;
      }
      return updated;
    }));
  };

  const openNew = () => {
    setEditingOrder(null);
    setForm({ supplierId: 0, projectId: selectedProjectId || 0, expectedDate: '', notes: '' });
    setOrderItems([]);
    setOpen(true);
  };

  const openEdit = (order: PurchaseOrder) => {
    if (order.status !== 'Ordered') {
      alert('Only orders with "Ordered" status can be edited');
      return;
    }
    setEditingOrder(order);
    setForm({
      supplierId: order.supplierId,
      projectId: order.projectId,
      expectedDate: order.expectedDate,
      notes: order.notes
    });
    setOrderItems([...order.items]);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.supplierId || !form.projectId || orderItems.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }
    
    const supplier = suppliers.find(s => s.id === form.supplierId);
    const project = projects.find(p => p.id === form.projectId);
    const subtotal = orderItems.reduce((s, i) => s + i.amount, 0);
    const vat = subtotal * 0.16;
    
    try {
      if (editingOrder) {
        await updatePurchaseOrder({
          ...editingOrder,
          supplierId: form.supplierId,
          supplierName: supplier?.name || '',
          projectId: form.projectId,
          projectName: project?.name || '',
          expectedDate: form.expectedDate,
          items: orderItems,
          subtotal,
          vat,
          total: subtotal + vat,
          notes: form.notes
        });
      } else {
        const yr = new Date().getFullYear();
        const num = purchaseOrders.length + 1;
        await addPurchaseOrder({
          orderNumber: `PO-${yr}-${String(num).padStart(4, '0')}`,
          supplierId: form.supplierId,
          supplierName: supplier?.name || '',
          projectId: form.projectId,
          projectName: project?.name || '',
          orderDate: new Date().toISOString().split('T')[0],
          expectedDate: form.expectedDate,
          items: orderItems,
          subtotal,
          vat,
          total: subtotal + vat,
          status: 'Ordered',
          paymentStatus: 'Unpaid',
          notes: form.notes
        });
      }
      await fetchPurchaseOrders();
      setOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('Failed to save purchase order');
    }
  };

  const handleDeleteOrder = async (order: PurchaseOrder) => {
    if (order.status !== 'Ordered') {
      alert('Only orders with "Ordered" status can be deleted');
      return;
    }
    if (confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) {
      try {
        await deletePurchaseOrder(order.id);
        await fetchPurchaseOrders();
        alert('Order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };




  const markSupplied = async (order: PurchaseOrder) => {
    if (order.status === 'Supplied') {
      alert('Order is already marked as supplied');
      return;
    }
    
    if (!confirm(`Mark order ${order.orderNumber} as SUPPLIED? This will create supply records and store transactions.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Supplied',
          payment_status: order.paymentStatus
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      
      await fetchPurchaseOrders();
      await fetchSupplies();
      await fetchStoreTransactions();
      
      alert(`Order ${order.orderNumber} marked as SUPPLIED. Supply records and store transactions created.`);
    } catch (error) {
      console.error('Error marking order as supplied:', error);
      alert('Failed to mark order as supplied. Please try again.');
    }
  };





const printPurchaseOrder = (order) => {
  const printWindow = window.open('', '_blank');
  
  // Use companySettings from the store
  let companyName = companySettings?.name || 'Construction Company';
  let companyLogo = companySettings?.logoUrl || '';
  let companyAddress = companySettings?.address || '';
  let companyPhone = companySettings?.phone || '';
  let companyEmail = companySettings?.email || '';
  let kraPin = companySettings?.kraPin || '';
  
  console.log('Company settings for PO:', { companyName, companyLogo, companyAddress });
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.itemName || item.description || '-'}</td>
      <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity || 0}</td>
      <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${item.unit || '-'}</td>
      <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(item.unitPrice || 0)}</td>
      <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(item.total || item.amount || 0)}</td>
    </table>
  `).join('');
  
  const logoHtml = companyLogo 
    ? `<img src="${companyLogo}" style="max-height: 60px; max-width: 200px; object-fit: contain;" onerror="this.style.display='none'" />` 
    : `<div class="company-name">${companyName}</div>`;
  
  const addressHtml = companyAddress ? `<div class="company-address">${companyAddress}</div>` : '';
  const phoneHtml = companyPhone ? `<div class="company-phone">Tel: ${companyPhone}</div>` : '';
  const emailHtml = companyEmail ? `<div class="company-email">Email: ${companyEmail}</div>` : '';
  const kraHtml = kraPin ? `<div class="company-kra">KRA PIN: ${kraPin}</div>` : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order - ${order.orderNumber}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          padding: 40px;
          margin: 0;
          color: #1a202c;
          background: white;
        }
        .print-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .header {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1a365d;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        .logo-section {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1a365d;
        }
        .company-address, .company-phone, .company-email, .company-kra {
          font-size: 11px;
          color: #4a5568;
          margin-top: 4px;
        }
        .po-title-section {
          text-align: right;
        }
        .po-title {
          font-size: 28px;
          font-weight: bold;
          color: #1a365d;
          letter-spacing: 2px;
        }
        .po-number {
          font-size: 14px;
          color: #4a5568;
          margin-top: 5px;
          font-family: monospace;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .info-box {
          flex: 1;
          padding: 12px 15px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .info-label {
          font-weight: bold;
          font-size: 11px;
          color: #4a5568;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 500;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background: #f7fafc;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
        }
        .items-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .totals {
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        .total-line {
          margin: 5px 0;
          font-size: 13px;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #1a365d;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #1a365d;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #a0aec0;
          border-top: 1px solid #e2e8f0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
        }
        .status-ordered { background: #fef3c7; color: #d97706; }
        .status-supplied { background: #d1fae5; color: #059669; }
        .status-paid { background: #dbeafe; color: #2563eb; }
        .notes-section {
          margin-top: 20px;
          padding: 12px;
          background: #f7fafc;
          border-radius: 8px;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="header">
          <div class="logo-section">
            ${logoHtml}
            ${addressHtml}
            ${phoneHtml}
            ${emailHtml}
            ${kraHtml}
          </div>
          <div class="po-title-section">
            <div class="po-title">PURCHASE ORDER</div>
            <div class="po-number">${order.orderNumber}</div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <div class="info-label">SUPPLIER</div>
            <div class="info-value">${order.supplierName}</div>
          </div>
          <div class="info-box">
            <div class="info-label">PROJECT</div>
            <div class="info-value">${order.projectName}</div>
          </div>
          <div class="info-box">
            <div class="info-label">ORDER DATE</div>
            <div class="info-value">${formatDate(order.orderDate)}</div>
          </div>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <div class="info-label">EXPECTED DELIVERY</div>
            <div class="info-value">${order.expectedDate ? formatDate(order.expectedDate) : 'Not specified'}</div>
          </div>
          <div class="info-box">
            <div class="info-label">STATUS</div>
            <div class="info-value"><span class="status-badge status-${order.status === 'Supplied' ? 'supplied' : 'ordered'}">${order.status}</span></div>
          </div>
          <div class="info-box">
            <div class="info-label">PAYMENT STATUS</div>
            <div class="info-value"><span class="status-badge status-${order.paymentStatus === 'Paid' ? 'paid' : 'ordered'}">${order.paymentStatus}</span></div>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center">Qty</th>
              <th style="text-align: center">Unit</th>
              <th style="text-align: right">Unit Price (KES)</th>
              <th style="text-align: right">Total (KES)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml || '<tr><td colspan="5" style="text-align: center;">No items found</td></tr>'}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-line">Subtotal: ${formatCurrency(order.subtotal || 0)}</div>
          <div class="total-line">VAT (16%): ${formatCurrency(order.vat || 0)}</div>
          <div class="grand-total">TOTAL: ${formatCurrency(order.total || 0)}</div>
        </div>
        
        ${order.notes ? `<div class="notes-section"><strong>Notes:</strong> ${order.notes}</div>` : ''}
        
        <div class="footer">
          <p>This is a computer-generated document. No signature is required.</p>
          <p style="margin-top: 5px;">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};






  const markPaid = async (order: PurchaseOrder) => {
    if (order.paymentStatus === 'Paid') {
      alert('Order is already marked as paid');
      return;
    }
    
    if (order.status !== 'Supplied') {
      alert('Order must be marked as SUPPLIED before it can be marked as PAID');
      return;
    }
    
    if (!confirm(`Mark order ${order.orderNumber} as PAID? This will create an expense record.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: order.status,
          payment_status: 'Paid'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment status');
      }
      
      await fetchPurchaseOrders();
      await fetchExpenses();
      
      alert(`Order ${order.orderNumber} marked as PAID. Expense record created.`);
    } catch (error) {
      console.error('Error marking order as paid:', error);
      alert('Failed to mark order as paid. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filtered.length} orders</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered.map(o => ({ orderNumber: o.orderNumber, supplier: o.supplierName, project: o.projectName, date: o.orderDate, total: o.total, status: o.status, payment: o.paymentStatus })), 'purchase_orders')}>Export</Button>
          {authUser?.role === 'admin' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm('WARNING: This will permanently delete ALL purchase orders and related supplies. This action cannot be undone. Continue?')) {
                  clearPurchaseOrders();
                }
              }}
            >
              Clear All Orders
            </Button>
          )}
          <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />New Order</Button>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Order #</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Date</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Supplier</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Project</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Items</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Total</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">Payment</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 font-mono text-xs font-medium">{o.orderNumber}</td>
                <td className="px-4 py-2.5 text-xs">{formatDate(o.orderDate)}</td>
                <td className="px-4 py-2.5 text-card-foreground">{o.supplierName}</td>
                <td className="px-4 py-2.5 text-xs">{o.projectName}</td>
                <td className="px-4 py-2.5 text-center">{o.items.length}</td>
                <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(o.total)}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === 'Supplied' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-2.5">





<div className="flex gap-1">
  <Button variant="ghost" size="sm" onClick={() => setViewOrder(o)}><Eye size={14} /></Button>
  <Button variant="ghost" size="sm" onClick={() => printPurchaseOrder(o)}><Printer size={14} /></Button>
  {o.status === 'Ordered' && (
    <>
      <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Pencil size={14} /></Button>
      <Button variant="ghost" size="sm" onClick={() => markSupplied(o)}><Truck size={14} /></Button>
      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteOrder(o)}><Trash2 size={14} /></Button>
    </>
  )}
  {o.status === 'Supplied' && o.paymentStatus === 'Unpaid' && (
    <Button variant="ghost" size="sm" onClick={() => markPaid(o)}><Package size={14} /></Button>
  )}
</div>

                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No purchase orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New/Edit Order Dialog - keep as is */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? `Edit Order: ${editingOrder.orderNumber}` : 'New Purchase Order'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Supplier *</Label>
                <Select value={form.supplierId?.toString() || ''} onValueChange={v => setForm({ ...form, supplierId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p.status === 'Active').map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Expected Delivery Date</Label>
              <Input type="date" value={form.expectedDate} onChange={e => setForm({ ...form, expectedDate: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold">Order Items</Label>
                <Button variant="outline" size="sm" onClick={addOrderItem}><Plus size={14} className="mr-1" />Add Item</Button>
              </div>
              {orderItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-2 rounded-lg">
                  <div className="col-span-4">
                    <Select value={item.itemId?.toString() || ''} onValueChange={v => updateOrderItem(i, 'itemId', Number(v))}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Item" /></SelectTrigger>
                      <SelectContent>
                        {approvedItems.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Qty" className="text-xs" value={item.quantity || ''} onChange={e => updateOrderItem(i, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-1 text-xs text-muted-foreground pt-2">{item.unit}</div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Price" className="text-xs" value={item.unitPrice || ''} onChange={e => updateOrderItem(i, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="col-span-2 text-xs font-mono text-right pt-2">{formatCurrency(item.amount)}</div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setOrderItems(prev => prev.filter((_, j) => j !== i))}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              {orderItems.length > 0 && (
                <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(orderItems.reduce((s, i) => s + i.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (16%)</span>
                    <span className="font-mono">{formatCurrency(orderItems.reduce((s, i) => s + i.amount, 0) * 0.16)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(orderItems.reduce((s, i) => s + i.amount, 0) * 1.16)}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingOrder ? 'Update Order' : 'Create Order'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog - keep as is */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Order {viewOrder?.orderNumber}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground text-xs">Supplier:</span> <span className="font-medium">{viewOrder.supplierName}</span></div>
                <div><span className="text-muted-foreground text-xs">Project:</span> <span className="font-medium">{viewOrder.projectName}</span></div>
                <div><span className="text-muted-foreground text-xs">Date:</span> {formatDate(viewOrder.orderDate)}</div>
                <div><span className="text-muted-foreground text-xs">Expected:</span> {formatDate(viewOrder.expectedDate)}</div>
              </div>
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-muted text-left">
                  <th className="px-3 py-2 text-xs">Item</th>
                  <th className="px-3 py-2 text-xs text-center">Qty</th>
                  <th className="px-3 py-2 text-xs">Unit</th>
                  <th className="px-3 py-2 text-xs text-right">Price</th>
                  <th className="px-3 py-2 text-xs text-right">Amount</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {viewOrder.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{it.itemName}</td>
                      <td className="px-3 py-2 text-center">{it.quantity}</td>
                      <td className="px-3 py-2">{it.unit}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50"><td colSpan={4} className="px-3 py-2 text-right font-semibold text-xs">Subtotal</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(viewOrder.subtotal)}</td></tr>
                  <tr className="bg-muted/50"><td colSpan={4} className="px-3 py-2 text-right text-xs">VAT (16%)</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(viewOrder.vat)}</td></tr>
                  <tr className="bg-muted"><td colSpan={4} className="px-3 py-2 text-right font-bold text-xs">TOTAL</td><td className="px-3 py-2 text-right font-mono font-bold">{formatCurrency(viewOrder.total)}</td></tr>
                </tfoot>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



function SuppliesTab() {
  const { supplies, projects, suppliers, approvedItems, selectedProjectId, addSupply, fetchSupplies } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    supplierId: 0, supplierName: '',
    projectId: 0, projectName: '',
    date: new Date().toISOString().split('T')[0],
    itemId: 0, itemName: '', unit: 'piece',
    quantity: 0, unitPrice: 0, totalAmount: 0,
    vat: 0, status: 'Delivered' as const, paid: false,
    deliveryNote: '', notes: ''
  });

  const filtered = selectedProjectId ? supplies.filter(s => s.projectId === selectedProjectId) : supplies;






const markSupplyAsPaid = async (supplyId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/supplies/${supplyId}/paid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      alert('Supply marked as paid! Page will refresh to show updated status.');
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.error || 'Failed to mark supply as paid'}`);
    }
  } catch (error) {
    console.error('Failed to mark as paid:', error);
    alert('Failed to mark supply as paid. Please try again.');
  }
};






  const openNew = () => {
    setForm({
      supplierId: 0, supplierName: '',
      projectId: selectedProjectId || 0, projectName: projects.find(p => p.id === selectedProjectId)?.name || '',
      date: new Date().toISOString().split('T')[0],
      itemId: 0, itemName: '', unit: 'piece',
      quantity: 0, unitPrice: 0, totalAmount: 0,
      vat: 0, status: 'Delivered', paid: false,
      deliveryNote: '', notes: ''
    });
    setOpen(true);
  };

  const handleItemChange = (itemId: number) => {
    const item = approvedItems.find(i => i.id === itemId);
    if (item) {
      setForm({
        ...form,
        itemId: item.id,
        itemName: item.name,
        unit: item.unit,
        unitPrice: item.defaultPrice,
        totalAmount: form.quantity * item.defaultPrice,
        vat: (form.quantity * item.defaultPrice) * 0.16
      });
    }
  };

  const handleQuantityChange = (qty: number) => {
    setForm({
      ...form,
      quantity: qty,
      totalAmount: qty * form.unitPrice,
      vat: (qty * form.unitPrice) * 0.16
    });
  };





const handleSave = () => {
  console.log('=== HANDLE SAVE STARTED ===');
  
  if (!form.supplierId || !form.projectId || !form.itemId || form.quantity <= 0) {
    console.log('Validation failed:', { form });
    return;
  }
  
  console.log('Validation passed, proceeding...');
  
  const supplier = suppliers.find(s => s.id === form.supplierId);
  const project = projects.find(p => p.id === form.projectId);
  const selectedItem = approvedItems.find(i => i.id === form.itemId);
  
  console.log('Found items:', { supplier: supplier?.name, project: project?.name, selectedItem: selectedItem?.name });
  
  // Add the supply record
  console.log('Calling addSupply...');
  addSupply({
    ...form,
    supplierName: supplier?.name || '',
    projectName: project?.name || '',
    totalAmount: form.quantity * form.unitPrice,
    vat: (form.quantity * form.unitPrice) * 0.16,
    createdAt: new Date().toISOString()
  } as any);










  
  console.log('Closing dialog...');
  setOpen(false);
  console.log('=== HANDLE SAVE COMPLETED ===');
};












  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filtered.length} supplies</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />Add Supply</Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered.map(s => ({ date: s.date, supplier: s.supplierName, project: s.projectName, item: s.itemName, qty: s.quantity, unit: s.unit, total: s.totalAmount, paid: s.paid })), 'supplies')}>Export</Button>
        </div>
      </div>
      
      {/* Existing table remains the same */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Date', 'Supplier', 'Project', 'Item', 'Qty', 'Unit Price', 'Total', 'Paid'].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>)}
           </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-xs">{formatDate(s.date)}</td>
                <td className="px-4 py-2.5 text-card-foreground">{s.supplierName}</td>
                <td className="px-4 py-2.5 text-xs">{s.projectName}</td>
                <td className="px-4 py-2.5">{s.itemName}</td>
                <td className="px-4 py-2.5 font-mono text-center">{s.quantity} {s.unit}</td>
                <td className="px-4 py-2.5 font-mono text-right">{formatCurrency(s.unitPrice)}</td>
                <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(s.totalAmount)}</td>






<td className="px-4 py-2.5">
  {s.paid ? (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
      Paid
    </span>
  ) : (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => markSupplyAsPaid(s.id)}
      className="text-xs h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600"
    >
      Mark Paid
    </Button>
  )}
</td>




              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No supply records</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Supply Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Supply</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Supplier *</Label>
                <Select value={form.supplierId?.toString() || ''} onValueChange={v => setForm({ ...form, supplierId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{projects.filter(p => p.status === 'Active').map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Item *</Label>
                <Select value={form.itemId?.toString() || ''} onValueChange={v => handleItemChange(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{approvedItems.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Quantity *</Label><Input type="number" value={form.quantity || ''} onChange={e => handleQuantityChange(Number(e.target.value))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Unit Price</Label><Input type="number" value={form.unitPrice || ''} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value), totalAmount: form.quantity * Number(e.target.value), vat: (form.quantity * Number(e.target.value)) * 0.16 })} /></div>
              <div><Label className="text-xs">Unit</Label><Input value={form.unit} disabled className="bg-muted" /></div>
            </div>
            <div className="bg-muted rounded-lg p-2 text-xs">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(form.totalAmount)}</span></div>
              <div className="flex justify-between"><span>VAT (16%):</span><span>{formatCurrency(form.vat)}</span></div>
              <div className="flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(form.totalAmount + form.vat)}</span></div>
            </div>
            <div><Label className="text-xs">Delivery Note</Label><Input value={form.deliveryNote} onChange={e => setForm({ ...form, deliveryNote: e.target.value })} /></div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save Supply</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}