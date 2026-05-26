const { GoogleGenerativeAI } = require('@google/generative-ai');

// You need to set your API key or it will use environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.models.forEach(model => {
      console.log(`  - ${model.name}`);
    });
  } catch(e) { 
    console.log('Error:', e.message); 
  }
}

listModels();