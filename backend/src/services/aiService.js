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
    const lowerQuestion = question.toLowerCase();
    
    console.log('🔍 AI Query:', question);
    console.log('🏢 Company:', companyId);
    
    try {
      // ========== PROJECTS MODULE ==========
      
      // LIST PROJECTS
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('project') || lowerQuestion.includes('projects')) &&
          !lowerQuestion.includes('how') && !lowerQuestion.includes('count')) {
        
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
          response += `\n`;
        });
        return response;
      }
      
      // PROJECT COUNT
      if ((lowerQuestion.includes('how many') || lowerQuestion.includes('count')) && 
          (lowerQuestion.includes('project') || lowerQuestion.includes('projects'))) {
        const projects = await db.query(
          `SELECT COUNT(*) as total,
                  COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                  COUNT(CASE WHEN progress = 100 THEN 1 END) as completed
           FROM projects WHERE company_id = $1`,
          [companyId]
        );
        
        return `You have ${projects.rows[0].total} total projects. ${projects.rows[0].active} are active, and ${projects.rows[0].completed} are completed.`;
      }
      
      // PROJECT STATUSES
      if ((lowerQuestion.includes('status') || lowerQuestion.includes('statuses')) && 
          (lowerQuestion.includes('project') || lowerQuestion.includes('projects'))) {
        const projects = await db.query(
          `SELECT name, status, progress FROM projects WHERE company_id = $1 ORDER BY status`,
          [companyId]
        );
        
        const active = projects.rows.filter(p => p.status === 'Active');
        const completed = projects.rows.filter(p => p.progress === 100);
        
        let response = `📊 **Project Statuses**\n\n`;
        if (active.length > 0) {
          response += `✅ Active (${active.length}): ${active.map(p => p.name).join(', ')}\n\n`;
        }
        if (completed.length > 0) {
          response += `🏆 Completed (${completed.length}): ${completed.map(p => p.name).join(', ')}\n`;
        }
        return response;
      }
      
      // ========== INCOME MODULE ==========
      
      // LIST INCOMES
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('income') || lowerQuestion.includes('incomes'))) {
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
        
        let response = `💰 **Your Income Records**\n\n`;
        response += `📊 Total Income: KES ${total.rows[0].total.toLocaleString()}\n\n`;
        incomes.rows.forEach((i, idx) => {
          response += `${idx + 1}. **Certificate: ${i.certificate_no || 'N/A'}**\n`;
          response += `   💰 Gross: KES ${i.gross_amount.toLocaleString()}\n`;
          response += `   💵 Received: KES ${i.amount_received.toLocaleString()}\n`;
          response += `   📅 Date: ${new Date(i.date).toLocaleDateString()}\n`;
          response += `   💳 Method: ${i.payment_method}\n`;
          response += `   📋 Status: ${i.status}\n\n`;
        });
        return response;
      }
      
      // TOTAL INCOME
      if ((lowerQuestion.includes('total income') || lowerQuestion.includes('how much income')) ||
          (lowerQuestion.includes('income total'))) {
        const total = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        return `Your total income is KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // ========== EXPENSES MODULE ==========
      
      // LIST EXPENSES
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('expense') || lowerQuestion.includes('expenses'))) {
        const expenses = await db.query(
          `SELECT date, category, description, amount, vat, status
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
          if (e.description) response += `   📝 ${e.description}\n`;
          response += `   📋 Status: ${e.status}\n\n`;
        });
        return response;
      }
      
      // TOTAL EXPENSES
      if ((lowerQuestion.includes('total expense') || lowerQuestion.includes('how much expense')) ||
          (lowerQuestion.includes('expenses total'))) {
        const total = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        return `Your total expenses are KES ${total.rows[0].total.toLocaleString()}.`;
      }
      
      // PROFIT
      if (lowerQuestion.includes('profit') || lowerQuestion.includes('profit and loss')) {
        const income = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        const expenses = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        const profit = income.rows[0].total - expenses.rows[0].total;
        return `Your total profit is KES ${profit.toLocaleString()}. (Income: KES ${income.rows[0].total.toLocaleString()}, Expenses: KES ${expenses.rows[0].total.toLocaleString()})`;
      }
      
      // ========== WORKERS MODULE ==========
      
      // LIST WORKERS
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('worker') || lowerQuestion.includes('workers'))) {
        const workers = await db.query(
          `SELECT w.name, w.phone, w.day_rate, wc.name as category
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1 AND w.is_active = 1
           ORDER BY w.name LIMIT 20`,
          [companyId]
        );
        
        if (workers.rows.length === 0) {
          return "You don't have any workers yet. Add workers in the Workers module.";
        }
        
        let response = `👥 **Your Workers** (${workers.rows.length} total)\n\n`;
        workers.rows.forEach((w, i) => {
          response += `${i + 1}. **${w.name}**\n`;
          response += `   📞 Phone: ${w.phone || 'N/A'}\n`;
          response += `   💰 Day Rate: KES ${w.day_rate.toLocaleString()}\n`;
          response += `   📋 Category: ${w.category}\n\n`;
        });
        return response;
      }
      
      // WORKER COUNT
      if ((lowerQuestion.includes('how many') || lowerQuestion.includes('count')) && 
          (lowerQuestion.includes('worker') || lowerQuestion.includes('workers') || lowerQuestion.includes('employees'))) {
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
        
        let response = `You have ${workers.rows[0].count} active workers.`;
        if (byCategory.rows.length > 0) {
          response += ` By category: ${byCategory.rows.map(c => `${c.category}: ${c.count}`).join(', ')}.`;
        }
        return response;
      }
      
      // ========== PAYROLL MODULE ==========
      
      if (lowerQuestion.includes('payroll')) {
        const payroll = await db.query(
          `SELECT COUNT(*) as count, COALESCE(SUM(total_gross_pay), 0) as total
           FROM payroll_records WHERE company_id = $1`,
          [companyId]
        );
        
        if (payroll.rows[0].count === 0) {
          return "You haven't processed any payroll records yet. Go to the Payroll module to process payroll.";
        }
        
        return `You have processed payroll for ${payroll.rows[0].count} pay periods totaling KES ${payroll.rows[0].total.toLocaleString()}.`;
      }
      
      // ========== PROCUREMENT / PURCHASE ORDERS ==========
      
      if ((lowerQuestion.includes('purchase order') || lowerQuestion.includes('purchase orders') || lowerQuestion.includes('po'))) {
        const orders = await db.query(
          `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
           FROM purchase_orders WHERE company_id = $1`,
          [companyId]
        );
        
        if (orders.rows[0].count === 0) {
          return "You don't have any purchase orders yet. Create one in the Procurement module.";
        }
        
        let response = `You have ${orders.rows[0].count} purchase orders totaling KES ${orders.rows[0].total.toLocaleString()}.`;
        if (orders.rows[0].pending > 0) {
          response += ` ${orders.rows[0].pending} orders are pending approval.`;
        }
        return response;
      }
      
      // ========== SUPPLIERS ==========
      
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('supplier') || lowerQuestion.includes('suppliers'))) {
        const suppliers = await db.query(
          `SELECT name, phone, email, kra_pin, payment_terms
           FROM suppliers WHERE company_id = $1 AND is_active = 1
           ORDER BY name LIMIT 20`,
          [companyId]
        );
        
        if (suppliers.rows.length === 0) {
          return "You don't have any suppliers yet. Add suppliers in the Procurement module.";
        }
        
        let response = `📋 **Your Suppliers** (${suppliers.rows.length} total)\n\n`;
        suppliers.rows.forEach((s, i) => {
          response += `${i + 1}. **${s.name}**\n`;
          if (s.phone) response += `   📞 Phone: ${s.phone}\n`;
          if (s.email) response += `   📧 Email: ${s.email}\n`;
          if (s.kra_pin) response += `   🆔 KRA PIN: ${s.kra_pin}\n`;
          if (s.payment_terms) response += `   📅 Terms: ${s.payment_terms}\n\n`;
        });
        return response;
      }
      
      // ========== SUBCONTRACTORS ==========
      
      if ((lowerQuestion.includes('list') || lowerQuestion.includes('show me')) && 
          (lowerQuestion.includes('subcontractor') || lowerQuestion.includes('subcontractors'))) {
        const subs = await db.query(
          `SELECT name, phone, email, specialization, contact_person
           FROM subcontractors WHERE company_id = $1 AND is_active = 1
           ORDER BY name LIMIT 20`,
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
          if (s.email) response += `   📧 Email: ${s.email}\n\n`;
        });
        return response;
      }
      
      // ========== USERS / TEAM ==========
      
      if ((lowerQuestion.includes('team') || lowerQuestion.includes('users') || lowerQuestion.includes('members')) &&
          (lowerQuestion.includes('how many') || lowerQuestion.includes('count'))) {
        const users = await db.query(
          `SELECT COUNT(*) as count,
                  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                  COUNT(CASE WHEN role = 'project_manager' THEN 1 END) as pms
           FROM users WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        return `Your team has ${users.rows[0].count} active users. ${users.rows[0].admins} administrators, ${users.rows[0].pms} project managers.`;
      }
      
      // ========== SUBSCRIPTION ==========
      
      if (lowerQuestion.includes('subscription') || lowerQuestion.includes('plan')) {
        const sub = await db.query(
          `SELECT sp.name as plan_name, cs.status, cs.end_date, cs.is_trial
           FROM company_subscriptions cs
           JOIN subscription_plans sp ON cs.plan_id = sp.id
           WHERE cs.company_id = $1 AND cs.status = 'active'
           ORDER BY cs.created_at DESC LIMIT 1`,
          [companyId]
        );
        
        if (sub.rows[0]) {
          let response = `You are on the ${sub.rows[0].plan_name} plan.`;
          if (sub.rows[0].is_trial) {
            response += ` Your trial is active.`;
          }
          return response;
        }
        return "You don't have an active subscription. Please contact sales@bochi.ke.";
      }
      
      // ========== SITE DIARY ==========
      
      if (lowerQuestion.includes('site diary') || (lowerQuestion.includes('site') && lowerQuestion.includes('entry'))) {
        const entries = await db.query(
          `SELECT date, summary, weather, total_workers
           FROM site_diary_entries 
           WHERE company_id = $1 
           ORDER BY date DESC 
           LIMIT 5`,
          [companyId]
        );
        
        if (entries.rows.length === 0) {
          return "You don't have any site diary entries yet. Add entries in the Site Diary module.";
        }
        
        let response = `📔 **Recent Site Diary Entries**\n\n`;
        entries.rows.forEach((e, i) => {
          response += `${i + 1}. **${new Date(e.date).toLocaleDateString()}**\n`;
          response += `   ☁️ Weather: ${e.weather || 'N/A'}\n`;
          response += `   👥 Workers: ${e.total_workers || 0}\n`;
          if (e.summary) response += `   📝 ${e.summary.substring(0, 100)}...\n`;
          response += `\n`;
        });
        return response;
      }
      
      // ========== MEETINGS ==========
      
      if (lowerQuestion.includes('meeting') || lowerQuestion.includes('minutes')) {
        const meetings = await db.query(
          `SELECT title, meeting_date, location
           FROM meeting_minutes 
           WHERE project_id IN (SELECT id FROM projects WHERE company_id = $1)
           ORDER BY meeting_date DESC 
           LIMIT 5`,
          [companyId]
        );
        
        if (meetings.rows.length === 0) {
          return "You don't have any meeting minutes recorded yet.";
        }
        
        let response = `📅 **Recent Meetings**\n\n`;
        meetings.rows.forEach((m, i) => {
          response += `${i + 1}. **${m.title}**\n`;
          response += `   📅 Date: ${new Date(m.meeting_date).toLocaleDateString()}\n`;
          if (m.location) response += `   📍 Location: ${m.location}\n\n`;
        });
        return response;
      }
      
      // ========== STORES / INVENTORY ==========
      
      if (lowerQuestion.includes('stock') || lowerQuestion.includes('inventory') || lowerQuestion.includes('supplies')) {
        const supplies = await db.query(
          `SELECT COUNT(*) as count FROM supplies WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        if (supplies.rows[0].count === 0) {
          return "You don't have any supplies added yet. Add items in the Stores module.";
        }
        
        return `You have ${supplies.rows[0].count} supply items in your inventory.`;
      }
      
      // ========== DOCUMENTS ==========
      
      if (lowerQuestion.includes('document') || lowerQuestion.includes('documents')) {
        const docs = await db.query(
          `SELECT COUNT(*) as count FROM project_documents WHERE company_id = $1`,
          [companyId]
        );
        
        if (docs.rows[0].count === 0) {
          return "You don't have any documents uploaded yet. Upload documents in the Documents module.";
        }
        
        return `You have ${docs.rows[0].count} documents stored in the system.`;
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
      
      const knowledge = KnowledgeBase.getFormattedKnowledge(question);
      
      const prompt = `
You are an AI assistant for Bochi Construction Suite, helping construction professionals manage their projects.

${knowledge ? `\n📚 HELPFUL INFORMATION:\n${knowledge}\n` : ''}

PROJECT INFORMATION (REAL DATA):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Project Name: ${projectContext.name}
🏢 Client: ${projectContext.client || 'Not specified'}
📍 Location: ${projectContext.location || 'Not specified'}
📊 Progress: ${projectContext.progress}%
💰 Budget: KES ${projectContext.budget?.toLocaleString() || 'Not set'}
💸 Spent: KES ${projectContext.spent?.toLocaleString() || '0'}
📅 Start Date: ${projectContext.start_date || 'Not set'}
📅 End Date: ${projectContext.end_date || 'Not set'}
🔄 Status: ${projectContext.status || 'Active'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASKS SUMMARY:
• Total Tasks: ${projectContext.total_tasks}
• Completed: ${projectContext.completed_tasks}
• In Progress: ${projectContext.in_progress_tasks}
• Not Started: ${projectContext.not_started_tasks}
• Overdue: ${projectContext.overdue_tasks}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT ACTIVITIES (Last 7 days):
${projectContext.recent_activities || 'No recent activities'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: "${question}"

Please provide a helpful, professional answer based on the project data above.
- Be concise (2-4 sentences)
- Include specific numbers where relevant
`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful construction project management assistant. Answer questions accurately based on the project data provided.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }
  
  static async answerStakeholderQuestion(projectId, question, userId) {
    try {
      const context = await this.getStakeholderProjectContext(projectId, userId);
      
      if (!context) {
        return "I couldn't find that project. Please make sure you have access to it.";
      }
      
      const prompt = `
You are an AI assistant for project stakeholders in Bochi Construction Suite.

PROJECT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Project: ${context.name}
📊 Progress: ${context.progress}%
📅 Timeline: ${context.start_date || 'Not set'} to ${context.end_date || 'Not set'}
✅ Completed Tasks: ${context.completed_tasks}/${context.total_tasks}
📄 Documents: ${context.document_count || 0}
📝 Meetings: ${context.meeting_count || 0}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: "${question}"

Provide a helpful answer. DO NOT share financial details. Focus on progress, timeline, documents, and meetings.
`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('Stakeholder AI error:', error);
      return "I'm having trouble accessing project information right now.";
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
          p.id,
          p.name,
          p.progress,
          p.status,
          p.start_date,
          p.end_date,
          COUNT(DISTINCT pg.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN pg.status = 'completed' THEN pg.id END) as completed_tasks
        FROM projects p
        LEFT JOIN project_gantt_tasks pg ON p.id = pg.project_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [projectId]);
      
      if (projectResult.rows.length === 0) return null;
      
      const project = projectResult.rows[0];
      
      const docsResult = await db.query(`
        SELECT COUNT(*) as count FROM project_documents WHERE project_id = $1
      `, [projectId]);
      
      const meetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meeting_minutes WHERE project_id = $1
      `, [projectId]);
      
      return {
        name: project.name,
        progress: project.progress || 0,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        total_tasks: parseInt(project.total_tasks) || 0,
        completed_tasks: parseInt(project.completed_tasks) || 0,
        document_count: parseInt(docsResult.rows[0]?.count) || 0,
        meeting_count: parseInt(meetingsResult.rows[0]?.count) || 0
      };
      
    } catch (error) {
      console.error('Error fetching stakeholder project context:', error);
      return null;
    }
  }
  
  static async getProjectContext(projectId, userId) {
    const db = await getDb();
    
    try {
      const projectResult = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.client,
          p.location,
          p.progress,
          p.contract_sum as budget,
          p.status,
          p.start_date,
          p.end_date,
          COALESCE((
            SELECT SUM(amount) FROM expenses WHERE project_id = p.id
          ), 0) as spent
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
      
      const activitiesResult = await db.query(`
        SELECT action, entity_name, created_at 
        FROM user_activities 
        WHERE entity_type = 'project' 
          AND entity_id = $1 
          AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 5
      `, [projectId]);
      
      const recentActivities = activitiesResult.rows.map(a => 
        `• ${a.action} "${a.entity_name}" on ${new Date(a.created_at).toLocaleDateString()}`
      ).join('\n');
      
      return {
        name: project.name,
        client: project.client,
        location: project.location,
        progress: project.progress || 0,
        budget: project.budget,
        spent: project.spent,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        total_tasks: tasks?.total || 0,
        completed_tasks: tasks?.completed || 0,
        in_progress_tasks: tasks?.in_progress || 0,
        not_started_tasks: tasks?.not_started || 0,
        overdue_tasks: tasks?.overdue || 0,
        recent_activities: recentActivities || 'No recent activities'
      };
      
    } catch (error) {
      console.error('Error fetching project context:', error);
      return null;
    }
  }
  
  static async generateProjectSummary(projectId, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      
      if (!context) {
        return "Unable to generate summary: Project not found.";
      }
      
      const prompt = `
Based on this project data, write a brief executive summary (2-3 sentences):

Project: ${context.name}
Progress: ${context.progress}%
Budget: KES ${context.budget?.toLocaleString()} (Spent: KES ${context.spent?.toLocaleString()})
Tasks: ${context.completed_tasks}/${context.total_tasks} completed
Overdue Tasks: ${context.overdue_tasks}

Summary:`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 200
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