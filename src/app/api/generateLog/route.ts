import { NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';

interface TripGroup {
  id: string;
  group_name: string;
  earliest_time_stamp?: string;
  latest_time_stamp?: string;
  rating?: number | null;
  review?: string;
  representative_location?: string;
  photo_count?: number;
  image_data?: string;
}

export async function POST(request: Request) {
  try {
    const { groupData } = await request.json();
    
    // Focus on a single group (the first one in the array)
    const group = groupData[0];
    
    // Create messages array with system message
    const messages = [
      { 
        role: 'system', 
        content: 'You are a travel writer who creates personal, subjective travel diaries. Write in first person, present tense, with vivid language about personal impressions.'
      }
    ];
    
    // Build user message with text and images for this specific group only
    const userContent: any[] = [{
      type: 'text',
      text: `Create a subjective travel diary about my visit to ${group.group_name}. Focus on emotions and impressions. Keep it under 500 characters.`
    }];
    
    // Add location information for this specific group
    userContent.push({
      type: 'text',
      text: `Place: ${group.group_name}${group.rating ? ` (${group.rating}★)` : ''}\nDate: ${formatDateRange(group.earliest_time_stamp, group.latest_time_stamp)}\n${group.review ? `Notes: "${group.review}"` : ''}`
    });
    
    // Add the image if available
    if (group.image_data) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${group.image_data}`,
          detail: 'low'
        }
      });
    }
    
    // Add instruction for this specific group
    userContent.push({
      type: 'text',
      text: `IMPORTANT: Your response must be 500 CHARACTERS OR LESS. Write a personal diary entry about my experience at ${group.group_name}, mentioning what I saw and how I felt.`
    });
    
    messages.push({ role: 'user', content: userContent });
    
    // Log for debugging
    console.log(`Generating diary for ${group.group_name} with ${group.image_data ? 'image' : 'no image'}`);
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });
    
    let aiContent = response.choices[0]?.message?.content;
    
    if (!aiContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }
    
    // Enforce character limit
    if (aiContent.length > 500) {
      aiContent = aiContent.substring(0, 497) + '...';
    }
    
    return NextResponse.json({ aiText: aiContent }, { status: 200 });
  } catch (err: unknown) {
    console.error('Error in generateLog:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return "Unknown";
  
  const start = new Date(startDate);
  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}