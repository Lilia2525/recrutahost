import { CandidateStage, PositionType, CandidateSource } from './types'

// ─── KANBAN STAGES ───────────────────────────────────────────

export const KANBAN_STAGES: {
  id: CandidateStage
  title: string
  emoji: string
  color: string
}[] = [
  { id: 'propuesta_recibida', title: 'Propuesta Recibida', emoji: '📥', color: '#3b82f6' },
  { id: 'formulario_enviado', title: 'Formulario Enviado', emoji: '📋', color: '#f59e0b' },
  { id: 'evaluado_ia', title: 'Evaluado por IA', emoji: '🤖', color: '#8b5cf6' },
  { id: 'pendiente_llamar', title: 'Pendiente de Llamar', emoji: '📞', color: '#FFD700' },
  { id: 'llamada_realizada', title: 'Llamada Realizada', emoji: '🎧', color: '#FFA500' },
  { id: 'dia_prueba', title: 'Día de Prueba', emoji: '✅', color: '#22c55e' },
  { id: 'descartado', title: 'Descartado', emoji: '❌', color: '#ef4444' },
]

// ─── POSITION TYPES ──────────────────────────────────────────

export const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  camarero_sala: 'Camarero/a de Sala',
  ayudante_cocina: 'Ayudante de Cocina',
  camarero_piso: 'Camarero/a de Piso',
  otro: 'Otro',
}

// ─── SOURCES ─────────────────────────────────────────────────

export const SOURCE_LABELS: Record<CandidateSource, string> = {
  milanuncios: 'Milanuncios',
  tablon_anuncios: 'Tablón de Anuncios',
  jobtoday: 'JobToday',
  infojobs: 'InfoJobs',
  email_directo: 'Email Directo',
  whatsapp: 'WhatsApp',
  manual: 'Manual',
  otro: 'Otro',
}

export const SOURCE_COLORS: Record<CandidateSource, string> = {
  milanuncios: '#f59e0b',
  tablon_anuncios: '#8b5cf6',
  jobtoday: '#3b82f6',
  infojobs: '#22c55e',
  email_directo: '#ec4899',
  whatsapp: '#25D366',
  manual: '#a0a0a0',
  otro: '#6b7280',
}

// ─── DEFAULT FORM QUESTIONS ───────────────────────────────────

export const DEFAULT_FORM_QUESTIONS: Record<
  PositionType,
  Omit<{
    question_text: string
    question_type: 'short_text' | 'long_text' | 'select' | 'yes_no' | 'number'
    options?: string[]
    is_required: boolean
    order_index: number
    ai_weight: number
    ai_ideal_answer?: string
  }, 'job_offer_id'>[]
