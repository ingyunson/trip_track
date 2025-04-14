// src/app/api/photos/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Get photos by group ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('group_id', groupId)
      .order('time_stamp', { ascending: true });

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

// Create new photo metadata records
export async function POST(request: Request) {
  try {
    const { groupId, photos } = await request.json();
    
    if (!groupId || !photos || !Array.isArray(photos)) {
      return NextResponse.json({ error: 'Group ID and photos array are required' }, { status: 400 });
    }

    // Prepare photos with group_id
    const photosData = photos.map(photo => ({
      group_id: groupId,
      image_url: photo.imageUrl,
      time_stamp: photo.timeStamp,
      latitude: photo.latitude,
      longitude: photo.longitude
    }));

    const { data, error } = await supabase
      .from('photos')
      .insert(photosData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update the group's earliest_time_stamp if needed
    await updateGroupEarliestTimestamp(groupId);

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Helper function to update a group's earliest_time_stamp
async function updateGroupEarliestTimestamp(groupId: string) {
  const { data } = await supabase
    .from('photos')
    .select('time_stamp')
    .eq('group_id', groupId)
    .order('time_stamp', { ascending: true })
    .limit(1);

  if (data && data.length > 0) {
    await supabase
      .from('groups')
      .update({ earliest_time_stamp: data[0].time_stamp })
      .eq('id', groupId);
  }
}

// Delete a photo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // First get the group_id of this photo
    const { data: photoData } = await supabase
      .from('photos')
      .select('group_id')
      .eq('id', id)
      .single();

    if (!photoData) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    const groupId = photoData.group_id;

    // Delete the photo
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update the group's earliest_time_stamp
    await updateGroupEarliestTimestamp(groupId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}