// src/app/api/shareTrip/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { tripId } = await request.json();
    
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }
    
    // Create a unique share ID
    const shareId = uuidv4().slice(0, 8); 
    
    // Check if trip exists and user is authorized (RLS will handle this)
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single();
    
    if (tripError || !tripData) {
      return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('trips')
      .update({
        is_public: true,
        share_id: shareId,
      })
      .eq('id', tripId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/share/${shareId}`;

    return NextResponse.json({ shareLink, data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}