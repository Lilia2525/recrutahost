'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  Briefcase,
  FileText,
  Mail,
  Users,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    title: 'Crea tu primera oferta de empleo',
    description:
      'Antes de nada, necesitas crear la oferta para el puesto que quieres cubrir. Es lo que verán los candidatos.',
    icon: <Briefcase size={20} />,
    details: [
      'Ve a "Ofertas" en el menú de la izquierda',
      'Haz clic en "Nueva oferta"',
      'Rellena: título del puesto, descripción y requisitos',
      'Ejemplo: "Camarero/a de sala - Restaurante La Marina"',
      'Dale a guardar y listo',
    ],
    action: {
      label: 'Ir a Ofertas',
      href: '/ofertas',
    },
  },
  {
    id: 2,
    title: 'Configura las preguntas del formulario',
    description:
      'Estas son las preguntas que verán los candidatos cuando rellenen el formulario. Hazlas simples y directas.',
    icon: <FileText size={20} />,
    details: [
      'Ve a "Configuración" en el menú',
      'Baja hasta "Preguntas del formulario"',
      'Añade preguntas como:',
      '   - "¿Tienes experiencia en hostelería?"',
      '   - "¿Qué disponibilidad horaria tienes?"',
      '   - "¿Por qué te interesa este puesto?"',
      'No pongas más de 4-5 preguntas (si no, no lo rellenan)',
    ],
    action: {
      label: 'Ir a Configuración',
      href: '/configuracion',
    },
  },
  {
    id: 3,
    title: 'Copia el enlace del formulario',
    description:
      'Cada oferta tiene un enlace único. Ese enlace es el que enviarás a los candidatos que te contacten.',
    icon: <Copy size={20} />,
    details: [
      'Ve a "Ofertas" y busca la oferta que creaste',
      'Haz clic en "Copiar enlace del formulario"',
      'El enlace se copia al portapapeles',
      'Ese enlace es algo como: tuapp.vercel.app/aplicar/abc123',
      'Guárdalo, lo necesitarás para el email automático',
    ],
    action: {
      label: 'Ir a Ofertas',
      href: '/ofertas',
    },
  },
  {
    id: 4,
    title: 'Prepara la plantilla de email',
    description:
      'Cuando alguien te contacte por Mil Anuncios, le enviarás (manual o automáticamente) un email con el enlace al formulario.',
    icon: <Mail size={20} />,
    details: [
      'Ve a "Configuración" > "Plantillas de email"',
      'Edita la plantilla "Enlace Formulario"',
      'El email debería decir algo como:',
      '   "Hola {{nombre}}, gracias por tu interés en el puesto de {{puesto}}."',
      '   "Para poder valorar tu candidatura, necesitamos que rellenes este breve formulario: {{enlace}}"',
      '   "Es muy rápido (2 minutos). ¡Gracias!"',
      'Guarda la plantilla',
    ],
    action: {
      label: 'Ir a Configuración',
      href: '/configuracion',
    },
  },
  {
    id: 5,
    title: '¡Ya está! Así funciona el flujo día a día',
    description:
      'A partir de aquí, el proceso es muy sencillo:',
    icon: <Sparkles size={20} />,
    details: [
      '1. Publicas tu anuncio en Mil Anuncios (como siempre)',
      '2. Un candidato te escribe por email interesado',
      '3. Le respondes con el email que tiene el enlace al formulario',
      '4. El candidato rellena el formulario (2 min)',
      '5. ¡Aparece automáticamente aquí en la app!',
      '6. Puedes ver todos sus datos en "Candidatos"',
      '7. Puedes mover candidatos por las etapas del tablero Kanban',
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
              Guía de inicio
            </h1>
            <p className="text-[#6b7280] text-sm">
              Sigue estos pasos para tener todo listo
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
            {completedSteps.length} de {steps.length} pasos completados
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
                              : 'text-[#d1d5db]'
                          }`}
                        >
                          {!detail.startsWith('   ') && (
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
                        {isCompleted ? 'Hecho' : 'Marcar como hecho'}
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
          <h3 className="text-white font-bold text-lg">¡Todo configurado!</h3>
          <p className="text-[#9ca3af] text-sm mt-1 mb-4">
            Ya puedes empezar a recibir candidatos. Cuando alguien rellene el formulario,
            aparecerá automáticamente en tu panel.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#FFC200] transition-colors"
          >
            <Users size={16} />
            Ir al Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
