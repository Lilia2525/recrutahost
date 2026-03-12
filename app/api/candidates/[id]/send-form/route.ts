import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendFormLinkEmail } from '@/lib/email'

type Params = { params: { id: string } }

export async function POST(_request: NextRequest, { params }: Params) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*, job_offer:job_offers(title)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  }

  const formLink = `${process.env.NEXT_PUBLIC_APP_URL}/aplicar/${candidate.job_offer_id}`
  const restaurantName = user.user_metadata?.restaurant_name ?? 'Nuestro restaurante'

  const sent = await sendFormLinkEmail({
    to: candidate.email,
    candidateName: candidate.full_name,
    jobTitle: candidate.job_offer?.title ?? 'el puesto',
    restaurantName,
    formLink,
  })

  if (!sent) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Update stage to formulario_enviado
  await supabase
    .from('candidates')
    .update({ stage: 'formulario_enviado', form_sent_at: new Date().toISOString() })
    .eq('id', params.id)

  return NextResponse.json({ success: true })
}
