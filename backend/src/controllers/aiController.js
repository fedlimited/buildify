const AIService = require('../services/aiService');

const aiController = {
  // Ask AI about a project (Full access for tenants/admins)
  askProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { question } = req.body;
      const userId = req.user.id;
      
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      
      const answer = await AIService.answerProjectQuestion(projectId, question, userId);
      
      res.json({ 
        success: true, 
        answer,
        question,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('AI ask error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Ask AI about a project (Limited access for stakeholders)
  askStakeholder: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { question } = req.body;
      const userId = req.user.id;
      
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      
      // Verify stakeholder has access to this project
      const hasAccess = await AIService.verifyStakeholderAccess(projectId, userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have access to this project' });
      }
      
      const answer = await AIService.answerStakeholderQuestion(projectId, question, userId);
      
      res.json({ 
        success: true, 
        answer,
        question,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Stakeholder AI ask error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Generate project summary (Full access)
  generateSummary: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      const summary = await AIService.generateProjectSummary(projectId, userId);
      
      res.json({ success: true, summary });
      
    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get suggested next actions (Full access)
  suggestActions: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      const suggestions = await AIService.suggestNextActions(projectId, userId);
      
      res.json({ success: true, suggestions });
      
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get stakeholder-friendly suggestions (Limited access)
  suggestStakeholderActions: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      const suggestions = await AIService.suggestStakeholderActions(projectId, userId);
      
      res.json({ success: true, suggestions });
      
    } catch (error) {
      console.error('Stakeholder suggestions error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = aiController;