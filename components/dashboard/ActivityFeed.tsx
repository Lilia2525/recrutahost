'use client'

import { formatRelativeDate, getStageInfo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { CandidateHistory } from '@/lib/types'

interface ActivityFeedProps {
  items: CandidateHistory[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[#4a4a4a] text-center py-8">Sin actividad reciente.</p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const stageInfo = item.to_stage ? getStageInfo(item.to_stage) : null

        return (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar name={item.candidate_name ?? '?'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                <span className="font-medium">{item.candidate_name}</span>
                {item.action === 'stage_change' && stageInfo && (
                  <span className="text-[#6b7280]">
                    {' '}movido a{' '}
                    <span style={{ color: stageInfo.color }}>
                      {stageInfo.emoji} {stageInfo.title}
                    </span>
                  </span>
                )}
                {item.action === 'email_sent' && (
                  <span className="text-[#6b7280]"> — email enviado</span>
                )}
                {item.action === 'form_completed' && (
                  <span className="text-[#22c55e]"> completó el formulario</span>
                )}
                {item.action === 'call_recorded' && (
                  <span className="text-[#6b7280]"> — llamada registrada</span>
                )}
              </p>
              <p className="text-xs text-[#4a4a4a]">{formatRelativeDate(item.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
