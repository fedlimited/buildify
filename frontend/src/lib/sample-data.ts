import { Project, Income, Expense, WorkerCategory, Worker, PayrollRecord, ApprovedItem, Supplier, PurchaseOrder, Supply, StoreTransaction, SiteDiaryEntry } from './types';

export const sampleProjects: Project[] = [
  { id: 1, name: 'Westlands Office Tower', client: 'Pinnacle Developers Ltd', contractSum: 450000000, location: 'Westlands, Nairobi', startDate: '2024-01-15', endDate: '2025-12-31', status: 'Active', projectManager: 'James Mwangi', description: '20-storey commercial office block', createdAt: '2024-01-10' },
  { id: 2, name: 'Kilimani Apartments Phase 2', client: 'Sunrise Real Estate', contractSum: 280000000, location: 'Kilimani, Nairobi', startDate: '2024-03-01', endDate: '2025-08-30', status: 'Active', projectManager: 'Grace Wanjiku', description: 'Luxury residential apartments - 120 units', createdAt: '2024-02-20' },
  { id: 3, name: 'Mombasa Road Warehouse', client: 'Kenya Logistics Corp', contractSum: 85000000, location: 'Mombasa Road, Nairobi', startDate: '2023-06-01', endDate: '2024-06-30', status: 'Completed', projectManager: 'Peter Odhiambo', description: 'Industrial warehouse with loading bays', createdAt: '2023-05-15' },
  { id: 4, name: 'Thika Road Mall Extension', client: 'Garden City Holdings', contractSum: 320000000, location: 'Thika Road, Nairobi', startDate: '2024-06-01', endDate: '2026-03-31', status: 'Active', projectManager: 'James Mwangi', description: 'Shopping mall extension with cinema', createdAt: '2024-05-20' },
];

export const sampleIncome: Income[] = [
  { id: 1, projectId: 1, certificateNo: 'IPC-001', date: '2024-03-15', grossAmount: 45000000, retentionPercent: 5, amountReceived: 34920000, paymentDate: '2024-04-10', paymentMethod: 'Bank Transfer', status: 'Paid', notes: 'First interim certificate', createdAt: '2024-03-15' },
  { id: 2, projectId: 1, certificateNo: 'IPC-002', date: '2024-06-15', grossAmount: 52000000, retentionPercent: 5, amountReceived: 30000000, paymentDate: '2024-07-05', paymentMethod: 'Bank Transfer', status: 'Partial', notes: 'Second interim certificate', createdAt: '2024-06-15' },
  { id: 3, projectId: 2, certificateNo: 'IPC-001', date: '2024-05-20', grossAmount: 35000000, retentionPercent: 10, amountReceived: 27300000, paymentDate: '2024-06-15', paymentMethod: 'Cheque', status: 'Paid', notes: '', createdAt: '2024-05-20' },
  { id: 4, projectId: 3, certificateNo: 'IPC-005', date: '2024-04-10', grossAmount: 25000000, retentionPercent: 5, amountReceived: 0, paymentDate: '', paymentMethod: '', status: 'Pending', notes: 'Final certificate', createdAt: '2024-04-10' },
];

export const sampleExpenses: Expense[] = [
  { id: 1, date: '2024-03-20', projectId: 1, projectName: 'Westlands Office Tower', category: 'Supplier', description: 'Cement - 500 bags Portland 42.5', amount: 450000, vat: 72000, paymentMethod: 'Bank Transfer', status: 'Paid', reference: 'INV-2024-0341', createdAt: '2024-03-20' },
  { id: 2, date: '2024-04-05', projectId: 1, projectName: 'Westlands Office Tower', category: 'Subcontractor', description: 'Electrical works - Phase 1', amount: 2800000, vat: 448000, paymentMethod: 'Cheque', status: 'Paid', reference: 'SC-EL-001', createdAt: '2024-04-05' },
  { id: 3, date: '2024-04-15', projectId: 2, projectName: 'Kilimani Apartments Phase 2', category: 'Equipment', description: 'Tower crane hire - April', amount: 1500000, vat: 240000, paymentMethod: 'Bank Transfer', status: 'Paid', reference: 'EQ-TC-APR', createdAt: '2024-04-15' },
  { id: 4, date: '2024-05-01', projectId: 1, projectName: 'Westlands Office Tower', category: 'Payroll', description: 'Week 18 payroll', amount: 890000, vat: 0, paymentMethod: 'M-Pesa', status: 'Paid', reference: 'PR-W18-2024', createdAt: '2024-05-01' },
  { id: 5, date: '2024-05-10', projectId: 2, projectName: 'Kilimani Apartments Phase 2', category: 'Supplier', description: 'Steel reinforcement - 25 tonnes', amount: 3200000, vat: 512000, paymentMethod: 'Bank Transfer', status: 'Pending', reference: 'INV-2024-0567', createdAt: '2024-05-10' },
  { id: 6, date: '2024-05-15', projectId: 4, projectName: 'Thika Road Mall Extension', category: 'Transport', description: 'Material transport - May batch', amount: 350000, vat: 56000, paymentMethod: 'Cash', status: 'Paid', reference: 'TR-MAY-01', createdAt: '2024-05-15' },
];

