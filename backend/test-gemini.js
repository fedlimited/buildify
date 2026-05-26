const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test different model names
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}`);
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Hello, I am working!'");
    const response = await result.response;
    console.log(`✅ SUCCESS: ${response.text()}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing Gemini models...\n');
  
  const modelsToTest = [
    'gemini-1.5-pro',
    'models/gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-1.5-flash',
    'gemini-pro',
    'models/gemini-pro',
    'gemini-1.0-pro',
    'models/gemini-1.0-pro',
  ];
  
  for (const model of modelsToTest) {
    await testModel(model);
  }
}

runTests();