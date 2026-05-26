const TrainingDataService = require('../services/trainingDataService');
const KnowledgeBase = require('../services/knowledgeBase');

const trainingController = {
  // Provide feedback on answer
  submitFeedback: async (req, res) => {
    try {
      const { question, answer, isCorrect } = req.body;
      const userId = req.user.id;
      
      await TrainingDataService.saveTrainingExample(question, answer, isCorrect, userId);
      
      res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get knowledge base stats (admin only)
  getKnowledgeStats: async (req, res) => {
    try {
      const knowledge = KnowledgeBase.getApplicationKnowledge();
      res.json({
        modules: Object.keys(knowledge.modules).length,
        workflows: Object.keys(knowledge.workflows).length,
        troubleshooting: Object.keys(knowledge.troubleshooting).length,
        roles: Object.keys(knowledge.roles).length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = trainingController;