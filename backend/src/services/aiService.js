const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  /**
   * Answer general questions (no specific project context)
   */
  static async answerGeneralQuestion(question, userId, companyId) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
You are an AI assistant for Bochi Construction Suite, helping construction professionals manage their projects.

USER QUESTION: "${question}"

Provide a helpful, professional answer about construction project management, Bochi features, or general guidance.

If the question asks about specific project data (budget, tasks, progress, timeline), politely explain that the user needs to select a specific project first.

Keep answers concise, practical, and actionable (2-4 sentences max).
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('General AI error:', error);
      return "I'm having trouble answering that right now. Please try again.";
    }
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
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // 2. Build the prompt
      const prompt = `
You are an AI assistant for Bochi Construction Suite, helping construction professionals manage their projects.

PROJECT INFORMATION:
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

Please provide a helpful, professional answer based ONLY on the project data above.
- Be concise (2-4 sentences)
- Include specific numbers where relevant
- If the question asks about something not in the data, say so politely
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
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
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
You are an AI assistant for project stakeholders (clients, consultants) in Bochi Construction Suite.

PROJECT INFORMATION (Limited Access):
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('Stakeholder AI error:', error);
      return "I'm having trouble accessing project information right now.";
    }
  }

  /**
   * Verify stakeholder has access to a project
   */
  static async verifyStakeholderAccess(projectId, userId) {
    const { getDb } = require('../config/database');
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
    const { getDb } = require('../config/database');
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
    const { getDb } = require('../config/database');
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
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
Based on this project data, write a brief executive summary (2-3 sentences):

Project: ${context.name}
Progress: ${context.progress}%
Budget: KES ${context.budget?.toLocaleString()} (Spent: KES ${context.spent?.toLocaleString()})
Tasks: ${context.completed_tasks}/${context.total_tasks} completed
Overdue Tasks: ${context.overdue_tasks}

Summary:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('Error generating summary:', error);
      return "Unable to generate summary at this time.";
    }
  }
  
  /**
   * Suggest next actions based on project status
   */
  static async suggestNextActions(projectId, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
Based on this project data, suggest 3 actionable next steps for the project manager:

Project: ${context.name}
Progress: ${context.progress}%
Overdue Tasks: ${context.overdue_tasks}
Budget Remaining: KES ${(context.budget - context.spent).toLocaleString()}

List 3 specific, actionable recommendations:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return "Unable to generate suggestions at this time.";
    }
  }
  
  /**
   * Get stakeholder-friendly suggestions
   */
  static async suggestStakeholderActions(projectId, userId) {
    try {
      const context = await this.getStakeholderProjectContext(projectId, userId);
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
Based on this project data, suggest 3 helpful updates for a project stakeholder (client/consultant):

Project: ${context.name}
Progress: ${context.progress}%
Completed Tasks: ${context.completed_tasks}/${context.total_tasks}
Documents Available: ${context.document_count}
Meetings Held: ${context.meeting_count}

List 3 positive, reassuring updates about project progress and what to expect next:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('Error generating stakeholder suggestions:', error);
      return "Check the project dashboard for the latest updates.";
    }
  }
}

module.exports = AIService;