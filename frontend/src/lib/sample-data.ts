import { Project, Income, Expense, WorkerCategory, Worker, PayrollRecord, ApprovedItem, Supplier, PurchaseOrder, Supply, StoreTransaction, SiteDiaryEntry } from './types';

export const sampleProjects: Project[] = [
  { id: 1, name: 'Westlands Office Tower', client: 'Pinnacle Developers Ltd', contractSum: 450000000, location: 'Westlands, Nairobi', startDate: '2024-01-15', endDate: '2025-12-31', status: 'Active', projectManager: 'James Mwangi', description: '20-storey commercial office block', createdAt: '2024-01-10' },
  { id: 2, name: 'Kilimani Apartments Phase 2', client: 'Sunrise Real Estate', contractSum: 280000000, location: 'Kilimani, Nairobi', startDate: '2024-03-01', endDate: '2025-08-30', status: 'Active', projectManager: 'Grace Wanjiku', description: 'Luxury residential apartments - 120 units', createdAt: '2024-02-20' },
  { id: 3, name: 'Mombasa Road Warehouse', client: 'Kenya Logistics Corp', contractSum: 85000000, location: 'Mombasa Road, Nairobi', startDate: '2023-06-01', endDate: '2024-06-30', status: 'Completed', projectManager: 'Peter Odhiambo', description: 'Industrial warehouse with loading bays', createdAt: '2023-05-15' },
  { id: 4, name: 'Thika Road Mall Extension', client: 'Garden City Holdings', contractSum: 320000000, location: 'Thika Road, Nairobi', startDate: '2024-06-01', endDate: '2026-03-31', status: 'Active', projectManager: 'James Mwangi', description: 'Shopping mall extension with cinema', createdAt: '2024-05-20' },
  { id: 5, name: 'Kisumu Lakeside Resort', client: 'Lake Basin Development', contractSum: 150000000, location: 'Kisumu', startDate: '2024-07-01', endDate: '2025-12-31', status: 'Active', projectManager: 'Odhiambo Omondi', description: 'Tourist resort with conference facilities', createdAt: '2024-06-15' },
];

export const sampleIncome: Income[] = [
  { id: 1, projectId: 1, certificateNo: 'IPC-001', date: '2024-03-15', grossAmount: 45000000, retentionPercent: 5, amountReceived: 34920000, paymentDate: '2024-04-10', paymentMethod: 'Bank Transfer', status: 'Paid', notes: 'First interim certificate', createdAt: '2024-03-15' },
  { id: 2, projectId: 1, certificateNo: 'IPC-002', date: '2024-06-15', grossAmount: 52000000, retentionPercent: 5, amountReceived: 30000000, paymentDate: '2024-07-05', paymentMethod: 'Bank Transfer', status: 'Partial', notes: 'Second interim certificate', createdAt: '2024-06-15' },
  { id: 3, projectId: 2, certificateNo: 'IPC-001', date: '2024-05-20', grossAmount: 35000000, retentionPercent: 10, amountReceived: 27300000, paymentDate: '2024-06-15', paymentMethod: 'Cheque', status: 'Paid', notes: '', createdAt: '2024-05-20' },
  { id: 4, projectId: 3, certificateNo: 'IPC-005', date: '2024-04-10', grossAmount: 25000000, retentionPercent: 5, amountReceived: 0, paymentDate: '', paymentMethod: '', status: 'Pending', notes: 'Final certificate', createdAt: '2024-04-10' },
  { id: 5, projectId: 5, certificateNo: 'IPC-001', date: '2024-08-15', grossAmount: 18000000, retentionPercent: 5, amountReceived: 13680000, paymentDate: '2024-09-01', paymentMethod: 'Bank Transfer', status: 'Paid', notes: 'Foundation works', createdAt: '2024-08-15' },
];

