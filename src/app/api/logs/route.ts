// src/app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface LogData {
  id: string;
  group_id: string;
  ai_generated_text?: string;
  edited_text?: string;
  created_at?: string;
}

// Get log by group ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('group_id', groupId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

// Create or update a log
export async function POST(request: Request) {
  try {
    const { groupId, aiGeneratedText, editedText } = await request.json() as {
      groupId: string;
      aiGeneratedText?: string;
      editedText?: string;
    };
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if a log already exists for this group
    const { data: existingLog } = await supabase
      .from('logs')
      .select('id')
      .eq('group_id', groupId)
      .single();

    let result;
    
    if (existingLog) {
      // Update existing log
      result = await supabase
        .from('logs')
        .update({ 
          ai_generated_text: aiGeneratedText,
          edited_text: editedText 
        })
        .eq('id', existingLog.id)
        .select();
    } else {
      // Create new log
      result = await supabase
        .from('logs')
        .insert([{ 
          group_id: groupId,
          ai_generated_text: aiGeneratedText,
          edited_text: editedText 
        }])
        .select();
    }

    const { data, error } = result;

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

// Update an existing log
export async function PATCH(request: Request) {
  try {
    const { id, aiGeneratedText, editedText } = await request.json() as {
      id: string;
      aiGeneratedText?: string;
      editedText?: string;
    };
    
    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    const updateData: Partial<LogData> = {};
    if (aiGeneratedText !== undefined) updateData.ai_generated_text = aiGeneratedText;
    if (editedText !== undefined) updateData.edited_text = editedText;

    const { data, error } = await supabase
      .from('logs')
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