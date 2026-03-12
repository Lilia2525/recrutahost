'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Phone, FileText, Clock, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/utils'
import { ScoreBadge, SourceBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import type { Candidate } from '@/lib/types'

interface CandidateCardProps {
  candidate: Candidate
  index: number
  onClick: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, index, onClick }: CandidateCardProps) {
  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(candidate)}
          className={cn(
            'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3.5 cursor-pointer',
            'hover:border-[#FFD700]/40 hover:bg-[#1f1f1f] transition-all duration-150',
            'select-none',
            snapshot.isDragging && 'shadow-2xl border-[#FFD700]/60 rotate-[1deg] scale-[1.02]'
          )}
        >
          {/* Header row */}
          <div className="flex items-start gap-2.5 mb-2.5">
            <Avatar name={candidate.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {candidate.full_name}
              </p>
              {candidate.position && (
                <p className="text-[#6b7280] text-xs truncate mt-0.5">{candidate.position}</p>
              )}
            </div>
          </div>

          {/* Score + Source */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <ScoreBadge score={candidate.ai_score} />
            <SourceBadge source={candidate.source} />
          </div>

          {/* Indicators row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#4a4a4a]">
              {candidate.cv_url && (
                <span title="CV adjunto">
                  <Paperclip size={13} />
                </span>
              )}
              {candidate.form_completed_at && (
                <span title="Formulario completado">
                  <FileText size={13} className="text-[#6b7280]" />
                </span>
              )}
              {candidate.call_count > 0 && (
                <span title={`${candidate.call_count} llamada(s)`} className="flex items-center gap-0.5">
                  <Phone size={13} className="text-[#6b7280]" />
                  {candidate.call_count > 1 && (
                    <span className="text-[10px] text-[#6b7280]">{candidate.call_count}</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[#4a4a4a]">
              <Clock size={11} />
              <span className="text-[10px]">{formatRelativeDate(candidate.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
