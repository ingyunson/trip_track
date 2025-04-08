// pages/api/generateLog.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure it's set in .env or environment variables
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { groupData } = req.body;

    // Prepare the messages for your chat completion
    const messages = [
      {
        role: 'system',
        content: 'You are an AI specialized in summarizing travel itineraries...',
      },
      {
        role: 'user',
        content: `Please generate a travel story from these groups: ${JSON.stringify(groupData)}`,
      },
    ];

    // Call the Chat Completions endpoint with the new 4.x style:
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    // Extract the AI-generated text
    const generatedText = response.choices?.[0]?.message?.content;
    return res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'AI generation failed' });
  }
}
