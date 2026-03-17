'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  Mail,
  Users,
  Sparkles,
  Megaphone,
  Zap,
  ExternalLink,
} from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
  action?: {
    label: string
    href: string
    external?: boolean
  }
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Publica tu anuncio en Mil Anuncios',
    description:
      'Como haces siempre. Publica el anuncio del puesto con tu email y WhatsApp de contacto.',
    icon: <Megaphone size={20} />,
    details: [
      'Entra en Mil Anuncios y crea tu anuncio normalmente',
      'Pon tu email de contacto y tu WhatsApp',
      'Los candidatos empezaran a escribirte',
      'Eso es lo unico que tienes que hacer manualmente',
    ],
  },
  {
    id: 2,
    title: 'Los candidatos te escriben por email',
    description:
      'Cuando alguien se interesa por el puesto, te escribe un email. A partir de aqui, todo es automatico.',
    icon: <Mail size={20} />,
    details: [
      'Un candidato ve tu anuncio y te escribe',
      'Automaticamente recibe un email de respuesta',
      'El email le dice: "Gracias por tu interes, rellena este formulario"',
      'El email incluye el enlace al formulario de Tally',
      'Tu no tienes que hacer nada, es todo automatico',
    ],
  },
  {
    id: 3,
    title: 'El candidato rellena el formulario',
    description:
      'El formulario de Tally es super sencillo. Solo le pide lo basico: nombre, telefono, experiencia y disponibilidad.',
    icon: <FileText size={20} />,
    details: [
      'El candidato hace clic en el enlace del email',
      'Se abre el formulario de Tally (tarda 2 minutos)',
      'Le pregunta:',
      '   - Nombre completo',
      '   - Email y telefono',
      '   - Experiencia en hosteleria',
      '   - Disponibilidad horaria',
      '   - Si puede incorporarse ya',
      '   - Si tiene permiso de trabajo',
      'Le da a enviar y listo',
    ],
  },
  {
    id: 4,
    title: 'Los datos llegan aqui automaticamente',
    description:
      'Make.com detecta que alguien ha rellenado el formulario y envia los datos a esta app.',
    icon: <Zap size={20} />,
    details: [
      'Make.com recibe los datos del formulario automaticamente',
      'Los envia a esta app via webhook',
      'El candidato aparece en tu tablero de "Candidatos"',
      'Puedes ver todos sus datos de un vistazo',
      'No tienes que copiar nada manualmente',
    ],
  },
  {
    id: 5,
    title: 'Gestiona tus candidatos desde aqui',
    description:
      'En la seccion "Candidatos" tienes un tablero Kanban donde puedes mover a cada candidato por las distintas etapas.',
    icon: <Users size={20} />,
    details: [
      'Propuesta Recibida: acaba de llegar',
      'Pendiente de Llamar: tienes que llamarle',
      'Llamada Realizada: ya hablaste con el/ella',
      'Dia de Prueba: le invitas a un dia de prueba',
      'Descartado: no encaja en el puesto',
      'Solo tienes que arrastrar las tarjetas de una columna a otra',
    ],
    action: {
      label: 'Ir a Candidatos',
      href: '/candidatos',
    },
  },
  {
    id: 6,
    title: 'Ya esta! Resumen del flujo',
    description: 'Asi de simple es tu dia a dia con RecrutaHost:',
    icon: <Sparkles size={20} />,
    details: [
      '1. Publicas anuncio en Mil Anuncios (manual, como siempre)',
      '2. Candidato te escribe por email',
      '3. Recibe auto-respuesta con enlace al formulario',
      '4. Rellena el formulario de Tally (2 min)',
      '5. Aparece aqui en la app automaticamente',
      '6. Tu gestionas candidatos desde el tablero',
      '',
      'Tu solo publicas el anuncio. Todo lo demas es automatico.',
    ],
    action: {
      label: 'Ir al Dashboard',
      href: '/dashboard',
    },
  },
]

