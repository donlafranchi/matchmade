/**
 * Minimal Prisma test - uses shared prisma client
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function test() {
  try {
    console.log('Testing Prisma connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const count = await prisma.user.count();
    console.log(`✅ Success! Found ${count} users.`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Failed:', error);
    await prisma.$disconnect();
  }
}

test();
