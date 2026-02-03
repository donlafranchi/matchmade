/**
 * Replay Test Conversation
 *
 * Sends messages from test-messages.json through the chat API
 * to test agent responses and profile extraction.
 *
 * Usage:
 *   1. Log in to the app and get your session cookie
 *   2. Run: SESSION_COOKIE='your-cookie' npx tsx scripts/replay-conversation.ts
 *
 * Edit test-messages.json to change the conversation.
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const CONTEXT_TYPE = process.env.CONTEXT_TYPE || "romantic";
const MESSAGE_DELAY = parseInt(process.env.MESSAGE_DELAY || "2000", 10);

// Load messages from JSON file
const messagesPath = resolve(__dirname, "test-messages.json");
const USER_MESSAGES: string[] = JSON.parse(readFileSync(messagesPath, "utf-8"));

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMessage(message: string, cookie: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      contextType: CONTEXT_TYPE,
      message,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat API error: ${res.status} - ${text}`);
  }

  return res.json();
}

async function main() {
  // Check for session cookie
  if (!process.env.SESSION_COOKIE) {
    console.log("\n⚠️  No SESSION_COOKIE environment variable set.\n");
    console.log("To get your session cookie:");
    console.log("1. Log in to the app at http://localhost:3000");
    console.log("2. Open browser dev tools > Application > Cookies");
    console.log("3. Copy the 'session' cookie value");
    console.log("4. Run: SESSION_COOKIE='session=xxx' npx tsx scripts/replay-conversation.ts\n");
    process.exit(1);
  }

  const cookie = process.env.SESSION_COOKIE;

  console.log("\n🔄 Replay Test Conversation\n");
  console.log(`API: ${API_BASE}`);
  console.log(`Context: ${CONTEXT_TYPE}`);
  console.log(`Messages: ${USER_MESSAGES.length}`);
  console.log(`Delay: ${MESSAGE_DELAY}ms between messages\n`);
  console.log("─".repeat(60));

  for (let i = 0; i < USER_MESSAGES.length; i++) {
    const message = USER_MESSAGES[i];
    const truncated = message.length > 70 ? message.slice(0, 70) + "..." : message;
    console.log(`\n[${i + 1}/${USER_MESSAGES.length}] 👤 ${truncated}`);

    try {
      const result = await sendMessage(message, cookie);

      if (result.agentMessage?.content) {
        const reply = result.agentMessage.content;
        const truncatedReply = reply.length > 100 ? reply.slice(0, 100) + "..." : reply;
        console.log(`         🤖 ${truncatedReply}`);
      }

      if (result.profileUpdated || result.intentUpdated) {
        const updates = [];
        if (result.profileUpdated) updates.push("profile");
        if (result.intentUpdated) updates.push("intent");
        console.log(`         📝 Updated: ${updates.join(", ")}`);
      }

      if (result.completeness) {
        const p = result.completeness.profile;
        const i = result.completeness.intent;
        console.log(`         📊 Completeness: ${p}% profile, ${i}% intent`);
      }

    } catch (error) {
      console.error(`         ❌ Error: ${error}`);
    }

    if (i < USER_MESSAGES.length - 1) {
      await sleep(MESSAGE_DELAY);
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log("\n✅ Done! Check profile at:");
  console.log(`   ${API_BASE}/contexts/${CONTEXT_TYPE}/profile\n`);
}

main().catch(console.error);
