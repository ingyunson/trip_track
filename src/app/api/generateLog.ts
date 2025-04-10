// src/app/api/generateLog/route.ts
import { NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';

export async function POST(request: Request) {
  try {
    const { groupData } = await request.json();

    // Build prompt based on user's trip info
    const prompt = `
      Please write a travel summary for the following groups:
      ${JSON.stringify(groupData, null, 2)}
    `;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const aiContent = response.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Return the AI-generated text
    return NextResponse.json({ aiText: aiContent }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
