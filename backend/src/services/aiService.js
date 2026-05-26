const Groq = require('groq-sdk');
const { getDb } = require('../config/database');
const KnowledgeBase = require('./knowledgeBase');
const TrainingDataService = require('./trainingDataService');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIService {
  // ==================== COMPREHENSIVE SYNONYM MAPPINGS (OVER 200 WORDS) ====================
  
  static getRequestSynonyms() {
    return {
      // LIST/SHOW synonyms (60+ variations)
      list: [
        'list', 'show', 'show me', 'display', 'view', 'see', 'get', 'fetch', 'retrieve', 
        'give me', 'provide', 'let me see', 'i want to see', 'can i see', 'show all', 
        'list all', 'display all', 'view all', 'see all', 'outline', 'elaborate', 
        'detail', 'enumerate', 'present', 'reveal', 'tell me about', 'what are my', 
        'where are my', 'summarize', 'recap', 'brief me', 'walk me through', 
        'highlight', 'mention', 'enlist', 'catalog', 'index', 'itemize', 'specify',
        'lay out', 'set out', 'spell out', 'run down', 'give me a list of',
        'show me a list of', 'let me see all', 'i want to see all', 'share', 
        'expose', 'exhibit', 'illustrate', 'demonstrate', 'point out', 'bring up',
        'call attention to', 'make known', 'put forward', 'set forth'
      ],
      
      // COUNT/HOW MANY synonyms (40+ variations)
      count: [
        'count', 'how many', 'number of', 'total', 'quantity', 'amount of', 
        'what is the count', 'tell me the count', 'calculate', 'sum of', 
        'how much', 'how many do i have', 'what is the total number', 'total count',
        'aggregate', 'enumeration', 'tally', 'compute', 'figure out', 'give me the count',
        'what\'s the number', 'can you count', 'how many are there', 'sum total',
        'whole number', 'full count', 'entire amount', 'gross amount', 'net total',
        'running total', 'cumulative', 'overall count', 'complete tally'
      ],
      
      // STATUS synonyms (35+ variations)
      status: [
        'status', 'statuses', 'progress', 'state', 'condition', 'situation', 
        'how is', 'what is the status', 'update on', 'current status', 'latest status',
        'standing', 'position', 'phase', 'stage', 'milestone', 'where are we on',
        'how far along', 'what\'s happening with', 'any updates on', 'tell me the status',
        'current state', 'present condition', 'how goes', 'what\'s the word on',
        'give me an update', 'how is it going', 'where do we stand'
      ],
      
      // SUMMARY/OVERVIEW synonyms (40+ variations)
      summary: [
        'summary', 'overview', 'snapshot', 'recap', 'brief', 'report', 'dashboard', 
        'statistics', 'stats', 'analytics', 'aggregate', 'consolidated', 
        'executive summary', 'high-level view', 'birds eye view', 'at a glance',
        'recapitulation', 'synopsis', 'abstract', 'rundown', 'wrap-up', 'recap of',
        'give me the big picture', 'what\'s the situation', 'how are things',
        'general view', 'broad view', 'comprehensive view', 'global view',
        'helicopter view', 'top-level view', 'condensed version', 'digest'
      ],
      
      // DETAILS synonyms (30+ variations)
      details: [
        'details', 'detail', 'information', 'info', 'specifics', 'particulars', 
        'breakdown', 'full details', 'more info', 'describe', 'explain', 
        'tell me about', 'what about', 'elaborate on', 'expand on', 'go into detail',
        'in depth', 'comprehensive', 'thorough', 'specific information about',
        'particulars about', 'specifics about', 'lowdown on', 'ins and outs',
        'nitty gritty', 'specific data', 'detailed info'
      ],
      
      // SEARCH/FIND synonyms (25+ variations)
      search: [
        'search', 'find', 'look for', 'locate', 'where is', 'find me', 'search for', 
        'which', 'what about', 'identify', 'track down', 'seek', 'hunt for',
        'discover', 'uncover', 'pinpoint', 'determine the location of',
        'where can i find', 'help me find', 'i need to find', 'can you locate'
      ],
      
      // ACTIVE synonyms (15+ variations)
      active: [
        'active', 'current', 'ongoing', 'in progress', 'live', 'running', 'working',
        'not completed', 'open', 'underway', 'operational', 'functioning', 'alive',
        'in motion', 'in operation', 'in effect', 'in force'
      ],
      
      // COMPLETED synonyms (15+ variations)
      completed: [
        'completed', 'done', 'finished', 'closed', 'finalized', 'over', 'complete',
        'concluded', 'wrapped up', 'settled', 'accomplished', 'achieved', 'fulfilled',
        'finalised', 'terminated', 'ended', 'resolved'
      ],
      
      // PENDING synonyms (15+ variations)
      pending: [
        'pending', 'awaiting', 'waiting', 'not yet', 'outstanding', 'unresolved', 
        'to be done', 'in queue', 'on hold', 'delayed', 'unfinished', 'incomplete',
        'undecided', 'open', 'out for review', 'under review'
      ],
      
      // ==================== FINANCIAL TERMS (40+ variations) ====================
      financial: [
        'financial', 'finance', 'money', 'funds', 'cash flow', 'revenue', 'cost', 
        'expenditure', 'spending', 'financials', 'fiscal', 'monetary', 'pecuniary',
        'budgetary', 'economic', 'capital', 'banking', 'accounting', 'bookkeeping',
        'balance sheet', 'income statement', 'cash', 'currency', 'dollar', 'kes'
      ],
      
      income: [
        'income', 'revenue', 'earnings', 'receipts', 'inflow', 'money in', 
        'funds received', 'payments received', 'takings', 'proceeds', 'return',
        'profit', 'gain', 'yield', 'turnover', 'gross income', 'net income',
        'receivables', 'collection', 'payment received', 'credit', 'deposit'
      ],
      
      expenses: [
        'expenses', 'costs', 'expenditure', 'outflow', 'spending', 'money out', 
        'payments made', 'bills', 'overheads', 'outgoings', 'disbursements',
        'charges', 'fees', 'cost of sales', 'operating costs', 'fixed costs',
        'variable costs', 'direct costs', 'indirect costs', 'liabilities'
      ],
      
      profit: [
        'profit', 'earnings', 'gain', 'returns', 'net income', 'bottom line', 
        'surplus', 'p&l', 'profit and loss', 'net profit', 'gross profit',
        'operating profit', 'income after expenses', 'what i made', 'profitability',
        'margin', 'profit margin', 'net earnings', 'after-tax profit', 'retained earnings'
      ],
      
      budget: [
        'budget', 'budgeted', 'allocated', 'planned spending', 'financial plan',
        'cost estimate', 'financial allocation', 'appropriation', 'allowance'
      ],
      
      // ==================== PROJECT TERMS (25+ variations) ====================
      project: [
        'project', 'projects', 'job', 'jobs', 'site', 'sites', 'construction', 
        'contract', 'works', 'undertaking', 'endeavor', 'enterprise', 'initiative',
        'development', 'build', 'building', 'construction site', 'work site',
        'assignment', 'task', 'operation', 'campaign', 'venture', 'program'
      ],
      
      client: [
        'client', 'customer', 'client name', 'who is the client', 'client details',
        'property owner', 'developer', 'investor', 'stakeholder owner'
      ],
      
      location: [
        'location', 'site location', 'address', 'where is', 'place', 'area',
        'region', 'city', 'town', 'county', 'coordinates', 'site address'
      ],
      
      timeline: [
        'timeline', 'schedule', 'deadline', 'due date', 'completion date',
        'delivery date', 'timeframe', 'timetable', 'calendar', 'milestone dates'
      ],
      
      // ==================== WORKER TERMS (20+ variations) ====================
      worker: [
        'worker', 'workers', 'employee', 'employees', 'staff', 'personnel', 
        'laborer', 'labourer', 'team member', 'workforce', 'staff member',
        'crew', 'hand', 'operative', 'artisan', 'craftsman', 'tradesman',
        'journeyman', 'apprentice', 'helper', 'assistant', 'labor force'
      ],
      
      workerCategory: [
        'category', 'trade', 'profession', 'skill', 'specialty', 'craft',
        'job type', 'worker type', 'classification', 'designation'
      ],
      
      dayRate: [
        'day rate', 'daily rate', 'rate per day', 'wage', 'daily wage',
        'per diem', 'day salary', 'daily pay', 'rate'
      ],
      
      // ==================== SUPPLIER TERMS (15+ variations) ====================
      supplier: [
        'supplier', 'suppliers', 'vendor', 'vendors', 'provider', 'providers', 
        'seller', 'merchant', 'distributor', 'wholesaler', 'retailer', 'source',
        'supply chain partner', 'material supplier', 'equipment supplier'
      ],
      
      // ==================== SUBCONTRACTOR TERMS (15+ variations) ====================
      subcontractor: [
        'subcontractor', 'subcontractors', 'subbie', 'subbies', 'contractor', 
        'contractors', 'specialist', 'consultant', 'sub', 'sub-contractor',
        'third party', 'external contractor', 'hired help', 'agency worker',
        'independent contractor', 'freelancer', 'consulting firm'
      ],
      
      // ==================== INVENTORY TERMS (25+ variations) ====================
      inventory: [
        'inventory', 'stock', 'supplies', 'materials', 'items', 'products', 
        'goods', 'merchandise', 'assets', 'store items', 'warehouse items',
        'inventory items', 'stock items', 'material stock', 'stock on hand',
        'on-hand quantity', 'available stock', 'current stock', 'warehouse stock'
      ],
      
      lowStock: [
        'low stock', 'low inventory', 'running low', 'depleted', 'need restock', 
        'below reorder', 'critical stock', 'shortage', 'stockout', 'insufficient stock',
        'reorder needed', 'restock required', 'stock alert', 'inventory alert',
        'urgent restock', 'out of stock soon', 'low quantity alert'
      ],
      
      reorderLevel: [
        'reorder level', 'reorder point', 'minimum stock', 'trigger level',
        'replenishment point', 'order threshold', 'stock limit', 'minimum level'
      ],
      
      unit: [
        'unit', 'unit of measure', 'measurement', 'pieces', 'kilograms', 'tons',
        'bags', 'rolls', 'sheets', 'boxes', 'packets', 'liters', 'gallons'
      ],
      
      // ==================== DOCUMENT TERMS (15+ variations) ====================
      document: [
        'document', 'documents', 'file', 'files', 'paperwork', 'attachment', 
        'attachments', 'upload', 'uploads', 'folder', 'folder contents',
        'documentation', 'records', 'files and documents', 'digital files',
        'electronic documents', 'contracts', 'drawings', 'specifications'
      ],
      
      // ==================== MEETING TERMS (15+ variations) ====================
      meeting: [
        'meeting', 'meetings', 'minutes', 'session', 'gathering', 'conference', 
        'discussion', 'sync', 'standup', 'huddle', 'get-together', 'convention',
        'board meeting', 'project meeting', 'team meeting', 'client meeting',
        'progress meeting', 'status meeting', 'kickoff', 'review session'
      ],
      
      // ==================== SITE DIARY TERMS (15+ variations) ====================
      siteDiary: [
        'site diary', 'daily log', 'site log', 'daily report', 'site report', 
        'diary entry', 'site entry', 'field report', 'daily activity log',
        'construction log', 'site record', 'daily journal', 'site journal',
        'daily site record', 'site documentation', 'activity log'
      ],
      
      weather: [
        'weather', 'weather condition', 'temperature', 'rain', 'sunny', 'cloudy',
        'weather report', 'climate', 'forecast', 'conditions on site'
      ],
      
      // ==================== PAYROLL TERMS (15+ variations) ====================
      payroll: [
        'payroll', 'salary', 'wages', 'compensation', 'pay', 'payslip', 
        'remuneration', 'pay statement', 'wage bill', 'labor cost',
        'staff payment', 'employee payment', 'pay period', 'salary run',
        'payroll processing', 'payroll summary', 'worker payments'
      ],
      
      grossPay: [
        'gross pay', 'gross salary', 'total pay', 'base pay', 'basic salary',
        'pre-tax pay', 'gross earnings', 'total earnings'
      ],
      
      netPay: [
        'net pay', 'net salary', 'take home', 'after tax pay', 'net earnings',
        'final pay', 'disposable income'
      ],
      
      // ==================== PURCHASE ORDER TERMS (15+ variations) ====================
      purchaseOrder: [
        'purchase order', 'purchase orders', 'po', 'pos', 'order', 'orders', 
        'procurement order', 'buy order', 'purchasing order', 'supply order',
        'material order', 'equipment order', 'purchase request', 'purchase requisition',
        'procurement document', 'supplier order', 'stock order'
      ],
      
      orderStatus: [
        'order status', 'po status', 'delivery status', 'fulfillment status',
        'pending orders', 'approved orders', 'delivered orders', 'supplied'
      ],
      
      // ==================== SUBSCRIPTION TERMS (15+ variations) ====================
      subscription: [
        'subscription', 'plan', 'billing plan', 'package', 'tier', 'membership', 
        'service plan', 'pricing plan', 'payment plan', 'monthly plan',
        'annual plan', 'subscription plan', 'current plan', 'active plan',
        'subscription status', 'billing cycle', 'renewal', 'trial period'
      ],
      
      // ==================== BILLING TERMS (15+ variations) ====================
      billing: [
        'billing', 'invoice', 'invoices', 'payment', 'payments', 'transaction', 
        'transactions', 'receipt', 'bills', 'statements', 'account statement',
        'payment history', 'billing history', 'transaction history', 'financial history',
        'payment records', 'invoice records', 'billing records'
      ],
      
      // ==================== HELP / SUPPORT TERMS (15+ variations) ====================
      help: [
        'help', 'support', 'assistance', 'guide', 'tutorial', 'faq', 'how to', 
        'need help', 'contact support', 'customer support', 'help desk',
        'technical support', 'user guide', 'documentation', 'get help',
        'i need assistance', 'can you help', 'help me with'
      ],
      
      // ==================== LEGAL TERMS (15+ variations) ====================
      legal: [
        'legal', 'terms', 'privacy', 'policy', 'policies', 'terms of service', 
        'privacy policy', 'tos', 'legal terms', 'legal information',
        'terms and conditions', 'legal documents', 'compliance', 'regulations',
        'data protection', 'gdpr', 'legal agreement', 'disclaimer'
      ],
      
      // ==================== COMPANY INFO TERMS (15+ variations) ====================
      companyInfo: [
        'company', 'company info', 'company information', 'company profile', 
        'business info', 'business information', 'organization details',
        'firm details', 'enterprise info', 'my company', 'our company',
        'company details', 'business profile', 'organization profile'
      ],
      
      // ==================== TEAM TERMS (15+ variations) ====================
      team: [
        'team', 'team members', 'staff', 'employees', 'personnel', 'workforce',
        'colleagues', 'coworkers', 'staff members', 'human resources', 'hr',
        'people', 'crew', 'our team', 'company team', 'organization team'
      ],
      
      // ==================== VAT TERMS ====================
      vat: [
        'vat', 'tax', 'value added tax', 'sales tax', 'gst', 'consumption tax',
        'tax rate', 'vat rate', 'tax number', 'vat registration', 'tax ID'
      ],
      
      // ==================== CONTRACT TERMS ====================
      contract: [
        'contract', 'agreement', 'contract sum', 'contract value', 'contract amount',
        'agreed amount', 'fixed price', 'lump sum', 'contract price'
      ],
      
      // ==================== PROGRESS TERMS ====================
      progress: [
        'progress', 'percentage', 'completion', 'done percentage', 'how far along',
        'percent complete', 'execution rate', 'completion rate'
      ]
    };
  }
  
  static isRequestType(question, type) {
    const q = question.toLowerCase();
    const synonyms = this.getRequestSynonyms();
    return synonyms[type]?.some(word => q.includes(word)) || false;
  }
  
  static extractKeywords(question) {
    const q = question.toLowerCase();
    const keywords = [];
    const synonyms = this.getRequestSynonyms();
    for (const [type, words] of Object.entries(synonyms)) {
      for (const word of words) {
        if (q.includes(word)) {
          keywords.push({ type, matched: word });
          break;
        }
      }
    }
    return keywords;
  }

  static getProgressBar(progress) {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  static async answerGeneralQuestion(question, userId, companyId) {
    try {
      const dataAnswer = await this.getDataDrivenAnswer(question, companyId);
      if (dataAnswer) return dataAnswer;
      
      const knowledge = KnowledgeBase.getFormattedKnowledge(question);
      const similarQuestions = await TrainingDataService.getSimilarQuestions(question);
      
      const prompt = `You are an AI assistant for Bochi Construction Suite, a comprehensive construction management platform.

${knowledge ? `\n📚 KNOWLEDGE BASE INFORMATION:\n${knowledge}` : ''}
${similarQuestions?.length > 0 ? `\n📖 SIMILAR QUESTIONS ANSWERED BEFORE:\n${similarQuestions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}` : ''}

USER QUESTION: "${question}"

INSTRUCTIONS:
1. If knowledge base has relevant information, prioritize it
2. Be specific about Bochi modules and features (Projects, Income, Expenses, Payroll, Procurement, Stores, etc.)
3. Include step-by-step instructions when applicable
4. Keep answers concise (3-5 sentences)
5. If unsure, say so politely`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('General AI error:', error);
      return "I'm having trouble answering that right now. Please try again.";
    }
  }

  static async getDataDrivenAnswer(question, companyId) {
    const db = await getDb();
    const q = question.toLowerCase();
    
    console.log('🔍 AI Query:', question);
    console.log('🏢 Company ID:', companyId);
    
    try {
      // ==================== DETECT REQUEST TYPE ====================
      const isListRequest = this.isRequestType(question, 'list');
      const isCountRequest = this.isRequestType(question, 'count');
      const isStatusRequest = this.isRequestType(question, 'status');
      const isSummaryRequest = this.isRequestType(question, 'summary');
      const isDetailsRequest = this.isRequestType(question, 'details');
      const isLowStockRequest = this.isRequestType(question, 'lowStock');
      const isHelpRequest = this.isRequestType(question, 'help');
      const isLegalRequest = this.isRequestType(question, 'legal');
      const isCompanyInfoRequest = this.isRequestType(question, 'companyInfo');
      const isTeamRequest = this.isRequestType(question, 'team');
      const isProjectRequest = this.isRequestType(question, 'project');
      const isIncomeRequest = this.isRequestType(question, 'income');
      const isExpenseRequest = this.isRequestType(question, 'expenses');
      const isWorkerRequest = this.isRequestType(question, 'worker');
      const isSupplierRequest = this.isRequestType(question, 'supplier');
      const isSubcontractorRequest = this.isRequestType(question, 'subcontractor');
      const isInventoryRequest = this.isRequestType(question, 'inventory');
      const isSubscriptionRequest = this.isRequestType(question, 'subscription');
      const isBillingRequest = this.isRequestType(question, 'billing');
      const isSiteDiaryRequest = this.isRequestType(question, 'siteDiary');
      const isMeetingRequest = this.isRequestType(question, 'meeting');
      const isDocumentRequest = this.isRequestType(question, 'document');
      const isPayrollRequest = this.isRequestType(question, 'payroll');
      const isPurchaseOrderRequest = this.isRequestType(question, 'purchaseOrder');
      const isProfitRequest = this.isRequestType(question, 'profit');
      const isVatRequest = this.isRequestType(question, 'vat');
      
      // ==================== PROJECTS MODULE ====================
      if (isListRequest && isProjectRequest) {
        const projects = await db.query(
          `SELECT id, name, client, location, progress, status, contract_sum, start_date, end_date 
           FROM projects WHERE company_id = $1 ORDER BY created_at DESC LIMIT 20`,
          [companyId]
        );
        if (projects.rows.length === 0) {
          return "You don't have any projects yet. Click 'Add Project' in the Projects module to get started.";
        }
        let response = `📋 **Your Projects** (${projects.rows.length} total)\n\n`;
        projects.rows.forEach((p, i) => {
          const progressBar = this.getProgressBar(p.progress);
          response += `${i+1}. **${p.name}**\n`;
          response += `   ${progressBar} ${p.progress}%\n`;
          response += `   📍 Status: ${p.status} | Client: ${p.client}\n`;
          if (p.location) response += `   📍 Location: ${p.location}\n`;
          if (p.contract_sum) response += `   💰 Contract: KES ${p.contract_sum.toLocaleString()}\n`;
          if (p.start_date) response += `   📅 Start: ${new Date(p.start_date).toLocaleDateString()}\n`;
          if (p.end_date) response += `   📅 End: ${new Date(p.end_date).toLocaleDateString()}\n`;
          response += `\n`;
        });
        return response;
      }
      
      if (isCountRequest && isProjectRequest) {
        const projects = await db.query(
          `SELECT COUNT(*) as total,
                  COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                  COUNT(CASE WHEN progress = 100 THEN 1 END) as completed,
                  COUNT(CASE WHEN progress > 0 AND progress < 100 THEN 1 END) as in_progress
           FROM projects WHERE company_id = $1`,
          [companyId]
        );
        return `You have ${projects.rows[0].total} total projects. ${projects.rows[0].active} are active, ${projects.rows[0].completed} are completed, and ${projects.rows[0].in_progress} are in progress.`;
      }
      
      if (isStatusRequest && isProjectRequest) {
        const projects = await db.query(
          `SELECT name, status, progress FROM projects WHERE company_id = $1 ORDER BY status`,
          [companyId]
        );
        if (projects.rows.length === 0) return "You don't have any projects yet.";
        const active = projects.rows.filter(p => p.status === 'Active');
        const completed = projects.rows.filter(p => p.progress === 100);
        const onHold = projects.rows.filter(p => p.status === 'On Hold');
        let response = `📊 **Project Statuses**\n\n`;
        if (active.length > 0) {
          response += `✅ **Active Projects (${active.length})**\n`;
          active.forEach(p => { response += `   • ${p.name} - ${p.progress}% complete\n`; });
          response += `\n`;
        }
        if (completed.length > 0) {
          response += `🏆 **Completed Projects (${completed.length})**\n`;
          completed.forEach(p => { response += `   • ${p.name}\n`; });
          response += `\n`;
        }
        if (onHold.length > 0) {
          response += `⏸️ **On Hold Projects (${onHold.length})**\n`;
          onHold.forEach(p => { response += `   • ${p.name}\n`; });
        }
        return response;
      }
      
      // ==================== INCOME MODULE ====================
      if ((isListRequest || isSummaryRequest) && isIncomeRequest) {
        const incomes = await db.query(
          `SELECT certificate_no, date, gross_amount, amount_received, payment_method, status
           FROM income WHERE company_id = $1 ORDER BY date DESC LIMIT 10`,
          [companyId]
        );
        const total = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        if (incomes.rows.length === 0) {
          return "You don't have any income records yet. Add income in the Income module.";
        }
        let response = `💰 **Income Records**\n📊 Total Income: KES ${total.rows[0].total.toLocaleString()}\n\n`;
        incomes.rows.forEach((i, idx) => {
          response += `${idx+1}. **Certificate: ${i.certificate_no || 'N/A'}**\n`;
          response += `   💰 Amount: KES ${i.gross_amount.toLocaleString()}\n`;
          response += `   💵 Received: KES ${i.amount_received.toLocaleString()}\n`;
          response += `   📅 Date: ${new Date(i.date).toLocaleDateString()}\n`;
          response += `   💳 Method: ${i.payment_method || 'N/A'}\n`;
          response += `   📋 Status: ${i.status}\n\n`;
        });
        return response;
      }
      
      if ((isCountRequest || this.isRequestType(question, 'total income')) && isIncomeRequest) {
        const total = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        return `Your total income is KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // ==================== EXPENSES MODULE ====================
      if ((isListRequest || isSummaryRequest) && isExpenseRequest) {
        const expenses = await db.query(
          `SELECT date, category, description, amount, status FROM expenses WHERE company_id = $1 ORDER BY date DESC LIMIT 10`,
          [companyId]
        );
        const total = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        if (expenses.rows.length === 0) {
          return "You don't have any expenses yet. Add expenses in the Expenses module.";
        }
        let response = `💸 **Expenses**\n📊 Total Expenses: KES ${total.rows[0].total.toLocaleString()}\n\n`;
        expenses.rows.forEach((e, idx) => {
          response += `${idx+1}. **${e.category}** - KES ${e.amount.toLocaleString()}\n`;
          response += `   📅 Date: ${new Date(e.date).toLocaleDateString()}\n`;
          if (e.description) response += `   📝 ${e.description.substring(0, 50)}...\n`;
          response += `   📋 Status: ${e.status}\n\n`;
        });
        return response;
      }
      
      if ((isCountRequest || this.isRequestType(question, 'total expense')) && isExpenseRequest) {
        const total = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        return `Your total expenses are KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // ==================== PROFIT ====================
      if (isProfitRequest) {
        const income = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        const expenses = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        const profit = income.rows[0].total - expenses.rows[0].total;
        const margin = income.rows[0].total > 0 ? (profit / income.rows[0].total * 100).toFixed(1) : 0;
        let response = `📊 **Profit & Loss Summary**\n\n`;
        response += `💰 Total Income: KES ${income.rows[0].total.toLocaleString()}\n`;
        response += `💸 Total Expenses: KES ${expenses.rows[0].total.toLocaleString()}\n`;
        response += `📈 **Net Profit: KES ${profit.toLocaleString()}**\n`;
        response += `📊 Profit Margin: ${margin}%\n\n`;
        if (profit > 0) {
          response += `✅ Your business is profitable! Keep up the good work.`;
        } else if (profit < 0) {
          response += `⚠️ Your business is operating at a loss. Consider reviewing expenses and increasing revenue.`;
        } else {
          response += `📊 Your income and expenses are balanced. Focus on growing revenue.`;
        }
        return response;
      }


 // ==================== GANTT CHART / TASKS MODULE ==================== 
      const isTaskRequest = q.includes('task') || q.includes('gantt') || q.includes('timeline') || q.includes('schedule') || q.includes('milestone');
      
      if (isTaskRequest && isListRequest) {
        const tasks = await db.query(
          `SELECT id, name, start_date, end_date, progress, status, parent_id, is_milestone
           FROM project_gantt_tasks 
           WHERE project_id IN (SELECT id FROM projects WHERE company_id = $1)
           ORDER BY start_date ASC LIMIT 30`,
          [companyId]
        );
        
        if (tasks.rows.length === 0) {
          return "You don't have any tasks yet. Add tasks to the Gantt chart in your projects.";
        }
        
        const overdueTasks = tasks.rows.filter(t => new Date(t.end_date) < new Date() && t.status !== 'completed');
        const completedTasks = tasks.rows.filter(t => t.status === 'completed');
        const milestones = tasks.rows.filter(t => t.is_milestone === 1);
        
        let response = `📊 **Tasks & Gantt Summary**\n\n`;
        response += `📋 Total Tasks: ${tasks.rows.length}\n`;
        response += `✅ Completed: ${completedTasks.length}\n`;
        response += `⚠️ Overdue: ${overdueTasks.length}\n`;
        response += `🏆 Milestones: ${milestones.length}\n\n`;
        response += `📅 **Upcoming Tasks (Next 7 days)**\n`;
        
        const upcomingTasks = tasks.rows.filter(t => {
          const endDate = new Date(t.end_date);
          const now = new Date();
          const daysDiff = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7 && daysDiff >= 0 && t.status !== 'completed';
        }).slice(0, 5);
        
        if (upcomingTasks.length > 0) {
          upcomingTasks.forEach(task => {
            response += `   • ${task.name} - Due: ${new Date(task.end_date).toLocaleDateString()}\n`;
          });
        } else {
          response += `   • No upcoming tasks in the next 7 days\n`;
        }
        
        if (overdueTasks.length > 0) {
          response += `\n⚠️ **Overdue Tasks**\n`;
          overdueTasks.slice(0, 3).forEach(task => {
            response += `   • ${task.name} - Was due: ${new Date(task.end_date).toLocaleDateString()}\n`;
          });
        }
        return response;
      }
      
      if (isCountRequest && isTaskRequest) {
        const tasks = await db.query(
          `SELECT 
             COUNT(*) as total,
             COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
             COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
             COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started,
             COUNT(CASE WHEN status != 'completed' AND end_date < CURRENT_DATE THEN 1 END) as overdue
           FROM project_gantt_tasks 
           WHERE project_id IN (SELECT id FROM projects WHERE company_id = $1)`,
          [companyId]
        );
        return `📊 Task Summary: ${tasks.rows[0].total} total tasks, ${tasks.rows[0].completed} completed, ${tasks.rows[0].in_progress} in progress, ${tasks.rows[0].overdue} overdue.`;
      }



      
      // ==================== WORKERS MODULE ====================
      if ((isListRequest || isDetailsRequest) && isWorkerRequest) {
        const workers = await db.query(
          `SELECT w.name, w.phone, w.day_rate, wc.name as category
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1 AND w.is_active = 1
           ORDER BY w.name LIMIT 30`,
          [companyId]
        );
        if (workers.rows.length === 0) {
          return "You don't have any workers yet. Add workers in the Workers module.";
        }
        let response = `👥 **Your Workers** (${workers.rows.length} active)\n\n`;
        workers.rows.slice(0, 15).forEach((w, i) => {
          response += `${i+1}. **${w.name}**\n`;
          response += `   📞 Phone: ${w.phone || 'N/A'}\n`;
          response += `   💰 Day Rate: KES ${w.day_rate.toLocaleString()}\n`;
          response += `   📋 Category: ${w.category}\n\n`;
        });
        if (workers.rows.length > 15) {
          response += `... and ${workers.rows.length - 15} more workers.\n`;
        }
        return response;
      }
      
      if (isCountRequest && isWorkerRequest) {
        const workers = await db.query(
          `SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        const byCategory = await db.query(
          `SELECT wc.name as category, COUNT(*) as count
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1 AND w.is_active = 1
           GROUP BY wc.name`,
          [companyId]
        );
        let response = `👥 You have ${workers.rows[0].count} active workers.`;
        if (byCategory.rows.length > 0) {
          response += `\n\n📊 **By Category:**\n`;
          byCategory.rows.forEach(cat => {
            response += `   • ${cat.category}: ${cat.count} workers\n`;
          });
        }
        return response;
      }
      
      // ==================== PAYROLL MODULE ====================
      if (isPayrollRequest) {
        const payroll = await db.query(
          `SELECT COUNT(*) as count, COALESCE(SUM(total_gross_pay), 0) as total,
                  COALESCE(AVG(total_gross_pay), 0) as average
           FROM payroll_records WHERE company_id = $1`,
          [companyId]
        );
        if (payroll.rows[0].count === 0) {
          return "You haven't processed any payroll records yet. Go to the Payroll module to process payroll for your workers.";
        }
        let response = `💳 **Payroll Summary**\n\n`;
        response += `📊 Total Pay Periods: ${payroll.rows[0].count}\n`;
        response += `💰 Total Gross Pay: KES ${payroll.rows[0].total.toLocaleString()}\n`;
        response += `📈 Average per Period: KES ${payroll.rows[0].average.toLocaleString()}\n`;
        return response;
      }
      
      // ==================== PURCHASE ORDERS ====================
      if (isPurchaseOrderRequest) {
        const orders = await db.query(
          `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                  COUNT(CASE WHEN status = 'supplied' THEN 1 END) as supplied
           FROM purchase_orders WHERE company_id = $1`,
          [companyId]
        );
        if (orders.rows[0].count === 0) {
          return "You don't have any purchase orders yet. Create one in the Procurement module.";
        }
        let response = `📦 **Purchase Orders Summary**\n\n`;
        response += `📊 Total Orders: ${orders.rows[0].count}\n`;
        response += `💰 Total Value: KES ${orders.rows[0].total.toLocaleString()}\n`;
        if (orders.rows[0].pending > 0) response += `⏳ Pending: ${orders.rows[0].pending}\n`;
        if (orders.rows[0].supplied > 0) response += `✅ Supplied: ${orders.rows[0].supplied}`;
        return response;
      }
      
      // ==================== SUPPLIERS MODULE ====================
      if ((isListRequest || isDetailsRequest) && isSupplierRequest) {
        const suppliers = await db.query(
          `SELECT name, phone, email, kra_pin, payment_terms, contact_person
           FROM suppliers WHERE company_id = $1 AND is_active = 1 ORDER BY name LIMIT 20`,
          [companyId]
        );
        if (suppliers.rows.length === 0) {
          return "You don't have any suppliers yet. Add suppliers in the Procurement module.";
        }
        let response = `📋 **Your Suppliers** (${suppliers.rows.length} total)\n\n`;
        suppliers.rows.forEach((s, i) => {
          response += `${i+1}. **${s.name}**\n`;
          if (s.contact_person) response += `   👤 Contact: ${s.contact_person}\n`;
          if (s.phone) response += `   📞 Phone: ${s.phone}\n`;
          if (s.email) response += `   📧 Email: ${s.email}\n`;
          if (s.kra_pin) response += `   🆔 KRA PIN: ${s.kra_pin}\n`;
          if (s.payment_terms) response += `   📅 Terms: ${s.payment_terms}\n\n`;
        });
        return response;
      }
      
      // ==================== SUBCONTRACTORS MODULE ====================
      if ((isListRequest || isDetailsRequest) && isSubcontractorRequest) {
        const subs = await db.query(
          `SELECT name, phone, email, specialization, contact_person
           FROM subcontractors WHERE company_id = $1 AND is_active = 1 ORDER BY name LIMIT 20`,
          [companyId]
        );
        if (subs.rows.length === 0) {
          return "You don't have any subcontractors yet. Add subcontractors in the Subcontractors module.";
        }
        let response = `🔧 **Your Subcontractors** (${subs.rows.length} total)\n\n`;
        subs.rows.forEach((s, i) => {
          response += `${i+1}. **${s.name}**\n`;
          if (s.specialization) response += `   🔧 Specialization: ${s.specialization}\n`;
          if (s.contact_person) response += `   👤 Contact: ${s.contact_person}\n`;
          if (s.phone) response += `   📞 Phone: ${s.phone}\n`;
          if (s.email) response += `   📧 Email: ${s.email}\n\n`;
        });
        return response;
      }
      
      // ==================== INVENTORY / STORES MODULE ====================
      if ((isListRequest || isSummaryRequest) && isInventoryRequest) {
        const supplies = await db.query(
          `SELECT id, name, unit, current_stock, reorder_level, unit_price
           FROM supplies WHERE company_id = $1 AND is_active = 1 ORDER BY name LIMIT 30`,
          [companyId]
        );
        if (supplies.rows.length === 0) {
          return "You don't have any supplies added yet. Add items in the Stores module to track inventory.";
        }
        const lowStockItems = supplies.rows.filter(s => s.current_stock < s.reorder_level);
        const totalValue = supplies.rows.reduce((sum, s) => sum + ((s.current_stock || 0) * (s.unit_price || 0)), 0);
        let response = `🏪 **Inventory Summary**\n\n`;
        response += `📦 Total Items: ${supplies.rows.length}\n`;
        response += `💰 Total Inventory Value: KES ${totalValue.toLocaleString()}\n`;
        response += `⚠️ Low Stock Items: ${lowStockItems.length}\n\n`;
        supplies.rows.slice(0, 15).forEach((item, i) => {
          const stockStatus = item.current_stock < item.reorder_level ? '⚠️ LOW' : '✅';
          response += `${i+1}. **${item.name}**\n`;
          response += `   📦 Stock: ${item.current_stock} ${item.unit} ${stockStatus}\n`;
          if (item.unit_price) response += `   💰 Unit Price: KES ${item.unit_price.toLocaleString()}\n\n`;
        });
        if (lowStockItems.length > 0) {
          response += `\n⚠️ **Low Stock Alert:**\n`;
          lowStockItems.slice(0, 5).forEach(item => {
            const needed = item.reorder_level - item.current_stock;
            response += `   • ${item.name}: Need ${needed} more ${item.unit}\n`;
          });
        }
        return response;
      }
      
      if (isLowStockRequest) {
        const lowStock = await db.query(
          `SELECT name, current_stock, reorder_level, unit, unit_price
           FROM supplies WHERE company_id = $1 AND is_active = 1 AND current_stock < reorder_level
           ORDER BY (reorder_level - current_stock) DESC`,
          [companyId]
        );
        if (lowStock.rows.length === 0) {
          return "✅ All inventory items are at or above reorder levels. No low stock items found.";
        }
        let response = `⚠️ **Low Stock Alert** (${lowStock.rows.length} items need attention)\n\n`;
        lowStock.rows.forEach((item, i) => {
          const needed = item.reorder_level - item.current_stock;
          response += `${i+1}. **${item.name}**\n`;
          response += `   📦 Current Stock: ${item.current_stock} ${item.unit}\n`;
          response += `   📊 Reorder Level: ${item.reorder_level} ${item.unit}\n`;
          response += `   🔄 Recommended Order: ${needed} ${item.unit}\n`;
          if (item.unit_price) response += `   💰 Estimated Cost: KES ${(needed * item.unit_price).toLocaleString()}\n\n`;
        });
        return response;
      }


// ==================== STORE TRANSACTIONS / STOCK MOVEMENT ====================  // ← ADD THIS LINE AND EVERYTHING BELOW
      if ((q.includes('transaction') || q.includes('stock movement') || q.includes('incoming') || q.includes('outgoing')) && isInventoryRequest) {
        const transactions = await db.query(
          `SELECT st.id, st.date, st.type, st.quantity, st.notes, s.name as item_name, s.unit
           FROM store_transactions st
           JOIN supplies s ON st.supply_id = s.id
           WHERE s.company_id = $1
           ORDER BY st.date DESC
           LIMIT 20`,
          [companyId]
        );
        
        if (transactions.rows.length === 0) {
          return "No store transactions recorded yet. Add incoming/outgoing stock movements in the Stores module.";
        }
        
        const totalIncoming = transactions.rows.filter(t => t.type === 'incoming').reduce((sum, t) => sum + t.quantity, 0);
        const totalOutgoing = transactions.rows.filter(t => t.type === 'outgoing').reduce((sum, t) => sum + t.quantity, 0);
        
        let response = `📦 **Store Transactions**\n\n`;
        response += `📊 Incoming: ${totalIncoming} units\n`;
        response += `📤 Outgoing: ${totalOutgoing} units\n\n`;
        response += `📋 **Recent Transactions**\n`;
        
        transactions.rows.slice(0, 10).forEach(t => {
          const arrow = t.type === 'incoming' ? '⬇️ IN' : '⬆️ OUT';
          response += `   • ${arrow} ${t.quantity} ${t.unit} - ${t.item_name}\n`;
          response += `     📅 ${new Date(t.date).toLocaleDateString()}\n`;
          if (t.notes) response += `     📝 ${t.notes.substring(0, 50)}\n`;
        });
        return response;
      }
      
      // Inventory by category
      if ((q.includes('category') || q.includes('group by')) && isInventoryRequest && isSummaryRequest) {
        const suppliesByCategory = await db.query(
          `SELECT category, COUNT(*) as count, COALESCE(SUM(current_stock), 0) as total_stock,
                  COALESCE(SUM(current_stock * unit_price), 0) as total_value
           FROM supplies 
           WHERE company_id = $1 AND is_active = 1
           GROUP BY category
           ORDER BY total_value DESC`,
          [companyId]
        );
        
        if (suppliesByCategory.rows.length === 0) {
          return "No supplies categorized yet. Add categories to your inventory items.";
        }
        
        let response = `🏪 **Inventory by Category**\n\n`;
        suppliesByCategory.rows.forEach(cat => {
          response += `📂 **${cat.category || 'Uncategorized'}**\n`;
          response += `   • Items: ${cat.count}\n`;
          response += `   • Total Stock: ${cat.total_stock} units\n`;
          response += `   • Total Value: KES ${parseFloat(cat.total_value).toLocaleString()}\n\n`;
        });
        return response;
      }





      
      // ==================== SUBSCRIPTION MODULE ====================
      if (isSubscriptionRequest) {
        const sub = await db.query(
          `SELECT sp.name as plan_name, sp.price_monthly_kes, sp.max_projects, sp.max_users,
                  cs.status, cs.start_date, cs.end_date, cs.is_trial
           FROM company_subscriptions cs
           JOIN subscription_plans sp ON cs.plan_id = sp.id
           WHERE cs.company_id = $1 AND cs.status = 'active'
           ORDER BY cs.created_at DESC LIMIT 1`,
          [companyId]
        );
        if (sub.rows.length === 0) {
          return "No active subscription found. Please contact sales@bochi.ke to subscribe.";
        }
        const s = sub.rows[0];
        const daysLeft = Math.ceil((new Date(s.end_date) - new Date()) / (1000 * 60 * 60 * 24));
        let response = `💳 **Subscription Details**\n\n`;
        response += `📛 Plan: **${s.plan_name}**`;
        if (s.is_trial) response += ` (Trial Active)`;
        response += `\n💰 Monthly: KES ${s.price_monthly_kes?.toLocaleString()}\n`;
        response += `📊 Status: ${s.status}\n`;
        response += `📅 Renews: ${new Date(s.end_date).toLocaleDateString()} (${daysLeft} days remaining)\n\n`;
        response += `📦 **Plan Limits:**\n`;
        response += `   • Max Projects: ${s.max_projects}\n`;
        response += `   • Max Users: ${s.max_users}\n`;
        return response;
      }
      
      // ==================== BILLING / PAYMENTS ====================
      if (isBillingRequest) {
        const payments = await db.query(
          `SELECT amount, payment_method, status, payment_date
           FROM subscription_payments WHERE company_id = $1 
           ORDER BY created_at DESC LIMIT 5`,
          [companyId]
        );
        if (payments.rows.length === 0) {
          const recentIncome = await db.query(
            `SELECT certificate_no, gross_amount, payment_method, payment_date
             FROM income WHERE company_id = $1 AND status = 'Paid'
             ORDER BY payment_date DESC LIMIT 5`,
            [companyId]
          );
          if (recentIncome.rows.length === 0) {
            return "No billing or payment records found. Your subscription may be on trial.";
          }
          let response = `💳 **Recent Payments / Income**\n\n`;
          recentIncome.forEach((p, i) => {
            response += `${i+1}. **${p.certificate_no || 'Payment'}**\n`;
            response += `   💰 Amount: KES ${p.gross_amount.toLocaleString()}\n`;
            response += `   💳 Method: ${p.payment_method || 'N/A'}\n`;
            response += `   📅 Date: ${new Date(p.payment_date).toLocaleDateString()}\n\n`;
          });
          return response;
        }
        let response = `💳 **Recent Billing History**\n\n`;
        payments.forEach((p, i) => {
          response += `${i+1}. **KES ${p.amount?.toLocaleString()}**\n`;
          response += `   💳 Method: ${p.payment_method || 'N/A'}\n`;
          response += `   📋 Status: ${p.status}\n`;
          response += `   📅 Date: ${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Pending'}\n\n`;
        });
        return response;
      }
      
      // ==================== COMPANY SETTINGS / PROFILE ====================
      if (isCompanyInfoRequest) {
        const settings = await db.query(
          `SELECT name, email, phone, address, kra_pin, vat_rate, vat_registration_number, website, currency
           FROM company_settings WHERE company_id = $1`,
          [companyId]
        );
        if (settings.rows.length === 0 || !settings.rows[0].name) {
          return "Company settings not found. Please update your company profile in the Settings module.";
        }
        const c = settings.rows[0];
        let response = `🏢 **Company Profile**\n\n`;
        response += `📛 Name: ${c.name}\n`;
        response += `📧 Email: ${c.email || 'Not set'}\n`;
        response += `📞 Phone: ${c.phone || 'Not set'}\n`;
        response += `📍 Address: ${c.address || 'Not set'}\n`;
        response += `🆔 KRA PIN: ${c.kra_pin || 'Not set'}\n`;
        response += `📊 VAT Rate: ${c.vat_rate || 0}%\n`;
        response += `🆓 VAT Registration: ${c.vat_registration_number || 'Not set'}\n`;
        response += `💱 Currency: ${c.currency || 'KES'}\n`;
        if (c.website) response += `🌐 Website: ${c.website}\n`;
        return response;
      }
      
      // VAT INFORMATION
      if (isVatRequest) {
        const vat = await db.query(
          `SELECT vat_rate, vat_registration_number FROM company_settings WHERE company_id = $1`,
          [companyId]
        );
        if (vat.rows.length === 0 || !vat.rows[0].vat_rate) {
          return "VAT settings not configured. Update your VAT information in Settings → Company Settings.";
        }
        return `📊 **VAT Information**\n\n💰 VAT Rate: ${vat.rows[0].vat_rate}%\n🆔 VAT Registration Number: ${vat.rows[0].vat_registration_number || 'Not registered'}\n\n💡 VAT is automatically calculated on invoices and expenses based on this rate.`;
      }
      
      // ==================== SITE DIARY MODULE ====================
      if (isSiteDiaryRequest) {
        const entries = await db.query(
          `SELECT date, summary, weather, total_workers, activities, status
           FROM site_diary_entries WHERE company_id = $1 ORDER BY date DESC LIMIT 7`,
          [companyId]
        );
        if (entries.rows.length === 0) {
          return "No site diary entries yet. Add daily entries in the Site Diary module to track site activities.";
        }
        let response = `📔 **Recent Site Diary Entries**\n\n`;
        entries.rows.forEach((e, i) => {
          response += `${i+1}. **${new Date(e.date).toLocaleDateString()}**\n`;
          if (e.weather) response += `   ☁️ Weather: ${e.weather}\n`;
          if (e.total_workers) response += `   👥 Workers: ${e.total_workers}\n`;
          if (e.status) response += `   📋 Status: ${e.status}\n`;
          if (e.summary) response += `   📝 ${e.summary.substring(0, 100)}...\n\n`;
        });
        return response;
      }
      
      // ==================== MEETINGS MODULE ====================
      if (isMeetingRequest) {
        const meetings = await db.query(
          `SELECT m.title, m.meeting_date, m.location, p.name as project_name
           FROM meeting_minutes m
           JOIN projects p ON m.project_id = p.id
           WHERE p.company_id = $1
           ORDER BY m.meeting_date DESC LIMIT 5`,
          [companyId]
        );
        if (meetings.rows.length === 0) {
          return "No meeting minutes recorded yet. Add meeting minutes in the Meetings module.";
        }
        let response = `📅 **Recent Meetings**\n\n`;
        meetings.rows.forEach((m, i) => {
          response += `${i+1}. **${m.title}**\n`;
          response += `   📅 Date: ${new Date(m.meeting_date).toLocaleDateString()}\n`;
          response += `   📋 Project: ${m.project_name}\n`;
          if (m.location) response += `   📍 Location: ${m.location}\n\n`;
        });
        return response;
      }



// ==================== MEETING ACTION ITEMS / TASKS ====================  // ← ADD THIS LINE AND EVERYTHING BELOW
      if ((isTaskRequest || q.includes('action item') || q.includes('action items')) && isListRequest) {
        const actionItems = await db.query(
          `SELECT m.title as meeting_title, m.meeting_date, 
                  COALESCE(ai->>'task', ai->>'description', '') as task,
                  COALESCE(ai->>'assigned_to', '') as assigned_to,
                  COALESCE(ai->>'due_date', '') as due_date,
                  COALESCE(ai->>'status', 'pending') as status
           FROM meeting_minutes m,
           JSONB_ARRAY_ELEMENTS(m.action_items) AS ai
           WHERE m.project_id IN (SELECT id FROM projects WHERE company_id = $1)
           ORDER BY (ai->>'due_date')::date ASC
           LIMIT 20`,
          [companyId]
        );
        
        if (actionItems.rows.length === 0) {
          return "No action items found in meeting minutes. Add action items when creating meeting minutes.";
        }
        
        const pendingTasks = actionItems.rows.filter(t => t.status === 'pending' || t.status === 'in_progress');
        const overdueTasks = actionItems.rows.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed');
        
        let response = `📋 **Meeting Action Items**\n\n`;
        response += `📊 Total Action Items: ${actionItems.rows.length}\n`;
        response += `⏳ Pending: ${pendingTasks.length}\n`;
        response += `⚠️ Overdue: ${overdueTasks.length}\n\n`;
        
        if (pendingTasks.length > 0) {
          response += `⏰ **Pending Tasks (by due date)**\n`;
          pendingTasks.slice(0, 5).forEach((task, i) => {
            response += `${i+1}. **${task.task}**\n`;
            response += `   📅 Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}\n`;
            if (task.assigned_to) response += `   👤 Assigned to: ${task.assigned_to}\n`;
            response += `   📋 Meeting: ${task.meeting_title}\n\n`;
          });
        }
        return response;
      }
      
      // Upcoming tasks from action items
      if ((q.includes('upcoming') || q.includes('my tasks')) && (isTaskRequest || isMeetingRequest)) {
        const upcomingTasks = await db.query(
          `SELECT COALESCE(ai->>'task', ai->>'description', '') as task,
                  COALESCE(ai->>'due_date', '') as due_date,
                  COALESCE(ai->>'assigned_to', '') as assigned_to,
                  m.title as meeting_title
           FROM meeting_minutes m,
           JSONB_ARRAY_ELEMENTS(m.action_items) AS ai
           WHERE m.project_id IN (SELECT id FROM projects WHERE company_id = $1)
             AND (ai->>'status') IS DISTINCT FROM 'completed'
             AND (ai->>'due_date') IS NOT NULL
           ORDER BY (ai->>'due_date')::date ASC
           LIMIT 10`,
          [companyId]
        );
        
        if (upcomingTasks.rows.length === 0) {
          return "No upcoming tasks found in meeting action items.";
        }
        
        let response = `📅 **Upcoming Tasks from Meetings**\n\n`;
        upcomingTasks.rows.forEach((task, i) => {
          response += `${i+1}. **${task.task}**\n`;
          response += `   📅 Due: ${new Date(task.due_date).toLocaleDateString()}\n`;
          if (task.assigned_to) response += `   👤 Assigned to: ${task.assigned_to}\n`;
          response += `   📋 From: ${task.meeting_title}\n\n`;
        });
        return response;
      }


      
      // ==================== DOCUMENTS MODULE ====================
      if (isDocumentRequest) {
        const docs = await db.query(
          `SELECT COUNT(*) as count,
                  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent
           FROM project_documents WHERE company_id = $1`,
          [companyId]
        );
        if (docs.rows[0].count === 0) {
          return "No documents uploaded yet. Upload documents in the Documents module to organize project files.";
        }
        return `📄 **Document Summary**\n\n📊 Total Documents: ${docs.rows[0].count}\n📅 Uploaded in last 30 days: ${docs.rows[0].recent}\n\n💡 Documents can be organized by project and category for easy access.`;
      }
      
      // ==================== TEAM / USERS MODULE ====================
      if (isTeamRequest && isCountRequest) {
        const users = await db.query(
          `SELECT COUNT(*) as count,
                  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                  COUNT(CASE WHEN role = 'project_manager' THEN 1 END) as pms,
                  COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
           FROM users WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        let response = `👥 **Team Summary**\n\n`;
        response += `📊 Total Active Users: ${users.rows[0].count}\n`;
        response += `👑 Administrators: ${users.rows[0].admins}\n`;
        response += `📋 Project Managers: ${users.rows[0].pms}\n`;
        response += `👤 Regular Users: ${users.rows[0].regular_users}`;
        return response;
      }
      
      if ((isListRequest || isDetailsRequest) && isTeamRequest) {
        const users = await db.query(
          `SELECT name, email, role, is_active
           FROM users WHERE company_id = $1 AND is_active = 1
           ORDER BY role, name LIMIT 20`,
          [companyId]
        );
        if (users.rows.length === 0) {
          return "No active users found. Invite users from the Users module.";
        }
        let response = `👥 **Team Members** (${users.rows.length} active)\n\n`;
        users.rows.forEach((u, i) => {
          response += `${i+1}. **${u.name}**\n`;
          response += `   📧 ${u.email}\n`;
          response += `   👔 Role: ${u.role}\n\n`;
        });
        return response;
      }



 // ==================== STAKEHOLDER DASHBOARD ====================  // ← ADD THIS LINE AND EVERYTHING BELOW
      if (isTeamRequest && q.includes('stakeholder') && isSummaryRequest) {
        const stakeholderProjects = await db.query(
          `SELECT COUNT(*) as count,
                  COUNT(CASE WHEN status = 'Active' THEN 1 END) as active
           FROM project_stakeholders ps
           JOIN projects p ON ps.project_id = p.id
           WHERE ps.user_id = $1 AND ps.is_active = 1 AND ps.invite_status = 'accepted'`,
          [userId]
        );
        
        const recentDocuments = await db.query(
          `SELECT COUNT(*) as count FROM project_documents 
           WHERE project_id IN (SELECT project_id FROM project_stakeholders WHERE user_id = $1)
           AND created_at >= NOW() - INTERVAL '30 days'`,
          [userId]
        );
        
        return `📊 **Your Stakeholder Dashboard**\n\n📋 Projects: ${stakeholderProjects.rows[0].count} (${stakeholderProjects.rows[0].active} active)\n📄 New Documents (30 days): ${recentDocuments.rows[0].count}\n💡 Ask "show me my projects" for details.`;
      }


      
      // ==================== HELP / SUPPORT ====================
      if (isHelpRequest) {
        return `📞 **Bochi Support Center**\n\n📧 Email: support@bochi.ke\n📞 Phone: +254 772 041005\n🌐 Website: www.bochi.ke\n💬 Live Chat: Available in the Help module\n\n📚 **Resources:**\n   • FAQ section in Help module\n   • Video tutorials in Help module\n   • User documentation available on request\n\n⏰ Support Hours: Monday-Friday, 8 AM - 6 PM EAT`;
      }
      
      // ==================== LEGAL ====================
      if (isLegalRequest) {
        return `📜 **Legal Information**\n\n📋 Terms of Service: www.bochi.ke/terms\n🔒 Privacy Policy: www.bochi.ke/privacy\n⚖️ Data Processing Agreement: Available upon request\n\n📧 Legal Inquiries: legal@bochi.ke\n\n⚠️ For any legal concerns, please contact our legal team directly.`;
      }
      
      // ==================== DASHBOARD OVERVIEW ====================
      if (isSummaryRequest || q.includes('dashboard') || q.includes('overview') || q.includes('home')) {
        const projects = await db.query(`SELECT COUNT(*) as count FROM projects WHERE company_id = $1`, [companyId]);
        const activeProjects = await db.query(`SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND status = 'Active'`, [companyId]);
        const completedProjects = await db.query(`SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND progress = 100`, [companyId]);
        const income = await db.query(`SELECT COALESCE(SUM(gross_amount),0) as total FROM income WHERE company_id = $1`, [companyId]);
        const expenses = await db.query(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE company_id = $1`, [companyId]);
        const workers = await db.query(`SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`, [companyId]);
        const lowStock = await db.query(`SELECT COUNT(*) as count FROM supplies WHERE company_id = $1 AND is_active = 1 AND current_stock < reorder_level`, [companyId]);
        const purchaseOrders = await db.query(`SELECT COUNT(*) as count FROM purchase_orders WHERE company_id = $1`, [companyId]);
        const suppliers = await db.query(`SELECT COUNT(*) as count FROM suppliers WHERE company_id = $1 AND is_active = 1`, [companyId]);
        const subcontractors = await db.query(`SELECT COUNT(*) as count FROM subcontractors WHERE company_id = $1 AND is_active = 1`, [companyId]);
        const documents = await db.query(`SELECT COUNT(*) as count FROM project_documents WHERE company_id = $1`, [companyId]);
        const profit = income.rows[0].total - expenses.rows[0].total;
        const margin = income.rows[0].total > 0 ? (profit / income.rows[0].total * 100).toFixed(1) : 0;
        
        let response = `📊 **Dashboard Overview**\n\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `📋 **PROJECTS**\n`;
        response += `   • Total Projects: ${projects.rows[0].count}\n`;
        response += `   • Active Projects: ${activeProjects.rows[0].count}\n`;
        response += `   • Completed Projects: ${completedProjects.rows[0].count}\n\n`;
        response += `💰 **FINANCIAL**\n`;
        response += `   • Total Income: KES ${income.rows[0].total.toLocaleString()}\n`;
        response += `   • Total Expenses: KES ${expenses.rows[0].total.toLocaleString()}\n`;
        response += `   • Net Profit: KES ${profit.toLocaleString()}\n`;
        response += `   • Profit Margin: ${margin}%\n\n`;
        response += `👥 **WORKFORCE**\n`;
        response += `   • Active Workers: ${workers.rows[0].count}\n\n`;
        response += `🏪 **INVENTORY**\n`;
        response += `   • Low Stock Items: ${lowStock.rows[0].count}\n\n`;
        response += `📦 **PROCUREMENT**\n`;
        response += `   • Purchase Orders: ${purchaseOrders.rows[0].count}\n`;
        response += `   • Suppliers: ${suppliers.rows[0].count}\n`;
        response += `   • Subcontractors: ${subcontractors.rows[0].count}\n\n`;
        response += `📄 **DOCUMENTS**\n`;
        response += `   • Total Documents: ${documents.rows[0].count}\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (lowStock.rows[0].count > 0) {
          response += `⚠️ **ALERT:** ${lowStock.rows[0].count} items need restocking in Stores module.\n`;
        }
        if (profit < 0) {
          response += `⚠️ **ALERT:** Business is operating at a loss. Review expenses.\n`;
        }
        if (projects.rows[0].count === 0) {
          response += `💡 **TIP:** Create your first project in the Projects module.\n`;
        }
        if (workers.rows[0].count === 0) {
          response += `💡 **TIP:** Add workers in the Workers module to track labor.\n`;
        }
        return response;
      }
      
      // ==================== FALLBACK FOR UNRECOGNIZED QUERIES ====================
      if ((q.includes('worker') || q.includes('employee')) && !isWorkerRequest) {
        const workers = await db.query(`SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`, [companyId]);
        if (workers.rows[0].count > 0) {
          return `You have ${workers.rows[0].count} active workers. For more details, ask "list my workers" or "how many workers do I have".`;
        }
      }
      
      if ((q.includes('project') || q.includes('job')) && !isProjectRequest) {
        const projects = await db.query(`SELECT COUNT(*) as count FROM projects WHERE company_id = $1`, [companyId]);
        if (projects.rows[0].count > 0) {
          return `You have ${projects.rows[0].count} projects. To see details, ask "list my projects" or "show me project statuses".`;
        }
      }
      
      if ((q.includes('expense') || q.includes('cost') || q.includes('spent')) && !isExpenseRequest) {
        const expenses = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`, [companyId]);
        if (expenses.rows[0].total > 0) {
          return `Your total expenses are KES ${expenses.rows[0].total.toLocaleString()}. For breakdown, ask "list my expenses" or "expenses by category".`;
        }
      }
      
      if ((q.includes('income') || q.includes('revenue') || q.includes('earned')) && !isIncomeRequest) {
        const income = await db.query(`SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`, [companyId]);
        if (income.rows[0].total > 0) {
          return `Your total income is KES ${income.rows[0].total.toLocaleString()}. For details, ask "list my income records" or "show me income certificates".`;
        }
      }
      
      if ((q.includes('supply') || q.includes('stock') || q.includes('inventory')) && !isInventoryRequest) {
        const supplies = await db.query(`SELECT COUNT(*) as count FROM supplies WHERE company_id = $1 AND is_active = 1`, [companyId]);
        if (supplies.rows[0].count > 0) {
          return `You have ${supplies.rows[0].count} supply items in inventory. To see details, ask "list my inventory" or "show me low stock items".`;
        }
      }
      
      if ((q.includes('purchase') || q.includes('order') || q.includes('po')) && !isPurchaseOrderRequest) {
        const orders = await db.query(`SELECT COUNT(*) as count FROM purchase_orders WHERE company_id = $1`, [companyId]);
        if (orders.rows[0].count > 0) {
          return `You have ${orders.rows[0].count} purchase orders. For details, ask "list my purchase orders" or "show me PO summary".`;
        }
      }
      
      if ((q.includes('meeting') || q.includes('minutes')) && !isMeetingRequest) {
        const meetings = await db.query(
          `SELECT COUNT(*) as count FROM meeting_minutes m
           JOIN projects p ON m.project_id = p.id
           WHERE p.company_id = $1`,
          [companyId]
        );
        if (meetings.rows[0].count > 0) {
          return `You have ${meetings.rows[0].count} meeting minutes recorded. Ask "show me recent meetings" to see them.`;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Data fetch error:', error);
      return "I'm having trouble accessing your data right now. Please try again.";
    }
  }

  static async answerProjectQuestion(projectId, question, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      if (!context) return "Project not found.";
      
      const prompt = `PROJECT DATA:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 Name: ${context.name}\n🏢 Client: ${context.client || 'N/A'}\n📍 Location: ${context.location || 'N/A'}\n📊 Progress: ${context.progress}%\n💰 Contract: KES ${context.budget?.toLocaleString() || 'N/A'}\n💸 Spent: KES ${context.spent?.toLocaleString() || '0'}\n📅 Start: ${context.start_date || 'N/A'}\n📅 End: ${context.end_date || 'N/A'}\n🔄 Status: ${context.status || 'Active'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTASKS:\n• Total: ${context.total_tasks}\n• Completed: ${context.completed_tasks}\n• In Progress: ${context.in_progress_tasks}\n• Overdue: ${context.overdue_tasks}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUSER QUESTION: "${question}"\n\nAnswer based ONLY on the project data above. Be concise (2-4 sentences). Include specific numbers.`;
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Project AI error:', error);
      return "Having trouble accessing project data. Please try again.";
    }
  }
  
  static async answerStakeholderQuestion(projectId, question, userId) {
    try {
      const context = await this.getStakeholderProjectContext(projectId, userId);
      if (!context) return "Project not found.";
      
      const prompt = `PROJECT: ${context.name}\nProgress: ${context.progress}%\nTimeline: ${context.start_date || 'N/A'} to ${context.end_date || 'N/A'}\nTasks: ${context.completed_tasks}/${context.total_tasks} completed\nDocuments: ${context.document_count}\nMeetings: ${context.meeting_count}\n\nUSER QUESTION: "${question}"\n\nFocus ONLY on progress, timeline, documents, and meetings. DO NOT share financial details. Be positive and reassuring.`;
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Stakeholder AI error:', error);
      return "Having trouble accessing project information.";
    }
  }

  static async verifyStakeholderAccess(projectId, userId) {
    const db = await getDb();
    const result = await db.query(
      `SELECT 1 FROM project_stakeholders WHERE user_id = $1 AND project_id = $2 AND is_active = 1 AND invite_status = 'accepted'`,
      [userId, projectId]
    );
    return result.rows.length > 0;
  }

  static async getStakeholderProjectContext(projectId, userId) {
    const db = await getDb();
    const project = await db.query(
      `SELECT p.id, p.name, p.progress, p.start_date, p.end_date,
              COUNT(DISTINCT pg.id) as total_tasks,
              COUNT(DISTINCT CASE WHEN pg.status='completed' THEN pg.id END) as completed_tasks
       FROM projects p
       LEFT JOIN project_gantt_tasks pg ON p.id = pg.project_id
       WHERE p.id = $1 GROUP BY p.id`,
      [projectId]
    );
    if (project.rows.length === 0) return null;
    const docs = await db.query(`SELECT COUNT(*) as count FROM project_documents WHERE project_id = $1`, [projectId]);
    const meetings = await db.query(`SELECT COUNT(*) as count FROM meeting_minutes WHERE project_id = $1`, [projectId]);
    return {
      name: project.rows[0].name,
      progress: project.rows[0].progress || 0,
      start_date: project.rows[0].start_date,
      end_date: project.rows[0].end_date,
      total_tasks: parseInt(project.rows[0].total_tasks) || 0,
      completed_tasks: parseInt(project.rows[0].completed_tasks) || 0,
      document_count: parseInt(docs.rows[0]?.count) || 0,
      meeting_count: parseInt(meetings.rows[0]?.count) || 0
    };
  }
  
  static async getProjectContext(projectId, userId) {
    const db = await getDb();
    const project = await db.query(
      `SELECT p.id, p.name, p.client, p.location, p.progress, p.contract_sum as budget, p.status, p.start_date, p.end_date,
              COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = p.id),0) as spent
       FROM projects p WHERE p.id = $1`,
      [projectId]
    );
    if (project.rows.length === 0) return null;
    const tasks = await db.query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN status='completed' THEN 1 END) as completed,
              COUNT(CASE WHEN status='in_progress' THEN 1 END) as in_progress
       FROM project_gantt_tasks WHERE project_id = $1`,
      [projectId]
    );
    return {
      name: project.rows[0].name,
      client: project.rows[0].client,
      location: project.rows[0].location,
      progress: project.rows[0].progress || 0,
      budget: project.rows[0].budget,
      spent: parseFloat(project.rows[0].spent) || 0,
      status: project.rows[0].status,
      start_date: project.rows[0].start_date,
      end_date: project.rows[0].end_date,
      total_tasks: tasks.rows[0]?.total || 0,
      completed_tasks: tasks.rows[0]?.completed || 0,
      in_progress_tasks: tasks.rows[0]?.in_progress || 0
    };
  }
  
  static async generateProjectSummary(projectId, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      if (!context) return "Unable to generate summary: Project not found.";
      
      const prompt = `Based on this project data, write a brief executive summary (2-3 sentences):\n\nProject: ${context.name}\nProgress: ${context.progress}%\nBudget: KES ${context.budget?.toLocaleString()} (Spent: KES ${context.spent?.toLocaleString()})\nTasks: ${context.completed_tasks}/${context.total_tasks} completed\nOverdue Tasks: ${context.overdue_tasks}\n\nSummary:`;
      
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 150
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Unable to generate summary at this time.";
    }
  }
  
  static async submitFeedback(question, answer, isCorrect, userId) {
    return await TrainingDataService.saveTrainingExample(question, answer, isCorrect, userId);
  }
}

module.exports = AIService;