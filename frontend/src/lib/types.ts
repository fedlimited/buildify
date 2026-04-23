export interface Project {
  id: number;
  name: string;
  client: string;
  contractSum: number;
  location: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  projectManager: string;
  description: string;
  progress?: number;
  createdAt: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  locationAddress?: string;
}

export interface Income {
  id: number;
  projectId: number;
  certificateNo: string;
  date: string;
  grossAmount: number;
  retentionPercent: number;
  amountReceived: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'Pending' | 'Partial' | 'Paid';
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  date: string;
  projectId: number;
  projectName: string;
  category: 'Subcontractor' | 'Supplier' | 'Payroll' | 'Equipment' | 'Transport' | 'Other';
  description: string;
  amount: number;
  vat: number;
  paymentMethod: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  reference: string;
  subcontractorId?: number;
  createdAt: string;
}

export interface WorkerCategory {
  id: number;
  name: string;
  dayRate: number;
  color: string;
  isActive: boolean;
}

export interface Worker {
  id: number;
  name: string;
  phone: string;
  categoryId: number;
  projectId: number;
  dayRate: number;
  isActive: boolean;
  dateAdded: string;
}

export interface PayrollAttendance {
  sun: boolean;
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
}

export interface PayrollEntry {
  workerId: number;
  workerName: string;
  categoryId: number;
  dayRate: number;
  attendance: PayrollAttendance;
  daysWorked: number;
  grossPay: number;
}

export interface PayrollRecord {
  id: number;
  weekNumber: number;
  year: number;
  weekStart: string;
  weekEnd: string;
  projectId: number;
  projectName: string;
  status: 'Draft' | 'Approved' | 'Paid';
  entries: PayrollEntry[];
  totalGrossPay: number;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  expenseId?: number;
}

export interface ApprovedItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  description: string;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  kraPin: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  isActive: boolean;
}

export interface OrderItem {
  itemId: number;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  projectId: number;
  projectName: string;
  orderDate: string;
  expectedDate: string;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: 'Ordered' | 'Supplied' | 'Partially Supplied';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  notes: string;
  createdAt: string;
}

export interface Supply {
  id: number;
  supplierId: number;
  supplierName: string;
  projectId: number;
  projectName: string;
  date: string;
  itemId: number;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  vat: number;
  status: 'Ordered' | 'Delivered';
  paid: boolean;
  orderId?: number;
  deliveryNote: string;
  notes: string;
  createdAt: string;
}

export interface StoreTransaction {
  id: number;
  date: string;
  projectId: number;
  projectName: string;
  itemId: number;
  itemName: string;
  unit: string;
  category: string;
  quantitySupplied: number;
  quantityIssued: number;
  quantityReturned: number;
  balance: number;
  transactionType: 'SUPPLY' | 'ISSUE' | 'RETURN';
  reference: string;
  issuedTo: string;
  returnedBy: string;
  notes: string;
  createdAt: string;
}

export interface SiteDiaryActivity {
  time: string;
  location: string;
  description: string;
  supervisor: string;
}

export interface SiteDiaryInspection {
  type: string;
  time: string;
  inspector: string;
  findings: string;
  outcome: string;
}

export interface SiteDiaryDelivery {
  supplier: string;
  time: string;
  items: string;
  condition: string;
  receivedBy: string;
}

export interface SiteDiaryIncident {
  type: string;
  time: string;
  severity: string;
  description: string;
  action: string;
}

export interface SiteDiaryChallenge {
  category: string;
  severity: string;
  description: string;
  action: string;
  status: string;
}

export interface SiteDiaryEntry {
  id: number;
  date: string;
  projectId: number;
  projectName: string;
  weather: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  totalWorkers: number;
  activities: SiteDiaryActivity[];
  inspections: SiteDiaryInspection[];
  deliveries: SiteDiaryDelivery[];
  incidents: SiteDiaryIncident[];
  challenges: SiteDiaryChallenge[];
  summary: {
    achievement: string;
    tomorrowPlan: string;
    issuesAttention: string;
  };
  status: 'Draft' | 'Submitted' | 'Approved';
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  kraPin: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
}

// Updated ModuleId to include 'billing'
export type ModuleId = 'dashboard' | 'projects' | 'income' | 'expenses' | 'payroll' | 'procurement' | 'stores' | 'sitediary' | 'vat' | 'reports' | 'settings' | 'users' | 'subcontractors' | 'invoices' | 'billing' | 'help' | 'legal';

export interface NavItem {
  id: ModuleId;
  label: string;
  icon: string;
  enabled: boolean;
}



export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  permissions?: ModuleId[];
  isSuperAdmin?: boolean;  // ADD THIS LINE
  company?: {              // ADD THIS (from backend response)
    id: number;
    name: string;
    subdomain: string;
  };
}


export interface AppUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  permissions: ModuleId[];
  isActive: boolean;
  createdAt: string;
}

export interface Subcontractor {
  id: number;
  name: string;
  phone: string;
  email: string;
  kraPin: string;
  specialization: string;
  address: string;
  contactPerson: string;
  isActive: boolean;
  createdAt: string;
}

export interface SubcontractorQuotation {
  id: number;
  subcontractorId: number;
  subcontractorName: string;
  projectId: number;
  projectName: string;
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  notes: string;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  projectId: number;
  projectName: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

// Add Plan interface for subscription billing
export interface Plan {
  id: number;
  name: string;
  display_name: string;
  description: string;
  price_monthly_kes: number;
  price_yearly_kes: number;
  price_monthly_usd: number;
  price_yearly_usd: number;
  max_projects: number;
  max_workers: number;
  max_users: number;
  features: string[];
}