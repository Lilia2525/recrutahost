'use client'

import { useMemo, useCallback } from 'react'
import { Candidate, CandidateStage } from '@/lib/types'
import { KANBAN_STAGES } from '@/lib/constants'

interface KanbanColumn {
  id: CandidateStage
  label: string
  candidates: Candidate[]
}

interface UseKanbanReturn {
  columns: KanbanColumn[]
  moveCandidate: (
    candidateId: string,
    toStage: CandidateStage,
    candidates: Candidate[],
    updateFn: (id: string, data: Partial<Candidate>) => Promise<Candidate | null>
  ) => Promise<void>
}

export function useKanban(candidates: Candidate[]): UseKanbanReturn {
  const columns = useMemo<KanbanColumn[]>(() => {
    return KANBAN_STAGES.map((stage) => ({
      id: stage.id,
      label: stage.title,
      candidates: candidates.filter((c) => c.stage === stage.id),
    }))
  }, [candidates])

  const moveCandidate = useCallback(
    async (
      candidateId: string,
      toStage: CandidateStage,
      _candidates: Candidate[],
      updateFn: (id: string, data: Partial<Candidate>) => Promise<Candidate | null>
    ) => {
      await updateFn(candidateId, { stage: toStage })
    },
    []
  )

  return { columns, moveCandidate }
}
