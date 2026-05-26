const { getDb } = require('../config/database');

class DataFetchingService {
  /**
   * Fetch all relevant data for a company to answer questions
   */
  static async fetchAllCompanyData(companyId, projectId = null) {
    const db = await getDb();
    
    try {
      const data = {};
      
      // 1. Projects data
      const projectsQuery = `
        SELECT id, name, client, location, progress, status, 
               budget, start_date, end_date
        FROM projects 
        WHERE company_id = $1 ${projectId ? 'AND id = $2' : ''}
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const projectsParams = projectId ? [companyId, projectId] : [companyId];
      data.projects = (await db.query(projectsQuery, projectsParams)).rows;
      
      // 2. Financial summary
      const financialQuery = `
        SELECT 
          (SELECT COALESCE(SUM(amount), 0) FROM income WHERE company_id = $1) as total_income,
          (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE company_id = $1) as total_expenses,
          (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE company_id = $1 AND status = 'pending') as pending_expenses
      `;
      data.financial = (await db.query(financialQuery, [companyId])).rows[0];
      
      // 3. Payroll summary
      const payrollQuery = `
        SELECT 
          COUNT(*) as total_workers,
          COALESCE(SUM(gross_pay), 0) as total_payroll,
          COALESCE(SUM(net_pay), 0) as total_net_pay
        FROM payroll_records pr
        JOIN workers w ON pr.worker_id = w.id
        WHERE w.company_id = $1 AND pr.status = 'paid'
      `;
      data.payroll = (await db.query(payrollQuery, [companyId])).rows[0];
      
      // 4. Procurement summary
      const procurementQuery = `
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COALESCE(SUM(total_amount), 0) as total_procurement
        FROM purchase_orders
        WHERE company_id = $1
      `;
      data.procurement = (await db.query(procurementQuery, [companyId])).rows[0];
      
      // 5. Stores/Inventory summary
      const storesQuery = `
        SELECT 
          COUNT(*) as total_items,
          COALESCE(SUM(current_stock), 0) as total_stock,
          COUNT(CASE WHEN current_stock < reorder_level THEN 1 END) as low_stock_items
        FROM supplies
        WHERE company_id = $1 AND is_active = 1
      `;
      data.stores = (await db.query(storesQuery, [companyId])).rows[0];
      
      // 6. Worker categories
      const workersQuery = `
        SELECT category, COUNT(*) as count
        FROM workers
        WHERE company_id = $1 AND is_active = 1
        GROUP BY category
      `;
      data.workers_by_category = (await db.query(workersQuery, [companyId])).rows;
      
      // 7. Recent activities
      const activitiesQuery = `
        SELECT action, entity_type, entity_name, created_at
        FROM user_activities
        WHERE company_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;
      data.recent_activities = (await db.query(activitiesQuery, [companyId])).rows;
      
      // 8. Subscription status
      const subscriptionQuery = `
        SELECT plan_name, status, end_date, is_trial
        FROM company_subscriptions cs
        JOIN subscription_plans sp ON cs.plan_id = sp.id
        WHERE cs.company_id = $1 AND cs.status = 'active'
        ORDER BY cs.created_at DESC
        LIMIT 1
      `;
      data.subscription = (await db.query(subscriptionQuery, [companyId])).rows[0];
      
      return data;
    } catch (error) {
      console.error('Error fetching company data:', error);
      return null;
    }
  }
  
