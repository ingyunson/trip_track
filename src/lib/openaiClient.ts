// src/lib/openaiClient.ts
import OpenAI from 'openai';

// Initialize the OpenAI client with your API key
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
