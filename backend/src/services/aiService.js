const Groq = require('groq-sdk');
const { getDb } = require('../config/database');
const KnowledgeBase = require('./knowledgeBase');
const TrainingDataService = require('./trainingDataService');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AIService {
  /**
   * Answer general questions (no specific project context)
   * Fetches real data from database when possible
   * Uses knowledge base and training data for accuracy
   */
  static async answerGeneralQuestion(question, userId, companyId) {
    try {
      // 1. First, try to answer from real database data
      const dataAnswer = await this.getDataDrivenAnswer(question, companyId);
      if (dataAnswer) {
        return dataAnswer;
      }
      
      // 2. Check knowledge base for app-specific information
      const knowledge = KnowledgeBase.getFormattedKnowledge(question);
      
      // 3. Check similar past questions from training data
      const similarQuestions = await TrainingDataService.getSimilarQuestions(question);
      
      // 4. Build comprehensive prompt with all available context
      let prompt = `
You are an AI assistant for Bochi Construction Suite, a comprehensive construction management platform.

${knowledge ? `\n📚 KNOWLEDGE BASE INFORMATION:\n${knowledge}` : ''}

${similarQuestions && similarQuestions.length > 0 ? `\n📖 SIMILAR QUESTIONS ANSWERED BEFORE:\n${similarQuestions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}` : ''}

USER QUESTION: "${question}"

INSTRUCTIONS:
1. If knowledge base has relevant information, prioritize it for accurate answers
2. If similar questions exist, learn from those answers
3. Be specific about Bochi modules and features (Projects, Income, Expenses, Payroll, Procurement, Stores, etc.)
4. Include step-by-step instructions when applicable
5. For financial questions, use real data from the database
6. Keep answers concise, practical, and actionable (3-5 sentences max)
7. If unsure, say so politely and suggest contacting support
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
      return "I'm having trouble answering that right now. Please try again or contact support.";
    }
  }

  /**
   * Answer questions using real database data
   */
  static async getDataDrivenAnswer(question, companyId) {
    const db = await getDb();
    const lowerQuestion = question.toLowerCase();
    
    console.log('🔍 getDataDrivenAnswer - CompanyId:', companyId);
    console.log('🔍 getDataDrivenAnswer - Question:', question);
    
    try {
      // 1. Financial Questions - USING CORRECT COLUMN NAMES
      const isProfitQuestion = lowerQuestion.includes('profit') || 
                               lowerQuestion.includes('total profit') || 
                               lowerQuestion.includes('how much profit') ||
                               lowerQuestion.includes('profit?');
      
      const isIncomeQuestion = lowerQuestion.includes('income') || 
                               lowerQuestion.includes('revenue') || 
                               lowerQuestion.includes('total income') ||
                               lowerQuestion.includes('how much income');
      
      const isExpenseQuestion = lowerQuestion.includes('expense') || 
                                lowerQuestion.includes('expenses') || 
                                lowerQuestion.includes('total expense') ||
                                lowerQuestion.includes('how much expense') ||
                                lowerQuestion.includes('costs') ||
                                lowerQuestion.includes('spending');
      
      if (isProfitQuestion || isIncomeQuestion || isExpenseQuestion) {
        console.log('📊 Financial question detected');
        
        // FIXED: Use gross_amount for income table
        const income = await db.query(
          `SELECT COALESCE(SUM(gross_amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        
        // FIXED: Use amount for expenses table
        const expenses = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        
        const totalIncome = parseFloat(income.rows[0].total) || 0;
        const totalExpenses = parseFloat(expenses.rows[0].total) || 0;
        const profit = totalIncome - totalExpenses;
        
        console.log(`💰 Income: ${totalIncome}, Expenses: ${totalExpenses}, Profit: ${profit}`);
        
        if (isProfitQuestion) {
          if (profit === 0 && totalIncome === 0 && totalExpenses === 0) {
            return "You don't have any income or expense records yet. Add your income and expenses first to see your profit calculation.";
          }
          return `Your total profit is KES ${profit.toLocaleString()}. (Income: KES ${totalIncome.toLocaleString()}, Expenses: KES ${totalExpenses.toLocaleString()})`;
        }
        if (isIncomeQuestion) {
          if (totalIncome === 0) {
            return "You don't have any income records yet. Add income in the Income module to track your revenue.";
          }
          return `Your total income is KES ${totalIncome.toLocaleString()}.`;
        }
        if (isExpenseQuestion) {
          if (totalExpenses === 0) {
            return "You don't have any expense records yet. Add expenses in the Expenses module to track your spending.";
          }
          return `Your total expenses are KES ${totalExpenses.toLocaleString()}.`;
        }
      }
      
      // 2. Project Questions
      const isProjectCountQuestion = (lowerQuestion.includes('project') || lowerQuestion.includes('projects')) && 
                                     (lowerQuestion.includes('count') || lowerQuestion.includes('how many') || 
                                      lowerQuestion.includes('total') || lowerQuestion.includes('number of'));
      
      if (isProjectCountQuestion) {
        const projects = await db.query(
          `SELECT COUNT(*) as count, 
                  COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                  COUNT(CASE WHEN progress = 100 THEN 1 END) as completed
           FROM projects WHERE company_id = $1`,
          [companyId]
        );
        
        const totalProjects = parseInt(projects.rows[0].count) || 0;
        const activeProjects = parseInt(projects.rows[0].active) || 0;
        const completedProjects = parseInt(projects.rows[0].completed) || 0;
        
        if (totalProjects === 0) {
          return "You don't have any projects yet. Click 'Add Project' in the Projects module to get started.";
        }
        
        return `You have ${totalProjects} total projects. ${activeProjects} are currently active, and ${completedProjects} are completed.`;
      }
      
      // 3. Worker Questions
      if (lowerQuestion.includes('worker') || lowerQuestion.includes('employee') || lowerQuestion.includes('staff')) {
        const workers = await db.query(
          `SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        const workerCount = parseInt(workers.rows[0].count) || 0;
        
        if (workerCount === 0) {
          return "You don't have any workers added yet. Go to the Workers module to add your team members.";
        }
        
        // Get workers by category - FIXED: join with worker_categories
        const workerCategories = await db.query(
          `SELECT wc.name as category, COUNT(*) as count 
           FROM workers w
           JOIN worker_categories wc ON w.category_id = wc.id
           WHERE w.company_id = $1 AND w.is_active = 1 
           GROUP BY wc.name`,
          [companyId]
        );
        
        let response = `You have ${workerCount} active workers.`;
        if (workerCategories.rows.length > 0) {
          response += ` By category: ${workerCategories.rows.map(w => `${w.category}: ${w.count}`).join(', ')}.`;
        }
        return response;
      }
      
      // 4. Payroll Questions
      if (lowerQuestion.includes('payroll')) {
        const payroll = await db.query(`
          SELECT 
            COUNT(*) as count,
            COALESCE(SUM(gross_pay), 0) as total
          FROM payroll_records pr
          JOIN workers w ON pr.worker_id = w.id
          WHERE w.company_id = $1 AND pr.status = 'paid'
        `, [companyId]);
        
        const payrollCount = parseInt(payroll.rows[0].count) || 0;
        const payrollTotal = parseFloat(payroll.rows[0].total) || 0;
        
        if (payrollCount === 0) {
          return "You haven't processed any payroll records yet. Go to the Payroll module to process payroll for your workers.";
        }
        
        let response = `You have processed payroll for ${payrollCount} workers totaling KES ${payrollTotal.toLocaleString()}.`;
        
        const pendingPayroll = await db.query(`
          SELECT COUNT(*) as count, COALESCE(SUM(gross_pay), 0) as total
          FROM payroll_records pr
          JOIN workers w ON pr.worker_id = w.id
          WHERE w.company_id = $1 AND pr.status = 'pending'
        `, [companyId]);
        
        if (pendingPayroll.rows[0].count > 0) {
          response += ` Pending payroll: ${pendingPayroll.rows[0].count} workers totaling KES ${pendingPayroll.rows[0].total?.toLocaleString()}.`;
        }
        return response;
      }
      
      // 5. Procurement / Purchase Order Questions
      if (lowerQuestion.includes('procurement') || lowerQuestion.includes('purchase order') || lowerQuestion.includes('po')) {
        const orders = await db.query(
          `SELECT COUNT(*) as count, 
                  COALESCE(SUM(total_amount), 0) as total,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
           FROM purchase_orders 
           WHERE company_id = $1`,
          [companyId]
        );
        
        const orderCount = parseInt(orders.rows[0].count) || 0;
        const orderTotal = parseFloat(orders.rows[0].total) || 0;
        
        if (orderCount === 0) {
          return "You don't have any purchase orders yet. Create one in the Procurement module.";
        }
        
        let response = `You have ${orderCount} purchase orders totaling KES ${orderTotal.toLocaleString()}.`;
        if (orders.rows[0].pending > 0) {
          response += ` ${orders.rows[0].pending} orders are pending approval.`;
        }
        return response;
      }
      
      // 6. Stores/Inventory Questions
      if (lowerQuestion.includes('stock') || lowerQuestion.includes('inventory') || 
          lowerQuestion.includes('supplies') || lowerQuestion.includes('store')) {
        const supplies = await db.query(
          `SELECT COUNT(*) as count, 
                  COALESCE(SUM(current_stock), 0) as stock
           FROM supplies 
           WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        const itemCount = parseInt(supplies.rows[0].count) || 0;
        
        if (itemCount === 0) {
          return "You don't have any supplies added yet. Add items in the Stores module to track inventory.";
        }
        
        let response = `You have ${itemCount} supply items in your inventory.`;
        
        const lowStock = await db.query(
          `SELECT COUNT(*) as count FROM supplies 
           WHERE company_id = $1 AND current_stock < reorder_level AND is_active = 1`,
          [companyId]
        );
        
        if (lowStock.rows[0].count > 0) {
          response += ` ${lowStock.rows[0].count} items are below reorder level and need restocking.`;
        }
        return response;
      }
      
      // 7. User/Team Questions
      if (lowerQuestion.includes('user') || lowerQuestion.includes('team member')) {
        const users = await db.query(
          `SELECT COUNT(*) as count, 
                  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                  COUNT(CASE WHEN role = 'project_manager' THEN 1 END) as pms
           FROM users 
           WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        const userCount = parseInt(users.rows[0].count) || 0;
        
        if (userCount === 0) {
          return "You don't have any users added yet. Invite users from the Users module.";
        }
        
        return `Your team has ${userCount} active users, including ${users.rows[0].admins} administrators and ${users.rows[0].pms} project managers.`;
      }
      
      // 8. Subscription/Billing Questions
      if (lowerQuestion.includes('subscription') || lowerQuestion.includes('plan') || 
          lowerQuestion.includes('billing') || lowerQuestion.includes('trial')) {
        const sub = await db.query(`
          SELECT sp.plan_name, cs.status, cs.end_date, cs.is_trial, cs.start_date
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.plan_id = sp.id
          WHERE cs.company_id = $1 AND cs.status = 'active'
          ORDER BY cs.created_at DESC LIMIT 1
        `, [companyId]);
        
        if (sub.rows[0]) {
          let response = `You are on the ${sub.rows[0].plan_name} plan.`;
          if (sub.rows[0].is_trial) {
            const daysLeft = Math.ceil((new Date(sub.rows[0].end_date) - new Date()) / (1000 * 60 * 60 * 24));
            response += ` Your trial ends on ${new Date(sub.rows[0].end_date).toLocaleDateString()} (${daysLeft} days remaining).`;
          } else {
            response += ` Your subscription is active and in good standing.`;
          }
          return response;
        }
        return "You don't have an active subscription. Please contact sales@bochi.ke to set up a plan.";
      }
      
      return null;
      
    } catch (error) {
      console.error('Data fetch error:', error);
      return null;
    }
  }

  /**
   * Submit feedback for training
   */
  static async submitFeedback(question, answer, isCorrect, userId) {
    return await TrainingDataService.saveTrainingExample(question, answer, isCorrect, userId);
  }

  /**
   * Answer questions about a specific project (Full access for tenants/admins)
   */
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
  
  /**
   * Answer questions about a project (Limited access for stakeholders)
   */
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

  /**
   * Verify stakeholder has access to a project
   */
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

  /**
   * Get limited project context for stakeholders (no financial data)
   */
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
  
  /**
   * Get all project context data (Full access)
   */
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
          p.budget,
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
  
  /**
   * Generate project summary
   */
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
}

module.exports = AIService;