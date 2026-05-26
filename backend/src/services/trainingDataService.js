const { getDb } = require('../config/database');

class TrainingDataService {
  // Store conversation patterns for learning
  static async saveTrainingExample(question, answer, isCorrect, userId) {
    const db = await getDb();
    try {
      await db.query(`
        INSERT INTO ai_training_data (question, answer, is_correct, user_id, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [question, answer, isCorrect, userId]);
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  }
  
  // Get similar past questions to learn from
  static async getSimilarQuestions(question) {
    const db = await getDb();
    try {
      // Simple keyword matching - can be enhanced with vector search
      const keywords = question.toLowerCase().split(' ').slice(0, 5);
      let query = `
        SELECT question, answer, COUNT(*) as relevance
        FROM ai_training_data 
        WHERE is_correct = true
      `;
      
      keywords.forEach((keyword, i) => {
        if (i === 0) query += ` AND (question ILIKE $${i+1}`;
        else query += ` OR question ILIKE $${i+1}`;
        if (i === keywords.length - 1) query += `)`;
      });
      
      query += ` GROUP BY question, answer ORDER BY relevance DESC LIMIT 3`;
      
      const result = await db.query(query, keywords.map(k => `%${k}%`));
      return result.rows;
    } catch (error) {
      console.error('Error finding similar questions:', error);
      return [];
    }
  }
}

module.exports = TrainingDataService;