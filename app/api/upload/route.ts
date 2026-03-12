import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { transcribeAudio } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as 'audio' | 'cv' | null

  if (!file || !type) {
    return NextResponse.json({ error: 'file and type are required' }, { status: 400 })
  }

  const bucket = type === 'audio' ? 'call-recordings' : 'cvs'
  const ext = file.name.split('.').pop() ?? 'bin'
  const filename = `${user.id}/${Date.now()}.${ext}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path)
  const publicUrl = urlData.publicUrl

  let transcription: string | null = null
  if (type === 'audio') {
    transcription = await transcribeAudio(file)
  }

  return NextResponse.json({ url: publicUrl, transcription })
}
