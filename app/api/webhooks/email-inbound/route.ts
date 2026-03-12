import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { extractCVData } from '@/lib/openai'

// Webhook for inbound email (e.g., Resend inbound, Postmark)
export async function POST(request: NextRequest) {
  const body = await request.json()

  const from: string = body.from ?? ''
  const subject: string = body.subject ?? ''
  const text: string = body.text ?? body.plain ?? ''
  const html: string = body.html ?? ''

  if (!from) {
    return NextResponse.json({ error: 'No sender' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Extract email address from "Name <email>" format
  const emailMatch = from.match(/<(.+)>/) ?? from.match(/(\S+@\S+)/)
  const email = emailMatch?.[1] ?? from

  // Check if candidate already exists (find by email — no user_id for inbound)
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ message: 'Candidate already exists' })
  }

  // Extract name from "Name <email>" format
  const nameMatch = from.match(/^([^<]+)</)
  const fullName = nameMatch?.[1]?.trim() ?? email.split('@')[0]

  // Use AI to extract CV data from email body
  const aiData = await extractCVData(text || html)

  // Create new candidate (user_id set to service role placeholder — must be linked to an actual user)
  // In production, you'd route to the correct restaurant via the "to" address
  const { data: newCandidate, error } = await supabase
    .from('candidates')
    .insert({
      full_name: aiData?.full_name ?? fullName,
      email,
      phone: aiData?.phone ?? null,
      cv_extracted_text: text || html,
      ai_summary: aiData?.summary ?? null,
      stage: 'propuesta_recibida',
      source: 'email_inbound',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create candidate from inbound email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ candidateId: newCandidate.id })
}
