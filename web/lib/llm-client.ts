/**
 * Unified LLM client - supports multiple providers
 * - Anthropic (Claude API)
 * - OpenAI-compatible (Ollama, vLLM, OpenAI)
 *
 * Configure via environment variables:
 * - LLM_PROVIDER: 'anthropic' | 'openai' (default: 'anthropic')
 * - LLM_ENDPOINT: API endpoint (for openai provider, default: http://localhost:11434/v1)
 * - LLM_MODEL: Model name (default depends on provider)
 * - ANTHROPIC_API_KEY: Required for anthropic provider
 */

import Anthropic from "@anthropic-ai/sdk";

export type LLMProvider = 'anthropic' | 'openai';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Lazy-initialized Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
  }
  return anthropicClient;
}

/**
 * Get the configured provider
 */
export function getProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase();
  if (provider === 'openai' || provider === 'ollama' || provider === 'vllm') {
    return 'openai';
  }
  return 'anthropic';
}

/**
 * Get the default model for a provider
 */
function getDefaultModel(provider: LLMProvider): string {
  if (provider === 'anthropic') {
    return 'claude-sonnet-4-20250514';
  }
  return 'llama3.2:3b';
}

/**
 * Generate completion using Anthropic API
 */
async function generateAnthropicCompletion(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResponse> {
  const client = getAnthropicClient();
  const model = options.model || process.env.LLM_MODEL || getDefaultModel('anthropic');

  // Anthropic requires system message to be separate
  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  const response = await client.messages.create({
    model,
    max_tokens: options.max_tokens ?? 2000,
    temperature: options.temperature ?? 0.7,
    system: systemMessage?.content,
    messages: nonSystemMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const content = response.content[0]?.type === 'text'
    ? response.content[0].text
    : '';

  return {
    content,
    provider: 'anthropic',
    model,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
  };
}

/**
 * Generate completion using OpenAI-compatible API (Ollama, vLLM, OpenAI)
 */
async function generateOpenAICompletion(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResponse> {
  const endpoint = process.env.LLM_ENDPOINT || 'http://localhost:11434/v1';
  const model = options.model || process.env.LLM_MODEL || getDefaultModel('openai');

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2000,
      stream: options.stream ?? false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || '',
    provider: 'openai',
    model,
    usage: data.usage ? {
      input_tokens: data.usage.prompt_tokens,
      output_tokens: data.usage.completion_tokens,
    } : undefined,
  };
}

/**
 * Generate completion from LLM
 * Automatically routes to the configured provider
 */
export async function generateCompletion(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const provider = options.provider || getProvider();

  try {
    if (provider === 'anthropic') {
      return await generateAnthropicCompletion(messages, options);
    } else {
      return await generateOpenAICompletion(messages, options);
    }
  } catch (error) {
    console.error(`[LLM Client] Error (${provider}):`, error);
    throw error;
  }
}

/**
 * Simple completion (single user message)
 */
export async function generateSimpleCompletion(
  prompt: string,
  options: LLMOptions = {}
): Promise<string> {
  const response = await generateCompletion(
    [{ role: 'user', content: prompt }],
    options
  );
  return response.content;
}

/**
 * Completion with system prompt
 */
export async function generateWithSystem(
  systemPrompt: string,
  userMessage: string,
  options: LLMOptions = {}
): Promise<string> {
  const response = await generateCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    options
  );
  return response.content;
}

/**
 * Run same prompt against multiple providers for comparison
 */
export async function compareProviders(
  messages: LLMMessage[],
  providers: LLMProvider[],
  options: Omit<LLMOptions, 'provider'> = {}
): Promise<Map<LLMProvider, LLMResponse>> {
  const results = new Map<LLMProvider, LLMResponse>();

  const promises = providers.map(async (provider) => {
    try {
      const response = await generateCompletion(messages, { ...options, provider });
      results.set(provider, response);
    } catch (error) {
      console.error(`[LLM Client] ${provider} failed:`, error);
    }
  });

  await Promise.all(promises);
  return results;
}
