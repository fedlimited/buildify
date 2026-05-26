const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyBdwURIowTaiQDVYjgc-rVQs36QPf_wMic';
 // Your valid key

async function test(modelName) {
  console.log(`Testing: ${modelName}`);
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log(`✅ ${modelName} works! Response:`, response.text());
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed:`, error.message);
    return false;
  }
}

async function runTests() {
  const models = [
    'gemini-1.5-flash',
    'models/gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-1.0-pro',
    'models/gemini-1.0-pro',
  ];
  
  for (const model of models) {
    await test(model);
  }
}

runTests();