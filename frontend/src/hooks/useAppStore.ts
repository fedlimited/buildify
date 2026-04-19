import { create } from 'zustand';
import { API_BASE_URL } from '@/config/api';
import { Project, Income, Expense, ModuleId, WorkerCategory, Worker, PayrollRecord, ApprovedItem, Supplier, PurchaseOrder, Supply, StoreTransaction, SiteDiaryEntry, CompanySettings, AuthUser, AppUser, Subcontractor, SubcontractorQuotation, Invoice } from '@/lib/types';
import { storage } from '@/lib/storage';
import { sampleProjects, sampleIncome, sampleExpenses, sampleWorkerCategories, sampleWorkers, samplePayrollRecords, sampleApprovedItems, sampleSuppliers, samplePurchaseOrders, sampleSupplies, sampleStoreTransactions, sampleSiteDiaryEntries } from '@/lib/sample-data';
import api from '@/services/api';
import { setCurrencySettings } from '@/lib/formatters';

function nextId(arr: { id: number }[]): number {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

const initTheme = storage.getTheme() as 'light' | 'dark';
if (initTheme === 'dark') document.documentElement.classList.add('dark');

// Load or seed - but projects will be fetched from API

/*

let initProjects = storage.getProjects();
if (!initProjects.length) {
  initProjects = sampleProjects; storage.setProjects(initProjects);
  storage.setIncome(sampleIncome); storage.setExpenses(sampleExpenses);
  storage.setWorkerCategories(sampleWorkerCategories); storage.setWorkers(sampleWorkers);
  storage.setPayrollRecords(samplePayrollRecords); storage.setApprovedItems(sampleApprovedItems);
  storage.setSuppliers(sampleSuppliers); storage.setPurchaseOrders(samplePurchaseOrders);
  storage.setSupplies(sampleSupplies); storage.setStoreTransactions(sampleStoreTransactions);
  storage.setSiteDiaryEntries(sampleSiteDiaryEntries);
}
*/

// Seed default users if none
let initAppUsers = storage.getAppUsers();
if (!initAppUsers.length) {
  initAppUsers = [
    { id: 1, name: 'Admin User', email: 'admin@bochaberi.co.ke', password: 'admin123', role: 'admin', permissions: [], isActive: true, createdAt: '2024-01-01' },
    { id: 2, name: 'Site Manager', email: 'user@bochaberi.co.ke', password: 'user123', role: 'user', permissions: ['dashboard', 'projects', 'income', 'expenses', 'payroll', 'procurement', 'stores', 'sitediary', 'vat', 'reports'], isActive: true, createdAt: '2024-01-01' },
  ];
  storage.setAppUsers(initAppUsers);
}





interface AppState {

  resetAllData: () => Promise<void>;
  activeModule: ModuleId;
  setActiveModule: (m: ModuleId) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  authUser: AuthUser | null;
  login: (email: string, password: string, subdomain: string) => Promise<boolean>;
  logout: () => void;

  setAuthUser: (user: AuthUser | null) => void;  // ← ADD THIS LINE


  projects: Project[];
  income: Income[];
  expenses: Expense[];
  workerCategories: WorkerCategory[];
  workers: Worker[];
  payrollRecords: PayrollRecord[];
  approvedItems: ApprovedItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  supplies: Supply[];
  storeTransactions: StoreTransaction[];
  siteDiaryEntries: SiteDiaryEntry[];
  companySettings: CompanySettings;
  appUsers: AppUser[];
  subcontractors: Subcontractor[];
  quotations: SubcontractorQuotation[];
  invoices: Invoice[];



  currencySettings: {
    currency_code: string;
    currency_symbol: string;
    decimal_places: number;
  } | null;


 // ========== CURRENCY ACTIONS ==========
  fetchCurrencySettings: () => Promise<void>;
  updateCurrencySettings: (settings: any) => Promise<void>;

  // Worker Categories
  addWorkerCategory: (c: Omit<WorkerCategory, 'id'>) => Promise<void>;
  updateWorkerCategory: (c: WorkerCategory) => Promise<void>;
  deleteWorkerCategory: (id: number) => Promise<void>;
  fetchWorkerCategories: () => Promise<void>;

  // Workers
  addWorker: (w: Omit<Worker, 'id' | 'dateAdded'>) => Promise<void>;
  updateWorker: (w: Worker) => Promise<void>;
  deleteWorker: (id: number) => Promise<void>;
  fetchWorkers: () => Promise<void>;


  // Worker Categories
  addWorkerCategory: (c: Omit<WorkerCategory, 'id'>) => Promise<void>;
  updateWorkerCategory: (c: WorkerCategory) => Promise<void>;
  deleteWorkerCategory: (id: number) => Promise<void>;
  fetchWorkerCategories: () => Promise<void>;

  // Workers
  addWorker: (w: Omit<Worker, 'id' | 'dateAdded'>) => Promise<void>;
  updateWorker: (w: Worker) => Promise<void>;
  deleteWorker: (id: number) => Promise<void>;
  fetchWorkers: () => Promise<void>;

  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (p: Project) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  fetchProjects: () => Promise<void>;

  // Income
  addIncome: (i: Omit<Income, 'id' | 'createdAt'>) => Promise<void>;
  updateIncome: (i: Income) => Promise<void>;
  deleteIncome: (id: number) => Promise<void>;
  fetchIncome: () => Promise<void>;
  
  // Expenses
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  
  // Payroll
  addPayrollRecord: (r: Omit<PayrollRecord, 'id' | 'createdAt'>) => Promise<void>;
  updatePayrollRecord: (r: PayrollRecord) => Promise<void>;
  deletePayrollRecord: (id: number) => Promise<void>;
  fetchPayrollRecords: () => Promise<void>;
  
  // Approved Items
  addApprovedItem: (i: Omit<ApprovedItem, 'id'>) => Promise<void>;
  updateApprovedItem: (i: ApprovedItem) => Promise<void>;
  deleteApprovedItem: (id: number) => Promise<void>;
  fetchApprovedItems: () => Promise<void>;
  
  // Suppliers
  addSupplier: (s: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (s: Supplier) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  
  // Purchase Orders
  addPurchaseOrder: (o: Omit<PurchaseOrder, 'id' | 'createdAt'>) => Promise<void>;
  updatePurchaseOrder: (o: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: number) => Promise<void>;
  fetchPurchaseOrders: () => Promise<void>;
  
  // Supplies
  addSupply: (s: Omit<Supply, 'id' | 'createdAt'>) => Promise<void>;
  updateSupply: (s: Supply) => Promise<void>;
  deleteSupply: (id: number) => Promise<void>;
  fetchSupplies: () => Promise<void>;
  
  // Store
  addStoreTransaction: (t: Omit<StoreTransaction, 'id' | 'createdAt'>) => Promise<void>;
  fetchStoreTransactions: () => Promise<void>;
  
  // Site Diary
  addSiteDiaryEntry: (e: Omit<SiteDiaryEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateSiteDiaryEntry: (e: SiteDiaryEntry) => Promise<void>;
  deleteSiteDiaryEntry: (id: number) => Promise<void>;
  fetchSiteDiaryEntries: () => Promise<void>;
  
  // Settings
  // Settings
updateCompanySettings: (s: CompanySettings) => Promise<void>;
fetchCompanySettings: () => Promise<void>;
  
  // Users
  addAppUser: (u: Omit<AppUser, 'id' | 'createdAt'>) => Promise<void>;
  updateAppUser: (u: AppUser) => Promise<void>;
  deleteAppUser: (id: number) => Promise<void>;
  fetchAppUsers: () => Promise<void>;
  
  // Subcontractors
  addSubcontractor: (s: Omit<Subcontractor, 'id' | 'createdAt'>) => Promise<void>;
  updateSubcontractor: (s: Subcontractor) => Promise<void>;
  deleteSubcontractor: (id: number) => Promise<void>;
  fetchSubcontractors: () => Promise<void>;
  
  // Quotations
  addQuotation: (q: Omit<SubcontractorQuotation, 'id' | 'createdAt'>) => Promise<void>;
  updateQuotation: (q: SubcontractorQuotation) => Promise<void>;
  deleteQuotation: (id: number) => Promise<void>;
  fetchQuotations: () => Promise<void>;
  
  // Invoices
  addInvoice: (i: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  updateInvoice: (id: number, i: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  deleteInvoice: (id: number) => Promise<void>;
  fetchInvoices: () => Promise<void>;



  // Clearing Actions
  clearWorkersLedger: () => Promise<void>;
  clearStoresRecords: () => Promise<void>;
  clearAllProjectData: () => void;

  loadSampleData: () => void;
  resetData: () => void;
}



export const useAppStore = create<AppState>((set, get) => ({
  activeModule: 'dashboard',
  setActiveModule: (m) => set({ activeModule: m }),
  sidebarCollapsed: storage.getSidebarCollapsed(),
  toggleSidebar: () => { const v = !get().sidebarCollapsed; storage.setSidebarCollapsed(v); set({ sidebarCollapsed: v }); },
  theme: initTheme,
  toggleTheme: () => { const t = get().theme === 'light' ? 'dark' : 'light'; storage.setTheme(t); document.documentElement.classList.toggle('dark', t === 'dark'); set({ theme: t }); },
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),


setAuthUser: (user) => set({ authUser: user }),  // ← ADD THIS LINE



authUser: (() => {
  const saved = localStorage.getItem('authUser');
  return saved ? JSON.parse(saved) : null;
})(),











  // ========== LOGIN / LOGOUT ==========
login: async (email, password, subdomain) => {
  try {
    const user = await api.login(email, password, subdomain);
    set({ authUser: user });
    
    await Promise.all([
      get().fetchProjects(),
      get().fetchWorkerCategories(),
      get().fetchWorkers(),
      get().fetchIncome(),
      get().fetchExpenses(),
      get().fetchPayrollRecords(),
      get().fetchApprovedItems(),
      get().fetchSuppliers(),
      get().fetchPurchaseOrders(),
      get().fetchSupplies(),
      get().fetchStoreTransactions(),
      get().fetchSiteDiaryEntries(),  // ← MAKE SURE THIS LINE EXISTS
      get().fetchAppUsers(),
      get().fetchSubcontractors(),
      get().fetchQuotations(),
      get().fetchInvoices(),
      get().fetchCompanySettings(),
      get().fetchCurrencySettings()
    ]);
    
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
},





logout: () => {
  api.logout();
  set({ authUser: null });
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
},




  // ========== INITIAL STATE ==========
  projects: [],
  income: [],
  expenses: [],
  workerCategories: [],
  workers: [],
  payrollRecords: [],
  approvedItems: [],
  suppliers: [],
  purchaseOrders: [],
  supplies: [],
  storeTransactions: [],
  siteDiaryEntries: [],
  companySettings: storage.getCompanySettings(),
  appUsers: initAppUsers,
  subcontractors: [],
  quotations: [],
  invoices: [],
  currencySettings: null,




  // ========== PROJECTS ==========
fetchProjects: async () => {
  try {
    const projects = await api.getProjects();
    const mappedProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
      client: p.client,
      contractSum: p.contract_sum,
      location: p.location,
      startDate: p.start_date,
      endDate: p.end_date,
      status: p.status,
      projectManager: p.project_manager,
      description: p.description,
      progress: p.progress || 0,  // Add this line
      createdAt: p.created_at
    }));
    set({ projects: mappedProjects });
    storage.setProjects(mappedProjects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
},



  



addProject: async (p) => {
  try {
    const backendProject = {
      name: p.name,
      client: p.client,
      contract_sum: p.contractSum,
      location: p.location,
      start_date: p.startDate,
      end_date: p.endDate,
      status: p.status,
      project_manager: p.projectManager,
      description: p.description,
      progress: p.progress || 0  // Add this
    };
    const newProject = await api.createProject(backendProject);
    const mappedProject = {
      id: newProject.id,
      name: newProject.name,
      client: newProject.client,
      contractSum: newProject.contract_sum,
      location: newProject.location,
      startDate: newProject.start_date,
      endDate: newProject.end_date,
      status: newProject.status,
      projectManager: newProject.project_manager,
      description: newProject.description,
      progress: newProject.progress || 0,
      createdAt: newProject.created_at
    };
    set((state) => ({ projects: [...state.projects, mappedProject] }));
  } catch (error) {
    console.error('Failed to add project:', error);
  }
},




updateProject: async (p) => {
  try {
    const backendProject = {
      name: p.name,
      client: p.client,
      contract_sum: p.contractSum,
      location: p.location,
      start_date: p.startDate,
      end_date: p.endDate,
      status: p.status,
      project_manager: p.projectManager,
      description: p.description,
      progress: p.progress || 0
    };
    const updated = await api.updateProject(p.id, backendProject);
    const mappedProject = {
      id: updated.id,
      name: updated.name,
      client: updated.client,
      contractSum: updated.contract_sum,
      location: updated.location,
      startDate: updated.start_date,
      endDate: updated.end_date,
      status: updated.status,
      projectManager: updated.project_manager,
      description: updated.description,
      progress: updated.progress || 0,
      createdAt: updated.created_at
    };
    set((state) => ({
      projects: state.projects.map((x) => x.id === mappedProject.id ? mappedProject : x)
    }));
  } catch (error) {
    console.error('Failed to update project:', error);
  }
},



deleteProject: async (id) => {
  try {
    await api.deleteProject(id);
    set((state) => ({
      projects: state.projects.filter((x) => x.id !== id)
    }));
    console.log('Project deleted successfully');
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
},




  // ========== WORKER CATEGORIES ==========
  fetchWorkerCategories: async () => {
    try {
      const categories = await api.getWorkerCategories();
      const mappedCategories = categories.map(c => ({
        id: c.id,
        name: c.name,
        dayRate: c.day_rate,
        color: c.color,
        isActive: c.is_active === 1
      }));
      set({ workerCategories: mappedCategories });
      storage.setWorkerCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to fetch worker categories:', error);
    }
  },





  addWorkerCategory: async (c) => {
    try {
      const backendCategory = {
        name: c.name,
        day_rate: c.dayRate,
        color: c.color,
        is_active: c.isActive !== false ? 1 : 0
      };
      const newCategory = await api.createWorkerCategory(backendCategory);
      const mappedCategory = {
        id: newCategory.id,
        name: newCategory.name,
        dayRate: newCategory.day_rate,
        color: newCategory.color,
        isActive: newCategory.is_active === 1
      };
      set((state) => ({ workerCategories: [...state.workerCategories, mappedCategory] }));
    } catch (error) {
      console.error('Failed to add worker category:', error);
    }
  },





  updateWorkerCategory: async (c) => {
    try {
      const backendCategory = {
        name: c.name,
        day_rate: c.dayRate,
        color: c.color,
        is_active: c.isActive ? 1 : 0
      };
      const updated = await api.updateWorkerCategory(c.id, backendCategory);
      const mappedCategory = {
        id: updated.id,
        name: updated.name,
        dayRate: updated.day_rate,
        color: updated.color,
        isActive: updated.is_active === 1
      };
      set((state) => ({
        workerCategories: state.workerCategories.map(x => x.id === mappedCategory.id ? mappedCategory : x)
      }));
    } catch (error) {
      console.error('Failed to update worker category:', error);
    }
  },

  deleteWorkerCategory: async (id) => {
    try {
      await api.deleteWorkerCategory(id);
      set((state) => ({
        workerCategories: state.workerCategories.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete worker category:', error);
    }
  },

  // ========== WORKERS ==========
  fetchWorkers: async () => {
    try {
      const workers = await api.getWorkers();
      const mappedWorkers = workers.map(w => ({
        id: w.id,
        name: w.name,
        phone: w.phone,
        categoryId: w.category_id,
        projectId: w.project_id,
        dayRate: w.day_rate,
        isActive: w.is_active === 1,
        dateAdded: w.date_added
      }));
      set({ workers: mappedWorkers });
      storage.setWorkers(mappedWorkers);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  },

  addWorker: async (w) => {
    try {
      const backendWorker = {
        name: w.name,
        phone: w.phone,
        category_id: w.categoryId,
        project_id: w.projectId,
        day_rate: w.dayRate,
        is_active: w.isActive !== false ? 1 : 0,
        date_added: w.dateAdded || new Date().toISOString().split('T')[0]
      };
      const newWorker = await api.createWorker(backendWorker);
      const mappedWorker = {
        id: newWorker.id,
        name: newWorker.name,
        phone: newWorker.phone,
        categoryId: newWorker.category_id,
        projectId: newWorker.project_id,
        dayRate: newWorker.day_rate,
        isActive: newWorker.is_active === 1,
        dateAdded: newWorker.date_added
      };
      set((state) => ({ workers: [...state.workers, mappedWorker] }));
    } catch (error) {
      console.error('Failed to add worker:', error);
    }
  },

  updateWorker: async (w) => {
    try {
      const updated = await api.updateWorker(w.id, w);
      const mappedWorker = {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        categoryId: updated.category_id,
        projectId: updated.project_id,
        dayRate: updated.day_rate,
        isActive: updated.is_active === 1,
        dateAdded: updated.date_added
      };
      set((state) => ({
        workers: state.workers.map(x => x.id === mappedWorker.id ? mappedWorker : x)
      }));
    } catch (error) {
      console.error('Failed to update worker:', error);
    }
  },

  deleteWorker: async (id) => {
    try {
      await api.deleteWorker(id);
      set((state) => ({
        workers: state.workers.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete worker:', error);
    }
  },

  // ========== INCOME ==========
fetchIncome: async () => {
  try {
    console.log('Fetching income from API...');
    const income = await api.getIncome();
    console.log('Raw income from API:', income);
    
    // Map snake_case to camelCase
    const mappedIncome = income.map(i => ({
      id: i.id,
      projectId: i.project_id,
      certificateNo: i.certificate_no,
      date: i.date,
      grossAmount: i.gross_amount,
      retentionPercent: i.retention_percent,
      amountReceived: i.amount_received,
      paymentDate: i.payment_date,
      paymentMethod: i.payment_method,
      status: i.status,
      notes: i.notes,
      createdAt: i.created_at
    }));
    
    console.log('Mapped income:', mappedIncome);
    set({ income: mappedIncome });
    storage.setIncome(mappedIncome);
  } catch (error) {
    console.error('Failed to fetch income:', error);
  }
},



addIncome: async (incomeData) => {
  try {
    const payload = {
      project_id: incomeData.projectId,
      certificate_no: incomeData.certificateNo,
      date: incomeData.date,
      gross_amount: incomeData.grossAmount,
      retention_percent: incomeData.retentionPercent || 0,
      amount_received: incomeData.amountReceived || 0,
      payment_date: incomeData.paymentDate,
      payment_method: incomeData.paymentMethod,
      status: incomeData.status,
      notes: incomeData.notes
    };
    
    const newIncome = await api.createIncome(payload);
    
    // Map the response to camelCase
    const mappedIncome = {
      id: newIncome.id,
      projectId: newIncome.project_id,
      certificateNo: newIncome.certificate_no,
      date: newIncome.date,
      grossAmount: newIncome.gross_amount,
      retentionPercent: newIncome.retention_percent,
      amountReceived: newIncome.amount_received,
      paymentDate: newIncome.payment_date,
      paymentMethod: newIncome.payment_method,
      status: newIncome.status,
      notes: newIncome.notes,
      createdAt: newIncome.created_at
    };
    
    // Update state with new array (create a new array reference)
    set((state) => ({ 
      income: [...state.income, mappedIncome] 
    }));
    
    console.log('Income added, new count:', get().income.length);
  } catch (error) {
    console.error('Failed to add income:', error);
  }
},



updateIncome: async (incomeData) => {
  try {
    console.log('Updating income with data:', incomeData);
    
    const payload = {
      project_id: incomeData.projectId,
      certificate_no: incomeData.certificateNo,
      date: incomeData.date,
      gross_amount: incomeData.grossAmount,
      retention_percent: incomeData.retentionPercent || 0,
      amount_received: incomeData.amountReceived || 0,
      payment_date: incomeData.paymentDate,
      payment_method: incomeData.paymentMethod,
      status: incomeData.status,
      notes: incomeData.notes
    };
    
    console.log('Update payload:', payload);
    
    const updatedIncome = await api.updateIncome(incomeData.id, payload);
    console.log('Response from backend:', updatedIncome);
    
    const mappedIncome = {
      id: updatedIncome.id,
      projectId: updatedIncome.project_id,
      certificateNo: updatedIncome.certificate_no,
      date: updatedIncome.date,
      grossAmount: updatedIncome.gross_amount,
      retentionPercent: updatedIncome.retention_percent,
      amountReceived: updatedIncome.amount_received,
      paymentDate: updatedIncome.payment_date,
      paymentMethod: updatedIncome.payment_method,
      status: updatedIncome.status,
      notes: updatedIncome.notes,
      createdAt: updatedIncome.created_at
    };
    
    set((state) => ({
      income: state.income.map(i => i.id === incomeData.id ? mappedIncome : i)
    }));
    console.log('Income updated successfully');
  } catch (error) {
    console.error('Failed to update income:', error);
  }
},





  deleteIncome: async (id) => {
    try {
      await api.deleteIncome(id);
      set((state) => ({
        income: state.income.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  },


// ========== EXPENSES ==========
fetchExpenses: async () => {
  try {
    console.log('Fetching expenses from API...');
    const expenses = await api.getExpenses();
    console.log('Raw expenses from API:', expenses);
    
    // Map snake_case to camelCase for frontend
    const mappedExpenses = expenses.map(e => ({
      id: e.id,
      projectId: e.project_id,
      projectName: e.project_name,
      date: e.date,
      category: e.category,
      description: e.description,
      amount: e.amount,
      vat: e.vat,
      paymentMethod: e.payment_method,
      status: e.status,
      reference: e.reference,
      subcontractorId: e.subcontractor_id,
      createdAt: e.created_at
    }));
    
    console.log('Mapped expenses:', mappedExpenses);
    set({ expenses: mappedExpenses });
    storage.setExpenses(mappedExpenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
  }
},








addExpense: async (e) => {
  try {
    console.log('Adding expense with data:', e);
    
    const payload = {
      project_id: e.projectId,
      project_name: e.projectName,
      date: e.date,
      category: e.category,
      description: e.description,
      amount: e.amount,
      vat: e.vat || e.amount * 0.16,
      payment_method: e.paymentMethod,
      status: e.status,
      reference: e.reference,
      subcontractor_id: e.subcontractorId
    };
    
    console.log('Sending payload:', payload);
    
    const newExpense = await api.createExpense(payload);
    console.log('Response from backend:', newExpense);
    
    // Map response to camelCase
    const mappedExpense = {
      id: newExpense.id,
      projectId: newExpense.project_id,
      projectName: newExpense.project_name,
      date: newExpense.date,
      category: newExpense.category,
      description: newExpense.description,
      amount: newExpense.amount,
      vat: newExpense.vat,
      paymentMethod: newExpense.payment_method,
      status: newExpense.status,
      reference: newExpense.reference,
      subcontractorId: newExpense.subcontractor_id,
      createdAt: newExpense.created_at
    };
    
    set((state) => ({ expenses: [...state.expenses, mappedExpense] }));
    console.log('Expense added successfully');
  } catch (error) {
    console.error('Failed to add expense:', error);
  }
},









updateExpense: async (e) => {
  try {
    console.log('Updating expense:', e);
    
    const payload = {
      project_id: e.projectId,
      project_name: e.projectName,
      date: e.date,
      category: e.category,
      description: e.description,
      amount: e.amount,
      vat: e.vat,
      payment_method: e.paymentMethod,
      status: e.status,
      reference: e.reference,
      subcontractor_id: e.subcontractorId
    };
    
    const updated = await api.updateExpense(e.id, payload);
    console.log('Update response:', updated);
    
    const mappedExpense = {
      id: updated.id,
      projectId: updated.project_id,
      projectName: updated.project_name,
      date: updated.date,
      category: updated.category,
      description: updated.description,
      amount: updated.amount,
      vat: updated.vat,
      paymentMethod: updated.payment_method,
      status: updated.status,
      reference: updated.reference,
      subcontractorId: updated.subcontractor_id,
      createdAt: updated.created_at
    };
    
    set((state) => ({
      expenses: state.expenses.map(x => x.id === e.id ? mappedExpense : x)
    }));
  } catch (error) {
    console.error('Failed to update expense:', error);
  }
},








  deleteExpense: async (id) => {
    try {
      await api.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  },

  // ========== PAYROLL RECORDS ==========
fetchPayrollRecords: async () => {
  try {
    console.log('Fetching payroll records from API...');
    const records = await api.getPayrollRecords();
    console.log('Raw records from API:', records);
    
    // Map snake_case to camelCase for frontend
    const mappedRecords = records.map(record => ({
      id: record.id,
      weekNumber: record.week_number,
      year: record.year,
      weekStart: record.week_start,
      weekEnd: record.week_end,
      projectId: record.project_id,
      projectName: record.project_name,
      status: record.status,
      entries: typeof record.entries === 'string' ? JSON.parse(record.entries) : (record.entries || []),
      totalGrossPay: record.total_gross_pay,
      createdAt: record.created_at,
      approvedAt: record.approved_at,
      paidAt: record.paid_at,
      expenseId: record.expense_id,
      companyId: record.company_id
    }));
    
    console.log('Mapped records:', mappedRecords);
    set({ payrollRecords: mappedRecords });
    storage.setPayrollRecords(mappedRecords);
  } catch (error) {
    console.error('Failed to fetch payroll records:', error);
  }
},




addPayrollRecord: async (record) => {
  try {
    console.log('Adding payroll record with data:', record);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      week_number: record.weekNumber,
      year: record.year,
      week_start: record.weekStart,
      week_end: record.weekEnd,
      project_id: record.projectId,
      project_name: record.projectName,
      entries: JSON.stringify(record.entries),
      total_gross_pay: record.totalGrossPay,
      status: record.status || 'Draft'
    };
    
    console.log('Sending payload:', payload);
    
    const newRecord = await api.createPayrollRecord(payload);
    console.log('Response from backend:', newRecord);
    
    // Fetch all records again to get the complete data
    await get().fetchPayrollRecords();
    
    console.log('Payroll record added. Total:', get().payrollRecords.length);
  } catch (error) {
    console.error('Failed to add payroll record:', error);
  }
},




updatePayrollRecord: async (record) => {
  try {
    const payload = {
      status: record.status,
      entries: JSON.stringify(record.entries),
      total_gross_pay: record.totalGrossPay
    };
    
    const updated = await api.updatePayrollRecord(record.id, payload);
    
    const mappedRecord = {
      id: updated.id,
      weekNumber: updated.week_number,
      year: updated.year,
      weekStart: updated.week_start,
      weekEnd: updated.week_end,
      projectId: updated.project_id,
      projectName: updated.project_name,
      status: updated.status,
      entries: updated.entries || [],
      totalGrossPay: updated.total_gross_pay,
      createdAt: updated.created_at,
      approvedAt: updated.approved_at,
      paidAt: updated.paid_at,
      expenseId: updated.expense_id,
      companyId: updated.company_id
    };
    
    set((state) => ({
      payrollRecords: state.payrollRecords.map(r => r.id === record.id ? mappedRecord : r)
    }));
  } catch (error) {
    console.error('Failed to update payroll record:', error);
  }
},






  deletePayrollRecord: async (id) => {
    try {
      await api.deletePayrollRecord(id);
      set((state) => ({
        payrollRecords: state.payrollRecords.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete payroll record:', error);
    }
  },

 



 // ========== APPROVED ITEMS ==========
fetchApprovedItems: async () => {
  try {
    console.log('Fetching approved items from API...');
    const items = await api.getApprovedItems();
    console.log('Raw items from API:', items);
    
    // Map snake_case to camelCase for frontend
    const mappedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      defaultPrice: item.default_price,
      description: item.description,
      isActive: item.is_active === 1,
      companyId: item.company_id,
      createdAt: item.created_at
    }));
    
    console.log('Mapped items:', mappedItems);
    set({ approvedItems: mappedItems });
    storage.setApprovedItems(mappedItems);
  } catch (error) {
    console.error('Failed to fetch approved items:', error);
  }
},



addApprovedItem: async (item) => {
  try {
    console.log('Adding approved item with data:', item);
    
    const payload = {
      name: item.name,
      category: item.category,
      unit: item.unit,
      default_price: item.defaultPrice,
      description: item.description,
      is_active: item.isActive !== false ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    const newItem = await api.createApprovedItem(payload);
    console.log('Response from backend:', newItem);
    
    const mappedItem = {
      id: newItem.id,
      name: newItem.name,
      category: newItem.category,
      unit: newItem.unit,
      defaultPrice: newItem.default_price,
      description: newItem.description,
      isActive: newItem.is_active === 1,
      companyId: newItem.company_id,
      createdAt: newItem.created_at
    };
    
    set((state) => ({ 
      approvedItems: [...state.approvedItems, mappedItem] 
    }));
    
    console.log('Item added to store. Total:', get().approvedItems.length);
  } catch (error) {
    console.error('Failed to add approved item:', error);
  }
},






updateApprovedItem: async (item) => {
  try {
    console.log('Updating approved item:', item);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      name: item.name,
      category: item.category,
      unit: item.unit,
      default_price: item.defaultPrice,
      description: item.description,
      is_active: item.isActive ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    const updated = await api.updateApprovedItem(item.id, payload);
    console.log('Response from backend:', updated);
    
    // Map response back to camelCase
    const mappedItem = {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      unit: updated.unit,
      defaultPrice: updated.default_price,
      description: updated.description,
      isActive: updated.is_active === 1,
      companyId: updated.company_id,
      createdAt: updated.created_at
    };
    
    set((state) => ({
      approvedItems: state.approvedItems.map(x => x.id === item.id ? mappedItem : x)
    }));
    
    console.log('Approved item updated successfully');
  } catch (error) {
    console.error('Failed to update approved item:', error);
  }
},






  deleteApprovedItem: async (id) => {
    try {
      await api.deleteApprovedItem(id);
      set((state) => ({
        approvedItems: state.approvedItems.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete approved item:', error);
    }
  },

  // ========== SUPPLIERS ==========
  



fetchSuppliers: async () => {
  try {
    console.log('Fetching suppliers from API...');
    const suppliers = await api.getSuppliers();
    console.log('Raw suppliers from API:', suppliers);
    
    // Map snake_case to camelCase for frontend
    const mappedSuppliers = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      kraPin: s.kra_pin,
      phone: s.phone,
      email: s.email,
      address: s.address,
      contactPerson: s.contact_person,
      paymentTerms: s.payment_terms,
      isActive: s.is_active === 1,
      companyId: s.company_id
    }));
    
    console.log('Mapped suppliers:', mappedSuppliers);
    set({ suppliers: mappedSuppliers });
    storage.setSuppliers(mappedSuppliers);
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
  }
},




  addSupplier: async (s) => {
  try {
    console.log('Adding supplier with data:', s);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      name: s.name,
      kra_pin: s.kraPin,
      phone: s.phone,
      email: s.email,
      address: s.address,
      contact_person: s.contactPerson,
      payment_terms: s.paymentTerms,
      is_active: s.isActive !== false ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    const newSupplier = await api.createSupplier(payload);
    console.log('Response from backend:', newSupplier);
    
    // Map response to camelCase
    const mappedSupplier = {
      id: newSupplier.id,
      name: newSupplier.name,
      kraPin: newSupplier.kra_pin,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      contactPerson: newSupplier.contact_person,
      paymentTerms: newSupplier.payment_terms,
      isActive: newSupplier.is_active === 1,
      companyId: newSupplier.company_id
    };
    
    set((state) => ({ 
      suppliers: [...state.suppliers, mappedSupplier] 
    }));
    
    console.log('Supplier added to store. Total:', get().suppliers.length);
  } catch (error) {
    console.error('Failed to add supplier:', error);
  }
},







updateSupplier: async (supplier) => {
  try {
    console.log('Updating supplier:', supplier);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      name: supplier.name,
      kra_pin: supplier.kraPin,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      contact_person: supplier.contactPerson,
      payment_terms: supplier.paymentTerms,
      is_active: supplier.isActive ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    const updated = await api.updateSupplier(supplier.id, payload);
    console.log('Response from backend:', updated);
    
    // Map response back to camelCase
    const mappedSupplier = {
      id: updated.id,
      name: updated.name,
      kraPin: updated.kra_pin,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      contactPerson: updated.contact_person,
      paymentTerms: updated.payment_terms,
      isActive: updated.is_active === 1,
      companyId: updated.company_id
    };
    
    set((state) => ({
      suppliers: state.suppliers.map(x => x.id === supplier.id ? mappedSupplier : x)
    }));
    
    console.log('Supplier updated successfully');
  } catch (error) {
    console.error('Failed to update supplier:', error);
  }
},






  // ========== PURCHASE ORDERS ==========
fetchPurchaseOrders: async () => {
  try {
    console.log('Fetching purchase orders from API...');
    const orders = await api.getPurchaseOrders();
    console.log('Raw orders from API:', orders);
    
    // Map snake_case to camelCase for frontend
    const mappedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      supplierId: order.supplier_id,
      supplierName: order.supplier_name,
      projectId: order.project_id,
      projectName: order.project_name,
      orderDate: order.order_date,
      expectedDate: order.expected_date,
      items: order.items || [],
      subtotal: order.subtotal,
      vat: order.vat,
      total: order.total,
      status: order.status,
      paymentStatus: order.payment_status,
      notes: order.notes,
      createdAt: order.created_at,
      companyId: order.company_id
    }));
    
    console.log('Mapped orders:', mappedOrders);
    set({ purchaseOrders: mappedOrders });
    storage.setPurchaseOrders(mappedOrders);
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error);
  }
},





addPurchaseOrder: async (order) => {
  try {
    console.log('Adding purchase order with data:', order);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      order_number: order.orderNumber,
      supplier_id: order.supplierId,
      supplier_name: order.supplierName,
      project_id: order.projectId,
      project_name: order.projectName,
      order_date: order.orderDate,
      expected_date: order.expectedDate,
      items: order.items || [],
      subtotal: order.subtotal || 0,
      vat: order.vat || 0,
      total: order.total || 0,
      notes: order.notes || ''
    };
    
    console.log('Sending payload:', payload);
    
    const newOrder = await api.createPurchaseOrder(payload);
    console.log('Response from backend:', newOrder);
    
    // Map response back to camelCase
    const mappedOrder = {
      id: newOrder.id,
      orderNumber: newOrder.order_number,
      supplierId: newOrder.supplier_id,
      supplierName: newOrder.supplier_name,
      projectId: newOrder.project_id,
      projectName: newOrder.project_name,
      orderDate: newOrder.order_date,
      expectedDate: newOrder.expected_date,
      items: newOrder.items || [],
      subtotal: newOrder.subtotal,
      vat: newOrder.vat,
      total: newOrder.total,
      status: newOrder.status,
      paymentStatus: newOrder.payment_status,
      notes: newOrder.notes,
      createdAt: newOrder.created_at,
      companyId: newOrder.company_id
    };
    
    set((state) => ({ 
      purchaseOrders: [...state.purchaseOrders, mappedOrder] 
    }));
    
    console.log('Purchase order added to store. Total:', get().purchaseOrders.length);
  } catch (error) {
    console.error('Failed to add purchase order:', error);
  }
},






  updatePurchaseOrder: async (o) => {
    try {
      const updated = await api.updatePurchaseOrder(o.id, o);
      const mappedOrder = {
        ...updated,
        items: JSON.parse(updated.items)
      };
      set((state) => ({
        purchaseOrders: state.purchaseOrders.map(x => x.id === mappedOrder.id ? mappedOrder : x)
      }));
    } catch (error) {
      console.error('Failed to update purchase order:', error);
    }
  },

  deletePurchaseOrder: async (id) => {
    try {
      await api.deletePurchaseOrder(id);
      set((state) => ({
        purchaseOrders: state.purchaseOrders.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
    }
  },

  // ========== SUPPLIES ==========
fetchSupplies: async () => {
  try {
    console.log('Fetching supplies from API...');
    const supplies = await api.getSupplies();
    console.log('Raw supplies from API:', supplies);
    
    // Map snake_case to camelCase for frontend
    const mappedSupplies = supplies.map(s => ({
      id: s.id,
      supplierId: s.supplier_id,
      supplierName: s.supplier_name,
      projectId: s.project_id,
      projectName: s.project_name,
      date: s.date,
      itemId: s.item_id,
      itemName: s.item_name,
      unit: s.unit,
      quantity: s.quantity,
      unitPrice: s.unit_price,
      totalAmount: s.total_amount,
      vat: s.vat,
      status: s.status,
      paid: s.paid === 1,
      orderId: s.order_id,
      deliveryNote: s.delivery_note,
      notes: s.notes,
      createdAt: s.created_at,
      companyId: s.company_id
    }));
    
    console.log('Mapped supplies:', mappedSupplies);
    set({ supplies: mappedSupplies });
    storage.setSupplies(mappedSupplies);
  } catch (error) {
    console.error('Failed to fetch supplies:', error);
  }
},






addSupply: async (s) => {
  try {
    console.log('Adding supply with data:', s);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      supplier_id: s.supplierId,
      supplier_name: s.supplierName,
      project_id: s.projectId,
      project_name: s.projectName,
      date: s.date,
      item_id: s.itemId || null,
      item_name: s.itemName,
      unit: s.unit,
      quantity: s.quantity,
      unit_price: s.unitPrice,
      total_amount: s.totalAmount,
      vat: s.vat || 0,
      status: s.status || 'Delivered',
      paid: s.paid ? 1 : 0,
      order_id: s.orderId || null,
      delivery_note: s.deliveryNote,
      notes: s.notes
    };
    
    console.log('Sending payload:', payload);
    
    const newSupply = await api.createSupply(payload);
    console.log('Response from backend:', newSupply);
    
    // Map response back to camelCase
    const mappedSupply = {
      id: newSupply.id,
      supplierId: newSupply.supplier_id,
      supplierName: newSupply.supplier_name,
      projectId: newSupply.project_id,
      projectName: newSupply.project_name,
      date: newSupply.date,
      itemId: newSupply.item_id,
      itemName: newSupply.item_name,
      unit: newSupply.unit,
      quantity: newSupply.quantity,
      unitPrice: newSupply.unit_price,
      totalAmount: newSupply.total_amount,
      vat: newSupply.vat,
      status: newSupply.status,
      paid: newSupply.paid === 1,
      orderId: newSupply.order_id,
      deliveryNote: newSupply.delivery_note,
      notes: newSupply.notes,
      createdAt: newSupply.created_at,
      companyId: newSupply.company_id
    };
    
    set((state) => ({ 
      supplies: [...state.supplies, mappedSupply] 
    }));
    
    console.log('Supply added to store. Total:', get().supplies.length);
  } catch (error) {
    console.error('Failed to add supply:', error);
  }
},







  updateSupply: async (s) => {
    try {
      const updated = await api.updateSupply(s.id, s);
      set((state) => ({
        supplies: state.supplies.map(x => x.id === updated.id ? updated : x)
      }));
    } catch (error) {
      console.error('Failed to update supply:', error);
    }
  },

  deleteSupply: async (id) => {
    try {
      await api.deleteSupply(id);
      set((state) => ({
        supplies: state.supplies.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete supply:', error);
    }
  },

  // ========== STORE TRANSACTIONS ==========
fetchStoreTransactions: async () => {
  try {
    console.log('Fetching store transactions from API...');
    const transactions = await api.getStoreTransactions();
    console.log('Raw transactions from API:', transactions);
    
    // Map snake_case to camelCase for frontend
    const mappedTransactions = transactions.map(t => ({
      id: t.id,
      date: t.date,
      projectId: t.project_id,
      projectName: t.project_name,
      itemId: t.item_id,
      itemName: t.item_name,
      unit: t.unit,
      category: t.category,
      quantitySupplied: t.quantity_supplied,
      quantityIssued: t.quantity_issued,
      quantityReturned: t.quantity_returned,
      balance: t.balance,
      transactionType: t.transaction_type,
      reference: t.reference,
      issuedTo: t.issued_to,
      returnedBy: t.returned_by,
      notes: t.notes,
      createdAt: t.created_at,
      companyId: t.company_id
    }));
    
    console.log('Mapped transactions:', mappedTransactions);
    set({ storeTransactions: mappedTransactions });
    storage.setStoreTransactions(mappedTransactions);
  } catch (error) {
    console.error('Failed to fetch store transactions:', error);
  }
},




addStoreTransaction: async (transaction) => {
  try {
    console.log('Adding store transaction with data:', transaction);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      date: transaction.date,
      project_id: transaction.projectId,
      project_name: transaction.projectName,
      item_id: transaction.itemId,
      item_name: transaction.itemName,
      unit: transaction.unit,
      category: transaction.category,
      quantity_supplied: transaction.quantitySupplied || 0,
      quantity_issued: transaction.quantityIssued || 0,
      quantity_returned: transaction.quantityReturned || 0,
      balance: transaction.balance || 0,
      transaction_type: transaction.transactionType,
      reference: transaction.reference,
      issued_to: transaction.issuedTo || null,
      returned_by: transaction.returnedBy || null,
      notes: transaction.notes || ''
    };
    
    console.log('Sending payload:', payload);
    
    const newTransaction = await api.createStoreTransaction(payload);
    console.log('Response from backend:', newTransaction);
    
    // Map response back to camelCase
    const mappedTransaction = {
      id: newTransaction.id,
      date: newTransaction.date,
      projectId: newTransaction.project_id,
      projectName: newTransaction.project_name,
      itemId: newTransaction.item_id,
      itemName: newTransaction.item_name,
      unit: newTransaction.unit,
      category: newTransaction.category,
      quantitySupplied: newTransaction.quantity_supplied,
      quantityIssued: newTransaction.quantity_issued,
      quantityReturned: newTransaction.quantity_returned,
      balance: newTransaction.balance,
      transactionType: newTransaction.transaction_type,
      reference: newTransaction.reference,
      issuedTo: newTransaction.issued_to,
      returnedBy: newTransaction.returned_by,
      notes: newTransaction.notes,
      createdAt: newTransaction.created_at,
      companyId: newTransaction.company_id
    };
    
    set((state) => ({ 
      storeTransactions: [...state.storeTransactions, mappedTransaction] 
    }));
    
    console.log('Store transaction added. Total:', get().storeTransactions.length);
  } catch (error) {
    console.error('Failed to add store transaction:', error);
  }
},



  // ========== SITE DIARY ==========
fetchSiteDiaryEntries: async () => {
  try {
    console.log('Fetching site diary entries from API...');
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/site-diary-entries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const entries = await response.json();
    console.log('Raw entries from API:', entries);
    
    // The API returns camelCase fields directly - use them as-is!
    const mappedEntries = entries.map(entry => ({
      id: entry.id,
      date: entry.date,
      projectId: entry.projectId,           // ✅ camelCase from API
      projectName: entry.projectName,        // ✅ camelCase from API
      weather: entry.weather || {},
      totalWorkers: entry.totalWorkers,      // ✅ camelCase from API (this is the key!)
      activities: entry.activities || [],
      deliveries: entry.deliveries || [],
      incidents: entry.incidents || [],
      siteWorkers: entry.siteWorkers,        // ✅ camelCase from API
      siteSubcontractors: entry.siteSubcontractors || [],
      summary: entry.summary || {},
      status: entry.status,
      createdAt: entry.createdAt
    }));
    
    console.log('Mapped entries count:', mappedEntries.length);
    console.log('First entry totalWorkers:', mappedEntries[0]?.totalWorkers);
    console.log('First entry siteWorkers:', mappedEntries[0]?.siteWorkers);
    set({ siteDiaryEntries: mappedEntries });
    storage.setSiteDiaryEntries(mappedEntries);
  } catch (error) {
    console.error('Failed to fetch site diary entries:', error);
  }
},











addSiteDiaryEntry: async (entry) => {
  try {
    console.log('Adding site diary entry with data:', entry);
    
    // The entry already has snake_case from handleSave
    const payload = {
      date: entry.date,
      project_id: entry.project_id,
      project_name: entry.project_name,
      weather: entry.weather || {},
      total_workers: entry.total_workers || 0,      // ← Use entry.total_workers (snake_case)
      activities: entry.activities || [],
      deliveries: entry.deliveries || [],
      incidents: entry.incidents || [],
      site_workers: entry.site_workers || [],        // ← Use entry.site_workers (snake_case)
      site_subcontractors: entry.site_subcontractors || [],
      summary: entry.summary || {},
      status: entry.status || 'Submitted'
    };
    
    console.log('Sending payload:', payload);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/site-diary-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create site diary entry');
    }



    
const newEntry = await response.json();
console.log('Response from backend:', newEntry);

// Map response back to camelCase for the store
const mappedEntry = {
  id: newEntry.id,
  date: newEntry.date,
  projectId: newEntry.projectId,           // ✅ camelCase from API
  projectName: newEntry.projectName,        // ✅ camelCase from API
  weather: newEntry.weather || {},
  totalWorkers: newEntry.totalWorkers,      // ✅ camelCase from API
  activities: newEntry.activities || [],
  deliveries: newEntry.deliveries || [],
  incidents: newEntry.incidents || [],
  siteWorkers: newEntry.siteWorkers,        // ✅ camelCase from API
  siteSubcontractors: newEntry.siteSubcontractors || [],
  summary: newEntry.summary || {},
  status: newEntry.status || 'Submitted',
  createdAt: newEntry.createdAt
};

  
    set((state) => ({ 
      siteDiaryEntries: [mappedEntry, ...state.siteDiaryEntries] 
    }));
    
    console.log('Site diary entry added to store. Total:', get().siteDiaryEntries.length);
    
 
    
  } catch (error) {
    console.error('Failed to add site diary entry:', error);
    alert('Failed to save site diary entry. Please try again.');
  }
},





  updateSiteDiaryEntry: async (e) => {
    try {
      const updated = await api.updateSiteDiaryEntry(e.id, e);
      const mappedEntry = {
        ...updated,
        weather: JSON.parse(updated.weather),
        activities: JSON.parse(updated.activities),
        inspections: JSON.parse(updated.inspections),
        deliveries: JSON.parse(updated.deliveries),
        incidents: JSON.parse(updated.incidents),
        challenges: JSON.parse(updated.challenges),
        summary: JSON.parse(updated.summary)
      };
      set((state) => ({
        siteDiaryEntries: state.siteDiaryEntries.map(x => x.id === mappedEntry.id ? mappedEntry : x)
      }));
    } catch (error) {
      console.error('Failed to update site diary entry:', error);
    }
  },

  deleteSiteDiaryEntry: async (id) => {
    try {
      await api.deleteSiteDiaryEntry(id);
      set((state) => ({
        siteDiaryEntries: state.siteDiaryEntries.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete site diary entry:', error);
    }
  },



  // ========== USERS ==========
fetchAppUsers: async () => {
  try {
    const users = await api.getUsers();
    const mappedUsers = users.map(u => {
      // Parse permissions if it's a string
      let permissions = [];
      
      if (typeof u.permissions === 'string' && u.permissions) {
        try {
          // Try to parse as JSON directly
          let permStr = u.permissions;
          
          // Handle case where it's already an array string like '["dashboard"]'
          if (permStr.startsWith('[') && permStr.endsWith(']')) {
            permissions = JSON.parse(permStr);
          } 
          // Handle case where it's double-escaped
          else if (permStr.includes('\\"')) {
            // Replace escaped quotes
            permStr = permStr.replace(/\\"/g, '"');
            if (permStr.startsWith('[') && permStr.endsWith(']')) {
              permissions = JSON.parse(permStr);
            }
          }
          // If still a string and looks like JSON array
          else if (permStr.includes('[') && permStr.includes(']')) {
            // Extract the array part
            const match = permStr.match(/\[.*\]/);
            if (match) {
              permissions = JSON.parse(match[0]);
            }
          }
        } catch (e) {
          console.error('Error parsing permissions for user', u.name, e);
          console.log('Raw permissions string:', u.permissions);
          permissions = [];
        }
      } else if (Array.isArray(u.permissions)) {
        permissions = u.permissions;
      }
      
      // Ensure permissions is always an array
      if (!Array.isArray(permissions)) {
        permissions = [];
      }
      
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        password: '',
        role: u.role,
        permissions: permissions,
        isActive: u.is_active === 1,
        createdAt: u.created_at
      };
    });
    set({ appUsers: mappedUsers });
    storage.setAppUsers(mappedUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
},




addAppUser: async (user) => {
  try {
    // Ensure permissions is a proper JSON string
    let permissionsToStore = '[]';
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      permissionsToStore = JSON.stringify(user.permissions);
    }
    
    const backendUser = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      permissions: permissionsToStore,
      is_active: user.isActive !== false ? 1 : 0
    };
    
    const newUser = await api.createUser(backendUser);
    
    const mappedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: '',
      role: newUser.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      isActive: newUser.is_active === 1,
      createdAt: newUser.created_at
    };
    
    set((state) => ({ appUsers: [...state.appUsers, mappedUser] }));
  } catch (error) {
    console.error('Failed to add user:', error);
  }
},



updateAppUser: async (user) => {
  try {
    // Ensure permissions is a proper JSON string
    let permissionsToStore = '[]';
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      permissionsToStore = JSON.stringify(user.permissions);
    }
    
    const backendUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissionsToStore,
      is_active: user.isActive ? 1 : 0
    };
    
    const updated = await api.updateUser(user.id, backendUser);
    
    const mappedUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      password: '',
      role: updated.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      isActive: updated.is_active === 1,
      createdAt: updated.created_at
    };
    
    set((state) => ({
      appUsers: state.appUsers.map(x => x.id === mappedUser.id ? mappedUser : x)
    }));
  } catch (error) {
    console.error('Failed to update user:', error);
  }
},




  deleteAppUser: async (id) => {
    try {
      await api.deleteUser(id);
      set((state) => ({
        appUsers: state.appUsers.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  },






  




// ========== SUBCONTRACTORS ==========
fetchSubcontractors: async () => {
  try {
    const subcontractors = await api.getSubcontractors();
    console.log('Raw subcontractors:', subcontractors);
    
    const mappedSubcontractors = subcontractors.map(s => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      email: s.email,
      kraPin: s.kra_pin,           // ← Make sure this maps correctly
      specialization: s.specialization,
      address: s.address,
      contactPerson: s.contact_person,  // ← Make sure this maps correctly
      isActive: s.is_active === 1,
      createdAt: s.created_at
    }));
    
    set({ subcontractors: mappedSubcontractors });
    storage.setSubcontractors(mappedSubcontractors);
  } catch (error) {
    console.error('Failed to fetch subcontractors:', error);
  }
},







addSubcontractor: async (subcontractor) => {
  try {
    console.log('Adding subcontractor with data:', subcontractor);
    
    const payload = {
      name: subcontractor.name,
      phone: subcontractor.phone,
      email: subcontractor.email || '',
      kra_pin: subcontractor.kraPin || '',
      specialization: subcontractor.specialization || '',
      address: subcontractor.address || '',
      contact_person: subcontractor.contactPerson || '',
      is_active: subcontractor.isActive !== false ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    await api.createSubcontractor(payload);
    
    // THIS IS THE KEY FIX - Refresh the list after adding
    await get().fetchSubcontractors();
    
    console.log('Subcontractor added. Total:', get().subcontractors.length);
  } catch (error) {
    console.error('Failed to add subcontractor:', error);
  }
},





updateSubcontractor: async (subcontractor) => {
  try {
    console.log('Updating subcontractor:', subcontractor);
    
    const payload = {
      name: subcontractor.name,
      phone: subcontractor.phone,
      email: subcontractor.email || '',
      kra_pin: subcontractor.kraPin || '',
      specialization: subcontractor.specialization || '',
      address: subcontractor.address || '',
      contact_person: subcontractor.contactPerson || '',
      is_active: subcontractor.isActive ? 1 : 0
    };
    
    console.log('Sending payload:', payload);
    
    await api.updateSubcontractor(subcontractor.id, payload);
    
    // THIS IS THE KEY FIX - Refresh the list after update
    await get().fetchSubcontractors();
    
    console.log('Subcontractor updated successfully');
  } catch (error) {
    console.error('Failed to update subcontractor:', error);
  }
},





deleteSubcontractor: async (id) => {
  try {
    console.log('Deleting subcontractor ID:', id);
    
    await api.deleteSubcontractor(id);
    
    // THIS IS THE KEY FIX - Refresh the list after delete
    await get().fetchSubcontractors();
    
    console.log('Subcontractor deleted successfully');
  } catch (error) {
    console.error('Failed to delete subcontractor:', error);
  }
},










  // ========== QUOTATIONS ==========
  fetchQuotations: async () => {
    try {
      const quotations = await api.getQuotations();
      set({ quotations });
      storage.setQuotations(quotations);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    }
  },




















addQuotation: async (quotation) => {
  try {
    console.log('addQuotation received:', quotation);
    
    // Transform camelCase to snake_case for backend
    const payload = {
      subcontractor_id: quotation.subcontractor_id,
      subcontractor_name: quotation.subcontractor_name,
      project_id: quotation.project_id,
      project_name: quotation.project_name,
      description: quotation.description,
      amount: quotation.amount,
      date: quotation.date,
      status: quotation.status,
      notes: quotation.notes
    };
    
    console.log('Sending payload to API:', payload);
    
    const newQuotation = await api.createQuotation(payload);
    console.log('Response from backend:', newQuotation);
    
    set((state) => ({ 
      quotations: [...state.quotations, newQuotation] 
    }));
    
    return newQuotation;
  } catch (error) {
    console.error('Failed to add quotation:', error);
    throw error;
  }
},











updateQuotation: async (q) => {
  try {
    // Send ALL fields for update
    const payload = {
      subcontractor_id: q.subcontractor_id,
      subcontractor_name: q.subcontractor_name,
      project_id: q.project_id,
      project_name: q.project_name,
      description: q.description,
      amount: q.amount,
      date: q.date,
      status: q.status,
      notes: q.notes
    };
    
    console.log('Updating quotation with payload:', payload);
    
    const updated = await api.updateQuotation(q.id, payload);
    
    set((state) => ({
      quotations: state.quotations.map(x => x.id === updated.id ? updated : x)
    }));
    
    console.log('Quotation updated successfully:', updated);
  } catch (error) {
    console.error('Failed to update quotation:', error);
  }
},




  deleteQuotation: async (id) => {
    try {
      await api.deleteQuotation(id);
      set((state) => ({
        quotations: state.quotations.filter(x => x.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete quotation:', error);
    }
  },






  // ========== INVOICES ==========
  fetchInvoices: async () => {
    try {
      console.log('Fetching invoices from API...');
      const data = await api.getInvoices();
      console.log('Raw API response:', data);
      
      // Transform snake_case to camelCase
      const transformed = data.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        clientName: inv.client_name,
        projectName: inv.project_name,
        date: inv.date,
        dueDate: inv.due_date,
        items: Array.isArray(inv.items) ? inv.items : [],
        subtotal: inv.subtotal || 0,
        vat: inv.vat || 0,
        total: inv.total || 0,
        status: inv.status || 'Draft',
        notes: inv.notes || '',
        createdAt: inv.created_at,
        companyId: inv.company_id,
        projectId: inv.project_id
      }));
      
      console.log('Transformed invoices:', transformed);
      set({ invoices: transformed });
      console.log('Store updated with', transformed.length, 'invoices');
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    }
  },

  addInvoice: async (invoice) => {
    try {



      const payload = {
        invoice_number: invoice.invoiceNumber,
        project_id: invoice.projectId,
        project_name: invoice.projectName,
        client_name: invoice.clientName,
        date: invoice.date,
        due_date: invoice.dueDate,
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        vat: invoice.vat || 0,
        total: invoice.total || 0,
        status: invoice.status,
        notes: invoice.notes || ''
      };




      
      const data = await api.createInvoice(payload);
      
      const transformed = {
        id: data.id,
        invoiceNumber: data.invoice_number,
        clientName: data.client_name,
        projectName: data.project_name,
        date: data.date,
        dueDate: data.due_date,
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: data.subtotal,
        vat: data.vat,
        total: data.total,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        companyId: data.company_id,
        projectId: data.project_id
      };
      
      set(state => ({ invoices: [...state.invoices, transformed] }));
      console.log('Invoice added successfully');
    } catch (error) {
      console.error('Failed to add invoice:', error);
    }
  },

  updateInvoice: async (id, invoice) => {
    try {
      console.log('Updating invoice ID:', id);
      console.log('Invoice data:', invoice);
      
      const payload = {
        invoice_number: invoice.invoiceNumber,
        project_id: invoice.projectId,
        project_name: invoice.projectName,
        client_name: invoice.clientName,
        date: invoice.date,
        due_date: invoice.dueDate,
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        vat: invoice.vat || 0,
        total: invoice.total || 0,
        status: invoice.status,
        notes: invoice.notes || ''
      };
      
      const data = await api.updateInvoice(id, payload);
      
      const transformed = {
        id: data.id,
        invoiceNumber: data.invoice_number,
        clientName: data.client_name,
        projectName: data.project_name,
        date: data.date,
        dueDate: data.due_date,
        items: Array.isArray(data.items) ? data.items : [],
        subtotal: data.subtotal,
        vat: data.vat,
        total: data.total,
        status: data.status,
        notes: data.notes,
        createdAt: data.created_at,
        companyId: data.company_id,
        projectId: data.project_id
      };
      
      set(state => ({
        invoices: state.invoices.map(i => i.id === id ? transformed : i)
      }));
      
      console.log('Invoice updated successfully');
    } catch (error) {
      console.error('Failed to update invoice:', error);
    }
  },

  deleteInvoice: async (id) => {
    try {
      await api.deleteInvoice(id);
      set(state => ({
        invoices: state.invoices.filter(i => i.id !== id)
      }));
      console.log('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  },


// ========== CURRENCY ==========
fetchCurrencySettings: async () => {
  try {
    const settings = await api.getCurrencySettings();
    set({ currencySettings: settings });
    // Update the formatter - NO AWAIT NEEDED, just call it
    setCurrencySettings(settings);
  } catch (error) {
    console.error('Failed to fetch currency settings:', error);
  }
},









updateCurrencySettings: async (settings) => {
  try {
    const updated = await api.updateCurrencySettings(settings);
    set({ currencySettings: updated });
    // Update the formatter - NO AWAIT NEEDED, just call it
    setCurrencySettings(updated);
    // Refresh financial data to show new currency
    await Promise.all([
      get().fetchIncome(),
      get().fetchExpenses(),
      get().fetchInvoices(),
      get().fetchPurchaseOrders()
    ]);
    return updated;
  } catch (error) {
    console.error('Failed to update currency settings:', error);
    throw error;
  }
},



// ========== SETTINGS ==========
fetchCompanySettings: async () => {
  try {
    console.log('Fetching company settings from API...');
    const settings = await api.getSettings();
    console.log('Settings from API:', settings);
    set({ companySettings: settings });
    storage.setCompanySettings(settings);
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
  }
},

updateCompanySettings: async (s) => {
  try {
    console.log('Updating company settings:', s);
    const updated = await api.updateSettings(s);
    console.log('Updated settings from API:', updated);
    set({ companySettings: updated });
    storage.setCompanySettings(updated);
    return updated;
  } catch (error) {
    console.error('Failed to update company settings:', error);
    throw error;
  }
},



// ========== CLEARING ACTIONS ==========
clearWorkersLedger: async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!confirm('WARNING: This will permanently delete ALL PAYROLL RECORDS (Ledger). Workers will NOT be deleted. This action cannot be undone. Continue?')) {
      return;
    }
    
    // Get all payroll records from backend
    const getResponse = await fetch(`${API_BASE_URL}/payroll-records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const payrollRecords = await getResponse.json();
    
    // Delete each payroll record from backend
    for (const record of payrollRecords) {
      await fetch(`${API_BASE_URL}/payroll-records/${record.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Clear payroll records from frontend storage ONLY (keep workers)
    storage.setPayrollRecords([]);
    
    // Update store: keep workers as they are, clear payrollRecords only
    set((state) => ({
      payrollRecords: [],
      workers: state.workers  // Preserve workers
    }));
    
    console.log('Payroll ledger cleared. Workers preserved.');
    alert('Payroll ledger cleared successfully. Workers were NOT deleted.');
  } catch (error) {
    console.error('Failed to clear payroll ledger:', error);
    alert('Error clearing payroll ledger. Please try again.');
  }
},

clearStoresRecords: async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!confirm('WARNING: This will permanently delete ALL store transactions (supplies, issues, returns). This action cannot be undone. Continue?')) {
      return;
    }
    
    // Get all store transactions from backend
    const getResponse = await fetch(`${API_BASE_URL}/store-transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const transactions = await getResponse.json();
    
    // Delete each transaction
    for (const transaction of transactions) {
      await fetch(`${API_BASE_URL}/store-transactions/${transaction.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Also clear supplies if needed
    const suppliesResponse = await fetch(`${API_BASE_URL}/supplies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const supplies = await suppliesResponse.json();
    
    for (const supply of supplies) {
      await fetch(`${API_BASE_URL}/supplies/${supply.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Clear frontend storage
    storage.clearStores();
    
    // Update store
    set({ 
      storeTransactions: [],
      supplies: []
    });
    
    console.log('All store transactions and supplies cleared');
    alert('Store records cleared successfully!');
  } catch (error) {
    console.error('Failed to clear store records:', error);
    alert('Error clearing store records. Please try again.');
  }
},



clearPurchaseOrders: async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!confirm('WARNING: This will permanently delete ALL purchase orders and related supplies. This action cannot be undone. Continue?')) {
      return;
    }
    
    // Get all purchase orders
    const getResponse = await fetch(`${API_BASE_URL}/purchase-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await getResponse.json();
    
    // Delete each purchase order
    for (const order of orders) {
      await fetch(`${API_BASE_URL}/purchase-orders/${order.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Also clear supplies if needed
    const suppliesResponse = await fetch(`${API_BASE_URL}/supplies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const supplies = await suppliesResponse.json();
    
    for (const supply of supplies) {
      await fetch(`${API_BASE_URL}/supplies/${supply.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    
    // Clear frontend store
    set({ purchaseOrders: [], supplies: [] });
    storage.setPurchaseOrders([]);
    storage.setSupplies([]);
    
    console.log('All purchase orders and supplies cleared');
    alert('All purchase orders and supplies have been cleared.');
  } catch (error) {
    console.error('Failed to clear purchase orders:', error);
    alert('Error clearing purchase orders. Please try again.');
  }
},




  clearAllProjectData: () => {
    storage.clearAllProjectData();
    set({
      projects: storage.getProjects(),
      income: storage.getIncome(),
      expenses: storage.getExpenses(),
      workers: storage.getWorkers(),
      payrollRecords: storage.getPayrollRecords(),
      purchaseOrders: storage.getPurchaseOrders(),
      supplies: storage.getSupplies(),
      storeTransactions: storage.getStoreTransactions(),
      siteDiaryEntries: storage.getSiteDiaryEntries(),
    });
  },







  // ========== SAMPLE DATA & RESET ==========
loadSampleData: async () => {
  try {
    console.log('Loading sample data from backend API...');
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/load-sample-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to load sample data');
    }
    
    const result = await response.json();
    console.log('Sample data loaded from backend:', result);
    
    // Refresh all data after loading
    await Promise.all([
      get().fetchProjects(),
      get().fetchWorkerCategories(),
      get().fetchWorkers(),
      get().fetchIncome(),
      get().fetchExpenses(),
      get().fetchPayrollRecords(),
      get().fetchApprovedItems(),
      get().fetchSuppliers(),
      get().fetchPurchaseOrders(),
      get().fetchSupplies(),
      get().fetchStoreTransactions(),
      get().fetchSiteDiaryEntries(),
      get().fetchAppUsers(),
      get().fetchSubcontractors(),
      get().fetchQuotations(),
      get().fetchInvoices(),
      get().fetchCompanySettings()
    ]);
    
    alert('Sample data loaded successfully!');
    console.log('Sample data loaded and persisted to database');
  } catch (error) {
    console.error('Failed to load sample data:', error);
    alert('Error loading sample data: ' + error.message);
  }
},



resetAllData: async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!confirm('⚠️ WARNING: This will permanently delete ALL data from the database including projects, workers, payroll, invoices, etc. This action CANNOT be undone. Continue?')) {
      return;
    }
    
    console.log('Starting data reset...');
    
    // Complete list of all endpoints
    const endpoints = [
      'projects',
      'workers',
      'worker-categories',
      'payroll-records',
      'approved-items',
      'suppliers',
      'purchase-orders',
      'supplies',
      'store-transactions',
      'site-diary-entries',
      'subcontractors',
      'quotations',
      'invoices',
      'income',
      'expenses'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Processing ${endpoint}...`);
        const getResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getResponse.ok) {
          const items = await getResponse.json();
          console.log(`  Found ${items.length} records in ${endpoint}`);
          
          for (const item of items) {
            await fetch(`${API_BASE_URL}/${endpoint}/${item.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
          console.log(`  ✅ Cleared ${endpoint}`);
        } else {
          console.log(`  ⚠️ Could not fetch ${endpoint}: ${getResponse.status}`);
        }
      } catch (error) {
        console.error(`  Error clearing ${endpoint}:`, error.message);
      }
    }
    
    // Clear frontend storage
    storage.clearAll();
    
    // Reset all state
    set({ 
      projects: [], 
      income: [], 
      expenses: [], 
      workerCategories: [], 
      workers: [], 
      payrollRecords: [], 
      approvedItems: [], 
      suppliers: [], 
      purchaseOrders: [], 
      supplies: [], 
      storeTransactions: [], 
      siteDiaryEntries: [], 
      subcontractors: [], 
      quotations: [], 
      invoices: [] 
    });
    
    console.log('All data reset successfully from database');
    alert('All data has been cleared from the database!');
    
    // 🔄 AUTO-REFRESH THE PAGE - THIS IS THE FIX
    window.location.reload();
    
  } catch (error) {
    console.error('Failed to reset data:', error);
    alert('Error resetting data. Check console for details.');
  }
}



}));