export default function GuiaPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [expandedStep, setExpandedStep] = useState<number>(1)

  function toggleComplete(stepId: number) {
    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev.filter((s) => s !== stepId) : [...prev, stepId]
    )
  }

  const progress = Math.round((completedSteps.length / steps.length) * 100)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFD700] flex items-center justify-center">
            <Star size={20} className="text-black" fill="black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Como funciona RecrutaHost
            </h1>
            <p className="text-[#6b7280] text-sm">
              Tu asistente de seleccion de personal. Todo automatico.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6b7280]">Tu progreso</span>
            <span className="text-sm font-bold text-[#FFD700]">{progress}%</span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFD700] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#4a4a4a] mt-2">
            {completedSteps.length} de {steps.length} pasos leidos
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id)
          const isExpanded = expandedStep === step.id

          return (
            <div
              key={step.id}
              className={`bg-[#111111] border rounded-xl overflow-hidden transition-all ${
                isCompleted
                  ? 'border-green-500/30'
                  : isExpanded
                  ? 'border-[#FFD700]/30'
                  : 'border-[#1f1f1f]'
              }`}
            >
              {/* Step header */}
              <button
                onClick={() => setExpandedStep(isExpanded ? 0 : step.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleComplete(step.id)
                  }}
                  className="flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={22} className="text-green-400" />
                  ) : (
                    <Circle size={22} className="text-[#3a3a3a]" />
                  )}
                </button>

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[#FFD700]/10 text-[#FFD700]'
                  }`}
                >
                  {step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm ${
                      isCompleted ? 'text-green-400 line-through' : 'text-white'
                    }`}
                  >
                    Paso {step.id}: {step.title}
                  </p>
                  {!isExpanded && (
                    <p className="text-xs text-[#4a4a4a] truncate">{step.description}</p>
                  )}
                </div>

                <ArrowRight
                  size={16}
                  className={`text-[#3a3a3a] transition-transform flex-shrink-0 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Step content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="ml-[54px]">
                    <p className="text-[#9ca3af] text-sm mb-3">{step.description}</p>

                    <div className="bg-[#0a0a0a] rounded-lg p-3 space-y-1.5">
                      {step.details.map((detail, i) => (
                        <p
                          key={i}
                          className={`text-sm ${
                            detail.startsWith('   ')
                              ? 'text-[#9ca3af] ml-4'
                              : detail === ''
                              ? 'h-2'
                              : 'text-[#d1d5db]'
                          }`}
                        >
                          {detail && !detail.startsWith('   ') && (
                            <span className="text-[#FFD700] mr-2">{'>'}</span>
                          )}
                          {detail.trim()}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      {step.action && (
                        <Link
                          href={step.action.href}
                          className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black text-sm font-semibold rounded-lg hover:bg-[#FFC200] transition-colors"
                        >
                          {step.action.label}
                          {step.action.external ? (
                            <ExternalLink size={14} />
                          ) : (
                            <ArrowRight size={14} />
                          )}
                        </Link>
                      )}
                      <button
                        onClick={() => toggleComplete(step.id)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                          isCompleted
                            ? 'border-green-500/30 text-green-400 hover:border-green-500/50'
                            : 'border-[#2a2a2a] text-[#6b7280] hover:text-white hover:border-[#3a3a3a]'
                        }`}
                      >
                        {isCompleted ? 'Leido' : 'Marcar como leido'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Completed message */}
      {completedSteps.length === steps.length && (
        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h3 className="text-white font-bold text-lg">Ya lo tienes claro!</h3>
          <p className="text-[#9ca3af] text-sm mt-1 mb-4">
            Tu solo publicas el anuncio. Los candidatos que rellenen el formulario
            aparecen aqui automaticamente. Facil.
          </p>
          <Link
            href="/candidatos"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#FFC200] transition-colors"
          >
            <Users size={16} />
            Ver Candidatos
          </Link>
        </div>
      )}
    </div>
  )
}
