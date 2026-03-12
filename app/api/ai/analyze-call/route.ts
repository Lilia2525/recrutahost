import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { analyzeCallTranscription } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { callRecordId, candidateId, interviewerNotes } = body

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*, job_offer:job_offers(*)')
    .eq('id', candidateId)
    .single()

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  const { data: callRecord } = await supabase
    .from('call_records')
    .select('*')
    .eq('id', callRecordId)
    .single()

  if (!callRecord || !callRecord.transcription) {
    return NextResponse.json({ error: 'Call record or transcription not found' }, { status: 404 })
  }

  const analysis = await analyzeCallTranscription({
    candidate: {
      full_name: candidate.full_name,
      cv_text: candidate.cv_text,
    },
    jobOffer: candidate.job_offer,
    transcription: callRecord.transcription,
    interviewerNotes,
    previousScore: candidate.ai_score,
    previousSummary: candidate.ai_summary,
  })

  // Update call record with AI results
  await supabase
    .from('call_records')
    .update({
      ai_score: analysis.score,
      ai_summary: analysis.summary,
      ai_strengths: analysis.strengths,
      ai_concerns: analysis.concerns,
      ai_recommendation: analysis.recommendation,
      interviewer_notes: interviewerNotes,
    })
    .eq('id', callRecordId)

  // Update candidate stage if recommended for trial day
  if (analysis.recommendation === 'DIA_DE_PRUEBA') {
    await supabase
      .from('candidates')
      .update({ stage: 'dia_prueba', ai_score: analysis.score })
      .eq('id', candidateId)
  } else if (analysis.recommendation === 'DESCARTAR') {
    await supabase
      .from('candidates')
      .update({ stage: 'descartado', ai_score: analysis.score })
      .eq('id', candidateId)
  }

  return NextResponse.json(analysis)
}
