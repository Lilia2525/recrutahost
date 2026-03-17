import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

/**
 * Webhook endpoint for Make.com to send Tally form submissions.
 *
 * Expected JSON body from Make:
 * {
 *   "nombre": "Juan Pérez",
 *   "email": "juan@email.com",
 *   "telefono": "612345678",
 *   "experiencia": "2 años en restaurante La Marina",
 *   "disponibilidad": "Completa",
 *   "incorporacion": "Sí",
 *   "permiso_trabajo": "Sí",
 *   "transporte": "Coche",
 *   "idiomas": "Sí",
 *   "notas": "Motivado y con ganas",
 *   "source": "milanuncios",
 *   "user_id": "uuid-of-the-student"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      nombre,
      email,
      telefono,
      experiencia,
      disponibilidad,
      incorporacion,
      permiso_trabajo,
      transporte,
      idiomas,
      notas,
      source = 'milanuncios',
      user_id,
    } = body

    if (!nombre) {
      return NextResponse.json({ error: 'El campo "nombre" es obligatorio' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'El campo "user_id" es obligatorio' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if candidate already exists by email
    if (email) {
      const { data: existing } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', email)
        .eq('user_id', user_id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({
          message: 'El candidato ya existe',
          candidateId: existing.id,
        })
      }
    }

    // Build summary from form answers
    const formSummary = [
      experiencia && `Experiencia: ${experiencia}`,
      disponibilidad && `Disponibilidad: ${disponibilidad}`,
      incorporacion && `Incorporación inmediata: ${incorporacion}`,
      permiso_trabajo && `Permiso de trabajo: ${permiso_trabajo}`,
      transporte && `Transporte: ${transporte}`,
      idiomas && `Idiomas: ${idiomas}`,
      notas && `Notas: ${notas}`,
    ]
      .filter(Boolean)
      .join('\n')

    // Insert candidate
    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert({
        user_id,
        full_name: nombre,
        email: email || null,
        phone: telefono || null,
        source,
        stage: 'propuesta_recibida',
        experience_summary: experiencia || null,
        cv_extracted_text: formSummary || null,
        notes: notas || null,
        form_completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating candidate from Tally:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log in history
    await supabase.from('candidate_history').insert({
      candidate_id: candidate.id,
      user_id,
      candidate_name: nombre,
      action: 'form_completed',
      to_stage: 'propuesta_recibida',
      changed_by: 'system',
      reason: 'Formulario Tally completado',
    })

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      message: `Candidato "${nombre}" creado correctamente`,
    })
  } catch (err) {
    console.error('Tally webhook error:', err)
    return NextResponse.json({ error: 'Error procesando el webhook' }, { status: 500 })
  }
}