> = {
  camarero_sala: [
    {
      question_text: '¿Tienes experiencia como camarero/a de sala? Si sí, ¿cuánto tiempo?',
      question_type: 'short_text',
      is_required: true,
      order_index: 0,
      ai_weight: 4,
    },
    {
      question_text: '¿Dónde has trabajado anteriormente en hostelería? Nombra los establecimientos.',
      question_type: 'long_text',
      is_required: true,
      order_index: 1,
      ai_weight: 3,
    },
    {
      question_text: '¿Cuál es tu disponibilidad horaria?',
      question_type: 'select',
      options: ['Mañanas', 'Tardes', 'Noches', 'Completa', 'Fines de semana'],
      is_required: true,
      order_index: 2,
      ai_weight: 5,
      ai_ideal_answer: 'Completa',
    },
    {
      question_text: '¿Podrías incorporarte de forma inmediata?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 3,
      ai_weight: 3,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Tienes algún medio de transporte para llegar al trabajo?',
      question_type: 'select',
      options: ['Coche', 'Moto', 'Transporte público', 'A pie', 'Otro'],
      is_required: true,
      order_index: 4,
      ai_weight: 2,
    },
    {
      question_text: '¿Tienes permiso de trabajo en España?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 5,
      ai_weight: 5,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Hablas español con fluidez?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 6,
      ai_weight: 4,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Hay algo más que quieras contarnos sobre ti?',
      question_type: 'long_text',
      is_required: false,
      order_index: 7,
      ai_weight: 1,
    },
  ],
  ayudante_cocina: [
    {
      question_text: '¿Tienes experiencia en cocina? Si sí, ¿cuánto tiempo y en qué tipo de cocina?',
      question_type: 'long_text',
      is_required: true,
      order_index: 0,
      ai_weight: 4,
    },
    {
      question_text: '¿Tienes formación en cocina o manipulación de alimentos?',
      question_type: 'short_text',
      is_required: true,
      order_index: 1,
      ai_weight: 3,
    },
    {
      question_text: '¿Cuál es tu disponibilidad horaria?',
      question_type: 'select',
      options: ['Mañanas', 'Tardes', 'Noches', 'Completa', 'Fines de semana'],
      is_required: true,
      order_index: 2,
      ai_weight: 5,
      ai_ideal_answer: 'Completa',
    },
    {
      question_text: '¿Podrías incorporarte de forma inmediata?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 3,
      ai_weight: 3,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Tienes algún medio de transporte para llegar al trabajo?',
      question_type: 'select',
      options: ['Coche', 'Moto', 'Transporte público', 'A pie', 'Otro'],
      is_required: true,
      order_index: 4,
      ai_weight: 2,
    },
    {
      question_text: '¿Tienes permiso de trabajo en España?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 5,
      ai_weight: 5,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Hay algo más que quieras contarnos?',
      question_type: 'long_text',
      is_required: false,
      order_index: 6,
      ai_weight: 1,
    },
  ],
  camarero_piso: [
    {
      question_text: '¿Tienes experiencia como camarero/a de pisos o en limpieza de hoteles/restaurantes?',
      question_type: 'short_text',
      is_required: true,
      order_index: 0,
      ai_weight: 4,
    },
    {
      question_text: '¿Cuánto tiempo de experiencia tienes en el sector? (en meses)',
      question_type: 'number',
      is_required: true,
      order_index: 1,
      ai_weight: 3,
    },
    {
      question_text: '¿Cuál es tu disponibilidad horaria?',
      question_type: 'select',
      options: ['Mañanas', 'Tardes', 'Noches', 'Completa', 'Fines de semana'],
      is_required: true,
      order_index: 2,
      ai_weight: 5,
      ai_ideal_answer: 'Completa',
    },
    {
      question_text: '¿Podrías incorporarte de forma inmediata?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 3,
      ai_weight: 3,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Tienes algún medio de transporte para llegar al trabajo?',
      question_type: 'select',
      options: ['Coche', 'Moto', 'Transporte público', 'A pie', 'Otro'],
      is_required: true,
      order_index: 4,
      ai_weight: 2,
    },
    {
      question_text: '¿Tienes permiso de trabajo en España?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 5,
      ai_weight: 5,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Hay algo más que quieras contarnos?',
      question_type: 'long_text',
      is_required: false,
      order_index: 6,
      ai_weight: 1,
    },
  ],
  otro: [
    {
      question_text: '¿Cuál es tu experiencia en el sector de hostelería?',
      question_type: 'long_text',
      is_required: true,
      order_index: 0,
      ai_weight: 4,
    },
    {
      question_text: '¿Cuál es tu disponibilidad horaria?',
      question_type: 'select',
      options: ['Mañanas', 'Tardes', 'Noches', 'Completa', 'Fines de semana'],
      is_required: true,
      order_index: 1,
      ai_weight: 5,
    },
    {
      question_text: '¿Podrías incorporarte de forma inmediata?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 2,
      ai_weight: 3,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Tienes permiso de trabajo en España?',
      question_type: 'yes_no',
      is_required: true,
      order_index: 3,
      ai_weight: 5,
      ai_ideal_answer: 'Sí',
    },
    {
      question_text: '¿Hay algo más que quieras contarnos?',
      question_type: 'long_text',
      is_required: false,
      order_index: 4,
      ai_weight: 1,
    },
  ],
}