export const sampleWorkerCategories: WorkerCategory[] = [
  { id: 1, name: 'Foreman', dayRate: 2500, color: '#3b82f6', isActive: true },
  { id: 2, name: 'Mason', dayRate: 1800, color: '#10b981', isActive: true },
  { id: 3, name: 'Carpenter', dayRate: 1600, color: '#f59e0b', isActive: true },
  { id: 4, name: 'Plumber', dayRate: 2000, color: '#8b5cf6', isActive: true },
  { id: 5, name: 'Labourer', dayRate: 800, color: '#6b7280', isActive: true },
  { id: 6, name: 'Electrician', dayRate: 2200, color: '#ef4444', isActive: true },
];

export const sampleWorkers: Worker[] = [
  { id: 1, name: 'John Kamau', phone: '0712345678', categoryId: 1, projectId: 1, dayRate: 2500, isActive: true, dateAdded: '2024-01-15' },
  { id: 2, name: 'Peter Njoroge', phone: '0723456789', categoryId: 2, projectId: 1, dayRate: 1800, isActive: true, dateAdded: '2024-01-15' },
  { id: 3, name: 'David Ochieng', phone: '0734567890', categoryId: 2, projectId: 1, dayRate: 1800, isActive: true, dateAdded: '2024-01-20' },
  { id: 4, name: 'Samuel Kiprop', phone: '0745678901', categoryId: 3, projectId: 1, dayRate: 1600, isActive: true, dateAdded: '2024-02-01' },
  { id: 5, name: 'Michael Wekesa', phone: '0756789012', categoryId: 5, projectId: 1, dayRate: 800, isActive: true, dateAdded: '2024-02-01' },
  { id: 6, name: 'James Mutua', phone: '0767890123', categoryId: 5, projectId: 2, dayRate: 800, isActive: true, dateAdded: '2024-03-01' },
  { id: 7, name: 'Francis Otieno', phone: '0778901234', categoryId: 4, projectId: 2, dayRate: 2000, isActive: true, dateAdded: '2024-03-01' },
  { id: 8, name: 'Charles Maina', phone: '0789012345', categoryId: 6, projectId: 2, dayRate: 2200, isActive: true, dateAdded: '2024-03-15' },
];

export const sampleApprovedItems: ApprovedItem[] = [
  { id: 1, name: 'Portland Cement 42.5', category: 'Cement', unit: 'bag', defaultPrice: 900, description: '50kg bag', isActive: true },
  { id: 2, name: 'Steel Reinforcement Y12', category: 'Steel', unit: 'tonne', defaultPrice: 128000, description: '12mm deformed bars', isActive: true },
  { id: 3, name: 'Steel Reinforcement Y16', category: 'Steel', unit: 'tonne', defaultPrice: 125000, description: '16mm deformed bars', isActive: true },
  { id: 4, name: 'River Sand', category: 'Aggregates', unit: 'tonne', defaultPrice: 3500, description: 'Clean river sand', isActive: true },
  { id: 5, name: 'Ballast 20mm', category: 'Aggregates', unit: 'tonne', defaultPrice: 4000, description: '20mm crushed stone', isActive: true },
  { id: 6, name: 'Timber 2x4', category: 'Timber', unit: 'piece', defaultPrice: 450, description: '2x4 inch cypress', isActive: true },
  { id: 7, name: 'BRC Mesh A142', category: 'Steel', unit: 'roll', defaultPrice: 18000, description: 'Welded mesh', isActive: true },
  { id: 8, name: 'PVC Pipe 110mm', category: 'Plumbing', unit: 'piece', defaultPrice: 1200, description: '6m length', isActive: true },
  { id: 9, name: 'Electrical Cable 2.5mm', category: 'Electrical', unit: 'roll', defaultPrice: 8500, description: '100m roll', isActive: true },
  { id: 10, name: 'Roofing Sheets 3m', category: 'Roofing', unit: 'piece', defaultPrice: 1800, description: 'Gauge 30 corrugated', isActive: true },
];

