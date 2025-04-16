// src/app/api/generateLog/route.ts
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
}

export async function POST(request: Request) {
  try {
    const { groupData } = await request.json() as { groupData: TripGroup[] };
    
    if (!groupData || !Array.isArray(groupData)) {
      return NextResponse.json({ error: 'Group data array is required' }, { status: 400 });
    }

    // Build a more structured prompt for better results
    const prompt = buildTravelLogPrompt(groupData);

    // Call OpenAI (mock in this case)
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
      console.error('Error generating travel log:', err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

// Helper function to build a better prompt for the OpenAI API
function buildTravelLogPrompt(groupData: TripGroup[]): string {
  // Sort groups by earliest_time_stamp
  const sortedGroups = [...groupData].sort((a, b) => {
    if (!a.earliest_time_stamp) return -1;
    if (!b.earliest_time_stamp) return 1;
    return new Date(a.earliest_time_stamp).getTime() - new Date(b.earliest_time_stamp).getTime();
  });
  
  const locations = sortedGroups.map(g => g.group_name || g.representative_location || 'Unknown location').join(', ');
  
  const groupDescriptions = sortedGroups.map(group => {
    const date = group.earliest_time_stamp 
      ? new Date(group.earliest_time_stamp).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'Unknown date';
      
    const rating = group.rating ? `Rating: ${group.rating}/5` : '';
    const review = group.review ? `Review: "${group.review}"` : '';
    
    return `
    Location: ${group.group_name || group.representative_location || 'Unnamed location'}
    Date: ${date}
    ${rating}
    ${review}
    `;
  }).join('\n');

  return `
  Please write an engaging and personal travel log based on the following itinerary.
  Write in first person as if you've visited these places. Create a cohesive narrative that flows
  naturally between the locations. Incorporate the ratings and reviews into your narrative where provided.
  
  Itinerary Overview: ${locations}
  
  Detailed Itinerary:
  ${groupDescriptions}
  
  Please format the travel log with appropriate sections. Make it personal, vivid, and engaging.
  `;
}