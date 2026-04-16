import { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, BookOpen, MessageSquare, Mail, Phone, FileText, CheckCircle, 
  Heart, Star, Award, Users, Calendar, Clock, Download, Video, 
  Globe, Shield, Settings, TrendingUp, DollarSign, Warehouse, Truck, MapPin,
  Filter, Search, Database, RefreshCw, Clipboard, Hammer, BarChart3, PieChart,
  Receipt, ShoppingCart, HardHat, LayoutDashboard
} from 'lucide-react';

export function HelpModule() {
  const { companySettings } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: "Getting Started",
      question: "How do I create my first project?",
      answer: "Go to Projects module, click 'Add Project', fill in the project name, client details, contract sum, and dates. Click 'Create' to save. The project will appear on your dashboard and be available for all other modules."
    },
    {
      category: "Getting Started",
      question: "How do I set up worker categories?",
      answer: "In Payroll module, go to 'Categories' tab, click 'Add Category'. Enter category name (e.g., Foreman, Mason, Labourer), set day rate, and choose a color for easy identification. Categories help organize workers by role and pay rate."
    },
    {
      category: "Getting Started",
      question: "How do I add workers to a project?",
      answer: "Go to Payroll → Workers tab, click 'Add Worker'. Enter worker name, phone number, select category, assign to a project, and confirm day rate. Workers must be assigned to projects before they can be included in payroll."
    },
    {
      category: "Sample Data",
      question: "How do I load sample data?",
      answer: "Go to Settings module and click 'Load Sample Data'. This will populate all modules with 66+ demonstration records including projects, subcontractors, quotations, expenses, income, purchase orders, store transactions, site diary entries, invoices, suppliers, approved items, and workers."
    },
    {
      category: "Reports",
      question: "What reports are available?",
      answer: "The Reports module includes 12 comprehensive reports: Profit & Loss, Project Summary, Cash Flow, Expenses by Category, VAT Summary, Payroll Summary, Orders Report, Stores Ledger, Subcontractors Ledger, Suppliers Ledger, Income Ledger, and Site Diary Report. All reports support project filtering, date range selection, search functionality, and CSV export."
    },
    {
      category: "Reports",
      question: "How do I filter reports by project?",
      answer: "Each report has a 'Filter by Project' dropdown at the top. You can also use the global project filter in the top-right corner of the app. The global filter applies to all modules, while report-specific filters give you more granular control."
    },
    {
      category: "Reports",
      question: "Can I filter reports by date range?",
      answer: "Yes! Most reports (Profit & Loss, Cash Flow, Expenses by Category, VAT, Payroll, Orders, Stores, Suppliers, Subcontractors) include date range filters. Simply select Start Date and End Date, and click 'Clear Dates' to reset. The data updates automatically."
    },
    {
      category: "Reports",
      question: "How do I search within a report?",
      answer: "Reports with search functionality include a search box (🔍) at the top. Type to search by project name, supplier name, order number, certificate number, or other relevant fields. Results update in real-time as you type."
    },
    {
      category: "Subcontractors",
      question: "How do I manage subcontractors and payments?",
      answer: "The Subcontractors module has three tabs: Subcontractors List (manage contact info), Quotations (create and track quotes), and Payments & Balances (view contracted amounts, paid amounts, and outstanding balances). Contracted amount is the sum of all quotations. Paid amount comes from expenses with category 'Subcontractor' and status 'Paid'."
    },
    {
      category: "Site Diary",
      question: "How do I use the Site Diary?",
      answer: "Go to Site Diary module to record daily site activities. Enter date, project, weather conditions, total workers, activities performed, equipment used, materials consumed, challenges faced, and next day's plan. The Site Diary Report in the Reports module provides a summary view with filtering by project and date range."
    },
    {
      category: "Procurement",
      question: "How do I create a purchase order?",
      answer: "Go to Procurement → Purchase Orders, click 'New Order'. Select supplier, choose project, add items from approved items list with quantities. The system automatically calculates subtotal, VAT (16%), and total. Once created, you can track order status from Ordered → Supplied → Paid."
    },
    {
      category: "Procurement",
      question: "What happens when I mark an order as supplied?",
      answer: "When you click 'Mark Supplied', the system automatically: 1) Creates a supply record, 2) Updates store inventory with the received items, 3) Creates a store transaction for audit trail, and 4) Updates the order status to 'Supplied'. This automation ensures inventory accuracy."
    },
    {
      category: "Stores",
      question: "How do I manage store inventory?",
      answer: "In Stores module, view stock balances showing total supplied, issued, returned, and current balance. Use 'Issue' to assign materials to workers/teams (requires requisition number), and 'Return' to return unused materials. Low stock items (≤10 units) are highlighted in red for attention."
    },
    {
      category: "Payroll",
      question: "How do I process weekly payroll?",
      answer: "Navigate to Payroll → Payroll tab. Select the project, choose the week (use arrow buttons to navigate weeks). Mark attendance for each worker by checking the boxes for days worked. The system automatically calculates days worked and gross pay. Save as Draft, then Approve, and finally Mark as Paid. Paid payroll automatically creates an expense record."
    },
    {
      category: "Finance",
      question: "How do I record income from payment certificates?",
      answer: "In Income module, click 'Add Income'. Select the project, enter certificate number, gross amount, retention percentage (typically 5-10%), and amount received. The system tracks payment progress and automatically updates project completion percentage based on total contract sum."
    },
    {
      category: "Finance",
      question: "How do I track expenses?",
      answer: "In Expenses module, click 'Add Expense'. Select category (Subcontractor, Supplier, Payroll, Equipment, Transport, or Other), enter description and amount. VAT is automatically calculated at 16% as per Kenyan tax regulations. You can also record payment method and reference number for audit trails."
    },
    {
      category: "VAT",
      question: "How do I generate VAT reports?",
      answer: "Go to VAT module or Reports → VAT Summary. Select date range and project filter. The system calculates input VAT (on purchases) and output VAT (on sales) with net payable/refundable amount. You can export VAT reports for KRA filing."
    },
    {
      category: "Invoices",
      question: "How do I create client invoices?",
      answer: "Go to Invoices module, click 'New Invoice'. Select project, add line items with descriptions, quantities, and unit prices. The system calculates subtotal, VAT (16%), and total. Invoices can be saved as draft, sent to client, and marked as paid when payment is received."
    },
    {
      category: "Data Management",
      question: "How do I backup and export my data?",
      answer: "Go to Settings module. Click 'Backup Data' to download a JSON file of all your data. To restore, click 'Restore Data' and select your backup file. You can also export individual reports to CSV using the 'Export CSV' button on each report. We recommend weekly backups for data safety."
    },
    {
      category: "Troubleshooting",
      question: "Why can't I see my projects in dropdown menus?",
      answer: "Ensure projects have 'Active' status. Only active projects appear in dropdown selections. You can change project status in Projects module by editing the project."
    },
    {
      category: "Troubleshooting",
      question: "Why is my store balance showing negative?",
      answer: "Negative balance indicates more items were issued than supplied. Check your store transactions for incorrect issue entries. You can create a return transaction to correct the balance."
    },
    {
      category: "Troubleshooting",
      question: "Why isn't my report showing data?",
      answer: "Check your filters: 1) Ensure the global project filter isn't hiding data, 2) Check report-specific project filter, 3) Verify date range filters, 4) Clear search box if text is entered. If still no data, load sample data from Settings to test."
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(faqs.map(f => f.category))];

  const quickTips = [
    { icon: <Filter size={16} />, text: "Use project filter in top bar or report-specific filters to narrow down data" },
    { icon: <Search size={16} />, text: "Search across reports by typing in the search box - results update instantly" },
    { icon: <Calendar size={16} />, text: "Use date range filters to view data for specific periods" },
    { icon: <RefreshCw size={16} />, text: "Click 'Clear Dates' to reset date filters" },
    { icon: <Download size={16} />, text: "Export any report to CSV for further analysis in Excel" },
    { icon: <Database size={16} />, text: "Load sample data from Settings to test all features" },
    { icon: <Warehouse size={16} />, text: "Purchase orders automatically update store inventory when marked supplied" },
    { icon: <Hammer size={16} />, text: "Subcontractor balances are calculated from quotations and paid expenses" },
    { icon: <Clipboard size={16} />, text: "Use Site Diary daily for accurate project records" },
    { icon: <TrendingUp size={16} />, text: "Review financial reports monthly to track profitability" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="reports">Reports Guide</TabsTrigger>
          <TabsTrigger value="quicktips">Quick Tips</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle size={20} className="text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Comprehensive answers to common questions about using BOCHABERI Construction Suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="text-xs font-medium">Search FAQs</Label>
                <Input 
                  placeholder="Search by question, answer, or category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md mt-1"
                />
              </div>
              
              {!searchQuery && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(cat => (
                    <Button 
                      key={cat} 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSearchQuery(cat)}
                      className="text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              )}
              
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">❓</span>
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-6">
                      {faq.answer}
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Category: </span>
                        <span className="text-xs font-medium text-primary">{faq.category}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No matching FAQs found. Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2 text-primary">Step-by-Step Onboarding:</p>
                    <ol className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                        <span><strong>Load sample data</strong> - Go to Settings → Load Sample Data</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                        <span><strong>Explore reports</strong> - Check out all 12 reports with filtering and search</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                        <span><strong>Manage subcontractors</strong> - Add subcontractors, create quotations, track payments</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                        <span><strong>Process payroll</strong> - Mark attendance and generate payroll</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">5</span>
                        <span><strong>Record site diary</strong> - Log daily activities, workers, and challenges</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 mt-0.5">6</span>
                        <span><strong>Track finances</strong> - Record income and expenses, generate VAT reports</span>
                      </li>
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

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star size={20} className="text-primary" />
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
                    <Award size={14} /> Best Practices
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📊</span>
                      <span>Use report filters (project, date range, search) to analyze specific data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🏗️</span>
                      <span>Update site diary daily for accurate project records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📦</span>
                      <span>Monitor store balances to avoid stockouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">👷</span>
                      <span>Verify worker attendance before processing payroll</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📄</span>
                      <span>Keep all certificates and invoices organized in the system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">💾</span>
                      <span>Export and backup data weekly to prevent data loss</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Guide Tab - NEW */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-semibold text-sm">Profit & Loss</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Income vs expenses summary with project breakdown. Features: Project filter, Date range, Search, Summary cards.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-blue-600" />
                    <span className="font-semibold text-sm">Project Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All projects with progress bars and financial metrics. Features: Project filter, Date range, Search, Summary cards.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-purple-600" />
                    <span className="font-semibold text-sm">Cash Flow</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Monthly income and expenses analysis. Features: Project filter, Date range, Search, Summary cards.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart size={16} className="text-orange-600" />
                    <span className="font-semibold text-sm">Expenses by Category</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Category-wise expense breakdown with percentages. Features: Project filter, Date range.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt size={16} className="text-red-600" />
                    <span className="font-semibold text-sm">VAT Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Output VAT, Input VAT, and net payable/refundable. Features: Project filter, Date range.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-teal-600" />
                    <span className="font-semibold text-sm">Payroll Summary</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Payroll totals by project. Features: Project filter, Date range.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart size={16} className="text-indigo-600" />
                    <span className="font-semibold text-sm">Orders Report</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Purchase order summary with status. Features: Project filter, Date range, Search.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Warehouse size={16} className="text-amber-600" />
                    <span className="font-semibold text-sm">Stores Ledger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Inventory levels and movements. Features: Project filter, Date range, Search.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Hammer size={16} className="text-cyan-600" />
                    <span className="font-semibold text-sm">Subcontractors Ledger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contracted amounts, payments, and balances. Features: Project filter, Subcontractor filter, Date range, Search.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={16} className="text-emerald-600" />
                    <span className="font-semibold text-sm">Suppliers Ledger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Orders, payments, and outstanding balances. Features: Project filter, Date range, Search.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-rose-600" />
                    <span className="font-semibold text-sm">Income Ledger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Certificate-wise income tracking. Features: Project filter, Search.</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clipboard size={16} className="text-slate-600" />
                    <span className="font-semibold text-sm">Site Diary</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Daily site activities, workers, weather, and challenges. Features: Project filter, Date range.</p>
                </div>
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

        {/* Quick Tips Tab */}
        <TabsContent value="quicktips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Quick Tips & Shortcuts
              </CardTitle>
              <CardDescription>
                Time-saving tips to help you work faster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                    <div className="text-primary">{tip.icon}</div>
                    <p className="text-sm">{tip.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Video size={16} className="text-primary" />
                  Coming Soon:
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Video tutorials and interactive walkthroughs will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab - Updated Hours */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Contact Support
              </CardTitle>
              <CardDescription>
                We're here to help! Reach out to our support team for assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                  <Mail size={24} className="text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Email Support</p>
                    <p className="text-sm text-primary font-mono">finiteelementdesignsltd@gmail.com</p>
                    <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                  <Phone size={24} className="text-primary" />
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
                  <li>✓ Review the User Guides for step-by-step instructions</li>
                  <li>✓ Ensure you're logged in with the correct account</li>
                  <li>✓ Try loading sample data to test functionality</li>
                  <li>✓ Clear filters if reports aren't showing data</li>
                  <li>✓ Have your project details and any error messages ready</li>
                  <li>✓ Take screenshots of any issues you're experiencing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                About BOCHABERI Construction Suite
              </CardTitle>
              <CardDescription>
                Version 2.1.0 | Enterprise Construction Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                BOCHABERI Construction Suite is a comprehensive construction management system designed specifically for 
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