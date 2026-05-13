import { API_BASE_URL } from '@/config/api';
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
export function PaymentsTab() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { selectedProjectId, projects } = useAppStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        const [quotationsRes, expensesRes, subsRes] = await Promise.all([
fetch(`${API_BASE_URL}/quotations`, { headers: { 'Authorization': `Bearer ${token}` } }),
fetch(`${API_BASE_URL}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } }),
fetch(`${API_BASE_URL}/subcontractors`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        let quotations = await quotationsRes.json();
        let expenses = await expensesRes.json();
        const subcontractors = await subsRes.json();
        
        if (selectedProjectId && selectedProjectId !== 'all') {
          const projectIdNum = parseInt(selectedProjectId);
          quotations = quotations.filter(q => q.project_id === projectIdNum);
          expenses = expenses.filter(e => e.project_id === projectIdNum);
        }
        
        const subExpenses = expenses.filter(e => e.category === 'Subcontractor' && e.status === 'Paid');
        
        const results = subcontractors.map(sub => {
          const subQuotes = quotations.filter(q => q.subcontractor_id === sub.id);
          const totalContracted = subQuotes.reduce((sum, q) => sum + (q.amount || 0), 0);
          const subPayments = subExpenses.filter(e => (e.subcontractor_id || e.subcontractorId) === sub.id);
          const totalPaid = subPayments.reduce((sum, e) => sum + (e.amount || 0), 0);
          
          return {
            id: sub.id,
            name: sub.name,
            specialization: sub.specialization || '-',
            totalContracted: totalContracted,
            totalPaid: totalPaid,
            balance: totalContracted - totalPaid,
            quoteCount: subQuotes.length,
            paymentCount: subPayments.length
          };
        }).filter(b => b.totalContracted > 0 || b.totalPaid > 0);
        
        setBalances(results);
        setLoading(false);
      } catch (err) {
        console.error('Error loading payments:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    loadData();
  }, [selectedProjectId]);

  if (loading) {
    return React.createElement('div', { className: "text-center py-8" }, "Loading payment data...");
  }

  if (error) {
    return React.createElement('div', { className: "text-center py-8 text-red-600" }, "Error: ", error);
  }

  if (balances.length === 0) {
    return React.createElement('div', { className: "text-center py-8" }, "No payment data available.");
  }

  const totalContracted = balances.reduce((sum, b) => sum + b.totalContracted, 0);
  const totalPaid = balances.reduce((sum, b) => sum + b.totalPaid, 0);
  const totalBalance = totalContracted - totalPaid;
  
  const selectedProject = projects?.find(p => p.id === parseInt(selectedProjectId));
  const filterLabel = selectedProjectId && selectedProjectId !== 'all' ? selectedProject?.name : 'All Projects';

  return React.createElement('div', { className: "space-y-4" },
    React.createElement('div', { className: "flex justify-between items-center" },
      React.createElement('p', { className: "text-sm text-muted-foreground" },
        "Showing data for: ", React.createElement('strong', null, filterLabel), " (", balances.length, " subcontractor(s))"
      )
    ),
    React.createElement('div', { className: "overflow-x-auto rounded-lg border border-border" },
      React.createElement('table', { className: "w-full text-sm" },
        React.createElement('thead', { className: "bg-muted/50" },
          React.createElement('tr', { className: "border-b border-border" },
            React.createElement('th', { className: "px-4 py-3 text-left" }, "Subcontractor"),
            React.createElement('th', { className: "px-4 py-3 text-left" }, "Specialization"),
            React.createElement('th', { className: "px-4 py-3 text-right" }, "Contracted (KES)"),
            React.createElement('th', { className: "px-4 py-3 text-right" }, "Paid (KES)"),
            React.createElement('th', { className: "px-4 py-3 text-right" }, "Balance (KES)"),
            React.createElement('th', { className: "px-4 py-3 text-center" }, "Quotes"),
            React.createElement('th', { className: "px-4 py-3 text-center" }, "Payments")
          )
        ),
        React.createElement('tbody', null,
          balances.map((b) =>
            React.createElement('tr', { key: b.id, className: "border-b border-border hover:bg-muted/30" },
              React.createElement('td', { className: "px-4 py-2.5 font-medium" }, b.name),
              React.createElement('td', { className: "px-4 py-2.5 text-muted-foreground" }, b.specialization),
              React.createElement('td', { className: "px-4 py-2.5 text-right font-mono" }, b.totalContracted.toLocaleString(), " KES"),
              React.createElement('td', { className: "px-4 py-2.5 text-right font-mono text-green-600" }, b.totalPaid.toLocaleString(), " KES"),
              React.createElement('td', { className: "px-4 py-2.5 text-right font-mono font-bold" },
                React.createElement('span', { className: b.balance > 0 ? 'text-red-500' : 'text-orange-500' },
                  Math.abs(b.balance).toLocaleString(), " KES ", b.balance > 0 ? '(Owed)' : '(Overpaid)'
                )
              ),
              React.createElement('td', { className: "px-4 py-2.5 text-center" }, b.quoteCount),
              React.createElement('td', { className: "px-4 py-2.5 text-center" }, b.paymentCount)
            )
          )
        ),
        React.createElement('tfoot', { className: "bg-muted/30 border-t border-border" },
          React.createElement('tr', { className: "font-semibold" },
            React.createElement('td', { colSpan: "2", className: "px-4 py-3 text-right" }, "Totals:"),
            React.createElement('td', { className: "px-4 py-3 text-right font-mono" }, totalContracted.toLocaleString(), " KES"),
            React.createElement('td', { className: "px-4 py-3 text-right font-mono text-green-600" }, totalPaid.toLocaleString(), " KES"),
            React.createElement('td', { className: "px-4 py-3 text-right font-mono font-bold" },
              React.createElement('span', { className: totalBalance > 0 ? 'text-red-500' : 'text-orange-500' },
                Math.abs(totalBalance).toLocaleString(), " KES"
              )
            ),
            React.createElement('td', { colSpan: "2" })
          )
        )
      )
    )
  );
}