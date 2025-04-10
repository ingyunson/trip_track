// lib/openai.ts
import OpenAI from 'openai';

/**
 * Create a single OpenAI client instance using version 4.x of the openai package.
 * Ensure OPENAI_API_KEY is defined in your environment variables (e.g., .env.local).
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});
