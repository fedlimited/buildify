require('dotenv').config();
const currencyController = require('./controllers/currencyController');
const SettingsController = require('./controllers/settingsController');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initializeDatabase, getDb } = require('./config/database');
const { authenticateToken, requireAdmin, requireCompanyAccess } = require('./middleware/auth');
const authController = require('./controllers/authController');
const projectController = require('./controllers/projectController');
const userController = require('./controllers/userController');
const companyController = require('./controllers/companyController');
const WorkerController = require('./controllers/workerController');
const WorkerCategoryController = require('./controllers/workerCategoryController');
const ExpenseController = require('./controllers/expenseController');
const IncomeController = require('./controllers/incomeController');
const PayrollController = require('./controllers/payrollController');
const ApprovedItemController = require('./controllers/approvedItemController');
const SupplierController = require('./controllers/supplierController');
const PurchaseOrderController = require('./controllers/purchaseOrderController');
const SupplyController = require('./controllers/supplyController');
const StoreTransactionController = require('./controllers/storeTransactionController');
const SiteDiaryController = require('./controllers/siteDiaryController');
const SubcontractorController = require('./controllers/subcontractorController');
const QuotationController = require('./controllers/quotationController');
const InvoiceController = require('./controllers/invoiceController');
const otpController = require('./controllers/otpController');
const { verifyTransporter } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ========== PUBLIC ROUTES ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Verify email service on startup
verifyTransporter().catch(console.error);

// OTP Authentication Routes
app.post('/api/auth/send-login-otp', otpController.sendLoginOTP);
app.post('/api/auth/verify-login-otp', otpController.verifyLoginOTP);
app.post('/api/auth/send-registration-otp', otpController.sendRegistrationOTP);
app.post('/api/auth/verify-registration-otp', otpController.verifyRegistrationOTP);
app.post('/api/auth/resend-otp', otpController.resendOTP);

// Traditional login (keep for backward compatibility)
app.post('/api/auth/login', authController.login);
app.post('/api/companies/register', companyController.registerCompany);

// ========== PROTECTED ROUTES ==========
app.use('/api', authenticateToken, requireCompanyAccess);

app.get('/api/auth/me', authController.getCurrentUser);

// Currency routes
app.get('/api/currency/settings', currencyController.getCurrencySettings);
app.put('/api/currency/settings', currencyController.updateCurrencySettings);
app.get('/api/currency/available', currencyController.getAvailableCurrencies);

// Company routes
app.get('/api/company', companyController.getCompanyInfo);
app.put('/api/company', requireAdmin, companyController.updateCompanyInfo);

// Settings routes
app.get('/api/settings', authenticateToken, SettingsController.getSettings);
app.put('/api/settings', authenticateToken, requireAdmin, SettingsController.updateSettings);

// User management (admin only)
app.get('/api/users', requireAdmin, userController.getUsers);
app.post('/api/users', requireAdmin, userController.createUser);
app.put('/api/users/:id', requireAdmin, userController.updateUser);
app.delete('/api/users/:id', requireAdmin, userController.deleteUser);

// Project routes
app.get('/api/projects', projectController.getProjects);
app.get('/api/projects/:id', projectController.getProject);
app.post('/api/projects', projectController.createProject);
app.put('/api/projects/:id', projectController.updateProject);
app.delete('/api/projects/:id', projectController.deleteProject);

// Worker routes
app.get('/api/workers', WorkerController.getWorkers);
app.get('/api/workers/:id', WorkerController.getWorker);
app.post('/api/workers', WorkerController.createWorker);
app.put('/api/workers/:id', WorkerController.updateWorker);
app.delete('/api/workers/:id', WorkerController.deleteWorker);

// Worker Category routes
app.get('/api/worker-categories', WorkerCategoryController.getCategories);
app.post('/api/worker-categories', WorkerCategoryController.createCategory);
app.put('/api/worker-categories/:id', WorkerCategoryController.updateCategory);
app.delete('/api/worker-categories/:id', WorkerCategoryController.deleteCategory);

