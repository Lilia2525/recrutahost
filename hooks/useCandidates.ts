'use client'

import { useState, useCallback } from 'react'
import { Candidate } from '@/lib/types'
import toast from 'react-hot-toast'

interface FetchParams {
  stage?: string
  jobOfferId?: string
  search?: string
}

interface UseCandidatesReturn {
  candidates: Candidate[]
  loading: boolean
  fetchCandidates: (params?: FetchParams) => Promise<void>
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<Candidate | null>
  sendForm: (id: string) => Promise<boolean>
  deleteCandidate: (id: string) => Promise<boolean>
}

export function useCandidates(): UseCandidatesReturn {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCandidates = useCallback(async (params: FetchParams = {}) => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (params.stage) query.set('stage', params.stage)
      if (params.jobOfferId) query.set('job_offer_id', params.jobOfferId)
      if (params.search) query.set('search', params.search)

      const res = await fetch(`/api/candidates?${query}`)
      if (!res.ok) throw new Error('Error al cargar candidatos')
      const data = await res.json()
      setCandidates(data)
    } catch (err) {
      toast.error('Error al cargar candidatos')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCandidate = useCallback(async (id: string, data: Partial<Candidate>): Promise<Candidate | null> => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      const updated = await res.json()
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
      return updated
    } catch {
      toast.error('Error al actualizar candidato')
      return null
    }
  }, [])

  const sendForm = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/candidates/${id}/send-form`, { method: 'POST' })
      if (!res.ok) throw new Error('Error al enviar formulario')
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage: 'formulario_enviado' } : c))
      )
      toast.success('Formulario enviado')
      return true
    } catch {
      toast.error('Error al enviar formulario')
      return false
    }
  }, [])

  const deleteCandidate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setCandidates((prev) => prev.filter((c) => c.id !== id))
      toast.success('Candidato eliminado')
      return true
    } catch {
      toast.error('Error al eliminar candidato')
      return false
    }
  }, [])

  return { candidates, loading, fetchCandidates, updateCandidate, sendForm, deleteCandidate }
}
