// src/app/api/saveRecord/route.ts (Next.js 13)
// or pages/api/saveRecord.ts (Next.js <13)
import { NextResponse } from 'next/server'; // If using Next.js 13 style
// Or import type { NextApiRequest, NextApiResponse } from 'next'; for older style
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json(); // parse JSON from the front end
    // e.g., body = { userId, tripData, groups, photos, etc. }

    // Insert or update records in supabase
    const { data, error } = await supabase
      .from('trips')
      .insert([{ 
        user_id: body.userId,
        title: body.tripData.title,
        // ...
      }])
      .select(); // 'select()' returns the inserted row

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Optionally handle groups, photos, etc. in separate calls or in a transaction

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
