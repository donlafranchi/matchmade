/**
 * Test LLM client with multiple providers
 *
 * Usage:
 *   npx tsx scripts/test-llm-client.ts              # Test configured provider
 *   npx tsx scripts/test-llm-client.ts anthropic    # Test Anthropic only
 *   npx tsx scripts/test-llm-client.ts openai       # Test OpenAI-compatible only
 *   npx tsx scripts/test-llm-client.ts compare      # Test and compare both providers
 */

import "dotenv/config";
import {
  generateSimpleCompletion,
  generateWithSystem,
  compareProviders,
  getProvider,
  type LLMProvider,
} from "../lib/llm-client";

const TEST_PROMPT = "What are three key qualities of a healthy relationship? Answer in 2-3 sentences.";
const TEST_SYSTEM = "You are a compassionate relationship counselor.";

async function testProvider(provider: LLMProvider) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing ${provider.toUpperCase()} provider`);
  console.log("=".repeat(60));

  try {
    // Test simple completion
    console.log("\n1. Testing simple completion...");
    const start1 = Date.now();
    const simple = await generateSimpleCompletion(TEST_PROMPT, { provider });
    const time1 = Date.now() - start1;
    console.log(`   Response (${time1}ms):`);
    console.log(`   ${simple.substring(0, 200)}${simple.length > 200 ? "..." : ""}`);

    // Test with system prompt
    console.log("\n2. Testing with system prompt...");
    const start2 = Date.now();
    const withSystem = await generateWithSystem(TEST_SYSTEM, TEST_PROMPT, { provider });
    const time2 = Date.now() - start2;
    console.log(`   Response (${time2}ms):`);
    console.log(`   ${withSystem.substring(0, 200)}${withSystem.length > 200 ? "..." : ""}`);

    console.log(`\n${provider.toUpperCase()} provider test passed`);
    return true;
  } catch (error: any) {
    console.error(`\n${provider.toUpperCase()} provider test FAILED:`);
    console.error(`   ${error.message}`);
    return false;
  }
}

async function compareProvidersTest() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("COMPARING PROVIDERS");
  console.log("=".repeat(60));

  const messages = [
    { role: "system" as const, content: TEST_SYSTEM },
    { role: "user" as const, content: TEST_PROMPT },
  ];

  console.log("\nRunning same prompt against both providers in parallel...\n");
  const start = Date.now();
  const results = await compareProviders(messages, ["anthropic", "openai"]);
  const totalTime = Date.now() - start;

  for (const [provider, response] of results) {
    console.log(`\n--- ${provider.toUpperCase()} (model: ${response.model}) ---`);
    console.log(response.content.substring(0, 300) + (response.content.length > 300 ? "..." : ""));
    if (response.usage) {
      console.log(`   Tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);
    }
  }

  console.log(`\nTotal time: ${totalTime}ms`);
  console.log(`Providers tested: ${results.size}`);
}

async function main() {
  const arg = process.argv[2]?.toLowerCase();

  console.log("LLM Client Test");
  console.log("================");
  console.log(`Default provider: ${getProvider()}`);
  console.log(`LLM_PROVIDER env: ${process.env.LLM_PROVIDER || "(not set)"}`);
  console.log(`LLM_ENDPOINT env: ${process.env.LLM_ENDPOINT || "(not set)"}`);
  console.log(`LLM_MODEL env: ${process.env.LLM_MODEL || "(not set)"}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "set" : "NOT SET"}`);

  if (arg === "anthropic") {
    await testProvider("anthropic");
  } else if (arg === "openai" || arg === "ollama") {
    await testProvider("openai");
  } else if (arg === "compare") {
    await compareProvidersTest();
  } else {
    // Test configured provider
    const provider = getProvider();
    await testProvider(provider);
  }
}

main().catch(console.error);
