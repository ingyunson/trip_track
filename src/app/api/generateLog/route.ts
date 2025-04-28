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
    
    // Create messages array with system message
    const messages = [
      { 
        role: 'system', 
        content: 'You are a travel writer who creates personal, subjective travel diaries. Write in first person, present tense, with vivid language about personal impressions.'
      }
    ];
    
    // Build user message with text and images
    const userContent: any[] = [{
      type: 'text',
      text: `Create a subjective travel diary about these ${groupData.length} places I visited. Focus on emotions and impressions. Keep it under 500 characters.`
    }];
    
    // Add each location's information and images
    groupData.forEach((group: any) => {
      userContent.push({
        type: 'text',
        text: `Place: ${group.group_name}${group.rating ? ` (${group.rating}★)` : ''}\nDate: ${formatDateRange(group.earliest_time_stamp, group.latest_time_stamp)}\n${group.review ? `Notes: "${group.review}"` : ''}`
      });
      
      if (group.image_data) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${group.image_data}`,
            detail: 'low'
          }
        });
      }
    });
    
    // Add final instruction
    userContent.push({
      type: 'text',
      text: 'IMPORTANT: Your response must be 500 CHARACTERS OR LESS.'
    });
    
    messages.push({ role: 'user', content: userContent });
    
    // Log how many images are actually being sent
    const imageCount = userContent.filter(item => 
      item.type === 'image_url' && item.image_url?.url
    ).length;
    console.log(`Including ${imageCount} images in the OpenAI request`);
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // This model supports vision
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