'use client'

import { CheckCircle, XCircle, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScoreBadge, RecommendationBadge } from '@/components/ui/Badge'
import type { Candidate, FormQuestion, FormResponse, AIFormAnalysis } from '@/lib/types'

interface FormResponsesProps {
  candidate: Candidate
  questions: FormQuestion[]
  responses: FormResponse[]
  aiAnalysis: AIFormAnalysis | null
}

export function FormResponses({ candidate, questions, responses, aiAnalysis }: FormResponsesProps) {
  const responseMap = Object.fromEntries(responses.map((r) => [r.question_id, r.answer]))

  return (
    <div className="space-y-6">
      {/* AI Summary card */}
      {aiAnalysis && (
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Análisis de IA</span>
            <div className="flex items-center gap-2">
              <ScoreBadge score={aiAnalysis.score} />
              <RecommendationBadge recommendation={
                aiAnalysis.recommendation === 'AVANZAR'
                  ? 'recommended'
                  : aiAnalysis.recommendation === 'DESCARTAR'
                  ? 'not_recommended'
                  : 'maybe'
              } />
            </div>
          </div>

          <p className="text-sm text-[#a0a0a0] mb-4">{aiAnalysis.summary}</p>

          <div className="grid grid-cols-2 gap-4">
            {aiAnalysis.green_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#22c55e] mb-1.5 uppercase tracking-wide">
                  Puntos positivos
                </p>
                <ul className="space-y-1">
                  {aiAnalysis.green_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[#a0a0a0]">
                      <CheckCircle size={12} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiAnalysis.red_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#ef4444] mb-1.5 uppercase tracking-wide">
                  Red flags
                </p>
                <ul className="space-y-1">
                  {aiAnalysis.red_flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[#a0a0a0]">
                      <XCircle size={12} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Q&A list */}
      <div className="space-y-3">
        {questions.map((q) => {
          const answer = responseMap[q.id]
          const breakdown = aiAnalysis?.breakdown?.find((b) =>
            b.question.includes(q.question_text.slice(0, 30))
          )

          return (
            <div key={q.id} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-white leading-snug flex-1">
                  {q.question_text}
                </p>
                {breakdown && (
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                      breakdown.score >= 70
                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                        : breakdown.score >= 40
                        ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                        : 'bg-[#ef4444]/15 text-[#ef4444]'
                    )}
                  >
                    {breakdown.score}
                  </span>
                )}
              </div>

              {answer ? (
                <p className="text-sm text-[#a0a0a0]">{answer}</p>
              ) : (
                <p className="text-sm text-[#4a4a4a] italic flex items-center gap-1">
                  <Minus size={12} /> Sin respuesta
                </p>
              )}

              {breakdown?.reasoning && (
                <p className="text-xs text-[#6b7280] mt-2 pt-2 border-t border-[#2a2a2a]">
                  {breakdown.reasoning}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
