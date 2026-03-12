-- RecrutaHost — Initial Schema Migration
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABLE: users (extends Supabase Auth)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  restaurant_name TEXT,
  restaurant_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: job_offers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position_type TEXT NOT NULL CHECK (position_type IN ('camarero_sala', 'ayudante_cocina', 'camarero_piso', 'otro')),
  description TEXT,
  requirements TEXT,
  conditions TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  platforms TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: candidates
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT 'Desconocido',
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  source TEXT NOT NULL DEFAULT 'otro' CHECK (source IN ('milanuncios', 'tablon_anuncios', 'jobtoday', 'infojobs', 'email_directo', 'whatsapp', 'manual', 'otro')),
  stage TEXT NOT NULL DEFAULT 'propuesta_recibida' CHECK (stage IN ('propuesta_recibida', 'formulario_enviado', 'evaluado_ia', 'pendiente_llamar', 'llamada_realizada', 'dia_prueba', 'descartado')),
  position TEXT,
  experience_summary TEXT,
  languages TEXT[],
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_summary TEXT,
  ai_recommendation TEXT CHECK (ai_recommendation IN ('recommended', 'maybe', 'not_recommended')),
  ai_analysis JSONB,
  discard_reason TEXT,
  original_email_body TEXT,
  cv_url TEXT,
  cv_extracted_text TEXT,
  notes TEXT,
  form_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: form_questions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.form_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('short_text', 'long_text', 'select', 'yes_no', 'number')),
  options JSONB,
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  ai_weight INTEGER DEFAULT 1 CHECK (ai_weight >= 1 AND ai_weight <= 5),
  ai_ideal_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: form_responses (one row per question answer)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: call_records
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  duration_seconds INTEGER,
  interviewer_notes TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_summary TEXT,
  ai_strengths TEXT[],
  ai_concerns TEXT[],
  ai_recommendation TEXT CHECK (ai_recommendation IN ('recommended', 'maybe', 'not_recommended')),
  call_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: candidate_history
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  candidate_name TEXT,
  action TEXT NOT NULL DEFAULT 'stage_change' CHECK (action IN ('stage_change', 'email_sent', 'form_completed', 'call_recorded')),
  from_stage TEXT,
  to_stage TEXT,
  changed_by TEXT NOT NULL DEFAULT 'user' CHECK (changed_by IN ('user', 'ai', 'system')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: email_templates
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('reception_form', 'discard', 'interview_invite', 'trial_day')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: ai_rules
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_offer_id UUID REFERENCES public.job_offers(id) ON DELETE CASCADE,
  rules_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_candidates_user_stage ON public.candidates(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_candidates_user_offer ON public.candidates(user_id, job_offer_id);
CREATE INDEX IF NOT EXISTS idx_candidate_history_candidate ON public.candidate_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_history_user ON public.candidate_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_questions_offer ON public.form_questions(job_offer_id, order_index);
CREATE INDEX IF NOT EXISTS idx_form_responses_candidate ON public.form_responses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_question ON public.form_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_call_records_candidate ON public.call_records(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_user ON public.job_offers(user_id, status);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rules ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY "users_own" ON public.users FOR ALL USING (auth.uid() = id);

-- job_offers: own rows
CREATE POLICY "job_offers_own" ON public.job_offers FOR ALL USING (auth.uid() = user_id);

-- candidates: own rows
CREATE POLICY "candidates_own" ON public.candidates FOR ALL USING (auth.uid() = user_id);

-- form_questions: readable publicly (for /aplicar page), writable by owner
CREATE POLICY "form_questions_public_read" ON public.form_questions FOR SELECT USING (true);
CREATE POLICY "form_questions_owner_write" ON public.form_questions FOR INSERT USING (
  auth.uid() = (SELECT user_id FROM public.job_offers WHERE id = job_offer_id)
);
CREATE POLICY "form_questions_owner_update" ON public.form_questions FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM public.job_offers WHERE id = job_offer_id)
);
CREATE POLICY "form_questions_owner_delete" ON public.form_questions FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM public.job_offers WHERE id = job_offer_id)
);

-- form_responses: public insert (candidates submit), owner reads
CREATE POLICY "form_responses_public_insert" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "form_responses_owner_read" ON public.form_responses FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.candidates WHERE id = candidate_id)
);
CREATE POLICY "form_responses_owner_update" ON public.form_responses FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM public.candidates WHERE id = candidate_id)
);

-- call_records: own rows via candidate ownership
CREATE POLICY "call_records_own" ON public.call_records FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.candidates WHERE id = candidate_id)
);

-- candidate_history: own rows via user_id
CREATE POLICY "candidate_history_own" ON public.candidate_history FOR ALL USING (
  auth.uid() = user_id
);

-- email_templates: own rows
CREATE POLICY "email_templates_own" ON public.email_templates FOR ALL USING (auth.uid() = user_id);

-- ai_rules: own rows
CREATE POLICY "ai_rules_own" ON public.ai_rules FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-create user profile on signup
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: updated_at auto-update
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_job_offers_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ai_rules_updated_at BEFORE UPDATE ON public.ai_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run these via Supabase dashboard or API)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('call-recordings', 'call-recordings', false);
