// src/app/api/shareTrip/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { tripId } = await request.json();
    // Create a unique share ID
    const shareId = uuidv4().slice(0, 8); 
    // or any custom slug/shortid

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

    return NextResponse.json({ shareLink: `/share/${shareId}`, data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