export const sampleExpenses: Expense[] = [
  { id: 1, date: '2024-03-20', projectId: 1, projectName: 'Westlands Office Tower', category: 'Supplier', description: 'Cement - 500 bags Portland 42.5', amount: 450000, vat: 72000, paymentMethod: 'Bank Transfer', status: 'Paid', reference: 'INV-2024-0341', createdAt: '2024-03-20' },
  { id: 2, date: '2024-04-05', projectId: 1, projectName: 'Westlands Office Tower', category: 'Subcontractor', description: 'Electrical works - Phase 1', amount: 2800000, vat: 448000, paymentMethod: 'Cheque', status: 'Paid', reference: 'SC-EL-001', createdAt: '2024-04-05' },
  { id: 3, date: '2024-04-15', projectId: 2, projectName: 'Kilimani Apartments Phase 2', category: 'Equipment', description: 'Tower crane hire - April', amount: 1500000, vat: 240000, paymentMethod: 'Bank Transfer', status: 'Paid', reference: 'EQ-TC-APR', createdAt: '2024-04-15' },
  { id: 4, date: '2024-05-01', projectId: 1, projectName: 'Westlands Office Tower', category: 'Payroll', description: 'Week 18 payroll', amount: 890000, vat: 0, paymentMethod: 'M-Pesa', status: 'Paid', reference: 'PR-W18-2024', createdAt: '2024-05-01' },
  { id: 5, date: '2024-05-10', projectId: 2, projectName: 'Kilimani Apartments Phase 2', category: 'Supplier', description: 'Steel reinforcement - 25 tonnes', amount: 3200000, vat: 512000, paymentMethod: 'Bank Transfer', status: 'Pending', reference: 'INV-2024-0567', createdAt: '2024-05-10' },
  { id: 6, date: '2024-05-15', projectId: 4, projectName: 'Thika Road Mall Extension', category: 'Transport', description: 'Material transport - May batch', amount: 350000, vat: 56000, paymentMethod: 'Cash', status: 'Paid', reference: 'TR-MAY-01', createdAt: '2024-05-15' },
  { id: 7, date: '2024-07-20', projectId: 5, projectName: 'Kisumu Lakeside Resort', category: 'Supplier', description: 'Foundation materials', amount: 850000, vat: 136000, paymentMethod: 'Bank Transfer', status: 'Paid', reference: 'INV-2024-0891', createdAt: '2024-07-20' },
];

export const sampleWorkerCategories: WorkerCategory[] = [
  { id: 1, name: 'Foreman', dayRate: 2500, color: '#3b82f6', isActive: true },
  { id: 2, name: 'Mason', dayRate: 1800, color: '#10b981', isActive: true },
  { id: 3, name: 'Carpenter', dayRate: 1600, color: '#f59e0b', isActive: true },
  { id: 4, name: 'Plumber', dayRate: 2000, color: '#8b5cf6', isActive: true },
  { id: 5, name: 'Labourer', dayRate: 800, color: '#6b7280', isActive: true },
  { id: 6, name: 'Electrician', dayRate: 2200, color: '#ef4444', isActive: true },
  { id: 7, name: 'Welder', dayRate: 1400, color: '#d97706', isActive: true },
  { id: 8, name: 'Painter', dayRate: 1200, color: '#ec489a', isActive: true },
  { id: 9, name: 'Driver', dayRate: 1300, color: '#14b8a6', isActive: true },
  { id: 10, name: 'Security', dayRate: 900, color: '#6b7280', isActive: true },
];

