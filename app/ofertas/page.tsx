'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ExternalLink, Copy, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase'
import { buildFormUrl, formatDate } from '@/lib/utils'
import { POSITION_TYPE_LABELS } from '@/lib/constants'
import toast from 'react-hot-toast'
import type { JobOffer, PositionType } from '@/lib/types'

const positionOptions = Object.entries(POSITION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export default function OfertasPage() {
  const [offers, setOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    position_type: 'otro' as PositionType,
    description: '',
    requirements: '',
    location: '',
  })
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setOffers(data as JobOffer[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  async function handleCreate() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('job_offers')
      .insert({ ...form, user_id: user!.id, status: 'active' })
      .select()
      .single()

    setSaving(false)
    if (error) {
      toast.error('Error al crear oferta')
      return
    }
    setOffers((prev) => [data as JobOffer, ...prev])
    setShowModal(false)
    setForm({ title: '', position_type: 'otro', description: '', requirements: '', location: '' })
    toast.success('Oferta creada')
  }

  async function toggleStatus(offer: JobOffer) {
    const newStatus = offer.status === 'active' ? 'closed' : 'active'
    const { error } = await supabase
      .from('job_offers')
      .update({ status: newStatus })
      .eq('id', offer.id)
    if (!error) {
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: newStatus } : o))
      )
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const { error } = await supabase.from('job_offers').delete().eq('id', deleteId)
    if (!error) {
      setOffers((prev) => prev.filter((o) => o.id !== deleteId))
      toast.success('Oferta eliminada')
    }
    setDeleteId(null)
  }

  function copyFormLink(id: string) {
    const url = buildFormUrl(id)
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Ofertas de trabajo</h2>
          <p className="text-[#6b7280] text-sm mt-0.5">{offers.length} ofertas creadas</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Nueva oferta
        </Button>
      </div>

      {loading ? (
        <p className="text-[#6b7280] text-sm">Cargando…</p>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-[#4a4a4a]">
          <p className="text-sm">Aún no tienes ofertas. Crea la primera.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const formUrl = buildFormUrl(offer.id)
            return (
              <div
                key={offer.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">{offer.title}</h3>
                    <Badge
                      color={offer.status === 'active' ? '#22c55e' : '#6b7280'}
                    >
                      {offer.status === 'active' ? 'Activa' : 'Cerrada'}
                    </Badge>
                  </div>
                  {offer.location && (
                    <p className="text-xs text-[#6b7280] mb-2">{offer.location}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#4a4a4a] font-mono truncate max-w-xs">
                      {formUrl}
                    </span>
                    <button
                      onClick={() => copyFormLink(offer.id)}
                      className="text-[#6b7280] hover:text-[#FFD700] transition-colors flex-shrink-0"
                    >
                      <Copy size={13} />
                    </button>
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6b7280] hover:text-[#FFD700] transition-colors flex-shrink-0"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-xs text-[#4a4a4a] mt-2">
                    Creada {formatDate(offer.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(offer)}
                    className="text-[#6b7280] hover:text-white transition-colors"
                    title={offer.status === 'active' ? 'Cerrar oferta' : 'Reabrir oferta'}
                  >
                    {offer.status === 'active' ? (
                      <ToggleRight size={20} className="text-[#22c55e]" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(offer.id)}
                    className="text-[#6b7280] hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva oferta de trabajo"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Título del puesto"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Camarero/a de sala"
            required
          />
          <Select
            label="Tipo de puesto"
            value={form.position_type}
            onChange={(e) => setForm((f) => ({ ...f, position_type: e.target.value as PositionType }))}
            options={positionOptions}
          />
          <Input
            label="Ubicación"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="Madrid, España"
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe el puesto…"
            rows={3}
          />
          <Textarea
            label="Requisitos"
            value={form.requirements}
            onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
            placeholder="Experiencia mínima, idiomas, etc."
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} loading={saving} disabled={!form.title}>
            Crear oferta
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar oferta"
        message="¿Seguro que quieres eliminar esta oferta? Se eliminarán también los candidatos asociados."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
