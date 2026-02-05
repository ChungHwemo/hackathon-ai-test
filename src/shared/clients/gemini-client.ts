import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiConfig, GeminiMessage } from '../types/index.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TIMEOUT_MS = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly isRetryable: boolean
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('429') || 
           message.includes('503') || 
           message.includes('timeout') ||
           message.includes('network');
  }
  return false;
}

export class GeminiClient {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(config: GeminiConfig) {
    if (!config.apiKey?.trim()) {
      throw new GeminiError('API key is required', 'INVALID_CONFIG', false);
    }
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.model ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async generateText(prompt: string): Promise<string> {
    if (!prompt?.trim()) {
      throw new GeminiError('Prompt cannot be empty', 'INVALID_INPUT', false);
    }
    return this.executeWithRetry(() => this.doGenerateText(prompt));
  }

  private async doGenerateText(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await this.withTimeout(
      model.generateContent(prompt),
      this.timeoutMs
    );
    return result.response.text();
  }

  async chat(messages: GeminiMessage[]): Promise<string> {
    if (!messages?.length) {
      throw new GeminiError('Messages cannot be empty', 'INVALID_INPUT', false);
    }
    return this.executeWithRetry(() => this.doChat(messages));
  }

  private async doChat(messages: GeminiMessage[]): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const chat = model.startChat({ history: messages.slice(0, -1) });
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) throw new GeminiError('No messages provided', 'INVALID_INPUT', false);
    const result = await this.withTimeout(
      chat.sendMessage(lastMessage.parts[0]?.text ?? ''),
      this.timeoutMs
    );
    return result.response.text();
  }

  async classifyText(text: string, categories: string[]): Promise<string> {
    if (!text?.trim()) {
      throw new GeminiError('Text cannot be empty', 'INVALID_INPUT', false);
    }
    if (!categories?.length) {
      throw new GeminiError('Categories cannot be empty', 'INVALID_INPUT', false);
    }
    const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}.
Only respond with the category name, nothing else.

Text: ${text}`;
    return this.generateText(prompt);
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (!isRetryableError(error) || attempt === MAX_RETRIES) {
          throw new GeminiError(
            lastError.message,
            'API_ERROR',
            isRetryableError(error)
          );
        }
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
    throw lastError;
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new GeminiError('Request timeout', 'TIMEOUT', true)), ms)
    );
    return Promise.race([promise, timeout]);
  }
}