// Expense routes
app.get('/api/expenses', ExpenseController.getExpenses);
app.post('/api/expenses', ExpenseController.createExpense);
app.put('/api/expenses/:id', ExpenseController.updateExpense);
app.delete('/api/expenses/:id', ExpenseController.deleteExpense);

// Income routes
app.get('/api/income', IncomeController.getIncome);
app.post('/api/income', IncomeController.createIncome);
app.put('/api/income/:id', IncomeController.updateIncome);
app.delete('/api/income/:id', IncomeController.deleteIncome);

// Payroll routes
app.get('/api/payroll-records', PayrollController.getPayrollRecords);
app.post('/api/payroll-records', PayrollController.createPayrollRecord);
app.put('/api/payroll-records/:id', PayrollController.updatePayrollRecord);
app.delete('/api/payroll-records/:id', PayrollController.deletePayrollRecord);

// Approved Items routes
app.get('/api/approved-items', ApprovedItemController.getItems);
app.post('/api/approved-items', ApprovedItemController.createItem);
app.put('/api/approved-items/:id', ApprovedItemController.updateItem);
app.delete('/api/approved-items/:id', ApprovedItemController.deleteItem);

// Suppliers routes
app.get('/api/suppliers', SupplierController.getSuppliers);
app.post('/api/suppliers', SupplierController.createSupplier);
app.put('/api/suppliers/:id', SupplierController.updateSupplier);
app.delete('/api/suppliers/:id', SupplierController.deleteSupplier);

// Purchase Orders routes
app.get('/api/purchase-orders', PurchaseOrderController.getPurchaseOrders);
app.post('/api/purchase-orders', PurchaseOrderController.createPurchaseOrder);
app.put('/api/purchase-orders/:id', PurchaseOrderController.updatePurchaseOrder);
app.delete('/api/purchase-orders/:id', PurchaseOrderController.deletePurchaseOrder);
app.patch('/api/purchase-orders/:id/status', authenticateToken, PurchaseOrderController.updatePurchaseOrderStatus);

// Supplies routes
app.get('/api/supplies', SupplyController.getSupplies);
app.post('/api/supplies', SupplyController.createSupply);
app.put('/api/supplies/:id', SupplyController.updateSupply);
app.delete('/api/supplies/:id', SupplyController.deleteSupply);

// Store Transactions routes
app.get('/api/store-transactions', StoreTransactionController.getTransactions);
app.post('/api/store-transactions', StoreTransactionController.createTransaction);
app.put('/api/store-transactions/:id', StoreTransactionController.updateTransaction);
app.delete('/api/store-transactions/:id', StoreTransactionController.deleteTransaction);

// Site Diary routes
app.get('/api/site-diary-entries', SiteDiaryController.getEntries);
app.post('/api/site-diary-entries', SiteDiaryController.createEntry);
app.put('/api/site-diary-entries/:id', SiteDiaryController.updateEntry);
app.delete('/api/site-diary-entries/:id', SiteDiaryController.deleteEntry);

// Subcontractors routes
app.get('/api/subcontractors', SubcontractorController.getSubcontractors);
app.post('/api/subcontractors', SubcontractorController.createSubcontractor);
app.put('/api/subcontractors/:id', SubcontractorController.updateSubcontractor);
app.delete('/api/subcontractors/:id', SubcontractorController.deleteSubcontractor);

// Quotations routes
app.get('/api/quotations', QuotationController.getQuotations);
app.post('/api/quotations', QuotationController.createQuotation);
app.put('/api/quotations/:id', QuotationController.updateQuotation);
app.delete('/api/quotations/:id', QuotationController.deleteQuotation);

// Invoices routes
app.get('/api/invoices', InvoiceController.getInvoices);
app.post('/api/invoices', InvoiceController.createInvoice);
app.put('/api/invoices/:id', InvoiceController.updateInvoice);
app.delete('/api/invoices/:id', InvoiceController.deleteInvoice);





