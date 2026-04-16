import { useState, useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

export function StoresModule() {
  return (
    <div className="fade-in">
      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Stock Balances</TabsTrigger>
          <TabsTrigger value="ledger">Transaction Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="balances"><StockBalances /></TabsContent>
        <TabsContent value="ledger"><TransactionLedger /></TabsContent>
      </Tabs>
    </div>
  );
}

interface StockBalance {
  projectId: number;
  projectName: string;
  itemId: number;
  itemName: string;
  unit: string;
  category: string;
  totalSupplied: number;
  totalIssued: number;
  totalReturned: number;
  currentBalance: number;
}

function useStockBalances(): StockBalance[] {
  const { storeTransactions } = useAppStore();
  return useMemo(() => {
    const map = new Map<string, StockBalance>();
    storeTransactions.forEach(t => {
      const key = `${t.projectId}-${t.itemId}`;
      if (!map.has(key)) {
        map.set(key, { projectId: t.projectId, projectName: t.projectName, itemId: t.itemId, itemName: t.itemName, unit: t.unit, category: t.category, totalSupplied: 0, totalIssued: 0, totalReturned: 0, currentBalance: 0 });
      }
      const b = map.get(key)!;
      b.totalSupplied += t.quantitySupplied;
      b.totalIssued += t.quantityIssued;
      b.totalReturned += t.quantityReturned;
      b.currentBalance = b.totalSupplied - b.totalIssued + b.totalReturned;
    });
    return Array.from(map.values());
  }, [storeTransactions]);
}









function StockBalances() {
  const { projects, approvedItems, selectedProjectId, addStoreTransaction, storeTransactions, authUser, clearStoresRecords } = useAppStore();
  const balances = useStockBalances();
  const [search, setSearch] = useState('');
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<StockBalance | null>(null);
  const [qty, setQty] = useState(0);
  const [ref, setRef] = useState('');
  const [issuedTo, setIssuedTo] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = balances.filter(b => {
    if (selectedProjectId && b.projectId !== selectedProjectId) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return b.itemName.toLowerCase().includes(s) || b.category.toLowerCase().includes(s) || b.projectName.toLowerCase().includes(s) || b.unit.toLowerCase().includes(s);
  });

  const highlight = (text: string) => {
    if (!search) return text;
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-warning/30 rounded px-0.5">{text.slice(idx, idx + search.length)}</mark>{text.slice(idx + search.length)}</>;
  };

  const openIssue = (b: StockBalance) => { setSelectedBalance(b); setQty(0); setRef(''); setIssuedTo(''); setNotes(''); setIssueOpen(true); };
  const openReturn = (b: StockBalance) => { setSelectedBalance(b); setQty(0); setRef(''); setNotes(''); setReturnOpen(true); };

  const handleIssue = () => {
    if (!selectedBalance || qty <= 0 || qty > selectedBalance.currentBalance) return;
    addStoreTransaction({
      date: new Date().toISOString().split('T')[0],
      projectId: selectedBalance.projectId, projectName: selectedBalance.projectName,
      itemId: selectedBalance.itemId, itemName: selectedBalance.itemName,
      unit: selectedBalance.unit, category: selectedBalance.category,
      quantitySupplied: 0, quantityIssued: qty, quantityReturned: 0,
      balance: selectedBalance.currentBalance - qty,
      transactionType: 'ISSUE', reference: ref, issuedTo, returnedBy: '', notes
    });
    setIssueOpen(false);
  };

  const handleReturn = () => {
    if (!selectedBalance || qty <= 0) return;
    addStoreTransaction({
      date: new Date().toISOString().split('T')[0],
      projectId: selectedBalance.projectId, projectName: selectedBalance.projectName,
      itemId: selectedBalance.itemId, itemName: selectedBalance.itemName,
      unit: selectedBalance.unit, category: selectedBalance.category,
      quantitySupplied: 0, quantityIssued: 0, quantityReturned: qty,
      balance: selectedBalance.currentBalance + qty,
      transactionType: 'RETURN', reference: ref, issuedTo: '', returnedBy: issuedTo, notes
    });
    setReturnOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items, categories, projects..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered.map(b => ({ project: b.projectName, item: b.itemName, unit: b.unit, category: b.category, supplied: b.totalSupplied, issued: b.totalIssued, returned: b.totalReturned, balance: b.currentBalance })), 'stock_balances')}>Export</Button>
          {authUser?.role === 'admin' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm('WARNING: This will permanently delete ALL store transactions. This action cannot be undone. Continue?')) {
                  clearStoresRecords();
                }
              }}
            >
              Clear Store Records
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Project', 'Item', 'Category', 'Unit', 'Supplied', 'Issued', 'Returned', 'Balance', ''].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
           </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(b => (
              <tr key={`${b.projectId}-${b.itemId}`} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-xs">{highlight(b.projectName)}</td>
                <td className="px-4 py-2.5 text-card-foreground font-medium">{highlight(b.itemName)}</td>
                <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-muted">{highlight(b.category)}</span></td>
                <td className="px-4 py-2.5 text-xs">{b.unit}</td>
                <td className="px-4 py-2.5 font-mono text-center text-success">{b.totalSupplied}</td>
                <td className="px-4 py-2.5 font-mono text-center text-destructive">{b.totalIssued}</td>
                <td className="px-4 py-2.5 font-mono text-center text-info">{b.totalReturned}</td>
                <td className="px-4 py-2.5 font-mono text-center font-bold">
                  <span className={`inline-flex items-center gap-1 ${b.currentBalance <= 10 ? 'text-destructive' : 'text-card-foreground'}`}>
                    {b.currentBalance <= 10 && <AlertTriangle size={12} />}
                    {b.currentBalance}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openIssue(b)} disabled={b.currentBalance <= 0}><ArrowDownToLine size={14} className="mr-1" />Issue</Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => openReturn(b)}><ArrowUpFromLine size={14} className="mr-1" />Return</Button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">{search ? 'No matching items' : 'No stock data'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Issue Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Issue Material</DialogTitle></DialogHeader>
          {selectedBalance && (
            <div className="grid gap-3 py-2">
              <div className="bg-muted rounded-lg p-3 text-xs">
                <p className="font-semibold">{selectedBalance.itemName}</p>
                <p className="text-muted-foreground">{selectedBalance.projectName}</p>
                <p className="mt-1">Available: <span className="font-mono font-bold">{selectedBalance.currentBalance} {selectedBalance.unit}</span></p>
              </div>
              <div><Label className="text-xs">Quantity to Issue *</Label><Input type="number" value={qty || ''} onChange={e => setQty(Number(e.target.value))} max={selectedBalance.currentBalance} /></div>
              {qty > selectedBalance.currentBalance && <p className="text-xs text-destructive">Cannot exceed available balance!</p>}
              <div><Label className="text-xs">Issued To</Label><Input value={issuedTo} onChange={e => setIssuedTo(e.target.value)} placeholder="Team/Person" /></div>
              <div><Label className="text-xs">Reference</Label><Input value={ref} onChange={e => setRef(e.target.value)} placeholder="Requisition number" /></div>
              <div><Label className="text-xs">Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
          )}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button><Button onClick={handleIssue} disabled={qty <= 0 || qty > (selectedBalance?.currentBalance || 0)}>Issue</Button></div>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Return Material</DialogTitle></DialogHeader>
          {selectedBalance && (
            <div className="grid gap-3 py-2">
              <div className="bg-muted rounded-lg p-3 text-xs">
                <p className="font-semibold">{selectedBalance.itemName}</p>
                <p className="text-muted-foreground">{selectedBalance.projectName}</p>
              </div>
              <div><Label className="text-xs">Quantity to Return *</Label><Input type="number" value={qty || ''} onChange={e => setQty(Number(e.target.value))} /></div>
              <div><Label className="text-xs">Returned By</Label><Input value={issuedTo} onChange={e => setIssuedTo(e.target.value)} /></div>
              <div><Label className="text-xs">Reference</Label><Input value={ref} onChange={e => setRef(e.target.value)} /></div>
              <div><Label className="text-xs">Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
          )}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button><Button onClick={handleReturn} disabled={qty <= 0}>Return</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}











