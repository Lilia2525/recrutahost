import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ChartByStage } from '@/components/dashboard/ChartByStage'
import type { DashboardStats, CandidateHistory } from '@/lib/types'

async function getDashboardData(userId: string) {
  const supabase = await createServerSupabaseClient()

  const [candidatesRes, historyRes] = await Promise.all([
    supabase.from('candidates').select('stage, form_completed_at').eq('user_id', userId),
    supabase
      .from('candidate_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const candidates = candidatesRes.data ?? []
  const history = (historyRes.data ?? []) as CandidateHistory[]

  const stageCount: Record<string, number> = {}
  let formCompleted = 0
  let trialDay = 0

  for (const c of candidates) {
    stageCount[c.stage] = (stageCount[c.stage] ?? 0) + 1
    if (c.form_completed_at) formCompleted++
    if (c.stage === 'dia_prueba') trialDay++
  }

  const stats: DashboardStats = {
    total_candidates: candidates.length,
    form_completed_count: formCompleted,
    trial_day_count: trialDay,
    by_stage: stageCount,
  }

  return { stats, history }
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { stats, history } = await getDashboardData(user.id)

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Candidatos por etapa</h2>
          <ChartByStage data={stats.by_stage} />
        </div>

        {/* Activity feed */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Actividad reciente</h2>
          <ActivityFeed items={history} />
        </div>
      </div>
    </div>
  )
}
