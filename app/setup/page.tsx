'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Star, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface SetupStep {
  id: string
  title: string
  details: string[]
  copyable?: string
}

const sections: { title: string; steps: SetupStep[] }[] = [
  {
    title: '1. Crear Supabase (base de datos)',
    steps: [
      {
        id: 'sb1',
        title: 'Crear cuenta en supabase.com con su email',
        details: ['Ir a supabase.com > Sign Up', 'Usar su email personal o de empresa'],
      },
      {
        id: 'sb2',
        title: 'Crear nuevo proyecto',
        details: [
          'Nombre: RecrutaHost',
          'Password: generar una segura y guardarla',
          'Region: West EU (Paris)',
          'Esperar 2 min a que se cree',
        ],
      },
      {
        id: 'sb3',
        title: 'Ejecutar la migracion SQL',
        details: [
          'Ir a SQL Editor en Supabase',
          'Copiar TODO el contenido de supabase/migrations/001_initial_schema.sql',
          'Pegarlo en el editor y ejecutar (Run)',
          'Verificar que no hay errores',
        ],
      },
      {
        id: 'sb4',
        title: 'Crear usuario para la alumna',
        details: [
          'Ir a Authentication > Users',
          'Click "Add User" > "Create new user"',
          'Email: su email real',
          'Password: una que ella recuerde',
          'Marcar "Auto confirm user"',
          'IMPORTANTE: copiar el UUID del usuario creado (lo necesitas para Make)',
        ],
      },
      {
        id: 'sb5',
        title: 'Copiar las claves del proyecto',
        details: [
          'Ir a Settings > API',
          'Copiar: Project URL (NEXT_PUBLIC_SUPABASE_URL)',
          'Copiar: anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)',
          'Copiar: service_role key (SUPABASE_SERVICE_ROLE_KEY)',
        ],
      },
    ],
  },
  {
    title: '2. Configurar Vercel (despliegue)',
    steps: [
      {
        id: 'vc1',
        title: 'Crear cuenta Vercel con su email',
        details: ['Ir a vercel.com > Sign Up', 'Puede usar GitHub o email'],
      },
      {
        id: 'vc2',
        title: 'Desplegar el proyecto',
        details: [
          'Abrir terminal en la carpeta del proyecto',
          'Ejecutar: npx vercel --yes',
          'Se linkea a su cuenta automaticamente',
          'Esperar a que termine el build',
        ],
      },
      {
        id: 'vc3',
        title: 'Configurar variables de entorno en Vercel',
        details: [
          'npx vercel env add NEXT_PUBLIC_SUPABASE_URL',
          'npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY',
          'npx vercel env add SUPABASE_SERVICE_ROLE_KEY',
          'npx vercel env add NEXT_PUBLIC_APP_URL (la URL de Vercel)',
          'Redesplegar: npx vercel --prod',
        ],
      },
    ],
  },
  {
    title: '3. Crear formulario en Tally',
    steps: [
      {
        id: 'tl1',
        title: 'Crear cuenta en tally.so con su email',
        details: ['Ir a tally.so > Sign Up', 'Es gratis'],
      },
      {
        id: 'tl2',
        title: 'Crear el formulario de candidatura',
        details: [
          'Nuevo formulario > Titulo: "Formulario de candidatura"',
          'Campos obligatorios:',
          '  - Nombre completo (texto corto)',
          '  - Email (email)',
          '  - Telefono (telefono)',
          '  - Experiencia en hosteleria (texto largo)',
          '  - Disponibilidad horaria (seleccion: Mananas/Tardes/Noches/Completa)',
          '  - Incorporacion inmediata (Si/No)',
          '  - Permiso de trabajo en Espana (Si/No)',
          '  - Transporte (seleccion: Coche/Moto/Transporte publico/A pie)',
          'Pagina final: "Gracias! Hemos recibido tu candidatura."',
          'Publicar el formulario',
        ],
      },
    ],
  },
  {
    title: '4. Conectar Make.com (automatizaciones)',
    steps: [
      {
        id: 'mk1',
        title: 'Crear cuenta en make.com con su email (si no la tiene)',
        details: ['Ir a make.com > Sign Up', 'Plan gratuito funciona'],
      },
      {
        id: 'mk2',
        title: 'AUTO 1: Email recibido > Auto-respuesta con formulario',
        details: [
          'Crear nuevo escenario',
          'Trigger: Email > Watch Emails (conectar su cuenta de email)',
          'Filtro: solo emails nuevos',
          'Accion: Email > Send Email',
          '  Asunto: "Gracias por tu interes - Siguiente paso"',
          '  Cuerpo: "Hola, gracias por contactarnos. Para poder valorar tu candidatura, rellena este breve formulario: [LINK DE TALLY]. Solo tarda 2 minutos."',
          'Activar el escenario',
        ],
      },
      {
        id: 'mk3',
        title: 'AUTO 2: Tally completado > Enviar datos a RecrutaHost',
        details: [
          'Crear nuevo escenario',
          'Trigger: Tally > Watch Responses',
          'Accion: HTTP > Make a Request',
          '  URL: https://TU-APP.vercel.app/api/webhooks/tally',
          '  Method: POST',
          '  Content-Type: application/json',
          '  Body (JSON):',
        ],
        copyable: JSON.stringify(
          {
            nombre: '{{nombre}}',
            email: '{{email}}',
            telefono: '{{telefono}}',
            experiencia: '{{experiencia}}',
            disponibilidad: '{{disponibilidad}}',
            incorporacion: '{{incorporacion}}',
            permiso_trabajo: '{{permiso_trabajo}}',
            transporte: '{{transporte}}',
            source: 'milanuncios',
            user_id: 'PEGAR-UUID-DEL-USUARIO-DE-SUPABASE',
          },
          null,
          2
        ),
      },
      {
        id: 'mk4',
        title: 'Probar que funciona',
        details: [
          'Rellenar el formulario de Tally con datos de prueba',
          'Verificar que Make se ejecuta (aparece en verde)',
          'Verificar que el candidato aparece en la app',
          'Si funciona: borrar el candidato de prueba',
        ],
      },
    ],
  },
  {
    title: '5. Quitar tu proyecto de tu Vercel',
    steps: [
      {
        id: 'cl1',
        title: 'Eliminar proyecto de tu cuenta Vercel',
        details: [
          'Ir a vercel.com con TU cuenta',
          'Buscar el proyecto "recrutahost"',
          'Settings > General > Delete Project',
          'Confirmar eliminacion',
        ],
      },
    ],
  },
]

