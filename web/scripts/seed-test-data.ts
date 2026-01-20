/**
 * Generate synthetic test data for interpretation pipeline testing
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env FIRST
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '../lib/prisma';

async function seedTestData() {
  console.log('🌱 Seeding test data for interpretation pipeline...\n');

  try {
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'test-interpretation@example.com' }
    });

    // Create fresh test user with profile and context
    const user = await prisma.user.create({
      data: {
        email: 'test-interpretation@example.com',
        name: 'Test User',
        profile: {
          create: {}
        },
        contextProfiles: {
          create: {
            contextType: 'romantic',
            tonePreference: 'balanced'
          }
        }
      },
      include: {
        contextProfiles: true
      }
    });

    console.log(`✓ Created user: ${user.email}`);

    const contextProfile = user.contextProfiles[0];
    console.log(`✓ Created context profile: ${contextProfile.contextType}`);

    // Create synthetic chat messages with realistic therapeutic content
    const messages = [
      "I've been trying to figure out why I keep choosing partners who are emotionally unavailable. It's like I'm drawn to people who can't really be there for me.",
      "When someone gets too close, I find myself pulling away. I tell myself I need space, but maybe I'm just scared of being hurt again.",
      "My last relationship ended because I couldn't express what I needed. I just kept everything inside until I exploded.",
      "I think I learned early on that my needs weren't important. My parents were always busy, so I just became really independent.",
      "Sometimes I wonder if I'm even capable of being in a healthy relationship. I've never really seen one modeled for me.",
      "I notice I get anxious when my partner doesn't text back quickly. It's like I need constant reassurance that they still care.",
      "I want to be vulnerable, but every time I try, I feel this overwhelming fear that I'll be rejected or judged.",
      "I've been told I'm controlling in relationships, but I think I just need to feel safe. When things feel chaotic, I panic.",
      "I realized I often sacrifice my own needs to make my partner happy. Then I resent them for it, which isn't fair.",
      "My therapist mentioned attachment styles, and I think I might be anxiously attached. I always worry people will leave me.",
      "I keep replaying conversations in my head, analyzing every word, trying to figure out if they're losing interest in me.",
      "I want to trust people, but I've been betrayed before. It's hard to let my guard down even when I know someone is trustworthy.",
      "Sometimes I feel like I'm performing a version of myself that I think people will like, rather than just being authentic.",
      "I'm starting to see how my childhood experiences shaped my relationship patterns. It's both scary and liberating to understand this.",
      "I think what I really want is to feel seen and accepted for who I am, not who I think I should be."
    ];

    for (const content of messages) {
      await prisma.chatMessage.create({
        data: {
          contextProfileId: contextProfile.id,
          userId: user.id,
          role: 'user',
          content,
          offRecord: false
        }
      });
    }

    console.log(`✓ Created ${messages.length} chat messages`);
    console.log('\n✅ Test data seeded successfully!');
    console.log(`\nUser ID: ${user.id}`);
    console.log(`Context: ${contextProfile.contextType}`);
    console.log(`Messages: ${messages.length}\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
