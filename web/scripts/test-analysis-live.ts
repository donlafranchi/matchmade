/**
 * Live test of interpretation pipeline with real Anthropic API call
 * Tests Ticket 2-02 implementation end-to-end
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/prisma';
import { analyzeUserProfile } from '../lib/interpretation/analyze';

async function testLiveAnalysis() {
  console.log('🧪 Testing Live Interpretation Pipeline\n');
  console.log('='  .repeat(60));

  try {
    // Find a user with chat messages
    const contextProfiles = await prisma.contextProfile.findMany({
      include: {
        chatMessages: {
          where: { offRecord: false },
          orderBy: { createdAt: 'asc' }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Find one with at least 10 messages
    const testProfile = contextProfiles.find(
      cp => cp.chatMessages.filter(m => m.role === 'user').length >= 10
    );

    if (!testProfile) {
      console.log('❌ No user found with ≥10 messages for testing');
      console.log('\nℹ️  To test, you need a user who has chatted with the system.');
      console.log('   The test requires at least 10 user messages.\n');
      return;
    }

    const userId = testProfile.userId;
    const contextType = testProfile.contextType;
    const messageCount = testProfile.chatMessages.filter(m => m.role === 'user').length;

    console.log(`✓ Found test user: ${testProfile.user.email}`);
    console.log(`✓ Context: ${contextType}`);
    console.log(`✓ User messages: ${messageCount}`);
    console.log('\n' + '='.repeat(60));
    console.log('Running Analysis...\n');

    // Run the analysis
    const startTime = Date.now();
    const result = await analyzeUserProfile(userId, contextType);
    const duration = Date.now() - startTime;

    if (!result) {
      console.log('❌ Analysis returned null (insufficient confidence or error)');
      console.log('   Check logs above for details.\n');
      return;
    }

    console.log('✅ Analysis Complete!\n');
    console.log('='  .repeat(60));
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s\n`);

    // Display results
    console.log('📊 ANALYSIS RESULTS:\n');

    console.log('--- Attachment Style ---');
    console.log(`Primary: ${result.frameworks.gabor_mate.attachment_style.primary}`);
    console.log(`Confidence: ${(result.frameworks.gabor_mate.attachment_style.confidence * 100).toFixed(0)}%`);
    console.log(`Insight: "${result.frameworks.gabor_mate.attachment_style.insight}"`);
    console.log('Evidence:');
    result.frameworks.gabor_mate.attachment_style.evidence.forEach((e, i) => {
      console.log(`  ${i + 1}. "${e}"`);
    });

    console.log('\n--- Underlying Needs ---');
    console.log(`Primary needs: ${result.frameworks.gabor_mate.underlying_needs.primary.join(', ')}`);
    console.log(`Confidence: ${(result.frameworks.gabor_mate.underlying_needs.confidence * 100).toFixed(0)}%`);
    console.log('Evidence:');
    result.frameworks.gabor_mate.underlying_needs.evidence.forEach((e, i) => {
      console.log(`  ${i + 1}. "${e}"`);
    });

    if (result.frameworks.gabor_mate.trauma_patterns) {
      console.log('\n--- Trauma Patterns ---');
      console.log(`Defense mechanisms: ${result.frameworks.gabor_mate.trauma_patterns.defense_mechanisms.join(', ')}`);
      console.log(`Coping strategies: ${result.frameworks.gabor_mate.trauma_patterns.coping_strategies.join(', ')}`);
      console.log(`Confidence: ${(result.frameworks.gabor_mate.trauma_patterns.confidence * 100).toFixed(0)}%`);
    }

    if (result.frameworks.gabor_mate.authentic_vs_adapted) {
      console.log('\n--- Authentic vs Adapted Self ---');
      console.log(`Indicators: ${result.frameworks.gabor_mate.authentic_vs_adapted.indicators.join(', ')}`);
      console.log(`Confidence: ${(result.frameworks.gabor_mate.authentic_vs_adapted.confidence * 100).toFixed(0)}%`);
      console.log(`Insight: "${result.frameworks.gabor_mate.authentic_vs_adapted.insight}"`);
    }

    console.log('\n--- Summary ---');
    console.log(`"${result.summary}"`);

    console.log('\n' + '='.repeat(60));
    console.log('💾 Verifying Database Storage...\n');

    // Check database
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        interpretations: true,
        rawPatterns: true,
        lastAnalyzed: true
      }
    });

    if (!profile) {
      console.log('⚠️  Profile not found in database');
      return;
    }

    console.log('✓ interpretations stored:', typeof profile.interpretations === 'object');
    console.log('✓ rawPatterns stored:', typeof profile.rawPatterns === 'object');
    console.log('✓ lastAnalyzed updated:', profile.lastAnalyzed !== null);
    console.log(`  Analyzed at: ${profile.lastAnalyzed?.toISOString()}`);

    console.log('\n' + '='.repeat(60));
    console.log('📝 Quality Assessment:\n');

    console.log('Does the analysis feel:');
    console.log('  [ ] Empathetic and non-judgmental?');
    console.log('  [ ] Evidence-based (cites actual user language)?');
    console.log('  [ ] Accurate to the conversation tone?');
    console.log('  [ ] Like someone who deeply understands the user?');
    console.log('  [ ] Free of clinical/diagnostic language?');

    console.log('\n🎉 Test Complete!\n');
    console.log('If the quality looks good, proceed to Ticket 2-03.');
    console.log('If not, adjust the prompt in lib/interpretation/prompts/gabor-mate.ts\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testLiveAnalysis();
