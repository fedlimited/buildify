class KnowledgeBase {
  // Complete knowledge about Bochi application
  static getApplicationKnowledge() {
    return {
      // 1. Module Overview
      modules: {
        dashboard: "Main overview showing key metrics, recent activities, project summaries, and financial snapshots.",
        projects: "Create, manage, and track construction projects. Features: project creation, status tracking, progress monitoring, budget management, client details.",
        income: "Record and manage all incoming revenue. Features: invoice generation, payment tracking, income categorization, receipt attachment.",
        expenses: "Track all project and company expenses. Features: expense categorization, receipt upload, approval workflows, vendor management.",
        payroll: "Manage worker salaries and payments. Features: worker time tracking, salary calculations, payslip generation, statutory deductions.",
        procurement: "Manage purchase orders and supplier relationships. Features: order creation, supplier management, delivery tracking, payment scheduling.",
        stores: "Inventory and supplies management. Features: stock tracking, reorder alerts, stock taking, item categorization.",
        sitediary: "Daily site activity logging. Features: weather tracking, worker attendance, material usage, daily summaries.",
        vat: "Tax management and reporting. Features: VAT calculations, tax submissions, report generation.",
        reports: "Comprehensive reporting system. Features: profit & loss, balance sheet, project summaries, financial statements.",
        settings: "System configuration. Features: company info, currency settings, tax rates, user preferences.",
        users: "User management. Features: role-based access, invitations, permissions management.",
        subcontractors: "Manage external contractors. Features: contract management, payment tracking, work verification.",
        invoices: "Customer invoicing. Features: invoice creation, payment tracking, reminders.",
        billing: "Subscription and billing management. Features: plan upgrades, payment history, invoice download."
      },
      
      // 2. Workflows
      workflows: {
        project_creation: "1. Go to Projects module → Click 'Add Project' → Fill in project name, client, location, dates → Set budget → Click Create. Note: Complete subcontractors, suppliers, workers setup FIRST.",
        invite_stakeholder: "1. Open a project → Click Stakeholders tab → Click 'Invite Stakeholder' → Enter email and name → Select role → Send invitation.",
        process_payroll: "1. Go to Payroll module → Select pay period → Review worker hours → Calculate → Generate payslips → Mark as paid.",
        add_income: "1. Go to Income module → Click 'Add Income' → Select project → Enter amount → Choose payment method → Add description → Save.",
        track_expense: "1. Go to Expenses module → Click 'Add Expense' → Select project/category → Enter amount → Attach receipt → Save.",
        generate_report: "1. Go to Reports module → Select report type → Choose date range → Click Generate → Export as PDF/Excel.",
        create_purchase_order: "1. Go to Procurement module → Click 'Create Order' → Select supplier → Add items → Set quantities/prices → Submit for approval."
      },
      
      // 3. Entity Relationships
      relationships: {
        "projects": "Links to: Income, Expenses, Tasks, Stakeholders, Documents, Meetings",
        "workers": "Links to: Payroll, Worker Categories, Attendance, Project Assignments",
        "subcontractors": "Links to: Projects, Payments, Contracts, Work Orders",
        "suppliers": "Links to: Purchase Orders, Procurements, Payments"
      },
      
      // 4. Common Issues & Solutions
      troubleshooting: {
        "Cannot create project": "Ensure you have set up: Subcontractors, Suppliers, Approved Items, Worker Categories, Workers first.",
        "Payroll calculation incorrect": "Check worker hourly rates, attendance records, and statutory deduction settings.",
        "Report not generating": "Verify date range is correct and data exists for selected period.",
        "Stakeholder not seeing project": "Check that invitation was accepted and stakeholder has 'accepted' status.",
        "Document not uploading": "Check file size (max 10MB) and supported formats (PDF, DOC, XLS, JPG, PNG)."
      },
      
      // 5. Key Features by Role
      roles: {
        super_admin: "Full system access, manage all companies, view all data, manage subscriptions.",
        admin: "Company-level admin, manage users, projects, view all company data.",
        project_manager: "Manage assigned projects, create tasks, track progress, manage team.",
        stakeholder: "View-only access to assigned projects, view documents, meetings, progress.",
        accountant: "Manage financial modules: Income, Expenses, Payroll, VAT, Reports."
      },
      
      // 6. Business Rules
      rules: {
        budget: "Project budget cannot be exceeded without approval.",
        approval_flow: "Purchase orders over KES 50,000 require manager approval.",
        payroll_deadline: "Payroll must be processed by 25th of each month.",
        vat_submission: "VAT returns due by 20th of following month."
      }
    };
  }
  
  // Search knowledge base for relevant information
  static searchKnowledge(question) {
    const knowledge = this.getApplicationKnowledge();
    const lowerQuestion = question.toLowerCase();
    const results = [];
    
    // Search in modules
    Object.entries(knowledge.modules).forEach(([module, description]) => {
      if (lowerQuestion.includes(module) || description.toLowerCase().includes(lowerQuestion)) {
        results.push({ type: 'module', name: module, content: description, relevance: 10 });
      }
    });
    
    // Search in workflows
    Object.entries(knowledge.workflows).forEach(([workflow, steps]) => {
      if (lowerQuestion.includes(workflow.replace('_', ' ')) || 
          lowerQuestion.includes('how to') && workflow.includes(lowerQuestion.split(' ')[0])) {
        results.push({ type: 'workflow', name: workflow, content: steps, relevance: 9 });
      }
    });
    
    // Search in troubleshooting
    Object.entries(knowledge.troubleshooting).forEach(([issue, solution]) => {
      if (lowerQuestion.includes(issue.toLowerCase()) || 
          lowerQuestion.includes('problem') || lowerQuestion.includes('error')) {
        results.push({ type: 'troubleshooting', name: issue, content: solution, relevance: 8 });
      }
    });
    
    // Search in roles
    Object.entries(knowledge.roles).forEach(([role, description]) => {
      if (lowerQuestion.includes(role) || lowerQuestion.includes('permission') || lowerQuestion.includes('access')) {
        results.push({ type: 'role', name: role, content: description, relevance: 7 });
      }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }
  
  // Get formatted knowledge for AI prompt
  static getFormattedKnowledge(question) {
    const searchResults = this.searchKnowledge(question);
    if (searchResults.length === 0) return null;
    
    let knowledgeText = "\n📚 KNOWLEDGE BASE INFORMATION:\n";
    searchResults.slice(0, 3).forEach(result => {
      knowledgeText += `\n【${result.type.toUpperCase()}】${result.name}:\n${result.content}\n`;
    });
    
    return knowledgeText;
  }
}

module.exports = KnowledgeBase;