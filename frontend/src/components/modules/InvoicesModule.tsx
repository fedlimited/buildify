import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Invoice, InvoiceItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, Printer } from 'lucide-react';

export function InvoicesModule() {
  const { invoices, projects, selectedProjectId, companySettings, addInvoice, updateInvoice, deleteInvoice } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ projectId: 0, projectName: '', clientName: '', date: '', dueDate: '', notes: '', status: 'Draft' as Invoice['status'] });
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const filtered = selectedProjectId ? invoices.filter(i => i.projectId === selectedProjectId) : invoices;

  const openNew = () => {
    setEditing(null);
    const proj = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
    setForm({ projectId: selectedProjectId || 0, projectName: proj?.name || '', clientName: proj?.client || '', date: new Date().toISOString().split('T')[0], dueDate: '', notes: '', status: 'Draft' });
    setItems([]);
    setOpen(true);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit: 'no.', unitPrice: 0, amount: 0 }]);

  const updateItem = (idx: number, field: string, value: unknown) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (field === 'quantity' ? Number(value) : updated.quantity) * (field === 'unitPrice' ? Number(value) : updated.unitPrice);
      }
      return updated;
    }));
  };






const handleSave = () => {
  if (!form.projectId || !form.clientName || items.length === 0) return;
  const proj = projects.find(p => p.id === form.projectId);
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const vat = subtotal * 0.16;
  const num = invoices.length + 1;
  const data = {
    invoiceNumber: editing?.invoiceNumber || `INV-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`,
    projectId: form.projectId,
    projectName: proj?.name || form.projectName,
    clientName: form.clientName,
    date: form.date,
    dueDate: form.dueDate,
    items: items, // This is already an array
    subtotal,
    vat,
    total: subtotal + vat,
    status: form.status,
    notes: form.notes,
  };
  
  console.log('Saving invoice data:', data);
  console.log('Editing mode:', !!editing);
  
  if (editing) {
    // Make sure we pass the ID and the complete data
    updateInvoice(editing.id, data);
  } else {
    addInvoice(data);
  }
  setOpen(false);
};