export const sampleWorkers: Worker[] = [
  // ========== PROJECT 1: Westlands Office Tower (10 workers) ==========
  // Central Kenya
  { id: 1, name: 'John Kamau', phone: '08123456789', categoryId: 1, projectId: 1, dayRate: 2500, isActive: true, dateAdded: '2024-01-15' },
  { id: 2, name: 'Wanjiku Muthoni', phone: '08234567890', categoryId: 2, projectId: 1, dayRate: 1800, isActive: true, dateAdded: '2024-01-15' },
  { id: 3, name: 'Mutuku Nthenya', phone: '08345678901', categoryId: 2, projectId: 1, dayRate: 1800, isActive: true, dateAdded: '2024-01-20' },
  // Western Kenya
  { id: 4, name: 'Wekesa Simiyu', phone: '08456789012', categoryId: 5, projectId: 1, dayRate: 800, isActive: true, dateAdded: '2024-02-01' },
  { id: 5, name: 'Nekesa Khisa', phone: '08567890123', categoryId: 1, projectId: 1, dayRate: 2500, isActive: true, dateAdded: '2024-02-10' },
  { id: 6, name: 'Barasa Wanjala', phone: '08678901234', categoryId: 4, projectId: 1, dayRate: 2000, isActive: true, dateAdded: '2024-02-10' },
  // Nyanza
  { id: 7, name: 'Odhiambo Omondi', phone: '08789012345', categoryId: 2, projectId: 1, dayRate: 1800, isActive: true, dateAdded: '2024-02-15' },
  { id: 8, name: 'Atieno Achieng', phone: '08890123456', categoryId: 5, projectId: 1, dayRate: 800, isActive: true, dateAdded: '2024-02-20' },
  // Rift Valley
  { id: 9, name: 'Kiprop Kimutai', phone: '08901234567', categoryId: 3, projectId: 1, dayRate: 1600, isActive: true, dateAdded: '2024-02-25' },
  { id: 10, name: 'Cherop Jerotich', phone: '08012345678', categoryId: 6, projectId: 1, dayRate: 2200, isActive: true, dateAdded: '2024-03-01' },

  // ========== PROJECT 2: Kilimani Apartments (10 workers) ==========
  // Rift Valley (Maasai/Samburu)
  { id: 11, name: 'Lekuta Naserian', phone: '08123456780', categoryId: 1, projectId: 2, dayRate: 2500, isActive: true, dateAdded: '2024-03-01' },
  { id: 12, name: 'Senteu Kirui', phone: '08234567891', categoryId: 2, projectId: 2, dayRate: 1800, isActive: true, dateAdded: '2024-03-05' },
  // Turkana
  { id: 13, name: 'Ekuwam Nakiong', phone: '08345678902', categoryId: 5, projectId: 2, dayRate: 800, isActive: true, dateAdded: '2024-03-10' },
  // Coastal
  { id: 14, name: 'Hassan Ali', phone: '08456789013', categoryId: 3, projectId: 2, dayRate: 1600, isActive: true, dateAdded: '2024-03-15' },
  { id: 15, name: 'Fatma Said', phone: '08567890124', categoryId: 4, projectId: 2, dayRate: 2000, isActive: true, dateAdded: '2024-03-20' },
  // Central
  { id: 16, name: 'Makena Ciiru', phone: '08678901235', categoryId: 6, projectId: 2, dayRate: 2200, isActive: true, dateAdded: '2024-03-25' },
  // Western
  { id: 17, name: 'Nasimiyu Khaemba', phone: '08789012346', categoryId: 2, projectId: 2, dayRate: 1800, isActive: true, dateAdded: '2024-03-30' },
  // Kisii
  { id: 18, name: 'Ombui Nyangwara', phone: '08890123457', categoryId: 5, projectId: 2, dayRate: 800, isActive: true, dateAdded: '2024-04-01' },
  // Tanzanian
  { id: 19, name: 'Juma Mwinyi', phone: '08901234568', categoryId: 1, projectId: 2, dayRate: 2500, isActive: true, dateAdded: '2024-04-05' },
  { id: 20, name: 'Asha Mfaume', phone: '08012345679', categoryId: 3, projectId: 2, dayRate: 1600, isActive: true, dateAdded: '2024-04-10' },

  // ========== PROJECT 3: Mombasa Road Warehouse (10 workers) ==========
  // North Eastern/Somali
  { id: 21, name: 'Abdi Mohammed', phone: '08123456781', categoryId: 1, projectId: 3, dayRate: 2500, isActive: true, dateAdded: '2023-06-01' },
  { id: 22, name: 'Fatuma Hassan', phone: '08234567892', categoryId: 2, projectId: 3, dayRate: 1800, isActive: true, dateAdded: '2023-06-05' },
  { id: 23, name: 'Omar Ibrahim', phone: '08345678903', categoryId: 5, projectId: 3, dayRate: 800, isActive: true, dateAdded: '2023-06-10' },
  // Coastal
  { id: 24, name: 'Mwanaisha Juma', phone: '08456789014', categoryId: 4, projectId: 3, dayRate: 2000, isActive: true, dateAdded: '2023-06-15' },
  { id: 25, name: 'Salim Abdallah', phone: '08567890125', categoryId: 6, projectId: 3, dayRate: 2200, isActive: true, dateAdded: '2023-06-20' },
  // Ugandan
  { id: 26, name: 'Okello Ocen', phone: '08678901236', categoryId: 2, projectId: 3, dayRate: 1800, isActive: true, dateAdded: '2023-06-25' },
  { id: 27, name: 'Atim Akello', phone: '08789012347', categoryId: 5, projectId: 3, dayRate: 800, isActive: true, dateAdded: '2023-07-01' },
  // Rwandan
  { id: 28, name: 'Habimana Uwimana', phone: '08890123458', categoryId: 3, projectId: 3, dayRate: 1600, isActive: true, dateAdded: '2023-07-05' },
  // South Sudanese
  { id: 29, name: 'Kuol Deng', phone: '08901234569', categoryId: 1, projectId: 3, dayRate: 2500, isActive: true, dateAdded: '2023-07-10' },
  { id: 30, name: 'Nyalual Malek', phone: '08012345670', categoryId: 4, projectId: 3, dayRate: 2000, isActive: true, dateAdded: '2023-07-15' },

  // ========== PROJECT 4: Thika Road Mall Extension (10 workers) ==========
  // Ethiopian
  { id: 31, name: 'Tadesse Bekele', phone: '08123456782', categoryId: 1, projectId: 4, dayRate: 2500, isActive: true, dateAdded: '2024-06-01' },
  // Congolese
  { id: 32, name: 'Kabongo Mwamba', phone: '08234567893', categoryId: 2, projectId: 4, dayRate: 1800, isActive: true, dateAdded: '2024-06-05' },
  // Meru
  { id: 33, name: 'Muguna Mwenda', phone: '08345678904', categoryId: 5, projectId: 4, dayRate: 800, isActive: true, dateAdded: '2024-06-10' },
  // Tharaka
  { id: 34, name: 'Mutungi Murithi', phone: '08456789015', categoryId: 3, projectId: 4, dayRate: 1600, isActive: true, dateAdded: '2024-06-15' },
  // Burundian
  { id: 35, name: 'Nkurunziza Manirakiza', phone: '08567890126', categoryId: 4, projectId: 4, dayRate: 2000, isActive: true, dateAdded: '2024-06-20' },
  // Coastal
  { id: 36, name: 'Rehema Kombo', phone: '08678901237', categoryId: 6, projectId: 4, dayRate: 2200, isActive: true, dateAdded: '2024-06-25' },
  // Western
  { id: 37, name: 'Khaemba Wanjala', phone: '08789012348', categoryId: 2, projectId: 4, dayRate: 1800, isActive: true, dateAdded: '2024-06-30' },
  // Kamba
  { id: 38, name: 'Mwikali Ndinda', phone: '08890123459', categoryId: 5, projectId: 4, dayRate: 800, isActive: true, dateAdded: '2024-07-01' },
  // Gusii
  { id: 39, name: 'Mogaka Matongo', phone: '08901234560', categoryId: 1, projectId: 4, dayRate: 2500, isActive: true, dateAdded: '2024-07-05' },
  // Luo
  { id: 40, name: 'Adhiambo Ochieng', phone: '08012345671', categoryId: 3, projectId: 4, dayRate: 1600, isActive: true, dateAdded: '2024-07-10' },

  // ========== PROJECT 5: Kisumu Lakeside Resort (10 workers) ==========
  // Luo (Local to Kisumu)
  { id: 41, name: 'Omondi Odhiambo', phone: '08123456783', categoryId: 1, projectId: 5, dayRate: 2500, isActive: true, dateAdded: '2024-07-15' },
  { id: 42, name: 'Atieno Achieng', phone: '08234567894', categoryId: 2, projectId: 5, dayRate: 1800, isActive: true, dateAdded: '2024-07-20' },
  { id: 43, name: 'Otieno Opiyo', phone: '08345678905', categoryId: 5, projectId: 5, dayRate: 800, isActive: true, dateAdded: '2024-07-25' },
  // Luhya (Western)
  { id: 44, name: 'Simiyu Wekesa', phone: '08456789016', categoryId: 3, projectId: 5, dayRate: 1600, isActive: true, dateAdded: '2024-08-01' },
  { id: 45, name: 'Nangila Khisa', phone: '08567890127', categoryId: 4, projectId: 5, dayRate: 2000, isActive: true, dateAdded: '2024-08-05' },
  // Kisii
  { id: 46, name: 'Nyangwara Ombui', phone: '08678901238', categoryId: 6, projectId: 5, dayRate: 2200, isActive: true, dateAdded: '2024-08-10' },
  // Kalenjin
  { id: 47, name: 'Kipruto Cheruiyot', phone: '08789012349', categoryId: 2, projectId: 5, dayRate: 1800, isActive: true, dateAdded: '2024-08-15' },
  // Teso
  { id: 48, name: 'Emuria Olesi', phone: '08890123450', categoryId: 5, projectId: 5, dayRate: 800, isActive: true, dateAdded: '2024-08-20' },
  // Ugandan (cross-border worker)
  { id: 49, name: 'Mugisha Ssekandi', phone: '08901234561', categoryId: 1, projectId: 5, dayRate: 2500, isActive: true, dateAdded: '2024-08-25' },
  { id: 50, name: 'Nakato Babirye', phone: '08012345672', categoryId: 3, projectId: 5, dayRate: 1600, isActive: true, dateAdded: '2024-08-30' },
];

