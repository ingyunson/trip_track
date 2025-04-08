// pages/api/generateLog.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '../../lib/openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { groupData } = req.body;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are an AI specialized in summarizing travel itineraries...',
      },
      {
        role: 'user',
        content: `Please generate a travel story from these groups: ${JSON.stringify(groupData)}`,
      },
    ];

    // Chat Completions request using OpenAI 4.x
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4', if you have access
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedText = response.choices?.[0]?.message?.content;
    res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI generation failed' });
  }
}
