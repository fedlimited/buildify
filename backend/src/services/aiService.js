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
        temperature: 0.3, // Lower temperature for more accurate, consistent responses
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
    
    try {
      // 1. Financial Questions
      if (lowerQuestion.includes('profit') || lowerQuestion.includes('income') || lowerQuestion.includes('expense')) {
        const income = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE company_id = $1`,
          [companyId]
        );
        const expenses = await db.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE company_id = $1`,
          [companyId]
        );
        
        const totalIncome = income.rows[0].total;
        const totalExpenses = expenses.rows[0].total;
        const profit = totalIncome - totalExpenses;
        
        if (lowerQuestion.includes('profit')) {
          return `Your current profit is KES ${profit.toLocaleString()}. (Income: KES ${totalIncome.toLocaleString()}, Expenses: KES ${totalExpenses.toLocaleString()})`;
        }
        if (lowerQuestion.includes('income')) {
          return `Your total income is KES ${totalIncome.toLocaleString()}.`;
        }
        if (lowerQuestion.includes('expense') || lowerQuestion.includes('expenses')) {
          return `Your total expenses are KES ${totalExpenses.toLocaleString()}.`;
        }
      }
      
      // 2. Project Questions
      if ((lowerQuestion.includes('project') || lowerQuestion.includes('projects')) && 
          (lowerQuestion.includes('count') || lowerQuestion.includes('how many') || lowerQuestion.includes('total'))) {
        const projects = await db.query(
          `SELECT COUNT(*) as count FROM projects WHERE company_id = $1`,
          [companyId]
        );
        const activeProjects = await db.query(
          `SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND status = 'Active'`,
          [companyId]
        );
        const completedProjects = await db.query(
          `SELECT COUNT(*) as count FROM projects WHERE company_id = $1 AND progress = 100`,
          [companyId]
        );
        
        return `You have ${projects.rows[0].count} total projects. ${activeProjects.rows[0].count} are active, and ${completedProjects.rows[0].count} are completed.`;
      }
      
      // 3. Worker/Employee Questions
      if (lowerQuestion.includes('worker') || lowerQuestion.includes('employee') || lowerQuestion.includes('staff')) {
        const workers = await db.query(
          `SELECT COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        const workerCategories = await db.query(
          `SELECT category, COUNT(*) as count FROM workers WHERE company_id = $1 AND is_active = 1 GROUP BY category`,
          [companyId]
        );
        
        let response = `You have ${workers.rows[0].count} active workers in your system.`;
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
        
        const pendingPayroll = await db.query(`
          SELECT COUNT(*) as count, COALESCE(SUM(gross_pay), 0) as total
          FROM payroll_records pr
          JOIN workers w ON pr.worker_id = w.id
          WHERE w.company_id = $1 AND pr.status = 'pending'
        `, [companyId]);
        
        let response = `You have processed payroll for ${payroll.rows[0].count} workers totaling KES ${payroll.rows[0].total?.toLocaleString() || 0}.`;
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
        
        let response = `You have ${orders.rows[0].count} purchase orders totaling KES ${orders.rows[0].total?.toLocaleString() || 0}.`;
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
                  COALESCE(SUM(current_stock), 0) as stock,
                  COALESCE(SUM(reorder_level), 0) as reorder_total
           FROM supplies 
           WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        const lowStock = await db.query(
          `SELECT COUNT(*) as count, name, current_stock, reorder_level
           FROM supplies 
           WHERE company_id = $1 AND current_stock < reorder_level AND is_active = 1
           LIMIT 5`,
          [companyId]
        );
        
        let response = `You have ${supplies.rows[0].count} supply items with ${supplies.rows[0].stock} units in stock.`;
        if (lowStock.rows.length > 0) {
          response += ` ${lowStock.rows.length} items are below reorder level`;
          if (lowStock.rows.length <= 3) {
            response += `: ${lowStock.rows.map(i => i.name).join(', ')}`;
          }
          response += `. Consider restocking soon.`;
        }
        return response;
      }
      
      // 7. User/Team Questions
      if (lowerQuestion.includes('user') || lowerQuestion.includes('team member') || 
          lowerQuestion.includes('employee') && !lowerQuestion.includes('worker')) {
        const users = await db.query(
          `SELECT COUNT(*) as count, 
                  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
                  COUNT(CASE WHEN role = 'project_manager' THEN 1 END) as pms
           FROM users 
           WHERE company_id = $1 AND is_active = 1`,
          [companyId]
        );
        
        return `Your team has ${users.rows[0].count} active users, including ${users.rows[0].admins} administrators and ${users.rows[0].pms} project managers.`;
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
      
      // 9. Task Questions
      if (lowerQuestion.includes('task') || lowerQuestion.includes('todo') || lowerQuestion.includes('action item')) {
        const tasks = await db.query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                 COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                 COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started
          FROM project_gantt_tasks
          WHERE company_id = $1
        `, [companyId]);
        
        return `You have ${tasks.rows[0].total} total tasks across all projects. ${tasks.rows[0].completed} completed, ${tasks.rows[0].in_progress} in progress, ${tasks.rows[0].not_started} not started.`;
      }
      
      // 10. Document Questions
      if (lowerQuestion.includes('document') || lowerQuestion.includes('file') || lowerQuestion.includes('upload')) {
        const docs = await db.query(
          `SELECT COUNT(*) as count FROM project_documents WHERE company_id = $1`,
          [companyId]
        );
        
        return `You have ${docs.rows[0].count} documents stored in the system across all projects.`;
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
      // 1. Gather project context
      const projectContext = await this.getProjectContext(projectId, userId);
      
      if (!projectContext) {
        return "I couldn't find that project. Please make sure you have access to it.";
      }
      
      // 2. Check knowledge base for project-related help
      const knowledge = KnowledgeBase.getFormattedKnowledge(question);
      
      // 3. Build the prompt with real data
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please provide a helpful, professional answer based on the project data above.
- Be concise (2-4 sentences)
- Include specific numbers where relevant
- If the question asks about something not in the data, say so politely
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
You are an AI assistant for project stakeholders (clients, consultants) in Bochi Construction Suite.

PROJECT INFORMATION (Limited Access - Real Data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Project: ${context.name}
📊 Progress: ${context.progress}%
📅 Timeline: ${context.start_date || 'Not set'} to ${context.end_date || 'Not set'}
✅ Completed Tasks: ${context.completed_tasks}/${context.total_tasks}
📄 Documents: ${context.document_count || 0}
📝 Meetings: ${context.meeting_count || 0}
📋 Recent Updates: ${context.recent_updates || 'No recent updates'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USER QUESTION: "${question}"

Provide a helpful answer. DO NOT share financial details (costs, budget, payments).
Focus on progress, timeline, documents, meetings, and task completion.
Be professional, transparent, and reassuring (2-4 sentences).
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
      
      // Get document count
      const docsResult = await db.query(`
        SELECT COUNT(*) as count FROM project_documents WHERE project_id = $1
      `, [projectId]);
      
      // Get meeting count
      const meetingsResult = await db.query(`
        SELECT COUNT(*) as count FROM meeting_minutes WHERE project_id = $1
      `, [projectId]);
      
      // Get recent updates
      const updatesResult = await db.query(`
        SELECT action, created_at FROM user_activities 
        WHERE entity_type = 'project' AND entity_id = $1
        ORDER BY created_at DESC LIMIT 3
      `, [projectId]);
      
      const recentUpdates = updatesResult.rows.map(u => 
        `• ${u.action} on ${new Date(u.created_at).toLocaleDateString()}`
      ).join('\n');
      
      return {
        name: project.name,
        progress: project.progress || 0,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        total_tasks: parseInt(project.total_tasks) || 0,
        completed_tasks: parseInt(project.completed_tasks) || 0,
        document_count: parseInt(docsResult.rows[0]?.count) || 0,
        meeting_count: parseInt(meetingsResult.rows[0]?.count) || 0,
        recent_updates: recentUpdates || 'No recent updates'
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
      // Get project basic info
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
      
      // Get tasks summary
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
      
      // Get recent activities
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