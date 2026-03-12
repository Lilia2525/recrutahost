'use client'

import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { KANBAN_STAGES } from '@/lib/constants'
import type { Candidate, CandidateStage } from '@/lib/types'

interface KanbanBoardProps {
  candidates: Candidate[]
  loading?: boolean
  onCardClick: (candidate: Candidate) => void
  onStageChange: (candidateId: string, newStage: CandidateStage) => Promise<void>
}

export function KanbanBoard({ candidates, loading, onCardClick, onStageChange }: KanbanBoardProps) {
  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStage = destination.droppableId as CandidateStage
    onStageChange(draggableId, newStage)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4 px-1">
        {KANBAN_STAGES.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.id)
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              emoji={stage.emoji}
              color={stage.color}
              candidates={stageCandidates}
              loading={loading}
              onCardClick={onCardClick}
            />
          )
        })}
      </div>
    </DragDropContext>
  )
}