  /**
   * Format data into a readable context for AI
   */
  static formatDataForAI(data, question) {
    if (!data) return null;
    
    let context = '';
    
    // Projects
    if (data.projects && data.projects.length > 0) {
      context += `\n📋 PROJECTS:\n`;
      data.projects.forEach(p => {
        context += `• ${p.name}: ${p.progress}% complete, Status: ${p.status}, Budget: KES ${p.budget?.toLocaleString()}\n`;
      });
    }
    
    // Financial
    if (data.financial) {
      const profit = data.financial.total_income - data.financial.total_expenses;
      context += `\n💰 FINANCIAL:\n`;
      context += `• Total Income: KES ${data.financial.total_income?.toLocaleString()}\n`;
      context += `• Total Expenses: KES ${data.financial.total_expenses?.toLocaleString()}\n`;
      context += `• Profit: KES ${profit?.toLocaleString()}\n`;
      if (data.financial.pending_expenses > 0) {
        context += `• Pending Expenses: KES ${data.financial.pending_expenses?.toLocaleString()}\n`;
      }
    }
    
    // Payroll
    if (data.payroll && data.payroll.total_workers > 0) {
      context += `\n👥 PAYROLL:\n`;
      context += `• Total Workers: ${data.payroll.total_workers}\n`;
      context += `• Total Payroll Paid: KES ${data.payroll.total_payroll?.toLocaleString()}\n`;
    }
    
    // Procurement
    if (data.procurement && data.procurement.total_orders > 0) {
      context += `\n📦 PROCUREMENT:\n`;
      context += `• Total Orders: ${data.procurement.total_orders}\n`;
      context += `• Pending Orders: ${data.procurement.pending_orders}\n`;
      context += `• Total Spent: KES ${data.procurement.total_procurement?.toLocaleString()}\n`;
    }
    
    // Stores/Inventory
    if (data.stores && data.stores.total_items > 0) {
      context += `\n🏪 STORES:\n`;
      context += `• Total Items: ${data.stores.total_items}\n`;
      context += `• Low Stock Items: ${data.stores.low_stock_items}\n`;
    }
    
    // Workers by category
    if (data.workers_by_category && data.workers_by_category.length > 0) {
      context += `\n🔧 WORKERS BY CATEGORY:\n`;
      data.workers_by_category.forEach(w => {
        context += `• ${w.category}: ${w.count} workers\n`;
      });
    }
    
    // Subscription
    if (data.subscription) {
      context += `\n⭐ SUBSCRIPTION:\n`;
      context += `• Plan: ${data.subscription.plan_name}\n`;
      context += `• Status: ${data.subscription.status}\n`;
      if (data.subscription.is_trial) {
        context += `• Trial active until: ${new Date(data.subscription.end_date).toLocaleDateString()}\n`;
      }
    }
    
    return context;
  }
  
  /**
   * Answer specific financial questions
   */
  static async answerFinancialQuestion(companyId, question) {
    const db = await getDb();
    
    const income = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE company_id = $1`,
      [companyId]
    );
    
    const expenses = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
      [companyId]
    );
    
    const profit = income.rows[0].total - expenses.rows[0].total;
    
    if (question.toLowerCase().includes('profit')) {
      return `Your current profit is KES ${profit.toLocaleString()}. (Income: KES ${income.rows[0].total.toLocaleString()}, Expenses: KES ${expenses.rows[0].total.toLocaleString()})`;
    }
    
    if (question.toLowerCase().includes('income') || question.toLowerCase().includes('revenue')) {
      return `Your total income is KES ${income.rows[0].total.toLocaleString()}.`;
    }
    
    if (question.toLowerCase().includes('expense') || question.toLowerCase().includes('cost')) {
      return `Your total expenses are KES ${expenses.rows[0].total.toLocaleString()}.`;
    }
    
    return null;
  }
  
  /**
   * Answer project-specific questions
   */
  static async answerProjectQuestion(projectId, question) {
    const db = await getDb();
    
    // Get project details
    const project = await db.query(`
      SELECT name, progress, budget, status, start_date, end_date
      FROM projects WHERE id = $1
    `, [projectId]);
    
    if (project.rows.length === 0) return null;
    const p = project.rows[0];
    
    // Get task completion
    const tasks = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM project_gantt_tasks WHERE project_id = $1
    `, [projectId]);
    
    // Get expenses for this project
    const expenses = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as spent FROM expenses WHERE project_id = $1
    `, [projectId]);
    
    if (question.toLowerCase().includes('progress')) {
      return `Project "${p.name}" is ${p.progress}% complete. ${tasks.rows[0].completed}/${tasks.rows[0].total} tasks completed.`;
    }
    
    if (question.toLowerCase().includes('budget')) {
      const remaining = p.budget - expenses.rows[0].spent;
      return `Project "${p.name}" budget: KES ${p.budget?.toLocaleString()}, Spent: KES ${expenses.rows[0].spent?.toLocaleString()}, Remaining: KES ${remaining?.toLocaleString()}.`;
    }
    
    if (question.toLowerCase().includes('timeline') || question.toLowerCase().includes('complete')) {
      return `Project "${p.name}" started on ${new Date(p.start_date).toLocaleDateString()} and is scheduled to end on ${new Date(p.end_date).toLocaleDateString()}. Current status: ${p.status}.`;
    }
    
    return null;
  }
}

module.exports = DataFetchingService;