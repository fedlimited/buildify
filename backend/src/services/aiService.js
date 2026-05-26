const Groq = require('groq-sdk');
const { getDb } = require('../config/database');
const KnowledgeBase = require('./knowledgeBase');
const TrainingDataService = require('./trainingDataService');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIService {
  // Helper function for progress bar
  static getProgressBar(progress) {
    const filled = Math.floor(progress / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  static async answerGeneralQuestion(question, userId, companyId) {
    try {
      const dataAnswer = await this.getDataDrivenAnswer(question, companyId);
      if (dataAnswer) {
        return dataAnswer;
      }
      
      const knowledge = KnowledgeBase.getFormattedKnowledge(question);
      const similarQuestions = await TrainingDataService.getSimilarQuestions(question);
      
      let prompt = `
You are an AI assistant for Bochi Construction Suite, a comprehensive construction management platform.

${knowledge ? `\n📚 KNOWLEDGE BASE INFORMATION:\n${knowledge}` : ''}

${similarQuestions && similarQuestions.length > 0 ? `\n📖 SIMILAR QUESTIONS ANSWERED BEFORE:\n${similarQuestions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}` : ''}

USER QUESTION: "${question}"

INSTRUCTIONS:
1. If knowledge base has relevant information, prioritize it
2. Be specific about Bochi modules and features
3. Include step-by-step instructions when applicable
4. Keep answers concise (3-5 sentences)
5. If unsure, say so politely
`;

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
      // ==================== PROJECTS MODULE ====================
      
      // LIST PROJECTS
      if ((q.includes('list') || q.includes('show me')) && (q.includes('project') || q.includes('projects')) && !q.includes('how') && !q.includes('count')) {
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
          response += `${i + 1}. **${p.name}**\n`;
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
      
      // PROJECT COUNT
      if ((q.includes('how many') || q.includes('count')) && (q.includes('project') || q.includes('projects'))) {
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
      
      // PROJECT STATUSES
      if ((q.includes('status') || q.includes('statuses')) && (q.includes('project') || q.includes('projects'))) {
        const projects = await db.query(
          `SELECT name, status, progress FROM projects WHERE company_id = $1 ORDER BY status`,
          [companyId]
        );
        
        if (projects.rows.length === 0) {
          return "You don't have any projects yet.";
        }
        
        const active = projects.rows.filter(p => p.status === 'Active');
        const completed = projects.rows.filter(p => p.progress === 100);
        const onHold = projects.rows.filter(p => p.status === 'On Hold');
        
        let response = `📊 **Project Statuses**\n\n`;
        if (active.length > 0) {
          response += `✅ **Active Projects (${active.length})**\n`;
          active.forEach(p => {
            response += `   • ${p.name} - ${p.progress}% complete\n`;
          });
          response += `\n`;
        }
        if (completed.length > 0) {
          response += `🏆 **Completed Projects (${completed.length})**\n`;
          completed.forEach(p => {
            response += `   • ${p.name}\n`;
          });
          response += `\n`;
        }
        if (onHold.length > 0) {
          response += `⏸️ **On Hold Projects (${onHold.length})**\n`;
          onHold.forEach(p => {
            response += `   • ${p.name}\n`;
          });
        }
        return response;
      }
      
      // SPECIFIC PROJECT DETAILS
      if ((q.includes('tell me about') || q.includes('details of')) && q.includes('project')) {
        let projectName = '';
        const patterns = [/tell me about ["']?([^"']+)["']?/i, /details of ["']?([^"']+)["']?/i];
        for (const pattern of patterns) {
          const match = question.match(pattern);
          if (match) {
            projectName = match[1];
            break;
          }
        }
        
        if (projectName) {
          const project = await db.query(
            `SELECT name, client, location, progress, status, contract_sum, start_date, end_date,
                    COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = p.id), 0) as spent
             FROM projects p WHERE company_id = $1 AND name ILIKE $2`,
            [companyId, `%${projectName}%`]
          );
          
          if (project.rows.length === 0) {
            return `I couldn't find a project named "${projectName}". Please check the name and try again.`;
          }
          
          const p = project.rows[0];
          const remaining = p.contract_sum - p.spent;
          
          let response = `📋 **Project Details: ${p.name}**\n\n`;
          response += `🏢 Client: ${p.client}\n`;
          response += `📍 Location: ${p.location}\n`;
          response += `📊 Progress: ${p.progress}%\n`;
          response += `🔄 Status: ${p.status}\n`;
          response += `💰 Contract: KES ${p.contract_sum?.toLocaleString()}\n`;
          response += `💸 Spent: KES ${p.spent.toLocaleString()}\n`;
          response += `📈 Remaining: KES ${remaining.toLocaleString()}\n`;
          response += `📅 Timeline: ${new Date(p.start_date).toLocaleDateString()} to ${new Date(p.end_date).toLocaleDateString()}\n`;
          return response;
        }
      }
      
      // ==================== INCOME MODULE ====================
      
      // LIST INCOMES
      if ((q.includes('list') || q.includes('show me')) && (q.includes('income') || q.includes('incomes'))) {
        const incomes = await db.query(
          `SELECT certificate_no, date, gross_amount, amount_received, payment_method, status, project_id
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
        
        let response = `💰 **Your Income Records**\n\n`;
        response += `📊 Total Income: KES ${total.rows[0].total.toLocaleString()}\n\n`;
        incomes.rows.forEach((i, idx) => {
          response += `${idx + 1}. **Certificate: ${i.certificate_no || 'N/A'}**\n`;
          response += `   💰 Gross: KES ${i.gross_amount.toLocaleString()}\n`;
          response += `   💵 Received: KES ${i.amount_received.toLocaleString()}\n`;
          response += `   📅 Date: ${new Date(i.date).toLocaleDateString()}\n`;
          response += `   💳 Method: ${i.payment_method || 'N/A'}\n`;
          response += `   📋 Status: ${i.status}\n\n`;
        });
        return response;
      }
      
      // TOTAL INCOME
      if ((q.includes('total income') || q.includes('how much income')) || (q.includes('income total'))) {
        const total = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        return `Your total income is KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // INCOME BY PROJECT
      if (q.includes('income by project') || (q.includes('project') && q.includes('income'))) {
        const incomeByProject = await db.query(
          `SELECT p.name as project_name, COALESCE(SUM(i.gross_amount), 0) as total
           FROM projects p
           LEFT JOIN income i ON p.id = i.project_id
           WHERE p.company_id = $1
           GROUP BY p.name
           ORDER BY total DESC`,
          [companyId]
        );
        
        if (incomeByProject.rows.length === 0) {
          return "No income records found for any project.";
        }
        
        let response = `💰 **Income by Project**\n\n`;
        incomeByProject.rows.forEach((row, idx) => {
          response += `${idx + 1}. **${row.project_name}**: KES ${row.total.toLocaleString()}\n`;
        });
        return response;
      }
      
      // ==================== EXPENSES MODULE ====================
      
      // LIST EXPENSES
      if ((q.includes('list') || q.includes('show me')) && (q.includes('expense') || q.includes('expenses'))) {
        const expenses = await db.query(
          `SELECT date, category, description, amount, vat, status, project_name
           FROM expenses WHERE company_id = $1 ORDER BY date DESC LIMIT 10`,
          [companyId]
        );
        
        const total = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        
        if (expenses.rows.length === 0) {
          return "You don't have any expenses yet. Add expenses in the Expenses module.";
        }
        
        let response = `💸 **Your Recent Expenses**\n\n`;
        response += `📊 Total Expenses: KES ${total.rows[0].total.toLocaleString()}\n\n`;
        expenses.rows.forEach((e, idx) => {
          response += `${idx + 1}. **${e.category}** - KES ${e.amount.toLocaleString()}\n`;
          response += `   📅 Date: ${new Date(e.date).toLocaleDateString()}\n`;
          if (e.description) response += `   📝 ${e.description.substring(0, 60)}...\n`;
          response += `   📋 Status: ${e.status}\n`;
          if (e.project_name) response += `   📋 Project: ${e.project_name}\n`;
          response += `\n`;
        });
        return response;
      }
      
      // TOTAL EXPENSES
      if ((q.includes('total expense') || q.includes('how much expense')) || (q.includes('expenses total'))) {
        const total = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        return `Your total expenses are KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // EXPENSES BY CATEGORY
      if (q.includes('expenses by category') || (q.includes('category') && q.includes('expense'))) {
        const byCategory = await db.query(
          `SELECT category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
           FROM expenses WHERE company_id = $1
           GROUP BY category
           ORDER BY total DESC`,
          [companyId]
        );
        
        if (byCategory.rows.length === 0) {
          return "No expense records found.";
        }
        
        let response = `📊 **Expenses by Category**\n\n`;
        byCategory.rows.forEach((cat, idx) => {
          response += `${idx + 1}. **${cat.category}**: ${cat.count} transactions, KES ${cat.total.toLocaleString()}\n`;
        });
        return response;
      }
      
      // ==================== PROFIT CALCULATION ====================
      
      if (q.includes('profit') || q.includes('profit and loss') || q.includes('pnl')) {
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
      
      // ==================== WORKERS MODULE ====================
      
      // LIST WORKERS
      if ((q.includes('list') || q.includes('show me')) && (q.includes('worker') || q.includes('workers'))) {
        const workers = await db.query(
          `SELECT w.name, w.phone, w.day_rate, wc.name as category, w.is_active
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1
           ORDER BY w.name LIMIT 30`,
          [companyId]
        );
        
        if (workers.rows.length === 0) {
          return "You don't have any workers yet. Add workers in the Workers module.";
        }
        
        const activeWorkers = workers.rows.filter(w => w.is_active === 1);
        const inactiveWorkers = workers.rows.filter(w => w.is_active !== 1);
        
        let response = `👥 **Your Workers** (${activeWorkers.length} active, ${inactiveWorkers.length} inactive)\n\n`;
        activeWorkers.slice(0, 15).forEach((w, i) => {
          response += `${i + 1}. **${w.name}**\n`;
          response += `   📞 Phone: ${w.phone || 'N/A'}\n`;
          response += `   💰 Day Rate: KES ${w.day_rate.toLocaleString()}\n`;
          response += `   📋 Category: ${w.category}\n\n`;
        });
        if (activeWorkers.length > 15) {
          response += `... and ${activeWorkers.length - 15} more workers.\n`;
        }
        return response;
      }
      
      // WORKER COUNT
      if ((q.includes('how many') || q.includes('count')) && (q.includes('worker') || q.includes('workers') || q.includes('employees'))) {
        const workers = await db.query(
          `SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        const byCategory = await db.query(
          `SELECT wc.name as category, COUNT(*) as count
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1 AND w.is_active = 1
           GROUP BY wc.name
           ORDER BY count DESC`,
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
      
      // WORKER BY CATEGORY
      if (q.includes('workers in') && q.includes('category')) {
        const categoryMatch = q.match(/in (\w+)/);
        if (categoryMatch) {
          const categoryName = categoryMatch[1];
          const workers = await db.query(
            `SELECT w.name, w.phone, w.day_rate
             FROM workers w
             JOIN worker_categories wc ON w.category_id = wc.id
             WHERE w.company_id = $1 AND w.is_active = 1 AND wc.name ILIKE $2
             LIMIT 20`,
            [companyId, `%${categoryName}%`]
          );
          
          if (workers.rows.length === 0) {
            return `No workers found in the "${categoryName}" category.`;
          }
          
          let response = `👥 **Workers in ${categoryName} Category** (${workers.rows.length})\n\n`;
          workers.rows.forEach((w, i) => {
            response += `${i + 1}. **${w.name}** - KES ${w.day_rate}/day\n`;
          });
          return response;
        }
      }
      
      // ==================== PAYROLL MODULE ====================
      
      if (q.includes('payroll')) {
        // Get payroll summary
        const payroll = await db.query(
          `SELECT COUNT(*) as count, 
                  COALESCE(SUM(total_gross_pay), 0) as total,
                  COALESCE(AVG(total_gross_pay), 0) as average
           FROM payroll_records WHERE company_id = $1`,
          [companyId]
        );
        
        // Get recent payroll records
        const recentPayroll = await db.query(
          `SELECT week_start, week_end, total_gross_pay, status
           FROM payroll_records 
           WHERE company_id = $1 
           ORDER BY created_at DESC 
           LIMIT 5`,
          [companyId]
        );
        
        if (payroll.rows[0].count === 0) {
          return "You haven't processed any payroll records yet. Go to the Payroll module to process payroll for your workers.";
        }
        
        let response = `💳 **Payroll Summary**\n\n`;
        response += `📊 Total Pay Periods: ${payroll.rows[0].count}\n`;
        response += `💰 Total Gross Pay: KES ${payroll.rows[0].total.toLocaleString()}\n`;
        response += `📈 Average per Period: KES ${payroll.rows[0].average.toLocaleString()}\n\n`;
        
        if (recentPayroll.rows.length > 0) {
          response += `📅 **Recent Payroll Records**\n`;
          recentPayroll.rows.forEach(p => {
            response += `   • Week of ${new Date(p.week_start).toLocaleDateString()}: KES ${p.total_gross_pay.toLocaleString()} (${p.status})\n`;
          });
        }
        return response;
      }
      
      // ==================== PROCUREMENT / PURCHASE ORDERS ====================
      
      if ((q.includes('purchase order') || q.includes('purchase orders') || q.includes('po'))) {
        const orders = await db.query(
          `SELECT COUNT(*) as count, 
                  COALESCE(SUM(total), 0) as total,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
           FROM purchase_orders WHERE company_id = $1`,
          [companyId]
        );
        
        if (orders.rows[0].count === 0) {
          return "You don't have any purchase orders yet. Create one in the Procurement module.";
        }
        
        // Get recent orders
        const recentOrders = await db.query(
          `SELECT order_number, supplier_name, total, status, order_date
           FROM purchase_orders 
           WHERE company_id = $1 
           ORDER BY order_date DESC 
           LIMIT 5`,
          [companyId]
        );
        
        let response = `📦 **Purchase Orders Summary**\n\n`;
        response += `📊 Total Orders: ${orders.rows[0].count}\n`;
        response += `💰 Total Value: KES ${orders.rows[0].total.toLocaleString()}\n`;
        response += `📋 Status Breakdown:\n`;
        response += `   • Pending: ${orders.rows[0].pending}\n`;
        response += `   • Approved: ${orders.rows[0].approved}\n`;
        response += `   • Delivered: ${orders.rows[0].delivered}\n\n`;
        
        if (recentOrders.rows.length > 0) {
          response += `📅 **Recent Orders**\n`;
          recentOrders.forEach(o => {
            response += `   • ${o.order_number} - ${o.supplier_name}: KES ${o.total.toLocaleString()} (${o.status})\n`;
          });
        }
        return response;
      }
      
      // ==================== SUPPLIERS MODULE ====================
      
      if ((q.includes('list') || q.includes('show me')) && (q.includes('supplier') || q.includes('suppliers'))) {
        const suppliers = await db.query(
          `SELECT name, phone, email, kra_pin, payment_terms, contact_person, is_active
           FROM suppliers WHERE company_id = $1 ORDER BY name LIMIT 20`,
          [companyId]
        );
        
        if (suppliers.rows.length === 0) {
          return "You don't have any suppliers yet. Add suppliers in the Procurement module.";
        }
        
        const activeSuppliers = suppliers.rows.filter(s => s.is_active === 1);
        
        let response = `📋 **Your Suppliers** (${activeSuppliers.length} active)\n\n`;
        suppliers.rows.forEach((s, i) => {
          response += `${i + 1}. **${s.name}**\n`;
          if (s.contact_person) response += `   👤 Contact: ${s.contact_person}\n`;
          if (s.phone) response += `   📞 Phone: ${s.phone}\n`;
          if (s.email) response += `   📧 Email: ${s.email}\n`;
          if (s.kra_pin) response += `   🆔 KRA PIN: ${s.kra_pin}\n`;
          if (s.payment_terms) response += `   📅 Terms: ${s.payment_terms}\n\n`;
        });
        return response;
      }
      
      // ==================== SUBCONTRACTORS MODULE ====================
      
      if ((q.includes('list') || q.includes('show me')) && (q.includes('subcontractor') || q.includes('subcontractors'))) {
        const subs = await db.query(
          `SELECT name, phone, email, specialization, contact_person, kra_pin, is_active
           FROM subcontractors WHERE company_id = $1 AND is_active = 1 ORDER BY name LIMIT 20`,
          [companyId]
        );
        
        if (subs.rows.length === 0) {
          return "You don't have any subcontractors yet. Add subcontractors in the Subcontractors module.";
        }
        
        let response = `🔧 **Your Subcontractors** (${subs.rows.length} total)\n\n`;
        subs.rows.forEach((s, i) => {
          response += `${i + 1}. **${s.name}**\n`;
          if (s.specialization) response += `   🔧 Specialization: ${s.specialization}\n`;
          if (s.contact_person) response += `   👤 Contact: ${s.contact_person}\n`;
          if (s.phone) response += `   📞 Phone: ${s.phone}\n`;
          if (s.email) response += `   📧 Email: ${s.email}\n`;
          if (s.kra_pin) response += `   🆔 KRA PIN: ${s.kra_pin}\n\n`;
        });
        return response;
      }
      
      // ==================== STORES / INVENTORY MODULE ====================
      
      // LIST INVENTORY
      if ((q.includes('list') || q.includes('show me')) && (q.includes('supply') || q.includes('supplies') || q.includes('inventory') || q.includes('stock'))) {
        const supplies = await db.query(
          `SELECT id, name, unit, current_stock, reorder_level, unit_price, is_active
           FROM supplies 
           WHERE company_id = $1 AND is_active = 1
           ORDER BY name LIMIT 30`,
          [companyId]
        );
        
        if (supplies.rows.length === 0) {
          return "You don't have any supplies added yet. Add items in the Stores module to track inventory.";
        }
        
        const lowStockItems = supplies.rows.filter(s => s.current_stock < s.reorder_level);
        const totalValue = supplies.rows.reduce((sum, s) => sum + (s.current_stock * (s.unit_price || 0)), 0);
        
        let response = `🏪 **Inventory Summary**\n\n`;
        response += `📦 Total Items: ${supplies.rows.length}\n`;
        response += `💰 Total Inventory Value: KES ${totalValue.toLocaleString()}\n`;
        response += `⚠️ Low Stock Items: ${lowStockItems.length}\n\n`;
        response += `📋 **Item List**\n`;
        
        supplies.rows.slice(0, 15).forEach((item, i) => {
          const stockStatus = item.current_stock < item.reorder_level ? '⚠️ LOW' : '✅';
          response += `${i + 1}. **${item.name}**\n`;
          response += `   📦 Stock: ${item.current_stock} ${item.unit} ${stockStatus}\n`;
          if (item.unit_price) response += `   💰 Unit Price: KES ${item.unit_price.toLocaleString()}\n`;
          response += `\n`;
        });
        
        if (supplies.rows.length > 15) {
          response += `... and ${supplies.rows.length - 15} more items.\n`;
        }
        
        if (lowStockItems.length > 0) {
          response += `\n⚠️ **Low Stock Alert:**\n`;
          lowStockItems.slice(0, 5).forEach(item => {
            const needed = item.reorder_level - item.current_stock;
            response += `   • ${item.name}: Need ${needed} more ${item.unit}\n`;
          });
        }
        return response;
      }
      
      // LOW STOCK ALERT
      if (q.includes('low stock') || (q.includes('reorder') && q.includes('stock'))) {
        const lowStock = await db.query(
          `SELECT name, current_stock, reorder_level, unit, unit_price
           FROM supplies 
           WHERE company_id = $1 AND is_active = 1 AND current_stock < reorder_level
           ORDER BY (reorder_level - current_stock) DESC`,
          [companyId]
        );
        
        if (lowStock.rows.length === 0) {
          return "✅ All your inventory items are at or above reorder levels. No low stock items found.";
        }
        
        let response = `⚠️ **Low Stock Alert** (${lowStock.rows.length} items need attention)\n\n`;
        lowStock.rows.forEach((item, i) => {
          const needed = item.reorder_level - item.current_stock;
          response += `${i + 1}. **${item.name}**\n`;
          response += `   📦 Current Stock: ${item.current_stock} ${item.unit}\n`;
          response += `   📊 Reorder Level: ${item.reorder_level} ${item.unit}\n`;
          response += `   🔄 Recommended Order: ${needed} ${item.unit}\n`;
          if (item.unit_price) response += `   💰 Estimated Cost: KES ${(needed * item.unit_price).toLocaleString()}\n\n`;
        });
        return response;
      }
      
      // INVENTORY VALUE
      if (q.includes('inventory value') || q.includes('stock value') || q.includes('total value of inventory')) {
        const supplies = await db.query(
          `SELECT name, current_stock, unit_price
           FROM supplies WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        if (supplies.rows.length === 0) {
          return "No inventory items found. Add supplies in the Stores module.";
        }
        
        const totalValue = supplies.rows.reduce((sum, s) => sum + ((s.current_stock || 0) * (s.unit_price || 0)), 0);
        const topItems = supplies.rows
          .map(s => ({ name: s.name, value: (s.current_stock || 0) * (s.unit_price || 0) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);
        
        let response = `💰 **Inventory Value Report**\n\n`;
        response += `📦 Total Items: ${supplies.rows.length}\n`;
        response += `💵 Total Inventory Value: KES ${totalValue.toLocaleString()}\n\n`;
        response += `🏆 **Highest Value Items:**\n`;
        topItems.forEach(item => {
          response += `   • ${item.name}: KES ${item.value.toLocaleString()}\n`;
        });
        return response;
      }
      
      // ==================== SUBSCRIPTION MODULE ====================
      
      if (q.includes('subscription') || q.includes('plan') || q.includes('billing plan')) {
        const sub = await db.query(
          `SELECT sp.name as plan_name, sp.price_monthly_kes, sp.price_yearly_kes, 
                  sp.max_projects, sp.max_users, sp.max_workers, sp.storage_mb,
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
        response += `💰 Yearly: KES ${s.price_yearly_kes?.toLocaleString()}\n`;
        response += `📊 Status: ${s.status}\n`;
        response += `📅 Started: ${new Date(s.start_date).toLocaleDateString()}\n`;
        response += `📅 Renews: ${new Date(s.end_date).toLocaleDateString()} (${daysLeft} days remaining)\n\n`;
        response += `📦 **Plan Limits:**\n`;
        response += `   • Max Projects: ${s.max_projects}\n`;
        response += `   • Max Users: ${s.max_users}\n`;
        response += `   • Max Workers: ${s.max_workers}\n`;
        response += `   • Storage: ${s.storage_mb} MB\n`;
        
        return response;
      }
      
      // ==================== BILLING / PAYMENTS ====================
      
      if (q.includes('billing') || q.includes('payment') || q.includes('invoice')) {
        // Check subscription payments
        const payments = await db.query(
          `SELECT amount, payment_method, status, payment_date, subscription_id
           FROM subscription_payments 
           WHERE company_id = $1 
           ORDER BY created_at DESC 
           LIMIT 5`,
          [companyId]
        );
        
        if (payments.rows.length === 0) {
          // Check income records as alternative
          const recentIncome = await db.query(
            `SELECT certificate_no, gross_amount, payment_method, payment_date, status
             FROM income 
             WHERE company_id = $1 AND status = 'Paid'
             ORDER BY payment_date DESC 
             LIMIT 5`,
            [companyId]
          );
          
          if (recentIncome.rows.length === 0) {
            return "No billing or payment records found. Your subscription may be on trial.";
          }
          
          let response = `💳 **Recent Payments / Income**\n\n`;
          recentIncome.forEach((p, i) => {
            response += `${i + 1}. **${p.certificate_no || 'Payment'}**\n`;
            response += `   💰 Amount: KES ${p.gross_amount.toLocaleString()}\n`;
            response += `   💳 Method: ${p.payment_method || 'N/A'}\n`;
            response += `   📅 Date: ${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}\n\n`;
          });
          return response;
        }
        
        let response = `💳 **Recent Billing History**\n\n`;
        payments.forEach((p, i) => {
          response += `${i + 1}. **KES ${p.amount?.toLocaleString()}**\n`;
          response += `   💳 Method: ${p.payment_method || 'N/A'}\n`;
          response += `   📋 Status: ${p.status}\n`;
          response += `   📅 Date: ${p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'Pending'}\n\n`;
        });
        return response;
      }
      
      // ==================== SETTINGS / COMPANY INFO ====================
      
      if ((q.includes('company') || q.includes('settings')) && (q.includes('info') || q.includes('profile') || q.includes('details'))) {
        const settings = await db.query(
          `SELECT name, email, phone, address, kra_pin, vat_rate, vat_registration_number, 
                  website, currency, logo_url
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
        if (c.logo_url) response += `🖼️ Logo: Uploaded\n`;
        return response;
      }
      
      if (q.includes('vat') && (q.includes('rate') || q.includes('number') || q.includes('registration'))) {
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
      
      if (q.includes('site diary') || (q.includes('site') && q.includes('entry'))) {
        const entries = await db.query(
          `SELECT date, summary, weather, total_workers, activities, challenges, status
           FROM site_diary_entries 
           WHERE company_id = $1 
           ORDER BY date DESC 
           LIMIT 7`,
          [companyId]
        );
        
        if (entries.rows.length === 0) {
          return "No site diary entries yet. Add daily entries in the Site Diary module to track site activities.";
        }
        
        let response = `📔 **Recent Site Diary Entries**\n\n`;
        entries.rows.forEach((e, i) => {
          response += `${i + 1}. **${new Date(e.date).toLocaleDateString()}**\n`;
          if (e.weather) response += `   ☁️ Weather: ${e.weather}\n`;
          if (e.total_workers) response += `   👥 Workers on Site: ${e.total_workers}\n`;
          if (e.status) response += `   📋 Status: ${e.status}\n`;
          if (e.summary) response += `   📝 ${e.summary.substring(0, 100)}...\n`;
          response += `\n`;
        });
        return response;
      }
      
      // ==================== MEETINGS MODULE ====================
      
      if (q.includes('meeting') || q.includes('minutes')) {
        const meetings = await db.query(
          `SELECT m.title, m.meeting_date, m.location, p.name as project_name
           FROM meeting_minutes m
           JOIN projects p ON m.project_id = p.id
           WHERE p.company_id = $1
           ORDER BY m.meeting_date DESC 
           LIMIT 5`,
          [companyId]
        );
        
        if (meetings.rows.length === 0) {
          return "No meeting minutes recorded yet. Add meeting minutes in the Meetings module.";
        }
        
        let response = `📅 **Recent Meetings**\n\n`;
        meetings.rows.forEach((m, i) => {
          response += `${i + 1}. **${m.title}**\n`;
          response += `   📅 Date: ${new Date(m.meeting_date).toLocaleDateString()}\n`;
          response += `   📋 Project: ${m.project_name}\n`;
          if (m.location) response += `   📍 Location: ${m.location}\n\n`;
        });
        return response;
      }
      
      // ==================== DOCUMENTS MODULE ====================
      
      if (q.includes('document') || q.includes('documents') || q.includes('files')) {
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
      
      // ==================== USERS / TEAM MODULE ====================
      
      if ((q.includes('team') || q.includes('users') || q.includes('members')) && q.includes('count')) {
        const users = await db.query(
          `SELECT COUNT(*) as count,
                  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                  COUNT(CASE WHEN role = 'project_manager' THEN 1 END) as pms,
                  COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
           FROM users WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        return `👥 **Team Summary**\n\nTotal Active Users: ${users.rows[0].count}\n👑 Administrators: ${users.rows[0].admins}\n📋 Project Managers: ${users.rows[0].pms}\n👤 Regular Users: ${users.rows[0].regular_users}`;
      }
      
      if ((q.includes('list') || q.includes('show me')) && (q.includes('user') || q.includes('users') || q.includes('team members'))) {
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
          response += `${i + 1}. **${u.name}**\n`;
          response += `   📧 ${u.email}\n`;
          response += `   👔 Role: ${u.role}\n\n`;
        });
        return response;
      }
      
      // ==================== HELP / SUPPORT ====================
      
      if (q.includes('help') || q.includes('support') || q.includes('contact support')) {
        return `📞 **Bochi Support Center**\n\n📧 Email: support@bochi.ke\n📞 Phone: +254 772 041005\n🌐 Website: www.bochi.ke\n💬 Live Chat: Available in the Help module\n\n📚 **Resources:**\n   • FAQ section in Help module\n   • Video tutorials in Help module\n   • User documentation available on request\n\n⏰ Support Hours: Monday-Friday, 8 AM - 6 PM EAT`;
      }
      
      // ==================== LEGAL MODULE ====================
      
      if (q.includes('terms') || q.includes('privacy') || q.includes('legal') || q.includes('policy')) {
        return `📜 **Legal Information**\n\n📋 Terms of Service: www.bochi.ke/terms\n🔒 Privacy Policy: www.bochi.ke/privacy\n⚖️ Data Processing Agreement: Available upon request\n\n📧 Legal Inquiries: legal@bochi.ke\n\n⚠️ For any legal concerns, please contact our legal team directly.`;
      }
      
      // ==================== GENERAL DASHBOARD ====================
      
      if (q.includes('dashboard') && (q.includes('summary') || q.includes('overview'))) {
        // Get counts from various modules
        const projects = await db.query(`SELECT COUNT(*) as count FROM projects WHERE company_id = $1`, [companyId]);
        const income = await db.query(`SELECT COALESCE(SUM(gross_amount),0) as total FROM income WHERE company_id = $1`, [companyId]);
        const expenses = await db.query(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE company_id = $1`, [companyId]);
        const workers = await db.query(`SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`, [companyId]);
        const lowStock = await db.query(`SELECT COUNT(*) as count FROM supplies WHERE company_id = $1 AND is_active = 1 AND current_stock < reorder_level`, [companyId]);
        
        const profit = income.rows[0].total - expenses.rows[0].total;
        
        let response = `📊 **Dashboard Overview**\n\n`;
        response += `📋 Projects: ${projects.rows[0].count}\n`;
        response += `💰 Income: KES ${income.rows[0].total.toLocaleString()}\n`;
        response += `💸 Expenses: KES ${expenses.rows[0].total.toLocaleString()}\n`;
        response += `📈 Profit: KES ${profit.toLocaleString()}\n`;
        response += `👥 Workers: ${workers.rows[0].count}\n`;
        response += `⚠️ Low Stock Items: ${lowStock.rows[0].count}\n\n`;
        
        if (lowStock.rows[0].count > 0) {
          response += `💡 **Action Required:** Check low stock items in Stores module.\n`;
        }
        if (profit < 0) {
          response += `💡 **Action Required:** Review expenses to improve profitability.\n`;
        }
        
        return response;
      }
      
      return null;
      
    } catch (error) {
      console.error('Data fetch error:', error);
      return null;
    }
  }

  static async answerProjectQuestion(projectId, question, userId) {
    try {
      const projectContext = await this.getProjectContext(projectId, userId);
      if (!projectContext) {
        return "I couldn't find that project. Please make sure you have access to it.";
      }
      
      const prompt = `
You are an AI assistant for Bochi Construction Suite.

PROJECT DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Name: ${projectContext.name}
🏢 Client: ${projectContext.client || 'N/A'}
📍 Location: ${projectContext.location || 'N/A'}
📊 Progress: ${projectContext.progress}%
💰 Contract: KES ${projectContext.budget?.toLocaleString() || 'N/A'}
💸 Spent: KES ${projectContext.spent?.toLocaleString() || '0'}
📅 Start: ${projectContext.start_date || 'N/A'}
📅 End: ${projectContext.end_date || 'N/A'}
🔄 Status: ${projectContext.status || 'Active'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASKS:
• Total: ${projectContext.total_tasks}
• Completed: ${projectContext.completed_tasks}
• In Progress: ${projectContext.in_progress_tasks}
• Overdue: ${projectContext.overdue_tasks}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: "${question}"

Answer based ONLY on the project data above. Be concise (2-4 sentences). Include specific numbers.`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful construction project management assistant.' },
          { role: 'user', content: prompt }
        ],
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
      if (!context) {
        return "I couldn't find that project. Please make sure you have access to it.";
      }
      
      const prompt = `
You are an AI assistant for project stakeholders.

PROJECT: ${context.name}
Progress: ${context.progress}%
Timeline: ${context.start_date || 'N/A'} to ${context.end_date || 'N/A'}
Tasks: ${context.completed_tasks}/${context.total_tasks} completed
Documents: ${context.document_count}
Meetings: ${context.meeting_count}

USER QUESTION: "${question}"

Focus ONLY on progress, timeline, documents, and meetings. DO NOT share financial details. Be positive and reassuring.`;

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
    try {
      const result = await db.query(`
        SELECT 1 FROM project_stakeholders 
        WHERE user_id = $1 AND project_id = $2 AND is_active = 1 AND invite_status = 'accepted'
      `, [userId, projectId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error verifying stakeholder access:', error);
      return false;
    }
  }

  static async getStakeholderProjectContext(projectId, userId) {
    const db = await getDb();
    try {
      const projectResult = await db.query(`
        SELECT 
          p.id, p.name, p.progress, p.status, p.start_date, p.end_date,
          COUNT(DISTINCT pg.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN pg.status = 'completed' THEN pg.id END) as completed_tasks
        FROM projects p
        LEFT JOIN project_gantt_tasks pg ON p.id = pg.project_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [projectId]);
      
      if (projectResult.rows.length === 0) return null;
      
      const project = projectResult.rows[0];
      const docsResult = await db.query(`SELECT COUNT(*) as count FROM project_documents WHERE project_id = $1`, [projectId]);
      const meetingsResult = await db.query(`SELECT COUNT(*) as count FROM meeting_minutes WHERE project_id = $1`, [projectId]);
      
      return {
        name: project.name,
        progress: project.progress || 0,
        start_date: project.start_date,
        end_date: project.end_date,
        total_tasks: parseInt(project.total_tasks) || 0,
        completed_tasks: parseInt(project.completed_tasks) || 0,
        document_count: parseInt(docsResult.rows[0]?.count) || 0,
        meeting_count: parseInt(meetingsResult.rows[0]?.count) || 0
      };
    } catch (error) {
      console.error('Error fetching stakeholder context:', error);
      return null;
    }
  }
  
  static async getProjectContext(projectId, userId) {
    const db = await getDb();
    try {
      const projectResult = await db.query(`
        SELECT 
          p.id, p.name, p.client, p.location, p.progress, 
          p.contract_sum as budget, p.status, p.start_date, p.end_date,
          COALESCE((SELECT SUM(amount) FROM expenses WHERE project_id = p.id), 0) as spent
        FROM projects p
        WHERE p.id = $1
      `, [projectId]);
      
      if (projectResult.rows.length === 0) return null;
      
      const project = projectResult.rows[0];
      const tasksResult = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started,
          COUNT(CASE WHEN status != 'completed' AND end_date < CURRENT_DATE THEN 1 END) as overdue
        FROM project_gantt_tasks
        WHERE project_id = $1
      `, [projectId]);
      
      const tasks = tasksResult.rows[0];
      
      return {
        name: project.name,
        client: project.client,
        location: project.location,
        progress: project.progress || 0,
        budget: project.budget,
        spent: parseFloat(project.spent) || 0,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        total_tasks: tasks?.total || 0,
        completed_tasks: tasks?.completed || 0,
        in_progress_tasks: tasks?.in_progress || 0,
        not_started_tasks: tasks?.not_started || 0,
        overdue_tasks: tasks?.overdue || 0
      };
    } catch (error) {
      console.error('Error fetching project context:', error);
      return null;
    }
  }
  
  static async generateProjectSummary(projectId, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      if (!context) return "Unable to generate summary: Project not found.";
      
      const prompt = `
Based on this data, write a 2-sentence executive summary:

Project: ${context.name}
Progress: ${context.progress}%
Budget: KES ${context.budget?.toLocaleString()} (Spent: KES ${context.spent?.toLocaleString()})
Tasks: ${context.completed_tasks}/${context.total_tasks} completed
Overdue: ${context.overdue_tasks}

Summary:`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 150
      });
      return response.choices[0].message.content;
    } catch (error) {
      return "Unable to generate summary at this time.";
    }
  }
  
  static async submitFeedback(question, answer, isCorrect, userId) {
    return await TrainingDataService.saveTrainingExample(question, answer, isCorrect, userId);
  }
}

module.exports = AIService;