import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase'
import { analyzeFormResponses } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { candidateId } = body

  // Use service client for webhook/public submissions
  const supabase = createServiceClient()

  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .select(`
      *,
      job_offer:job_offers(*),
      form_responses(*, question:form_questions(question))
    `)
    .eq('id', candidateId)
    .single()

  if (candError || !candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  const { data: rulesData } = await supabase
    .from('ai_rules_config')
    .select('*')
    .eq('user_id', candidate.user_id)
    .single()

  const questions = candidate.form_responses?.map((r: any) => r.question?.question ?? '') ?? []
  const responses = candidate.form_responses?.map((r: any) => r.answer ?? '') ?? []

  const analysis = await analyzeFormResponses({
    candidate: {
      full_name: candidate.full_name,
      cv_text: candidate.cv_text,
    },
    jobOffer: candidate.job_offer,
    questions,
    responses,
    cvText: candidate.cv_text,
    rulesConfig: rulesData ?? undefined,
  })

  // Save AI results to candidate
  await supabase
    .from('candidates')
    .update({
      ai_score: analysis.score,
      ai_summary: analysis.summary,
      ai_recommendation: analysis.recommendation,
      stage: analysis.recommendation === 'DESCARTAR' ? 'descartado' : 'formulario_completado',
    })
    .eq('id', candidateId)

  return NextResponse.json(analysis)
}