export const sampleApprovedItems: ApprovedItem[] = [
  // Cement
  { id: 1, name: 'Portland Cement 42.5', category: 'Cement', unit: 'bag', defaultPrice: 950, description: '50kg bag, high strength', isActive: true },
  { id: 2, name: 'Portland Cement 32.5', category: 'Cement', unit: 'bag', defaultPrice: 850, description: '50kg bag, general purpose', isActive: true },
  // Steel
  { id: 3, name: 'Steel Bar Y12', category: 'Steel', unit: 'tonne', defaultPrice: 120000, description: '12mm deformed bars', isActive: true },
  { id: 4, name: 'Steel Bar Y16', category: 'Steel', unit: 'tonne', defaultPrice: 122000, description: '16mm deformed bars', isActive: true },
  { id: 5, name: 'Steel Bar Y10', category: 'Steel', unit: 'tonne', defaultPrice: 118000, description: '10mm deformed bars', isActive: true },
  { id: 6, name: 'Steel Bar Y8', category: 'Steel', unit: 'tonne', defaultPrice: 115000, description: '8mm deformed bars', isActive: true },
  { id: 7, name: 'BRC Mesh A142', category: 'Steel', unit: 'roll', defaultPrice: 18000, description: 'Welded mesh', isActive: true },
  // Aggregates
  { id: 8, name: 'River Sand', category: 'Aggregates', unit: 'tonne', defaultPrice: 3500, description: 'Clean river sand', isActive: true },
  { id: 9, name: 'Ballast 20mm', category: 'Aggregates', unit: 'tonne', defaultPrice: 4000, description: '20mm crushed stone', isActive: true },
  { id: 10, name: 'Ballast 10mm', category: 'Aggregates', unit: 'tonne', defaultPrice: 4200, description: '10mm crushed stone', isActive: true },
  // Blocks
  { id: 11, name: '6-inch Hollow Block', category: 'Blocks', unit: 'piece', defaultPrice: 180, description: '150x200x400mm', isActive: true },
  { id: 12, name: '4-inch Hollow Block', category: 'Blocks', unit: 'piece', defaultPrice: 140, description: '100x200x400mm', isActive: true },
  { id: 13, name: '6-inch Solid Block', category: 'Blocks', unit: 'piece', defaultPrice: 220, description: '150x200x400mm', isActive: true },
  // Timber
  { id: 14, name: 'Cypress 2x4', category: 'Timber', unit: 'piece', defaultPrice: 480, description: '2x4 inch, 12ft length', isActive: true },
  { id: 15, name: 'Cypress 2x3', category: 'Timber', unit: 'piece', defaultPrice: 380, description: '2x3 inch, 12ft length', isActive: true },
  { id: 16, name: 'Plywood 12mm', category: 'Timber', unit: 'sheet', defaultPrice: 3200, description: '4x8 feet', isActive: true },
  { id: 17, name: 'Plywood 18mm', category: 'Timber', unit: 'sheet', defaultPrice: 4200, description: '4x8 feet', isActive: true },
  // Roofing
  { id: 18, name: 'Iron Sheet Gauge 30', category: 'Roofing', unit: 'piece', defaultPrice: 1850, description: '3m length, corrugated', isActive: true },
  { id: 19, name: 'Iron Sheet Gauge 28', category: 'Roofing', unit: 'piece', defaultPrice: 2100, description: '3m length, corrugated', isActive: true },
  { id: 20, name: 'Box Profile Sheet', category: 'Roofing', unit: 'piece', defaultPrice: 2800, description: '3m length', isActive: true },
  // Plumbing
  { id: 21, name: 'PVC Pipe 110mm', category: 'Plumbing', unit: 'piece', defaultPrice: 1800, description: '6m length', isActive: true },
  { id: 22, name: 'PVC Pipe 50mm', category: 'Plumbing', unit: 'piece', defaultPrice: 850, description: '6m length', isActive: true },
  { id: 23, name: 'Water Closet (WC)', category: 'Plumbing', unit: 'piece', defaultPrice: 5500, description: 'Toilet pan', isActive: true },
  // Electrical
  { id: 24, name: 'Electrical Cable 2.5mm', category: 'Electrical', unit: 'roll', defaultPrice: 8500, description: '100m roll', isActive: true },
  { id: 25, name: 'Electrical Cable 1.5mm', category: 'Electrical', unit: 'roll', defaultPrice: 6500, description: '100m roll', isActive: true },
  { id: 26, name: 'LED Bulb 9W', category: 'Electrical', unit: 'piece', defaultPrice: 250, description: 'Daylight', isActive: true },
  // Paint
  { id: 27, name: 'Emulsion Paint White', category: 'Paint', unit: 'litre', defaultPrice: 450, description: 'Interior', isActive: true },
  { id: 28, name: 'Emulsion Paint Colored', category: 'Paint', unit: 'litre', defaultPrice: 550, description: 'Interior', isActive: true },
  // Finishes
  { id: 29, name: 'Ceramic Tiles 30x30', category: 'Finishing', unit: 'sqm', defaultPrice: 1200, description: 'Floor tiles', isActive: true },
  { id: 30, name: 'Ceramic Tiles 20x30', category: 'Finishing', unit: 'sqm', defaultPrice: 1100, description: 'Wall tiles', isActive: true },
];

