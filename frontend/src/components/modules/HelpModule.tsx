import { useState, useMemo } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, BookOpen, MessageSquare, Mail, Phone, FileText, CheckCircle, 
  Heart, Star, Award, Users, Calendar, Clock, Download, Video, 
  Globe, Shield, Settings, TrendingUp, DollarSign, Warehouse, Truck, MapPin,
  Filter, Search, Database, RefreshCw, Clipboard, Hammer, BarChart3, PieChart,
  Receipt, ShoppingCart, HardHat, LayoutDashboard, AlertTriangle, ListChecks,
  Building2, CreditCard, FileWarning, Lightbulb, Rocket, ThumbsUp, 
  ChevronRight, ExternalLink, LifeBuoy, FileQuestion, BookMarked,
  Timer, Layers, Workflow, GraduationCap, Briefcase, CheckSquare
} from 'lucide-react';

export function HelpModule() {
  const { companySettings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs = [
    // ========== GETTING STARTED (10 FAQs) ==========
    { category: "Getting Started", question: "What is the correct order to set up my data?", answer: "To avoid errors and ensure all dropdowns populate correctly, follow this exact order: 1) Subcontractors → 2) Suppliers → 3) Approved Items → 4) Worker Categories → 5) Workers → 6) Projects. Setup in this order before creating any transactions like payments, purchase orders, or payroll.", priority: "high" },
    { category: "Getting Started", question: "Why do I need to set up Subcontractors first?", answer: "Subcontractors must be registered before you can create quotations or make subcontractor payments. The system needs their details (name, KRA PIN, contact info) to associate with financial transactions.", priority: "high" },
    { category: "Getting Started", question: "Why do Suppliers need to be set up before Purchase Orders?", answer: "Suppliers must be in the system before creating purchase orders. When you create a purchase order, you need to select a supplier from the dropdown - empty dropdowns mean no suppliers are registered.", priority: "high" },
    { category: "Getting Started", question: "What are Approved Items and why set them up early?", answer: "Approved Items are the materials and products you buy regularly (cement, sand, steel, etc.). They must be pre-approved before they can be added to supplies or purchase orders. Each item has a name, category, unit of measure, and default price.", priority: "high" },
    { category: "Getting Started", question: "Why set up Worker Categories before Workers?", answer: "Worker Categories define job roles (Mason, Labourer, Foreman) and their daily pay rates. Workers must be assigned to a category when created, so categories must exist first.", priority: "high" },
    { category: "Getting Started", question: "When should I create Projects?", answer: "Create Projects after setting up all foundational data (subcontractors, suppliers, items, categories, workers). Projects are needed for income, expenses, payroll, site diary, and procurement. While you can create projects anytime, having foundational data ready first is more efficient.", priority: "high" },
    { category: "Getting Started", question: "How do I create my first project?", answer: "Go to Projects module, click 'Add Project', fill in the project name, client details, contract sum, and dates. Click 'Create' to save. The project will appear on your dashboard and be available for all other modules.", priority: "medium" },
    { category: "Getting Started", question: "How do I set up worker categories?", answer: "In Payroll module, go to 'Categories' tab, click 'Add Category'. Enter category name (e.g., Foreman, Mason, Labourer), set day rate, and choose a color for easy identification. Categories help organize workers by role and pay rate.", priority: "medium" },
    { category: "Getting Started", question: "How do I add workers to a project?", answer: "Go to Payroll → Workers tab, click 'Add Worker'. Enter worker name, phone number, select category, assign to a project, and confirm day rate. Workers must be assigned to projects before they can be included in payroll.", priority: "medium" },
    { category: "Getting Started", question: "What is the fastest way to get started with BOCHI?", answer: "1) Load sample data from Settings → Load Sample Data, 2) Replace sample data with your own information, 3) Follow the setup order above. The sample data includes 66+ records to help you understand how everything works.", priority: "high" },

    // ========== SAMPLE DATA (2 FAQs) ==========
    { category: "Sample Data", question: "How do I load sample data?", answer: "Go to Settings module and click 'Load Sample Data'. This will populate all modules with 66+ demonstration records including projects, subcontractors, quotations, expenses, income, purchase orders, store transactions, site diary entries, invoices, suppliers, approved items, and workers.", priority: "medium" },
    { category: "Sample Data", question: "Will loading sample data delete my existing data?", answer: "Yes, loading sample data will REPLACE all your existing data with sample data. Make sure to backup your data first by clicking 'Backup Data' in Settings if you want to keep your current information.", priority: "high" },

    // ========== REPORTS (9 FAQs) ==========
    { category: "Reports", question: "What reports are available?", answer: "The Reports module includes 12 comprehensive reports: Profit & Loss, Project Summary, Cash Flow, Expenses by Category, VAT Summary, Payroll Summary, Orders Report, Stores Ledger, Subcontractors Ledger, Suppliers Ledger, Income Ledger, and Site Diary Report. All reports support project filtering, date range selection, search functionality, and CSV export.", priority: "high" },
    { category: "Reports", question: "How do I filter reports by project?", answer: "Each report has a 'Filter by Project' dropdown at the top. You can also use the global project filter in the top-right corner of the app. The global filter applies to all modules, while report-specific filters give you more granular control.", priority: "medium" },
    { category: "Reports", question: "Can I filter reports by date range?", answer: "Yes! Most reports (Profit & Loss, Cash Flow, Expenses by Category, VAT, Payroll, Orders, Stores, Suppliers, Subcontractors) include date range filters. Simply select Start Date and End Date, and click 'Clear Dates' to reset. The data updates automatically.", priority: "medium" },
    { category: "Reports", question: "How do I search within a report?", answer: "Reports with search functionality include a search box (🔍) at the top. Type to search by project name, supplier name, order number, certificate number, or other relevant fields. Results update in real-time as you type.", priority: "low" },
    { category: "Reports", question: "What is the Profit & Loss report showing?", answer: "The Profit & Loss report shows total income, total expenses, net profit/loss, profit margin, and a breakdown by project. It helps you understand your overall financial performance across all projects or a specific project.", priority: "high" },
    { category: "Reports", question: "What is the Project Summary report?", answer: "The Project Summary report shows all projects with contract values, income received, expenses incurred, profit/loss, progress percentage, and status. It's perfect for tracking project performance at a glance.", priority: "high" },
    { category: "Reports", question: "What is the Subcontractors Ledger?", answer: "The Subcontractors Ledger shows contracted amounts (from quotations), paid amounts (from expenses), and outstanding balances for each subcontractor. It helps you track payments to subcontractors.", priority: "medium" },
    { category: "Reports", question: "What is the Stores Ledger report?", answer: "The Stores Ledger shows inventory levels for each item, including quantities supplied, issued, returned, and current balance. It helps you monitor stock levels and identify low-stock items highlighted in red.", priority: "medium" },
    { category: "Reports", question: "Can I export reports to Excel?", answer: "Yes! Every report includes an 'Export CSV' button that downloads your filtered data as a CSV file. You can open CSV files in Excel, Google Sheets, or any spreadsheet software for further analysis.", priority: "low" },

    // ========== SUBCONTRACTORS (3 FAQs) ==========
    { category: "Subcontractors", question: "How do I manage subcontractors and payments?", answer: "The Subcontractors module has three tabs: Subcontractors List (manage contact info), Quotations (create and track quotes), and Payments & Balances (view contracted amounts, paid amounts, and outstanding balances). Contracted amount is the sum of all quotations. Paid amount comes from expenses with category 'Subcontractor' and status 'Paid'.", priority: "high" },
    { category: "Subcontractors", question: "How do I create a quotation for a subcontractor?", answer: "Go to Subcontractors → Quotations tab, click 'Add Quotation'. Select subcontractor, project, enter description, amount, and date. Quotations can be marked as Pending, Accepted, or Rejected. Accepted quotations contribute to the subcontractor's contracted amount.", priority: "medium" },
    { category: "Subcontractors", question: "How do I record a payment to a subcontractor?", answer: "Go to Expenses module, click 'Add Expense'. Select category 'Subcontractor', choose the subcontractor from the dropdown (if available), enter amount, payment method, and status 'Paid'. The payment will automatically appear in the Subcontractor's Payments & Balances tab.", priority: "medium" },

    // ========== SITE DIARY (4 FAQs) ==========
    { category: "Site Diary", question: "How do I use the Site Diary?", answer: "Go to Site Diary module to record daily site activities. Enter date, project, weather conditions, total workers, activities performed, equipment used, materials consumed, challenges faced, and next day's plan. The Site Diary Report in the Reports module provides a summary view with filtering by project and date range.", priority: "high" },
    { category: "Site Diary", question: "What should I include in a site diary entry?", answer: "Include: date, project name, weather conditions (morning/afternoon), total number of workers on site, activities performed (with times and supervisors), equipment used, materials delivered/consumed, any incidents or challenges, and the plan for tomorrow.", priority: "high" },
    { category: "Site Diary", question: "Can I edit a site diary entry after submission?", answer: "Yes, you can edit any site diary entry. Go to the Site Diary module, find the entry you want to edit, and click the edit button (pencil icon). Make your changes and save. The entry's status will be updated accordingly.", priority: "low" },
    { category: "Site Diary", question: "How do I track site workers in the diary?", answer: "In the Site Diary module, you can add workers to the 'Site Workers' section. Each worker entry includes name, role, and hours worked. The total workers count automatically updates based on the workers you add.", priority: "medium" },

    // ========== PROCUREMENT (4 FAQs) ==========
    { category: "Procurement", question: "How do I create a purchase order?", answer: "Go to Procurement → Purchase Orders, click 'New Order'. Select supplier, choose project, add items from approved items list with quantities. The system automatically calculates subtotal, VAT (16%), and total. Once created, you can track order status from Ordered → Supplied → Paid.", priority: "high" },
    { category: "Procurement", question: "What happens when I mark an order as supplied?", answer: "When you click 'Mark Supplied', the system automatically: 1) Creates a supply record, 2) Updates store inventory with the received items, 3) Creates a store transaction for audit trail, and 4) Updates the order status to 'Supplied'. This automation ensures inventory accuracy.", priority: "high" },
    { category: "Procurement", question: "How do I mark a purchase order as paid?", answer: "After an order is marked as 'Supplied', a 'Mark Paid' button appears. Click it to record payment. This creates an expense record for accounting purposes and updates the payment status to 'Paid'.", priority: "medium" },
    { category: "Procurement", question: "Can I edit a purchase order after it's created?", answer: "Only orders with status 'Ordered' can be edited. Once an order is marked as 'Supplied', it becomes locked to prevent changes. This ensures inventory and transaction records remain accurate.", priority: "low" },

    // ========== STORES (4 FAQs) ==========
    { category: "Stores", question: "How do I manage store inventory?", answer: "In Stores module, view stock balances showing total supplied, issued, returned, and current balance. Use 'Issue' to assign materials to workers/teams (requires requisition number), and 'Return' to return unused materials. Low stock items (≤10 units) are highlighted in red for attention.", priority: "high" },
    { category: "Stores", question: "How do I issue materials to a worker?", answer: "In Stores module → Issues tab, click 'New Issue'. Select project, item, quantity, and enter requisition number. The issue will be recorded, and the store balance will automatically decrease.", priority: "medium" },
    { category: "Stores", question: "How do I record returned materials?", answer: "In Stores module → Returns tab, click 'New Return'. Select project, item, quantity, and the worker returning the materials. The return will be recorded, and the store balance will automatically increase.", priority: "medium" },
    { category: "Stores", question: "Why is my store balance showing negative?", answer: "Negative balance indicates more items were issued than supplied. Check your store transactions for incorrect issue entries. You can create a return transaction to correct the balance.", priority: "high" },

    // ========== PAYROLL (5 FAQs) ==========
    { category: "Payroll", question: "How do I process weekly payroll?", answer: "Navigate to Payroll → Payroll tab. Select the project, choose the week (use arrow buttons to navigate weeks). Mark attendance for each worker by checking the boxes for days worked. The system automatically calculates days worked and gross pay. Save as Draft, then Approve, and finally Mark as Paid. Paid payroll automatically creates an expense record.", priority: "high" },
    { category: "Payroll", question: "How are worker day rates set?", answer: "Worker day rates are determined by their category. Go to Payroll → Categories tab to set or edit day rates for each worker category (Mason, Labourer, Foreman, etc.). When you add a worker, they inherit the day rate from their selected category.", priority: "medium" },
    { category: "Payroll", question: "What happens when I approve a payroll?", answer: "Approving a payroll locks the payroll record to prevent further changes. It also marks the payroll as ready for payment processing. You can still unapprove if needed, but approved payrolls cannot be edited.", priority: "low" },
    { category: "Payroll", question: "How do I mark payroll as paid?", answer: "After approving a payroll, click 'Mark as Paid'. This creates an expense record for the total gross pay amount, with category 'Payroll' and status 'Paid'. The payroll record status updates to 'Paid'.", priority: "medium" },
    { category: "Payroll", question: "Can I edit a payroll after it's saved?", answer: "You can edit payroll records that are in 'Draft' status. Once approved or paid, the record becomes locked to maintain accurate financial records. Unapprove if you need to make changes.", priority: "low" },

    // ========== FINANCE (6 FAQs) ==========
    { category: "Finance", question: "How do I record income from payment certificates?", answer: "In Income module, click 'Add Income'. Select the project, enter certificate number, gross amount, retention percentage (typically 5-10%), and amount received. The system tracks payment progress and automatically updates project completion percentage based on total contract sum.", priority: "high" },
    { category: "Finance", question: "How do I track expenses?", answer: "In Expenses module, click 'Add Expense'. Select category (Subcontractor, Supplier, Payroll, Equipment, Transport, or Other), enter description and amount. VAT is automatically calculated at 16% as per Kenyan tax regulations. You can also record payment method and reference number for audit trails.", priority: "high" },
    { category: "Finance", question: "What expense categories are available?", answer: "The available expense categories are: Subcontractor, Supplier, Payroll, Equipment, Transport, and Other. You can filter reports by these categories to see where your money is going.", priority: "low" },
    { category: "Finance", question: "How is retention money calculated?", answer: "Retention money is typically 5-10% of the certificate gross amount. In the Income module, enter the retention percentage, and the system automatically calculates the retention amount and net payable amount. Retention is released upon project completion.", priority: "medium" },
    { category: "Finance", question: "What is the difference between 'Amount Received' and 'Gross Amount'?", answer: "Gross Amount is the total value of the certificate before deductions. Amount Received is what you actually received after deductions (retention, withholding tax, etc.). The system tracks both for accurate financial reporting.", priority: "medium" },
    { category: "Finance", question: "How do I view my company's financial health?", answer: "Use the Reports module. Start with Profit & Loss for overall performance, Cash Flow for liquidity, and VAT Summary for tax obligations. The Executive Dashboard provides a high-level overview of key metrics.", priority: "high" },

    // ========== VAT (3 FAQs) ==========
    { category: "VAT", question: "How do I generate VAT reports?", answer: "Go to VAT module or Reports → VAT Summary. Select date range and project filter. The system calculates input VAT (on purchases) and output VAT (on sales) with net payable/refundable amount. You can export VAT reports for KRA filing.", priority: "high" },
    { category: "VAT", question: "How is VAT calculated?", answer: "BOCHI automatically calculates VAT at 16% on all financial transactions as per Kenyan tax regulations. Output VAT is calculated on income (16% of gross amount). Input VAT is calculated on eligible expenses (16% of amount where VAT is applicable).", priority: "medium" },
    { category: "VAT", question: "What is the difference between Input and Output VAT?", answer: "Output VAT is the VAT you charge your clients on invoices (VAT on sales). Input VAT is the VAT you pay to suppliers on purchases. The difference (Output - Input) is what you pay to KRA, or what you can claim as a refund if negative.", priority: "high" },

    // ========== INVOICES (3 FAQs) ==========
    { category: "Invoices", question: "How do I create client invoices?", answer: "Go to Invoices module, click 'New Invoice'. Select project, add line items with descriptions, quantities, and unit prices. The system calculates subtotal, VAT (16%), and total. Invoices can be saved as draft, sent to client, and marked as paid when payment is received.", priority: "high" },
    { category: "Invoices", question: "Can I track invoice payments?", answer: "Yes! Invoices have a status field that can be set to: Draft, Sent, Paid, or Overdue. Update the status as payments are received. Paid invoices are reflected in your income reports.", priority: "medium" },
    { category: "Invoices", question: "How do I know if an invoice is overdue?", answer: "The system uses the due date field to determine if an invoice is overdue. Invoices with due date in the past and status not 'Paid' are considered overdue and appear in red in the invoices list.", priority: "medium" },

    // ========== DATA MANAGEMENT (3 FAQs) ==========
    { category: "Data Management", question: "How do I backup and export my data?", answer: "Go to Settings module. Click 'Backup Data' to download a JSON file of all your data. To restore, click 'Restore Data' and select your backup file. You can also export individual reports to CSV using the 'Export CSV' button on each report. We recommend weekly backups for data safety.", priority: "high" },
    { category: "Data Management", question: "What data is included in a backup?", answer: "A backup includes all your data: projects, income, expenses, workers, payroll records, purchase orders, supplies, store transactions, site diary entries, subcontractors, quotations, invoices, and company settings.", priority: "medium" },
    { category: "Data Management", question: "How often should I backup my data?", answer: "We recommend weekly backups for active projects, or daily backups for critical projects. Always backup before making major changes like clearing data or loading sample data.", priority: "high" },

    // ========== TROUBLESHOOTING (5 FAQs) ==========
    { category: "Troubleshooting", question: "Why can't I see my projects in dropdown menus?", answer: "Ensure projects have 'Active' status. Only active projects appear in dropdown selections. You can change project status in Projects module by editing the project.", priority: "high" },
    { category: "Troubleshooting", question: "Why is my store balance showing negative?", answer: "Negative balance indicates more items were issued than supplied. Check your store transactions for incorrect issue entries. You can create a return transaction to correct the balance.", priority: "high" },
    { category: "Troubleshooting", question: "Why isn't my report showing data?", answer: "Check your filters: 1) Ensure the global project filter isn't hiding data, 2) Check report-specific project filter, 3) Verify date range filters, 4) Clear search box if text is entered. If still no data, load sample data from Settings to test.", priority: "high" },
    { category: "Troubleshooting", question: "Why am I getting a 'Permission denied' error?", answer: "Your user account may not have permission to access that module. Contact your company admin to request access. Admins can manage user permissions in Settings → Users.", priority: "high" },
    { category: "Troubleshooting", question: "What should I do if I encounter a bug?", answer: "1) Refresh the page and try again, 2) Clear your browser cache, 3) Check if the issue persists, 4) Contact support at info@bochi.ke with screenshots and steps to reproduce the issue.", priority: "medium" },
  ];

  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    return filtered;
  }, [searchQuery, selectedCategory]);

  const categories = [...new Set(faqs.map(f => f.category))];

  // Group FAQs by category for display
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, typeof faqs> = {};
    filteredFaqs.forEach(faq => {
      if (!grouped[faq.category]) grouped[faq.category] = [];
      grouped[faq.category].push(faq);
    });
    return grouped;
  }, [filteredFaqs]);

  const quickTips = [
    { icon: <ListChecks size={16} />, text: "Follow setup order: Subcontractors → Suppliers → Approved Items → Worker Categories → Workers → Projects", priority: "high" },
    { icon: <Filter size={16} />, text: "Use project filter in top bar or report-specific filters to narrow down data", priority: "medium" },
    { icon: <Search size={16} />, text: "Search across reports by typing in the search box - results update instantly", priority: "medium" },
    { icon: <Calendar size={16} />, text: "Use date range filters to view data for specific periods", priority: "medium" },
    { icon: <RefreshCw size={16} />, text: "Click 'Clear Dates' to reset date filters", priority: "low" },
    { icon: <Download size={16} />, text: "Export any report to CSV for further analysis in Excel", priority: "low" },
    { icon: <Database size={16} />, text: "Load sample data from Settings to test all features", priority: "medium" },
    { icon: <Warehouse size={16} />, text: "Purchase orders automatically update store inventory when marked supplied", priority: "high" },
    { icon: <Hammer size={16} />, text: "Subcontractor balances are calculated from quotations and paid expenses", priority: "high" },
    { icon: <Clipboard size={16} />, text: "Use Site Diary daily for accurate project records", priority: "high" },
    { icon: <TrendingUp size={16} />, text: "Review financial reports monthly to track profitability", priority: "high" },
    { icon: <FileWarning size={16} />, text: "Always backup data before major changes or updates", priority: "high" },
    { icon: <Clock size={16} />, text: "Process payroll weekly to maintain accurate labor costs", priority: "medium" },
    { icon: <Rocket size={16} />, text: "Start with sample data to understand how all modules work together", priority: "medium" },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-5 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <LifeBuoy size={28} className="text-primary" />
          <h1 className="text-xl font-bold">Help & Support Center</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about using BOCHI Construction Suite
        </p>
      </div>

      <Tabs defaultValue="gettingstarted" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="gettingstarted">Getting Started</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="reports">Reports Guide</TabsTrigger>
          <TabsTrigger value="quicktips">Quick Tips</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* ========== GETTING STARTED TAB ========== */}
        <TabsContent value="gettingstarted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket size={20} className="text-primary" />
                Getting Started with BOCHI
              </CardTitle>
              <CardDescription>Follow this guide to set up your account correctly and avoid common issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CRITICAL SETUP ORDER */}
              <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg">
                <h3 className="text-base font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} /> ⚠️ CRITICAL: You MUST Set Up Data in This Exact Order
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  To avoid errors, empty dropdowns, and missing data, follow this sequence strictly:
                </p>
                <div className="space-y-3 text-sm">
                  {[
                    { num: "1", title: "Subcontractors", desc: "Required BEFORE: Subcontractor Payments, Quotations, Expenses", detail: "Register all subcontractors with their KRA PIN, contacts, and specialization" },
                    { num: "2", title: "Suppliers", desc: "Required BEFORE: Purchase Orders, Supplier Payments", detail: "Add all material suppliers with contacts and payment terms" },
                    { num: "3", title: "Approved Items", desc: "Required BEFORE: Supplies, Purchase Orders (items list)", detail: "Pre-approve all materials with name, category, unit, and default price" },
                    { num: "4", title: "Worker Categories", desc: "Required BEFORE: Workers, Payroll, Site Diary", detail: "Define job roles (Mason, Labourer, etc.) and daily pay rates" },
                    { num: "5", title: "Workers", desc: "Required BEFORE: Payroll, Site Diary Attendance", detail: "Add all workers with their assigned category and project" },
                    { num: "6", title: "Projects", desc: "Required BEFORE: Income, Expenses, Site Diary", detail: "Create projects after foundational data is ready" },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <span className="font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0">{step.num}</span>
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-400">{step.title}</span>
                        <p className="text-xs text-amber-600 dark:text-amber-400">→ {step.desc}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <CheckCircle size={16} />
                    <strong>Why this order matters:</strong>
                  </p>
                  <ul className="text-xs text-amber-600 dark:text-amber-400 mt-1 space-y-0.5 ml-6 list-disc">
                    <li>Each dropdown menu needs existing data to populate</li>
                    <li>Transactions reference these foundational records</li>
                    <li>Prevents "empty dropdown" errors</li>
                    <li>Ensures proper data relationships</li>
                  </ul>
                </div>
              </div>

              {/* Two Column Setup Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckSquare size={16} />
                    Setup Checklist
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Register all Subcontractors</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Register all Suppliers</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Configure Approved Items (materials)</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Set up Worker Categories with day rates</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Add Workers and assign to categories/projects</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> Create Projects</li>
                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /> (Optional) Load sample data to test</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <Workflow size={16} />
                    After Setup - What's Next?
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Create Purchase Orders for materials</li>
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Process Payroll weekly</li>
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Record Income from payment certificates</li>
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Track Expenses as they occur</li>
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Write Site Diary daily</li>
                    <li className="flex items-center gap-2"><span className="text-blue-600">→</span> Generate Reports monthly for insights</li>
                  </ul>
                </div>
              </div>

              {/* Quick Start Steps */}
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Rocket size={16} />
                  Quick Start (10 Minutes)
                </h3>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    <span><strong>Load sample data</strong> - Go to Settings → Load Sample Data (optional but recommended)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    <span><strong>Register Subcontractors</strong> - Before creating any subcontractor payments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    <span><strong>Register Suppliers</strong> - Before creating purchase orders</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                    <span><strong>Create Approved Items</strong> - Before creating supplies or purchase orders</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">5</span>
                    <span><strong>Set up Worker Categories</strong> - Before adding workers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">6</span>
                    <span><strong>Add Workers</strong> - Before processing payroll or site diary</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">7</span>
                    <span><strong>Create Projects</strong> - Before tracking income, expenses, or site diary</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== FAQ TAB ========== */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion size={20} className="text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                {faqs.length} comprehensive answers to common questions about using BOCHI Construction Suite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div>
                <Label className="text-xs font-medium">Search FAQs</Label>
                <div className="relative mt-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search by question, answer, or category..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setOpenAccordionItems([]);
                    }}
                    className="pl-9 max-w-md"
                  />
                </div>
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory('all');
                    setOpenAccordionItems([]);
                  }}
                >
                  All ({faqs.length})
                </Badge>
                {categories.map(cat => (
                  <Badge 
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setOpenAccordionItems([]);
                    }}
                  >
                    {cat} ({faqs.filter(f => f.category === cat).length})
                  </Badge>
                ))}
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setOpenAccordionItems([]);
                  }} className="text-xs h-6">
                    Clear All
                  </Button>
                )}
              </div>
              
              <Separator />
              
              {/* FAQs Accordion */}
              <div className="max-h-[600px] overflow-y-auto pr-2">
                {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold text-primary mb-2 sticky top-0 bg-background py-1">
                      {category}
                    </h3>
                    <Accordion 
                      type="multiple" 
                      className="w-full" 
                      value={openAccordionItems} 
                      onValueChange={setOpenAccordionItems}
                    >
                      {categoryFaqs.map((faq, index) => (
                        <AccordionItem key={`${category}-${index}`} value={`${category}-${index}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-start gap-2">
                              <span className="text-primary mt-0.5 shrink-0">❓</span>
                              <span className="font-medium text-sm">{faq.question}</span>
                              {faq.priority === 'high' && (
                                <Badge variant="secondary" className="text-[10px] ml-2">Important</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pl-6">
                            <p className="text-sm">{faq.answer}</p>
                            <div className="mt-2 pt-2 border-t border-border/50 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Category: {faq.category}</span>
                              <ThumbsUp size={12} className="text-muted-foreground" />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
              
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No matching FAQs found.</p>
                  <p className="text-sm">Try a different search term or clear your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== USER GUIDES TAB ========== */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Getting Started Guide Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>Learn the basics in 10 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-lg">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                      ⚠️ Remember: Set up in this order: Subcontractors → Suppliers → Approved Items → Worker Categories → Workers → Projects
                    </p>
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2 text-primary">Step-by-Step Onboarding:</p>
                    <ol className="space-y-2">
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span><span><strong>Load sample data</strong> - Go to Settings → Load Sample Data (optional but recommended)</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span><span><strong>Register Subcontractors</strong> - Before creating any subcontractor payments</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span><span><strong>Register Suppliers</strong> - Before creating purchase orders</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</span><span><strong>Create Approved Items</strong> - Before creating supplies or purchase orders</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">5</span><span><strong>Set up Worker Categories</strong> - Before adding workers</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">6</span><span><strong>Add Workers</strong> - Before processing payroll or site diary</span></li>
                      <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">7</span><span><strong>Create Projects</strong> - Before tracking income, expenses, or site diary</span></li>
                    </ol>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">💡 Pro Tips:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Use the project filter in top bar to focus on specific projects</li>
                      <li>• Export reports regularly for offline analysis</li>
                      <li>• All reports support search, project filter, and date range filtering</li>
                      <li>• Click 'Clear Dates' to reset date filters</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features Card */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap size={20} className="text-primary" />
                  Advanced Features & Best Practices
                </CardTitle>
                <CardDescription>Maximize your productivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Settings size={14} /> Automation & Integration
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      <span><strong>Purchase Order Automation:</strong> Marking an order as "Supplied" automatically updates store inventory and creates transaction records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      <span><strong>Payroll Integration:</strong> Paid payroll automatically creates expense entries for accurate cost tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      <span><strong>VAT Calculation:</strong> All financial entries automatically calculate 16% VAT as per KRA requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                      <span><strong>Subcontractor Balance:</strong> Contracted = sum of quotations, Paid = paid expenses, Balance = Contracted - Paid</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb size={14} /> Best Practices
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><span className="text-primary">📊</span><span>Use report filters (project, date range, search) to analyze specific data</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary">🏗️</span><span>Update site diary daily for accurate project records</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary">📦</span><span>Monitor store balances to avoid stockouts</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary">👷</span><span>Verify worker attendance before processing payroll</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary">📄</span><span>Keep all certificates and invoices organized in the system</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary">💾</span><span>Export and backup data weekly to prevent data loss</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== REPORTS GUIDE TAB ========== */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Reports Module Complete Guide
              </CardTitle>
              <CardDescription>
                All 12 reports with filtering, search, and export capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Profit & Loss", icon: <DollarSign size={16} className="text-green-600" />, desc: "Income vs expenses summary with project breakdown" },
                  { name: "Project Summary", icon: <BarChart3 size={16} className="text-blue-600" />, desc: "All projects with progress bars and financial metrics" },
                  { name: "Cash Flow", icon: <TrendingUp size={16} className="text-purple-600" />, desc: "Monthly income and expenses analysis" },
                  { name: "Expenses by Category", icon: <PieChart size={16} className="text-orange-600" />, desc: "Category-wise expense breakdown with percentages" },
                  { name: "VAT Summary", icon: <Receipt size={16} className="text-red-600" />, desc: "Output VAT, Input VAT, and net payable/refundable" },
                  { name: "Payroll Summary", icon: <Users size={16} className="text-teal-600" />, desc: "Payroll totals by project" },
                  { name: "Orders Report", icon: <ShoppingCart size={16} className="text-indigo-600" />, desc: "Purchase order summary with status" },
                  { name: "Stores Ledger", icon: <Warehouse size={16} className="text-amber-600" />, desc: "Inventory levels and movements" },
                  { name: "Subcontractors Ledger", icon: <Hammer size={16} className="text-cyan-600" />, desc: "Contracted amounts, payments, and balances" },
                  { name: "Suppliers Ledger", icon: <Truck size={16} className="text-emerald-600" />, desc: "Orders, payments, and outstanding balances" },
                  { name: "Income Ledger", icon: <BookOpen size={16} className="text-rose-600" />, desc: "Certificate-wise income tracking" },
                  { name: "Site Diary", icon: <Clipboard size={16} className="text-slate-600" />, desc: "Daily site activities, workers, weather, and challenges" },
                ].map((report) => (
                  <div key={report.name} className="border border-border rounded-lg p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {report.icon}
                      <span className="font-semibold text-sm">{report.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Download size={16} /> Export Functionality
                </h3>
                <p className="text-sm text-muted-foreground">Every report includes an "Export CSV" button to download your filtered data for external analysis in Excel or other tools.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== QUICK TIPS TAB ========== */}
        <TabsContent value="quicktips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb size={20} className="text-primary" />
                Quick Tips & Shortcuts
              </CardTitle>
              <CardDescription>Time-saving tips to help you work faster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors group">
                    <div className="text-primary group-hover:scale-110 transition-transform">{tip.icon}</div>
                    <p className="text-sm">{tip.text}</p>
                    {tip.priority === 'high' && <Badge variant="secondary" className="text-[10px] ml-auto">Essential</Badge>}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Video size={16} className="text-primary" />
                  Coming Soon:
                </p>
                <p className="text-xs text-muted-foreground mt-1">Video tutorials and interactive walkthroughs will be available in the next update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== SUPPORT TAB ========== */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LifeBuoy size={20} className="text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>We're here to help! Reach out to our support team for assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                  <Mail size={24} className="text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-semibold">Email Support</p>
                    <p className="text-sm text-primary font-mono">info@bochi.ke</p>
                    <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                  <Phone size={24} className="text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm font-semibold">Phone Support</p>
                    <p className="text-sm text-primary font-mono">+254 772 041 005</p>
                    <p className="text-xs text-muted-foreground mt-1">Available during business hours</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2">📞 Phone Support Hours</p>
                  <p className="text-xs text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-xs text-muted-foreground">Sunday: 9:00 AM - 1:00 PM</p>
                  <p className="text-xs text-muted-foreground">Saturday: Closed</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2">✉️ Email Support</p>
                  <p className="text-xs text-muted-foreground">Response time: Within 24 hours</p>
                  <p className="text-xs text-muted-foreground">For urgent matters, please call</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2">📍 Location</p>
                  <p className="text-xs text-muted-foreground">Deep Blue Building, Thika Road</p>
                  <p className="text-xs text-muted-foreground">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Heart size={16} className="text-primary" />
                  Before Contacting Support
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Check the FAQ section for common solutions</li>
                  <li>✓ Review the Getting Started guide for setup order</li>
                  <li>✓ Ensure you've set up data in the correct order (Subcontractors → Suppliers → Approved Items → Worker Categories → Workers → Projects)</li>
                  <li>✓ Try loading sample data to test functionality</li>
                  <li>✓ Clear filters if reports aren't showing data</li>
                  <li>✓ Have your project details and any error messages ready</li>
                  <li>✓ Take screenshots of any issues you're experiencing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== ABOUT TAB ========== */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                About BOCHI Construction Suite
              </CardTitle>
              <CardDescription>Version 2.1.0 | Enterprise Construction Management System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                BOCHI Construction Suite is a comprehensive construction management system designed specifically for 
                construction companies in Kenya and East Africa. It helps manage projects, finances, payroll, procurement, 
                inventory, and site operations in one integrated platform.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle size={14} className="text-success" />
                    Complete Feature List
                  </p>
                  <ul className="grid grid-cols-2 gap-1 text-xs">
                    <li>✓ Project Management</li>
                    <li>✓ Financial Tracking</li>
                    <li>✓ Payroll Processing</li>
                    <li>✓ Procurement & Purchase Orders</li>
                    <li>✓ Store & Inventory Management</li>
                    <li>✓ Site Diary & Daily Reports</li>
                    <li>✓ Subcontractor Management</li>
                    <li>✓ VAT & Tax Reporting</li>
                    <li>✓ Invoice Management</li>
                    <li>✓ User Role Management</li>
                    <li>✓ Data Export & Backup</li>
                    <li>✓ 12 Comprehensive Reports</li>
                    <li>✓ Advanced Filtering & Search</li>
                    <li>✓ Dark Mode Support</li>
                  </ul>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    Company Information
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li><strong>Company:</strong> Finite Element Designs Ltd</li>
                    <li><strong>Location:</strong> Deep Blue Building, Thika Road, Nairobi, Kenya</li>
                    <li><strong>Contact:</strong> finiteelementdesignsltd@gmail.com</li>
                    <li><strong>Phone:</strong> +254 772 041 005</li>
                    <li><strong>Data Storage:</strong> Local (browser storage)</li>
                    <li><strong>Technology:</strong> React, TypeScript, Tailwind CSS</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold mb-1">🆕 What's New in Version 2.1.0:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>Site Diary Report</strong> - New report tracking daily site activities</li>
                  <li>• <strong>Enhanced Filtering</strong> - Project filters, date ranges, and search on all reports</li>
                  <li>• <strong>Subcontractors Ledger</strong> - Complete view of contracted amounts and payments</li>
                  <li>• <strong>Improved Sample Data</strong> - 66+ records across all modules</li>
                  <li>• <strong>Dark Mode Support</strong> - Full compatibility across all reports</li>
                  <li>• <strong>Setup Order Guidance</strong> - Improved help documentation for proper data setup</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dedication Section */}
      <div className="mt-8 pt-4 border-t border-border">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-200/30">
            <Heart size={14} className="text-pink-500 fill-pink-500/30" />
            <span className="text-xs font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              To our Lovely Daughter
            </span>
            <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              BOCHABERI NYABOE
            </span>
            <Heart size={14} className="text-pink-500 fill-pink-500/30" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            The inspiration behind this suite | Built with ❤️ by Finite Element Designs
          </p>
        </div>
      </div>
    </div>
  );
}