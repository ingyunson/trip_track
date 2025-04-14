// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface GroupData {
  id: string;
  trip_id: string;
  group_name?: string;
  rating?: number;
  review?: string;
  created_at?: string;
  sort_order?: number;
  earliest_time_stamp?: string;
  representative_location?: string;
}

interface GroupInput {
  name?: string;
  earliestTimeStamp?: string;
  representativeLocation?: string;
}

// Get groups by trip ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    
    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('trip_id', tripId)
      .order('earliest_time_stamp', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Create new groups
export async function POST(request: Request) {
  try {
    const { tripId, groups } = await request.json() as {
      tripId: string;
      groups: GroupInput[];
    };
    
    if (!tripId || !groups || !Array.isArray(groups)) {
      return NextResponse.json({ error: 'Trip ID and groups array are required' }, { status: 400 });
    }

    // Prepare groups data with trip_id
    const groupsData = groups.map((group, index) => ({
      trip_id: tripId,
      group_name: group.name || `Group ${index + 1}`,
      earliest_time_stamp: group.earliestTimeStamp,
      representative_location: group.representativeLocation,
      sort_order: index
    }));

    const { data, error } = await supabase
      .from('groups')
      .insert(groupsData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Update a group
export async function PATCH(request: Request) {
  try {
    const { id, groupName, rating, review } = await request.json() as {
      id: string;
      groupName?: string;
      rating?: number;
      review?: string;
    };
    
    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const updateData: Partial<GroupData> = {};
    if (groupName !== undefined) updateData.group_name = groupName;
    if (rating !== undefined) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;

    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Delete a group
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}