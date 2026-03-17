'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Building2, Brain, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AIRulesConfig } from '@/lib/types'

type Tab = 'restaurante' | 'ia'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'restaurante', label: 'Restaurante', icon: Building2 },
  { id: 'ia', label: 'Reglas IA', icon: Brain },
]

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('restaurante')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Restaurant profile state
  const [profile, setProfile] = useState({
    restaurant_name: '',
    contact_email: '',
    phone: '',
    address: '',
    description: '',
  })

  // AI rules state
  const [aiRules, setAiRules] = useState<AIRulesConfig>({
    min_score_to_advance: 60,
    auto_discard_below: 30,
    required_keywords: [],
    disqualifying_keywords: [],
    weights: {
      experience: 30,
      availability: 20,
      motivation: 25,
      communication: 25,
    },
  })
  const [newKeyword, setNewKeyword] = useState({ required: '', disqualifying: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile from user metadata
    setProfile({
      restaurant_name: user.user_metadata?.restaurant_name ?? '',
      contact_email: user.email ?? '',
      phone: user.user_metadata?.phone ?? '',
      address: user.user_metadata?.address ?? '',
      description: user.user_metadata?.description ?? '',
    })

    // Load AI rules
    const { data: rules } = await supabase
      .from('ai_rules_config')
      .select('*')
      .single()
    if (rules) setAiRules(rules)
  }

  async function saveProfile() {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          restaurant_name: profile.restaurant_name,
          phone: profile.phone,
          address: profile.address,
          description: profile.description,
        },
      })
      if (error) throw error
      toast.success('Perfil guardado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function saveAIRules() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('ai_rules_config')
        .upsert(aiRules)
      if (error) throw error
      toast.success('Reglas guardadas')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Configuración</h2>
        <p className="text-sm text-[#6b7280] mt-0.5">Ajusta tu perfil, plantillas y reglas de IA</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111111] border border-[#1f1f1f] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === id
                ? 'bg-[#FFD700]/15 text-[#FFD700]'
                : 'text-[#6b7280] hover:text-white'
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Restaurante */}
      {activeTab === 'restaurante' && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Perfil del Restaurante</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">Nombre del restaurante</label>
              <input
                value={profile.restaurant_name}
                onChange={(e) => setProfile({ ...profile, restaurant_name: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">Email de contacto</label>
              <input
                value={profile.contact_email}
                disabled
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#6b7280] text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">Teléfono</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">Dirección</label>
              <input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#6b7280] mb-1.5">Descripción</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FFD700]/50 resize-none"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black text-sm font-semibold rounded-lg hover:bg-[#FFC200] transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {/* AI Rules */}
      {activeTab === 'ia' && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
          <h3 className="text-white font-semibold">Reglas de Inteligencia Artificial</h3>

          {/* Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">
                Puntuación mínima para avanzar ({aiRules.min_score_to_advance})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={aiRules.min_score_to_advance}
                onChange={(e) =>
                  setAiRules({ ...aiRules, min_score_to_advance: Number(e.target.value) })
                }
                className="w-full accent-[#FFD700]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6b7280] mb-1.5">
                Descarte automático por debajo de ({aiRules.auto_discard_below})
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={aiRules.auto_discard_below}
                onChange={(e) =>
                  setAiRules({ ...aiRules, auto_discard_below: Number(e.target.value) })
                }
                className="w-full accent-[#FFD700]"
              />
            </div>
          </div>

          {/* Weights */}
          <div>
            <h4 className="text-sm text-white font-medium mb-3">Pesos de evaluación (total: 100%)</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiRules.weights ?? {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-[#6b7280] mb-1 capitalize">
                    {key} ({value}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setAiRules({
                        ...aiRules,
                        weights: { ...aiRules.weights, [key]: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#FFD700]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm text-white font-medium mb-2">Palabras clave positivas</h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(aiRules.required_keywords ?? []).map((kw, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full"
                  >
                    {kw}
                    <button
                      onClick={() =>
                        setAiRules({
                          ...aiRules,
                          required_keywords: (aiRules.required_keywords ?? []).filter((_, j) => j !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newKeyword.required}
                  onChange={(e) => setNewKeyword({ ...newKeyword, required: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyword.required.trim()) {
                      setAiRules({
                        ...aiRules,
                        required_keywords: [...(aiRules.required_keywords ?? []), newKeyword.required.trim()],
                      })
                      setNewKeyword({ ...newKeyword, required: '' })
                    }
                  }}
                  placeholder="Añadir..."
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm text-white font-medium mb-2">Palabras clave negativas</h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(aiRules.disqualifying_keywords ?? []).map((kw, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full"
                  >
                    {kw}
                    <button
                      onClick={() =>
                        setAiRules({
                          ...aiRules,
                          disqualifying_keywords: (aiRules.disqualifying_keywords ?? []).filter((_, j) => j !== i),
                        })
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newKeyword.disqualifying}
                  onChange={(e) => setNewKeyword({ ...newKeyword, disqualifying: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newKeyword.disqualifying.trim()) {
                      setAiRules({
                        ...aiRules,
                        disqualifying_keywords: [
                          ...(aiRules.disqualifying_keywords ?? []),
                          newKeyword.disqualifying.trim(),
                        ],
                      })
                      setNewKeyword({ ...newKeyword, disqualifying: '' })
                    }
                  }}
                  placeholder="Añadir..."
                  className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveAIRules}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black text-sm font-semibold rounded-lg hover:bg-[#FFC200] transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar reglas'}
          </button>
        </div>
      )}
    </div>
  )
}
