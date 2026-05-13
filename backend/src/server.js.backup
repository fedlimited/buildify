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
const SubscriptionController = require('./controllers/subscriptionController');

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

// ========== SUBSCRIPTION ROUTES ==========
app.get('/api/subscription/plans', authenticateToken, SubscriptionController.getPlans);
app.get('/api/subscription/current', authenticateToken, SubscriptionController.getCurrentSubscription);
app.get('/api/subscription/check-limit', authenticateToken, SubscriptionController.checkLimit);


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
app.get('/api/supplies', authenticateToken, SupplyController.getSupplies);
app.post('/api/supplies', authenticateToken, SupplyController.createSupply);
app.put('/api/supplies/:id', authenticateToken, SupplyController.updateSupply);
app.delete('/api/supplies/:id', authenticateToken, SupplyController.deleteSupply);
app.patch('/api/supplies/:id/paid', authenticateToken, SupplyController.markAsPaid);

// Store Transactions routes
app.get('/api/store-transactions', StoreTransactionController.getTransactions);
app.post('/api/store-transactions', StoreTransactionController.createTransaction);
app.put('/api/store-transactions/:id', StoreTransactionController.updateTransaction);
app.delete('/api/store-transactions/:id', StoreTransactionController.deleteTransaction);

// Site Diary routes
app.get('/api/site-diary-entries', SiteDiaryController.getEntries);
app.get('/api/site-diary-entries/:id', SiteDiaryController.getEntryById);
app.post('/api/site-diary-entries', SiteDiaryController.createEntry);
app.put('/api/site-diary-entries/:id', SiteDiaryController.updateEntry);
app.delete('/api/site-diary-entries/:id', SiteDiaryController.deleteEntry);
app.get('/api/site-diary-entries/statistics', SiteDiaryController.getStatistics);
app.get('/api/site-diary-entries/range', SiteDiaryController.getEntriesByDateRange);


