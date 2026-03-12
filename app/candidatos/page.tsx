'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CandidateDetail } from '@/components/candidates/CandidateDetail'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Candidate, CandidateStage, JobOffer } from '@/lib/types'

export default function CandidatosPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedOffer, setSelectedOffer] = useState<string>('all')
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [offersRes, candidatesRes] = await Promise.all([
      supabase.from('job_offers').select('id, title, status').order('created_at', { ascending: false }),
      supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (offersRes.data) setOffers(offersRes.data as JobOffer[])
    if (candidatesRes.data) setCandidates(candidatesRes.data as Candidate[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleStageChange(candidateId: string, newStage: CandidateStage) {
    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    )

    const { error } = await supabase
      .from('candidates')
      .update({ stage: newStage })
      .eq('id', candidateId)

    if (error) {
      toast.error('Error al mover candidato')
      fetchData()
    }
  }

  function handleUpdated(updated: Candidate) {
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setSelectedCandidate(updated)
  }

  function handleDeleted(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = candidates.filter((c) => {
    const matchesOffer = selectedOffer === 'all' || c.job_offer_id === selectedOffer
    const matchesSearch =
      !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    return matchesOffer && matchesSearch
  })

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-[#1f1f1f] flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar candidato…"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4a4a4a] focus:outline-none focus:border-[#FFD700]/50"
          />
        </div>

        <select
          value={selectedOffer}
          onChange={(e) => setSelectedOffer(e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD700]/50"
        >
          <option value="all">Todas las ofertas</option>
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>

        <span className="text-xs text-[#4a4a4a] ml-auto">{filtered.length} candidatos</span>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden p-4">
        <KanbanBoard
          candidates={filtered}
          loading={loading}
          onCardClick={setSelectedCandidate}
          onStageChange={handleStageChange}
        />
      </div>

      {/* Detail panel */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
