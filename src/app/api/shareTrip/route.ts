// src/app/api/shareTrip/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { tripId, title, imageUrl, description } = await request.json();
    
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }
    
    // Create a unique share ID - short and readable for URLs
    const shareId = uuidv4().slice(0, 8); 
    
    // In a real app, we'd check if the user is authorized to share this trip
    // Supabase RLS would handle this when properly set up
    
    // Update the trip to be public and set the share ID
    const { data, error } = await supabase
      .from('trips')
      .update({
        is_public: true,
        share_id: shareId,
        shared_title: title,
        shared_image_url: imageUrl,
        shared_description: description || 'Check out my travel log!'
      })
      .eq('id', tripId)
      .select();

    if (error) {
      console.error('Error sharing trip:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/share/${shareId}`;

    return NextResponse.json({ 
      shareLink, 
      shareId,
      data 
    }, { status: 200 });
    
  } catch (err: unknown) {
    console.error('Error in shareTrip API:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}