// ========== MIGRATION ENDPOINT - Run once to add missing columns ==========
app.post('/api/migrate/site-diary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const results = [];
    
    // Add site_workers column if not exists
    try {
      await db.run(`ALTER TABLE site_diary_entries ADD COLUMN IF NOT EXISTS site_workers TEXT`);
      results.push('✅ Added site_workers column');
    } catch (e) {
      results.push(`site_workers: ${e.message}`);
    }
    
    // Add site_subcontractors column if not exists
    try {
      await db.run(`ALTER TABLE site_diary_entries ADD COLUMN IF NOT EXISTS site_subcontractors TEXT`);
      results.push('✅ Added site_subcontractors column');
    } catch (e) {
      results.push(`site_subcontractors: ${e.message}`);
    }
    
    console.log('Migration results:', results);
    res.json({ 
      message: 'Migration completed',
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
        await db.run(`DELETE FROM ${table} WHERE company_id = $1`, [company_id]);
        console.log(`Cleared ${table}`);
      } catch (e) {
        // Table might not exist
      }
    }
    
    // ========== 1. PROJECTS (8 diverse projects across Kenya) ==========
    const projects = [
      { name: 'Diamond Plaza Mall - Nairobi', client: 'Diamond Developers Ltd', contract_sum: 520000000, location: 'Parklands, Nairobi', start_date: '2024-01-10', end_date: '2025-12-31', status: 'Active', project_manager: 'John Kamau', description: '5-storey modern shopping mall with cinema and food court', progress: 40 },
      { name: 'Mombasa Beach Resort', client: 'Coastline Hospitality', contract_sum: 380000000, location: 'Nyali, Mombasa', start_date: '2024-02-15', end_date: '2025-11-30', status: 'Active', project_manager: 'Hassan Ali', description: 'Luxury beach resort with 150 rooms and conference facilities', progress: 25 },
      { name: 'Kisumu Industrial Park', client: 'Lake Basin Development Authority', contract_sum: 450000000, location: 'Kisumu', start_date: '2024-03-01', end_date: '2026-06-30', status: 'Active', project_manager: 'Odhiambo Omondi', description: '100-acre industrial park with warehouses and factories', progress: 15 },
      { name: 'Nakuru Affordable Housing', client: 'National Housing Corporation', contract_sum: 680000000, location: 'Nakuru', start_date: '2024-04-01', end_date: '2026-12-31', status: 'Active', project_manager: 'Grace Muthoni', description: '500-unit affordable housing project', progress: 10 },
      { name: 'Eldoret Sports Complex', client: 'Ministry of Sports', contract_sum: 290000000, location: 'Eldoret', start_date: '2024-05-01', end_date: '2025-10-31', status: 'Active', project_manager: 'Michael Kipchoge', description: 'International standard stadium and training facilities', progress: 30 },
      { name: 'Thika Road Bypass', client: 'Kenya National Highways Authority', contract_sum: 850000000, location: 'Thika Road, Nairobi', start_date: '2024-01-20', end_date: '2026-08-31', status: 'Active', project_manager: 'Peter Odhiambo', description: '25km dual carriageway bypass', progress: 20 },
      { name: 'Diani Beach Hotel', client: 'African Safari Resorts', contract_sum: 310000000, location: 'Diani, Kwale', start_date: '2024-03-15', end_date: '2025-09-30', status: 'Active', project_manager: 'Fatma Said', description: '5-star beachfront hotel with 200 rooms', progress: 35 },
      { name: 'Meru University Expansion', client: 'Meru University', contract_sum: 220000000, location: 'Meru', start_date: '2024-02-01', end_date: '2025-12-31', status: 'Active', project_manager: 'Muguna Mwenda', description: 'New engineering faculty and student hostels', progress: 45 }
    ];
    
    const projectIds = [];
    for (const p of projects) {
      const result = await db.run(
        `INSERT INTO projects (company_id, name, client, contract_sum, location, start_date, end_date, status, project_manager, description, progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [company_id, p.name, p.client, p.contract_sum, p.location, p.start_date, p.end_date, p.status, p.project_manager, p.description, p.progress]
      );
      projectIds.push({ id: result.lastID, name: p.name });
    }
    console.log(`✅ Added ${projects.length} projects`);
    
    // ========== 2. WORKER CATEGORIES (Expanded to 12) ==========
    const categories = [
      { name: 'Foreman', day_rate: 2500, color: '#3b82f6', is_active: 1 },
      { name: 'Skilled Mason', day_rate: 1800, color: '#10b981', is_active: 1 },
      { name: 'Carpenter', day_rate: 1600, color: '#f59e0b', is_active: 1 },
      { name: 'Plumber', day_rate: 2000, color: '#8b5cf6', is_active: 1 },
      { name: 'General Labourer', day_rate: 800, color: '#6b7280', is_active: 1 },
      { name: 'Electrician', day_rate: 2200, color: '#ef4444', is_active: 1 },
      { name: 'Welder', day_rate: 1400, color: '#d97706', is_active: 1 },
      { name: 'Painter', day_rate: 1200, color: '#ec489a', is_active: 1 },
      { name: 'Driver', day_rate: 1300, color: '#14b8a6', is_active: 1 },
      { name: 'Security Guard', day_rate: 900, color: '#6b7280', is_active: 1 },
      { name: 'Equipment Operator', day_rate: 2000, color: '#1e3a5f', is_active: 1 },
      { name: 'Site Clerk', day_rate: 1500, color: '#a855f7', is_active: 1 }
    ];
    
    const categoryIds = [];
    for (const c of categories) {
      const result = await db.run(
        `INSERT INTO worker_categories (company_id, name, day_rate, color, is_active)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [company_id, c.name, c.day_rate, c.color, c.is_active]
      );
      categoryIds.push({ id: result.lastID, name: c.name, day_rate: c.day_rate });
    }
    console.log(`✅ Added ${categories.length} worker categories`);
    
    // ========== 3. WORKERS (10 per project - 80 total) ==========
    const firstNames = ['John', 'Peter', 'James', 'David', 'Michael', 'Francis', 'Joseph', 'William', 'George', 'Charles', 
                        'Mary', 'Jane', 'Grace', 'Esther', 'Ruth', 'Sarah', 'Hellen', 'Ann', 'Catherine', 'Lucy',
                        'Paul', 'Stephen', 'Andrew', 'Philip', 'Thomas', 'Simon', 'Mathew', 'Luke', 'Mark', 'Timothy'];
    const lastNames = ['Kamau', 'Njoroge', 'Mwangi', 'Ochieng', 'Otieno', 'Kiprop', 'Wanjiku', 'Muthoni', 'Achieng', 'Chebet',
                      'Kimani', 'Omondi', 'Wambui', 'Njeri', 'Akinyi', 'Atieno', 'Nyambura', 'Wangari', 'Ndegwa', 'Kariuki'];
    
    let totalWorkers = 0;
    for (const project of projectIds) {
      for (let i = 0; i < 10; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const phone = `08${Math.floor(Math.random() * 900000000 + 100000000)}`;
        const category = categoryIds[Math.floor(Math.random() * categoryIds.length)];
        const dateAdded = new Date().toISOString().split('T')[0];
        
        await db.run(
          `INSERT INTO workers (company_id, name, phone, category_id, project_id, day_rate, is_active, date_added)
           VALUES ($1, $2, $3, $4, $5, $6, 1, $7)`,
          [company_id, name, phone, category.id, project.id, category.day_rate, dateAdded]
        );
        totalWorkers++;
      }
      console.log(`  ✅ Added 10 workers to ${project.name}`);
    }
    console.log(`✅ Added ${totalWorkers} workers total`);
    
    // ========== 4. SUBCONTRACTORS (10) ==========
    const subcontractors = [
      { name: 'ABC Foundations Ltd', phone: '08123456789', email: 'info@abcfoundations.com', kra_pin: 'P051234567Z', specialization: 'Foundation Works', address: 'Industrial Area, Nairobi', contact_person: 'John Kamau', is_active: 1 },
      { name: 'XYZ Electricals', phone: '08234567890', email: 'info@xyzelectricals.com', kra_pin: 'P059876543Z', specialization: 'Electrical Works', address: 'Westlands, Nairobi', contact_person: 'Jane Wanjiku', is_active: 1 },
      { name: 'Pinnacle Plumbing Ltd', phone: '08345678901', email: 'info@pinnacleplumbing.com', kra_pin: 'P051238888Z', specialization: 'Plumbing', address: 'Kilimani, Nairobi', contact_person: 'Peter Ochieng', is_active: 1 },
      { name: 'SteelWorks Ltd', phone: '08456789012', email: 'info@steelworks.com', kra_pin: 'P059999888Z', specialization: 'Steel Fabrication', address: 'Industrial Area, Nairobi', contact_person: 'James Maina', is_active: 1 },
      { name: 'Roofing Masters', phone: '08567890123', email: 'info@roofingmasters.com', kra_pin: 'P051234999Z', specialization: 'Roofing', address: 'Thika Road, Nairobi', contact_person: 'Mary Njuguna', is_active: 1 },
      { name: 'Coast Carpentry Ltd', phone: '08678901234', email: 'info@coastcarpentry.com', kra_pin: 'P059999777Z', specialization: 'Carpentry', address: 'Mombasa, Kenya', contact_person: 'Hassan Ali', is_active: 1 },
      { name: 'Highland Painters', phone: '08789012345', email: 'info@highlandpainters.com', kra_pin: 'P051234666Z', specialization: 'Painting', address: 'Nakuru', contact_person: 'Grace Muthoni', is_active: 1 },
      { name: 'Elite Landscaping', phone: '08890123456', email: 'info@elitelandscaping.com', kra_pin: 'P059999555Z', specialization: 'Landscaping', address: 'Kisumu', contact_person: 'Odhiambo Omondi', is_active: 1 },
      { name: 'Precision Tiling Ltd', phone: '08901234567', email: 'info@precisiontiling.com', kra_pin: 'P051234444Z', specialization: 'Tiling', address: 'Eldoret', contact_person: 'Michael Kipchoge', is_active: 1 },
      { name: 'Global Glass Works', phone: '08012345678', email: 'info@globalglass.com', kra_pin: 'P059999333Z', specialization: 'Glass and Aluminum', address: 'Thika Road, Nairobi', contact_person: 'Peter Odhiambo', is_active: 1 }
    ];
    
    const subcontractorIds = [];
    for (const sub of subcontractors) {
      const result = await db.run(
        `INSERT INTO subcontractors (company_id, name, phone, email, kra_pin, specialization, address, contact_person, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [company_id, sub.name, sub.phone, sub.email, sub.kra_pin, sub.specialization, sub.address, sub.contact_person, sub.is_active]
      );
      subcontractorIds.push({ id: result.lastID, name: sub.name });
    }
    console.log(`✅ Added ${subcontractors.length} subcontractors`);
    
    // ========== 5. SUPPLIERS (8) ==========
    const suppliers = [
      { name: 'Bamburi Cement Ltd', kra_pin: 'P051234567A', phone: '08123456789', email: 'orders@bamburi.co.ke', address: 'Industrial Area, Nairobi', contact_person: 'Mary Wambui', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Devki Steel Mills', kra_pin: 'P051234568B', phone: '08234567890', email: 'sales@devki.co.ke', address: 'Athi River, Machakos', contact_person: 'Rajesh Patel', payment_terms: 'Net 45 days', is_active: 1 },
      { name: 'Timber World Supplies', kra_pin: 'P051234569C', phone: '08345678901', email: 'info@timberworld.co.ke', address: 'Ngong Road, Nairobi', contact_person: 'Joseph Kimani', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Coastal Hardware', kra_pin: 'P059999999Z', phone: '08456789012', email: 'info@coastalhardware.com', address: 'Mombasa, Kenya', contact_person: 'Hassan Ali', payment_terms: 'Net 60 days', is_active: 1 },
      { name: 'Kenya Electricals Ltd', kra_pin: 'P051234570D', phone: '08567890123', email: 'sales@kenyaelectricals.co.ke', address: 'Enterprise Road, Nairobi', contact_person: 'John Mwangi', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Superior Paints Ltd', kra_pin: 'P051234571E', phone: '08678901234', email: 'info@superiorpaints.co.ke', address: 'Industrial Area, Nairobi', contact_person: 'Jane Wanjiku', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Master Plastics Ltd', kra_pin: 'P051234572F', phone: '08789012345', email: 'sales@masterplastics.co.ke', address: 'Mombasa Road, Nairobi', contact_person: 'Peter Ochieng', payment_terms: 'Net 30 days', is_active: 1 },
      { name: 'Elite Hardware Store', kra_pin: 'P051234573G', phone: '08890123456', email: 'info@elitehardware.co.ke', address: 'Kisumu', contact_person: 'Odhiambo Omondi', payment_terms: 'Net 30 days', is_active: 1 }
    ];
    
    const supplierIds = [];
    for (const s of suppliers) {
      const result = await db.run(
        `INSERT INTO suppliers (company_id, name, kra_pin, phone, email, address, contact_person, payment_terms, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [company_id, s.name, s.kra_pin, s.phone, s.email, s.address, s.contact_person, s.payment_terms, s.is_active]
      );
      supplierIds.push({ id: result.lastID, name: s.name });
    }
    console.log(`✅ Added ${suppliers.length} suppliers`);
    
    // ========== 6. APPROVED ITEMS (25 items) ==========
    const approvedItems = [
      { name: 'Portland Cement 42.5', category: 'Cement', unit: 'bag', default_price: 950, description: '50kg bag, high strength', is_active: 1 },
      { name: 'Portland Cement 32.5', category: 'Cement', unit: 'bag', default_price: 850, description: '50kg bag, general purpose', is_active: 1 },
      { name: 'Steel Bar Y12', category: 'Steel', unit: 'tonne', default_price: 120000, description: '12mm deformed bars', is_active: 1 },
      { name: 'Steel Bar Y16', category: 'Steel', unit: 'tonne', default_price: 122000, description: '16mm deformed bars', is_active: 1 },
      { name: 'Steel Bar Y10', category: 'Steel', unit: 'tonne', default_price: 118000, description: '10mm deformed bars', is_active: 1 },
      { name: 'River Sand', category: 'Aggregates', unit: 'tonne', default_price: 3500, description: 'Clean river sand', is_active: 1 },
      { name: 'Ballast 20mm', category: 'Aggregates', unit: 'tonne', default_price: 4000, description: '20mm crushed stone', is_active: 1 },
      { name: 'Ballast 10mm', category: 'Aggregates', unit: 'tonne', default_price: 4200, description: '10mm crushed stone', is_active: 1 },
      { name: '6-inch Hollow Block', category: 'Blocks', unit: 'piece', default_price: 180, description: '150x200x400mm', is_active: 1 },
      { name: '4-inch Hollow Block', category: 'Blocks', unit: 'piece', default_price: 140, description: '100x200x400mm', is_active: 1 },
      { name: 'Cypress 2x4', category: 'Timber', unit: 'piece', default_price: 480, description: '2x4 inch, 12ft length', is_active: 1 },
      { name: 'Plywood 12mm', category: 'Timber', unit: 'sheet', default_price: 3200, description: '4x8 feet', is_active: 1 },
      { name: 'Iron Sheet Gauge 30', category: 'Roofing', unit: 'piece', default_price: 1850, description: '3m length, corrugated', is_active: 1 },
      { name: 'PVC Pipe 110mm', category: 'Plumbing', unit: 'piece', default_price: 1800, description: '6m length', is_active: 1 },
      { name: 'Electrical Cable 2.5mm', category: 'Electrical', unit: 'roll', default_price: 8500, description: '100m roll', is_active: 1 },
      { name: 'LED Bulb 9W', category: 'Electrical', unit: 'piece', default_price: 250, description: 'Daylight', is_active: 1 },
      { name: 'Emulsion Paint White', category: 'Paint', unit: 'litre', default_price: 450, description: 'Interior', is_active: 1 },
      { name: 'Ceramic Tiles 30x30', category: 'Finishing', unit: 'sqm', default_price: 1200, description: 'Floor tiles', is_active: 1 },
      { name: 'Water Closet (WC)', category: 'Plumbing', unit: 'piece', default_price: 5500, description: 'Toilet pan', is_active: 1 },
      { name: 'Wash Basin', category: 'Plumbing', unit: 'piece', default_price: 3500, description: 'Ceramic with tap', is_active: 1 },
      { name: 'Roofing Nails', category: 'Hardware', unit: 'kg', default_price: 250, description: 'Box of 500', is_active: 1 },
      { name: 'Paint Brush 4"', category: 'Tools', unit: 'piece', default_price: 350, description: 'Premium quality', is_active: 1 },
      { name: 'Safety Boots', category: 'Safety', unit: 'pair', default_price: 2500, description: 'Steel toe', is_active: 1 },
      { name: 'Hard Hat', category: 'Safety', unit: 'piece', default_price: 850, description: 'Industrial helmet', is_active: 1 },
      { name: 'High Visibility Vest', category: 'Safety', unit: 'piece', default_price: 450, description: 'Reflective', is_active: 1 }
    ];
    
    for (const item of approvedItems) {
      await db.run(
        `INSERT INTO approved_items (company_id, name, category, unit, default_price, description, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [company_id, item.name, item.category, item.unit, item.default_price, item.description, item.is_active]
      );
    }
    console.log(`✅ Added ${approvedItems.length} approved items`);
    
    // ========== 7. QUOTATIONS ==========
    const quotations = [];
    for (let i = 0; i < 12; i++) {
      const sub = subcontractorIds[i % subcontractorIds.length];
      const proj = projectIds[i % projectIds.length];
      if (sub && proj) {
        quotations.push({
          subcontractor_id: sub.id,
          subcontractor_name: sub.name,
          project_id: proj.id,
          project_name: proj.name,
          description: `${sub.name} services for ${proj.name}`,
          amount: Math.floor(Math.random() * 500000) + 50000,
          date: new Date().toISOString().split('T')[0],
          status: ['Pending', 'Accepted', 'Rejected'][Math.floor(Math.random() * 3)],
          notes: ''
        });
      }
    }
    
    for (const q of quotations) {
      await db.run(
        `INSERT INTO quotations (company_id, subcontractor_id, subcontractor_name, project_id, project_name, description, amount, date, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [company_id, q.subcontractor_id, q.subcontractor_name, q.project_id, q.project_name, q.description, q.amount, q.date, q.status, q.notes]
      );
    }
    console.log(`✅ Added ${quotations.length} quotations`);
    
    // ========== 8. INCOME (for each project) ==========
    for (const p of projectIds) {
      const amount = Math.floor(Math.random() * 10000000) + 2000000;
      await db.run(
        `INSERT INTO income (company_id, project_id, certificate_no, date, gross_amount, retention_percent, amount_received, payment_date, payment_method, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [company_id, p.id, `CERT-${p.id}-001`, new Date().toISOString().split('T')[0], amount, 5, amount * 0.95, new Date().toISOString().split('T')[0], 'Bank Transfer', 'Paid', `First interim payment for ${p.name}`]
      );
    }
    console.log(`✅ Added ${projectIds.length} income records`);
    
    // ========== 9. EXPENSES (for each project) ==========
    const expenseCategories = ['Materials', 'Labour', 'Equipment', 'Transport', 'Subcontractor', 'Utilities', 'Safety', 'Administrative'];
    for (const p of projectIds) {
      const amount = Math.floor(Math.random() * 5000000) + 500000;
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      await db.run(
        `INSERT INTO expenses (company_id, project_id, project_name, date, category, description, amount, vat, payment_method, status, reference)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [company_id, p.id, p.name, new Date().toISOString().split('T')[0], category, `${category} expenses for ${p.name}`, amount, amount * 0.16, 'Bank Transfer', 'Paid', `EXP-${p.id}-001`]
      );
    }
    console.log(`✅ Added ${projectIds.length} expense records`);
    
    // ========== 10. PURCHASE ORDERS ==========
    const purchaseOrders = [
      { order_number: 'PO-2024-001', supplier_id: supplierIds[0]?.id, supplier_name: 'Bamburi Cement Ltd', project_id: projectIds[0]?.id, project_name: 'Diamond Plaza Mall - Nairobi', order_date: '2024-03-10', expected_date: '2024-03-25', items: JSON.stringify([{ description: 'Portland Cement 42.5', quantity: 500, unit_price: 950, total: 475000 }]), subtotal: 475000, vat: 76000, total: 551000, status: 'Supplied', payment_status: 'Paid', notes: '' },
      { order_number: 'PO-2024-002', supplier_id: supplierIds[1]?.id, supplier_name: 'Devki Steel Mills', project_id: projectIds[0]?.id, project_name: 'Diamond Plaza Mall - Nairobi', order_date: '2024-03-15', expected_date: '2024-04-05', items: JSON.stringify([{ description: 'Steel Bar Y12', quantity: 20, unit_price: 120000, total: 2400000 }]), subtotal: 2400000, vat: 384000, total: 2784000, status: 'Ordered', payment_status: 'Unpaid', notes: '' }
    ];
    
    for (const po of purchaseOrders) {
      await db.run(
        `INSERT INTO purchase_orders (company_id, order_number, supplier_id, supplier_name, project_id, project_name, order_date, expected_date, items, subtotal, vat, total, status, payment_status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [company_id, po.order_number, po.supplier_id, po.supplier_name, po.project_id, po.project_name, po.order_date, po.expected_date, po.items, po.subtotal, po.vat, po.total, po.status, po.payment_status, po.notes]
      );
    }
    console.log(`✅ Added ${purchaseOrders.length} purchase orders`);
    
    console.log('✅ Comprehensive sample data loaded successfully!');
    res.json({ 
      message: 'Sample data loaded successfully',
      projects: projects.length,
      workers: totalWorkers,
      subcontractors: subcontractors.length,
      suppliers: suppliers.length,
      approvedItems: approvedItems.length
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