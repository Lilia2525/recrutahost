import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

/**
 * Webhook endpoint for Make.com with native Tally integration.
 * Accepts Tally field names (question text) directly from Make's Tally node.
 * user_id comes from env var RECRUTAHOST_USER_ID.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // user_id from body or env var
    const user_id = body.user_id || process.env.RECRUTAHOST_USER_ID
    if (!user_id) {
      return NextResponse.json({ error: 'Falta user_id (configura RECRUTAHOST_USER_ID en Vercel)' }, { status: 400 })
    }

    // Map Tally native field names to internal fields
    const nombre = body['Nombre completo'] || body.nombre || body.full_name
    const telefono = body['Teléfono'] || body['Telefono'] || body.telefono || body.phone
    const email = body['Email'] || body['Email (opcional)'] || body.email
    const puesto = body['¿A qué puesto te presentas?'] || body['¿A qué puesto te presentas?[]'] || body.puesto
    const experiencia = body['¿Cuántos años de experiencia tienes en hostelería?'] || body.experiencia
    const incorporacion = body['¿Podrías incorporarte de forma inmediata?'] || body['¿Podrías incorporarte de forma inmediata?[]'] || body.incorporacion
    const permiso = body['¿Tienes permiso de trabajo en España?'] || body['¿Tienes permiso de trabajo en España?[]'] || body.permiso_trabajo

    // Sala questions
    const menu = body['¿Has trabajado con menú del día, carta o tapeo?'] || body['¿Has trabajado con menú del día, carta o tapeo?[]']
    const afluencia = body['¿Has trabajado en restaurantes con gran afluencia o ritmo alto?'] || body['¿Has trabajado en restaurantes con gran afluencia o ritmo alto?[]']
    const intensos = body['¿Te manejas bien en servicios intensos de sala y coordinación con cocina?'] || body['¿Te manejas bien en servicios intensos de sala y coordinación con cocina?[]']

    // Cocina questions
    const volumen = body['¿Has trabajado en cocinas con mucho volumen de servicio?'] || body['¿Has trabajado en cocinas con mucho volumen de servicio?[]']
    const tareas = body['Marca las tareas con las que tienes experiencia real:'] || body['Marca las tareas con las que tienes experiencia real:[]']
    const menuCarta = body['¿Has trabajado con servicio de menú y también de carta?'] || body['¿Has trabajado con servicio de menú y también de carta?[]']

    // Piso questions
    const habitaciones = body['¿Has limpiado habitaciones completas y zonas comunes?'] || body['¿Has limpiado habitaciones completas y zonas comunes?[]']
    const ritmos = body['¿Te manejas bien con ritmos altos de entradas, salidas y picos de trabajo?'] || body['¿Te manejas bien con ritmos altos de entradas, salidas y picos de trabajo?[]']
    const estandares = body['¿Estás acostumbrad@ a trabajar con estándares de limpieza, orden e higiene?'] || body['¿Estás acostumbrad@ a trabajar con estándares de limpieza, orden e higiene?[]']

    // Final
    const equipo = body['En una frase, ¿cómo te definirías trabajando en equipo?'] || body.equipo

    const source = body.source || 'milanuncios'

    if (!nombre) {
      return NextResponse.json({ error: 'Falta el nombre del candidato' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check duplicate by email or phone
    if (email || telefono) {
      const query = supabase
        .from('candidates')
        .select('id')
        .eq('user_id', user_id)

      if (email) query.eq('email', email)
      else if (telefono) query.eq('phone', telefono)

      const { data: existing } = await query.maybeSingle()
      if (existing) {
        return NextResponse.json({ message: 'El candidato ya existe', candidateId: existing.id })
      }
    }

    // Build form summary with all answers
    const formatVal = (v: unknown) => Array.isArray(v) ? v.join(', ') : v
    const lines = [
      puesto && `Puesto: ${formatVal(puesto)}`,
      experiencia && `Experiencia: ${experiencia} años`,
      incorporacion && `Incorporación inmediata: ${formatVal(incorporacion)}`,
      permiso && `Permiso de trabajo: ${formatVal(permiso)}`,
      menu && `Menú/carta/tapeo: ${formatVal(menu)}`,
      afluencia && `Gran afluencia: ${formatVal(afluencia)}`,
      intensos && `Servicios intensos sala: ${formatVal(intensos)}`,
      volumen && `Cocina alto volumen: ${formatVal(volumen)}`,
      tareas && `Tareas cocina: ${formatVal(tareas)}`,
      menuCarta && `Menú y carta: ${formatVal(menuCarta)}`,
      habitaciones && `Habitaciones/zonas comunes: ${formatVal(habitaciones)}`,
      ritmos && `Ritmos altos: ${formatVal(ritmos)}`,
      estandares && `Estándares limpieza: ${formatVal(estandares)}`,
      equipo && `Trabajo en equipo: ${equipo}`,
    ].filter(Boolean).join('\n')

    // Determine position from puesto
    let position = 'otro'
    const puestoStr = String(formatVal(puesto) || '').toLowerCase()
    if (puestoStr.includes('sala') || puestoStr.includes('camarero')) position = 'camarero_sala'
    else if (puestoStr.includes('cocina') || puestoStr.includes('ayudante')) position = 'ayudante_cocina'
    else if (puestoStr.includes('piso') || puestoStr.includes('limpia')) position = 'camarero_piso'

    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert({
        user_id,
        full_name: nombre,
        email: email || null,
        phone: telefono || null,
        source,
        stage: 'propuesta_recibida',
        position,
        experience_summary: experiencia ? `${experiencia} años en hostelería` : null,
        cv_extracted_text: lines || null,
        form_completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating candidate from Tally:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
