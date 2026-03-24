const { generateText } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function checkBilling() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY not found in .env.local');
    return;
  }

  console.log('🔍 Checking API Key:', apiKey.substring(0, 8) + '...');
  
  const openai = createOpenAI({ apiKey });

  try {
    console.log('📡 Sending test request to OpenAI...');
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Say hello',
    });
    console.log('✅ SUCCESS! Your API key is working perfectly.');
    console.log('Response:', result.text);
  } catch (error) {
    console.log('\n❌ API ERROR DETECTED:');
    if (error.statusCode === 429) {
      console.log('----------------------------------------------------');
      console.log('TYPE: INSUFFICIENT QUOTA (429)');
      console.log('MEANING: Your OpenAI account has a $0.00 balance.');
      console.log('SOLUTION: Add $5.00 to your account at: https://platform.openai.com/account/billing');
      console.log('----------------------------------------------------');
    }
    console.error('Full Error Details:', error.message);
  }
}

checkBilling();