export const sampleSuppliers: Supplier[] = [
  { id: 1, name: 'Bamburi Cement Ltd', kraPin: 'P051234567A', phone: '0722111222', email: 'orders@bamburi.co.ke', address: 'Industrial Area, Nairobi', contactPerson: 'Mary Wambui', paymentTerms: '30 days', isActive: true },
  { id: 2, name: 'Devki Steel Mills', kraPin: 'P051234568B', phone: '0733222333', email: 'sales@devki.co.ke', address: 'Athi River, Machakos', contactPerson: 'Rajesh Patel', paymentTerms: '14 days', isActive: true },
  { id: 3, name: 'Timber World Supplies', kraPin: 'P051234569C', phone: '0744333444', email: 'info@timberworld.co.ke', address: 'Ngong Road, Nairobi', contactPerson: 'Joseph Kimani', paymentTerms: '7 days', isActive: true },
];

export const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: 1, orderNumber: 'PO-2024-0001', supplierId: 1, supplierName: 'Bamburi Cement Ltd', projectId: 1, projectName: 'Westlands Office Tower',
    orderDate: '2024-03-10', expectedDate: '2024-03-15',
    items: [
      { itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', quantity: 500, unitPrice: 900, amount: 450000, receivedQuantity: 500 },
    ],
    subtotal: 450000, vat: 72000, total: 522000, status: 'Supplied', paymentStatus: 'Paid', notes: '', createdAt: '2024-03-10'
  },
  {
    id: 2, orderNumber: 'PO-2024-0002', supplierId: 2, supplierName: 'Devki Steel Mills', projectId: 1, projectName: 'Westlands Office Tower',
    orderDate: '2024-04-01', expectedDate: '2024-04-10',
    items: [
      { itemId: 2, itemName: 'Steel Reinforcement Y12', unit: 'tonne', quantity: 15, unitPrice: 128000, amount: 1920000, receivedQuantity: 15 },
      { itemId: 3, itemName: 'Steel Reinforcement Y16', unit: 'tonne', quantity: 10, unitPrice: 125000, amount: 1250000, receivedQuantity: 10 },
    ],
    subtotal: 3170000, vat: 507200, total: 3677200, status: 'Supplied', paymentStatus: 'Unpaid', notes: '', createdAt: '2024-04-01'
  },
];