export const sampleSuppliers: Supplier[] = [
  { id: 1, name: 'Bamburi Cement Ltd', kraPin: 'P051234567A', phone: '08123456789', email: 'orders@bamburi.co.ke', address: 'Industrial Area, Nairobi', contactPerson: 'Mary Wambui', paymentTerms: '30 days', isActive: true },
  { id: 2, name: 'Devki Steel Mills', kraPin: 'P051234568B', phone: '08234567890', email: 'sales@devki.co.ke', address: 'Athi River, Machakos', contactPerson: 'Rajesh Patel', paymentTerms: '14 days', isActive: true },
  { id: 3, name: 'Timber World Supplies', kraPin: 'P051234569C', phone: '08345678901', email: 'info@timberworld.co.ke', address: 'Ngong Road, Nairobi', contactPerson: 'Joseph Kimani', paymentTerms: '7 days', isActive: true },
  { id: 4, name: 'Coastal Hardware', kraPin: 'P059999999Z', phone: '08456789012', email: 'info@coastalhardware.com', address: 'Mombasa, Kenya', contactPerson: 'Hassan Ali', paymentTerms: '60 days', isActive: true },
  { id: 5, name: 'Kenya Electricals Ltd', kraPin: 'P051234570D', phone: '08567890123', email: 'sales@kenyaelectricals.co.ke', address: 'Enterprise Road, Nairobi', contactPerson: 'John Mwangi', paymentTerms: '30 days', isActive: true },
];

