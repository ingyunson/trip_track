import { NextResponse } from 'next/server';
import { openai } from '@/lib/openaiClient';

// Add this helper function
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export async function POST(request: Request) {
  try {
    // Modify this section
    const groupData = await Promise.all(groups.map(async group => {
      let imageBase64 = null;
      if (group.coverPhoto?.file) {
        try {
          imageBase64 = await fileToBase64(group.coverPhoto.file);
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }
      
      return {
        id: group.id,
        group_name: group.location,
        earliest_time_stamp: group.startTime?.toISOString(),
        latest_time_stamp: group.endTime?.toISOString(),
        rating: group.rating,
        review: group.review,
        photo_count: group.photos.length,
        image_data: imageBase64
      };
    }));

    // Build a prompt that explicitly requests 500 characters maximum
    const prompt = `
      Create a travel diary entry about the following places I visited. 
      Your response MUST be EXACTLY 500 characters or less (no exceptions).
      
      Visited places:
      ${groupData.map(group => `
      - ${group.group_name}${group.rating ? ` (${group.rating}★)` : ''}
      - Date: ${formatDateRange(group.earliest_time_stamp, group.latest_time_stamp)}
      ${group.review ? `- My notes: "${group.review}"` : ''}
      `).join('\n')}
      
      Write in first person, present tense. Be concise but vivid. Include specific place names.
      REMEMBER: Your ENTIRE response must be 500 CHARACTERS OR LESS.
    `;

    // Call OpenAI with gpt-4o-mini model
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a travel writer who creates extremely concise travel summaries.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,  // Set a safe upper limit
      temperature: 0.7,
    });

    let aiContent = response.choices[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Force truncate to 500 characters if needed
    if (aiContent.length > 500) {
      aiContent = aiContent.substring(0, 497) + '...';
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

// Helper function to format date ranges for the prompt
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return "Unknown";
  
  const start = new Date(startDate);
  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  const end = new Date(endDate);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}