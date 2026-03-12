'use client'

import { Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { CandidateCard } from './CandidateCard'
import { CandidateCardSkeleton } from '@/components/ui/Skeleton'
import type { Candidate } from '@/lib/types'

interface KanbanColumnProps {
  id: string
  title: string
  emoji: string
  color: string
  candidates: Candidate[]
  loading?: boolean
  onCardClick: (candidate: Candidate) => void
}

export function KanbanColumn({
  id,
  title,
  emoji,
  color,
  candidates,
  loading,
  onCardClick,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-[260px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-base leading-none">{emoji}</span>
        <span className="text-sm font-semibold text-white truncate flex-1">{title}</span>
        <span
          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}25`, color }}
        >
          {candidates.length}
        </span>
      </div>

      {/* Colored top bar */}
      <div
        className="h-0.5 rounded-full mb-3 mx-1"
        style={{ backgroundColor: color, opacity: 0.6 }}
      />

      {/* Drop zone */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 min-h-[120px] rounded-xl p-2 space-y-2 transition-colors duration-150',
              snapshot.isDraggingOver ? 'bg-[#1a1a1a]' : 'bg-transparent'
            )}
            style={
              snapshot.isDraggingOver
                ? { outline: `1px dashed ${color}50`, outlineOffset: '-1px' }
                : {}
            }
          >
            {loading ? (
              <>
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
              </>
            ) : candidates.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[#3a3a3a] text-xs">
                Sin candidatos
              </div>
            ) : (
              candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  onClick={onCardClick}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