function TransactionLedger() {
  const { storeTransactions, selectedProjectId } = useAppStore();
  const filtered = (selectedProjectId ? storeTransactions.filter(t => t.projectId === selectedProjectId) : storeTransactions)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filtered.length} transactions</p>
        <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered.map(t => ({ date: t.date, project: t.projectName, item: t.itemName, type: t.transactionType, supplied: t.quantitySupplied, issued: t.quantityIssued, returned: t.quantityReturned, balance: t.balance, reference: t.reference, notes: t.notes })), 'store_ledger')}>Export</Button>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left">
            {['Date', 'Ref', 'Project', 'Item', 'Type', 'Supplied', 'Issued', 'Returned', 'Notes'].map(h => <th key={h} className="px-4 py-3 font-medium text-muted-foreground text-xs">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-muted/50">
                <td className="px-4 py-2.5 text-xs">{formatDate(t.date)}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{t.reference || '-'}</td>
                <td className="px-4 py-2.5 text-xs">{t.projectName}</td>
                <td className="px-4 py-2.5 text-card-foreground">{t.itemName}</td>
                <td className="px-4 py-2.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.transactionType === 'SUPPLY' ? 'bg-success/10 text-success' : t.transactionType === 'ISSUE' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'}`}>{t.transactionType}</span></td>
                <td className="px-4 py-2.5 font-mono text-center">{t.quantitySupplied || '-'}</td>
                <td className="px-4 py-2.5 font-mono text-center">{t.quantityIssued || '-'}</td>
                <td className="px-4 py-2.5 font-mono text-center">{t.quantityReturned || '-'}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[150px]">{t.notes || t.issuedTo || t.returnedBy || '-'}</td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No transactions</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