// ========== LOAD SAMPLE DATA ==========
app.post('/api/load-sample-data', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const company_id = req.user?.companyId || req.user?.company_id;
    
    console.log('Loading comprehensive sample data for company:', company_id);
    
    // First, clear all existing data
    const tables = ['projects', 'workers', 'income', 'invoices', 'expenses', 'subcontractors', 'suppliers', 'approved_items', 'worker_categories', 'purchase_orders', 'supplies', 'store_transactions', 'site_diary_entries', 'quotations', 'payroll_records'];
    for (const table of tables) {
      try {
        await db.run(`DELETE FROM ${table} WHERE company_id = ?`, [company_id]);
        console.log(`Cleared ${table}`);
      } catch (e) {
        // Table might not exist
      }
    }
    
    // ========== 1. PROJECTS ==========
    const projects = [
      { name: 'Nairobi Heights Apartments', client: 'Nairobi Development Corp', contract_sum: 45000000, location: 'Westlands, Nairobi', start_date: '2024-01-15', end_date: '2025-06-30', status: 'Active', project_manager: 'John Maina', description: '15-story luxury apartment building', progress: 35 },
      { name: 'Kisii Teaching Hospital', client: 'Ministry of Health', contract_sum: 125000000, location: 'Kisii Town', start_date: '2024-03-01', end_date: '2026-12-31', status: 'Active', project_manager: 'Dr. Sarah Wanjiku', description: '300-bed teaching hospital', progress: 15 },
      { name: 'Mombasa Port Road Extension', client: 'Kenya National Highways Authority', contract_sum: 89000000, location: 'Mombasa', start_date: '2024-06-01', end_date: '2025-11-30', status: 'Active', project_manager: 'James Otieno', description: '15km road expansion', progress: 45 },
      { name: 'Nakuru Industrial Park', client: 'Industrial Development Board', contract_sum: 250000000, location: 'Nakuru', start_date: '2024-08-15', end_date: '2026-08-15', status: 'Active', project_manager: 'Grace Muthoni', description: '100-acre industrial park', progress: 10 },
      { name: 'Eldoret Mall', client: 'Retail Development Ltd', contract_sum: 68000000, location: 'Eldoret', start_date: '2024-02-01', end_date: '2025-05-31', status: 'Active', project_manager: 'Michael Kipchoge', description: 'Modern shopping mall', progress: 60 }
    ];
    
    const projectIds = [];
    for (const p of projects) {
      const result = await db.run(
        `INSERT INTO projects (company_id, name, client, contract_sum, location, start_date, end_date, status, project_manager, description, progress)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, p.name, p.client, p.contract_sum, p.location, p.start_date, p.end_date, p.status, p.project_manager, p.description, p.progress]
      );
      projectIds.push({ id: result.lastID, name: p.name });
    }
    console.log(`✅ Added ${projects.length} projects`);
    
    // ========== 2. WORKER CATEGORIES ==========
    const categories = [
      { name: 'General Labourer', day_rate: 800, color: '#3b82f6', is_active: 1 },
      { name: 'Skilled Mason', day_rate: 1500, color: '#10b981', is_active: 1 },
      { name: 'Electrician', day_rate: 1800, color: '#f59e0b', is_active: 1 },
      { name: 'Plumber', day_rate: 1700, color: '#ef4444', is_active: 1 },
      { name: 'Carpenter', day_rate: 1600, color: '#8b5cf6', is_active: 1 }
    ];
    
    const categoryIds = [];
    for (const c of categories) {
      const result = await db.run(
        `INSERT INTO worker_categories (company_id, name, day_rate, color, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [company_id, c.name, c.day_rate, c.color, c.is_active]
      );
      categoryIds.push({ id: result.lastID, name: c.name, day_rate: c.day_rate });
    }
    console.log(`✅ Added ${categories.length} worker categories`);
    
    // ========== 3. WORKERS ==========
    const workers = [
      { name: 'John Kamau', phone: '+254 711 223344', categoryName: 'General Labourer' },
      { name: 'Peter Ochieng', phone: '+254 722 334455', categoryName: 'Skilled Mason' },
      { name: 'Mary Wanjiku', phone: '+254 733 445566', categoryName: 'Electrician' },
      { name: 'James Mwangi', phone: '+254 744 556677', categoryName: 'Plumber' },
      { name: 'Sarah Achieng', phone: '+254 755 667788', categoryName: 'Carpenter' }
    ];
    
    const firstProject = projectIds[0];
    for (const w of workers) {
      const cat = categoryIds.find(c => c.name === w.categoryName);
      if (cat && firstProject) {
        await db.run(
          `INSERT INTO workers (company_id, name, phone, category_id, project_id, day_rate, is_active, date_added)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [company_id, w.name, w.phone, cat.id, firstProject.id, cat.day_rate, 1, new Date().toISOString().split('T')[0]]
        );
      }
    }
    console.log(`✅ Added ${workers.length} workers`);
    
    // ========== 4. SUBCONTRACTORS ==========
    const subcontractors = [
      { name: 'ABC Foundations Ltd', phone: '+254 722 111222', email: 'info@abcfoundations.com', kra_pin: 'P051234567Z', specialization: 'Foundation Works', address: 'Industrial Area, Nairobi', contact_person: 'John Kamau', is_active: 1 },
      { name: 'XYZ Electricals', phone: '+254 733 333444', email: 'info@xyzelectricals.com', kra_pin: 'P059876543Z', specialization: 'Electrical Works', address: 'Westlands, Nairobi', contact_person: 'Jane Wanjiku', is_active: 1 },
      { name: 'Pinnacle Plumbing Ltd', phone: '+254 744 555666', email: 'info@pinnacleplumbing.com', kra_pin: 'P051238888Z', specialization: 'Plumbing', address: 'Kilimani, Nairobi', contact_person: 'Peter Ochieng', is_active: 1 },
      { name: 'SteelWorks Ltd', phone: '+254 755 777888', email: 'info@steelworks.com', kra_pin: 'P059999888Z', specialization: 'Steel Fabrication', address: 'Industrial Area, Nairobi', contact_person: 'James Maina', is_active: 1 },
      { name: 'Roofing Masters', phone: '+254 766 999000', email: 'info@roofingmasters.com', kra_pin: 'P051234999Z', specialization: 'Roofing', address: 'Thika Road, Nairobi', contact_person: 'Mary Njuguna', is_active: 1 }
    ];
    
    const subcontractorIds = [];
    for (const sub of subcontractors) {
      const result = await db.run(
        `INSERT INTO subcontractors (company_id, name, phone, email, kra_pin, specialization, address, contact_person, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, sub.name, sub.phone, sub.email, sub.kra_pin, sub.specialization, sub.address, sub.contact_person, sub.is_active]
      );
      subcontractorIds.push({ id: result.lastID, name: sub.name });
    }
    console.log(`✅ Added ${subcontractors.length} subcontractors`);
    
    // ========== 5. SUPPLIERS ==========
    const suppliers = [
      { name: 'Kenya Cement Ltd', kra_pin: 'P051234567Z', phone: '+254 722 123456', email: 'sales@kenyacement.co.ke', address: 'Industrial Area, Nairobi', contact_person: 'Peter Maina', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Steel Masters Ltd', kra_pin: 'P059876543Z', phone: '+254 733 987654', email: 'info@steelmasters.co.ke', address: 'Mombasa Road, Nairobi', contact_person: 'James Otieno', payment_terms: 'Net 45 days', is_active: 1 },
      { name: 'Coastal Hardware', kra_pin: 'P059999999Z', phone: '+254 788 999888', email: 'info@coastalhardware.com', address: 'Mombasa, Kenya', contact_person: 'Hassan Ali', payment_terms: 'Net 60 days', is_active: 1 }
    ];
    
    for (const s of suppliers) {
      await db.run(
        `INSERT INTO suppliers (company_id, name, kra_pin, phone, email, address, contact_person, payment_terms, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, s.name, s.kra_pin, s.phone, s.email, s.address, s.contact_person, s.payment_terms, s.is_active]
      );
    }
    console.log(`✅ Added ${suppliers.length} suppliers`);
    
    // ========== 6. APPROVED ITEMS ==========
    const approvedItems = [
      { name: 'Portland Cement', category: 'Materials', unit: 'bags', default_price: 850, description: 'Grade 42.5', is_active: 1 },
      { name: 'Steel Reinforcement Bars', category: 'Materials', unit: 'pieces', default_price: 1200, description: '12mm diameter', is_active: 1 },
      { name: 'River Sand', category: 'Materials', unit: 'tons', default_price: 3500, description: 'Building sand', is_active: 1 },
      { name: 'Roofing Sheets', category: 'Materials', unit: 'sheets', default_price: 450, description: 'Iron sheets', is_active: 1 },
      { name: 'Ceramic Tiles', category: 'Finishing', unit: 'sqm', default_price: 1200, description: 'Floor tiles', is_active: 1 }
    ];
    
    for (const item of approvedItems) {
      await db.run(
        `INSERT INTO approved_items (company_id, name, category, unit, default_price, description, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company_id, item.name, item.category, item.unit, item.default_price, item.description, item.is_active]
      );
    }
    console.log(`✅ Added ${approvedItems.length} approved items`);
    
    // ========== 7. QUOTATIONS ==========
    const quotations = [
      { subcontractor_id: subcontractorIds[0]?.id, subcontractor_name: 'ABC Foundations Ltd', project_id: projectIds[0]?.id, project_name: 'Nairobi Heights Apartments', description: 'Foundation works', amount: 100000, date: '2026-04-01', status: 'Accepted', notes: '' },
      { subcontractor_id: subcontractorIds[1]?.id, subcontractor_name: 'XYZ Electricals', project_id: projectIds[0]?.id, project_name: 'Nairobi Heights Apartments', description: 'Electrical wiring', amount: 75000, date: '2026-04-05', status: 'Pending', notes: '' },
      { subcontractor_id: subcontractorIds[2]?.id, subcontractor_name: 'Pinnacle Plumbing Ltd', project_id: projectIds[1]?.id, project_name: 'Kisii Teaching Hospital', description: 'Plumbing works', amount: 340000, date: '2026-04-02', status: 'Accepted', notes: '' },
      { subcontractor_id: subcontractorIds[3]?.id, subcontractor_name: 'SteelWorks Ltd', project_id: projectIds[1]?.id, project_name: 'Kisii Teaching Hospital', description: 'Steel structure', amount: 1200000, date: '2026-04-04', status: 'Accepted', notes: '' },
      { subcontractor_id: subcontractorIds[4]?.id, subcontractor_name: 'Roofing Masters', project_id: projectIds[2]?.id, project_name: 'Mombasa Port Road Extension', description: 'Roofing', amount: 34556, date: '2026-04-01', status: 'Accepted', notes: '' }
    ];
    
    for (const q of quotations) {
      if (q.subcontractor_id) {
        await db.run(
          `INSERT INTO quotations (company_id, subcontractor_id, subcontractor_name, project_id, project_name, description, amount, date, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [company_id, q.subcontractor_id, q.subcontractor_name, q.project_id, q.project_name, q.description, q.amount, q.date, q.status, q.notes]
        );
      }
    }
    console.log(`✅ Added ${quotations.length} quotations`);
    
    // ========== 8. PURCHASE ORDERS ==========
    const purchaseOrders = [
      { order_number: 'PO-2026-001', supplier_id: 1, supplier_name: 'Kenya Cement Ltd', project_id: projectIds[0]?.id, project_name: 'Nairobi Heights Apartments', order_date: '2026-04-01', expected_date: '2026-04-15', items: JSON.stringify([{ description: 'Portland Cement', quantity: 500, unit_price: 850, total: 425000 }]), subtotal: 425000, vat: 68000, total: 493000, status: 'Supplied', payment_status: 'Paid', notes: '' },
      { order_number: 'PO-2026-002', supplier_id: 2, supplier_name: 'Steel Masters Ltd', project_id: projectIds[1]?.id, project_name: 'Kisii Teaching Hospital', order_date: '2026-04-02', expected_date: '2026-04-20', items: JSON.stringify([{ description: 'Reinforcement Bars', quantity: 1000, unit_price: 120, total: 120000 }]), subtotal: 120000, vat: 19200, total: 139200, status: 'Ordered', payment_status: 'Unpaid', notes: '' }
    ];
    
    for (const po of purchaseOrders) {
      await db.run(
        `INSERT INTO purchase_orders (company_id, order_number, supplier_id, supplier_name, project_id, project_name, order_date, expected_date, items, subtotal, vat, total, status, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, po.order_number, po.supplier_id, po.supplier_name, po.project_id, po.project_name, po.order_date, po.expected_date, po.items, po.subtotal, po.vat, po.total, po.status, po.payment_status, po.notes]
      );
    }
    console.log(`✅ Added ${purchaseOrders.length} purchase orders`);
    
    // ========== 9. STORE TRANSACTIONS ==========
    const storeTransactions = [
      { date: '2026-04-01', project_id: projectIds[0]?.id, project_name: 'Nairobi Heights Apartments', item_id: 1, item_name: 'Cement Bags', unit: 'Bags', category: 'Materials', quantity_supplied: 500, quantity_issued: 350, quantity_returned: 10, transaction_type: 'Supply', reference: 'PO-2026-001' },
      { date: '2026-04-03', project_id: projectIds[1]?.id, project_name: 'Kisii Teaching Hospital', item_id: 2, item_name: 'Steel Bars', unit: 'Pieces', category: 'Materials', quantity_supplied: 1000, quantity_issued: 600, quantity_returned: 20, transaction_type: 'Supply', reference: 'PO-2026-002' }
    ];
    
    for (const st of storeTransactions) {
      await db.run(
        `INSERT INTO store_transactions (company_id, date, project_id, project_name, item_id, item_name, unit, category, quantity_supplied, quantity_issued, quantity_returned, transaction_type, reference)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, st.date, st.project_id, st.project_name, st.item_id, st.item_name, st.unit, st.category, st.quantity_supplied, st.quantity_issued, st.quantity_returned, st.transaction_type, st.reference]
      );
    }
    console.log(`✅ Added ${storeTransactions.length} store transactions`);
    
    // ========== 10. SITE DIARY ENTRIES ==========
    const siteDiaryEntries = [
      { date: '2026-04-06', project_id: projectIds[0]?.id, project_name: 'Nairobi Heights Apartments', weather: JSON.stringify({ condition: 'Sunny', temp: 28 }), total_workers: 25, activities: JSON.stringify([{ description: 'Foundation excavation' }]), challenges: JSON.stringify([]), status: 'Completed' },
      { date: '2026-04-06', project_id: projectIds[1]?.id, project_name: 'Kisii Teaching Hospital', weather: JSON.stringify({ condition: 'Rainy', temp: 22 }), total_workers: 30, activities: JSON.stringify([{ description: 'Roof installation' }]), challenges: JSON.stringify(['Rain delay']), status: 'Completed' }
    ];
    
    for (const entry of siteDiaryEntries) {
      await db.run(
        `INSERT INTO site_diary_entries (company_id, date, project_id, project_name, weather, total_workers, activities, challenges, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, entry.date, entry.project_id, entry.project_name, entry.weather, entry.total_workers, entry.activities, entry.challenges, entry.status]
      );
    }
    console.log(`✅ Added ${siteDiaryEntries.length} site diary entries`);
    
    // ========== 11. INCOME ==========
    for (const p of projectIds) {
      const amount = 5000000;
      await db.run(
        `INSERT INTO income (company_id, project_id, certificate_no, date, gross_amount, retention_percent, amount_received, payment_date, payment_method, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, p.id, `CERT-${p.id}-001`, new Date().toISOString().split('T')[0], amount, 5, amount * 0.95, new Date().toISOString().split('T')[0], 'Bank Transfer', 'Paid', `Payment for ${p.name}`]
      );
    }
    console.log(`✅ Added ${projectIds.length} income records`);
    
    // ========== 12. EXPENSES ==========
    for (const p of projectIds) {
      await db.run(
        `INSERT INTO expenses (company_id, project_id, project_name, date, category, description, amount, vat, payment_method, status, reference)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, p.id, p.name, new Date().toISOString().split('T')[0], 'Materials', `Materials for ${p.name}`, 500000, 80000, 'Bank Transfer', 'Paid', `EXP-${p.id}-001`]
      );
    }
    console.log(`✅ Added ${projectIds.length} expense records`);
    
    // ========== 13. INVOICES ==========
    for (const p of projectIds) {
      const amount = 3000000;
      await db.run(
        `INSERT INTO invoices (company_id, invoice_number, project_id, project_name, client_name, date, due_date, items, subtotal, vat, total, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_id, `INV-${p.id}-001`, p.id, p.name, p.name.split(' ')[0] + ' Client', new Date().toISOString().split('T')[0], new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], JSON.stringify([{ description: 'Construction services', quantity: 1, unit_price: amount, total: amount }]), amount, amount * 0.16, amount * 1.16, 'Sent', `Invoice for ${p.name}`]
      );
    }
    console.log(`✅ Added ${projectIds.length} invoice records`);
    
    console.log('✅ Comprehensive sample data loaded successfully!');
    res.json({ 
      message: 'Sample data loaded successfully',
      projects: projects.length,
      subcontractors: subcontractors.length,
      quotations: quotations.length,
      purchaseOrders: purchaseOrders.length,
      storeTransactions: storeTransactions.length,
      siteDiaryEntries: siteDiaryEntries.length,
      workers: workers.length,
      suppliers: suppliers.length
    });
    
  } catch (error) {
    console.error('Error loading sample data:', error);
    res.status(500).json({ error: error.message });
  }
});







// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Multi-tenant server running on http://localhost:${PORT}`);
      console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`\nPublic endpoints:`);
      console.log(`  GET    /api/health`);
      console.log(`  POST   /api/auth/send-login-otp`);
      console.log(`  POST   /api/auth/verify-login-otp`);
      console.log(`  POST   /api/auth/send-registration-otp`);
      console.log(`  POST   /api/auth/verify-registration-otp`);
      console.log(`  POST   /api/auth/resend-otp`);
      console.log(`  POST   /api/auth/login (traditional)`);
      console.log(`  POST   /api/companies/register`);
      console.log(`\nProtected endpoints (require token):`);
      console.log(`  GET    /api/company`);
      console.log(`  GET    /api/users`);
      console.log(`  POST   /api/users`);
      console.log(`  GET    /api/projects`);
      console.log(`  POST   /api/projects`);
      console.log(`  GET    /api/workers`);
      console.log(`  POST   /api/workers`);
      console.log(`  GET    /api/worker-categories`);
      console.log(`  POST   /api/worker-categories`);
      console.log(`  GET    /api/expenses`);
      console.log(`  POST   /api/expenses`);
      console.log(`  GET    /api/income`);
      console.log(`  POST   /api/income`);
      console.log(`  GET    /api/payroll-records`);
      console.log(`  POST   /api/payroll-records`);
      console.log(`  GET    /api/approved-items`);
      console.log(`  POST   /api/approved-items`);
      console.log(`  GET    /api/suppliers`);
      console.log(`  POST   /api/suppliers`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();