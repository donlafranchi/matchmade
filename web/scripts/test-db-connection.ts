/**
 * Simple database connection test
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/prisma';

async function testConnection() {
  try {
    console.log('Testing database connection...');

    const userCount = await prisma.user.count();
    console.log(`✅ Connection successful! Found ${userCount} users.`);

    const contextProfileCount = await prisma.contextProfile.count();
    console.log(`✅ Found ${contextProfileCount} context profiles.`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
