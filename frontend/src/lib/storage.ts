import { Project, Income, Expense, WorkerCategory, Worker, PayrollRecord, ApprovedItem, Supplier, PurchaseOrder, Supply, StoreTransaction, SiteDiaryEntry, CompanySettings, AuthUser, AppUser, Subcontractor, SubcontractorQuotation, Invoice } from './types';

const KEYS = {
  projects: 'bochaberi_projects',
  income: 'bochaberi_income',
  expenses: 'bochaberi_expenses',
  workerCategories: 'bochaberi_worker_categories',
  workers: 'bochaberi_workers',
  payrollRecords: 'bochaberi_payroll_records',
  approvedItems: 'bochaberi_approved_items',
  suppliers: 'bochaberi_suppliers',
  purchaseOrders: 'bochaberi_purchase_orders',
  supplies: 'bochaberi_supplies',
  storeTransactions: 'bochaberi_store_transactions',
  siteDiaryEntries: 'bochaberi_site_diary',
  companySettings: 'bochaberi_company',
  theme: 'bochaberi_theme',
  sidebarCollapsed: 'bochaberi_sidebar',
  authUser: 'bochaberi_auth_user',
  appUsers: 'bochaberi_app_users',
  subcontractors: 'bochaberi_subcontractors',
  quotations: 'bochaberi_quotations',
  invoices: 'bochaberi_invoices',
};

function get<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}
function set(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const storage = {
  getProjects: (): Project[] => get(KEYS.projects, []),
  setProjects: (d: Project[]) => set(KEYS.projects, d),
  getIncome: (): Income[] => get(KEYS.income, []),
  setIncome: (d: Income[]) => set(KEYS.income, d),
  getExpenses: (): Expense[] => get(KEYS.expenses, []),
  setExpenses: (d: Expense[]) => set(KEYS.expenses, d),
  getWorkerCategories: (): WorkerCategory[] => get(KEYS.workerCategories, []),
  setWorkerCategories: (d: WorkerCategory[]) => set(KEYS.workerCategories, d),
  getWorkers: (): Worker[] => get(KEYS.workers, []),
  setWorkers: (d: Worker[]) => set(KEYS.workers, d),
  getPayrollRecords: (): PayrollRecord[] => get(KEYS.payrollRecords, []),
  setPayrollRecords: (d: PayrollRecord[]) => set(KEYS.payrollRecords, d),
  getApprovedItems: (): ApprovedItem[] => get(KEYS.approvedItems, []),
  setApprovedItems: (d: ApprovedItem[]) => set(KEYS.approvedItems, d),
  getSuppliers: (): Supplier[] => get(KEYS.suppliers, []),
  setSuppliers: (d: Supplier[]) => set(KEYS.suppliers, d),
  getPurchaseOrders: (): PurchaseOrder[] => get(KEYS.purchaseOrders, []),
  setPurchaseOrders: (d: PurchaseOrder[]) => set(KEYS.purchaseOrders, d),
  getSupplies: (): Supply[] => get(KEYS.supplies, []),
  setSupplies: (d: Supply[]) => set(KEYS.supplies, d),
  getStoreTransactions: (): StoreTransaction[] => get(KEYS.storeTransactions, []),
  setStoreTransactions: (d: StoreTransaction[]) => set(KEYS.storeTransactions, d),
  getSiteDiaryEntries: (): SiteDiaryEntry[] => get(KEYS.siteDiaryEntries, []),
  setSiteDiaryEntries: (d: SiteDiaryEntry[]) => set(KEYS.siteDiaryEntries, d),
  getCompanySettings: (): CompanySettings => get(KEYS.companySettings, {
    name: 'BOCHABERI Construction Ltd', address: 'P.O. Box 12345, Nairobi', phone: '+254 700 000 000',
    email: 'info@bochaberi.co.ke', kraPin: 'P000000000X', currency: 'KES', currencySymbol: 'KES'
  }),
  setCompanySettings: (d: CompanySettings) => set(KEYS.companySettings, d),
  getTheme: (): string => localStorage.getItem(KEYS.theme) || 'light',
  setTheme: (t: string) => localStorage.setItem(KEYS.theme, t),
  getSidebarCollapsed: (): boolean => get(KEYS.sidebarCollapsed, false),
  setSidebarCollapsed: (v: boolean) => set(KEYS.sidebarCollapsed, v),
  getAuthUser: (): AuthUser | null => get(KEYS.authUser, null),
  setAuthUser: (u: AuthUser | null) => u ? set(KEYS.authUser, u) : localStorage.removeItem(KEYS.authUser),
  getAppUsers: (): AppUser[] => get(KEYS.appUsers, []),
  setAppUsers: (d: AppUser[]) => set(KEYS.appUsers, d),
  getSubcontractors: (): Subcontractor[] => get(KEYS.subcontractors, []),
  setSubcontractors: (d: Subcontractor[]) => set(KEYS.subcontractors, d),
  getQuotations: (): SubcontractorQuotation[] => get(KEYS.quotations, []),
  setQuotations: (d: SubcontractorQuotation[]) => set(KEYS.quotations, d),
  getInvoices: (): Invoice[] => get(KEYS.invoices, []),
  setInvoices: (d: Invoice[]) => set(KEYS.invoices, d),
  
  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },

  // ========== NEW CLEARING FUNCTIONS ==========
  clearWorkers: () => {
    localStorage.removeItem(KEYS.workers);
    localStorage.removeItem(KEYS.payrollRecords);
  },

  clearStores: () => {
    localStorage.removeItem(KEYS.storeTransactions);
  },


// ========== ADD THIS NEW FUNCTION ==========
  clearPurchaseOrders: () => {
    localStorage.removeItem(KEYS.purchaseOrders);
    localStorage.removeItem(KEYS.supplies);
  },
  // ========== END ADDED FUNCTION ==========



  clearAllProjectData: () => {
    const keysToClear = [
      KEYS.projects, KEYS.income, KEYS.expenses, KEYS.workers,
      KEYS.payrollRecords, KEYS.purchaseOrders, KEYS.supplies,
      KEYS.storeTransactions, KEYS.siteDiaryEntries
    ];
    keysToClear.forEach(k => localStorage.removeItem(k));
  },
  // ========== END NEW CLEARING FUNCTIONS ==========

  exportAll: (): string => {
    const data: Record<string, unknown> = {};
    Object.entries(KEYS).forEach(([k, v]) => {
      if (k !== 'theme' && k !== 'sidebarCollapsed' && k !== 'authUser') {
        try { data[k] = JSON.parse(localStorage.getItem(v) || 'null'); } catch { data[k] = null; }
      }
    });
    return JSON.stringify(data, null, 2);
  },
  
  importAll: (json: string) => {
    const data = JSON.parse(json);
    Object.entries(data).forEach(([k, v]) => {
      const key = KEYS[k as keyof typeof KEYS];
      if (key && v !== null) set(key, v);
    });
  },
};