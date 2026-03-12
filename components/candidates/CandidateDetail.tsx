'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Phone,
  Download,
  ChevronDown,
  Send,
  Trash2,
  Calendar,
  FileText,
  PhoneCall,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScoreBadge, StageBadge, SourceBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Select, Textarea } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/Modal'
import { FormResponses } from './FormResponses'
import { CallAnalysis } from './CallAnalysis'
import { CallRecorder } from './CallRecorder'
import { createClient } from '@/lib/supabase'
import { cn, formatDate, getStageInfo } from '@/lib/utils'
import { KANBAN_STAGES } from '@/lib/constants'
import toast from 'react-hot-toast'
import type {
  Candidate,
  CandidateStage,
  CallRecord,
  FormQuestion,
  FormResponse,
  AIFormAnalysis,
} from '@/lib/types'

type Tab = 'perfil' | 'formulario' | 'llamadas'

interface CandidateDetailProps {
  candidate: Candidate
  onClose: () => void
  onUpdated: (updated: Candidate) => void
  onDeleted: (id: string) => void
}

export function CandidateDetail({
  candidate,
  onClose,
  onUpdated,
  onDeleted,
}: CandidateDetailProps) {
  const [tab, setTab] = useState<Tab>('perfil')
  const [stage, setStage] = useState<CandidateStage>(candidate.stage)
  const [notes, setNotes] = useState(candidate.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [callRecords, setCallRecords] = useState<CallRecord[]>([])
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<AIFormAnalysis | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchExtras()
  }, [candidate.id])

  async function fetchExtras() {
    const [callsRes, qRes, rRes] = await Promise.all([
      supabase
        .from('call_records')
        .select('*')
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false }),
      candidate.job_offer_id
        ? supabase
            .from('form_questions')
            .select('*')
            .eq('job_offer_id', candidate.job_offer_id)
            .order('order_index')
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('form_responses')
        .select('*')
        .eq('candidate_id', candidate.id),
    ])

    if (callsRes.data) setCallRecords(callsRes.data as CallRecord[])
    if (qRes.data) setQuestions(qRes.data as FormQuestion[])
    if (rRes.data) setResponses(rRes.data as FormResponse[])

    if (candidate.ai_analysis) {
      try {
        setAiAnalysis(JSON.parse(candidate.ai_analysis as unknown as string))
      } catch {
        setAiAnalysis(candidate.ai_analysis as unknown as AIFormAnalysis)
      }
    }
  }

  async function handleSave() {
    setSaving(true)
    const { data, error } = await supabase
      .from('candidates')
      .update({ stage, notes })
      .eq('id', candidate.id)
      .select()
      .single()

    setSaving(false)
    if (error) {
      toast.error('Error al guardar')
      return
    }
    onUpdated(data as Candidate)
    toast.success('Guardado')
  }

  async function handleSendFormEmail() {
    if (!candidate.email) return toast.error('Sin email')
    setSendingEmail(true)
    try {
      const res = await fetch('/api/candidates/' + candidate.id + '/send-form', { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Email enviado')
    } catch {
      toast.error('Error al enviar email')
    } finally {
      setSendingEmail(false)
    }
  }

  async function handleDelete() {
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id)
    if (error) {
      toast.error('Error al eliminar')
      return
    }
    onDeleted(candidate.id)
    onClose()
    toast.success('Candidato eliminado')
  }

  function handleRecordingComplete(transcription: string, audioUrl: string, duration: number) {
    fetchExtras()
  }

  const stageInfo = getStageInfo(stage)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[640px] bg-[#111111] border-l border-[#1f1f1f] z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#1f1f1f] flex-shrink-0">
          <div className="flex items-start gap-3">
            <Avatar name={candidate.full_name} size="lg" />
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">{candidate.full_name}</h2>
              {candidate.position && (
                <p className="text-[#6b7280] text-sm">{candidate.position}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <ScoreBadge score={candidate.ai_score} />
                <StageBadge stage={stage} />
                <SourceBadge source={candidate.source} />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1f1f1f] flex-shrink-0 flex-wrap">
          {candidate.email && (
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors"
            >
              <Mail size={13} /> {candidate.email}
            </a>
          )}
          {candidate.phone && (
            <a
              href={`tel:${candidate.phone}`}
              className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors ml-3"
            >
              <Phone size={13} /> {candidate.phone}
            </a>
          )}
          {candidate.cv_url && (
            <a
              href={candidate.cv_url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-[#FFD700] hover:underline"
            >
              <Download size={13} /> Ver CV
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0 border-b border-[#1f1f1f]">
          {(['perfil', 'formulario', 'llamadas'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize',
                tab === t
                  ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                  : 'text-[#6b7280] hover:text-white'
              )}
            >
              {t === 'perfil' && 'Perfil'}
              {t === 'formulario' && `Formulario${candidate.form_completed_at ? ' ✓' : ''}`}
              {t === 'llamadas' && `Llamadas${callRecords.length > 0 ? ` (${callRecords.length})` : ''}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'perfil' && (
            <div className="space-y-5">
              {/* Stage selector */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2 block">
                  Etapa
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as CandidateStage)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
                >
                  {KANBAN_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info fields */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Fecha candidatura', value: formatDate(candidate.created_at) },
                  { label: 'Fuente', value: candidate.source },
                  { label: 'Idiomas', value: candidate.languages?.join(', ') || '—' },
                  { label: 'Formulario', value: candidate.form_completed_at ? formatDate(candidate.form_completed_at) : 'Pendiente' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                    <p className="text-xs text-[#6b7280] mb-0.5">{label}</p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Experience summary */}
              {candidate.experience_summary && (
                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                  <p className="text-xs font-semibold text-[#6b7280] mb-1.5">Resumen IA</p>
                  <p className="text-sm text-[#a0a0a0]">{candidate.experience_summary}</p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2 block">
                  Notas internas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Añade notas sobre este candidato…"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-[#FFD700]/50 placeholder-[#4a4a4a]"
                />
              </div>
            </div>
          )}

          {tab === 'formulario' && (
            <>
              {candidate.form_completed_at ? (
                <FormResponses
                  candidate={candidate}
                  questions={questions}
                  responses={responses}
                  aiAnalysis={aiAnalysis}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto text-[#2a2a2a] mb-3" />
                  <p className="text-[#6b7280] text-sm mb-4">
                    El candidato no ha completado el formulario todavía.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Send size={14} />}
                    onClick={handleSendFormEmail}
                    loading={sendingEmail}
                  >
                    Enviar enlace por email
                  </Button>
                </div>
              )}
            </>
          )}

          {tab === 'llamadas' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Llamadas registradas</h3>
                {candidate.job_offer_id && (
                  <CallRecorder
                    candidateId={candidate.id}
                    jobOfferId={candidate.job_offer_id}
                    onRecordingComplete={handleRecordingComplete}
                  />
                )}
              </div>
              <CallAnalysis callRecords={callRecords} />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-[#1f1f1f] flex-shrink-0">
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#ef4444] transition-colors"
          >
            <Trash2 size={15} /> Eliminar
          </button>

          <Button onClick={handleSave} loading={saving} size="sm">
            Guardar cambios
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar candidato"
        message={`¿Seguro que quieres eliminar a ${candidate.full_name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  )
}