const printInvoice = (inv: Invoice) => {
  // Helper to escape HTML
  function escapeHtml(str: string) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  // Get company details from settings
  const logoHtml = companySettings?.logoUrl 
    ? `<img src="${companySettings.logoUrl}" style="max-height: 60px; max-width: 180px; object-fit: contain;" onerror="this.style.display='none'" />` 
    : '';
  
  const companyName = companySettings?.name || 'Finite Element Designs Limited';
  const companyAddress = companySettings?.address || '';
  const companyPhone = companySettings?.phone || '';
  const companyEmail = companySettings?.email || '';
  const kraPin = companySettings?.kraPin || '';
  const vatRegNo = companySettings?.vatRegistrationNumber || kraPin;
  
  // Banking details from settings (NEW)
  const bankName = companySettings?.bank_name || '';
  const bankAccount = companySettings?.bank_account_number || '';
  const bankBranch = companySettings?.bank_branch || '';
  const bankSwift = companySettings?.bank_swift_code || '';
  const mpesaPaybill = companySettings?.mpesa_paybill || '';
  const mpesaAccountNo = companySettings?.mpesa_account_number || inv.invoiceNumber;








  
// Build payment instructions HTML (always shows)
const paymentInstructionsHtml = `
  <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e2e8f0;">
    <h3 style="font-size: 12px; margin: 0 0 8px 0; color: #1a365d;">🏦 PAYMENT INSTRUCTIONS</h3>
    <div style="font-size: 10px; color: #4a5568;">
      ${bankName ? `<div><strong>Bank:</strong> ${escapeHtml(bankName)}</div>` : ''}
      ${bankAccount ? `<div><strong>Account Name:</strong> ${escapeHtml(companyName)}</div>
      <div><strong>Account Number:</strong> ${escapeHtml(bankAccount)}</div>` : ''}
      ${bankBranch ? `<div><strong>Branch:</strong> ${escapeHtml(bankBranch)}</div>` : ''}
      ${bankSwift ? `<div><strong>Swift Code:</strong> ${escapeHtml(bankSwift)}</div>` : ''}
      
      ${mpesaPaybill ? `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e0;">
          <strong>M-Pesa Paybill:</strong> ${escapeHtml(mpesaPaybill)}
        </div>
        <div><strong>Account No:</strong> ${escapeHtml(mpesaAccountNo)}</div>
      ` : `
        <div style="margin-top: 8px;">
          <strong>M-Pesa Till Number:</strong> Pending setup
        </div>
      `}
      
      <!-- Always show contact info -->
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        <strong>Questions?</strong> Contact us at ${escapeHtml(companyEmail)}
      </div>
    </div>
  </div>
`;







  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>Invoice ${inv.invoiceNumber}</title>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 40px;
        margin: 0;
        color: #1a202c;
        background: white;
        font-size: 12pt;
        line-height: 1.4;
      }
      .print-container { max-width: 1100px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a365d; }
      .company-section { flex: 1; }
      .company-name { font-size: 18px; font-weight: bold; color: #1a365d; margin: 5px 0; }
      .company-details { font-size: 10px; color: #4a5568; margin-top: 5px; }
      .company-details div { margin-top: 3px; }
      .invoice-title-section { text-align: right; }
      .invoice-title { font-size: 24px; font-weight: bold; color: #1a365d; letter-spacing: 2px; }
      .invoice-number { font-size: 12px; color: #4a5568; margin-top: 5px; font-family: monospace; }
      .bill-to { margin-bottom: 20px; padding: 10px; background: #f7fafc; border-radius: 6px; }
      .bill-to strong { font-size: 10px; color: #4a5568; text-transform: uppercase; }
      .bill-to p { margin-top: 5px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #1a365d; color: white; text-align: left; padding: 10px 8px; font-size: 11px; font-weight: 600; }
      td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .totals { text-align: right; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; width: 280px; margin-left: auto; }
      .total-line { margin: 5px 0; font-size: 11px; display: flex; justify-content: space-between; gap: 20px; }
      .grand-total { font-size: 13px; font-weight: bold; color: #1a365d; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1a365d; }
      .notes-section { margin-top: 20px; padding: 10px; background: #f7fafc; border-radius: 6px; font-size: 10px; }
      .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      @media print { body { padding: 20px; } }
    </style>
  </head>
  <body>
    <div class="print-container">
      <div class="header">
        <div class="company-section">
          ${logoHtml}
          <div class="company-name">${escapeHtml(companyName)}</div>
          <div class="company-details">
            ${companyAddress ? `<div>${escapeHtml(companyAddress)}</div>` : ''}
            ${companyPhone ? `<div>Tel: ${escapeHtml(companyPhone)}</div>` : ''}
            ${companyEmail ? `<div>Email: ${escapeHtml(companyEmail)}</div>` : ''}
            ${kraPin ? `<div>KRA PIN: ${escapeHtml(kraPin)}</div>` : ''}
            ${vatRegNo && vatRegNo !== kraPin ? `<div>VAT Reg No: ${escapeHtml(vatRegNo)}</div>` : ''}
          </div>
        </div>
        <div class="invoice-title-section">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${inv.invoiceNumber}</div>
          <div class="company-details" style="margin-top: 10px;">
            <div>Date: ${formatDate(inv.date)}</div>
            <div>Due: ${formatDate(inv.dueDate)}</div>
            <div>Status: ${inv.status}</div>
          </div>
        </div>
      </div>

      <div class="bill-to">
        <strong>BILL TO</strong>
        <p>${escapeHtml(inv.clientName)}</p>
        <p style="font-size: 10px; color: #4a5568;">Project: ${escapeHtml(inv.projectName)}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center" style="width: 60px;">Qty</th>
            <th style="width: 60px;">Unit</th>
            <th class="text-right" style="width: 100px;">Unit Price</th>
            <th class="text-right" style="width: 110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(it => `
            <tr>
              <td>${escapeHtml(it.description)}</td>
              <td class="text-center">${it.quantity}</td>
              <td>${escapeHtml(it.unit)}</td>
              <td class="text-right">${formatCurrency(it.unitPrice)}</td>
              <td class="text-right">${formatCurrency(it.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-line"><span>Subtotal:</span><span>${formatCurrency(inv.subtotal)}</span></div>
        <div class="total-line"><span>VAT (16%):</span><span>${formatCurrency(inv.vat)}</span></div>
        <div class="grand-total"><span>TOTAL:</span><span>${formatCurrency(inv.total)}</span></div>
      </div>

      ${paymentInstructionsHtml}

      ${inv.notes ? `<div class="notes-section"><strong>Notes:</strong> ${escapeHtml(inv.notes)}</div>` : ''}

      <div class="footer">
        <p>Thank you for your business! For any inquiries, please contact ${escapeHtml(companyEmail)}</p>
        <p>Generated on ${new Date().toLocaleString()} | BOCHI Construction Suite</p>
      </div>
    </div>
  </body>
  </html>`;

  const w = window.open('', '_blank');
  if (w) { 
    w.document.write(html); 
    w.document.close(); 
    w.print(); 
  }
};











  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} invoices</p>
        <Button size="sm" onClick={openNew}><Plus size={16} className="mr-1" />New Invoice</Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Invoice #', 'Date', 'Client', 'Project', 'Total', 'Status', ''].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 font-mono text-xs font-medium">{inv.invoiceNumber}</td>
                <td className="px-4 py-2.5 text-xs">{formatDate(inv.date)}</td>
                <td className="px-4 py-2.5 text-card-foreground">{inv.clientName}</td>
                <td className="px-4 py-2.5 text-xs">{inv.projectName}</td>
                <td className="px-4 py-2.5 font-mono text-right font-medium">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-2.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.status === 'Paid' ? 'bg-success/10 text-success' : inv.status === 'Overdue' ? 'bg-destructive/10 text-destructive' : inv.status === 'Sent' ? 'bg-info/10 text-info' : 'bg-muted text-muted-foreground'}`}>{inv.status}</span></td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setViewInvoice(inv)}><Eye size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => printInvoice(inv)}><Printer size={14} /></Button>





<Button 
  variant="ghost" 
  size="sm" 
  onClick={() => { 
    console.log('Editing invoice:', inv);
    console.log('Invoice items:', inv.items);
    console.log('Is items an array?', Array.isArray(inv.items));
    
    setEditing(inv);
    setForm({ 
      projectId: inv.projectId,
      projectName: inv.projectName,
      clientName: inv.clientName, 
      date: inv.date, 
      dueDate: inv.dueDate, 
      notes: inv.notes || '', 
      status: inv.status 
    }); 
    // CRITICAL FIX: Ensure items is always an array
    setItems(Array.isArray(inv.items) ? inv.items : []); 
    setOpen(true); 
  }}
>
  <Pencil size={14} />
</Button>





                    {inv.status === 'Draft' && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { if (confirm('Delete?')) deleteInvoice(inv.id); }}><Trash2 size={14} /></Button>}



                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No invoices</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Invoice</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Project *</Label>
                <Select value={form.projectId?.toString() || ''} onValueChange={v => {
                  const proj = projects.find(p => p.id === Number(v));
                  setForm({ ...form, projectId: Number(v), clientName: proj?.client || form.clientName });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Client *</Label><Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label className="text-xs">Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div><Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as Invoice['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold">Line Items</Label>
                <Button variant="outline" size="sm" onClick={addItem}><Plus size={14} className="mr-1" />Add Item</Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-2 rounded-lg">
                  <div className="col-span-4"><Input placeholder="Description" className="text-xs" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Qty" className="text-xs" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} /></div>


                  <div className="col-span-1"><Input placeholder="Unit" className="text-xs" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" placeholder="Price" className="text-xs" value={item.unitPrice || ''} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} /></div>
                  <div className="col-span-2 text-xs font-mono text-right pt-2">{formatCurrency(item.amount)}</div>
                  <div className="col-span-1"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}><Trash2 size={14} /></Button></div>
                </div>
              ))}
              {items.length > 0 && (
                <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatCurrency(items.reduce((s, i) => s + i.amount, 0))}</span></div>
                  <div className="flex justify-between"><span>VAT (16%)</span><span className="font-mono">{formatCurrency(items.reduce((s, i) => s + i.amount, 0) * 0.16)}</span></div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Total</span><span className="font-mono">{formatCurrency(items.reduce((s, i) => s + i.amount, 0) * 1.16)}</span></div>
                </div>
              )}
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button></div>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Invoice {viewInvoice?.invoiceNumber}</DialogTitle></DialogHeader>
          {viewInvoice && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  {companySettings.logoUrl && <img src={companySettings.logoUrl} alt="Logo" className="h-12 mb-2" />}
                  <p className="font-semibold">{companySettings.name}</p>
                  <p className="text-xs text-muted-foreground">{companySettings.address}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground text-xs">Date: {formatDate(viewInvoice.date)}</p>
                  <p className="text-muted-foreground text-xs">Due: {formatDate(viewInvoice.dueDate)}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-xs text-muted-foreground">Bill To:</p>
                <p className="font-medium">{viewInvoice.clientName}</p>
                <p className="text-xs text-muted-foreground">Project: {viewInvoice.projectName}</p>
              </div>
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-muted text-left">
                  <th className="px-3 py-2 text-xs">Description</th>
                  <th className="px-3 py-2 text-xs text-center">Qty</th>
                  <th className="px-3 py-2 text-xs">Unit</th>
                  <th className="px-3 py-2 text-xs text-right">Price</th>
                  <th className="px-3 py-2 text-xs text-right">Amount</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {viewInvoice.items.map((it, i) => (
                    <tr key={i}><td className="px-3 py-2">{it.description}</td><td className="px-3 py-2 text-center">{it.quantity}</td><td className="px-3 py-2">{it.unit}</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(it.amount)}</td></tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50"><td colSpan={4} className="px-3 py-2 text-right text-xs">Subtotal</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(viewInvoice.subtotal)}</td></tr>
                  <tr className="bg-muted/50"><td colSpan={4} className="px-3 py-2 text-right text-xs">VAT (16%)</td><td className="px-3 py-2 text-right font-mono">{formatCurrency(viewInvoice.vat)}</td></tr>
                  <tr className="bg-muted"><td colSpan={4} className="px-3 py-2 text-right font-bold text-xs">TOTAL</td><td className="px-3 py-2 text-right font-mono font-bold">{formatCurrency(viewInvoice.total)}</td></tr>
                </tfoot>
              </table>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => printInvoice(viewInvoice)}><Printer size={14} className="mr-1" />Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
