import { cn } from '@/lib/utils'
import { getScoreColor } from '@/lib/constants'
import { CandidateStage, AIRecommendation } from '@/lib/types'
import { KANBAN_STAGES } from '@/lib/constants'

interface BadgeProps {
  className?: string
  children: React.ReactNode
  color?: string
  variant?: 'default' | 'outline'
}

export function Badge({ className, children, color, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
        variant === 'outline' ? 'border' : '',
        className
      )}
      style={
        color
          ? variant === 'outline'
            ? { borderColor: color, color }
            : { backgroundColor: `${color}20`, color }
          : undefined
      }
    >
      {children}
    </span>
  )
}

// ─── SCORE BADGE ──────────────────────────────────────────────
export function ScoreBadge({ score }: { score: number | null }) {
  const color = getScoreColor(score)
  if (score === null) {
    return (
      <Badge color="#6b7280" variant="outline" className="text-[#6b7280]">
        Sin evaluar
      </Badge>
    )
  }
  return (
    <Badge color={color}>
      <span className="font-bold">{score}</span>
      <span className="opacity-70">/100</span>
    </Badge>
  )
}

// ─── STAGE BADGE ──────────────────────────────────────────────
export function StageBadge({ stage }: { stage: CandidateStage }) {
  const info = KANBAN_STAGES.find((s) => s.id === stage)
  if (!info) return null
  return (
    <Badge color={info.color}>
      {info.emoji} {info.title}
    </Badge>
  )
}

// ─── RECOMMENDATION BADGE ─────────────────────────────────────
export function RecommendationBadge({
  recommendation,
}: {
  recommendation: AIRecommendation | null
}) {
  if (!recommendation) return null
  const map = {
    recommended: { label: 'Recomendado', color: '#22c55e' },
    maybe: { label: 'Revisar', color: '#f59e0b' },
    not_recommended: { label: 'No recomendado', color: '#ef4444' },
  }
  const info = map[recommendation]
  return <Badge color={info.color}>{info.label}</Badge>
}

// ─── SOURCE BADGE ─────────────────────────────────────────────
import { SOURCE_LABELS, SOURCE_COLORS } from '@/lib/constants'
import { CandidateSource } from '@/lib/types'

export function SourceBadge({ source }: { source: CandidateSource }) {
  return (
    <Badge color={SOURCE_COLORS[source]} variant="outline">
      {SOURCE_LABELS[source]}
    </Badge>
  )
}