export const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: 1, orderNumber: 'PO-2024-0001', supplierId: 1, supplierName: 'Bamburi Cement Ltd', projectId: 1, projectName: 'Westlands Office Tower',
    orderDate: '2024-03-10', expectedDate: '2024-03-15',
    items: [
      { itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', quantity: 500, unitPrice: 950, amount: 475000, receivedQuantity: 500 },
    ],
    subtotal: 475000, vat: 76000, total: 551000, status: 'Supplied', paymentStatus: 'Paid', notes: '', createdAt: '2024-03-10'
  },
  {
    id: 2, orderNumber: 'PO-2024-0002', supplierId: 2, supplierName: 'Devki Steel Mills', projectId: 1, projectName: 'Westlands Office Tower',
    orderDate: '2024-04-01', expectedDate: '2024-04-10',
    items: [
      { itemId: 3, itemName: 'Steel Bar Y12', unit: 'tonne', quantity: 15, unitPrice: 120000, amount: 1800000, receivedQuantity: 15 },
      { itemId: 4, itemName: 'Steel Bar Y16', unit: 'tonne', quantity: 10, unitPrice: 122000, amount: 1220000, receivedQuantity: 10 },
    ],
    subtotal: 3020000, vat: 483200, total: 3503200, status: 'Supplied', paymentStatus: 'Unpaid', notes: '', createdAt: '2024-04-01'
  },
];

