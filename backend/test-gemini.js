const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // testing different models
    console.log("Model initialized");
    const result = await model.generateContent("Say hello");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
