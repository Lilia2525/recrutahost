'use client'

import { Users, FileText, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardStats } from '@/lib/types'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  sub?: string
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#6b7280]">{label}</p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-[#4a4a4a] mt-1">{sub}</p>}
    </div>
  )
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const conversionRate =
    stats.total_candidates > 0
      ? Math.round((stats.trial_day_count / stats.total_candidates) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total candidatos"
        value={stats.total_candidates}
        icon={<Users size={18} />}
        color="#FFD700"
        sub="Todos los tiempos"
      />
      <StatCard
        label="Formularios completados"
        value={stats.form_completed_count}
        icon={<FileText size={18} />}
        color="#22c55e"
        sub={`de ${stats.total_candidates} candidatos`}
      />
      <StatCard
        label="Días de prueba"
        value={stats.trial_day_count}
        icon={<Star size={18} />}
        color="#f59e0b"
        sub="Este mes"
      />
      <StatCard
        label="Tasa conversión"
        value={`${conversionRate}%`}
        icon={<TrendingUp size={18} />}
        color="#a78bfa"
        sub="Candidato → Prueba"
      />
    </div>
  )
}
