import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, RefreshCw } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

// Types
interface StockItem {
  id: string;
  projectId: number;
  projectName: string;
  itemName: string;
  unit: string;
  category: string;
  quantitySupplied: number;
  quantityIssued: number;
  quantityReturned: number;
  balance: number;
}

interface Transaction {
  id: number;
  date: string;
  reference: string;
  projectName: string;
  itemName: string;
  transactionType: string;
  quantitySupplied: number;
  quantityIssued: number;
  quantityReturned: number;
  balance: number;
  notes: string;
}

export function StoresModuleV2() {
  const [activeTab, setActiveTab] = useState('balances');
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Modal states
  const [issueOpen, setIssueOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [qty, setQty] = useState(0);
  const [ref, setRef] = useState('');
  const [issuedTo, setIssuedTo] = useState('');
  const [notes, setNotes] = useState('');

  const { authUser } = useAppStore();
  const token = localStorage.getItem('token');

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projectsRes = await fetch('https://buildify-backend-kye8.onrender.com/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();
      setProjects(projectsData);

      // Fetch store transactions
      const transactionsRes = await fetch('https://buildify-backend-kye8.onrender.com/api/store-transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData);

      // Calculate stock balances
      const stockMap = new Map<string, StockItem>();
      
      transactionsData.forEach((t: any) => {
        const key = `${t.projectId}-${t.itemName}`;
        
        if (!stockMap.has(key)) {
          stockMap.set(key, {
            id: key,
            projectId: t.projectId,
            projectName: t.projectName,
            itemName: t.itemName,
            unit: t.unit || 'piece',
            category: t.category || 'Materials',
            quantitySupplied: 0,
            quantityIssued: 0,
            quantityReturned: 0,
            balance: 0
          });
        }
        
        const item = stockMap.get(key)!;
        item.quantitySupplied += t.quantitySupplied || 0;
        item.quantityIssued += t.quantityIssued || 0;
        item.quantityReturned += t.quantityReturned || 0;
        item.balance = item.quantitySupplied - item.quantityIssued + item.quantityReturned;
      });
      
      setStockItems(Array.from(stockMap.values()));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter stock items
  const filteredStock = stockItems.filter(item => {
    if (selectedProjectId && item.projectId !== selectedProjectId) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return item.itemName.toLowerCase().includes(s) || 
           item.category.toLowerCase().includes(s) || 
           item.projectName.toLowerCase().includes(s);
  });

  // Filter transactions
  const filteredTransactions = transactions
    .filter(t => !selectedProjectId || t.projectId === selectedProjectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handle issue
  const handleIssue = async () => {
    if (!selectedItem || qty <= 0 || qty > selectedItem.balance) return;
    
    try {
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/store-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          projectId: selectedItem.projectId,
          projectName: selectedItem.projectName,
          transactionType: 'ISSUE',
          itemId: null,
          itemName: selectedItem.itemName,
          unit: selectedItem.unit,
          category: selectedItem.category,
          quantitySupplied: 0,
          quantityIssued: qty,
          quantityReturned: 0,
          balance: selectedItem.balance - qty,
          reference: ref,
          issuedTo: issuedTo,
          returnedBy: '',
          notes: notes
        })
      });
      
      if (response.ok) {
        await fetchData();
        setIssueOpen(false);
        setQty(0);
        setRef('');
        setIssuedTo('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error issuing item:', error);
    }
  };

  // Handle return
  const handleReturn = async () => {
    if (!selectedItem || qty <= 0) return;
    
    try {
      const response = await fetch('https://buildify-backend-kye8.onrender.com/api/store-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          projectId: selectedItem.projectId,
          projectName: selectedItem.projectName,
          transactionType: 'RETURN',
          itemId: null,
          itemName: selectedItem.itemName,
          unit: selectedItem.unit,
          category: selectedItem.category,
          quantitySupplied: 0,
          quantityIssued: 0,
          quantityReturned: qty,
          balance: selectedItem.balance + qty,
          reference: ref,
          issuedTo: '',
          returnedBy: issuedTo,
          notes: notes
        })
      });
      
      if (response.ok) {
        await fetchData();
        setReturnOpen(false);
        setQty(0);
        setRef('');
        setIssuedTo('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error returning item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'balances' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('balances')}
          >
            Stock Balances
          </Button>
          <Button 
            variant={activeTab === 'ledger' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('ledger')}
          >
            Transaction Ledger
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search items, categories, projects..." 
            className="pl-9" 
          />
        </div>
        <select 
          className="px-3 py-2 border rounded-md text-sm"
          value={selectedProjectId || ''}
          onChange={e => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Stock Balances Tab */}
      {activeTab === 'balances' && (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Project</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Unit</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Supplied</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Issued</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Returned</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Balance</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStock.map(item => (
                <tr key={item.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 text-xs">{item.projectName}</td>
                  <td className="px-4 py-2.5 text-card-foreground font-medium">{item.itemName}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{item.category}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{item.unit}</td>
                  <td className="px-4 py-2.5 font-mono text-center text-success">{item.quantitySupplied}</td>
                  <td className="px-4 py-2.5 font-mono text-center text-destructive">{item.quantityIssued}</td>
                  <td className="px-4 py-2.5 font-mono text-center text-info">{item.quantityReturned}</td>
                  <td className="px-4 py-2.5 font-mono text-center font-bold">
                    <span className={`inline-flex items-center gap-1 ${item.balance <= 10 ? 'text-destructive' : 'text-card-foreground'}`}>
                      {item.balance <= 10 && <AlertTriangle size={12} />}
                      {item.balance}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setSelectedItem(item);
                          setIssueOpen(true);
                        }}
                        disabled={item.balance <= 0}
                      >
                        <ArrowDownToLine size={14} className="mr-1" />Issue
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setSelectedItem(item);
                          setReturnOpen(true);
                        }}
                      >
                        <ArrowUpFromLine size={14} className="mr-1" />Return
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? 'No matching items' : 'No stock data'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Ref</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Project</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Supplied</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Issued</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center">Returned</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 text-xs">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{t.reference || '-'}</td>
                  <td className="px-4 py-2.5 text-xs">{t.projectName}</td>
                  <td className="px-4 py-2.5 text-card-foreground">{t.itemName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      t.transactionType === 'SUPPLY' ? 'bg-success/10 text-success' : 
                      t.transactionType === 'ISSUE' ? 'bg-destructive/10 text-destructive' : 
                      'bg-info/10 text-info'
                    }`}>
                      {t.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-center">{t.quantitySupplied || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-center">{t.quantityIssued || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-center">{t.quantityReturned || '-'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[150px]">
                    {t.notes || '-'}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Material</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold">{selectedItem.itemName}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.projectName}</p>
                <p className="text-sm mt-1">Available: <strong>{selectedItem.balance} {selectedItem.unit}</strong></p>
              </div>
              <div>
                <Label>Quantity to Issue *</Label>
                <Input 
                  type="number" 
                  value={qty || ''} 
                  onChange={e => setQty(Number(e.target.value))}
                  max={selectedItem.balance}
                />
              </div>
              <div>
                <Label>Issued To</Label>
                <Input value={issuedTo} onChange={e => setIssuedTo(e.target.value)} placeholder="Team/Person" />
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="Requisition number" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
                <Button onClick={handleIssue} disabled={qty <= 0 || qty > selectedItem.balance}>Issue</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Material</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="font-semibold">{selectedItem.itemName}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.projectName}</p>
              </div>
              <div>
                <Label>Quantity to Return *</Label>
                <Input type="number" value={qty || ''} onChange={e => setQty(Number(e.target.value))} />
              </div>
              <div>
                <Label>Returned By</Label>
                <Input value={issuedTo} onChange={e => setIssuedTo(e.target.value)} />
              </div>
              <div>
                <Label>Reference</Label>
                <Input value={ref} onChange={e => setRef(e.target.value)} />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
                <Button onClick={handleReturn} disabled={qty <= 0}>Return</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}