export default function SetupPage() {
  const [done, setDone] = useState<string[]>([])

  function toggle(id: string) {
    setDone((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  const totalSteps = sections.reduce((acc, s) => acc + s.steps.length, 0)
  const progress = Math.round((done.length / totalSteps) * 100)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#FFD700] flex items-center justify-center">
          <Star size={20} className="text-black" fill="black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Setup con AnyDesk</h1>
          <p className="text-[#6b7280] text-sm">
            Checklist para configurar todo en el ordenador de tu alumna
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6b7280]">Progreso</span>
          <span className="text-sm font-bold text-[#FFD700]">{progress}%</span>
        </div>
        <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD700] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#4a4a4a] mt-2">
          {done.length} de {totalSteps} pasos completados
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
            <div className="space-y-2">
              {section.steps.map((step) => {
                const isCompleted = done.includes(step.id)
                return (
                  <div
                    key={step.id}
                    className={`bg-[#111111] border rounded-xl p-4 ${
                      isCompleted ? 'border-green-500/30' : 'border-[#1f1f1f]'
                    }`}
                  >
                    <button
                      onClick={() => toggle(step.id)}
                      className="flex items-center gap-3 w-full text-left"
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-[#3a3a3a] flex-shrink-0" />
                      )}
                      <span
                        className={`font-medium text-sm ${
                          isCompleted ? 'text-green-400 line-through' : 'text-white'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>
                    <div className="ml-8 mt-2 space-y-1">
                      {step.details.map((d, i) => (
                        <p
                          key={i}
                          className={`text-xs ${
                            d.startsWith('  ') ? 'text-[#9ca3af] ml-3' : 'text-[#6b7280]'
                          }`}
                        >
                          {d.trim()}
                        </p>
                      ))}
                      {step.copyable && (
                        <div className="mt-2">
                          <div className="bg-[#0a0a0a] rounded-lg p-3 relative">
                            <pre className="text-xs text-[#9ca3af] overflow-x-auto">
                              {step.copyable}
                            </pre>
                            <button
                              onClick={() => copyToClipboard(step.copyable!)}
                              className="absolute top-2 right-2 text-[#4a4a4a] hover:text-[#FFD700] transition-colors"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {done.length === totalSteps && (
        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg">Todo configurado!</h3>
          <p className="text-[#9ca3af] text-sm mt-1">
            La app esta lista. Los candidatos que rellenen el formulario apareceran automaticamente.
          </p>
        </div>
      )}
    </div>
  )
}