export const sampleSupplies: Supply[] = [
  { id: 1, supplierId: 1, supplierName: 'Bamburi Cement Ltd', projectId: 1, projectName: 'Westlands Office Tower', date: '2024-03-15', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', quantity: 500, unitPrice: 950, totalAmount: 475000, vat: 76000, status: 'Delivered', paid: true, orderId: 1, deliveryNote: 'DN-001', notes: '', createdAt: '2024-03-15' },
  { id: 2, supplierId: 2, supplierName: 'Devki Steel Mills', projectId: 1, projectName: 'Westlands Office Tower', date: '2024-04-10', itemId: 3, itemName: 'Steel Bar Y12', unit: 'tonne', quantity: 15, unitPrice: 120000, totalAmount: 1800000, vat: 288000, status: 'Delivered', paid: false, orderId: 2, deliveryNote: 'DN-002', notes: '', createdAt: '2024-04-10' },
];

export const sampleStoreTransactions: StoreTransaction[] = [
  { id: 1, date: '2024-03-15', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 500, quantityIssued: 0, quantityReturned: 0, balance: 500, transactionType: 'SUPPLY', reference: 'PO-2024-0001', issuedTo: '', returnedBy: '', notes: '', createdAt: '2024-03-15' },
  { id: 2, date: '2024-03-18', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 0, quantityIssued: 120, quantityReturned: 0, balance: 380, transactionType: 'ISSUE', reference: 'REQ-001', issuedTo: 'Foundation crew', returnedBy: '', notes: 'Column foundations', createdAt: '2024-03-18' },
  { id: 3, date: '2024-03-25', projectId: 1, projectName: 'Westlands Office Tower', itemId: 1, itemName: 'Portland Cement 42.5', unit: 'bag', category: 'Cement', quantitySupplied: 0, quantityIssued: 80, quantityReturned: 0, balance: 300, transactionType: 'ISSUE', reference: 'REQ-002', issuedTo: 'Slab crew', returnedBy: '', notes: 'Ground floor slab', createdAt: '2024-03-25' },
  { id: 4, date: '2024-04-10', projectId: 1, projectName: 'Westlands Office Tower', itemId: 3, itemName: 'Steel Bar Y12', unit: 'tonne', category: 'Steel', quantitySupplied: 15, quantityIssued: 0, quantityReturned: 0, balance: 15, transactionType: 'SUPPLY', reference: 'PO-2024-0002', issuedTo: '', returnedBy: '', notes: '', createdAt: '2024-04-10' },
  { id: 5, date: '2024-04-12', projectId: 1, projectName: 'Westlands Office Tower', itemId: 3, itemName: 'Steel Bar Y12', unit: 'tonne', category: 'Steel', quantitySupplied: 0, quantityIssued: 5, quantityReturned: 0, balance: 10, transactionType: 'ISSUE', reference: 'REQ-003', issuedTo: 'Steel fixers', returnedBy: '', notes: '1st floor columns', createdAt: '2024-04-12' },
];

export const samplePayrollRecords: PayrollRecord[] = [
  {
    id: 1, weekNumber: 12, year: 2024, weekStart: '2024-03-18', weekEnd: '2024-03-24', projectId: 1, projectName: 'Westlands Office Tower', status: 'Paid',
    entries: [
      { workerId: 1, workerName: 'John Kamau', categoryId: 1, dayRate: 2500, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }, daysWorked: 6, grossPay: 15000 },
      { workerId: 2, workerName: 'Wanjiku Muthoni', categoryId: 2, dayRate: 1800, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: false }, daysWorked: 5, grossPay: 9000 },
      { workerId: 4, workerName: 'Wekesa Simiyu', categoryId: 5, dayRate: 800, attendance: { sun: false, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true }, daysWorked: 6, grossPay: 4800 },
    ],
    totalGrossPay: 28800, createdAt: '2024-03-18', approvedAt: '2024-03-24', paidAt: '2024-03-25', expenseId: 4
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