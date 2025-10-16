// Quick test script for intent detection
import { detectIntent } from './backend/src/config/intentResponses.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const testMessages = [
  'I want to talk to a human',
  'i want to talk to human',
  'Can I speak with a real person?',
  'I need human help',
  'talk to a human',
  'connect me with a person',
  'I just want to chat',
  'How are you?',
];

console.log('🧪 Testing Intent Detection\n');
console.log('='.repeat(60));

testMessages.forEach((message, index) => {
  const result = detectIntent(message, 'English');
  console.log(`\n${index + 1}. Message: "${message}"`);
  if (result) {
    console.log(`   ✅ Intent: ${result.intent}`);
    console.log(`   📝 Response: ${result.response.substring(0, 100)}...`);
  } else {
    console.log(`   ❌ No intent detected`);
  }
});

console.log('\n' + '='.repeat(60));

