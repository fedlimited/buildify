const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIService {
  /**
   * Answer questions about a specific project
   */
  static async answerProjectQuestion(projectId, question, userId) {
    try {
      // 1. Gather project context
      const projectContext = await this.getProjectContext(projectId, userId);
      
      if (!projectContext) {
        return "I couldn't find that project. Please make sure you have access to it.";
      }
      
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
- Be concise but informative
- Include specific numbers where relevant
- If the question asks about something not in the data, say so politely
- Suggest next steps if appropriate
`;

      // 3. Call OpenAI API
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful construction project management assistant. Answer questions accurately based on the project data provided.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }
  
  /**
   * Get all project context data
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
      
      const prompt = `
Based on this project data, write a brief executive summary (2-3 sentences):

Project: ${context.name}
Progress: ${context.progress}%
Budget: KES ${context.budget?.toLocaleString()} (Spent: KES ${context.spent?.toLocaleString()})
Tasks: ${context.completed_tasks}/${context.total_tasks} completed
Overdue Tasks: ${context.overdue_tasks}

Summary:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 150
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    }
  }
  
  /**
   * Suggest next actions based on project status
   */
  static async suggestNextActions(projectId, userId) {
    try {
      const context = await this.getProjectContext(projectId, userId);
      
      const prompt = `
Based on this project data, suggest 3 actionable next steps for the project manager:

Project: ${context.name}
Progress: ${context.progress}%
Overdue Tasks: ${context.overdue_tasks}
Budget Remaining: KES ${(context.budget - context.spent).toLocaleString()}

List 3 specific, actionable recommendations:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return null;
    }
  }
}

module.exports = AIService;