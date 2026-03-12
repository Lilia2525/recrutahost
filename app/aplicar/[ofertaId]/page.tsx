'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Star, ChevronRight, Check, Loader2 } from 'lucide-react'
import type { JobOffer, FormQuestion } from '@/lib/types'

type Step = 1 | 2 | 3

interface PersonalData {
  full_name: string
  email: string
  phone: string
  cv_text: string
}

export default function AplicarPage() {
  const { ofertaId } = useParams<{ ofertaId: string }>()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [personalData, setPersonalData] = useState<PersonalData>({
    full_name: '',
    email: '',
    phone: '',
    cv_text: '',
  })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: offer } = await supabase
        .from('job_offers')
        .select('*')
        .eq('id', ofertaId)
        .single()
      if (offer) setJobOffer(offer)

      const { data: qs } = await supabase
        .from('form_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index')
      if (qs) {
        setQuestions(qs)
        const init: Record<string, string> = {}
        qs.forEach((q: FormQuestion) => { init[q.id] = '' })
        setAnswers(init)
      }

      setLoading(false)
    }
    load()
  }, [ofertaId])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Find candidate by email (created when form link was sent) or create
      const { data: existing } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', personalData.email)
        .single()

      let candidateId: string

      if (existing) {
        candidateId = existing.id
        await supabase
          .from('candidates')
          .update({
            full_name: personalData.full_name,
            phone: personalData.phone,
            cv_extracted_text: personalData.cv_text,
            stage: 'evaluado_ia',
            form_completed_at: new Date().toISOString(),
          })
          .eq('id', candidateId)
      } else {
        const { data: newCand, error } = await supabase
          .from('candidates')
          .insert({
            full_name: personalData.full_name,
            email: personalData.email,
            phone: personalData.phone,
            cv_text: personalData.cv_text,
            job_offer_id: ofertaId,
            stage: 'formulario_completado',
            form_completed_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        if (error || !newCand) throw error
        candidateId = newCand.id
      }

      // Save form responses
      const responseRows = Object.entries(answers)
        .filter(([, answer]) => answer.trim())
        .map(([question_id, answer]) => ({
          candidate_id: candidateId,
          question_id,
          answer,
        }))

      if (responseRows.length > 0) {
        await supabase.from('form_responses').insert(responseRows)
      }

      // Trigger AI analysis in background
      fetch('/api/ai/analyze-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      })

      setStep(3)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FFD700]" size={32} />
      </div>
    )
  }

  if (!jobOffer) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-semibold">Oferta no encontrada</p>
          <p className="text-[#6b7280] mt-2">El enlace puede haber expirado o ser incorrecto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
          <Star size={16} className="text-black" fill="black" />
        </div>
        <span className="text-white font-bold text-xl">RecrutaHost</span>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step >= s
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-[#1f1f1f] text-[#6b7280]'
                  }`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                <span className={`text-xs ${step >= s ? 'text-white' : 'text-[#6b7280]'}`}>
                  {s === 1 ? 'Datos personales' : 'Cuestionario'}
                </span>
                {s < 2 && <div className="flex-1 h-px bg-[#1f1f1f]" />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6">
          {/* Offer info */}
          {step < 3 && (
            <div className="mb-5 pb-4 border-b border-[#1f1f1f]">
              <p className="text-[#6b7280] text-xs mb-0.5">Aplicando para:</p>
              <p className="text-white font-semibold">{jobOffer.title}</p>
              {jobOffer.location && (
                <p className="text-[#6b7280] text-sm">{jobOffer.location}</p>
              )}
            </div>
          )}

          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg">Datos Personales</h2>
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">Nombre completo *</label>
                <input
                  value={personalData.full_name}
                  onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">Email *</label>
                <input
                  type="email"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6b7280] mb-1.5">CV / Experiencia laboral</label>
                <textarea
                  value={personalData.cv_text}
                  onChange={(e) => setPersonalData({ ...personalData, cv_text: e.target.value })}
                  rows={5}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50 resize-none"
                  placeholder="Cuéntanos tu experiencia, dónde has trabajado, qué sabes hacer..."
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!personalData.full_name || !personalData.email}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#FFC200] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Questions */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold text-lg">Cuestionario</h2>
              {questions.map((q, i) => (
                <div key={q.id}>
                  <label className="block text-sm text-white mb-1.5">
                    {i + 1}. {q.question_text}
                  </label>
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50 resize-none"
                    placeholder="Tu respuesta..."
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-[#2a2a2a] text-[#6b7280] hover:text-white rounded-lg text-sm transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#FFC200] transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Enviando...</>
                  ) : (
                    <>Enviar solicitud <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <Check size={32} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">¡Solicitud enviada!</h2>
                <p className="text-[#6b7280] text-sm mt-2">
                  Gracias {personalData.full_name.split(' ')[0]}. Hemos recibido tu solicitud para{' '}
                  <span className="text-white">{jobOffer.title}</span>. Nos pondremos en contacto contigo
                  si tu perfil encaja con lo que buscamos.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