// ─── AI SCORE THRESHOLDS ─────────────────────────────────────

export const AI_SCORE_COLORS = {
  high: '#22c55e',   // 80-100
  medium: '#f59e0b', // 50-79
  low: '#ef4444',    // 0-49
  none: '#6b7280',   // no score
}

export const getScoreColor = (score: number | null): string => {
  if (score === null) return AI_SCORE_COLORS.none
  if (score >= 80) return AI_SCORE_COLORS.high
  if (score >= 50) return AI_SCORE_COLORS.medium
  return AI_SCORE_COLORS.low
}

export const getScoreLabel = (score: number | null): string => {
  if (score === null) return 'Sin evaluar'
  if (score >= 80) return 'Alto'
  if (score >= 50) return 'Medio'
  return 'Bajo'
}

// ─── DEFAULT EMAIL TEMPLATES ──────────────────────────────────

export const DEFAULT_EMAIL_TEMPLATES = {
  reception_form: {
    subject: 'Recibimos tu candidatura — Siguiente paso',
    body_html: `
<p>Hola {{nombre_candidato}},</p>
<p>Gracias por tu interés en el puesto de <strong>{{puesto}}</strong> en <strong>{{nombre_restaurante}}</strong>.</p>
<p>Hemos recibido tu candidatura y nos gustaría conocerte mejor. Para continuar con el proceso, te pedimos que rellenes este breve formulario:</p>
<p><a href="{{link_formulario}}" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Rellenar formulario</a></p>
<p>El formulario solo te llevará unos minutos y nos ayudará a valorar tu candidatura de forma más completa.</p>
<p>¡Muchas gracias y suerte!</p>
<p>El equipo de {{nombre_restaurante}}</p>
    `.trim(),
  },
  discard: {
    subject: 'Actualización sobre tu candidatura',
    body_html: `
<p>Hola {{nombre_candidato}},</p>
<p>Gracias por tu interés en el puesto de <strong>{{puesto}}</strong> en <strong>{{nombre_restaurante}}</strong>.</p>
<p>Tras revisar tu candidatura, lamentamos informarte que en esta ocasión no vamos a continuar con el proceso de selección.</p>
<p>Te animamos a seguir buscando y te deseamos mucho éxito en tu búsqueda de empleo.</p>
<p>Un saludo,</p>
<p>El equipo de {{nombre_restaurante}}</p>
    `.trim(),
  },
  interview_invite: {
    subject: '¡Te queremos conocer! — Entrevista en {{nombre_restaurante}}',
    body_html: `
<p>Hola {{nombre_candidato}},</p>
<p>¡Buenas noticias! Tu candidatura para el puesto de <strong>{{puesto}}</strong> ha superado el proceso de selección y nos gustaría conocerte en persona.</p>
<p>Te contactaremos en breve para acordar fecha y hora de la entrevista.</p>
<p>Si tienes alguna pregunta, no dudes en responder a este email.</p>
<p>¡Hasta pronto!</p>
<p>El equipo de {{nombre_restaurante}}</p>
    `.trim(),
  },
  trial_day: {
    subject: '¡Estás seleccionado/a! — Día de prueba en {{nombre_restaurante}}',
    body_html: `
<p>Hola {{nombre_candidato}},</p>
<p>¡Enhorabuena! Nos has causado muy buena impresión y queremos invitarte a realizar un <strong>día de prueba</strong> en {{nombre_restaurante}}.</p>
<p>Te contactaremos para confirmar la fecha y los detalles.</p>
<p>Si tienes alguna duda, responde a este email.</p>
<p>¡Te esperamos!</p>
<p>El equipo de {{nombre_restaurante}}</p>
    `.trim(),
  },
}

// ─── ALLOWED FILE TYPES ───────────────────────────────────────

export const ALLOWED_CV_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
export const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'video/webm', 'audio/ogg']
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