export const sampleSupplies: Supply[] = [
  { id: 1, supplierId: 1, supplierName: 'Bamburi Cement Ltd', projectId: 1, projectName: 'Westlands Office Tower', date: '2024-03-15', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', quantity: 500, unitPrice: 900, totalAmount: 450000, vat: 72000, status: 'Delivered', paid: true, orderId: 1, deliveryNote: 'DN-001', notes: '', createdAt: '2024-03-15' },
  { id: 2, supplierId: 2, supplierName: 'Devki Steel Mills', projectId: 1, projectName: 'Westlands Office Tower', date: '2024-04-10', itemId: 2, itemName: 'Steel Reinforcement Y12', unit: 'tonne', quantity: 15, unitPrice: 128000, totalAmount: 1920000, vat: 307200, status: 'Delivered', paid: false, orderId: 2, deliveryNote: 'DN-002', notes: '', createdAt: '2024-04-10' },
];

export const sampleStoreTransactions: StoreTransaction[] = [
  { id: 1, date: '2024-03-15', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 500, quantityIssued: 0, quantityReturned: 0, balance: 500, transactionType: 'SUPPLY', reference: 'PO-2024-0001', issuedTo: '', returnedBy: '', notes: '', createdAt: '2024-03-15' },
  { id: 2, date: '2024-03-18', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 0, quantityIssued: 120, quantityReturned: 0, balance: 380, transactionType: 'ISSUE', reference: 'REQ-001', issuedTo: 'Foundation crew', returnedBy: '', notes: 'Column foundations', createdAt: '2024-03-18' },
  { id: 3, date: '2024-03-25', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 0, quantityIssued: 80, quantityReturned: 0, balance: 300, transactionType: 'ISSUE', reference: 'REQ-002', issuedTo: 'Slab crew', returnedBy: '', notes: 'Ground floor slab', createdAt: '2024-03-25' },
  { id: 4, date: '2024-04-10', projectId: 1, projectName: 'Westlands Office Tower', itemId: 2, itemName: 'Steel Reinforcement Y12', unit: 'tonne', category: 'Steel', quantitySupplied: 15, quantityIssued: 0, quantityReturned: 0, balance: 15, transactionType: 'SUPPLY', reference: 'PO-2024-0002', issuedTo: '', returnedBy: '', notes: '', createdAt: '2024-04-10' },
  { id: 5, date: '2024-04-12', projectId: 1, projectName: 'Westlands Office Tower', itemId: 2, itemName: 'Steel Reinforcement Y12', unit: 'tonne', category: 'Steel', quantitySupplied: 0, quantityIssued: 5, quantityReturned: 0, balance: 10, transactionType: 'ISSUE', reference: 'REQ-003', issuedTo: 'Steel fixers', returnedBy: '', notes: '1st floor columns', createdAt: '2024-04-12' },
];

export const samplePayrollRecords: PayrollRecord[] = [
  {
    id: 1, weekNumber: 12, year: 2024, weekStart: '2024-03-18', weekEnd: '2024-03-24', projectId: 1, projectName: 'Westlands Office Tower', status: 'Paid',
    entries: [
      { workerId: 1, workerName: 'John Kamau', categoryId: 1, dayRate: 2500, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }, daysWorked: 6, grossPay: 15000 },
      { workerId: 2, workerName: 'Peter Njoroge', categoryId: 2, dayRate: 1800, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: false }, daysWorked: 5, grossPay: 9000 },
      { workerId: 3, workerName: 'David Ochieng', categoryId: 2, dayRate: 1800, attendance: { sun: false, mon: true, tue: true, wed: false, thu: true, fri: true, sat: true }, daysWorked: 5, grossPay: 9000 },
      { workerId: 4, workerName: 'Samuel Kiprop', categoryId: 3, dayRate: 1600, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: false }, daysWorked: 5, grossPay: 8000 },
      { workerId: 5, workerName: 'Michael Wekesa', categoryId: 5, dayRate: 800, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }, daysWorked: 6, grossPay: 4800 },
    ],
    totalGrossPay: 45800, createdAt: '2024-03-18', approvedAt: '2024-03-24', paidAt: '2024-03-25', expenseId: 4
  },
];

export const sampleSiteDiaryEntries: SiteDiaryEntry[] = [
  {
    id: 1, date: '2024-03-18', projectId: 1, projectName: 'Westlands Office Tower',
    weather: { morning: 'Clear', afternoon: 'Partly Cloudy', evening: 'Clear' },
    totalWorkers: 25,
    activities: [
      { time: '07:00', location: 'Ground Floor', description: 'Column reinforcement fixing for grid A-D', supervisor: 'John Kamau' },
      { time: '10:00', location: 'Site Office', description: 'Progress review meeting with consultant', supervisor: 'James Mwangi' },
    ],
    inspections: [{ type: 'Structural', time: '14:00', inspector: 'Eng. Omondi', findings: 'Column dimensions as per drawing', outcome: 'Pass' }],
    deliveries: [{ supplier: 'Bamburi Cement', time: '08:30', items: '200 bags cement', condition: 'Good', receivedBy: 'Peter Njoroge' }],
    incidents: [],
    challenges: [{ category: 'Material Delay', severity: 'Medium', description: 'Steel delivery delayed by 2 days', action: 'Contacted supplier, ETA confirmed', status: 'Resolved' }],
    summary: { achievement: 'Completed ground floor column reinforcement grid A-D', tomorrowPlan: 'Begin formwork for columns, continue slab preparation', issuesAttention: 'Pending steel delivery for upper floors' },
    status: 'Approved', createdAt: '2024-03-18'
  },
];
