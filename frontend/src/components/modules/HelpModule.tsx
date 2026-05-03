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
import { Progress } from '@/components/ui/progress';
import { 
  HelpCircle, BookOpen, MessageSquare, Mail, Phone, FileText, CheckCircle, 
  Heart, Star, Award, Users, Calendar, Clock, Download, Video, 
  Globe, Shield, Settings, TrendingUp, DollarSign, Warehouse, Truck, MapPin,
  Filter, Search, Database, RefreshCw, Clipboard, Hammer, BarChart3, PieChart,
  Receipt, ShoppingCart, HardHat, LayoutDashboard, AlertTriangle, ListChecks,
  Building2, CreditCard, FileWarning, Lightbulb, Rocket, ThumbsUp, 
  ChevronRight, ExternalLink, LifeBuoy, FileQuestion, BookMarked,
  Timer, Layers, Workflow, GraduationCap, Briefcase, CheckSquare,
  Cloud, Server, Zap, Target, Compass, Flag, GitBranch, Layers3,
  Workflow as WorkflowIcon, Users as UsersIcon, Package, TrendingUp as TrendingIcon
} from 'lucide-react';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
  priority?: 'high' | 'medium' | 'low';
}

export function HelpModule() {
  const { companySettings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // ========== COMPLETE FAQ DATABASE (50+ FAQs) ==========
  const faqs: FAQItem[] = [
    // CRITICAL SETUP ORDER (High Priority)
    { category: "⭐ CRITICAL - Setup Order", question: "What is the CORRECT order to set up my data to avoid empty dropdowns?", answer: "⚠️ THIS IS THE MOST IMPORTANT THING TO KNOW! Follow this exact order to avoid empty dropdowns: 1️⃣ Subcontractors → 2️⃣ Suppliers → 3️⃣ Approved Items → 4️⃣ Worker Categories → 5️⃣ Workers → 6️⃣ Projects. Each step depends on the previous one. If you skip a step, dropdowns will be empty! Example: You can't create a Purchase Order without Suppliers. You can't add Workers without Categories. You can't record Project Income without Projects.", priority: "high" },
    { category: "⭐ CRITICAL - Setup Order", question: "Why are my dropdown menus empty when I try to create a purchase order?", answer: "This happens when you haven't set up Suppliers first! Purchase orders need to select a supplier from a dropdown. Solution: Go to Procurement → Suppliers tab → Add your suppliers first. Then create purchase orders. The same applies to: Quotations need Subcontractors first, Supplies need Approved Items first, Payroll needs Worker Categories and Workers first.", priority: "high" },
    { category: "⭐ CRITICAL - Setup Order", question: "Why can't I see any workers when processing payroll?", answer: "You need to set up in this order: 1) Worker Categories (define job roles and day rates), 2) Workers (add workers and assign them to categories and projects). Only then will workers appear in payroll. Also ensure workers are assigned to the correct project.", priority: "high" },
    { category: "⭐ CRITICAL - Setup Order", question: "Why is my project not showing in dropdowns?", answer: "Projects must be created AND have 'Active' status to appear in dropdown menus. Go to Projects module → Check if your project exists and status is 'Active'. If not, edit the project and set status to 'Active'.", priority: "high" },
    { category: "⭐ CRITICAL - Setup Order", question: "What is the 6-step setup sequence I must follow?", answer: "📋 THE 6-STEP SEQUENCE: Step 1 - SUBCONTRACTORS (before quotations/payments), Step 2 - SUPPLIERS (before purchase orders), Step 3 - APPROVED ITEMS (before supplies), Step 4 - WORKER CATEGORIES (before workers/payroll), Step 5 - WORKERS (before payroll/site diary), Step 6 - PROJECTS (before income/expenses). Complete all 6 steps before creating any financial transactions!", priority: "high" },

    // Getting Started
    { category: "Getting Started", question: "How do I create my first project?", answer: "Go to Projects module, click 'Add Project', fill in the project name, client details, contract sum, start date, end date, and project manager. Click 'Create' to save. Note: Complete steps 1-5 (Subcontractors, Suppliers, Approved Items, Worker Categories, Workers) BEFORE creating projects for best results.", priority: "medium" },
    { category: "Getting Started", question: "How do I set up worker categories?", answer: "In Payroll module, go to 'Categories' tab, click 'Add Category'. Enter category name (e.g., Foreman, Mason, Labourer, Electrician, Plumber), set day rate (e.g., Foreman = 800 KES/day, Labourer = 400 KES/day), and choose a color for easy identification. Categories help organize workers by role and pay rate. This is STEP 4 of the setup sequence.", priority: "medium" },
    { category: "Getting Started", question: "How do I add workers to a project?", answer: "Go to Payroll → Workers tab, click 'Add Worker'. Enter worker name, phone number, select a category (must exist first - STEP 4), assign to a project, and confirm day rate (auto-populates from category). Workers must be assigned to projects before they can be included in payroll. This is STEP 5 of the setup sequence.", priority: "medium" },
    { category: "Getting Started", question: "What is the fastest way to get started with BOCHI?", answer: "⚡ QUICK START (30 minutes): 1) Load sample data from Settings → Load Sample Data (instant setup!), 2) Explore all modules to see how data connects, 3) Replace sample data with your own information using the Edit functions, 4) Follow the 6-step setup sequence. The sample data includes 66+ records across all modules.", priority: "high" },

    // Subcontractors
    { category: "Subcontractors", question: "How do I manage subcontractors and payments?", answer: "The Subcontractors module has three tabs: 📋 Subcontractors List (manage contact info, KRA PIN, specialization), 📄 Quotations (create and track subcontractor quotes), 💰 Payments & Balances (view contracted amounts, paid amounts, and outstanding balances). Contracted amount = sum of all quotations. Paid amount = expenses with category 'Subcontractor' and status 'Paid'. Balance = Contracted - Paid. This is STEP 1 of setup!", priority: "high" },
    { category: "Subcontractors", question: "How do I create a quotation for a subcontractor?", answer: "Go to Subcontractors → Quotations tab, click 'Add Quotation'. Select subcontractor (must exist first), select project, enter description of work, amount, and date. Quotations can be marked as Pending, Accepted, or Rejected. ACCEPTED quotations contribute to the subcontractor's contracted amount. This affects their balance in Payments & Balances tab.", priority: "medium" },
    { category: "Subcontractors", question: "How do I record a payment to a subcontractor?", answer: "Go to Expenses module, click 'Add Expense'. Select category 'Subcontractor', choose the subcontractor from the dropdown (must exist first - STEP 1), enter amount, payment method (Bank Transfer, Cheque, Cash, M-Pesa, etc.), and status 'Paid'. The payment will automatically appear in the Subcontractor's Payments & Balances tab, reducing their outstanding balance.", priority: "medium" },

    // Suppliers & Procurement
    { category: "Suppliers & Procurement", question: "How do I register suppliers?", answer: "Go to Procurement → Suppliers tab, click 'Add Supplier'. Enter supplier name, KRA PIN, phone, email, address, contact person, and payment terms (e.g., 30 days, 60 days, Cash on Delivery). Suppliers MUST be registered before creating purchase orders. This is STEP 2 of the setup sequence!", priority: "high" },
    { category: "Suppliers & Procurement", question: "How do I create a purchase order?", answer: "Go to Procurement → Purchase Orders, click 'New Order'. Select supplier (must exist first - STEP 2), choose project (must exist first - STEP 6), add items from approved items list (must exist first - STEP 3) with quantities. The system automatically calculates subtotal, VAT (16% as per KRA), and total. Track order status: Ordered → Supplied → Paid.", priority: "high" },
    { category: "Suppliers & Procurement", question: "What happens when I mark an order as supplied?", answer: "🔄 AUTOMATION! When you click 'Mark Supplied', the system automatically: 1) Creates a supply record, 2) Updates store inventory with received items, 3) Creates a store transaction for audit trail, 4) Updates order status to 'Supplied'. This ensures inventory accuracy without manual data entry!", priority: "high" },
    { category: "Suppliers & Procurement", question: "How do I mark a purchase order as paid?", answer: "After an order is marked as 'Supplied', a 'Mark Paid' button appears. Click it to record payment. This creates an expense record for accounting purposes, updates payment status to 'Paid', and reflects in financial reports. Only supplied orders can be marked as paid.", priority: "medium" },

    // Approved Items
    { category: "Approved Items", question: "What are Approved Items and why set them up early?", answer: "Approved Items are the materials and products you buy regularly (cement, sand, steel, timber, pipes, electrical cables, paint, etc.). They must be PRE-APPROVED before they can be added to supplies or purchase orders. Each item has: name, category (Building Material, Electrical, Plumbing, etc.), unit of measure (bag, tonne, piece, meter, roll), and default price. This is STEP 3 of setup!", priority: "high" },
    { category: "Approved Items", question: "How do I add approved items?", answer: "Go to Procurement → Approved Items tab, click 'Add Item'. Enter: item name (e.g., 'Bamburi Cement Nguvu'), category (e.g., 'Building Material'), unit (bag/tonne/piece/meter/roll), default price (KES), and description. Once added, items appear in dropdowns when creating purchase orders and supplies. Set up your most commonly used items first.", priority: "medium" },
    { category: "Approved Items", question: "Can I edit or delete approved items?", answer: "Yes! Click the edit (pencil) icon to modify an item's name, price, or category. Click delete (trash) icon to remove. Note: Deleting an item used in existing purchase orders or supplies may affect historical records. Consider marking inactive instead of deleting.", priority: "low" },

    // Stores & Inventory
    { category: "Stores & Inventory", question: "How do I manage store inventory?", answer: "In Stores module, view stock balances showing: 📦 Supplied (received from purchase orders), 📤 Issued (given to workers/teams), ↩️ Returned (unused materials returned), 📊 Current Balance (Supplied - Issued + Returned). Use 'Issue' to assign materials (requires requisition number), and 'Return' for unused materials. Low stock items (≤10 units) are highlighted in RED for attention.", priority: "high" },
    { category: "Stores & Inventory", question: "How do I issue materials to a worker?", answer: "In Stores module → Issues tab, click 'New Issue'. Select project, item (from store inventory), quantity, and enter requisition number (from site supervisor). The issue is recorded, and store balance automatically decreases. Issues are tracked by worker/team for accountability and cost allocation to projects.", priority: "medium" },
    { category: "Stores & Inventory", question: "Why is my store balance showing negative?", answer: "⚠️ Negative balance = more items issued than supplied! Common causes: 1) Issue entered before supply was recorded, 2) Incorrect quantity entered in issue, 3) Supply forgotten. Solution: Create a 'Return' transaction to correct the balance, or verify all supplies are recorded. Contact support if issue persists.", priority: "high" },
    { category: "Stores & Inventory", question: "How do I know when to reorder materials?", answer: "The Stores Ledger report shows current balances. Items with balance ≤10 units are highlighted in RED. Set reorder points based on your usage. For critical items, reorder when balance drops below 2 weeks of consumption. Export the Stores Ledger to CSV for analysis.", priority: "medium" },

    // Payroll
    { category: "Payroll", question: "How do I process weekly payroll?", answer: "Step-by-step: 1) Navigate to Payroll → Payroll tab, 2) Select project (must have workers assigned), 3) Choose week (use arrow buttons), 4) Mark attendance by checking boxes for days worked (M-Sat), 5) System calculates days worked and gross pay (day rate × days), 6) Save as DRAFT, 7) Review, then APPROVE, 8) Finally MARK AS PAID (creates expense record).", priority: "high" },
    { category: "Payroll", question: "How are worker day rates determined?", answer: "Worker day rates come from their CATEGORY! Go to Payroll → Categories tab to set day rates: Foreman (800-1000 KES), Mason (600-800 KES), Labourer (400-500 KES), Electrician (700-900 KES), Plumber (700-900 KES). When you add a worker and select a category, they inherit that category's day rate automatically.", priority: "high" },
    { category: "Payroll", question: "What happens when I approve a payroll?", answer: "APPROVING a payroll: 1) Locks the payroll record (prevents edits), 2) Marks it as ready for payment processing, 3) Updates the status to 'Approved'. You can still UNAPPROVE if needed (click 'Unapprove' button), but approved payrolls cannot be edited for data integrity.", priority: "medium" },
    { category: "Payroll", question: "How do I mark payroll as paid?", answer: "After approving a payroll, click 'Mark as Paid'. This automatically: 1) Creates an expense record for total gross pay, 2) Sets expense category to 'Payroll', 3) Updates payroll status to 'Paid'. The expense appears in financial reports and affects project profitability.", priority: "medium" },
    { category: "Payroll", question: "Can I edit a payroll after it's saved?", answer: "YES for Draft status (edit anytime). NO for Approved or Paid status (locked to maintain accurate records). If needed, click 'Unapprove' first, make changes, then re-approve. For paid payrolls, you cannot edit - create an adjustment entry instead.", priority: "low" },

    // Site Diary
    { category: "Site Diary", question: "How do I use the Site Diary?", answer: "Go to Site Diary module to record daily site activities. Enter: 📅 Date, 🏗️ Project, ☀️ Weather conditions (morning/afternoon/evening), 👷 Total workers on site, 📝 Activities performed (with times and supervisors), 🚜 Equipment used, 📦 Materials consumed, ⚠️ Challenges faced, 📋 Next day's plan. The Site Diary Report provides a summary with filtering by project and date range.", priority: "high" },
    { category: "Site Diary", question: "What should I include in a site diary entry?", answer: "📋 COMPLETE SITE DIARY ENTRY: 1) Date and project name, 2) Weather (morning/afternoon), 3) Total workers (breakdown by role optional), 4) Activities (time, location, description, supervisor), 5) Equipment used (type, hours), 6) Materials delivered/consumed, 7) Incidents or accidents, 8) Challenges faced, 9) Visitors or meetings, 10) Plan for tomorrow. Daily entries improve project tracking.", priority: "high" },
    { category: "Site Diary", question: "How do I track site workers in the diary?", answer: "In the Site Diary module, use the 'Site Workers' section. Each worker entry includes: Name, Role (category), Hours worked. Add workers individually. The 'Total Workers' count automatically updates based on workers you add. This provides detailed labor tracking beyond just headcount.", priority: "medium" },
    { category: "Site Diary", question: "Can I edit a site diary entry after submission?", answer: "Yes! Edit any entry - find it in the list, click the edit (pencil) icon. Make changes and save. The entry's status updates accordingly. No lock on site diary entries - edit anytime to keep records accurate.", priority: "low" },

    // Financial Management
    { category: "Financial Management", question: "How do I record income from payment certificates?", answer: "In Income module, click 'Add Income'. Select project, enter: certificate number, gross amount, retention percentage (typically 5-10%), and amount received. The system calculates retention amount and net payable automatically. Tracks payment progress and updates project completion percentage based on contract sum.", priority: "high" },
    { category: "Financial Management", question: "How do I track expenses?", answer: "In Expenses module, click 'Add Expense'. Select category: 🏢 Subcontractor, 🏪 Supplier, 👷 Payroll, 🚜 Equipment, 🚛 Transport, or 🏷️ Other. Enter description, amount, payment method, and reference number. VAT automatically calculated at 16% (Kenyan tax regulation). Track status: Pending → Paid.", priority: "high" },
    { category: "Financial Management", question: "What is retention money and how is it calculated?", answer: "Retention money is a percentage (typically 5-10%) held back from payment certificates until project completion. In Income module, enter the retention percentage, and the system automatically calculates: Retention Amount = Gross Amount × Retention %, Net Payable = Gross Amount + VAT - Retention. Retention is released upon project completion and defect liability period end.", priority: "medium" },
    { category: "Financial Management", question: "What expense categories are available?", answer: "📋 EXPENSE CATEGORIES: 1) Subcontractor - payments to subcontractors, 2) Supplier - material purchases, 3) Payroll - staff wages (auto-created from payroll), 4) Equipment - machinery, tools, rental, 5) Transport - delivery, fuel, vehicle costs, 6) Other - miscellaneous expenses. Use categories to analyze spending by type in reports.", priority: "medium" },
    { category: "Financial Management", question: "What's the difference between 'Amount Received' and 'Gross Amount'?", answer: "GROSS AMOUNT = total value of the certificate before any deductions. AMOUNT RECEIVED = what you actually received after deductions (retention, withholding tax, etc.). Example: Gross = 1,000,000 KES, Retention 5% = 50,000 KES, Amount Received = 950,000 KES. The system tracks both for accurate financial reporting.", priority: "medium" },

    // VAT & Tax
    { category: "VAT & Tax", question: "How do I generate VAT reports for KRA filing?", answer: "Go to VAT module or Reports → VAT Summary. Select date range (monthly/quarterly) and project filter. The system calculates: OUTPUT VAT (16% of gross income from payment certificates), INPUT VAT (16% of eligible expense amounts), NET VAT = Output - Input (payable to KRA if positive, refundable if negative). Export CSV for KRA filing.", priority: "high" },
    { category: "VAT & Tax", question: "How is VAT calculated in BOCHI?", answer: "BOCHI automatically calculates VAT at 16% on all financial transactions as per KRA regulations: OUTPUT VAT = 16% of gross income amount from payment certificates. INPUT VAT = 16% of expense amounts where VAT is applicable (supplies, subcontractors, equipment). The system handles it automatically - no manual calculation needed!", priority: "high" },
    { category: "VAT & Tax", question: "What is the difference between Input and Output VAT?", answer: "📤 OUTPUT VAT = VAT you charge your clients (VAT on sales) - payable to KRA. 📥 INPUT VAT = VAT you pay to suppliers (VAT on purchases) - claimable from KRA. Difference (Output - Input) = NET PAYABLE to KRA (if positive), or REFUNDABLE from KRA (if negative). Keep all tax invoices for audit.", priority: "high" },

    // Invoices
    { category: "Invoices", question: "How do I create client invoices?", answer: "Go to Invoices module, click 'New Invoice'. Select project, add line items with: description, quantity, unit, unit price. The system calculates: SUBTOTAL = sum of line items, VAT = 16% of subtotal, TOTAL = subtotal + VAT. Track invoice status: Draft → Sent → Paid → Overdue. Mark as paid when payment received.", priority: "high" },
    { category: "Invoices", question: "Can I track invoice payments?", answer: "Yes! Invoice status field options: 📝 DRAFT (editing), 📧 SENT (issued to client), 💰 PAID (payment received), ⏰ OVERDUE (past due date). Update status as payments arrive. PAID invoices automatically contribute to project income. Overdue invoices appear in RED for attention.", priority: "medium" },
    { category: "Invoices", question: "How do I know if an invoice is overdue?", answer: "The system uses the DUE DATE field. If due date is in the past AND status is not 'Paid', the invoice is automatically marked as OVERDUE and appears in RED in the invoices list. Set realistic due dates (typically 30 days from invoice date).", priority: "medium" },

    // Reports & Analytics
    { category: "Reports & Analytics", question: "What reports are available?", answer: "📊 12 COMPREHENSIVE REPORTS: 1) Profit & Loss (income vs expenses), 2) Project Summary (all projects with progress), 3) Cash Flow (monthly trends), 4) Expenses by Category (spending breakdown), 5) VAT Summary (tax calculations), 6) Payroll Summary (labor costs), 7) Orders Report (purchase orders), 8) Stores Ledger (inventory levels), 9) Subcontractors Ledger (payments tracking), 10) Suppliers Ledger (supplier balances), 11) Income Ledger (certificate tracking), 12) Site Diary (daily activities). ALL support filtering, search, and CSV export!", priority: "high" },
    { category: "Reports & Analytics", question: "How do I filter reports by project?", answer: "Two ways: 1) GLOBAL FILTER - dropdown in top-right corner of app (applies to all modules), 2) REPORT-SPECIFIC FILTER - 'Filter by Project' dropdown at top of each report. Global filter affects everything, report filters give granular control. Use both for precise analysis.", priority: "medium" },
    { category: "Reports & Analytics", question: "Can I filter reports by date range?", answer: "Yes! Most reports (Profit & Loss, Cash Flow, Expenses by Category, VAT, Payroll, Orders, Stores, Suppliers, Subcontractors) include START DATE and END DATE filters. Simply select your date range; data updates automatically. Click 'Clear Dates' to reset. Export filtered data to CSV.", priority: "medium" },
    { category: "Reports & Analytics", question: "What is the Executive Dashboard?", answer: "The Executive Dashboard (Reports → Analytics Dashboard) provides a high-level overview of your business health: KPI cards (Revenue, Expenses, Profit, Margin), Revenue vs Expenses trend chart, Profit margin analysis, Expense distribution pie chart, Top performing projects, and Project performance matrix. Perfect for management reviews!", priority: "high" },

    // Data Management & Security
    { category: "Data Management", question: "Where is my data stored?", answer: "☁️ CLOUD DATABASE! Your data is stored securely in PostgreSQL database on Render (cloud hosting). Benefits: Access from any device, anywhere; Team members share same database; Automatic daily backups; No data loss if browser cache cleared; Enterprise-grade security. Use Settings → Backup Data to download local copies for extra safety.", priority: "high" },
    { category: "Data Management", question: "How do I backup my data?", answer: "Go to Settings module → Backup tab → Click 'Backup Data'. Downloads a JSON file of ALL your data (projects, income, expenses, workers, payroll, procurement, stores, site diary, invoices, settings). Store this file safely! To restore, click 'Restore Data' and select your backup file. RECOMMEND: Weekly backups for active projects, daily for critical ones.", priority: "high" },
    { category: "Data Management", question: "How do I load sample data?", answer: "Settings module → 'Load Sample Data' button. Populates ALL modules with 66+ demonstration records: projects (6), subcontractors (10), quotations (15), expenses (8), income (6), purchase orders (2), supplies (5), store transactions (5), site diary (1), invoices (1), suppliers (8), approved items (26), workers (2). Perfect for testing and learning!", priority: "medium" },
    { category: "Data Management", question: "What data is included in a backup?", answer: "COMPLETE DATA EXPORT: Projects, Income, Expenses, Workers, Worker Categories, Payroll Records, Approved Items, Suppliers, Purchase Orders, Supplies, Store Transactions, Site Diary Entries, Subcontractors, Quotations, Invoices, Company Settings, Users. Everything you need to restore your entire system.", priority: "medium" },

    // Troubleshooting
    { category: "Troubleshooting", question: "Why can't I see my projects in dropdown menus?", answer: "Two requirements: 1) Project must exist (create it first), 2) Project status must be 'Active' (edit project to change from 'On Hold' or 'Completed' to 'Active'). Only active projects appear in dropdowns across all modules.", priority: "high" },
    { category: "Troubleshooting", question: "Why is my store balance showing negative?", answer: "⚠️ Negative balance = more items issued than supplied. Common causes: 1) Unrecorded supply, 2) Incorrect issue quantity, 3) Data entry error. Solutions: 1) Create return transaction to correct balance, 2) Verify all supplies are recorded, 3) Check issue quantities. Contact support if persists.", priority: "high" },
    { category: "Troubleshooting", question: "Why isn't my report showing any data?", answer: "CHECK THESE FILTERS: 1) Global project filter (top-right corner), 2) Report-specific project filter, 3) Date range filters (if applicable), 4) Search box (clear if text is entered). Still no data? Load sample data from Settings to test if reports work with demo data.", priority: "high" },
    { category: "Troubleshooting", question: "Why am I getting a 'Permission denied' error?", answer: "Your user account lacks permission for that module. Contact your company ADMIN to request access. Admins manage permissions in Settings → Users → Edit user → Select module permissions. Admins see all modules by default.", priority: "high" },
    { category: "Troubleshooting", question: "What should I do if I encounter a bug?", answer: "🐛 BUG REPORTING STEPS: 1) Refresh page (Ctrl+F5 hard refresh), 2) Clear browser cache, 3) Check if issue persists, 4) Take screenshots, 5) Note steps to reproduce, 6) Contact support: info@bochi.ke with details. Include: browser version, what you were doing, error messages (if any). We respond within 24 hours.", priority: "medium" },

    // User Management
    { category: "User Management", question: "How do I add new users to my company?", answer: "Only ADMIN users can add users. Go to Settings → Users → Add User. Enter: name, email, password, role (Admin or User). For regular users, select which modules they can access. Then click Save. The new user receives login credentials. Note: Free plan allows only 1 additional user; upgrade to Pro for more.", priority: "high" },
    { category: "User Management", question: "How do I set user permissions?", answer: "Settings → Users → Click Edit (pencil) on a user. For 'User' role, a permission panel appears. Check/uncheck modules this user can access: Dashboard, Projects, Income, Expenses, Invoices, VAT, Payroll, Procurement, Stores, Subcontractors, Site Diary, Reports, Settings, etc. Admins have all permissions automatically.", priority: "medium" },
  ];

  // Filter FAQs based on search and category
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

  // Get unique categories with counts
  const categoriesWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    faqs.forEach(faq => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, []);

  // Group filtered FAQs by category
  const faqsByCategory = useMemo(() => {
    const grouped: Record<string, FAQItem[]> = {};
    filteredFaqs.forEach(faq => {
      if (!grouped[faq.category]) grouped[faq.category] = [];
      grouped[faq.category].push(faq);
    });
    return grouped;
  }, [filteredFaqs]);

  const handleHelpful = (question: string, isHelpful: boolean) => {
    setHelpfulFeedback(prev => ({ ...prev, [question]: isHelpful }));
  };

  const criticalFaqs = faqs.filter(f => f.category === "⭐ CRITICAL - Setup Order");
  const totalFaqs = faqs.length;

  return (
    <div className="space-y-6 fade-in">
      {/* Hero Header with Stats */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/8 to-transparent rounded-xl p-6 border border-primary/25">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LifeBuoy size={32} className="text-primary" />
              <h1 className="text-2xl font-bold">Help & Support Center</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Everything you need to know about using BOCHI Construction Suite — from getting started to advanced features
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center bg-primary/10 rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-primary">{totalFaqs}</p>
              <p className="text-[10px] text-muted-foreground">FAQs Available</p>
            </div>
            <div className="text-center bg-amber-500/10 rounded-lg px-4 py-2">
              <p className="text-2xl font-bold text-amber-600">{criticalFaqs.length}</p>
              <p className="text-[10px] text-muted-foreground">Critical Guides</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="critical" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="critical" className="text-amber-600 font-medium">⭐ Critical Setup</TabsTrigger>
          <TabsTrigger value="faq">All FAQs ({totalFaqs})</TabsTrigger>
          <TabsTrigger value="gettingstarted">Getting Started</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          <TabsTrigger value="quicktips">Quick Tips</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* ========== CRITICAL SETUP TAB (Most Important) ========== */}
        <TabsContent value="critical" className="space-y-4">
          <Card className="border-amber-500/30">
            <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <AlertTriangle size={24} />
                ⚠️ CRITICAL: You MUST Follow This Setup Order!
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-400">
                These are the MOST IMPORTANT instructions. Following this order prevents empty dropdowns and errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Setup Order Diagram */}
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: 1, name: "Subcontractors", icon: <Hammer size={24} />, color: "blue", what: "Required BEFORE: Quotations, Payments", detail: "Register all subcontractors with KRA PIN, contacts" },
                    { step: 2, name: "Suppliers", icon: <Truck size={24} />, color: "blue", what: "Required BEFORE: Purchase Orders", detail: "Add material suppliers with payment terms" },
                    { step: 3, name: "Approved Items", icon: <Package size={24} />, color: "blue", what: "Required BEFORE: Supplies, Orders", detail: "Pre-approve all materials with default prices" },
                    { step: 4, name: "Worker Categories", icon: <UsersIcon size={24} />, color: "blue", what: "Required BEFORE: Workers, Payroll", detail: "Define job roles and daily pay rates" },
                    { step: 5, name: "Workers", icon: <HardHat size={24} />, color: "blue", what: "Required BEFORE: Payroll, Site Diary", detail: "Add workers, assign to categories/projects" },
                    { step: 6, name: "Projects", icon: <Building2 size={24} />, color: "green", what: "Required BEFORE: Income, Expenses", detail: "Create projects after foundational data ready" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{item.icon}</span>
                          <span className="font-bold">{item.name}</span>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{item.what}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-amber-400 opacity-30">
                  ↓ ↓ ↓
                </div>
              </div>

              {/* Why This Order Matters */}
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border-l-4 border-amber-500">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <CheckCircle size={18} /> Why This Order Matters
                </h3>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400 ml-6 list-disc">
                  <li>Each dropdown menu needs existing data to populate</li>
                  <li>Transactions reference these foundational records</li>
                  <li>Prevents frustrating "empty dropdown" errors</li>
                  <li>Ensures proper data relationships and reporting accuracy</li>
                  <li>Saves hours of troubleshooting later</li>
                </ul>
              </div>

              {/* All Critical FAQs */}
              <div className="space-y-3">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <FileQuestion size={18} /> Critical Questions & Answers
                </h3>
                <Accordion type="multiple" className="w-full" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
                  {criticalFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`critical-${idx}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">⚠️</span>
                          <span className="font-medium">{faq.question}</span>
                          <Badge variant="destructive" className="text-[10px] ml-2">Must Read</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-6">
                        <p className="text-sm">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== COMPLETE FAQ TAB ========== */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion size={20} className="text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                {totalFaqs} comprehensive answers organized by category — search or filter to find what you need
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
                    className="pl-9"
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
                  All ({totalFaqs})
                </Badge>
                {categoriesWithCount.map(cat => (
                  <Badge 
                    key={cat.name}
                    variant={selectedCategory === cat.name ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setOpenAccordionItems([]);
                    }}
                  >
                    {cat.name} ({cat.count})
                  </Badge>
                ))}
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setOpenAccordionItems([]);
                  }} className="text-xs h-7">
                    Clear All
                  </Button>
                )}
              </div>
              
              <Separator />
              
              {/* FAQs Accordion */}
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
                {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold text-primary mb-2 sticky top-0 bg-background py-1 z-10">
                      {category}
                    </h3>
                    <Accordion 
                      type="multiple" 
                      className="w-full" 
                      value={openAccordionItems} 
                      onValueChange={setOpenAccordionItems}
                    >
                      {categoryFaqs.map((faq, idx) => (
                        <AccordionItem key={`${category}-${idx}`} value={`${category}-${idx}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-start gap-2">
                              <span className="text-primary mt-0.5 shrink-0">❓</span>
                              <span className="font-medium text-sm">{faq.question}</span>
                              {faq.priority === 'high' && (
                                <Badge variant="secondary" className="text-[10px] ml-2 bg-amber-100 text-amber-700">Important</Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pl-6">
                            <p className="text-sm whitespace-pre-wrap">{faq.answer}</p>
                            <div className="mt-3 pt-2 border-t border-border/50 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Category: {faq.category}</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleHelpful(faq.question, true)}
                                  className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                                >
                                  <ThumbsUp size={12} /> Helpful
                                </button>
                                {helpfulFeedback[faq.question] && <CheckCircle size={10} className="text-green-500" />}
                              </div>
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
              {/* Setup Progress */}
              <div className="bg-primary/5 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2">Setup Progress Tracker</h3>
                <div className="space-y-2">
                  {["Subcontractors", "Suppliers", "Approved Items", "Worker Categories", "Workers", "Projects"].map((step, idx) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">{idx + 1}</div>
                      <span className="text-sm flex-1">{step}</span>
                      <Button variant="ghost" size="sm" className="text-xs h-6">Mark Complete</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-xs font-semibold mb-2 text-primary">Step-by-Step Onboarding:</p>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span><span><strong>Load sample data</strong> - Settings → Load Sample Data (recommended)</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span><span><strong>Register Subcontractors</strong> - Before any subcontractor payments</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span><span><strong>Register Suppliers</strong> - Before creating purchase orders</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</span><span><strong>Create Approved Items</strong> - Before supplies or purchase orders</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">5</span><span><strong>Set up Worker Categories</strong> - Before adding workers</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">6</span><span><strong>Add Workers</strong> - Before processing payroll</span></li>
                  <li className="flex items-start gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">7</span><span><strong>Create Projects</strong> - Before tracking income/expenses</span></li>
                </ol>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-semibold mb-2">💡 Pro Tips:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Use the project filter in top bar to focus on specific projects</li>
                  <li>• Export reports regularly for offline analysis</li>
                  <li>• All reports support search, project filter, and date range filtering</li>
                  <li>• Click 'Clear Dates' to reset date filters</li>
                  <li>• Use dark mode for evening work (toggle in sidebar)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== USER GUIDES TAB ========== */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Module Quick Guides</CardTitle>
                <CardDescription>Quick reference for each module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">🏗️ Projects</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">💰 Income/Expenses</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">👷 Payroll</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">📦 Procurement & Stores</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">📝 Site Diary</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                  <div className="flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg"><span className="font-medium">📊 Reports</span><ChevronRight size={16} className="text-muted-foreground" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Star size={20} className="text-primary" /> Advanced Features</CardTitle>
                <CardDescription>Maximize your productivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-success mt-0.5" /><span><strong>Purchase Order Automation:</strong> Marking "Supplied" updates inventory</span></div>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-success mt-0.5" /><span><strong>Payroll Integration:</strong> Paid payroll creates expense entries</span></div>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-success mt-0.5" /><span><strong>VAT Calculation:</strong> Automatic 16% VAT calculation</span></div>
                <div className="flex items-start gap-2"><CheckCircle size={14} className="text-success mt-0.5" /><span><strong>Subcontractor Balance:</strong> Auto-calculated from quotations and payments</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== REPORTS & ANALYTICS TAB ========== */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Reports & Analytics Guide
              </CardTitle>
              <CardDescription>All 12 reports + Executive Dashboard with filtering and export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Profit & Loss", icon: "💰", desc: "Income vs expenses summary" },
                  { name: "Project Summary", icon: "📊", desc: "All projects with progress" },
                  { name: "Cash Flow", icon: "💵", desc: "Monthly income/expenses" },
                  { name: "Expenses by Category", icon: "🥧", desc: "Category breakdown" },
                  { name: "VAT Summary", icon: "📋", desc: "Output/input VAT" },
                  { name: "Payroll Summary", icon: "👷", desc: "Payroll totals by project" },
                  { name: "Orders Report", icon: "📦", desc: "Purchase order summary" },
                  { name: "Stores Ledger", icon: "🏪", desc: "Inventory levels" },
                  { name: "Subcontractors Ledger", icon: "🔨", desc: "Payments & balances" },
                  { name: "Suppliers Ledger", icon: "🚛", desc: "Orders & payments" },
                  { name: "Income Ledger", icon: "📄", desc: "Certificate tracking" },
                  { name: "Site Diary", icon: "📔", desc: "Daily activities" },
                  { name: "Executive Dashboard", icon: "🎯", desc: "KPIs & visual charts" },
                ].map((report) => (
                  <div key={report.name} className="border border-border rounded-lg p-2 hover:bg-muted/20">
                    <div className="flex items-center gap-2"><span className="text-lg">{report.icon}</span><span className="font-medium text-sm">{report.name}</span></div>
                    <p className="text-xs text-muted-foreground ml-7">{report.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <p className="text-xs font-semibold flex items-center gap-2"><Download size={14} /> All reports include CSV export!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== QUICK TIPS TAB ========== */}
        <TabsContent value="quicktips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb size={20} className="text-primary" /> Quick Tips & Keyboard Shortcuts</CardTitle>
              <CardDescription>Time-saving tips to work faster</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><ListChecks size={14} className="text-primary" /><span className="text-sm">Follow setup order: Subcontractors → Suppliers → Approved Items → Worker Categories → Workers → Projects</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Filter size={14} className="text-primary" /><span className="text-sm">Use project filter to narrow down data</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Download size={14} className="text-primary" /><span className="text-sm">Export any report to CSV for Excel</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Database size={14} className="text-primary" /><span className="text-sm">Load sample data from Settings to test</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Warehouse size={14} className="text-primary" /><span className="text-sm">Purchase orders auto-update inventory when marked supplied</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded"><Clipboard size={14} className="text-primary" /><span className="text-sm">Use Site Diary daily for accurate project records</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== SUPPORT TAB ========== */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LifeBuoy size={20} className="text-primary" /> Contact Support</CardTitle>
              <CardDescription>We're here to help! Reach out anytime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border"><Mail size={20} className="text-primary" /><div><p className="font-semibold text-sm">Email Support</p><p className="text-xs text-primary">info@bochi.ke</p><p className="text-[10px] text-muted-foreground">Response within 24 hours</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-lg border"><Phone size={20} className="text-primary" /><div><p className="font-semibold text-sm">Phone Support</p><p className="text-xs text-primary">+254 772 041 005</p><p className="text-[10px] text-muted-foreground">Mon-Fri: 8AM-6PM, Sun: 9AM-1PM</p></div></div>
              </div>
              <div className="bg-primary/5 rounded-lg p-3">
                <p className="text-xs font-semibold mb-1">📋 Before Contacting Support:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
                  <li>Check the FAQ and Critical Setup sections first</li>
                  <li>Ensure you've followed the 6-step setup order</li>
                  <li>Try loading sample data to test functionality</li>
                  <li>Clear filters if reports aren't showing data</li>
                  <li>Take screenshots of any errors</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== ABOUT TAB ========== */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe size={20} className="text-primary" /> About BOCHI Construction Suite</CardTitle>
              <CardDescription>Version 2.1.0 | Enterprise Construction Management System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">BOCHI Construction Suite is a comprehensive construction management system designed specifically for construction companies in Kenya and East Africa.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-2"><CheckCircle size={12} /> Features</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    <li>✓ Project Management</li><li>✓ Financial Tracking</li>
                    <li>✓ Payroll Processing</li><li>✓ Procurement</li>
                    <li>✓ Store Inventory</li><li>✓ Site Diary</li>
                    <li>✓ Subcontractors</li><li>✓ VAT Reports</li>
                    <li>✓ Invoices</li><li>✓ 12+ Reports</li>
                  </ul>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-2"><Database size={12} /> Data Storage</p>
                  <ul className="space-y-0.5 text-xs">
                    <li><strong>Type:</strong> Cloud Database (PostgreSQL on Render)</li>
                    <li><strong>Security:</strong> Encrypted, daily backups</li>
                    <li><strong>Access:</strong> Any device, anywhere</li>
                    <li><strong>Sharing:</strong> Team members share same database</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                <p className="text-[11px] font-semibold">🆕 Version 2.1.0 Updates:</p>
                <ul className="text-[10px] text-muted-foreground flex flex-wrap gap-x-4">
                  <li>• Executive Dashboard</li><li>• Enhanced Reports</li>
                  <li>• Subcontractors Ledger</li><li>• Setup Order Guidance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dedication */}
      <div className="text-center pt-4 border-t">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <Heart size={12} className="text-pink-500" />
          <span className="text-[10px]">To our daughter BOCHABERI NYABOE</span>
          <Heart size={12} className="text-pink-500" />
        </div>
      </div>
    </div>
  );
}