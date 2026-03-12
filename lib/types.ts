// ─────────────────────────────────────────────────────────────
// RecrutaHost — TypeScript Types
// ─────────────────────────────────────────────────────────────

export type PositionType = 'camarero_sala' | 'ayudante_cocina' | 'camarero_piso' | 'otro'

export type JobOfferStatus = 'active' | 'paused' | 'closed'

export type CandidateSource =
  | 'milanuncios'
  | 'tablon_anuncios'
  | 'jobtoday'
  | 'infojobs'
  | 'email_directo'
  | 'whatsapp'
  | 'manual'
  | 'otro'

export type CandidateStage =
  | 'propuesta_recibida'
  | 'formulario_enviado'
  | 'evaluado_ia'
  | 'pendiente_llamar'
  | 'llamada_realizada'
  | 'dia_prueba'
  | 'descartado'

export type AIRecommendation = 'recommended' | 'maybe' | 'not_recommended'

export type QuestionType = 'short_text' | 'long_text' | 'select' | 'yes_no' | 'number'

export type EmailTemplateType = 'reception_form' | 'discard' | 'interview_invite' | 'trial_day'

export type HistoryAction = 'stage_change' | 'email_sent' | 'form_completed' | 'call_recorded'

// ─── DATABASE MODELS ──────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string | null
  restaurant_name: string | null
  restaurant_description: string | null
  created_at: string
}

export interface JobOffer {
  id: string
  user_id: string
  title: string
  position_type: PositionType
  description: string | null
  requirements: string | null
  conditions: string | null
  location: string | null
  status: JobOfferStatus
  platforms: string[]
  created_at: string
  updated_at: string
  // Joined
  candidates_count?: number
}

export interface Candidate {
  id: string
  user_id: string
  job_offer_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  source: CandidateSource
  stage: CandidateStage
  position: string | null
  experience_summary: string | null
  languages: string[] | null
  ai_score: number | null
  ai_summary: string | null
  ai_recommendation: AIRecommendation | null
  ai_analysis: AIFormAnalysis | null
  discard_reason: string | null
  original_email_body: string | null
  cv_url: string | null
  cv_extracted_text: string | null
  notes: string | null
  form_completed_at: string | null
  created_at: string
  updated_at: string
  // Joined
  job_offer?: JobOffer
  call_count?: number
  form_responses?: FormResponse[]
  call_records?: CallRecord[]
}

export interface FormQuestion {
  id: string
  job_offer_id: string
  question_text: string
  question: string
  question_type: QuestionType
  options: string[] | null
  is_required: boolean
  is_active: boolean
  order_index: number
  ai_weight: number
  ai_ideal_answer: string | null
  created_at: string
}

// One row per question answer
export interface FormResponse {
  id: string
  candidate_id: string
  job_offer_id: string
  question_id: string
  answer: string
  created_at: string
}

export interface CallRecord {
  id: string
  candidate_id: string
  audio_url: string | null
  transcription: string | null
  duration_seconds: number | null
  interviewer_notes: string | null
  ai_score: number | null
  ai_summary: string | null
  ai_strengths: string[] | null
  ai_concerns: string[] | null
  ai_recommendation: AIRecommendation | null
  call_date: string
  created_at: string
}

export interface CandidateHistory {
  id: string
  candidate_id: string
  user_id: string | null
  candidate_name: string | null
  action: HistoryAction
  from_stage: CandidateStage | null
  to_stage: CandidateStage | null
  changed_by: 'user' | 'ai' | 'system'
  reason: string | null
  created_at: string
}

export interface EmailTemplate {
  id: string
  user_id: string
  template_type: EmailTemplateType
  type: string
  subject: string
  body_html: string
  body: string
  created_at: string
  updated_at: string
}

export interface AIRulesConfig {
  min_experience_months?: number
  required_availability?: string[]
  required_languages?: string[]
  auto_discard_threshold?: number
  auto_qualify_threshold?: number
  custom_rules?: string[]
  min_score_to_advance?: number
  auto_discard_below?: number
  required_keywords?: string[]
  disqualifying_keywords?: string[]
  weights?: {
    experience?: number
    availability?: number
    motivation?: number
    communication?: number
  }
}

export interface AIRule {
  id: string
  user_id: string
  job_offer_id: string | null
  rules_config: AIRulesConfig
  created_at: string
  updated_at: string
}

// ─── AI ANALYSIS TYPES ────────────────────────────────────────

export interface AIFormBreakdownItem {
  question: string
  score: number
  weight: number
  reasoning: string
}

export interface AIFormAnalysis {
  score: number
  breakdown: AIFormBreakdownItem[]
  red_flags: string[]
  green_flags: string[]
  recommendation: 'AVANZAR' | 'REVISAR' | 'DESCARTAR'
  summary: string
}

export interface AICallAnalysis {
  score: number
  strengths: string[]
  concerns: string[]
  recommendation: 'DIA_DE_PRUEBA' | 'DESCARTAR'
  summary: string
}

export interface AIExtractResult {
  full_name?: string
  email?: string
  phone?: string
  position?: string
  experience_summary?: string
  languages?: string[]
  summary?: string
}

// ─── KANBAN ───────────────────────────────────────────────────

export interface KanbanColumn {
  id: CandidateStage
  title: string
  emoji: string
  candidates: Candidate[]
}

// ─── DASHBOARD ────────────────────────────────────────────────

export interface DashboardStats {
  total_candidates: number
  form_completed_count: number
  trial_day_count: number
  by_stage: Record<string, number>
}

// ─── API REQUEST / RESPONSE TYPES ────────────────────────────

export interface CreateCandidateInput {
  full_name?: string
  email?: string
  phone?: string
  whatsapp?: string
  source: CandidateSource
  job_offer_id?: string
  stage?: CandidateStage
  original_email_body?: string
  cv_url?: string
}

export interface UpdateCandidateInput {
  full_name?: string
  email?: string
  phone?: string
  whatsapp?: string
  stage?: CandidateStage
  position?: string
  experience_summary?: string
  languages?: string[]
  ai_score?: number
  ai_summary?: string
  ai_recommendation?: AIRecommendation
  ai_analysis?: AIFormAnalysis
  discard_reason?: string
  notes?: string
  cv_extracted_text?: string
  cv_url?: string
  job_offer_id?: string
  form_completed_at?: string
}

export interface CreateJobOfferInput {
  title: string
  position_type: PositionType
  description?: string
  requirements?: string
  conditions?: string
  location?: string
  platforms?: string[]
}
