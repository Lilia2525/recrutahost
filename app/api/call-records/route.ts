import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { candidate_id, audio_url, transcription, interviewer_notes, duration_seconds } = body

  const { data, error } = await supabase
    .from('call_records')
    .insert({
      candidate_id,
      audio_url,
      transcription,
      interviewer_notes,
      duration_seconds,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
