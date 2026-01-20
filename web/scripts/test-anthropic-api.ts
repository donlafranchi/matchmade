/**
 * Test Anthropic API key and try different models
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error("❌ ANTHROPIC_API_KEY environment variable not set");
  process.exit(1);
}

console.log("🔑 Testing API Key:", apiKey.substring(0, 20) + "...");
console.log("\nTrying different model IDs...\n");

const anthropic = new Anthropic({ apiKey });

const modelsToTry = [
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-sonnet-20241022",
];

async function testModel(modelId: string) {
  try {
    console.log(`Testing ${modelId}...`);
    const message = await anthropic.messages.create({
      model: modelId,
      max_tokens: 10,
      messages: [{ role: "user", content: "Hello" }],
    });
    console.log(`✅ ${modelId} - SUCCESS\n`);
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`❌ ${modelId} - Not Found (404)\n`);
    } else {
      console.log(`❌ ${modelId} - Error: ${error.message}\n`);
    }
    return false;
  }
}

async function runTests() {
  for (const model of modelsToTry) {
    const success = await testModel(model);
    if (success) {
      console.log(`\n🎉 Found working model: ${model}`);
      console.log("\nUpdate lib/interpretation/analyze.ts to use this model ID.");
      break;
    }
  }
}

runTests();
