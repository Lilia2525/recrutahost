'use client'

import { CheckCircle, AlertCircle, Play } from 'lucide-react'
import { formatDate, formatDuration } from '@/lib/utils'
import { ScoreBadge, RecommendationBadge } from '@/components/ui/Badge'
import type { CallRecord } from '@/lib/types'

interface CallAnalysisProps {
  callRecords: CallRecord[]
}

export function CallAnalysis({ callRecords }: CallAnalysisProps) {
  if (callRecords.length === 0) {
    return (
      <p className="text-sm text-[#6b7280] text-center py-8">
        Sin llamadas registradas todavía.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {callRecords.map((record) => (
        <div
          key={record.id}
          className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
            <div>
              <p className="text-sm font-semibold text-white">
                Llamada — {formatDate(record.created_at)}
              </p>
              {record.duration_seconds && (
                <p className="text-xs text-[#6b7280]">
                  {formatDuration(record.duration_seconds)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {record.ai_score !== null && record.ai_score !== undefined && (
                <ScoreBadge score={record.ai_score} />
              )}
              {record.ai_recommendation && (
                <RecommendationBadge
                  recommendation={
                    (record.ai_recommendation as string) === 'DIA_DE_PRUEBA'
                      ? 'recommended'
                      : 'not_recommended'
                  }
                />
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {record.ai_summary && (
              <p className="text-sm text-[#a0a0a0]">{record.ai_summary}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {record.ai_strengths && record.ai_strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#22c55e] mb-1.5 uppercase tracking-wide">
                    Puntos fuertes
                  </p>
                  <ul className="space-y-1">
                    {record.ai_strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-[#a0a0a0]">
                        <CheckCircle size={12} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.ai_concerns && record.ai_concerns.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#f59e0b] mb-1.5 uppercase tracking-wide">
                    Preocupaciones
                  </p>
                  <ul className="space-y-1">
                    {record.ai_concerns.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-[#a0a0a0]">
                        <AlertCircle size={12} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {record.transcription && (
              <details className="group">
                <summary className="text-xs text-[#6b7280] cursor-pointer hover:text-white transition-colors">
                  Ver transcripción
                </summary>
                <p className="mt-2 text-xs text-[#6b7280] leading-relaxed whitespace-pre-wrap bg-[#111111] rounded-lg p-3">
                  {record.transcription}
                </p>
              </details>
            )}

            {record.audio_url && (
              <audio controls className="w-full h-8 mt-1" src={record.audio_url} />
            )}

            {record.interviewer_notes && (
              <div className="pt-2 border-t border-[#2a2a2a]">
                <p className="text-xs font-semibold text-[#6b7280] mb-1">Notas de entrevistadora</p>
                <p className="text-xs text-[#a0a0a0]">{record.interviewer_notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
